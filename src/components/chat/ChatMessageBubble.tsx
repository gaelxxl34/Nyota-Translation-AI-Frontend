// Chat Bubble Component — renders a single message in the conversation

import React from "react";
import type { ChatMessage as ChatMessageType } from "../../types/chat";

interface ChatMessageProps {
  message: ChatMessageType;
}

const ChatMessageBubble: React.FC<ChatMessageProps> = ({ message }) => {
  const isBot = message.type === "bot";
  const isUser = message.type === "user";
  const isSystem = message.type === "system";

  if (isSystem) {
    return (
      <div className="flex justify-center my-3">
        <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 text-sm rounded-full border border-blue-100">
          <div className="animate-spin h-3.5 w-3.5 border-2 border-blue-400 border-t-transparent rounded-full" />
          {message.content}
        </div>
      </div>
    );
  }

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-3`}>
      {isBot && (
        <div className="flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-blue-600 to-sky-500 flex items-center justify-center mr-1.5 sm:mr-2 mt-1">
          <span className="text-white text-xs sm:text-sm font-bold">N</span>
        </div>
      )}
      <div
        className={`max-w-[85%] sm:max-w-[80%] px-3 sm:px-4 py-2.5 sm:py-3 rounded-2xl text-sm leading-relaxed ${
          isUser
            ? "bg-blue-600 text-white rounded-br-md"
            : "bg-white text-gray-800 border border-gray-100 shadow-sm rounded-bl-md"
        }`}
      >
        {message.content.split("**").map((part, i) =>
          i % 2 === 1 ? (
            <strong key={i}>{part}</strong>
          ) : (
            <span key={i}>{part}</span>
          )
        )}
      </div>
    </div>
  );
};

export default ChatMessageBubble;
