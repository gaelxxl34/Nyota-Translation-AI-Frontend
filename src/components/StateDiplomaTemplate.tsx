import React, { useEffect, useState } from 'react';
import QRCodeComponent from './QRCodeComponent';

// Editable Field Component for State Diploma
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

  // Update temp value when value prop changes
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
        className={`w-full h-full bg-yellow-100 border-2 border-blue-400 outline-none rounded-sm px-1 ${className}`}
        style={style}
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
      {displayValue || (isEditable ? 'Click to edit' : placeholder)}
    </span>
  );
};

interface DiplomaData {
  studentName: string;
  gender: 'male' | 'female' | string;
  birthPlace: string;
  birthDate: {
    day: string;
    month: string;
    year: string;
  };
  examSession: string;
  percentage: string;
  percentageText: string;
  section: string;
  option: string;
  issueDate: string;
  serialNumbers: string[];
  serialCode: string;
}

interface StateDiplomaTemplateProps {
  data?: DiplomaData;
  isEditable?: boolean;
  onDataChange?: (updatedData: DiplomaData) => void;
  documentId?: string; // Allow passing document ID from parent
}

const StateDiplomaTemplate: React.FC<StateDiplomaTemplateProps> = ({ 
  data, 
  isEditable = false, 
  onDataChange,
  documentId: propDocumentId // Accept documentId as prop
}) => {
  // Create default empty data if no data is provided
  const defaultData: DiplomaData = {
    studentName: "STUDENT NAME",
    gender: "male",
    birthPlace: "BIRTHPLACE",
    birthDate: {
      day: "01",
      month: "01",
      year: "2000"
    },
    examSession: "JUNE 2023",
    percentage: "00.0%",
    percentageText: "PERCENTAGE IN WORDS",
    section: "SECTION NAME",
    option: "OPTION NAME",
    issueDate: "JANUARY 1, 2023",
    serialNumbers: ['T', 'S', '0', '7', '5', '2', '0', '7', '2', '4', '0', '7', '0', '3', '7', '0', '7', '0'], // First 4 (TS 07) + 14 individual boxes
    serialCode: "3564229"
  };

  // State for PDF generation mode data
  const [pdfData, setPdfData] = useState<DiplomaData | null>(null);
  // State for current working data 
  const [currentData, setCurrentData] = useState<DiplomaData>(defaultData);
  // State for screen width to handle responsiveness
  const [screenWidth, setScreenWidth] = useState<number>(typeof window !== 'undefined' ? window.innerWidth : 1024);
  // State for document ID and QR code
  const [documentId, setDocumentId] = useState<string>(propDocumentId || '');
  
  console.log('🔍 StateDiplomaTemplate - propDocumentId:', propDocumentId, 'documentId state:', documentId);

  // Update document ID when prop changes
  useEffect(() => {
    if (propDocumentId && propDocumentId !== documentId) {
      console.log('🔄 StateDiplomaTemplate - Setting prop documentId:', propDocumentId);
      setDocumentId(propDocumentId);
    }
  }, [propDocumentId, documentId]);

  // Update current data when props change
  useEffect(() => {
    let newData = pdfData || data || defaultData;
    
    console.log('🔍 StateDiploma - Raw incoming data:', { 
      serialNumbers: newData.serialNumbers,
      serialNumbersType: typeof newData.serialNumbers,
      isArray: Array.isArray(newData.serialNumbers),
      serialCode: newData.serialCode 
    });
    
    // Normalize serialNumbers: convert string to array if needed
    if (newData.serialNumbers) {
      if (typeof newData.serialNumbers === 'string') {
        // Convert string to array of characters, removing spaces
        const cleanString = (newData.serialNumbers as string).replace(/\s+/g, '');
        console.log('📝 Converting string to array:', cleanString);
        newData = {
          ...newData,
          serialNumbers: cleanString.split('').slice(0, 18) // Take first 18 characters
        };
      } else if (Array.isArray(newData.serialNumbers) && newData.serialNumbers.length < 18) {
        // Pad array to 18 elements if too short
        console.log('📝 Padding array from', newData.serialNumbers.length, 'to 18');
        const paddedArray = [...newData.serialNumbers];
        while (paddedArray.length < 18) {
          paddedArray.push('0');
        }
        newData = {
          ...newData,
          serialNumbers: paddedArray
        };
      }
    }
    
    console.log('✅ StateDiploma - Final normalized data:', { 
      serialNumbers: newData.serialNumbers,
      serialNumbersLength: newData.serialNumbers?.length 
    });
    
    // Update data when props change or PDF data arrives
    setCurrentData(newData);
  }, [pdfData, data, defaultData]);

  // Handle window resize for responsiveness
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
      // PDF data received via custom event
      setPdfData(event.detail);
    };

    // Check if we're in PDF generation mode and data is already available
    if (typeof window !== 'undefined' && (window as any).isPdfGenerationMode && (window as any).pdfDiplomaData) {
      // Using existing PDF diploma data from window
      setPdfData((window as any).pdfDiplomaData);
    }

    // Listen for the PDF data ready event
    window.addEventListener('pdf-data-ready', handlePdfDataReady);

    return () => {
      window.removeEventListener('pdf-data-ready', handlePdfDataReady);
    };
  }, []);

  // Use PDF data if available, otherwise use provided data or fallback to default
  const diplomaData = currentData;

  // Log the data being used for rendering
  useEffect(() => {
    // Data ready for rendering
  }, [diplomaData, pdfData, data]);

  // Handle field changes for editing
  const handleFieldChange = (field: keyof DiplomaData | string, value: string) => {
    // Handle field changes for editing
    
    // Handle percentage field updates
    
    const updatedData = { ...diplomaData };
    
    // Handle nested birth date object
    if (field.startsWith('birthDate.')) {
      const dateField = field.split('.')[1] as 'day' | 'month' | 'year';
      updatedData.birthDate = {
        ...updatedData.birthDate,
        [dateField]: value
      };
    } else {
      (updatedData as any)[field] = value;
    }
    
    // Update local state immediately for UI reactivity
    setCurrentData(updatedData);
    
    // Call parent handler for Firestore saving
    if (onDataChange) {
      onDataChange(updatedData);
    } else {
      console.warn('⚠️ No onDataChange handler provided for field update:', field);
    }
  };
  useEffect(() => {
    // Auto-resize header text based on flag height (similar to original JS)
    const adjustHeaderSizes = () => {
      const flagElement = document.getElementById('diploma-flag');
      if (flagElement) {
        const flagHeight = flagElement.clientHeight;
        const mainTitle = document.getElementById('diploma-main-title');
        const subTitle = document.getElementById('diploma-sub-title');
        const diplomaTitle = document.getElementById('diploma-title');
        
        if (mainTitle) mainTitle.style.fontSize = `${flagHeight * 0.32}px`; //  now 0.32  
        if (subTitle) subTitle.style.fontSize = `${flagHeight * 0.32}px`; // now 0.32   
        if (diplomaTitle) diplomaTitle.style.fontSize = `${flagHeight * 0.56}px`; // now 0.56
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

  // Define responsive styles as objects for better TypeScript support
  const diplomaContainerStyle: React.CSSProperties = {
    maxWidth: screenWidth < 640 ? '100%' : '1140px', // Full width on mobile
    width: '100%',
    aspectRatio: screenWidth < 640 ? 'auto' : '4/3', // Auto height on mobile
    margin: '0 auto',
    backgroundColor: '#f8f5e3',
    boxShadow: '0 0 30px rgba(0, 0, 0, 0.15)',
    fontFamily: '"Times New Roman", serif',
    lineHeight: 1.5,
    position: 'relative',
    minHeight: screenWidth < 640 ? 'auto' : undefined, // Allow content to dictate height on mobile
  };

  // PDF-friendly gradient border using pseudo-elements and background
  const borderWrapperStyle: React.CSSProperties = {
    padding: screenWidth < 640 ? '8px' : '15px', // Smaller padding on mobile
    background: 'repeating-linear-gradient(45deg, #ff6b6b, #ff6b6b 15px, #ff8a8a 15px, #ff8a8a 25px)',
    width: '100%',
    height: '100%',
    boxSizing: 'border-box',
  };

  const diplomaContentStyle: React.CSSProperties = {
    padding: screenWidth < 640 ? '8px 12px' : '10px 30px', // Smaller padding on mobile
    background: '#f8f5e3',
    position: 'relative',
    height: '100%',
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
  };

  const mainTextStyle: React.CSSProperties = {
    textAlign: 'justify',
    color: '#333',
    fontSize: screenWidth < 640 ? '11px' : '14px', // Smaller font on mobile
    lineHeight: 1.5,
  };

  const infoLineStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '2px',
    flexWrap: 'wrap',
    fontSize: screenWidth < 640 ? '11px' : '14px', // Smaller font on mobile
  };

  const checkboxStyle: React.CSSProperties = {
    width: screenWidth < 640 ? '12px' : '16px', // Smaller on mobile
    height: screenWidth < 640 ? '12px' : '16px',
    border: '1.5px solid #333',
    marginRight: screenWidth < 640 ? '6px' : '10px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: screenWidth < 640 ? '10px' : '13px',
  };

  const infoFieldStyle: React.CSSProperties = {
    borderBottom: '1.5px solid #333',
    padding: '1px 2px',
    margin: '0 4px',
    fontFamily: '"Courier New", monospace',
    fontWeight: 'bold',
    flex: 1,
    fontSize: screenWidth < 640 ? '14px' : '19px', // Smaller on mobile
  };

  const dateBoxStyle: React.CSSProperties = {
    width: screenWidth < 640 ? '18px' : '22px', // Smaller on mobile
    height: screenWidth < 640 ? '18px' : '22px',
    border: '1px solid #333',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    fontWeight: 'bold',
    fontSize: screenWidth < 640 ? '12px' : '15px',
  };

  const resultBoxStyle: React.CSSProperties = {
    width: screenWidth < 640 ? '20px' : '25px', // Smaller on mobile
    height: screenWidth < 640 ? '20px' : '25px',
    border: '1.5px solid #333',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    fontWeight: 'bold',
    fontSize: screenWidth < 640 ? '12px' : '15px',
  };

  const signatureRowStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '10px',
    alignItems: 'flex-start',
    flexDirection: screenWidth < 640 ? 'column' : 'row', // Stack on mobile
    gap: screenWidth < 640 ? '15px' : '0', // Add gap on mobile
  };

  const signatureBoxStyle: React.CSSProperties = {
    textAlign: 'center',
    fontSize: screenWidth < 640 ? '12px' : '15px', // Smaller on mobile
    width: screenWidth < 640 ? '100%' : '25%', // Full width on mobile
  };

  const photoPlaceholderStyle: React.CSSProperties = {
    width: screenWidth < 640 ? '45px' : '60px', // Smaller on mobile
    height: screenWidth < 640 ? '45px' : '60px',
    border: '2px solid #333',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    margin: '0 auto 4px auto',
  };

  const signatureLineStyle: React.CSSProperties = {
    width: screenWidth < 640 ? '40px' : '50px', // Smaller on mobile
    height: screenWidth < 640 ? '20px' : '25px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: screenWidth < 640 ? '14px' : '17px',
    color: '#333',
    borderBottom: '1px solid #ccc',
  };

  const numberBoxStyle: React.CSSProperties = {
    width: screenWidth < 640 ? '18px' : '24px', // Smaller on mobile
    height: screenWidth < 640 ? '16px' : '20px',
    border: '1px solid #333',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: screenWidth < 640 ? '10px' : '13px',
    fontWeight: 'bold',
  };

  const firstSerialBoxStyle: React.CSSProperties = {
    width: screenWidth < 640 ? '60px' : '80px', // Wider first box for "TS 07"
    height: screenWidth < 640 ? '16px' : '20px',
    border: '1px solid #333',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: screenWidth < 640 ? '10px' : '13px',
    fontWeight: 'bold',
    letterSpacing: '2px'
  };

  const serialCodeBoxStyle: React.CSSProperties = {
    width: screenWidth < 640 ? '90px' : '110px', // Wider for 7-digit code
    height: screenWidth < 640 ? '16px' : '20px',
    border: '1px solid #333',
    color: '#ff6b6b',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: screenWidth < 640 ? '10px' : '12px',
    fontWeight: 'bold',
    letterSpacing: '2px'
  };

  return (
    <div className="w-full overflow-x-auto">
      <div className="min-w-full sm:min-w-0">
        <div id="state-diploma-template" style={diplomaContainerStyle}>
          <div style={borderWrapperStyle}>
            <div style={diplomaContentStyle}>
              {/* Header */}
              <div className="flex items-start justify-between mb-3 sm:mb-6">
                {/* Flag Left */}
                <img
                  id="diploma-flag"
                  src="/flag.png"
                  alt="DRC Flag"
                  className="h-12 sm:h-20 object-contain flex-shrink-0"
                />

                {/* Center titles */}
                <div className="flex-1 text-center px-2 sm:px-6 min-w-0">
                  <h1
                    id="diploma-main-title"
                    className="font-serif font-bold uppercase tracking-wide sm:tracking-widest leading-tight text-xs sm:text-base"
                  >
                    DEMOCRATIC REPUBLIC OF THE CONGO
                  </h1>
                  <h2
                    id="diploma-sub-title"
                    className="font-serif uppercase text-gray-700 leading-tight sm:leading-snug mt-1 text-xs sm:text-sm"
                  >
                    MINISTRY OF PRIMARY, SECONDARY<br />
                    AND TECHNICAL EDUCATION
                  </h2>
                  <h3
                    id="diploma-title"
                    className="font-serif font-bold uppercase tracking-wide sm:tracking-wider leading-tight sm:leading-none mt-1 sm:mt-2 text-sm sm:text-lg"
                  >
                    STATE DIPLOMA
                  </h3>
                </div>

                {/* Coat of arms Right */}
                <img
                  id="diploma-coat"
                  src="/Coat.png"
                  alt="DRC Coat of Arms"
                  className="h-12 sm:h-20 object-contain flex-shrink-0"
                />
              </div>

              {/* Main Content */}              <div style={mainTextStyle}>
                <p style={{ marginBottom: screenWidth < 640 ? '6px' : '10px' }}>
                  WE THE UNDERSIGNED, MEMBERS OF THE JURY FOR THE STATE EXAMINATION
                  FOR THE COMPLETION OF SECONDARY EDUCATION IN THE LONG CYCLE,
                  ESTABLISHED BY ORDINANCE N°. 88-092 OF 07 JULY 1988;
                </p>

                <p style={{ marginBottom: screenWidth < 640 ? '6px' : '10px' }}>
                  HAVING REGARD TO FRAMEWORK LAW N°. 14/004 OF 11 FEBRUARY 2014 ON
                  NATIONAL EDUCATION, PARTICULARLY IN ITS ARTICLES 8, 151 AND 193;
                </p>

                <p style={{ marginBottom: screenWidth < 640 ? '8px' : '13px' }}>
                  HAVING REGARD TO, AS AMENDED AND SUPPLEMENTED TO DATE, MINISTERIAL
                  DECREE N°. MINEPSP/CABMIN/0493/2017 OF 23 MAY 2017 AMENDING AND
                  SUPPLEMENTING MINISTERIAL DECREE N°. MINEPSP/CABMIN/0040/2004 OF 20
                  APRIL 2004 CONCERNING TRANSITIONAL MEASURES RELATING TO THE
                  ORGANISATION OF THE STATE EXAMINATION FOR THE COMPLETION OF
                  SECONDARY EDUCATION IN THE LONG CYCLE,
                </p>

                {/* Student Info */}
                <div style={{ margin: screenWidth < 640 ? '10px 0' : '15px 0' }}>
            <div style={infoLineStyle}>
              <span style={{ marginRight: '6px' }}>
                HEREBY CERTIFY THAT
              </span>
              <div 
                style={checkboxStyle}
                onClick={() => isEditable && handleFieldChange('gender', 'male')}
                className={isEditable ? 'cursor-pointer hover:bg-yellow-100' : ''}
                title={isEditable ? 'Click to select male' : ''}
              >
                {diplomaData.gender === 'male' ? '✓' : ''}
              </div>
              <span style={{ marginRight: '6px' }}>MR.</span>
              <EditableField
                value={diplomaData.studentName}
                onChange={(value) => handleFieldChange('studentName', value)}
                style={{...infoFieldStyle}}
                isEditable={isEditable}
                placeholder="STUDENT NAME"
              />
            </div>
            <div style={infoLineStyle}>
              <span
                style={{
                  marginRight: '6px',
                  
                  visibility: 'hidden'
                }}
              >
                HEREBY CERTIFY THAT
              </span>
              <div 
                style={checkboxStyle}
                onClick={() => isEditable && handleFieldChange('gender', 'female')}
                className={isEditable ? 'cursor-pointer hover:bg-yellow-100' : ''}
                title={isEditable ? 'Click to select female' : ''}
              >
                {diplomaData.gender === 'female' ? '✓' : ''}
              </div>
              <span style={{ marginRight: '6px' }}>MS.</span>
            </div>
            <div style={infoLineStyle}>
              <span>BORN IN</span>                <EditableField
                  value={diplomaData.birthPlace}
                  onChange={(value) => handleFieldChange('birthPlace', value)}
                  style={{...infoFieldStyle, width: screenWidth < 640 ? '180px' : '250px' }}
                  isEditable={isEditable}
                  placeholder="BIRTH PLACE"
                />
                <span style={{ margin: '0 8px' }}>ON</span>
                <div style={{ display: 'flex', gap: screenWidth < 640 ? '2px' : '3px', marginLeft: '8px', flexWrap: 'wrap' }}>
                <EditableField
                  value={diplomaData.birthDate.day[0]}
                  onChange={(value) => {
                    const newDay = value + diplomaData.birthDate.day[1];
                    handleFieldChange('birthDate.day', newDay.substring(0, 2));
                  }}
                  style={dateBoxStyle}
                  isEditable={isEditable}
                  placeholder="0"
                />
                <EditableField
                  value={diplomaData.birthDate.day[1]}
                  onChange={(value) => {
                    const newDay = diplomaData.birthDate.day[0] + value;
                    handleFieldChange('birthDate.day', newDay.substring(0, 2));
                  }}
                  style={dateBoxStyle}
                  isEditable={isEditable}
                  placeholder="0"                  />
                  <div style={{ width: screenWidth < 640 ? '6px' : '10px' }}></div>
                  <EditableField
                    value={diplomaData.birthDate.month[0]}
                    onChange={(value) => {
                      const newMonth = value + diplomaData.birthDate.month[1];
                      handleFieldChange('birthDate.month', newMonth.substring(0, 2));
                    }}
                    style={dateBoxStyle}
                    isEditable={isEditable}
                    placeholder="0"
                  />
                  <EditableField
                    value={diplomaData.birthDate.month[1]}
                    onChange={(value) => {
                      const newMonth = diplomaData.birthDate.month[0] + value;
                      handleFieldChange('birthDate.month', newMonth.substring(0, 2));
                    }}
                    style={dateBoxStyle}
                    isEditable={isEditable}
                    placeholder="0"
                  />
                  <div style={{ width: screenWidth < 640 ? '6px' : '10px' }}></div>
                <EditableField
                  value={diplomaData.birthDate.year[0]}
                  onChange={(value) => {
                    const newYear = value + diplomaData.birthDate.year.substring(1);
                    handleFieldChange('birthDate.year', newYear.substring(0, 4));
                  }}
                  style={dateBoxStyle}
                  isEditable={isEditable}
                  placeholder="0"
                />
                <EditableField
                  value={diplomaData.birthDate.year[1]}
                  onChange={(value) => {
                    const newYear = diplomaData.birthDate.year[0] + value + diplomaData.birthDate.year.substring(2);
                    handleFieldChange('birthDate.year', newYear.substring(0, 4));
                  }}
                  style={dateBoxStyle}
                  isEditable={isEditable}
                  placeholder="0"
                />
                <EditableField
                  value={diplomaData.birthDate.year[2]}
                  onChange={(value) => {
                    const newYear = diplomaData.birthDate.year.substring(0, 2) + value + diplomaData.birthDate.year[3];
                    handleFieldChange('birthDate.year', newYear.substring(0, 4));
                  }}
                  style={dateBoxStyle}
                  isEditable={isEditable}
                  placeholder="0"
                />
                <EditableField
                  value={diplomaData.birthDate.year[3]}
                  onChange={(value) => {
                    const newYear = diplomaData.birthDate.year.substring(0, 3) + value;
                    handleFieldChange('birthDate.year', newYear.substring(0, 4));
                  }}
                  style={dateBoxStyle}
                  isEditable={isEditable}
                  placeholder="0"
                />
              </div>
            </div>
          </div>                {/* Exam Results */}
                <div style={{ margin: screenWidth < 640 ? '10px 0' : '15px 0' }}>
                  <div style={infoLineStyle}>
                    <span>PARTICIPATED IN THE SESSION</span>
                    <EditableField
                      value={diplomaData.examSession}
                      onChange={(value) => handleFieldChange('examSession', value)}
                      style={{ fontWeight: 'bold', margin: '0 8px' }}
                      isEditable={isEditable}
                      placeholder="EXAM SESSION"
                    />
                    <span>
                      OF THE STATE EXAMINATION AND OBTAINED
                    </span>
                    <span style={{ margin: '0 8px', fontSize: screenWidth < 640 ? '14px' : '16px' }}>→</span>
                    <div style={{ display: 'flex', gap: screenWidth < 640 ? '2px' : '3px', margin: '0 8px', flexWrap: 'wrap' }}>
                <EditableField
                  value={(() => {
                    // Get the percentage value (e.g., "40%") and extract first digit
                    const percentageStr = diplomaData.percentage || '00%';
                    const cleanValue = percentageStr.replace('%', '').padStart(2, '0');
                    const firstDigit = cleanValue.charAt(0) || '0';
                    return firstDigit;
                  })()}
                  onChange={(value) => {
                    // Get current percentage and update first digit
                    const currentPercentageStr = diplomaData.percentage || '00%';
                    const currentClean = currentPercentageStr.replace('%', '').padStart(2, '0');
                    const secondDigit = currentClean.charAt(1) || '0';
                    const newPercentage = value + secondDigit + '%';
                    handleFieldChange('percentage', newPercentage);
                  }}
                  style={resultBoxStyle}
                  isEditable={isEditable}
                  placeholder="0"
                />
                <EditableField
                  value={(() => {
                    // Get the percentage value (e.g., "40%") and extract second digit
                    const percentageStr = diplomaData.percentage || '00%';
                    const cleanValue = percentageStr.replace('%', '').padStart(2, '0');
                    const secondDigit = cleanValue.charAt(1) || '0';
                    return secondDigit;
                  })()}
                  onChange={(value) => {
                    // Get current percentage and update second digit
                    const currentPercentageStr = diplomaData.percentage || '00%';
                    const currentClean = currentPercentageStr.replace('%', '').padStart(2, '0');
                    const firstDigit = currentClean.charAt(0) || '0';
                    const newPercentage = firstDigit + value + '%';
                    handleFieldChange('percentage', newPercentage);
                  }}
                  style={resultBoxStyle}
                  isEditable={isEditable}
                  placeholder="0"
                />
              </div>
              <span style={{ marginLeft: '4px', fontWeight: 'bold' }}>%</span>
            </div>
            <div style={infoLineStyle}>
              <EditableField
                value={diplomaData.percentageText}
                onChange={(value) => handleFieldChange('percentageText', value)}
                style={{...infoFieldStyle, flex: 1 }}
                isEditable={isEditable}
                placeholder="PERCENTAGE IN WORDS"
              />
              <span>
                PERCENT OF THE POINTS UNDER THE CONDITIONS
              </span>
            </div>                  <div style={{ marginBottom: screenWidth < 640 ? '6px' : '8px' }}>
                    <span>
                      FOR SUCCESS ESTABLISHED BY THE AFOREMENTIONED ORDINANCE.
                    </span>
                  </div>
                </div>

                {/* Diploma Details */}
                <div style={{ margin: screenWidth < 640 ? '10px 0' : '15px 0' }}>
                  <div style={{ marginBottom: screenWidth < 640 ? '6px' : '8px' }}>
                    <span>
                      IN WITNESS WHEREOF, WE HEREBY AWARD THE PRESENT DIPLOMA OF
                      SECONDARY EDUCATION IN THE LONG CYCLE
                    </span>
                  </div>
                  <div style={infoLineStyle}>
                    <span>IN THE SECTION</span>
                    <EditableField
                      value={diplomaData.section}
                      onChange={(value) => handleFieldChange('section', value)}
                      style={{...infoFieldStyle, width: screenWidth < 640 ? '120px' : '180px' }}
                      isEditable={isEditable}
                      placeholder="SECTION"
                    />
              <span>OPTION</span>
              <EditableField
                value={diplomaData.option}
                onChange={(value) => handleFieldChange('option', value)}
                style={{...infoFieldStyle, flex: 1 }}
                isEditable={isEditable}
                placeholder="OPTION"
              />
            </div>
            <div style={infoLineStyle}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '100%',
                  textAlign: 'center',
                  flexWrap: 'wrap'
                }}
              >
                <span>ISSUED IN KINSHASA, ON</span>
                <EditableField
                  value={diplomaData.issueDate}
                  onChange={(value) => handleFieldChange('issueDate', value)}
                  style={{...infoFieldStyle, flex: 'none' }}
                  isEditable={isEditable}
                  placeholder="ISSUE DATE"
                />
              </div>
            </div>
          </div>                {/* Signatures */}
                <div style={{ margin: screenWidth < 640 ? '10px 0' : '15px 0', position: 'relative' }}>
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
                      top: screenWidth < 640 ? '10px' : '0px',
                      zIndex: 10
                    }}
                  />
            <div style={signatureRowStyle}>
              <div style={signatureBoxStyle}>
                THE JURY MEMBERS
                <div style={{...signatureLineStyle, margin: '5px auto 0 auto' }}>
                  ✓
                </div>
              </div>
              <div style={signatureBoxStyle}>
                THE INSPECTOR GENERAL<br />PRESIDENT OF THE JURY
                <div style={{...signatureLineStyle, margin: '5px auto 0 auto' }}>
                  ✓
                </div>
              </div>
              <div style={signatureBoxStyle}>
                THE SECRETARY GENERAL<br />SUPERVISOR
                <div style={{...signatureLineStyle, margin: '5px auto 0 auto' }}>
                  ✓
                </div>
              </div>
              <div style={signatureBoxStyle}>
                <div style={photoPlaceholderStyle}>
                </div>
                THE RECIPIENT
              </div>
            </div>
          </div>
                
                {/* Reference Numbers */}
                <div style={{ margin: screenWidth < 640 ? '10px 0' : '15px 0', textAlign: 'center' }}>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      gap: screenWidth < 640 ? '3px' : '5px',
                      flexWrap: 'wrap'
                    }}
                  >
                    <div style={{ display: 'flex', gap: screenWidth < 640 ? '3px' : '5px', alignItems: 'center', flexWrap: 'nowrap' }}>
                      {/* First section: Wide box with "TS 07" */}
                      <div style={firstSerialBoxStyle}>
                        {(diplomaData.serialNumbers && diplomaData.serialNumbers[0]) || 'T'}
                        {(diplomaData.serialNumbers && diplomaData.serialNumbers[1]) || 'S'}
                        {' '}
                        {(diplomaData.serialNumbers && diplomaData.serialNumbers[2]) || '0'}
                        {(diplomaData.serialNumbers && diplomaData.serialNumbers[3]) || '7'}
                      </div>
                      
                      {/* Second section: 14 individual boxes for digits */}
                      {Array.from({ length: 14 }, (_, i) => {
                        const index = i + 4;
                        const char = diplomaData.serialNumbers && diplomaData.serialNumbers[index];
                        console.log(`📦 Box ${i + 1}/14 (index ${index}):`, char || '(undefined, showing 0)');
                        return (
                          <div key={index} style={numberBoxStyle}>
                            {char || '0'}
                          </div>
                        );
                      })}
                      
                      {/* Third section: Wide box for 7-digit code */}
                      <div style={serialCodeBoxStyle}>
                        {diplomaData.serialCode || '0000000'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Note */}
                <div style={{
                  textAlign: 'center',
                  marginTop: screenWidth < 640 ? '6px' : '8px',
                  paddingTop: '4px',
                  fontSize: screenWidth < 640 ? '10px' : '12px',
                  fontStyle: 'italic'
                }}>
                  <p style={{ margin: 0, fontWeight: 'bold' }}>
                    N.B.: Without erasures or overcharges. No duplicate of this
                    diploma shall be issued.
                  </p>
                </div>

                {/* QR Code for Verification - Bottom Left */}
                {documentId && (
                  <div style={{
                    position: 'absolute',
                    bottom: '20px',
                    left: '20px',
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
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StateDiplomaTemplate;
