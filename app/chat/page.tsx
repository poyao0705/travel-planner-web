"use client";

import { ChatInterface } from "@/components/chat/chat-interface";
import { GenerativeUIViewer } from "@/components/chat/generative-ui-viewer";

export default function ChatPage() {
  return (
    <div className="fixed inset-0 flex overflow-hidden">
      {/* Left side: Chat interface */}
      <div className="flex w-1/2 flex-col border-r">
        <ChatInterface />
      </div>

      {/* Right side: Generated UI */}
      <div className="flex w-1/2 flex-col flex-1">
        <GenerativeUIViewer />
      </div>
    </div>
  );
}
