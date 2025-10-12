import React, { useEffect, useState } from 'react';
import QRCodeComponent from './QRCodeComponent';

// Editable Field Component for Bachelor Diploma
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
      className={`font-bold ${className} ${isEditable ? 'cursor-pointer hover:bg-yellow-100 hover:shadow-sm px-1 py-0.5 rounded-sm transition-colors duration-150' : ''} ${displayValue ? '' : 'text-gray-400 italic'}`}
      style={style}
      onClick={() => isEditable && setIsEditing(true)}
      title={isEditable ? 'Click to edit' : ''}
    >
      {displayValue || (isEditable && placeholder ? 'Click to edit' : placeholder)}
    </span>
  );
};

interface BachelorDiplomaData {
  // Institution info
  institutionName: string;
  institutionLocation: string;
  
  // Diploma details
  diplomaNumber: string;
  
  // Student info
  studentName: string;
  birthPlace: string;
  birthDate: string; // Full date as string like "24 juillet 1993"
  
  // Academic details
  degree: string; // e.g., "troisième graduat en sciences" (third-year undergraduate in sciences)
  specialization: string; // e.g., "commerciales et fin" (business and finance)
  orientation: string; // e.g., "douanes et accises" (customs and excise)
  gradeLevel: string; // e.g., "GRADE EN SCIENCES" (BACHELOR OF SCIENCES)
  gradeSpecialization: string; // e.g., "COMML ET FIN" (Business and Finance)
  option: string; // e.g., "douanes et accises" (customs and excise)
  orientationDetail: string; // Additional orientation detail after "orientation:"
  
  // Completion details
  completionDate: string; // e.g., "30 décembre 2020"
  graduationYear: string; // e.g., "deuxième quadrimestre" (second term)
  
  // Issue details
  issueLocation: string;
  issueDate: string;
  
  // Registration details
  registrationDate: string; // e.g., "03 juin 2021"
  registrationNumber: string; // e.g., "1487"
  serialCode: string; // e.g., "XXX"
  examDate: string; // e.g., "25 juillet 2021"
  registerLetter: string; // e.g., "M"
}

interface BachelorDiplomaTemplateProps {
  data?: BachelorDiplomaData;
  isEditable?: boolean;
  onDataChange?: (updatedData: BachelorDiplomaData) => void;
  documentId?: string;
}

