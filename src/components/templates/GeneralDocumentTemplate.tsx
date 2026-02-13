// GeneralDocumentTemplate.tsx - Multi-page General Document Template for NTC
// Renders AI-extracted structured content from any document (PDF)
// Preserves document structure: headings, paragraphs, lists, tables, checkboxes, etc.
// Only titles/headings are editable; body content is read-only display

import React, { useState } from 'react';
import { QRCodeComponent } from '../common';

// ============================================
// TYPE DEFINITIONS
// ============================================

export interface ContentBlock {
  type: 'heading' | 'paragraph' | 'orderedList' | 'unorderedList' | 'table' | 'checkboxList' | 'blockquote' | 'divider' | 'image' | 'link' | 'caption';
  level?: number; // For headings: 1-4
  text?: string; // For paragraph, heading, blockquote, caption
  items?: string[]; // For ordered/unordered lists
  checkboxItems?: Array<{ label: string; checked: boolean }>; // For checkbox lists
  rows?: string[][]; // For tables (array of rows, each row is array of cells)
  headers?: string[]; // For table headers
  url?: string; // For links/images
  linkText?: string; // For links
  bold?: boolean; // Text styling hints
  italic?: boolean;
  highlighted?: boolean; // For highlighted/emphasized text
}

export interface DocumentPage {
  pageNumber: number;
  pageDescription?: string; // AI-generated summary of what this page contains
  blocks: ContentBlock[];
}

export interface GeneralDocumentData {
  // Document metadata
  documentTitle?: string;
  documentSubtitle?: string;
  documentType?: string; // e.g., "Research Form", "Consent Form", "Survey", etc.
  sourceLanguage?: string; // Original language
  targetLanguage?: string; // Translated language
  author?: string;
  organization?: string;
  date?: string;
  
  // Structured content pages
  pages?: DocumentPage[];
  
  // Page organization metadata
  totalPages?: number;
  pageMap?: string; // Overview of page contents, e.g., "Page 1: Title & intro; Page 2: Procedures"
  
  // Form type marker
  formType?: string;
}

interface GeneralDocumentTemplateProps {
  data?: GeneralDocumentData;
  className?: string;
  isEditable?: boolean;
  onDataChange?: (updatedData: GeneralDocumentData) => void;
  documentId?: string;
  /** When true, removes scroll constraints so Puppeteer captures all pages */
  printMode?: boolean;
}

// ============================================
// EDITABLE FIELD COMPONENT
// ============================================
const EditableField: React.FC<{
  value: string;
  onChange?: (value: string) => void;
  className?: string;
  isEditable?: boolean;
  placeholder?: string;
  multiline?: boolean;
}> = ({ value, onChange, className = '', isEditable = false, placeholder = '', multiline = false }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value || '');
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  React.useEffect(() => {
    setEditValue(value || '');
  }, [value]);

  if (!isEditable) {
    return <span className={className}>{value || placeholder}</span>;
  }

  if (isEditing) {
    const handleSave = () => {
      setIsSaving(true);
      if (onChange) {
        onChange(editValue);
      }
      setIsEditing(false);
      setIsSaving(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 1500);
    };

    if (multiline) {
      return (
        <textarea
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={handleSave}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              setEditValue(value || '');
              setIsEditing(false);
            }
          }}
          className={`${className} border-2 border-blue-400 rounded px-1 py-0.5 bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full min-h-[60px] resize-y`}
          autoFocus
          disabled={isSaving}
        />
      );
    }

    return (
      <input
        type="text"
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onBlur={handleSave}
        onKeyDown={(e) => {
          if (e.key === 'Enter') handleSave();
          if (e.key === 'Escape') {
            setEditValue(value || '');
            setIsEditing(false);
          }
        }}
        className={`${className} border-2 border-blue-400 rounded px-1 py-0.5 bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full`}
        autoFocus
        disabled={isSaving}
      />
    );
  }

  return (
    <span
      onClick={() => setIsEditing(true)}
      className={`${className} cursor-pointer hover:bg-yellow-50 hover:outline hover:outline-2 hover:outline-yellow-300 rounded px-0.5 transition-all ${showSuccess ? 'bg-green-50' : ''}`}
      title="Click to edit"
    >
      {editValue || placeholder || '(click to edit)'}
      {showSuccess && <span className="ml-1 text-green-500 text-xs">✓</span>}
    </span>
  );
};

