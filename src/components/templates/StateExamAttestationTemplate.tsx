import React, { useEffect, useState } from 'react';
import { QRCodeComponent } from '../common';

// Editable Field Component for State Exam Attestation
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
        className={`bg-transparent border-none outline-none ${className}`}
        style={{
          ...style,
          width: 'auto',
          minWidth: '20px',
          maxWidth: '100%',
          display: 'inline-block',
          borderBottom: '1.5px solid #333',
          padding: '1px 2px',
          margin: '0 4px',
          fontFamily: '"Courier New", monospace',
          fontWeight: 'bold'
        }}
        placeholder={placeholder}
        autoFocus
      />
    );
  }

  return (
    <span
      className={`${className} ${isEditable ? 'cursor-pointer hover:bg-gray-100 transition-colors duration-150' : ''} ${displayValue ? '' : 'text-gray-400 italic'}`}
      style={style}
      onClick={() => isEditable && setIsEditing(true)}
      title={isEditable ? 'Click to edit' : ''}
    >
      {displayValue || (isEditable ? 'Click to edit' : placeholder)}
    </span>
  );
};

export interface StateExamAttestationData {
  attestationNumber: string;
  studentName: string;
  birthPlace: string;
  birthDate: {
    day: string;
    month: string;
    year: string;
  };
  schoolName: string;
  schoolCode: string;
  examSession: string;
  section: string;
  option: string;
  percentage: string;
  issuePlace: string;
  issueDate: {
    day: string;
    month: string;
    year: string;
  };
  validUntil: {
    day: string;
    month: string;
    year: string;
  };
  showValidUntil?: boolean; // Optional field to control visibility
  inspectorName: string;
}

interface StateExamAttestationTemplateProps {
  data?: StateExamAttestationData;
  isEditable?: boolean;
  onDataChange?: (updatedData: StateExamAttestationData) => void;
  documentId?: string;
}

