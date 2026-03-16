// Chat Container — full chat conversation view with auto-scroll

import React, { useEffect, useRef } from "react";
import ChatMessageBubble from "./ChatMessageBubble";
import ChatOptionButtons from "./ChatOptionButtons";
import ChatFileUpload from "./ChatFileUpload";
import DraftPreviewCard from "./DraftPreviewCard";
import type { ChatMessage, DraftPreview } from "../../types/chat";

interface ChatContainerProps {
  messages: ChatMessage[];
  onOptionSelect: (value: string) => void;
  onFileSelect: (file: File) => void;
  isProcessing: boolean;
  draftPreview?: DraftPreview | null;
}

const ChatContainer: React.FC<ChatContainerProps> = ({
  messages,
  onOptionSelect,
  onFileSelect,
  isProcessing,
  draftPreview,
}) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  return (
    <div className="flex-1 overflow-y-auto px-3 sm:px-4 py-4 sm:py-6 space-y-1">
      {messages.map((message, index) => {
        const isLastMessage = index === messages.length - 1;

        return (
          <React.Fragment key={message.id}>
            <ChatMessageBubble message={message} />

            {/* Render option buttons if this message has options */}
            {message.options && isLastMessage && (
              <ChatOptionButtons
                options={message.options}
                onSelect={onOptionSelect}
                disabled={isProcessing}
              />
            )}

            {/* Render upload zone if this message triggers upload */}
            {message.component === "upload" && isLastMessage && (
              <ChatFileUpload
                onFileSelect={onFileSelect}
                disabled={isProcessing}
              />
            )}

            {/* Render draft preview card */}
            {message.component === "preview" && draftPreview && (
              <DraftPreviewCard preview={draftPreview} />
            )}
          </React.Fragment>
        );
      })}
      <div ref={bottomRef} />
    </div>
  );
};

export default ChatContainer;
