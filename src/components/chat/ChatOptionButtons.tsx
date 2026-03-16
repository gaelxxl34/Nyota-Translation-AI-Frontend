// Chat Option Buttons — renders clickable option cards

import React from "react";
import type { ChatOption } from "../../types/chat";

interface ChatOptionButtonsProps {
  options: ChatOption[];
  onSelect: (value: string) => void;
  disabled?: boolean;
}

const ChatOptionButtons: React.FC<ChatOptionButtonsProps> = ({
  options,
  onSelect,
  disabled,
}) => {
  return (
    <div className="flex flex-col gap-2 ml-0 sm:ml-10 mb-3">
      {options.map((option) => (
        <button
          key={option.id}
          onClick={() => onSelect(option.value)}
          disabled={disabled || option.disabled}
          className="flex items-center gap-2.5 sm:gap-3 w-full text-left px-3 sm:px-4 py-2.5 sm:py-3 bg-white border border-gray-200 rounded-xl hover:border-blue-400 hover:bg-blue-50 active:border-blue-400 active:bg-blue-50 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed group"
        >
          <span className="text-lg">{option.label.split(" ")[0]}</span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-800 group-hover:text-blue-700 transition-colors">
              {option.label.split(" ").slice(1).join(" ")}
            </p>
            {option.description && (
              <p className="text-xs text-gray-500 mt-0.5">{option.description}</p>
            )}
          </div>
          <svg
            className="w-4 h-4 text-gray-300 group-hover:text-blue-400 transition-colors flex-shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      ))}
    </div>
  );
};

export default ChatOptionButtons;
