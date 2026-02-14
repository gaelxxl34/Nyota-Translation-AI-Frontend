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
  items?: ListItem[]; // For ordered/unordered lists (AI may return objects with sub-items)
  checkboxItems?: ListItem[]; // For checkbox lists (may be string or {label, checked} objects)
  rows?: string[][]; // For tables (array of rows, each row is array of cells)
  headers?: string[]; // For table headers
  url?: string; // For links/images
  linkText?: string; // For links
  bold?: boolean; // Text styling hints
  italic?: boolean;
  highlighted?: boolean; // For highlighted/emphasized text
}

// Type for nested list items (AI may return objects instead of strings, including embedded content blocks)
type ListItem = string | { text?: string; subItems?: ListItem[]; label?: string; checked?: boolean; type?: string; items?: ListItem[]; checkboxItems?: ListItem[]; [key: string]: unknown };

// Helper to safely convert any value to a displayable string
const safeString = (val: unknown): string => {
  if (val === null || val === undefined) return '';
  if (typeof val === 'string') return val;
  if (typeof val === 'number' || typeof val === 'boolean') return String(val);
  if (typeof val === 'object') {
    const obj = val as Record<string, unknown>;
    if ('text' in obj && typeof obj.text === 'string') return obj.text;
    if ('label' in obj && typeof obj.label === 'string') return obj.label;
    if ('value' in obj && typeof obj.value === 'string') return obj.value;
    try { return JSON.stringify(val); } catch { return '[Object]'; }
  }
  return String(val);
};

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

  const displayContent = editValue || placeholder || '(click to edit)';
  const hasNewlines = typeof displayContent === 'string' && displayContent.includes('\n');

  return (
    <span
      onClick={() => setIsEditing(true)}
      className={`${className} cursor-pointer hover:bg-yellow-50 hover:outline hover:outline-2 hover:outline-yellow-300 rounded px-0.5 transition-all ${showSuccess ? 'bg-green-50' : ''}`}
      title="Click to edit"
    >
      {hasNewlines
        ? displayContent.split('\n').map((line, i, arr) => (
            <React.Fragment key={i}>{line}{i < arr.length - 1 && <br />}</React.Fragment>
          ))
        : displayContent}
      {showSuccess && <span className="ml-1 text-green-500 text-xs">✓</span>}
    </span>
  );
};

// ============================================
// NESTED ITEM RENDERERS
// ============================================

// Helper: renders the sub-items (checkboxItems, subItems, items) of a complex list item
const SubItemsRenderer: React.FC<{ item: ListItem }> = ({ item }) => {
  if (typeof item !== 'object' || item === null) return null;
  const obj = item as Record<string, unknown>;
  const subItems = obj.subItems as ListItem[] | undefined;
  return (
    <>
      {Array.isArray(obj.checkboxItems) && (obj.checkboxItems as unknown[]).length > 0 && (
        <div className="my-1 space-y-1.5 ml-2">
          {(obj.checkboxItems as ListItem[]).map((ci, j) => <NestedCheckboxRenderer key={j} item={ci} />)}
        </div>
      )}
      {Array.isArray(subItems) && subItems.length > 0 && (
        <ul className="list-disc list-outside ml-5 mt-1 space-y-1">
          {subItems.map((sub, j) => (
            <li key={j} className="text-sm leading-relaxed pl-1"><NestedItemRenderer item={sub} /></li>
          ))}
        </ul>
      )}
      {Array.isArray(obj.items) && (obj.items as unknown[]).length > 0 && (
        <ol className="list-decimal list-outside ml-5 mt-1 space-y-1">
          {(obj.items as ListItem[]).map((sub, j) => (
            <li key={j} className="text-sm leading-relaxed pl-1"><NestedItemRenderer item={sub} /></li>
          ))}
        </ol>
      )}
    </>
  );
};

// Helper: check if an object is an embedded content block (has a "type" field like checkboxList, orderedList, etc.)
const isEmbeddedBlock = (obj: unknown): obj is ContentBlock => {
  if (typeof obj !== 'object' || obj === null) return false;
  const o = obj as Record<string, unknown>;
  return typeof o.type === 'string' && ['heading', 'paragraph', 'orderedList', 'unorderedList', 'checkboxList', 'table', 'blockquote', 'divider', 'link', 'caption'].includes(o.type as string);
};