// ============================================
// CONTENT BLOCK RENDERER
// ============================================
const ContentBlockRenderer: React.FC<{
  block: ContentBlock;
  isEditable: boolean;
  onBlockChange?: (updatedBlock: ContentBlock) => void;
}> = ({ block, isEditable, onBlockChange }) => {
  switch (block.type) {
    case 'heading': {
      const level = Math.min(block.level || 1, 4);
      const headingClasses: Record<number, string> = {
        1: 'text-xl font-bold text-gray-900 mt-6 mb-3',
        2: 'text-lg font-bold text-gray-800 mt-5 mb-2',
        3: 'text-base font-semibold text-gray-800 mt-4 mb-2',
        4: 'text-sm font-semibold text-gray-700 mt-3 mb-1',
      };
      const cls = headingClasses[level] || headingClasses[1];
      
      const headingContent = (
        <EditableField
          value={block.text || ''}
          isEditable={isEditable}
          onChange={(val) => onBlockChange?.({ ...block, text: val })}
          className="inline"
        />
      );

      if (level === 1) return <h1 className={cls}>{headingContent}</h1>;
      if (level === 2) return <h2 className={cls}>{headingContent}</h2>;
      if (level === 3) return <h3 className={cls}>{headingContent}</h3>;
      return <h4 className={cls}>{headingContent}</h4>;
    }

    case 'paragraph':
      return (
        <p className={`text-sm text-gray-700 leading-relaxed mb-3 ${block.bold ? 'font-bold' : ''} ${block.italic ? 'italic' : ''} ${block.highlighted ? 'bg-yellow-100 px-1 py-0.5 rounded' : ''}`}>
          {block.text || ''}
        </p>
      );

    case 'orderedList':
      return (
        <ol className="list-decimal list-outside ml-6 mb-3 space-y-1">
          {(block.items || []).map((item, i) => (
            <li key={i} className="text-sm text-gray-700 leading-relaxed pl-1">
              {item}
            </li>
          ))}
        </ol>
      );

    case 'unorderedList':
      return (
        <ul className="list-disc list-outside ml-6 mb-3 space-y-1">
          {(block.items || []).map((item, i) => (
            <li key={i} className="text-sm text-gray-700 leading-relaxed pl-1">
              {item}
            </li>
          ))}
        </ul>
      );

    case 'checkboxList':
      return (
        <div className="mb-3 space-y-1.5 ml-2">
          {(block.checkboxItems || []).map((item, i) => (
            <div key={i} className="flex items-start gap-2">
              <div className={`w-4 h-4 mt-0.5 border-2 rounded flex-shrink-0 flex items-center justify-center ${item.checked ? 'border-blue-500 bg-blue-500' : 'border-gray-400'}`}>
                {item.checked && (
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
              <span className="text-sm text-gray-700 leading-relaxed">{item.label}</span>
            </div>
          ))}
        </div>
      );

    case 'table':
      return (
        <div className="mb-3 overflow-x-auto">
          <table className="min-w-full border border-gray-300 text-sm">
            {block.headers && block.headers.length > 0 && (
              <thead>
                <tr className="bg-gray-100">
                  {block.headers.map((header, i) => (
                    <th key={i} className="border border-gray-300 px-3 py-1.5 text-left font-semibold text-gray-800">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
            )}
            <tbody>
              {(block.rows || []).map((row, ri) => (
                <tr key={ri} className={ri % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  {row.map((cell, ci) => (
                    <td key={ci} className="border border-gray-300 px-3 py-1.5 text-gray-700">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );

    case 'blockquote':
      return (
        <blockquote className="border-l-2 border-gray-400 pl-4 py-1 mb-3">
          <p className={`text-sm text-gray-700 italic ${block.highlighted ? 'bg-yellow-100 px-1' : ''}`}>
            {block.text || ''}
          </p>
        </blockquote>
      );

    case 'divider':
      return <hr className="my-4 border-gray-300" />;

    case 'link':
      return (
        <p className="text-sm mb-2">
          <a
            href={block.url || '#'}
            className="text-blue-600 underline hover:text-blue-800"
            target="_blank"
            rel="noopener noreferrer"
          >
            {block.linkText || block.url || 'Link'}
          </a>
        </p>
      );

    case 'caption':
      return (
        <p className={`text-xs text-gray-500 italic mb-2 ${block.bold ? 'font-bold' : ''}`}>
          {block.text || ''}
        </p>
      );

    default:
      return (
        <p className="text-sm text-gray-700 mb-2">{block.text || ''}</p>
      );
  }
};

// ============================================
// MAIN TEMPLATE COMPONENT
// ============================================
const GeneralDocumentTemplate: React.FC<GeneralDocumentTemplateProps> = ({
  data = {},
  className = '',
  isEditable = false,
  onDataChange,
  documentId,
  printMode = false,
}) => {
  // Filter out duplicate title: if the first block on the first page is a heading
  // that matches the document title, remove it to avoid showing the title twice
  const rawPages = data.pages || [];
  const pages = rawPages.map((page, pageIdx) => {
    if (pageIdx === 0 && page.blocks.length > 0 && data.documentTitle) {
      const firstBlock = page.blocks[0];
      if (
        firstBlock.type === 'heading' &&
        firstBlock.text &&
        firstBlock.text.trim().toLowerCase() === data.documentTitle.trim().toLowerCase()
      ) {
        return { ...page, blocks: page.blocks.slice(1) };
      }
    }
    return page;
  });

  const [editorText, setEditorText] = useState('');
  const [showEditor, setShowEditor] = useState(false);

  // Handle title change
  const handleTitleChange = (newTitle: string) => {
    if (onDataChange) {
      onDataChange({ ...data, documentTitle: newTitle });
    }
  };

  const handleSubtitleChange = (newSubtitle: string) => {
    if (onDataChange) {
      onDataChange({ ...data, documentSubtitle: newSubtitle });
    }
  };

  // Handle block changes within a page
  const handleBlockChange = (pageIndex: number, blockIndex: number, updatedBlock: ContentBlock) => {
    if (!onDataChange || !data.pages) return;
    const newPages = [...data.pages];
    const newBlocks = [...newPages[pageIndex].blocks];
    newBlocks[blockIndex] = updatedBlock;
    newPages[pageIndex] = { ...newPages[pageIndex], blocks: newBlocks };
    onDataChange({ ...data, pages: newPages });
  };

  // Add editor content as a new paragraph block at the top of the first page
  const handleAddEditorContent = () => {
    if (!editorText.trim() || !onDataChange) return;

    // Split by double newlines to create separate paragraphs
    const paragraphs = editorText.split(/\n\n+/).filter(t => t.trim());
    const newBlocks: ContentBlock[] = paragraphs.map(text => ({
      type: 'paragraph' as const,
      text: text.trim(),
    }));

    const currentPages = data.pages ? [...data.pages] : [];
    if (currentPages.length === 0) {
      // Create a new first page
      currentPages.unshift({ pageNumber: 1, blocks: newBlocks });
    } else {
      // Prepend blocks to the first page
      currentPages[0] = {
        ...currentPages[0],
        blocks: [...newBlocks, ...currentPages[0].blocks],
      };
    }

    onDataChange({ ...data, pages: currentPages });
    setEditorText('');
    setShowEditor(false);
  };


  return (
    <div
      className={`general-document-template flex flex-col items-center ${printMode ? 'bg-white' : 'bg-gray-200 py-6 overflow-y-auto'} ${className}`}
      style={printMode ? undefined : { maxHeight: '85vh' }}
    >
      {/* Text Editor – edit mode only */}
      {isEditable && !printMode && (
        <div className="w-full mb-4" style={{ maxWidth: '210mm' }}>
          {!showEditor ? (
            <button
              onClick={() => setShowEditor(true)}
              className="w-full py-2 px-4 border-2 border-dashed border-gray-400 text-gray-500 text-sm rounded hover:border-blue-400 hover:text-blue-500 transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add content above pages
            </button>
          ) : (
            <div className="bg-white shadow-md p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Add Content</span>
                <button
                  onClick={() => { setShowEditor(false); setEditorText(''); }}
                  className="text-gray-400 hover:text-gray-600 text-sm"
                >
                  ✕
                </button>
              </div>
              <textarea
                value={editorText}
                onChange={(e) => setEditorText(e.target.value)}
                placeholder="Type or paste content here. Separate paragraphs with blank lines..."
                className="w-full h-40 p-3 border border-gray-300 rounded text-sm resize-y focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                style={{ fontFamily: "'Times New Roman', 'Georgia', serif" }}
              />
              <div className="flex justify-end gap-2 mt-2">
                <button
                  onClick={() => { setShowEditor(false); setEditorText(''); }}
                  className="px-3 py-1.5 text-sm text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddEditorContent}
                  disabled={!editorText.trim()}
                  className="px-3 py-1.5 text-sm text-white bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Add to Document
                </button>
              </div>
            </div>
          )}
        </div>
      )}      {/* Document Header Page */}
      <div className={`${printMode ? '' : 'bg-white shadow-md mb-4'} w-full`} style={{ maxWidth: '210mm', minHeight: '60px' }}>
        <div className={`px-10 py-6 ${printMode ? '' : 'border-b border-gray-200'}`}>
          {/* Document type & language tags */}
          <div className="flex items-center gap-2 mb-2 text-xs text-gray-500">
            {data.documentType && (
              <span className="uppercase tracking-wide">{data.documentType}</span>
            )}
            {data.sourceLanguage && data.targetLanguage && (
              <>
                <span>•</span>
                <span>{data.sourceLanguage} → {data.targetLanguage}</span>
              </>
            )}
          </div>
          {/* Title */}
          <h1 className="text-xl font-bold text-gray-900 leading-tight">
            <EditableField
              value={data.documentTitle || 'Translated Document'}
              isEditable={isEditable}
              onChange={handleTitleChange}
              className="text-gray-900"
              placeholder="Document Title"
            />
          </h1>
          {data.documentSubtitle && (
            <p className="text-sm text-gray-600 mt-1">
              <EditableField
                value={data.documentSubtitle}
                isEditable={isEditable}
                onChange={handleSubtitleChange}
                className="text-gray-600"
                placeholder="Subtitle"
              />
            </p>
          )}
          {/* Meta row */}
          {(data.author || data.organization || data.date) && (
            <div className="flex flex-wrap gap-4 mt-3 text-xs text-gray-500">
              {data.organization && <span>{data.organization}</span>}
              {data.author && <span>{data.author}</span>}
              {data.date && <span>{data.date}</span>}
            </div>
          )}
        </div>
      </div>

      {/* Document Pages */}
      {pages.length > 0 ? (
        pages.map((page, pageIndex) => {
          const isLastPage = pageIndex === pages.length - 1;
          return (
          <div
            key={pageIndex}
            className={`${printMode ? '' : 'bg-white shadow-md mb-4'} w-full relative`}
            style={{ maxWidth: '210mm', ...(printMode ? {} : { minHeight: '297mm' }) }}
          >
            {/* Page content */}
            <div className={`px-10 pt-8 ${isLastPage && documentId ? 'pb-44' : 'pb-8'}`} style={{ fontFamily: "'Times New Roman', 'Georgia', serif" }}>
              {page.blocks.map((block, blockIndex) => (
                <ContentBlockRenderer
                  key={blockIndex}
                  block={block}
                  isEditable={isEditable && block.type === 'heading'}
                  onBlockChange={(updatedBlock) => handleBlockChange(pageIndex, blockIndex, updatedBlock)}
                />
              ))}
            </div>

            {/* Verification & Stamp – pinned to bottom of last page */}
            {isLastPage && documentId && (
              <div className="absolute bottom-0 left-0 right-0" style={{ height: '160px' }}>
                {/* Official Stamp - center */}
                <img
                  src="/stamp.png"
                  alt="Official Stamp"
                  style={{
                    width: '120px',
                    height: '120px',
                    objectFit: 'contain',
                    position: 'absolute',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    top: '0',
                    zIndex: 10,
                    opacity: 0.6,
                  }}
                />

                {/* QR Code - bottom left */}
                <div
                  style={{
                    position: 'absolute',
                    bottom: '12px',
                    left: '40px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '2px',
                  }}
                >
                  <QRCodeComponent
                    documentId={documentId}
                    size={55}
                    className="print-visible"
                  />
                  <div
                    style={{
                      fontSize: '7px',
                      color: '#000',
                      textAlign: 'center',
                      fontWeight: 'bold',
                    }}
                  >
                    Verify Document
                  </div>
                </div>

                {/* NTC attribution - bottom right */}
                <div
                  style={{
                    position: 'absolute',
                    bottom: '12px',
                    right: '40px',
                    textAlign: 'right',
                  }}
                >
                  <p style={{ fontSize: '9px', color: '#666', margin: 0 }}>
                    Translated & Certified by
                  </p>
                  <p style={{ fontSize: '10px', color: '#333', fontWeight: 'bold', margin: 0 }}>
                    Nyota Translation Center
                  </p>
                  <p style={{ fontSize: '8px', color: '#999', margin: 0 }}>
                    nyotatranslate.com
                  </p>
                </div>
              </div>
            )}

            {/* Page number footer */}
            {!printMode && !isLastPage && (
              <div className="absolute bottom-0 left-0 right-0 text-center py-3">
                <span className="text-xs text-gray-400">{page.pageNumber}</span>
              </div>
            )}
          </div>
          );
        })
      ) : (
        /* Empty state */
        <div className="bg-white shadow-md w-full px-10 py-16 text-center" style={{ maxWidth: '210mm' }}>
          <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="text-base font-medium text-gray-500 mb-1">No Content Available</h3>
          <p className="text-sm text-gray-400">
            Upload a PDF document to extract and translate its content.
          </p>
        </div>
      )}

      {/* Footer – only in interactive view when no documentId */}
      {!printMode && !documentId && (
        <div className="text-center py-2">
          <p className="text-xs text-gray-400">
            Translated by Nyota Translation Center (NTC)
          </p>
        </div>
      )}
    </div>
  );
};

export default GeneralDocumentTemplate;
