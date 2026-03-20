"use client";

import type { ToolUIPart } from "ai";
import { GlobeIcon, MicIcon } from "lucide-react";
import { useCallback, useState } from "react";
import { toast } from "sonner";
/**
 * @title React AI Chatbot
 * @credit {"name": "Vercel", "url": "https://ai-sdk.dev/elements", "license": {"name": "Apache License 2.0", "url": "https://www.apache.org/licenses/LICENSE-2.0"}}
 * @description React AI chatbot component showcasing a complete chat interface with messages, model selection, and prompt input
 * @opening A full-featured AI chatbot interface combining all the essential components—conversation history with branching message versions, model selector dropdown, prompt input with attachments and tools, streaming responses, and suggestion chips. This demo shows how to wire together Message, Conversation, PromptInput, ModelSelector, Reasoning, and Sources into a cohesive chat experience. Great as a starting point for building your own AI assistant interface.
 * @related [
 *   {"href":"/ai/conversation","title":"React AI Conversation","description":"Chat container with scroll"},
 *   {"href":"/ai/message","title":"React AI Message","description":"Chat message bubbles"},
 *   {"href":"/ai/prompt-input","title":"React AI Prompt Input","description":"Message composition"},
 *   {"href":"/ai/model-selector","title":"React AI Model Selector","description":"LLM model picker"},
 *   {"href":"/ai/reasoning","title":"React AI Reasoning","description":"Thinking process display"},
 *   {"href":"/ai/sources","title":"React AI Sources","description":"Citation display"}
 * ]
 * @questions [
 *   {"id":"chatbot-components","title":"What components does this combine?","answer":"Conversation, Message (with branching), PromptInput (with attachments), ModelSelector, Reasoning, Sources, and Suggestions. It's a comprehensive demo of all chat-related components working together."},
 *   {"id":"chatbot-streaming","title":"How does streaming work?","answer":"The demo simulates streaming by adding words one at a time with delays. In production, you'd use the AI SDK's streaming response and update message content as chunks arrive."},
 *   {"id":"chatbot-branching","title":"What is message branching?","answer":"Users can have multiple versions of a message (like regenerating a response). MessageBranch handles switching between versions with prev/next buttons."},
 *   {"id":"chatbot-customization","title":"How do I customize this?","answer":"Replace the mock data and responses with your actual AI integration. The component structure is modular—swap out ModelSelector providers, add more tools to PromptInput, customize message rendering."}
 * ]
 */
import {
  Attachment,
  AttachmentPreview,
  AttachmentRemove,
  Attachments,
} from "@/components/ai-elements/attachments";
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import {
  Message,
  MessageBranch,
  MessageBranchContent,
  MessageBranchNext,
  MessageBranchPage,
  MessageBranchPrevious,
  MessageBranchSelector,
  MessageContent,
  MessageResponse,
} from "@/components/ai-elements/message";

import {
  PromptInput,
  PromptInputActionAddAttachments,
  PromptInputActionMenu,
  PromptInputActionMenuContent,
  PromptInputActionMenuTrigger,
  PromptInputBody,
  PromptInputButton,
  PromptInputFooter,
  PromptInputHeader,
  type PromptInputMessage,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputTools,
  usePromptInputAttachments,
} from "@/components/ai-elements/prompt-input";
import {
  Reasoning,
  ReasoningContent,
  ReasoningTrigger,
} from "@/components/ai-elements/reasoning";
import {
  Source,
  Sources,
  SourcesContent,
  SourcesTrigger,
} from "@/components/ai-elements/sources";
import { Suggestion, Suggestions } from "@/components/ai-elements/suggestion";

interface MessageType {
  key: string;
  from: "user" | "assistant";
  sources?: { href: string; title: string }[];
  versions: {
    id: string;
    content: string;
  }[];
  reasoning?: {
    content: string;
    duration: number;
  };
  tools?: {
    name: string;
    description: string;
    status: ToolUIPart["state"];
    parameters: Record<string, unknown>;
    result: string | undefined;
    error: string | undefined;
  }[];
}

const initialMessages: MessageType[] = [];

const suggestions = [
  "What are the latest trends in AI?",
  "How does machine learning work?",
  "Explain quantum computing",
  "Best practices for React development",
  "Tell me about TypeScript benefits",
  "How to optimize database queries?",
  "What is the difference between SQL and NoSQL?",
  "Explain cloud computing basics",
];

const PromptInputAttachmentsDisplay = () => {
  const attachments = usePromptInputAttachments();

  if (attachments.files.length === 0) {
    return null;
  }

  return (
    <Attachments variant="inline">
      {attachments.files.map((attachment) => (
        <Attachment
          data={attachment}
          key={attachment.id}
          onRemove={() => attachments.remove(attachment.id)}
        >
          <AttachmentPreview />
          <AttachmentRemove />
        </Attachment>
      ))}
    </Attachments>
  );
};

