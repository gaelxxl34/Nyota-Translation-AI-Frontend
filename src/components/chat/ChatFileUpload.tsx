// Chat File Upload — inline file upload area within the chat

import React, { useRef, useState } from "react";
import { useTranslation } from "react-i18next";

interface ChatFileUploadProps {
  onFileSelect: (file: File) => void;
  disabled?: boolean;
}

const ACCEPTED_TYPES = [
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/gif",
  "image/webp",
  "application/pdf",
];
const MAX_SIZE_MB = 20;

const ChatFileUpload: React.FC<ChatFileUploadProps> = ({
  onFileSelect,
  disabled,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { t } = useTranslation();

  const validateAndSelect = (file: File) => {
    setError(null);

    if (!ACCEPTED_TYPES.includes(file.type)) {
      setError(t("chat.upload.invalidType"));
      return;
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setError(t("chat.upload.tooLarge", { size: MAX_SIZE_MB }));
      return;
    }

    onFileSelect(file);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) validateAndSelect(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) validateAndSelect(file);
  };

  return (
    <div className="ml-0 sm:ml-10 mb-3">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-xl p-4 sm:p-6 text-center transition-all duration-150 cursor-pointer ${
          dragOver
            ? "border-blue-500 bg-blue-50"
            : "border-gray-200 bg-gray-50 hover:border-blue-400 hover:bg-blue-50/50"
        } ${disabled ? "opacity-50 pointer-events-none" : ""}`}
        onClick={() => inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".png,.jpg,.jpeg,.gif,.webp,.pdf"
          className="hidden"
          onChange={handleChange}
          disabled={disabled}
        />
        <div className="flex flex-col items-center gap-2">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
            <svg
              className="w-6 h-6 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
          <p className="text-sm font-medium text-gray-700">
            {t("chat.upload.dropPrompt")}
          </p>
          <p className="text-xs text-gray-400">
            {t("chat.upload.formats", { size: MAX_SIZE_MB })}
          </p>
        </div>
      </div>
      {error && (
        <p className="text-xs text-red-500 mt-2 ml-1">{error}</p>
      )}
    </div>
  );
};

export default ChatFileUpload;