// Forward-declared renderer for embedded blocks inside list items
const EmbeddedBlockRenderer: React.FC<{ block: ContentBlock }> = ({ block }) => {
  switch (block.type) {
    case 'checkboxList':
      return (
        <div className="my-1 space-y-1.5 ml-2">
          {(block.checkboxItems || []).map((item: ListItem, i: number) => (
            <NestedCheckboxRenderer key={i} item={item} />
          ))}
        </div>
      );
    case 'orderedList':
      return (
        <ol className="list-decimal list-outside ml-6 my-1 space-y-1">
          {(block.items || []).map((item: ListItem, i: number) => (
            <li key={i} className="text-sm text-gray-700 leading-relaxed pl-1">
              <NestedItemRenderer item={item} />
            </li>
          ))}
        </ol>
      );
    case 'unorderedList':
      return (
        <ul className="list-disc list-outside ml-6 my-1 space-y-1">
          {(block.items || []).map((item: ListItem, i: number) => (
            <li key={i} className="text-sm text-gray-700 leading-relaxed pl-1">
              <NestedItemRenderer item={item} />
            </li>
          ))}
        </ul>
      );
    case 'paragraph':
      return (
        <p className={`text-sm text-gray-700 leading-relaxed my-1 ${block.bold ? 'font-bold' : ''} ${block.italic ? 'italic' : ''}`}>
          {safeString(block.text)}
        </p>
      );
    case 'heading': {
      const cls = 'text-sm font-semibold text-gray-800 my-1';
      return <p className={cls}>{safeString(block.text)}</p>;
    }
    default:
      return <p className="text-sm text-gray-700 my-1">{safeString(block.text)}</p>;
  }
};

// Renders a single list item that may be a string, nested object, or embedded block
const NestedItemRenderer: React.FC<{ item: ListItem; depth?: number }> = ({ item, depth = 0 }) => {
  if (typeof item === 'string') return <>{item}</>;
  if (typeof item === 'object' && item !== null) {
    // If item is an embedded content block (e.g. checkboxList inside an orderedList), render it properly
    if (isEmbeddedBlock(item)) {
      return <EmbeddedBlockRenderer block={item as unknown as ContentBlock} />;
    }
    const obj = item as Record<string, unknown>;
    const text = obj.text || obj.label ? safeString(obj.text || obj.label) : '';
    const subItems = (obj.subItems as ListItem[] | undefined);
    // If the item has checkboxItems, render them as a checkbox list
    if (Array.isArray(obj.checkboxItems)) {
      return (
        <>
          {text && <span>{text}</span>}
          <div className="my-1 space-y-1.5 ml-2">
            {(obj.checkboxItems as ListItem[]).map((ci: ListItem, i: number) => (
              <NestedCheckboxRenderer key={i} item={ci} />
            ))}
          </div>
        </>
      );
    }
    // If the item has nested items array, render as sub-list
    if (Array.isArray(obj.items)) {
      return (
        <>
          {text && <span>{text}</span>}
          <ol className="list-decimal list-outside ml-5 mt-1 space-y-1">
            {(obj.items as ListItem[]).map((sub: ListItem, i: number) => (
              <li key={i} className="text-sm text-gray-700 leading-relaxed pl-1">
                <NestedItemRenderer item={sub} depth={depth + 1} />
              </li>
            ))}
          </ol>
        </>
      );
    }
    return (
      <>
        {text || safeString(item)}
        {subItems && Array.isArray(subItems) && subItems.length > 0 && (
          <ul className={`list-disc list-outside ml-5 mt-1 space-y-1 ${depth > 0 ? 'text-gray-600' : ''}`}>
            {subItems.map((sub, i) => (
              <li key={i} className="text-sm leading-relaxed pl-1">
                <NestedItemRenderer item={sub} depth={depth + 1} />
              </li>
            ))}
          </ul>
        )}
      </>
    );
  }
  return <>{safeString(item)}</>;
};