const StateExamAttestationTemplate: React.FC<StateExamAttestationTemplateProps> = ({ 
  data, 
  isEditable = false, 
  onDataChange,
  documentId: propDocumentId
}) => {
  const defaultData: StateExamAttestationData = {
    attestationNumber: "N°000000000/2021",
    studentName: "STUDENT NAME",
    birthPlace: "BIRTHPLACE",
    birthDate: {
      day: "01",
      month: "01",
      year: "2003"
    },
    schoolName: "SCHOOL NAME",
    schoolCode: "000000000000",
    examSession: "2021",
    section: "TECHNICAL",
    option: "COMMERCIAL AND MANAGEMENT",
    percentage: "56",
    issuePlace: "KINSHASA",
    issueDate: {
      day: "21",
      month: "10",
      year: "2021"
    },
    validUntil: {
      day: "21",
      month: "02",
      year: "2022"
    },
    inspectorName: "INSPECTOR NAME"
  };

  const [pdfData, setPdfData] = useState<StateExamAttestationData | null>(null);
  const [currentData, setCurrentData] = useState<StateExamAttestationData>(defaultData);
  const [screenWidth, setScreenWidth] = useState<number>(typeof window !== 'undefined' ? window.innerWidth : 1024);
  const [documentId, setDocumentId] = useState<string>(propDocumentId || '');

  useEffect(() => {
    if (propDocumentId && propDocumentId !== documentId) {
      setDocumentId(propDocumentId);
    }
  }, [propDocumentId, documentId]);

  useEffect(() => {
    const newData = pdfData || data || defaultData;
    setCurrentData(newData);
  }, [pdfData, data, defaultData]);

  useEffect(() => {
    const handleResize = () => {
      setScreenWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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

  const handleFieldChange = (field: keyof StateExamAttestationData | string, value: string) => {
    setCurrentData(prevData => {
      const updatedData = { ...prevData };
      
      if (field.startsWith('birthDate.')) {
        const dateField = field.split('.')[1] as 'day' | 'month' | 'year';
        updatedData.birthDate = {
          ...updatedData.birthDate,
          [dateField]: value
        };
      } else if (field.startsWith('issueDate.')) {
        const dateField = field.split('.')[1] as 'day' | 'month' | 'year';
        updatedData.issueDate = {
          ...updatedData.issueDate,
          [dateField]: value
        };
      } else if (field.startsWith('validUntil.')) {
        const dateField = field.split('.')[1] as 'day' | 'month' | 'year';
        updatedData.validUntil = {
          ...updatedData.validUntil,
          [dateField]: value
        };
      } else {
        (updatedData as any)[field] = value;
      }
      
      // Call onDataChange with the updated data
      if (onDataChange) {
        onDataChange(updatedData);
      }
      
      return updatedData;
    });
  };

  // Helper function to handle date field changes (for combined date inputs)
  const handleDateFieldChange = (dateType: 'birthDate' | 'issueDate' | 'validUntil', value: string) => {
    setCurrentData(prevData => {
      const parts = value.split('/');
      const updatedData = { ...prevData };
      
      if (parts.length === 3) {
        updatedData[dateType] = {
          day: parts[0].padStart(2, '0'),
          month: parts[1].padStart(2, '0'),
          year: parts[2].padStart(4, '0')
        };
        
        // Call onDataChange with the complete updated data
        if (onDataChange) {
          onDataChange(updatedData);
        }
        
        return updatedData;
      }
      
      return prevData;
    });
  };

  useEffect(() => {
    // Auto-resize header text based on flag height (similar to State Diploma)
    const adjustHeaderSizes = () => {
      const flagElement = document.getElementById('attestation-flag');
      if (flagElement) {
        const flagHeight = flagElement.clientHeight;
        const mainTitle = document.getElementById('attestation-main-title');
        const subTitle = document.getElementById('attestation-sub-title');
        const attestationTitle = document.getElementById('attestation-title');
        
        if (mainTitle) mainTitle.style.fontSize = `${flagHeight * 0.32}px`;
        if (subTitle) subTitle.style.fontSize = `${flagHeight * 0.32}px`;
        if (attestationTitle) attestationTitle.style.fontSize = `${flagHeight * 0.56}px`;
      }
    };

    // Adjust on load and resize
    const timer = setTimeout(adjustHeaderSizes, 100);
    window.addEventListener('resize', adjustHeaderSizes);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', adjustHeaderSizes);
    };
  }, []);

  const containerStyle: React.CSSProperties = {
    maxWidth: screenWidth < 640 ? '100%' : '1140px',
    width: '100%',
    aspectRatio: screenWidth < 640 ? 'auto' : '4/3',
    margin: '0 auto',
    backgroundColor: '#f8f5e3',
    boxShadow: '0 0 30px rgba(0, 0, 0, 0.15)',
    fontFamily: '"Times New Roman", serif',
    lineHeight: 1.5,
    position: 'relative',
    minHeight: screenWidth < 640 ? 'auto' : undefined,
  };

  const borderWrapperStyle: React.CSSProperties = {
    padding: screenWidth < 640 ? '8px' : '15px',
    background: 'repeating-linear-gradient(45deg, #4a90e2, #4a90e2 15px, #6ba5e7 15px, #6ba5e7 25px)',
    width: '100%',
    height: '100%',
    boxSizing: 'border-box',
  };

  const contentStyle: React.CSSProperties = {
    padding: screenWidth < 640 ? '8px 12px' : '10px 30px',
    background: '#f8f5e3',
    position: 'relative',
    height: '100%',
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
  };

  const infoFieldStyle: React.CSSProperties = {
    borderBottom: '1.5px solid #333',
    padding: '1px 2px',
    margin: '0 4px',
    fontFamily: '"Courier New", monospace',
    fontWeight: 'bold',
    fontSize: screenWidth < 640 ? '13px' : '16px',
  };

  return (
    <div className="w-full overflow-x-auto">
      <div className="min-w-full sm:min-w-0">
        <div id="state-exam-attestation-template" data-testid="state-exam-attestation-template" style={containerStyle}>
          <div style={borderWrapperStyle}>
            <div style={contentStyle}>
              {/* Header */}
              <div className="flex items-start justify-between mb-3 sm:mb-6">
                {/* Flag Left */}
                <img
                  id="attestation-flag"
                  src="/flag.png"
                  alt="DRC Flag"
                  className="h-12 sm:h-20 object-contain flex-shrink-0"
                />

                {/* Center titles */}
                <div className="flex-1 text-center px-2 sm:px-6 min-w-0">
                  <h1
                    id="attestation-main-title"
                    className="font-serif font-bold uppercase tracking-wide sm:tracking-widest leading-tight text-xs sm:text-base"
                  >
                    DEMOCRATIC REPUBLIC OF THE CONGO
                  </h1>
                  <h2
                    id="attestation-sub-title"
                    className="font-serif uppercase text-gray-700 leading-tight sm:leading-snug mt-1 text-xs sm:text-sm"
                  >
                    MINISTRY OF PRIMARY, SECONDARY<br />
                    AND TECHNICAL EDUCATION
                  </h2>
                  <h3 className="font-serif uppercase text-gray-700 leading-tight text-xs sm:text-sm mt-1">
                    GENERAL INSPECTION
                  </h3>
                  <h3
                    id="attestation-title"
                    className="font-serif font-bold uppercase tracking-wide sm:tracking-wider leading-tight sm:leading-none mt-1 sm:mt-2 text-sm sm:text-lg"
                  >
                    STATE EXAMINATION
                  </h3>
                  <h4 className="font-serif font-bold uppercase text-xs sm:text-base mt-1" style={{ display: 'inline-block' }}>
                    PROVISIONAL PASS CERTIFICATE{' '}
                    <span style={{ 
                      fontFamily: '"Courier New", monospace',
                      letterSpacing: '0.5px',
                      textTransform: 'uppercase',
                      display: 'inline-block'
                    }}>
                      <EditableField
                        value={attestationData.attestationNumber.toUpperCase()}
                        onChange={(value) => handleFieldChange('attestationNumber', value.toUpperCase())}
                        isEditable={isEditable}
                        placeholder="N°000000000/2021"
                      />
                    </span>
                  </h4>
                  <p className="text-xs italic" style={{ fontSize: screenWidth < 640 ? '8px' : '10px', marginTop: '2px' }}>
                    In accordance with the provisions of Article 46 of Ministerial Decree N° MINEPSP/CABMIN/0040/2004
                  </p>
                </div>

                {/* Coat of arms Right */}
                <img
                  id="attestation-coat"
                  src="/Coat.png"
                  alt="DRC Coat of Arms"
                  className="h-12 sm:h-20 object-contain flex-shrink-0"
                />
              </div>

              {/* Main Content */}
              <div style={{ fontSize: screenWidth < 640 ? '11px' : '14px', textAlign: 'justify', color: '#333' }}>
                <p style={{ marginBottom: screenWidth < 640 ? '6px' : '10px' }}>
                  I, THE UNDERSIGNED{' '}
                  <EditableField
                    value={attestationData.inspectorName}
                    onChange={(value) => handleFieldChange('inspectorName', value)}
                    style={infoFieldStyle}
                    isEditable={isEditable}
                    placeholder="INSPECTOR NAME"
                  />, INSPECTOR GENERAL OF PRIMARY, SECONDARY AND TECHNICAL EDUCATION AD INTERIM IN THE DEMOCRATIC REPUBLIC OF THE CONGO, HEREBY CERTIFY
                </p>

                <div style={{ marginBottom: screenWidth < 640 ? '6px' : '10px' }}>
                  <div style={{ marginBottom: '4px', display: 'flex', alignItems: 'center', flexWrap: 'nowrap' }}>
                    <span style={{ whiteSpace: 'nowrap' }}>THAT THE NAMED</span>
                    <EditableField
                      value={attestationData.studentName}
                      onChange={(value) => handleFieldChange('studentName', value)}
                      style={{...infoFieldStyle, flex: 1, minWidth: '200px'}}
                      isEditable={isEditable}
                      placeholder="STUDENT NAME"
                    />
                  </div>
                  <div style={{ marginBottom: '4px', display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '4px' }}>
                    <span style={{ whiteSpace: 'nowrap' }}>BORN IN</span>
                    <EditableField
                      value={attestationData.birthPlace}
                      onChange={(value) => handleFieldChange('birthPlace', value)}
                      style={{...infoFieldStyle, flex: 1, minWidth: '150px'}}
                      isEditable={isEditable}
                      placeholder="BIRTHPLACE"
                    />
                    <span style={{ whiteSpace: 'nowrap' }}>ON</span>
                    <EditableField
                      value={`${attestationData.birthDate.day}/${attestationData.birthDate.month}/${attestationData.birthDate.year}`}
                      onChange={(value) => handleDateFieldChange('birthDate', value)}
                      style={{...infoFieldStyle, flex: 1, minWidth: '100px', fontFamily: '"Courier New", monospace'}}
                      isEditable={isEditable}
                      placeholder="02/10/2003"
                    />
                  </div>
                </div>

                <p style={{ marginBottom: screenWidth < 640 ? '6px' : '10px' }}>
                  <span>FINALIST AT (FROM) (OF) </span>
                  <EditableField
                    value={attestationData.schoolName}
                    onChange={(value) => handleFieldChange('schoolName', value)}
                    style={infoFieldStyle}
                    isEditable={isEditable}
                    placeholder="SCHOOL NAME"
                  />
                  <span> CODE </span>
                  <EditableField
                    value={attestationData.schoolCode}
                    onChange={(value) => handleFieldChange('schoolCode', value)}
                    style={infoFieldStyle}
                    isEditable={isEditable}
                    placeholder="000000000000"
                  />
                </p>

                <div style={{ marginBottom: screenWidth < 640 ? '6px' : '10px', display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '4px' }}>
                  <span style={{ whiteSpace: 'nowrap' }}>PASSED THE STATE EXAMINATION SESSION</span>
                  <EditableField
                    value={attestationData.examSession}
                    onChange={(value) => handleFieldChange('examSession', value)}
                    style={{...infoFieldStyle, minWidth: '60px'}}
                    isEditable={isEditable}
                    placeholder="2021"
                  />
                  <span>, IN</span>
                  <EditableField
                    value={attestationData.section}
                    onChange={(value) => handleFieldChange('section', value)}
                    style={{...infoFieldStyle, flex: 1, minWidth: '120px'}}
                    isEditable={isEditable}
                    placeholder="TECHNICAL"
                  />
                  <span style={{ whiteSpace: 'nowrap' }}>SECTION</span>
                </div>

                <div style={{ marginBottom: screenWidth < 640 ? '6px' : '10px', display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '4px' }}>
                  <span>OPTION</span>
                  <EditableField
                    value={attestationData.option}
                    onChange={(value) => handleFieldChange('option', value)}
                    style={{...infoFieldStyle, flex: 1, minWidth: '200px'}}
                    isEditable={isEditable}
                    placeholder="COMMERCIAL AND MANAGEMENT"
                  />
                  <span>WITH</span>
                  <EditableField
                    value={attestationData.percentage}
                    onChange={(value) => handleFieldChange('percentage', value)}
                    style={{...infoFieldStyle, minWidth: '40px'}}
                    isEditable={isEditable}
                    placeholder="56"
                  />
                  <span style={{ whiteSpace: 'nowrap' }}>% OF THE POINTS AND THAT, THEREFORE, HE/SHE IS</span>
                </div>

                <p style={{ marginBottom: screenWidth < 640 ? '8px' : '12px' }}>
                  DECLARED FIT TO PURSUE HIGHER STUDIES OR UNIVERSITY STUDIES BOTH IN THE DEMOCRATIC REPUBLIC OF THE CONGO AND ABROAD.
                </p>

                <p style={{ marginBottom: screenWidth < 640 ? '8px' : '12px' }}>
                  THIS PRESENT IS ISSUED TO SERVE AND BE VALID AS OF RIGHT PENDING THE ISSUANCE OF DIPLOMAS FOR ALL GRADUATES OF THE AFOREMENTIONED SESSION.
                </p>

                {/* Issue Date and Location */}
                <div style={{ margin: screenWidth < 640 ? '10px 0' : '15px 0' }}>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    marginBottom: '4px',
                    flexWrap: 'wrap',
                    fontSize: screenWidth < 640 ? '11px' : '14px'
                  }}>
                    <span style={{ fontWeight: 'bold', marginRight: '8px' }}>DELIVERED SINCERELY AND EXACTLY</span>
                  </div>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    flexWrap: 'wrap',
                    gap: '4px',
                    fontSize: screenWidth < 640 ? '11px' : '14px'
                  }}>
                    <span>AT</span>
                    <EditableField
                      value={attestationData.issuePlace}
                      onChange={(value) => handleFieldChange('issuePlace', value)}
                      style={{...infoFieldStyle, minWidth: '120px'}}
                      isEditable={isEditable}
                      placeholder="KINSHASA"
                    />
                    <span>, ON</span>
                    <EditableField
                      value={`${attestationData.issueDate.day}/${attestationData.issueDate.month}/${attestationData.issueDate.year}`}
                      onChange={(value) => handleDateFieldChange('issueDate', value)}
                      style={{...infoFieldStyle, minWidth: '100px', fontFamily: '"Courier New", monospace'}}
                      isEditable={isEditable}
                      placeholder="21/10/2021"
                    />
                  </div>

                  {/* VALID UNTIL Section - Conditionally rendered */}
                  {attestationData.showValidUntil !== false && (
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      marginTop: '8px',
                      flexWrap: 'wrap',
                      gap: '4px',
                      fontSize: screenWidth < 640 ? '10px' : '12px'
                    }}>
                      <span>VALID UNTIL</span>
                      <EditableField
                        value={`${attestationData.validUntil.day}/${attestationData.validUntil.month}/${attestationData.validUntil.year}`}
                        onChange={(value) => handleDateFieldChange('validUntil', value)}
                        style={{...infoFieldStyle, minWidth: '100px', fontFamily: '"Courier New", monospace'}}
                        isEditable={isEditable}
                        placeholder="21/02/2022"
                      />
                    </div>
                  )}
                </div>

                {/* Toggle for VALID UNTIL visibility */}
                {isEditable && (
                  <div style={{
                    marginTop: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    fontSize: '12px',
                    padding: '8px',
                    backgroundColor: '#f3f4f6',
                    borderRadius: '6px'
                  }}>
                    <input
                      type="checkbox"
                      id="showValidUntil"
                      checked={attestationData.showValidUntil !== false}
                      onChange={(e) => {
                        const updatedData = { ...attestationData, showValidUntil: e.target.checked };
                        setCurrentData(updatedData);
                        onDataChange?.(updatedData);
                      }}
                      style={{
                        cursor: 'pointer',
                        width: '16px',
                        height: '16px'
                      }}
                    />
                    <label 
                      htmlFor="showValidUntil" 
                      style={{ 
                        cursor: 'pointer',
                        fontWeight: '500',
                        color: '#374151'
                      }}
                    >
                      Show "VALID UNTIL" field
                    </label>
                  </div>
                )}

                {/* Signatures Section */}
                <div style={{ margin: screenWidth < 640 ? '15px 0' : '20px 0', position: 'relative' }}>
                  <img
                    src="/stamp.png"
                    alt="Official Stamp"
                    style={{
                      width: screenWidth < 640 ? '100px' : '150px',
                      height: screenWidth < 640 ? '100px' : '150px',
                      objectFit: 'contain',
                      position: 'absolute',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      top: screenWidth < 640 ? '-65px' : '-85px',
                      zIndex: 10
                    }}
                  />
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'center',
                    alignItems: 'flex-start',
                    flexDirection: screenWidth < 640 ? 'column' : 'row',
                    gap: screenWidth < 640 ? '15px' : '40px',
                    textAlign: 'center',
                    fontSize: screenWidth < 640 ? '12px' : '15px'
                  }}>
                    <div style={{ width: screenWidth < 640 ? '100%' : 'auto' }}>
                      <div style={{
                        minWidth: screenWidth < 640 ? '150px' : '250px',
                        height: screenWidth < 640 ? '25px' : '30px',
                        margin: '0 auto 5px auto',
                        borderBottom: '1px solid #333',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        paddingLeft: '10px',
                        paddingRight: '10px'
                      }}>
                        <EditableField
                          value={attestationData.inspectorName}
                          onChange={(value) => handleFieldChange('inspectorName', value)}
                          isEditable={isEditable}
                          placeholder="INSPECTOR NAME"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* QR Code for Verification */}
                {documentId && (
                  <div style={{
                    position: 'absolute',
                    bottom: '20px',
                    right: '20px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '4px'
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

                {/* Footer */}
                <div style={{
                  textAlign: 'center',
                  marginTop: screenWidth < 640 ? '15px' : '20px',
                  paddingTop: '4px',
                  fontSize: screenWidth < 640 ? '10px' : '12px',
                  fontStyle: 'italic'
                }}>
                  <p>General Inspection of Primary, Secondary and Technical Education</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StateExamAttestationTemplate;
