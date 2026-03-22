"use client";

import { ChatInterface } from "@/components/chat/chat-interface";
import { GenerativeUIViewer } from "@/components/gen-ui/generative-ui-viewer";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";

export default function ChatPage() {
  return (
    <ResizablePanelGroup className="min-h-0 flex-1" orientation="horizontal">
      <ResizablePanel
        className="flex min-h-0 flex-col overflow-hidden"
        defaultSize="50%"
      >
        <ChatInterface />
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel
        className="flex min-h-0 flex-col overflow-hidden"
        defaultSize="50%"
      >
        <GenerativeUIViewer />
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