// Renders checkbox items, handling nested structures from AI
const NestedCheckboxRenderer: React.FC<{ item: ListItem }> = ({ item }) => {
  if (typeof item === 'string') {
    return (
      <div className="flex items-start gap-2">
        <div className="w-4 h-4 mt-0.5 border-2 rounded flex-shrink-0 border-gray-400" />
        <span className="text-sm text-gray-700 leading-relaxed">{item}</span>
      </div>
    );
  }
  const obj = item as { label?: string; text?: string; checked?: boolean; subItems?: ListItem[] };
  const label = obj.label || obj.text || safeString(item);
  const checked = obj.checked ?? false;
  return (
    <div>
      <div className="flex items-start gap-2">
        <div className={`w-4 h-4 mt-0.5 border-2 rounded flex-shrink-0 flex items-center justify-center ${checked ? 'border-blue-500 bg-blue-500' : 'border-gray-400'}`}>
          {checked && (
            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          )}
        </div>
        <span className="text-sm text-gray-700 leading-relaxed">{label}</span>
      </div>
      {obj.subItems && Array.isArray(obj.subItems) && obj.subItems.length > 0 && (
        <div className="ml-6 mt-1 space-y-1.5">
          {obj.subItems.map((sub, i) => (
            <NestedCheckboxRenderer key={i} item={sub} />
          ))}
        </div>
      )}
    </div>
  );
};