const BachelorDiplomaTemplate: React.FC<BachelorDiplomaTemplateProps> = ({ 
  data, 
  isEditable = false, 
  onDataChange,
  documentId: propDocumentId
}) => {
  // Default data structure
  const defaultData: BachelorDiplomaData = {
    institutionName: "INSTITUT SUPERIEUR DE COMMERCE DE GOMA",
    institutionLocation: "GOMA",
    diplomaNumber: "430.00AA.20",
    studentName: "STUDENT FULL NAME",
    birthPlace: "LOCATION",
    birthDate: "01 January 2000",
    degree: "third-year undergraduate in sciences",
    specialization: "business and finance",
    orientation: "customs and excise",
    gradeLevel: "bachelor of science",
    gradeSpecialization: "BUSINESS AND FINANCE",
    option: "customs and excise",
    orientationDetail: "",
    completionDate: "30 December 2023",
    graduationYear: "second term",
    issueLocation: "Goma",
    issueDate: "15 March 2024",
    registrationDate: "03 June 2024",
    registrationNumber: "0000",
    serialCode: "XXX",
    examDate: "25 July 2024",
    registerLetter: "M"
  };

  const [pdfData, setPdfData] = useState<BachelorDiplomaData | null>(null);
  const [currentData, setCurrentData] = useState<BachelorDiplomaData>(defaultData);
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

    if (typeof window !== 'undefined' && (window as any).isPdfGenerationMode && (window as any).pdfDiplomaData) {
      setPdfData((window as any).pdfDiplomaData);
    }

    window.addEventListener('pdf-data-ready', handlePdfDataReady);
    return () => {
      window.removeEventListener('pdf-data-ready', handlePdfDataReady);
    };
  }, []);

  const diplomaData = currentData;

  // Handle field changes
  const handleFieldChange = (field: keyof BachelorDiplomaData, value: string) => {
    const updatedData = { ...diplomaData, [field]: value };
    setCurrentData(updatedData);
    
    if (onDataChange) {
      onDataChange(updatedData);
    }
  };

  // Responsive styles
  const diplomaContainerStyle: React.CSSProperties = {
    maxWidth: screenWidth < 640 ? '100%' : '297mm', // A4 landscape width
    width: '100%',
    minHeight: screenWidth < 640 ? 'auto' : '210mm', // A4 landscape height
    margin: '0 auto',
    backgroundColor: '#ffffff',
    boxShadow: screenWidth < 640 ? '0 0 10px rgba(0, 0, 0, 0.1)' : '0 0 30px rgba(0, 0, 0, 0.15)',
    fontFamily: '"Times New Roman", serif',
    lineHeight: 1.6,
    position: 'relative',
    pageBreakInside: 'avoid',
  };

  const borderWrapperStyle: React.CSSProperties = {
    padding: screenWidth < 640 ? '6px' : '12px', // Slightly reduced padding for better fit
    border: screenWidth < 640 ? '2px solid #333' : '4px solid #333', // Thicker border like original
    width: '100%',
    minHeight: '100%',
    boxSizing: 'border-box',
    pageBreakInside: 'avoid',
  };

  const diplomaContentStyle: React.CSSProperties = {
    padding: screenWidth < 640 ? '8px 10px' : '16px 24px', // Increased padding for better spacing
    background: '#ffffff',
    position: 'relative',
    minHeight: '100%',
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    border: screenWidth < 640 ? '1px solid #333' : '2px solid #333', // Inner border for double border effect
    pageBreakInside: 'avoid',
  };

  const mainTextStyle: React.CSSProperties = {
    textAlign: 'justify',
    color: '#000',
    fontSize: screenWidth < 640 ? '10px' : '14px', // Increased for better height fill
    lineHeight: 1.6, // Increased line spacing for more height
  };

  const underlineFieldStyle: React.CSSProperties = {
    borderBottom: '1px dotted #000',
    padding: '0 4px',
    margin: '0 4px',
    fontFamily: '"Courier New", monospace',
    fontWeight: 'bold',
    display: 'inline-block',
    minWidth: '100px',
  };

  const centeredSectionStyle: React.CSSProperties = {
    textAlign: 'center',
    margin: '8px 0', // Increased spacing for better height
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
            #bachelor-diploma-template {
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
        <div id="bachelor-diploma-template" data-testid="bachelor-diploma-template" style={diplomaContainerStyle}>
          <div style={borderWrapperStyle}>
            <div style={diplomaContentStyle}>
              {/* Header with Coat of Arms and Flag */}
              <div className="flex items-start justify-between mb-4">
                <img
                  src="/Coat.png"
                  alt="DRC Coat of Arms"
                  className="h-16 sm:h-20 object-contain flex-shrink-0"
                />
                
                <div className="flex-1 text-center px-2 min-w-0">
                  <h1 className="font-serif uppercase text-sm sm:text-base font-bold leading-tight">
                    DEMOCRATIC REPUBLIC OF CONGO
                  </h1>
                  <h2 className="font-serif text-xs sm:text-sm mt-1 leading-tight">
                    INSTITUTION:{' '}
                    <EditableField
                      value={diplomaData.institutionName}
                      onChange={(value) => handleFieldChange('institutionName', value)}
                      isEditable={isEditable}
                      placeholder="INSTITUTION NAME"
                      className="font-bold uppercase"
                    />
                  </h2>
                </div>

                <img
                  src="/flag.png"
                  alt="DRC Flag"
                  className="h-16 sm:h-20 object-contain flex-shrink-0"
                />
              </div>

              {/* Diploma Title */}
              <div style={centeredSectionStyle}>
                <h3 className="font-serif uppercase font-bold text-xl sm:text-2xl tracking-wide mb-2" style={{ fontStyle: 'normal' }}>
                  DIPLOMA N°{' '}
                  <span style={{ fontStyle: 'normal', fontFamily: '"Times New Roman", serif' }}>
                    <EditableField
                      value={diplomaData.diplomaNumber}
                      onChange={(value) => handleFieldChange('diplomaNumber', value)}
                      isEditable={isEditable}
                      placeholder="000.00XX.00"
                      className="not-italic font-bold"
                      style={{ fontStyle: 'normal', fontFamily: '"Times New Roman", serif' }}
                    />
                  </span>
                </h3>
              </div>

              {/* Main Content */}
              <div style={mainTextStyle}>
                <p className="mb-3 pl-8">
                  We, President, Secretary and Members of the Jury responsible for conducting the examinations, <span className="italic">of{' '}
                    <EditableField
                      value={diplomaData.degree}
                      onChange={(value) => handleFieldChange('degree', value)}
                      style={underlineFieldStyle}
                      isEditable={isEditable}
                      placeholder="degree level"
                    />
                  </span>{' '}option: <span className="italic">
                    <EditableField
                      value={diplomaData.orientation}
                      onChange={(value) => handleFieldChange('orientation', value)}
                      style={underlineFieldStyle}
                      isEditable={isEditable}
                      placeholder="orientation"
                    />
                  </span>
                </p>

                <p className="mb-3 pl-8">
                  Whereas the named{' '}
                  <EditableField
                    value={diplomaData.studentName}
                    onChange={(value) => handleFieldChange('studentName', value)}
                    style={{ ...underlineFieldStyle, fontWeight: 'bold', minWidth: '200px' }}
                    isEditable={isEditable}
                    placeholder="STUDENT FULL NAME"
                    className="uppercase"
                  />{' '}born in{' '}
                  <EditableField
                    value={diplomaData.birthPlace}
                    onChange={(value) => handleFieldChange('birthPlace', value)}
                    style={underlineFieldStyle}
                    isEditable={isEditable}
                    placeholder="birthplace"
                  />{' '}on{' '}
                  <EditableField
                    value={diplomaData.birthDate}
                    onChange={(value) => handleFieldChange('birthDate', value)}
                    style={underlineFieldStyle}
                    isEditable={isEditable}
                    placeholder="birth date"
                  />
                </p>

                <p className="mb-3 pl-8">
                  holds a diploma <span>granting access to higher education and university</span> in <span>
                    <EditableField
                      value={diplomaData.specialization}
                      onChange={(value) => handleFieldChange('specialization', value)}
                      style={underlineFieldStyle}
                      isEditable={isEditable}
                      placeholder="specialization"
                    />
                  </span>{' '}and certificate(s) of achievement in <span className="italic">
                    <EditableField
                      value={diplomaData.degree}
                      onChange={(value) => handleFieldChange('degree', value)}
                      style={underlineFieldStyle}
                      isEditable={isEditable}
                      placeholder="degree"
                    />
                  </span>{' '}option{' '}
                  <EditableField
                    value={diplomaData.orientation}
                    onChange={(value) => handleFieldChange('orientation', value)}
                    style={underlineFieldStyle}
                    isEditable={isEditable}
                    placeholder="orientation"
                  />{' '}orientation
                </p>

                <p className="mb-3 pl-8">
                  Whereas he/she has regularly attended courses and practical exercises, completed on{' '}
                  <EditableField
                    value={diplomaData.completionDate}
                    onChange={(value) => handleFieldChange('completionDate', value)}
                    style={underlineFieldStyle}
                    isEditable={isEditable}
                    placeholder="completion date"
                  />{' '}and has taken the examinations prescribed in the program of{' '}
                  <EditableField
                    value={diplomaData.graduationYear}
                    onChange={(value) => handleFieldChange('graduationYear', value)}
                    style={underlineFieldStyle}
                    isEditable={isEditable}
                    placeholder="graduation term"
                  />
                </p>

                <p className="mb-3 pl-8">
                  Have conferred and do confer upon{' '}
                  <EditableField
                    value={diplomaData.studentName}
                    onChange={(value) => handleFieldChange('studentName', value)}
                    style={{ ...underlineFieldStyle, fontWeight: 'bold' }}
                    isEditable={isEditable}
                    placeholder="STUDENT NAME"
                    className="uppercase"
                  />
                </p>

                {/* Grade Section - Left aligned */}
                <p className="mb-4 pl-8 text-sm sm:text-base">
                  the degree of{' '}
                  <EditableField
                    value={diplomaData.gradeLevel}
                    onChange={(value) => handleFieldChange('gradeLevel', value)}
                    isEditable={isEditable}
                    placeholder="GRADE LEVEL"
                    className="text-sm sm:text-base font-bold"
                  />
                  {' '}option{' '}
                  <EditableField
                    value={diplomaData.option}
                    onChange={(value) => handleFieldChange('option', value)}
                    isEditable={isEditable}
                    placeholder="option"
                    className="italic"
                  />
                  {' '}orientation:{' '}
                  <EditableField
                    value={diplomaData.orientationDetail}
                    onChange={(value) => handleFieldChange('orientationDetail', value)}
                    isEditable={isEditable}
                    placeholder=""
                    style={underlineFieldStyle}
                  />
                </p>

                <p className="mb-3 pl-8">
                  In witness whereof, we have issued this diploma, attesting that at the same time he/she 
                  has regularly attended the courses and practical exercises provided in the program and that all 
                  legal and statutory requirements have been observed.
                </p>
              </div>

              {/* Signatures Section */}
              <div className="mt-6">
                {/* Stamp in center */}
                <img
                  src="/stamp.png"
                  alt="Official Stamp"
                  style={{
                    width: screenWidth < 640 ? '140px' : '170px',
                    height: screenWidth < 640 ? '140px' : '170px',
                    objectFit: 'contain',
                    position: 'absolute',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    top: screenWidth < 640 ? 'calc(100% - 160px)' : 'calc(100% - 175px)',
                    zIndex: 10,
                    opacity: 0.7
                  }}
                />

                <p className="mb-1 pl-8 text-xs sm:text-sm font-bold">
                  IN THE NAME OF THE PRESIDENT OF THE REPUBLIC,
                </p>

                {/* Official attestation text */}
                <p className="mb-2 pl-8 text-xs sm:text-sm">
                  We, President, Secretary and Member of the Endorsement Commission, certify that this diploma has been duly issued and that all conditions prescribed by Congolese legislation relating to the conferral of academic degrees have been observed.
                </p>

                {/* Registration and validation text */}
                <p className="mb-5 pl-8 text-xs sm:text-sm">
                  In witness whereof we have endorsed it on{' '}
                  <EditableField
                    value={diplomaData.registrationDate}
                    onChange={(value) => handleFieldChange('registrationDate', value)}
                    style={underlineFieldStyle}
                    isEditable={isEditable}
                    placeholder="registration date"
                  />
                  {' '}and registered under number{' '}
                  <EditableField
                    value={diplomaData.registrationNumber}
                    onChange={(value) => handleFieldChange('registrationNumber', value)}
                    style={underlineFieldStyle}
                    isEditable={isEditable}
                    placeholder="1467"
                  />
                  {' '}folio{' '}
                  <EditableField
                    value={diplomaData.serialCode}
                    onChange={(value) => handleFieldChange('serialCode', value)}
                    style={underlineFieldStyle}
                    isEditable={isEditable}
                    placeholder="XXX"
                  />
                  {' '}in register{' '}
                  <EditableField
                    value={diplomaData.registerLetter}
                    onChange={(value) => handleFieldChange('registerLetter', value)}
                    style={underlineFieldStyle}
                    isEditable={isEditable}
                    placeholder="M"
                  />
                  .
                </p>

                {/* Issue Location and Date */}
                <div className="text-center text-xs sm:text-sm mb-4">
                  <p>
                    Done at{' '}
                    <EditableField
                      value={diplomaData.issueLocation}
                      onChange={(value) => handleFieldChange('issueLocation', value)}
                      style={underlineFieldStyle}
                      isEditable={isEditable}
                      placeholder="location"
                    />
                    , on{' '}
                    <EditableField
                      value={diplomaData.issueDate}
                      onChange={(value) => handleFieldChange('issueDate', value)}
                      style={underlineFieldStyle}
                      isEditable={isEditable}
                      placeholder="issue date"
                    />
                  </p>
                </div>

                {/* Registration Details */}
                <div className="text-center text-xs sm:text-sm">
                  <p>
                    Registered under number{' '}
                    <EditableField
                      value={diplomaData.registrationNumber}
                      onChange={(value) => handleFieldChange('registrationNumber', value)}
                      style={underlineFieldStyle}
                      isEditable={isEditable}
                      placeholder="0000"
                    />
                    {' '}folio{' '}
                    <EditableField
                      value={diplomaData.serialCode}
                      onChange={(value) => handleFieldChange('serialCode', value)}
                      style={underlineFieldStyle}
                      isEditable={isEditable}
                      placeholder="XXX"
                    />
                  </p>
                  <p className="mt-1">
                    Issued on{' '}
                    <EditableField
                      value={diplomaData.registrationDate}
                      onChange={(value) => handleFieldChange('registrationDate', value)}
                      style={underlineFieldStyle}
                      isEditable={isEditable}
                      placeholder="registration date"
                    />
                  </p>
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
                    size={screenWidth < 640 ? 60 : 80}
                    className="print-visible"
                  />
                  <div style={{
                    fontSize: screenWidth < 640 ? '8px' : '10px',
                    color: '#000',
                    textAlign: 'center',
                    fontWeight: 'bold'
                  }}>
                    Verify Document
                  </div>
                </div>
              )}

              {/* Translation Note - Centered at Bottom */}
              <div style={{
                textAlign: 'center',
                fontSize: screenWidth < 640 ? '9px' : '11px',
                color: '#000',
                marginTop: '20px',
                fontStyle: 'italic',
                paddingBottom: '10px'
              }}>
                <strong>NB:</strong> This document was translated with Nyota Translation Center
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BachelorDiplomaTemplate;
