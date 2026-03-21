"use client";

import { ChatInterface } from "@/components/chat/chat-interface";
import { GenerativeUIViewer } from "@/components/chat/generative-ui-viewer";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";

export default function ChatPage() {
  return (
    <ResizablePanelGroup orientation="horizontal">
      <ResizablePanel defaultSize="50%">
        <ChatInterface />
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize="50%">
        <GenerativeUIViewer />
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
