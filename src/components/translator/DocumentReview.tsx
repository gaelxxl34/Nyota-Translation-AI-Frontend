// Document Review Component for Translator Dashboard
// Professional layout with Original Document viewer, Edit mode, Data preview, and Revision History

import React, { useState, useMemo, useCallback } from 'react';
import type { DocumentDetail, DocumentRevision } from '../../hooks/useTranslator';
import {
  Form4Template,
  Form6Template,
  StateDiplomaTemplate,
  BachelorDiplomaTemplate,
  CollegeAnnualTranscriptTemplate,
  CollegeAttestationTemplate,
  HighSchoolAttestationTemplate,
  StateExamAttestationTemplate,
  GeneralDocumentTemplate,
} from '../templates';
import {
  transformDataForTemplate,
  transformDataForStateDiploma,
  transformDataForBachelorDiploma,
  transformDataForCollegeTranscript,
  transformDataForCollegeAttestation,
  transformDataForHighSchoolAttestation,
  transformDataForStateExamAttestation,
} from '../../utils/bulletinTransformers';

interface DocumentReviewProps {
  document: DocumentDetail;
  revisions: DocumentRevision[];
  saving: boolean;
  onSave: (translatedData: Record<string, unknown>, reviewNotes: string) => void;
  onApprove: (finalNotes?: string) => void;
  onReject: (reason: string, type: string) => void;
  onRelease: (reason?: string) => void;
  onClaim?: (docId: string) => void;
  onBack: () => void;
}

const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
  pending_review: { bg: 'bg-amber-500/15', text: 'text-amber-400', label: 'Pending Review' },
  in_review: { bg: 'bg-blue-500/15', text: 'text-blue-400', label: 'In Review' },
  ai_completed: { bg: 'bg-purple-500/15', text: 'text-purple-400', label: 'AI Completed' },
  approved: { bg: 'bg-emerald-500/15', text: 'text-emerald-400', label: 'Approved' },
  certified: { bg: 'bg-emerald-500/15', text: 'text-emerald-400', label: 'Certified' },
  rejected: { bg: 'bg-red-500/15', text: 'text-red-400', label: 'Rejected' },
};

type TabId = 'original' | 'edit' | 'data' | 'history';

