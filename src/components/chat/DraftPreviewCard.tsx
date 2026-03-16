// DraftPreviewCard — compact inline document preview for the chat flow
// Shows a miniature watermarked preview of the AI-translated document

import React, { useMemo } from "react";
import type { DraftPreview } from "../../types/chat";
import type { GeneralDocumentData, ContentBlock } from "../templates/GeneralDocumentTemplate";

interface DraftPreviewCardProps {
  preview: DraftPreview;
}

// Extract a short text snippet from the first few content blocks
const getSnippet = (data: Record<string, unknown>): string => {
  const pages = data.pages as Array<{ blocks?: ContentBlock[] }> | undefined;
  if (!pages?.length) return "";
  const texts: string[] = [];
  for (const page of pages) {
    if (!page.blocks) continue;
    for (const block of page.blocks) {
      if (block.text && block.type !== "divider") {
        texts.push(block.text);
      }
      if (texts.length >= 3) break;
    }
    if (texts.length >= 3) break;
  }
  const joined = texts.join(" · ");
  return joined.length > 120 ? joined.slice(0, 117) + "…" : joined;
};

const LANG_LABELS: Record<string, string> = {
  fr: "French",
  ar: "Arabic",
  es: "Spanish",
  en: "English",
  auto: "Auto-detected",
};

const DraftPreviewCard: React.FC<DraftPreviewCardProps> = ({ preview }) => {
  const docData = preview.data as GeneralDocumentData;
  const snippet = useMemo(() => getSnippet(preview.data), [preview.data]);

  const pageCount =
    (docData.pages?.length ?? docData.totalPages) || 1;
  const title = docData.documentTitle || "Translated Document";
  const subtitle = docData.documentSubtitle;
  const sourceLabel =
    LANG_LABELS[preview.sourceLanguage] || preview.sourceLanguage;
  const targetLabel =
    LANG_LABELS[preview.targetLanguage] || preview.targetLanguage;

  const academicInfo = docData.academicInfo;

  return (
    <div className="ml-0 sm:mx-4 my-2 max-w-full sm:max-w-sm">
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Mini watermarked page preview */}
        <div className="relative bg-gray-50 px-5 py-4 border-b border-gray-100 overflow-hidden">
          {/* Watermark */}
          <div
            className="absolute inset-0 flex items-center justify-center pointer-events-none select-none"
            aria-hidden="true"
          >
            <span
              className="text-gray-200 font-bold uppercase tracking-widest whitespace-nowrap"
              style={{
                fontSize: "18px",
                transform: "rotate(-25deg)",
                opacity: 0.35,
              }}
            >
              AI DRAFT
            </span>
          </div>
          {/* Document title */}
          <h4
            className="text-sm font-semibold text-gray-800 leading-snug relative z-10 truncate"
            title={title}
          >
            {title}
          </h4>
          {subtitle && (
            <p className="text-xs text-gray-500 mt-0.5 truncate relative z-10">
              {subtitle}
            </p>
          )}
          {/* Snippet */}
          {snippet && (
            <p className="text-[11px] text-gray-400 mt-2 leading-relaxed relative z-10 line-clamp-2">
              {snippet}
            </p>
          )}
        </div>

        {/* Info footer */}
        <div className="px-4 py-3 space-y-1.5">
          {/* Language badge */}
          <div className="flex items-center gap-1.5 text-xs text-gray-600">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full font-medium">
              {sourceLabel} → {targetLabel}
            </span>
            <span className="text-gray-400">·</span>
            <span className="text-gray-500">
              {pageCount} {pageCount === 1 ? "page" : "pages"}
            </span>
          </div>

          {/* Academic info */}
          {academicInfo &&
            (academicInfo.studentName || academicInfo.institution) && (
              <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-[11px] text-gray-500">
                {academicInfo.studentName && (
                  <span>
                    <strong className="text-gray-600">Student:</strong>{" "}
                    {academicInfo.studentName}
                  </span>
                )}
                {academicInfo.institution && (
                  <span>
                    <strong className="text-gray-600">School:</strong>{" "}
                    {academicInfo.institution}
                  </span>
                )}
              </div>
            )}

          {/* Draft disclaimer */}
          <p className="text-[10px] text-amber-600 flex items-center gap-1">
            <svg
              className="w-3 h-3 flex-shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            AI-generated draft preview
          </p>
        </div>
      </div>
    </div>
  );
};

export default DraftPreviewCard;
