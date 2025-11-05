// HighSchoolAttestationTemplate.tsx - High School Attestation Certificate Template
// Single unified template with white background
// Content is dynamically populated based on uploaded document
// Based on DRC school attestation formats with landscape orientation

import React, { useEffect, useState } from 'react';
import QRCodeComponent from './QRCodeComponent';

// Editable Field Component
const EditableField: React.FC<{
  value: string | number;
  onChange: (value: string) => void;
  className?: string;
  style?: React.CSSProperties;
  isEditable?: boolean;
  placeholder?: string;
  multiline?: boolean;
}> = ({ value, onChange, className = '', style = {}, isEditable = false, placeholder = '', multiline = false }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempValue, setTempValue] = useState(String(value || ''));

  useEffect(() => {
    setTempValue(String(value || ''));
  }, [value]);

  const handleSave = () => {
    onChange(tempValue);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setTempValue(String(value || ''));
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // For multiline fields, save with Ctrl+Enter or Cmd+Enter
    if (multiline && e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSave();
    } else if (!multiline && e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleCancel();
    }
  };

  const displayValue = String(value || '');

  if (isEditable && isEditing) {
    // Use textarea for multiline fields, input for single-line fields
    if (multiline) {
      return (
        <textarea
          value={tempValue}
          onChange={(e) => setTempValue(e.target.value)}
          onBlur={handleSave}
          onKeyDown={handleKeyDown}
          className={`bg-yellow-100 border-2 border-blue-400 outline-none rounded-sm px-2 py-1 font-bold resize-none ${className}`}
          style={{
            ...style,
            display: 'block',
            width: '100%',
            minHeight: '80px',
            lineHeight: '1.8',
            fontFamily: 'inherit',
          }}
          placeholder={placeholder || 'Press Ctrl+Enter or Cmd+Enter to save, Esc to cancel'}
          autoFocus
        />
      );
    }

    return (
      <input
        type="text"
        value={tempValue}
        onChange={(e) => setTempValue(e.target.value)}
        onBlur={handleSave}
        onKeyDown={handleKeyDown}
        className={`bg-yellow-100 border-2 border-blue-400 outline-none rounded-sm px-1 font-bold ${className}`}
        style={{
          ...style,
          display: 'inline-block',
          width: style?.width || 'auto',
          maxWidth: '100%',
          minWidth: style?.minWidth || '100px',
        }}
        placeholder={placeholder}
        autoFocus
      />
    );
  }

  return (
    <span
      className={`${className} ${isEditable ? 'cursor-pointer hover:bg-yellow-100 hover:shadow-sm px-1 py-0.5 rounded-sm transition-colors duration-150' : ''} ${displayValue ? '' : 'text-gray-400 italic'}`}
      style={style}
      onClick={() => isEditable && setIsEditing(true)}
      title={isEditable ? 'Click to edit' : ''}
    >
      {displayValue || (isEditable && placeholder ? 'Click to edit' : placeholder)}
    </span>
  );
};

export interface HighSchoolAttestationData {
  // Header - Institution (School info only)
  schoolName: string;
  schoolAddress: string;
  province: string;
  division: string;
  
  // Document (In English, editable, NOT from AI translation)
  documentTitle: string; // e.g., "School Attendance Certificate", "Certificate of Success"
  
  // Student (CORE - Always needed)
  studentName: string;
  studentGender: 'M' | 'F';
  birthDate: string;
  birthPlace: string;
  
  // Main Content (The actual attestation text extracted and translated from uploaded document)
  mainContent: string;
  
  // Footer
  issueLocation: string;
  issueDate: string;
  signatoryName: string;
  signatoryTitle: string;
  purpose: string; // e.g., "This document is issued for official purposes."
}

// Hardcoded values for DRC documents
const HARDCODED_COUNTRY = "RÉPUBLIQUE DÉMOCRATIQUE DU CONGO";
const HARDCODED_MINISTRY = "MINISTÈRE DE L'ENSEIGNEMENT PRIMAIRE, SECONDAIRE ET TECHNIQUE";

interface HighSchoolAttestationTemplateProps {
  data?: HighSchoolAttestationData;
  isEditable?: boolean;
  onDataChange?: (updatedData: HighSchoolAttestationData) => void;
  documentId?: string;
}