const DocumentReview: React.FC<DocumentReviewProps> = ({
  document,
  revisions,
  saving,
  onSave,
  onApprove,
  onReject,
  onRelease,
  onClaim,
  onBack,
}) => {
  const [editedData, setEditedData] = useState<Record<string, unknown>>(
    document.translatedData || document.extractedData || {}
  );
  const [reviewNotes, setReviewNotes] = useState(document.reviewNotes || '');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectType, setRejectType] = useState('quality');
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [finalNotes, setFinalNotes] = useState('');
  const [activeTab, setActiveTab] = useState<TabId>('edit');
  const [splitView, setSplitView] = useState(false);

  const isEditable = document.status === 'in_review' || document.status === 'ai_completed';
  const isClaimable = document.status === 'pending_review' && !document.assignedTo;
  const status = statusConfig[document.status] || { bg: 'bg-gray-500/15', text: 'text-gray-400', label: document.status };

  const hasOriginalFile = !!document.originalFileUrl;
  const originalFileType = useMemo(() => {
    const url = document.originalFileUrl || '';
    const fileName = document.originalFileName || '';
    if (fileName.toLowerCase().endsWith('.pdf') || url.includes('.pdf')) return 'pdf';
    return 'image';
  }, [document.originalFileUrl, document.originalFileName]);

  // Handle template data changes (from inline editable fields)
  const handleTemplateDataChange = useCallback((updatedData: Record<string, unknown>) => {
    setEditedData((prev) => ({ ...prev, ...updatedData }));
  }, []);

  // Determine if a known template exists for this formType
  const hasTemplate = useMemo(() => {
    const knownTypes = ['form4', 'form6', 'stateDiploma', 'bachelorDiploma', 'collegeTranscript', 'collegeAttestation', 'highSchoolAttestation', 'stateExamAttestation', 'generalDocument'];
    return knownTypes.includes(document.formType);
  }, [document.formType]);

  // Get transformed data for the specific template
  const getTemplateData = useCallback(() => {
    const data = editedData;
    switch (document.formType) {
      case 'stateDiploma': return transformDataForStateDiploma(data);
      case 'bachelorDiploma': return transformDataForBachelorDiploma(data);
      case 'collegeTranscript': return transformDataForCollegeTranscript(data);
      case 'collegeAttestation': return transformDataForCollegeAttestation(data);
      case 'highSchoolAttestation': return transformDataForHighSchoolAttestation(data);
      case 'stateExamAttestation': return transformDataForStateExamAttestation(data);
      case 'generalDocument': return data;
      case 'form4': return transformDataForTemplate(data);
      case 'form6': default: return transformDataForTemplate(data);
    }
  }, [editedData, document.formType]);

  // Render the appropriate template component
  const renderTemplate = useCallback(() => {
    const templateData = getTemplateData();
    const templateProps = {
      data: templateData as any,
      isEditable: isEditable,
      onDataChange: handleTemplateDataChange as any,
      documentId: document.id,
    };

    switch (document.formType) {
      case 'form4': return <Form4Template {...templateProps} />;
      case 'stateDiploma': return <StateDiplomaTemplate {...templateProps} />;
      case 'bachelorDiploma': return <BachelorDiplomaTemplate {...templateProps} />;
      case 'collegeTranscript': return <CollegeAnnualTranscriptTemplate {...templateProps} />;
      case 'collegeAttestation': return <CollegeAttestationTemplate {...templateProps} />;
      case 'highSchoolAttestation': return <HighSchoolAttestationTemplate {...templateProps} />;
      case 'stateExamAttestation': return <StateExamAttestationTemplate {...templateProps} />;
      case 'generalDocument': return <GeneralDocumentTemplate {...templateProps} watermark={document.status !== 'approved' && document.status !== 'certified'} />;
      case 'form6': default: return <Form6Template {...templateProps} />;
    }
  }, [getTemplateData, isEditable, handleTemplateDataChange, document.id, document.formType, document.status]);

  const handleFieldChange = (key: string, value: unknown) => {
    setEditedData((prev) => {
      const keys = key.split('.');
      if (keys.length === 1) {
        return { ...prev, [key]: value };
      }
      const newData = JSON.parse(JSON.stringify(prev));
      let current = newData;
      for (let i = 0; i < keys.length - 1; i++) {
        const k = keys[i];
        const arrayMatch = k.match(/^(.+)\[(\d+)\]$/);
        if (arrayMatch) {
          current = current[arrayMatch[1]][parseInt(arrayMatch[2])];
        } else {
          if (!current[k] || typeof current[k] !== 'object') current[k] = {};
          current = current[k];
        }
      }
      const lastKey = keys[keys.length - 1];
      const lastArrayMatch = lastKey.match(/^(.+)\[(\d+)\]$/);
      if (lastArrayMatch) {
        current[lastArrayMatch[1]][parseInt(lastArrayMatch[2])] = value;
      } else {
        current[lastKey] = value;
      }
      return newData;
    });
  };

  const handleSave = () => onSave(editedData, reviewNotes);

  const handleApprove = () => {
    onApprove(finalNotes || undefined);
    setShowApproveModal(false);
  };

  const handleReject = () => {
    if (!rejectReason.trim()) return;
    onReject(rejectReason, rejectType);
    setShowRejectModal(false);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    const d = new Date(dateString);
    return isNaN(d.getTime()) ? 'N/A' : d.toLocaleString();
  };

  const tabs: { id: TabId; label: string; icon: React.ReactNode; badge?: number }[] = [
    {
      id: 'original',
      label: 'Original Document',
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      id: 'edit',
      label: 'Edit Translation',
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      ),
    },
    {
      id: 'data',
      label: 'Data View',
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
        </svg>
      ),
    },
    {
      id: 'history',
      label: 'History',
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      badge: revisions.length || undefined,
    },
  ];

  // ── Render Field Editor ──
  const renderFieldEditor = (
    data: Record<string, unknown>,
    prefix = '',
    readOnly = false
  ): React.ReactNode => {
    return Object.entries(data).map(([key, value]) => {
      const fullKey = prefix ? `${prefix}.${key}` : key;
      const label = key
        .replace(/([A-Z])/g, ' $1')
        .replace(/_/g, ' ')
        .replace(/^./, (s) => s.toUpperCase())
        .trim();

      if (value === null || value === undefined) {
        return (
          <div key={fullKey} className="group">
            <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wider">{label}</label>
            <input
              type="text"
              value=""
              onChange={(e) => !readOnly && handleFieldChange(fullKey, e.target.value)}
              disabled={readOnly}
              className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 disabled:opacity-50 transition-all"
              placeholder="Empty"
            />
          </div>
        );
      }

      if (typeof value === 'object' && !Array.isArray(value)) {
        return (
          <div key={fullKey} className="col-span-full">
            <div className="flex items-center gap-2 mb-3 mt-2">
              <div className="h-px flex-1 bg-gray-700/50" />
              <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{label}</h4>
              <div className="h-px flex-1 bg-gray-700/50" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-3 border-l-2 border-gray-200">
              {renderFieldEditor(value as Record<string, unknown>, fullKey, readOnly)}
            </div>
          </div>
        );
      }

      if (Array.isArray(value)) {
        return (
          <div key={fullKey} className="col-span-full">
            <label className="block text-xs font-medium text-gray-500 mb-2 uppercase tracking-wider">{label}</label>
            <div className="space-y-2">
              {value.map((item, index) => (
                <div key={`${fullKey}-${index}`} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                  {typeof item === 'object' && item !== null ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {renderFieldEditor(item as Record<string, unknown>, `${fullKey}[${index}]`, readOnly)}
                    </div>
                  ) : (
                    <input
                      type="text"
                      value={String(item)}
                      onChange={(e) => {
                        if (readOnly) return;
                        const newArr = [...value];
                        newArr[index] = e.target.value;
                        handleFieldChange(fullKey, newArr);
                      }}
                      disabled={readOnly}
                      className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 disabled:opacity-50"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      }

      const strValue = String(value);
      const isLongText = strValue.length > 80;

      return (
        <div key={fullKey} className={isLongText ? 'col-span-full' : ''}>
          <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wider">{label}</label>
          {typeof value === 'boolean' ? (
            <select
              value={value ? 'true' : 'false'}
              onChange={(e) => !readOnly && handleFieldChange(fullKey, e.target.value === 'true')}
              disabled={readOnly}
              className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500/50 disabled:opacity-50"
            >
              <option value="true">Yes</option>
              <option value="false">No</option>
            </select>
          ) : typeof value === 'number' ? (
            <input
              type="number"
              value={value}
              onChange={(e) => !readOnly && handleFieldChange(fullKey, parseFloat(e.target.value) || 0)}
              disabled={readOnly}
              className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500/50 disabled:opacity-50"
            />
          ) : isLongText ? (
            <textarea
              value={strValue}
              onChange={(e) => !readOnly && handleFieldChange(fullKey, e.target.value)}
              rows={3}
              disabled={readOnly}
              className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500/50 resize-y disabled:opacity-50"
            />
          ) : (
            <input
              type="text"
              value={strValue}
              onChange={(e) => !readOnly && handleFieldChange(fullKey, e.target.value)}
              disabled={readOnly}
              className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500/50 disabled:opacity-50"
            />
          )}
        </div>
      );
    });
  };

  // ── Original Document Tab ──
  const renderOriginalDocument = () => (
    <div className="h-full flex flex-col">
      {hasOriginalFile ? (
        <div className="flex-1 flex flex-col min-h-0">
          <div className="flex items-center justify-between px-4 py-2 bg-gray-100 border-b border-gray-200 rounded-t-lg">
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>{document.originalFileName || 'Original Document'}</span>
            </div>
            <a
              href={document.originalFileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              Open in new tab
            </a>
          </div>
          <div className="flex-1 bg-gray-50 rounded-b-lg overflow-auto min-h-[400px]">
            {originalFileType === 'pdf' ? (
              <iframe
                src={document.originalFileUrl}
                title="Original Document"
                className="w-full h-full min-h-[600px] border-0"
              />
            ) : (
              <div className="flex items-center justify-center p-4">
                <img
                  src={document.originalFileUrl}
                  alt="Original Document"
                  className="max-w-full max-h-[700px] object-contain rounded shadow-lg"
                />
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-gray-500">
          <svg className="w-16 h-16 mb-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="text-lg font-medium">No original file available</p>
          <p className="text-sm mt-1">The original document was not uploaded to storage</p>
        </div>
      )}
    </div>
  );

  // ── Edit Translation Tab ──
  const renderEditTranslation = () => (
    <div className="space-y-4">
      {!isEditable && !isClaimable && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 flex items-center gap-2 text-sm text-gray-400">
          <svg className="w-4 h-4 text-gray-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          Editing is disabled &mdash; document is not in an editable state
        </div>
      )}
      {isClaimable && (
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11" />
              </svg>
            </div>
            <div>
              <p className="text-gray-900 font-medium text-sm">Claim to start editing</p>
              <p className="text-blue-400/70 text-xs">This document is available for review</p>
            </div>
          </div>
          {onClaim && (
            <button
              onClick={() => onClaim(document.id)}
              disabled={saving}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-gray-900 text-sm font-medium rounded-lg transition-colors shadow-lg shadow-blue-900/30"
            >
              Claim Document
            </button>
          )}
        </div>
      )}

      {/* Hint banner for editing */}
      {isEditable && hasTemplate && (
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg px-4 py-2 flex items-center gap-2 text-xs text-blue-400">
          <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Click on any highlighted field in the document below to edit it. Press Enter to save or Escape to cancel.
        </div>
      )}

      {/* Render document template with inline editing or fallback to field editor */}
      {hasTemplate ? (
        <div className="bg-gray-50 rounded-lg p-2 sm:p-4 overflow-x-auto">
          {renderTemplate()}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {Object.keys(editedData).length > 0 ? (
            renderFieldEditor(editedData, '', !isEditable)
          ) : (
            <p className="text-gray-500 col-span-full text-center py-8">No translation data available</p>
          )}
        </div>
      )}

      {isEditable && (
        <div className="mt-4">
          <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wider">Review Notes</label>
          <textarea
            value={reviewNotes}
            onChange={(e) => setReviewNotes(e.target.value)}
            rows={2}
            className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500/50 resize-y"
            placeholder="Add your review notes here..."
          />
        </div>
      )}
    </div>
  );

  // ── Data View Tab ──
  const renderDataView = () => (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-2">
        <button
          onClick={() => {
            const el = window.document.getElementById('data-original');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
          className="text-xs px-3 py-1.5 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-600 transition-colors"
        >
          Original (AI Extracted)
        </button>
        <button
          onClick={() => {
            const el = window.document.getElementById('data-edited');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
          className="text-xs px-3 py-1.5 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-600 transition-colors"
        >
          Current (Edited)
        </button>
      </div>
      <div id="data-original">
        <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Original AI-Extracted Data</h4>
        <pre className="text-gray-700 text-xs whitespace-pre-wrap font-mono bg-gray-50 rounded-lg p-4 max-h-[400px] overflow-auto border border-gray-200">
          {JSON.stringify(document.extractedData || {}, null, 2)}
        </pre>
      </div>
      <div id="data-edited">
        <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Current Edited Data</h4>
        <pre className="text-gray-700 text-xs whitespace-pre-wrap font-mono bg-gray-50 rounded-lg p-4 max-h-[400px] overflow-auto border border-gray-200">
          {JSON.stringify(editedData || {}, null, 2)}
        </pre>
      </div>
    </div>
  );

  // ── History Tab ──
  const renderHistory = () => (
    <div className="space-y-3">
      {revisions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-gray-500">
          <svg className="w-12 h-12 mb-3 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="font-medium">No revision history</p>
          <p className="text-sm mt-1">Changes will appear here after edits are saved</p>
        </div>
      ) : (
        revisions.map((rev) => (
          <div key={rev.id} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-gray-900 text-sm font-medium">{rev.translatorName}</span>
              <span className="text-gray-500 text-xs">{formatDate(rev.createdAt)}</span>
            </div>
            <p className="text-gray-500 text-sm">{rev.changes}</p>
            {rev.comment && (
              <p className="text-gray-500 text-xs mt-1 italic">&ldquo;{rev.comment}&rdquo;</p>
            )}
          </div>
        ))
      )}
    </div>
  );

  const renderTabContent = (tabId: TabId) => {
    switch (tabId) {
      case 'original': return renderOriginalDocument();
      case 'edit': return renderEditTranslation();
      case 'data': return renderDataView();
      case 'history': return renderHistory();
    }
  };

  return (
    <div className="flex flex-col">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            title="Back to Queue"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="min-w-0">
            <h3 className="text-gray-900 font-semibold text-lg truncate">
              {document.documentTitle || document.formType || 'Document Review'}
            </h3>
            <p className="text-gray-500 text-xs truncate">
              {document.id} &middot; {document.userEmail}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${status.bg} ${status.text}`}>
            {status.label}
          </span>
          {document.speedTier && (
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-orange-500/15 text-orange-400">
              {document.speedTier.label}
            </span>
          )}
          {document.sourceLanguage && (
            <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
              {document.sourceLanguage.toUpperCase()} &rarr; EN
            </span>
          )}
          {isClaimable && onClaim && (
            <button
              onClick={() => onClaim(document.id)}
              disabled={saving}
              className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-full transition-colors"
            >
              Claim Document
            </button>
          )}
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
          <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-0.5">Submitted</p>
          <p className="text-gray-900 text-sm font-medium">{formatDate(document.createdAt)}</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
          <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-0.5">Form Type</p>
          <p className="text-gray-900 text-sm font-medium">{document.formType}</p>
        </div>
        {document.aiConfidenceScore ? (
          <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
            <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-0.5">AI Confidence</p>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-gray-700 rounded-full h-1.5">
                <div
                  className={`h-1.5 rounded-full ${
                    document.aiConfidenceScore > 0.8 ? 'bg-emerald-500' : document.aiConfidenceScore > 0.6 ? 'bg-amber-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${document.aiConfidenceScore * 100}%` }}
                />
              </div>
              <span className="text-gray-900 text-sm font-medium">{Math.round(document.aiConfidenceScore * 100)}%</span>
            </div>
          </div>
        ) : (
          <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
            <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-0.5">Source</p>
            <p className="text-gray-900 text-sm font-medium">{document.source === 'certifiedDocuments' ? 'Certified' : 'Standard'}</p>
          </div>
        )}
        <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
          <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-0.5">Priority</p>
          <p className={`text-sm font-medium ${
            document.priority === 'urgent' ? 'text-red-500' : document.priority === 'high' ? 'text-orange-500' : 'text-gray-900'
          }`}>
            {document.priority ? `${document.priority.charAt(0).toUpperCase()}${document.priority.slice(1)}` : 'Normal'}
          </p>
        </div>
      </div>

      {/* Tab Bar */}
      <div className="flex items-center justify-between border-b border-gray-200 mb-4">
        <div className="flex gap-1 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setSplitView(false); }}
              className={`flex items-center gap-1.5 px-3 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-300'
              }`}
            >
              {tab.icon}
              <span className="hidden sm:inline">{tab.label}</span>
              {tab.badge && tab.badge > 0 && (
                <span className="ml-1 px-1.5 py-0.5 bg-gray-100 text-gray-600 text-[10px] rounded-full font-medium">
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </div>
        <button
          onClick={() => setSplitView(!splitView)}
          className={`hidden lg:flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg transition-colors flex-shrink-0 ${
            splitView ? 'bg-blue-500/20 text-blue-400' : 'bg-gray-100 text-gray-500 hover:text-gray-300'
          }`}
          title="Split view: Original + Edit side by side"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7" />
          </svg>
          Split View
        </button>
      </div>

      {/* Content */}
      <div className="min-h-0">
        {splitView ? (
          <div className="grid grid-cols-2 gap-4">
            <div className="overflow-auto bg-gray-50 rounded-xl border border-gray-200 p-4">
              <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Original Document
              </h4>
              {renderOriginalDocument()}
            </div>
            <div className="overflow-auto bg-gray-50 rounded-xl border border-gray-200 p-4">
              <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit Translation
              </h4>
              {hasTemplate ? (
                <div className="bg-gray-50 rounded-lg p-2 overflow-x-auto">
                  {renderTemplate()}
                </div>
              ) : renderEditTranslation()}
            </div>
          </div>
        ) : (
          <div className="bg-gray-50 rounded-xl border border-gray-200 p-4 sm:p-6">
            {renderTabContent(activeTab)}
          </div>
        )}
      </div>

      {/* Action Bar */}
      {isEditable && (
        <div className="mt-4 pt-4 border-t border-gray-200 flex flex-wrap items-center gap-2">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-gray-900 text-sm font-medium rounded-lg transition-colors"
          >
            {saving ? (
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white" />
            ) : (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
              </svg>
            )}
            Save Draft
          </button>
          <button
            onClick={() => setShowApproveModal(true)}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-gray-900 text-sm font-medium rounded-lg transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Approve
          </button>
          <button
            onClick={() => setShowRejectModal(true)}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-gray-900 text-sm font-medium rounded-lg transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Reject
          </button>
          <div className="flex-1" />
          <button
            onClick={() => onRelease()}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 text-gray-600 text-sm font-medium rounded-lg transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M3 12l6.414 6.414a2 2 0 001.414.586H19a2 2 0 002-2V7a2 2 0 00-2-2h-8.172a2 2 0 00-1.414.586L3 12z" />
            </svg>
            Release
          </button>
        </div>
      )}

      {/* Approve Modal */}
      {showApproveModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 max-w-md w-full shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Approve Translation</h3>
                <p className="text-gray-500 text-sm">This will mark it as certified and ready for delivery</p>
              </div>
            </div>
            <textarea
              value={finalNotes}
              onChange={(e) => setFinalNotes(e.target.value)}
              rows={3}
              className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 mb-4"
              placeholder="Final notes (optional)..."
            />
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowApproveModal(false)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 text-sm rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleApprove}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-gray-900 text-sm font-medium rounded-lg transition-colors"
              >
                Confirm Approval
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 max-w-md w-full shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
                <svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Reject Document</h3>
                <p className="text-gray-500 text-sm">This will send the document back to the user</p>
              </div>
            </div>
            <div className="mb-3">
              <label className="block text-xs font-medium text-gray-400 mb-1 uppercase tracking-wider">Rejection Type</label>
              <select
                value={rejectType}
                onChange={(e) => setRejectType(e.target.value)}
                className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900"
              >
                <option value="quality">Quality Issues</option>
                <option value="illegible">Illegible Document</option>
                <option value="incomplete">Incomplete Information</option>
                <option value="wrong_format">Wrong Format</option>
              </select>
            </div>
            <div className="mb-4">
              <label className="block text-xs font-medium text-gray-400 mb-1 uppercase tracking-wider">Reason *</label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows={3}
                className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900"
                placeholder="Explain why this document is being rejected..."
              />
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowRejectModal(false)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 text-sm rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={!rejectReason.trim()}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-gray-900 text-sm font-medium rounded-lg transition-colors"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentReview;
