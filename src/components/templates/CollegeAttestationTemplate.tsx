// CollegeAttestationTemplate.tsx - College Attestation of Enrollment Certificate Template
// Displays certificate of attendance/enrollment for a student in LANDSCAPE orientation
// Based on ISC (Institut Supérieur de Commerce) attestation format

import React, { useEffect, useState } from 'react';
import { QRCodeComponent } from '../common';

// Editable Field Component
const EditableField: React.FC<{
  value: string | number;
  onChange: (value: string) => void;
  className?: string;
  style?: React.CSSProperties;
  isEditable?: boolean;
  placeholder?: string;
}> = ({ value, onChange, className = '', style = {}, isEditable = false, placeholder = '' }) => {
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
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleCancel();
    }
  };

  const displayValue = String(value || '');

  if (isEditable && isEditing) {
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
          width: 'auto',
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

export interface CollegeAttestationData {
  // Institution header
  country: string;
  institutionType: string;
  institutionName: string;
  institutionAbbreviation: string;
  institutionEmail: string;
  institutionWebsite: string;
  departmentName: string;

  // Document details
  documentTitle: string;
  documentNumber: string;

  // Signatory details
  signatoryTitle: string;
  signatoryName: string;
  signatoryPosition: string;

  // Student info
  studentName: string;
  studentGender: string; // "le" for male, "la" for female
  birthPlace: string;
  birthDate: string;
  matricule: string;

  // Academic details
  enrollmentStatus: string; // e.g., "régulièrement inscrit(e) en Section de"
  section: string;
  option: string;
  institutionLocation: string;
  academicYear: string;
  yearLevel: string; // e.g., "Deuxième Licence"
  performance: string; // e.g., "mention SATISFAISANT"
  percentage: string; // e.g., "(69,1%)"
  session: string; // e.g., "en première session"

  // Issue details
  purpose: string; // "Cette attestation de fréquentation lui est delivrée pour valoir ce que de droit"
  issueLocation: string;
  issueDate: string;
  
  // Signatures
  secretaryTitle: string;
  chiefTitle: string;
  chiefName: string;
  chiefPosition: string;
}

interface CollegeAttestationTemplateProps {
  data?: CollegeAttestationData;
  isEditable?: boolean;
  onDataChange?: (updatedData: CollegeAttestationData) => void;
  documentId?: string;
}

const CollegeAttestationTemplate: React.FC<CollegeAttestationTemplateProps> = ({ 
  data, 
  isEditable = false, 
  onDataChange,
  documentId: propDocumentId
}) => {
  // Default data structure based on the ISC attestation
  const defaultData: CollegeAttestationData = {
    country: "Democratic Republic of the Congo",
    institutionType: "HIGHER EDUCATION AND UNIVERSITY",
    institutionName: "INSTITUT SUPÉRIEUR DE COMMERCE",
    institutionAbbreviation: "(I.S.C. / BENI)",
    institutionEmail: "iscbeni@yahoo.fr / iscbeni@gmail.com",
    institutionWebsite: "www.isc.beni.ac",
    departmentName: "General Academic Secretariat",
    documentTitle: "CERTIFICATE OF ATTENDANCE",
    documentNumber: "N° 1532/SGAC/S.SC.F/MMF/2022",
    signatoryTitle: "Chief of Works",
    signatoryName: "MUHINDO MUHASA Faustin",
    signatoryPosition: "General Academic Secretary",
    studentName: "MBUSA KALISYA Riphin",
    studentGender: "le",
    birthPlace: "Beni",
    birthDate: "21/07/1999",
    matricule: "AZ.3707/20",
    enrollmentStatus: "regularly enrolled in the Section of",
    section: "Commercial Sciences and Finance",
    option: "Fiscal Option",
    institutionLocation: "Beni",
    academicYear: "2021-2022",
    yearLevel: "Second Year License",
    performance: "SATISFACTORY grade",
    percentage: "(69.1%)",
    session: "in the first session",
    purpose: "This certificate of attendance is issued to serve whatever purpose it may be required for.",
    issueLocation: "Beni",
    issueDate: "April 24, 2023",
    secretaryTitle: "The General Academic Secretary,",
    chiefTitle: "MUHINDO MUHASA Faustin",
    chiefName: "MUHINDO MUHASA Faustin",
    chiefPosition: "Chief of Works"
  };

  const [pdfData, setPdfData] = useState<CollegeAttestationData | null>(null);
  const [currentData, setCurrentData] = useState<CollegeAttestationData>(defaultData);
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
  const handleFieldChange = (field: keyof CollegeAttestationData, value: string) => {
    const updatedData = { ...attestationData, [field]: value };
    setCurrentData(updatedData);
    if (onDataChange) {
      onDataChange(updatedData);
    }
  };

  // Responsive styles for landscape orientation
  const certificateContainerStyle: React.CSSProperties = {
    maxWidth: screenWidth < 640 ? '100%' : '297mm', // A4 landscape width
    width: '100%',
    minHeight: screenWidth < 640 ? 'auto' : '210mm', // A4 landscape height
    margin: '0 auto',
    backgroundColor: '#ffffff',
    boxShadow: screenWidth < 640 ? '0 0 10px rgba(0, 0, 0, 0.1)' : '0 0 30px rgba(0, 0, 0, 0.15)',
    fontFamily: '"Times New Roman", serif',
    lineHeight: 1.8,
    position: 'relative',
    pageBreakInside: 'avoid',
    padding: screenWidth < 640 ? '10px 14px' : '8mm 10mm', // Reduced padding for more content space
  };

  const certificateContentStyle: React.CSSProperties = {
    padding: screenWidth < 640 ? '12px 16px' : '12mm 14mm', // Reduced inner padding
    background: '#ffffff',
    position: 'relative',
    minHeight: '100%',
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    border: screenWidth < 640 ? '5px double #000' : '7px double #000', // Thick double border (only one)
    pageBreakInside: 'avoid',
  };

  const mainTextStyle: React.CSSProperties = {
    textAlign: 'justify',
    color: '#000',
    fontSize: screenWidth < 640 ? '11px' : '12px', // Reduced for better layout
    lineHeight: 1.7, // Adjusted line spacing
  };

  const underlineFieldStyle: React.CSSProperties = {
    borderBottom: '1px dotted #000',
    padding: '0 4px',
    margin: '0 4px',
    fontFamily: '"Courier New", monospace',
    fontWeight: 'bold',
    display: 'inline-block',
    minWidth: '80px',
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
            #college-attestation-template {
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
        <div id="college-attestation-template" data-testid="college-attestation-template" style={certificateContainerStyle}>
          <div style={certificateContentStyle}>
            {/* Header with Coat of Arms and Flag */}
            <div className="flex items-start justify-between mb-2">
                <img
                  src="/Coat.png"
                  alt="DRC Coat of Arms"
                  className="h-14 sm:h-16 object-contain flex-shrink-0"
                />
                
                <div className="flex-1 text-center px-2 min-w-0">
                  <h1 className="font-serif uppercase text-xs sm:text-sm font-bold leading-tight">
                    Democratic Republic of the Congo
                  </h1>
                  <h2 className="font-serif text-xs sm:text-sm mt-1 leading-tight uppercase font-bold">
                    Higher Education and University
                  </h2>
                  <h2 className="font-serif text-xs sm:text-sm mt-1 leading-tight">
                    INSTITUTION:{' '}
                    <EditableField
                      value={attestationData.institutionName}
                      onChange={(v) => handleFieldChange('institutionName', v)}
                      isEditable={isEditable}
                      className="font-bold uppercase"
                    />
                  </h2>
                  <p className="text-xs mt-1">
                    Email: <EditableField
                      value={attestationData.institutionEmail}
                      onChange={(v) => handleFieldChange('institutionEmail', v)}
                      isEditable={isEditable}
                    />
                  </p>
                </div>

                <img
                  src="/flag.png"
                  alt="DRC Flag"
                  className="h-14 sm:h-16 object-contain flex-shrink-0"
                />
              </div>

              {/* Document Title */}
              <div className="text-center mb-3">
                <h3 className="font-serif uppercase font-bold text-base sm:text-lg tracking-wide underline">
                  Certificate of Attendance
                </h3>
                <p className="text-xs sm:text-sm mt-1 font-bold">
                  <EditableField
                    value={attestationData.documentNumber}
                    onChange={(v) => handleFieldChange('documentNumber', v)}
                    isEditable={isEditable}
                  />
                </p>
              </div>

              {/* Main Content */}
              <div style={mainTextStyle}>
                <p className="mb-3 pl-6">
                  I, the undersigned,{' '}
                  <EditableField
                    value={attestationData.signatoryTitle}
                    onChange={(v) => handleFieldChange('signatoryTitle', v)}
                    style={underlineFieldStyle}
                    isEditable={isEditable}
                  />
                  {' '}
                  <EditableField
                    value={attestationData.signatoryName}
                    onChange={(v) => handleFieldChange('signatoryName', v)}
                    style={underlineFieldStyle}
                    isEditable={isEditable}
                  />
                  ,{' '}
                  <EditableField
                    value={attestationData.signatoryPosition}
                    onChange={(v) => handleFieldChange('signatoryPosition', v)}
                    style={underlineFieldStyle}
                    isEditable={isEditable}
                  />
                  {' '}of the{' '}
                  <EditableField
                    value={attestationData.institutionName}
                    onChange={(v) => handleFieldChange('institutionName', v)}
                    style={underlineFieldStyle}
                    isEditable={isEditable}
                  />
                  {' '}
                  <EditableField
                    value={attestationData.institutionAbbreviation}
                    onChange={(v) => handleFieldChange('institutionAbbreviation', v)}
                    style={underlineFieldStyle}
                    isEditable={isEditable}
                  />
                  {' '}of{' '}
                  <EditableField
                    value={attestationData.institutionLocation}
                    onChange={(v) => handleFieldChange('institutionLocation', v)}
                    style={underlineFieldStyle}
                    isEditable={isEditable}
                  />
                  , certify by the present document that{' '}
                  {attestationData.studentGender === 'la' ? 'Ms.' : 'Mr.'}{' '}
                  <EditableField
                    value={attestationData.studentName}
                    onChange={(v) => handleFieldChange('studentName', v)}
                    style={{ ...underlineFieldStyle, fontWeight: 'bold', minWidth: '150px' }}
                    isEditable={isEditable}
                    className="uppercase"
                  />
                  , born in{' '}
                  <EditableField
                    value={attestationData.birthPlace}
                    onChange={(v) => handleFieldChange('birthPlace', v)}
                    style={underlineFieldStyle}
                    isEditable={isEditable}
                  />
                  , on{' '}
                  <EditableField
                    value={attestationData.birthDate}
                    onChange={(v) => handleFieldChange('birthDate', v)}
                    style={underlineFieldStyle}
                    isEditable={isEditable}
                  />
                  , Registration Number:{' '}
                  <EditableField
                    value={attestationData.matricule}
                    onChange={(v) => handleFieldChange('matricule', v)}
                    style={underlineFieldStyle}
                    isEditable={isEditable}
                  />
                  , has been{' '}
                  <EditableField
                    value={attestationData.enrollmentStatus}
                    onChange={(v) => handleFieldChange('enrollmentStatus', v)}
                    style={underlineFieldStyle}
                    isEditable={isEditable}
                  />
                  {' '}
                  <EditableField
                    value={attestationData.section}
                    onChange={(v) => handleFieldChange('section', v)}
                    style={underlineFieldStyle}
                    isEditable={isEditable}
                  />
                  ,{' '}
                  <EditableField
                    value={attestationData.option}
                    onChange={(v) => handleFieldChange('option', v)}
                    style={underlineFieldStyle}
                    isEditable={isEditable}
                  />
                  , of the{' '}
                  <EditableField
                    value={attestationData.institutionName}
                    onChange={(v) => handleFieldChange('institutionName', v)}
                    style={underlineFieldStyle}
                    isEditable={isEditable}
                  />
                  {' '}of{' '}
                  <EditableField
                    value={attestationData.institutionLocation}
                    onChange={(v) => handleFieldChange('institutionLocation', v)}
                    style={underlineFieldStyle}
                    isEditable={isEditable}
                  />
                  , during the academic year indicated below:
                </p>

                <div className="ml-8 mb-3">
                  <p className="mb-1">
                    •{' '}
                    <EditableField
                      value={attestationData.academicYear}
                      onChange={(v) => handleFieldChange('academicYear', v)}
                      isEditable={isEditable}
                      className="font-bold"
                    />
                    :{' '}
                    <EditableField
                      value={attestationData.yearLevel}
                      onChange={(v) => handleFieldChange('yearLevel', v)}
                      isEditable={isEditable}
                    />
                    ,{' '}
                    <EditableField
                      value={attestationData.performance}
                      onChange={(v) => handleFieldChange('performance', v)}
                      isEditable={isEditable}
                    />
                    {' '}
                    <EditableField
                      value={attestationData.percentage}
                      onChange={(v) => handleFieldChange('percentage', v)}
                      isEditable={isEditable}
                      className="font-bold"
                    />
                    ,{' '}
                    <EditableField
                      value={attestationData.session}
                      onChange={(v) => handleFieldChange('session', v)}
                      isEditable={isEditable}
                    />
                    .
                  </p>
                </div>

                <p className="mb-4 ml-6">
                  This certificate of attendance is issued to serve whatever purpose it may be required for.
                </p>
              </div>

              {/* Issue Location and Date */}
              <div className="text-right mb-4 text-xs sm:text-sm" style={{ fontSize: '12px' }}>
                <p>
                  Done in{' '}
                  <EditableField
                    value={attestationData.issueLocation}
                    onChange={(v) => handleFieldChange('issueLocation', v)}
                    style={underlineFieldStyle}
                    isEditable={isEditable}
                  />
                  , on{' '}
                  <EditableField
                    value={attestationData.issueDate}
                    onChange={(v) => handleFieldChange('issueDate', v)}
                    style={underlineFieldStyle}
                    isEditable={isEditable}
                  />
                </p>
              </div>

              {/* Signatures Section */}
              <div className="mt-4">
                {/* Stamp in center */}
                <img
                  src="/stamp.png"
                  alt="Official Stamp"
                  style={{
                    width: screenWidth < 640 ? '110px' : '140px',
                    height: screenWidth < 640 ? '110px' : '140px',
                    objectFit: 'contain',
                    position: 'absolute',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    bottom: screenWidth < 640 ? '65px' : '80px',
                    zIndex: 10,
                    opacity: 0.7
                  }}
                />

                <div className="grid grid-cols-2 gap-8 items-start text-xs" style={{ fontSize: '11px' }}>
                  {/* Left Signature - Secretary */}
                  <div className="text-center">
                    <div className="mb-2 italic font-semibold">
                      <EditableField
                        value={attestationData.secretaryTitle}
                        onChange={(v) => handleFieldChange('secretaryTitle', v)}
                        isEditable={isEditable}
                      />
                    </div>
                    <div className="h-12 flex items-center justify-center">
                      <div className="text-[10px] text-gray-500 border border-gray-300 p-1.5">Signature</div>
                    </div>
                    <div className="mt-2 font-bold">
                      <EditableField
                        value={attestationData.chiefTitle}
                        onChange={(v) => handleFieldChange('chiefTitle', v)}
                        isEditable={isEditable}
                      />
                    </div>
                    <div className="text-[11px] italic mt-1">
                      <EditableField
                        value={attestationData.chiefPosition}
                        onChange={(v) => handleFieldChange('chiefPosition', v)}
                        isEditable={isEditable}
                      />
                    </div>
                  </div>

                  {/* Right - Empty for now */}
                  <div className="text-center">
                    {/* Space for additional signature if needed */}
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

export default CollegeAttestationTemplate;