const HighSchoolAttestationTemplate: React.FC<HighSchoolAttestationTemplateProps> = ({ 
  data, 
  isEditable = false, 
  onDataChange,
  documentId: propDocumentId
}) => {
  // Minimal placeholder data - AI will populate actual values from uploaded document
  const defaultData: HighSchoolAttestationData = {
    schoolName: "School Name",
    schoolAddress: "School Address",
    province: "Province",
    division: "Division",
    documentTitle: "School Attendance Certificate", // In English, editable
    studentName: "Student Name",
    studentGender: "M",
    birthPlace: "Birth Place",
    birthDate: "Birth Date",
    mainContent: "Certificate content will be extracted and translated from your uploaded document.",
    purpose: "This document is issued for official purposes.",
    issueLocation: "City",
    issueDate: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
    signatoryName: "Signatory Name",
    signatoryTitle: "Signatory Title"
  };

  const [pdfData, setPdfData] = useState<HighSchoolAttestationData | null>(null);
  const [currentData, setCurrentData] = useState<HighSchoolAttestationData>(
    data || defaultData
  );
  const [screenWidth, setScreenWidth] = useState<number>(typeof window !== 'undefined' ? window.innerWidth : 1024);
  const [documentId, setDocumentId] = useState<string>(propDocumentId || '');

  // Update document ID when prop changes
  useEffect(() => {
    if (propDocumentId && propDocumentId !== documentId) {
      setDocumentId(propDocumentId);
    }
  }, [propDocumentId, documentId]);

  // Update current data when props change
  useEffect(() => {
    const newData = pdfData || data || defaultData;
    setCurrentData(newData);
  }, [pdfData, data]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setScreenWidth(window.innerWidth);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Listen for PDF generation data
  useEffect(() => {
    const handlePdfDataReady = (event: any) => {
      setPdfData(event.detail);
    };

    if (typeof window !== 'undefined' && (window as any).isPdfGenerationMode && (window as any).pdfAttestationData) {
      setPdfData((window as any).pdfAttestationData);
    }

    window.addEventListener('pdf-attestation-data-ready', handlePdfDataReady);
    return () => {
      window.removeEventListener('pdf-attestation-data-ready', handlePdfDataReady);
    };
  }, []);

  const attestationData = currentData;

  // Handle field changes
  const handleFieldChange = (field: keyof HighSchoolAttestationData, value: string) => {
    const updatedData = { ...attestationData, [field]: value };
    setCurrentData(updatedData);
    if (onDataChange) {
      onDataChange(updatedData);
    }
  };

  // Responsive styles for landscape orientation - White background only
  const certificateContainerStyle: React.CSSProperties = {
    maxWidth: screenWidth < 640 ? '100%' : '297mm',
    width: '100%',
    minHeight: screenWidth < 640 ? 'auto' : '210mm',
    margin: '0 auto',
    backgroundColor: '#ffffff',
    boxShadow: screenWidth < 640 ? '0 0 10px rgba(0, 0, 0, 0.1)' : '0 0 30px rgba(0, 0, 0, 0.15)',
    fontFamily: '"Times New Roman", serif',
    lineHeight: 1.8,
    position: 'relative',
    pageBreakInside: 'avoid',
    padding: screenWidth < 640 ? '10px 14px' : '10mm 12mm',
  };

  const certificateContentStyle: React.CSSProperties = {
    padding: screenWidth < 640 ? '14px 18px' : '14mm 16mm',
    background: '#ffffff',
    position: 'relative',
    minHeight: '100%',
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    border: `${screenWidth < 640 ? '5px' : '7px'} double #000`,
    pageBreakInside: 'avoid',
  };

  const mainTextStyle: React.CSSProperties = {
    textAlign: 'justify',
    color: '#000',
    fontSize: screenWidth < 640 ? '11px' : '13px',
    lineHeight: 1.8,
  };

  const underlineFieldStyle: React.CSSProperties = {
    borderBottom: '1px dotted #000',
    padding: '0 4px',
    margin: '0 2px',
    fontFamily: '"Courier New", monospace',
    fontWeight: 'bold',
    display: 'inline-block',
    minWidth: '60px',
  };

  return (
    <div className="w-full overflow-x-auto">
      {/* PDF-specific styles */}
      <style dangerouslySetInnerHTML={{
        __html: `
          @page {
            size: A4 landscape;
            margin: 0;
          }
          @media print {
            #highschool-attestation-template {
              width: 297mm;
              height: 210mm;
              page-break-inside: avoid;
              box-shadow: none !important;
            }
            body {
              margin: 0;
              padding: 0;
            }
          }
          .print-visible {
            display: block !important;
          }
        `
      }} />
      <div className="min-w-full sm:min-w-0">
        <div id="highschool-attestation-template" data-testid="highschool-attestation-template" style={certificateContainerStyle}>
          <div style={certificateContentStyle}>
            {/* Header Section */}
            <div className="text-center mb-4">
              <div className="flex items-start justify-between mb-3">
                <img
                  src="/Coat.png"
                  alt="DRC Coat of Arms"
                  className="h-12 sm:h-16 object-contain flex-shrink-0"
                />
                
                <div className="flex-1 text-center px-2 min-w-0">
                  <h1 className="font-serif uppercase text-xs sm:text-sm font-bold leading-tight">
                    {HARDCODED_COUNTRY}
                  </h1>
                  <h2 className="font-serif text-xs sm:text-sm mt-1 leading-tight uppercase font-bold">
                    {HARDCODED_MINISTRY}
                  </h2>
                  <h3 className="font-serif text-xs mt-1 leading-tight font-bold">
                    <EditableField
                      value={attestationData.schoolName}
                      onChange={(v) => handleFieldChange('schoolName', v)}
                      isEditable={isEditable}
                    />
                  </h3>
                  <p className="text-xs mt-0.5">
                    <EditableField
                      value={attestationData.schoolAddress}
                      onChange={(v) => handleFieldChange('schoolAddress', v)}
                      isEditable={isEditable}
                    />
                  </p>
                </div>

                <img
                  src="/flag.png"
                  alt="DRC Flag"
                  className="h-12 sm:h-16 object-contain flex-shrink-0"
                />
              </div>

              {/* Location details */}
              <div className="text-xs mt-2">
                <p>
                  <EditableField
                    value={attestationData.province}
                    onChange={(v) => handleFieldChange('province', v)}
                    isEditable={isEditable}
                  />
                </p>
                <p>
                  <EditableField
                    value={attestationData.division}
                    onChange={(v) => handleFieldChange('division', v)}
                    isEditable={isEditable}
                  />
                </p>
              </div>
            </div>

            {/* Document Title */}
            <div className="text-center mb-4">
              <h3 className="font-serif uppercase font-bold text-base sm:text-xl tracking-wide underline">
                <EditableField
                  value={attestationData.documentTitle}
                  onChange={(v) => handleFieldChange('documentTitle', v)}
                  isEditable={isEditable}
                />
              </h3>
            </div>

            {/* Main Content */}
            <div style={mainTextStyle}>
              <p className="mb-4 pl-4">
                <EditableField
                  value={attestationData.mainContent}
                  onChange={(v) => handleFieldChange('mainContent', v)}
                  isEditable={isEditable}
                  multiline={true}
                />
              </p>

              <p className="mb-4 pl-4">
                <EditableField
                  value={attestationData.purpose}
                  onChange={(v) => handleFieldChange('purpose', v)}
                  isEditable={isEditable}
                  multiline={true}
                />
              </p>
            </div>

            {/* Issue Location and Date */}
            <div className="text-right mb-6 text-xs sm:text-sm" style={{ fontSize: '13px' }}>
              <p>
                Issued at{' '}
                <EditableField
                  value={attestationData.issueLocation}
                  onChange={(v) => handleFieldChange('issueLocation', v)}
                  style={underlineFieldStyle}
                  isEditable={isEditable}
                />
                ,{' '}
                <EditableField
                  value={attestationData.issueDate}
                  onChange={(v) => handleFieldChange('issueDate', v)}
                  style={underlineFieldStyle}
                  isEditable={isEditable}
                />
              </p>
            </div>

            {/* Signatures Section */}
            <div className="mt-6">
              {/* Stamp in center */}
              <img
                src="/stamp.png"
                alt="Official Stamp"
                style={{
                  width: screenWidth < 640 ? '120px' : '150px',
                  height: screenWidth < 640 ? '120px' : '150px',
                  objectFit: 'contain',
                  position: 'absolute',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  bottom: screenWidth < 640 ? '70px' : '90px',
                  zIndex: 10,
                  opacity: 0.6
                }}
              />

              <div className="grid grid-cols-1 gap-4 items-start text-xs" style={{ fontSize: '12px' }}>
                {/* Signature */}
                <div className="text-center">
                  <div className="mb-2 font-bold">
                    <EditableField
                      value={attestationData.signatoryTitle}
                      onChange={(v) => handleFieldChange('signatoryTitle', v)}
                      isEditable={isEditable}
                    />
                  </div>
                  <div className="h-12 flex items-center justify-center mb-2">
                    <div className="text-[10px] text-gray-500 border border-gray-300 p-1.5">Signature</div>
                  </div>
                  <div className="mt-2 font-bold">
                    <EditableField
                      value={attestationData.signatoryName}
                      onChange={(v) => handleFieldChange('signatoryName', v)}
                      isEditable={isEditable}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* QR Code for Verification - Bottom Left */}
            {documentId && (
              <div style={{
                position: 'absolute',
                bottom: '18px',
                left: '18px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '3px'
              }}>
                <QRCodeComponent 
                  documentId={documentId}
                  size={screenWidth < 640 ? 50 : 60}
                  className="print-visible"
                />
                <div style={{
                  fontSize: screenWidth < 640 ? '7px' : '8px',
                  color: '#000',
                  textAlign: 'center',
                  fontWeight: 'bold'
                }}>
                  Verify Document
                </div>
              </div>
            )}

            {/* Translation Note - Bottom Right */}
            <div style={{
              position: 'absolute',
              bottom: '15px',
              right: '20px',
              textAlign: 'right',
              fontSize: screenWidth < 640 ? '8px' : '10px',
              color: '#000',
              fontStyle: 'italic'
            }}>
              <strong>NB:</strong> This document was translated with Nyota Translation Center
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HighSchoolAttestationTemplate;