export function ChatbotDemo() {
  const [text, setText] = useState<string>("");
  const [useWebSearch, setUseWebSearch] = useState<boolean>(false);
  const [useMicrophone, setUseMicrophone] = useState<boolean>(false);
  const [status, setStatus] = useState<
    "submitted" | "streaming" | "ready" | "error"
  >("ready");
  const [messages, setMessages] = useState<MessageType[]>(initialMessages);

  const streamBackendResponse = useCallback(
    async (
      messageId: string,
      payloadMessages: { role: string; content: string }[],
    ) => {
      setStatus("streaming");

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: payloadMessages }),
        });

        if (!res.ok || !res.body) {
          throw new Error("Failed to fetch");
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder("utf-8");
        let currentContent = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunkText = decoder.decode(value, { stream: true });
          currentContent += chunkText;

          setMessages((prev) =>
            prev.map((msg) => {
              if (msg.versions.some((v) => v.id === messageId)) {
                return {
                  ...msg,
                  versions: msg.versions.map((v) =>
                    v.id === messageId ? { ...v, content: currentContent } : v,
                  ),
                };
              }
              return msg;
            }),
          );
        }
      } catch (e) {
        console.error(e);
        toast.error("An error occurred during chat completion.");
      } finally {
        setStatus("ready");
      }
    },
    [],
  );

  const addUserMessage = useCallback(
    (content: string) => {
      const userMessage: MessageType = {
        key: `user-${Date.now()}`,
        from: "user",
        versions: [
          {
            id: `user-${Date.now()}`,
            content,
          },
        ],
      };

      setMessages((prev) => {
        const newMessages = [...prev, userMessage];

        // Prepare messages for the API call
        const payloadMessages = newMessages.map((msg) => ({
          role: msg.from === "user" ? "user" : "assistant",
          content: msg.versions[msg.versions.length - 1].content,
        }));

        const assistantMessageId = `assistant-${Date.now()}`;
        const assistantMessage: MessageType = {
          key: `assistant-${Date.now()}`,
          from: "assistant",
          versions: [
            {
              id: assistantMessageId,
              content: "",
            },
          ],
        };

        const finalMessages = [...newMessages, assistantMessage];

        // Start backend fetch AFTER setting the state to show the message immediately
        setTimeout(
          () => streamBackendResponse(assistantMessageId, payloadMessages),
          0,
        );

        return finalMessages;
      });
    },
    [streamBackendResponse],
  );

  const handleSubmit = (message: PromptInputMessage) => {
    const hasText = Boolean(message.text);
    const hasAttachments = Boolean(message.files?.length);

    if (!(hasText || hasAttachments)) {
      return;
    }

    setStatus("submitted");

    if (message.files?.length) {
      toast.success("Files attached", {
        description: `${message.files.length} file(s) attached to message`,
      });
    }

    addUserMessage(message.text || "Sent with attachments");
    setText("");
  };

  const handleSuggestionClick = (suggestion: string) => {
    setStatus("submitted");
    addUserMessage(suggestion);
  };

  return (
    <div className="fixed inset-0 flex flex-col overflow-hidden">
      <Conversation className="min-h-0 flex-1 border-b">
        <ConversationContent>
          {messages.map(({ versions, ...message }) => (
            <MessageBranch defaultBranch={0} key={message.key}>
              <MessageBranchContent>
                {versions.map((version) => (
                  <Message
                    from={message.from}
                    key={`${message.key}-${version.id}`}
                  >
                    <div>
                      {message.sources?.length && (
                        <Sources>
                          <SourcesTrigger count={message.sources.length} />
                          <SourcesContent>
                            {message.sources.map((source) => (
                              <Source
                                href={source.href}
                                key={source.href}
                                title={source.title}
                              />
                            ))}
                          </SourcesContent>
                        </Sources>
                      )}
                      {message.reasoning && (
                        <Reasoning duration={message.reasoning.duration}>
                          <ReasoningTrigger />
                          <ReasoningContent>
                            {message.reasoning.content}
                          </ReasoningContent>
                        </Reasoning>
                      )}
                      <MessageContent>
                        <MessageResponse>{version.content}</MessageResponse>
                      </MessageContent>
                    </div>
                  </Message>
                ))}
              </MessageBranchContent>
              {versions.length > 1 && (
                <MessageBranchSelector
                  className={message.from === "user" ? "ml-auto" : ""}
                >
                  <MessageBranchPrevious />
                  <MessageBranchPage />
                  <MessageBranchNext />
                </MessageBranchSelector>
              )}
            </MessageBranch>
          ))}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>
      <div className="shrink-0 space-y-4 pt-4">
        <div className="w-full px-4 pb-4">
          <PromptInput globalDrop multiple onSubmit={handleSubmit}>
            <PromptInputHeader>
              <PromptInputAttachmentsDisplay />
            </PromptInputHeader>
            <PromptInputBody>
              <PromptInputTextarea
                onChange={(event) => setText(event.target.value)}
                value={text}
              />
            </PromptInputBody>
            <PromptInputFooter>
              <PromptInputTools>
                <PromptInputActionMenu>
                  <PromptInputActionMenuTrigger />
                  <PromptInputActionMenuContent>
                    <PromptInputActionAddAttachments />
                  </PromptInputActionMenuContent>
                </PromptInputActionMenu>
                <PromptInputButton
                  onClick={() => setUseMicrophone(!useMicrophone)}
                  variant={useMicrophone ? "default" : "ghost"}
                >
                  <MicIcon size={16} />
                  <span className="sr-only">Microphone</span>
                </PromptInputButton>
                <PromptInputButton
                  onClick={() => setUseWebSearch(!useWebSearch)}
                  variant={useWebSearch ? "default" : "ghost"}
                >
                  <GlobeIcon size={16} />
                  <span>Search</span>
                </PromptInputButton>
              </PromptInputTools>
              <PromptInputSubmit
                disabled={!(text.trim() || status) || status === "streaming"}
                status={status}
              />
            </PromptInputFooter>
          </PromptInput>
        </div>
      </div>
    </div>
  );
}

export default ChatbotDemo;
