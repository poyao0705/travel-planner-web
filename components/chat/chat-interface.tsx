"use client";

import type { ToolUIPart, UIMessage } from "ai";
import { DefaultChatTransport } from "ai";
import { GlobeIcon, MicIcon } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { useChat } from "@ai-sdk/react";
import { useSetAtom } from "jotai";
import { z } from "zod";
import { uiDispatcherAtom } from "@/state/actions/uiDispatcherAtom";
import { UIBlockSchema } from "@/types/ui-schema";

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
    duration?: number;
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

const BackendMapDataSchema = z.object({
  center: z.tuple([z.number(), z.number()]),
  zoom: z.number(),
  displayName: z.string().optional(),
  query: z.string().optional(),
});

const BackendUIDataSchema = z
  .object({
    map: BackendMapDataSchema.optional(),
    plan: z.unknown().optional(),
  })
  .refine((data) => data.map !== undefined || data.plan !== undefined, {
    message: "Expected at least one UI payload",
  });

type ChatDataParts = {
  "ui-data": z.infer<typeof BackendUIDataSchema>;
};

type ChatMessage = UIMessage<never, ChatDataParts>;

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

export function ChatInterface() {
  const [text, setText] = useState<string>("");
  const [useWebSearch, setUseWebSearch] = useState<boolean>(false);
  const [useMicrophone, setUseMicrophone] = useState<boolean>(false);
  const dispatchUI = useSetAtom(uiDispatcherAtom);

  const {
    messages: sdkMessages,
    sendMessage,
    status,
  } = useChat<ChatMessage>({
    transport: new DefaultChatTransport({ api: "/api/chat" }),
    dataPartSchemas: {
      "ui-data": BackendUIDataSchema,
    },
    onData: (part) => {
      if (part.type !== "data-ui-data") {
        return;
      }

      if (part.data.map) {
        const uiBlock = UIBlockSchema.safeParse({
          type: "map",
          center: part.data.map.center,
          zoom: part.data.map.zoom,
        });

        if (!uiBlock.success) {
          console.error("Invalid map UI block from backend:", uiBlock.error);
          return;
        }

        dispatchUI(uiBlock.data);
      }

      if (part.data.plan !== undefined) {
        const uiBlock = UIBlockSchema.safeParse({
          type: "plan",
          data: part.data.plan,
        });

        if (!uiBlock.success) {
          console.error("Invalid plan UI block from backend:", uiBlock.error);
          return;
        }

        dispatchUI(uiBlock.data);
      }
    },
    onFinish: ({ message }) => {
      console.log("Finished receiving message from backend:", message);
    },
    onError: (error) => {
      console.error("Error from backend:", error);
    },
  });

  const messages: MessageType[] = useMemo(() => {
    return sdkMessages
      .filter(
        (msg): msg is typeof msg & { role: "user" | "assistant" } =>
          msg.role === "user" || msg.role === "assistant",
      )
      .map((msg) => {
        let textContent = "";
        let reasoning: MessageType["reasoning"] = undefined;
        const sources: MessageType["sources"] = [];

        if (msg.parts) {
          for (const p of msg.parts) {
            if (p.type === "text") {
              textContent += p.text;
            } else if (p.type === "reasoning") {
              reasoning = { content: p.text, duration: undefined };
            } else if (p.type === "source-url") {
              sources.push({ href: p.url, title: p.title || p.url });
            } else if (p.type === "source-document") {
              sources.push({ href: p.filename || p.sourceId, title: p.title });
            }
          }
        }

        return {
          key: msg.id,
          from: msg.role as "user" | "assistant",
          sources: sources.length > 0 ? sources : undefined,
          reasoning,
          versions: [
            {
              id: msg.id,
              content: textContent,
            },
          ],
        };
      });
  }, [sdkMessages]);

  const handleSubmit = (message: PromptInputMessage) => {
    const hasText = Boolean(message.text);
    const hasAttachments = Boolean(message.files?.length);

    if (!(hasText || hasAttachments)) {
      return;
    }

    if (message.files?.length) {
      toast.success("Files attached", {
        description: `${message.files.length} file(s) attached to message`,
      });
    }

    sendMessage({ text: message.text || "Sent with attachments" });
    setText("");
  };

  return (
    <div className="flex h-full min-h-0 w-full flex-col overflow-hidden bg-background">
      <Conversation className="min-h-0 flex-1">
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
      <div className="shrink-0 border-t bg-background px-4 py-4">
        <div className="w-full">
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