// ============================================
// BLOCK TYPE TOOLBAR (edit mode only)
// Shows conversion options for the current block type
// ============================================
const BlockTypeToolbar: React.FC<{
  block: ContentBlock;
  onBlockChange?: (updatedBlock: ContentBlock) => void;
}> = ({ block, onBlockChange }) => {
  if (!onBlockChange) return null;

  // Convert list items to string array for type conversions
  const getTextItems = (): string[] => {
    if (block.items) return block.items.map(i => typeof i === 'string' ? i : safeString(i));
    if (block.checkboxItems) return block.checkboxItems.map(i => {
      if (typeof i === 'string') return i;
      const obj = i as { label?: string; text?: string };
      return obj.label || obj.text || safeString(i);
    });
    if (block.text) return [block.text];
    return [];
  };

  const convertTo = (targetType: string) => {
    const items = getTextItems();
    switch (targetType) {
      case 'orderedList':
        onBlockChange({ type: 'orderedList', items });
        break;
      case 'unorderedList':
        onBlockChange({ type: 'unorderedList', items });
        break;
      case 'paragraph':
        // Join all items into a single paragraph
        onBlockChange({ type: 'paragraph', text: items.join('\n') });
        break;
      case 'checkboxList':
        onBlockChange({
          type: 'checkboxList',
          checkboxItems: items.map(text => ({ label: text, checked: false })),
        });
        break;
      case 'none':
        // orderedList without numbers (convert to unorderedList with list-none style marker)
        onBlockChange({ type: 'unorderedList', items, highlighted: true }); // use highlighted as "plain" flag
        break;
    }
  };

  const btnClass = (active: boolean) =>
    `px-1.5 py-0.5 text-xs rounded border transition-colors ${
      active
        ? 'bg-blue-100 text-blue-700 border-blue-300 font-semibold'
        : 'bg-white text-gray-500 border-gray-300 hover:bg-gray-100 hover:text-gray-700'
    }`;

  const isOrdered = block.type === 'orderedList';
  const isUnordered = block.type === 'unorderedList' && !block.highlighted;
  const isPlain = block.type === 'unorderedList' && !!block.highlighted;
  const isCheckbox = block.type === 'checkboxList';
  const isParagraph = block.type === 'paragraph';

  return (
    <div className="flex items-center gap-1 mb-1 opacity-0 group-hover:opacity-100 transition-opacity">
      <span className="text-[10px] text-gray-400 mr-1">Format:</span>
      <button className={btnClass(isOrdered)} onClick={() => convertTo('orderedList')} title="Numbered list">1.</button>
      <button className={btnClass(isUnordered)} onClick={() => convertTo('unorderedList')} title="Bullet list">•</button>
      <button className={btnClass(isPlain)} onClick={() => convertTo('none')} title="Plain list (no markers)">—</button>
      <button className={btnClass(isCheckbox)} onClick={() => convertTo('checkboxList')} title="Checkbox list">☐</button>
      <button className={btnClass(isParagraph)} onClick={() => convertTo('paragraph')} title="Plain text">¶</button>
    </div>
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
        <p className={`text-sm text-gray-700 leading-relaxed mb-3 whitespace-pre-line ${block.bold ? 'font-bold' : ''} ${block.italic ? 'italic' : ''} ${block.highlighted ? 'bg-yellow-100 px-1 py-0.5 rounded' : ''}`}>
          <EditableField
            value={safeString(block.text)}
            isEditable={isEditable}
            onChange={(val) => onBlockChange?.({ ...block, text: val })}
            className="inline"
            multiline
          />
        </p>
      );

    case 'orderedList': {
      const olItems = block.items || [];
      const handleOlItemChange = (idx: number, val: string) => {
        const newItems = [...olItems];
        const existing = newItems[idx];
        if (typeof existing === 'object' && existing !== null) {
          newItems[idx] = { ...(existing as Record<string, unknown>), text: val } as unknown as ListItem;
        } else {
          newItems[idx] = val;
        }
        onBlockChange?.({ ...block, items: newItems });
      };
      const handleOlItemDelete = (idx: number) => {
        const newItems = olItems.filter((_, j) => j !== idx);
        onBlockChange?.({ ...block, items: newItems });
      };
      return (
        <div className="group">
          {isEditable && <BlockTypeToolbar block={block} onBlockChange={onBlockChange} />}
          <ol className={block.highlighted ? "list-none ml-0 mb-3 space-y-1" : "list-decimal list-outside ml-6 mb-3 space-y-1"}>
          {olItems.map((item: ListItem, i: number) => {
            if (typeof item === 'object' && item !== null && isEmbeddedBlock(item)) {
              return (
                <li key={i} className="text-sm text-gray-700 leading-relaxed pl-1 list-none -ml-6 relative group/li">
                  <EmbeddedBlockRenderer block={item as unknown as ContentBlock} />
                  {isEditable && (
                    <button onClick={() => handleOlItemDelete(i)} className="absolute -right-1 top-0 w-5 h-5 rounded-full bg-white border border-gray-300 text-gray-400 hover:bg-red-50 hover:text-red-500 hover:border-red-400 flex items-center justify-center opacity-0 group-hover/li:opacity-100 transition-opacity text-xs" title="Remove item">×</button>
                  )}
                </li>
              );
            }
            const isComplex = typeof item === 'object' && item !== null;
            const itemText = isComplex
              ? String((item as Record<string, unknown>).text || (item as Record<string, unknown>).label || safeString(item))
              : (item as string);
            return (
              <li key={i} className="text-sm text-gray-700 leading-relaxed pl-1 relative group/li">
                {isEditable ? (
                  <>
                    <EditableField
                      value={itemText}
                      isEditable={isEditable}
                      onChange={(val) => handleOlItemChange(i, val)}
                      className="inline"
                      multiline
                    />
                    {isComplex && <SubItemsRenderer item={item} />}
                    <button onClick={() => handleOlItemDelete(i)} className="absolute -right-1 top-0 w-5 h-5 rounded-full bg-white border border-gray-300 text-gray-400 hover:bg-red-50 hover:text-red-500 hover:border-red-400 flex items-center justify-center opacity-0 group-hover/li:opacity-100 transition-opacity text-xs" title="Remove item">×</button>
                  </>
                ) : (
                  <NestedItemRenderer item={item} />
                )}
              </li>
            );
          })}
        </ol>
        </div>
      );
    }

    case 'unorderedList': {
      const ulItems = block.items || [];
      const handleUlItemChange = (idx: number, val: string) => {
        const newItems = [...ulItems];
        const existing = newItems[idx];
        if (typeof existing === 'object' && existing !== null) {
          newItems[idx] = { ...(existing as Record<string, unknown>), text: val } as unknown as ListItem;
        } else {
          newItems[idx] = val;
        }
        onBlockChange?.({ ...block, items: newItems });
      };
      const handleUlItemDelete = (idx: number) => {
        const newItems = ulItems.filter((_, j) => j !== idx);
        onBlockChange?.({ ...block, items: newItems });
      };
      return (
        <div className="group">
          {isEditable && <BlockTypeToolbar block={block} onBlockChange={onBlockChange} />}
          <ul className={block.highlighted ? "list-none ml-0 mb-3 space-y-1" : "list-disc list-outside ml-6 mb-3 space-y-1"}>
          {ulItems.map((item: ListItem, i: number) => {
            if (typeof item === 'object' && item !== null && isEmbeddedBlock(item)) {
              return (
                <li key={i} className="text-sm text-gray-700 leading-relaxed pl-1 list-none -ml-6 relative group/li">
                  <EmbeddedBlockRenderer block={item as unknown as ContentBlock} />
                  {isEditable && (
                    <button onClick={() => handleUlItemDelete(i)} className="absolute -right-1 top-0 w-5 h-5 rounded-full bg-white border border-gray-300 text-gray-400 hover:bg-red-50 hover:text-red-500 hover:border-red-400 flex items-center justify-center opacity-0 group-hover/li:opacity-100 transition-opacity text-xs" title="Remove item">×</button>
                  )}
                </li>
              );
            }
            const isComplex = typeof item === 'object' && item !== null;
            const itemText = isComplex
              ? String((item as Record<string, unknown>).text || (item as Record<string, unknown>).label || safeString(item))
              : (item as string);
            return (
              <li key={i} className="text-sm text-gray-700 leading-relaxed pl-1 relative group/li">
                {isEditable ? (
                  <>
                    <EditableField
                      value={itemText}
                      isEditable={isEditable}
                      onChange={(val) => handleUlItemChange(i, val)}
                      className="inline"
                      multiline
                    />
                    {isComplex && <SubItemsRenderer item={item} />}
                    <button onClick={() => handleUlItemDelete(i)} className="absolute -right-1 top-0 w-5 h-5 rounded-full bg-white border border-gray-300 text-gray-400 hover:bg-red-50 hover:text-red-500 hover:border-red-400 flex items-center justify-center opacity-0 group-hover/li:opacity-100 transition-opacity text-xs" title="Remove item">×</button>
                  </>
                ) : (
                  <NestedItemRenderer item={item} />
                )}
              </li>
            );
          })}
        </ul>
        </div>
      );
    }

    case 'checkboxList': {
      const cbItems = block.checkboxItems || [];
      const handleCbLabelChange = (idx: number, val: string) => {
        const newItems = [...cbItems];
        const existing = newItems[idx];
        if (typeof existing === 'object' && existing !== null) {
          newItems[idx] = { ...existing, label: val };
        } else {
          newItems[idx] = { label: val, checked: false };
        }
        onBlockChange?.({ ...block, checkboxItems: newItems });
      };
      const handleCbToggle = (idx: number) => {
        const newItems = [...cbItems];
        const existing = newItems[idx];
        if (typeof existing === 'object' && existing !== null) {
          newItems[idx] = { ...existing, checked: !(existing as { checked?: boolean }).checked };
        } else {
          newItems[idx] = { label: safeString(existing), checked: true };
        }
        onBlockChange?.({ ...block, checkboxItems: newItems });
      };
      const handleCbDelete = (idx: number) => {
        const newItems = cbItems.filter((_, j) => j !== idx);
        onBlockChange?.({ ...block, checkboxItems: newItems });
      };
      return (
        <div className="group">
          {isEditable && <BlockTypeToolbar block={block} onBlockChange={onBlockChange} />}
          <div className="mb-3 space-y-1.5 ml-2">
          {cbItems.map((item: ListItem, i: number) => {
            if (!isEditable) {
              return <NestedCheckboxRenderer key={i} item={item} />;
            }
            const obj = typeof item === 'object' && item !== null ? item as { label?: string; text?: string; checked?: boolean } : { label: String(item), checked: false };
            const label = obj.label || obj.text || safeString(item);
            const checked = obj.checked ?? false;
            return (
              <div key={i} className="flex items-start gap-2 relative group/cb">
                <button
                  type="button"
                  onClick={() => handleCbToggle(i)}
                  className={`w-4 h-4 mt-0.5 border-2 rounded flex-shrink-0 flex items-center justify-center cursor-pointer transition-colors ${checked ? 'border-blue-500 bg-blue-500' : 'border-gray-400 hover:border-blue-400'}`}
                  title="Toggle checkbox"
                >
                  {checked && (
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
                <span className="text-sm text-gray-700 leading-relaxed flex-1">
                  <EditableField
                    value={label}
                    isEditable={true}
                    onChange={(val) => handleCbLabelChange(i, val)}
                    className="inline"
                  />
                </span>
                <button onClick={() => handleCbDelete(i)} className="w-5 h-5 rounded-full bg-white border border-gray-300 text-gray-400 hover:bg-red-50 hover:text-red-500 hover:border-red-400 flex items-center justify-center opacity-0 group-hover/cb:opacity-100 transition-opacity text-xs flex-shrink-0" title="Remove item">×</button>
              </div>
            );
          })}
          </div>
        </div>
      );
    }

    case 'table': {
      const handleHeaderChange = (ci: number, val: string) => {
        const newHeaders = [...(block.headers || [])];
        newHeaders[ci] = val;
        onBlockChange?.({ ...block, headers: newHeaders });
      };
      const handleCellChange = (ri: number, ci: number, val: string) => {
        const newRows = (block.rows || []).map((row, r) =>
          r === ri ? row.map((cell, c) => (c === ci ? val : cell)) : [...row]
        );
        onBlockChange?.({ ...block, rows: newRows });
      };
      const handleRowDelete = (ri: number) => {
        const newRows = (block.rows || []).filter((_, r) => r !== ri);
        onBlockChange?.({ ...block, rows: newRows });
      };
      return (
        <div className="mb-3 overflow-x-auto">
          <table className="min-w-full border border-gray-300 text-sm">
            {block.headers && block.headers.length > 0 && (
              <thead>
                <tr className="bg-gray-100">
                  {block.headers.map((header, i) => (
                    <th key={i} className="border border-gray-300 px-3 py-1.5 text-left font-semibold text-gray-800">
                      {isEditable ? (
                        <EditableField
                          value={safeString(header)}
                          isEditable={true}
                          onChange={(val) => handleHeaderChange(i, val)}
                          className="inline font-semibold"
                        />
                      ) : safeString(header)}
                    </th>
                  ))}
                </tr>
              </thead>
            )}
            <tbody>
              {(block.rows || []).map((row, ri) => (
                <tr key={ri} className={`${ri % 2 === 0 ? 'bg-white' : 'bg-gray-50'} relative group/row`}>
                  {row.map((cell, ci) => (
                    <td key={ci} className="border border-gray-300 px-3 py-1.5 text-gray-700">
                      {isEditable ? (
                        <EditableField
                          value={safeString(cell)}
                          isEditable={true}
                          onChange={(val) => handleCellChange(ri, ci, val)}
                          className="inline"
                        />
                      ) : safeString(cell)}
                    </td>
                  ))}
                  {isEditable && (
                    <td className="border-0 px-1 align-middle">
                      <button onClick={() => handleRowDelete(ri)} className="w-5 h-5 rounded-full bg-white border border-gray-300 text-gray-400 hover:bg-red-50 hover:text-red-500 hover:border-red-400 flex items-center justify-center opacity-0 group-hover/row:opacity-100 transition-opacity text-xs" title="Delete row">×</button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    case 'blockquote':
      return (
        <blockquote className="border-l-2 border-gray-400 pl-4 py-1 mb-3">
          <p className={`text-sm text-gray-700 italic ${block.highlighted ? 'bg-yellow-100 px-1' : ''}`}>
            <EditableField
              value={safeString(block.text)}
              isEditable={isEditable}
              onChange={(val) => onBlockChange?.({ ...block, text: val })}
              className="inline"
              multiline
            />
          </p>
        </blockquote>
      );

    case 'divider':
      return <hr className="my-4 border-gray-300" />;

    case 'caption':
      return (
        <p className={`text-xs text-gray-500 italic mb-2 ${block.bold ? 'font-bold' : ''}`}>
          <EditableField
            value={safeString(block.text)}
            isEditable={isEditable}
            onChange={(val) => onBlockChange?.({ ...block, text: val })}
            className="inline"
          />
        </p>
      );

    case 'link':
      return (
        <p className="text-sm mb-2">
          {isEditable ? (
            <EditableField
              value={block.linkText || block.url || 'Link'}
              isEditable={true}
              onChange={(val) => onBlockChange?.({ ...block, linkText: val })}
              className="inline text-blue-600 underline"
            />
          ) : (
            <a
              href={block.url || '#'}
              className="text-blue-600 underline hover:text-blue-800"
              target="_blank"
              rel="noopener noreferrer"
            >
              {block.linkText || block.url || 'Link'}
            </a>
          )}
        </p>
      );

    default:
      return (
        <p className="text-sm text-gray-700 mb-2">
          <EditableField
            value={safeString(block.text)}
            isEditable={isEditable}
            onChange={(val) => onBlockChange?.({ ...block, text: val })}
            className="inline"
          />
        </p>
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
  const [isExtractingPage, setIsExtractingPage] = useState(false);
  const [extractError, setExtractError] = useState('');

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

  // Upload a screenshot/image and extract content via AI, appending as new pages
  const handleUploadPage = async (file: File) => {
    if (!onDataChange) return;
    setIsExtractingPage(true);
    setExtractError('');

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('targetLanguage', data.targetLanguage?.toLowerCase() || 'english');

      // Get auth token
      const { getAuth } = await import('firebase/auth');
      const auth = getAuth();
      const token = await auth.currentUser?.getIdToken();
      if (!token) throw new Error('Not authenticated');

      // Determine backend URL (same logic as dashboard upload)
      const isProduction = import.meta.env.PROD;
      const envApiUrl = import.meta.env.VITE_API_BASE_URL;
      let apiBase: string;
      if (envApiUrl && envApiUrl !== 'https://your-backend-domain.com') {
        apiBase = envApiUrl;
      } else if (isProduction) {
        apiBase = `${window.location.protocol}//${window.location.hostname}`;
      } else {
        apiBase = 'http://localhost:3001';
      }

      const res = await fetch(`${apiBase}/api/upload/extract-page`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Extraction failed' }));
        throw new Error(err.error || 'Failed to extract page');
      }

      const result = await res.json();
      if (!result.success || !result.pages?.length) {
        throw new Error('No content extracted from image');
      }

      // Append extracted pages after existing pages
      const currentPages = data.pages ? [...data.pages] : [];
      const startPageNum = currentPages.length > 0
        ? Math.max(...currentPages.map(p => p.pageNumber)) + 1
        : 1;

      const newPages: DocumentPage[] = result.pages.map((p: DocumentPage, i: number) => ({
        ...p,
        pageNumber: startPageNum + i,
      }));

      onDataChange({ ...data, pages: [...currentPages, ...newPages] });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to extract page';
      setExtractError(message);
      console.error('Extract page error:', err);
    } finally {
      setIsExtractingPage(false);
    }
  };

  // Delete a specific block from a page
  const handleDeleteBlock = (pageIndex: number, blockIndex: number) => {
    if (!onDataChange || !data.pages) return;
    const newPages = [...data.pages];
    const newBlocks = newPages[pageIndex].blocks.filter((_, i) => i !== blockIndex);
    newPages[pageIndex] = { ...newPages[pageIndex], blocks: newBlocks };
    // If the page is now empty, remove it and renumber
    const filteredPages = newPages.filter(p => p.blocks.length > 0)
      .map((p, i) => ({ ...p, pageNumber: i + 1 }));
    onDataChange({ ...data, pages: filteredPages });
  };

  // Move a page up (swap with previous)
  const handleMovePageUp = (pageIndex: number) => {
    if (!onDataChange || !data.pages || pageIndex <= 0) return;
    const newPages = [...data.pages];
    // Swap pages
    [newPages[pageIndex - 1], newPages[pageIndex]] = [newPages[pageIndex], newPages[pageIndex - 1]];
    // Re-number
    const renumbered = newPages.map((p, i) => ({ ...p, pageNumber: i + 1 }));
    onDataChange({ ...data, pages: renumbered });
  };

  // Move a page down (swap with next)
  const handleMovePageDown = (pageIndex: number) => {
    if (!onDataChange || !data.pages || pageIndex >= data.pages.length - 1) return;
    const newPages = [...data.pages];
    [newPages[pageIndex], newPages[pageIndex + 1]] = [newPages[pageIndex + 1], newPages[pageIndex]];
    const renumbered = newPages.map((p, i) => ({ ...p, pageNumber: i + 1 }));
    onDataChange({ ...data, pages: renumbered });
  };

  // Delete a page
  const handleDeletePage = (pageIndex: number) => {
    if (!onDataChange || !data.pages) return;
    const newPages = data.pages.filter((_, i) => i !== pageIndex)
      .map((p, i) => ({ ...p, pageNumber: i + 1 }));
    onDataChange({ ...data, pages: newPages });
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
          const isFirstPage = pageIndex === 0;
          return (
          <div
            key={pageIndex}
            className={`${printMode ? '' : 'bg-white shadow-md mb-4'} w-full relative`}
            style={{ maxWidth: '210mm', ...(printMode ? {} : { minHeight: '297mm' }) }}
          >
            {/* Page reorder controls – edit mode only */}
            {isEditable && !printMode && pages.length > 1 && (
              <div className="absolute -left-12 top-1/2 -translate-y-1/2 flex flex-col gap-1 z-20">
                <button
                  onClick={() => handleMovePageUp(pageIndex)}
                  disabled={isFirstPage}
                  className={`w-8 h-8 rounded-full flex items-center justify-center shadow border transition-colors ${
                    isFirstPage
                      ? 'bg-gray-100 text-gray-300 border-gray-200 cursor-not-allowed'
                      : 'bg-white text-gray-600 border-gray-300 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-400'
                  }`}
                  title="Move page up"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                  </svg>
                </button>
                <span className="text-[10px] text-gray-400 text-center">{pageIndex + 1}</span>
                <button
                  onClick={() => handleMovePageDown(pageIndex)}
                  disabled={isLastPage}
                  className={`w-8 h-8 rounded-full flex items-center justify-center shadow border transition-colors ${
                    isLastPage
                      ? 'bg-gray-100 text-gray-300 border-gray-200 cursor-not-allowed'
                      : 'bg-white text-gray-600 border-gray-300 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-400'
                  }`}
                  title="Move page down"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <button
                  onClick={() => handleDeletePage(pageIndex)}
                  className="w-8 h-8 rounded-full flex items-center justify-center shadow border border-gray-300 bg-white text-gray-400 hover:bg-red-50 hover:text-red-500 hover:border-red-400 transition-colors mt-1"
                  title="Delete page"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            )}

            {/* Page content */}
            <div className={`px-10 pt-8 ${isLastPage && documentId ? 'pb-44' : 'pb-8'}`} style={{ fontFamily: "'Times New Roman', 'Georgia', serif" }}>
              {page.blocks.map((block, blockIndex) => (
                <div key={blockIndex} className={`relative group ${isEditable && !printMode ? 'hover:bg-red-50/30 rounded transition-colors' : ''}`}>
                  <ContentBlockRenderer
                    block={block}
                    isEditable={isEditable}
                    onBlockChange={(updatedBlock) => handleBlockChange(pageIndex, blockIndex, updatedBlock)}
                  />
                  {/* Delete block button – visible on hover in edit mode */}
                  {isEditable && !printMode && (
                    <button
                      onClick={() => handleDeleteBlock(pageIndex, blockIndex)}
                      className="absolute -right-2 top-0 w-6 h-6 rounded-full bg-white border border-gray-300 text-gray-400 hover:bg-red-50 hover:text-red-500 hover:border-red-400 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm z-10"
                      title="Delete this block"
                    >
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
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

      {/* Add Page from Screenshot – edit mode only, below pages */}
      {isEditable && !printMode && (
        <div className="w-full mt-2 mb-4" style={{ maxWidth: '210mm' }}>
          {isExtractingPage ? (
            <div
              className="w-full py-3 px-4 border-2 border-dashed rounded text-sm flex items-center justify-center gap-2 transition-colors border-blue-400 text-blue-500 bg-blue-50 cursor-wait"
            >
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Extracting content from image…
            </div>
          ) : (
            <label
              className="block w-full py-3 px-4 border-2 border-dashed rounded text-sm text-center transition-colors border-gray-400 text-gray-500 hover:border-green-400 hover:text-green-600 cursor-pointer"
            >
              <input
                type="file"
                accept="image/*,.pdf"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleUploadPage(file);
                  e.target.value = '';
                }}
              />
              <span className="inline-flex items-center justify-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Upload screenshot to add pages below
              </span>
            </label>
          )}
          {extractError && (
            <p className="text-xs text-red-500 mt-1 text-center">{extractError}</p>
          )}
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
