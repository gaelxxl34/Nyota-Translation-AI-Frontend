// CollegeAnnualTranscriptTemplate.tsx - University/College Annual Transcript Template
// Displays course grades for a single academic year or semester
// Based on ISC (Institut Supérieur de Commerce) transcript format

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
        className={`bg-yellow-100 border-2 border-blue-400 outline-none rounded-sm px-1 ${className}`}
        style={{ ...style, display: 'inline-block', width: 'auto', minWidth: '80px' }}
        placeholder={placeholder}
        autoFocus
      />
    );
  }

  return (
    <span
      className={`${className} ${isEditable ? 'cursor-pointer hover:bg-yellow-100 hover:shadow-sm px-1 py-0.5 rounded-sm transition-colors' : ''} ${displayValue ? '' : 'text-gray-400 italic'}`}
      style={style}
      onClick={() => isEditable && setIsEditing(true)}
      title={isEditable ? 'Click to edit' : ''}
    >
      {displayValue || (isEditable && placeholder ? 'Click to edit' : placeholder)}
    </span>
  );
};

export interface CourseGrade {
  courseNumber: number;
  courseName: string;
  creditHours: string; // e.g., "120H"
  
  // Optional fields for 4-column weighted format
  units?: string;        // e.g., "4" - for UNITES column
  maxGrade?: string;     // e.g., "80" - for MAX column
  weightedGrade?: string; // e.g., "44" - for NOTES PONDÉRÉES column
  
  grade: string; // e.g., "44/60" for 3-column OR final grade for 4-column
}

// Summary row types for flexible rendering
export interface SummaryRow {
  label: string;           // e.g., "Total cours", "Mémoire", "Stage", "Total général"
  values: {
    grade?: string;        // The actual score (e.g., "240/350" or "121")
    maxGrade?: string;     // Maximum possible score (e.g., "175")
    units?: string;        // For 4-column format (e.g., "58")
    hours?: string;        // For volume horaire in summary (e.g., "870")
  };
  type: 'subtotal' | 'component' | 'total' | 'percentage' | 'average';
  isBold?: boolean;        // Whether to render in bold
  colSpan?: number;        // Number of columns to span for label
}

export interface CollegeTranscriptData {
  // Institution header
  country: string;
  institutionType: string;
  institutionName: string;
  institutionAbbreviation: string;
  institutionEmail: string;
  departmentName: string;

  // Document details
  documentTitle: string;
  documentNumber: string;

  // Student info
  studentName: string;
  matricule: string;
  hasFollowedCourses: string; // "a régulièrement suivi les matières prévues au programme"
  section: string;
  option: string;
  level: string; // e.g., "Première Licence" (First Year License)
  academicYear: string;
  session: string; // e.g., "Première session" (First Session)

  // Table configuration
  tableFormat?: 'simple' | 'weighted'; // 3-column (simple) vs 4-column (weighted)

  // Course grades
  courses: CourseGrade[];

  // Dynamic summary rows (replaces fixed totalGrade/percentage)
  summaryRows?: SummaryRow[];

  // Backward compatibility - kept for migration
  totalGrade?: string; // e.g., "363.5/540" - DEPRECATED, use summaryRows
  percentage?: string; // e.g., "67.3 %" - DEPRECATED, use summaryRows

  // Decision
  decision: string; // e.g., "A REUSSI AVEC SATISFACTION"

  // Signatures and date
  issueLocation: string;
  issueDate: string;
  secretary: string;
  secretaryTitle: string;
  chiefOfWorks: string;
  chiefOfWorksTitle: string;
}

interface CollegeAnnualTranscriptTemplateProps {
  data?: CollegeTranscriptData;
  isEditable?: boolean;
  onDataChange?: (updatedData: CollegeTranscriptData) => void;
  documentId?: string;
}

const CollegeAnnualTranscriptTemplate: React.FC<CollegeAnnualTranscriptTemplateProps> = ({ 
  data, 
  isEditable = false, 
  onDataChange,
  documentId: propDocumentId
}) => {
  // Default data structure based on the ISC transcript
  const defaultData: CollegeTranscriptData = {
    country: "DEMOCRATIC REPUBLIC OF THE CONGO",
    institutionType: "HIGHER EDUCATION AND UNIVERSITY",
    institutionName: "INSTITUT SUPÉRIEUR DE COMMERCE",
    institutionAbbreviation: "I.S.C - Beni",
    institutionEmail: "iscbeni@yahoo.fr / iscbeni@gmail.com",
    departmentName: "Academic Services",
    documentTitle: "TRANSCRIPT OF SUBJECTS AND GRADES",
    documentNumber: "N° ISC/BN/S.SC.C.F/5686/2020-2021",
    studentName: "STUDENT FULL NAME",
    matricule: "000/00",
    hasFollowedCourses: "regularly followed the subjects planned in the program in",
    section: "Commercial Sciences and Finance Section",
    option: "Fiscal Option",
    level: "First Year License",
    academicYear: "2020-2021",
    session: "First Session",
    tableFormat: "simple", // "simple" for 3-column or "weighted" for 4-column
    courses: [
      { courseNumber: 1, courseName: "Business Economics", creditHours: "120H", grade: "44/60" },
      { courseNumber: 2, courseName: "Quantitative Management Methods", creditHours: "120H", grade: "61/80" },
      { courseNumber: 3, courseName: "Fiscal Law and Procedures", creditHours: "90H", grade: "41/60" },
      { courseNumber: 4, courseName: "Business Law and Ethics", creditHours: "60H", grade: "24/40" },
      { courseNumber: 5, courseName: "Project Preparation and Evaluation", creditHours: "60H", grade: "24.5/40" },
      { courseNumber: 6, courseName: "Business Taxation", creditHours: "60H", grade: "30.5/40" },
      { courseNumber: 7, courseName: "In-depth Questions in HR Management", creditHours: "60H", grade: "28.5/40" },
      { courseNumber: 8, courseName: "Financial Management", creditHours: "45H", grade: "22.5/30" },
      { courseNumber: 9, courseName: "Business English I", creditHours: "45H", grade: "24/30" },
      { courseNumber: 10, courseName: "In-depth IT Questions I", creditHours: "45H", grade: "20/30" },
      { courseNumber: 11, courseName: "Customs and Finance Law", creditHours: "45H", grade: "20/30" },
      { courseNumber: 12, courseName: "National Accounting", creditHours: "30H", grade: "13.5/20" },
      { courseNumber: 13, courseName: "Scientific Research Methods", creditHours: "30H", grade: "10/20" },
    ],
    // Using new summaryRows structure
    // For simple format (3-column):
    summaryRows: [
      {
        label: "Overall Total",
        values: { grade: "363.5/540" },
        type: "total",
        isBold: true,
      },
      {
        label: "Percentage",
        values: { grade: "67.3 %" },
        type: "percentage",
        isBold: true,
      },
    ],
    // For weighted format (4-column), use this structure instead:
    // summaryRows: [
    //   {
    //     label: "TOTAL",
    //     values: { hours: "870", units: "58", maxGrade: "1160", grade: "761" },
    //     type: "total",
    //     isBold: true,
    //   },
    //   {
    //     label: "COURSE PERCENTAGE",
    //     values: { grade: "65.6" },
    //     type: "percentage",
    //     isBold: true,
    //   },
    //   {
    //     label: "Mémoire",
    //     values: { maxGrade: "175", grade: "121" },
    //     type: "component",
    //   },
    //   {
    //     label: "Stage",
    //     values: { maxGrade: "175", grade: "123" },
    //     type: "component",
    //   },
    //   {
    //     label: "Overall Total",
    //     values: { grade: "484/700" },
    //     type: "total",
    //     isBold: true,
    //   },
    //   {
    //     label: "Percentage",
    //     values: { grade: "69.1 %" },
    //     type: "percentage",
    //     isBold: true,
    //   },
    // ],
    decision: "PASSED WITH SATISFACTION",
    issueLocation: "Beni",
    issueDate: "March 21, 2022",
    secretary: "MUMBERE LWANZO SAUL",
    secretaryTitle: "Academic Secretary of Sections",
    chiefOfWorks: "KAMBALE SIKULISIMWA Chrysenthe",
    chiefOfWorksTitle: "The Chief of Sections of I.S.C./Beni",
  };

  const [pdfData, setPdfData] = useState<CollegeTranscriptData | null>(null);
  const [currentData, setCurrentData] = useState<CollegeTranscriptData>(defaultData);
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

  // Listen for PDF generation data
  useEffect(() => {
    const handlePdfDataReady = (event: any) => {
      setPdfData(event.detail);
    };

    if (typeof window !== 'undefined' && (window as any).isPdfGenerationMode && (window as any).pdfTranscriptData) {
      setPdfData((window as any).pdfTranscriptData);
    }

    window.addEventListener('pdf-transcript-data-ready', handlePdfDataReady);
    return () => {
      window.removeEventListener('pdf-transcript-data-ready', handlePdfDataReady);
    };
  }, []);

  const transcriptData = currentData;

  // Backward compatibility: Migrate old format to new summaryRows format
  const getSummaryRows = (): SummaryRow[] => {
    if (transcriptData.summaryRows && transcriptData.summaryRows.length > 0) {
      return transcriptData.summaryRows;
    }
    
    // Fallback to old format
    const rows: SummaryRow[] = [];
    if (transcriptData.totalGrade) {
      rows.push({
        label: "Overall Total",
        values: { grade: transcriptData.totalGrade },
        type: "total",
        isBold: true,
      });
    }
    if (transcriptData.percentage) {
      rows.push({
        label: "Percentage",
        values: { grade: transcriptData.percentage },
        type: "percentage",
        isBold: true,
      });
    }
    return rows;
  };

  // Handle field changes
  const handleFieldChange = (field: keyof CollegeTranscriptData, value: string) => {
    console.log('🔧 Field changed:', field, '=', value);
    const updatedData = { ...transcriptData, [field]: value };
    setCurrentData(updatedData);
    if (onDataChange) {
      console.log('📤 Calling onDataChange with updated data');
      onDataChange(updatedData);
    } else {
      console.warn('⚠️ onDataChange is not defined');
    }
  };

  // Handle course changes
  const handleCourseChange = (index: number, field: keyof CourseGrade, value: string) => {
    console.log('🔧 Course changed:', index, field, '=', value);
    const updatedCourses = [...transcriptData.courses];
    updatedCourses[index] = { ...updatedCourses[index], [field]: value };
    const updatedData = { ...transcriptData, courses: updatedCourses };
    setCurrentData(updatedData);
    if (onDataChange) {
      console.log('📤 Calling onDataChange with updated courses');
      onDataChange(updatedData);
    } else {
      console.warn('⚠️ onDataChange is not defined');
    }
  };

  // Handle summary row changes
  const handleSummaryRowChange = (index: number, field: 'label' | 'grade' | 'maxGrade' | 'units' | 'hours', value: string) => {
    console.log('🔧 Summary row changed:', index, field, '=', value);
    const summaryRows = getSummaryRows();
    const updatedRows = [...summaryRows];
    
    if (field === 'label') {
      updatedRows[index] = { ...updatedRows[index], label: value };
    } else {
      updatedRows[index] = {
        ...updatedRows[index],
        values: { ...updatedRows[index].values, [field]: value }
      };
    }
    
    const updatedData = { ...transcriptData, summaryRows: updatedRows };
    setCurrentData(updatedData);
    if (onDataChange) {
      console.log('📤 Calling onDataChange with updated summary rows');
      onDataChange(updatedData);
    } else {
      console.warn('⚠️ onDataChange is not defined');
    }
  };

  // Add a new summary row
  const addSummaryRow = (type: 'subtotal' | 'component' | 'total' | 'percentage' | 'average' = 'component') => {
    console.log('➕ Adding new summary row, type:', type);
    const summaryRows = getSummaryRows();
    const newRow: SummaryRow = {
      label: type === 'component' ? 'New Component' : type === 'subtotal' ? 'Subtotal' : type === 'average' ? 'Average' : type === 'total' ? 'Total' : 'Percentage',
      values: { grade: '' },
      type: type,
      isBold: type === 'total' || type === 'percentage',
    };
    
    const updatedData = { ...transcriptData, summaryRows: [...summaryRows, newRow] };
    setCurrentData(updatedData);
    if (onDataChange) {
      console.log('📤 Calling onDataChange with new summary row');
      onDataChange(updatedData);
    } else {
      console.warn('⚠️ onDataChange is not defined');
    }
  };

  // Remove a summary row
  const removeSummaryRow = (index: number) => {
    console.log('➖ Removing summary row:', index);
    const summaryRows = getSummaryRows();
    const updatedRows = summaryRows.filter((_, i) => i !== index);
    
    const updatedData = { ...transcriptData, summaryRows: updatedRows };
    setCurrentData(updatedData);
    if (onDataChange) {
      console.log('📤 Calling onDataChange after removing summary row');
      onDataChange(updatedData);
    } else {
      console.warn('⚠️ onDataChange is not defined');
    }
  };

  // Toggle table format
  const toggleTableFormat = () => {
    const newFormat: 'simple' | 'weighted' = transcriptData.tableFormat === 'simple' ? 'weighted' : 'simple';
    console.log('🔄 Toggling table format from', transcriptData.tableFormat, 'to', newFormat);
    const updatedData = { ...transcriptData, tableFormat: newFormat };
    setCurrentData(updatedData);
    if (onDataChange) {
      console.log('📤 Calling onDataChange with new table format');
      onDataChange(updatedData);
    } else {
      console.warn('⚠️ onDataChange is not defined');
    }
  };

  // Add a new course
  const addCourse = () => {
    console.log('➕ Adding new course');
    const newCourseNumber = transcriptData.courses.length + 1;
    const newCourse: CourseGrade = {
      courseNumber: newCourseNumber,
      courseName: 'New Course',
      creditHours: '30H',
      grade: '0/20',
    };
    
    const updatedData = { ...transcriptData, courses: [...transcriptData.courses, newCourse] };
    setCurrentData(updatedData);
    if (onDataChange) {
      console.log('📤 Calling onDataChange after adding course');
      onDataChange(updatedData);
    } else {
      console.warn('⚠️ onDataChange is not defined');
    }
  };

  // Remove a course
  const removeCourse = (index: number) => {
    console.log('➖ Removing course:', index);
    const updatedCourses = transcriptData.courses.filter((_, i) => i !== index);
    // Renumber courses
    const renumberedCourses = updatedCourses.map((course, i) => ({
      ...course,
      courseNumber: i + 1,
    }));
    
    const updatedData = { ...transcriptData, courses: renumberedCourses };
    setCurrentData(updatedData);
    if (onDataChange) {
      console.log('📤 Calling onDataChange after removing course');
      onDataChange(updatedData);
    } else {
      console.warn('⚠️ onDataChange is not defined');
    }
  };

  return (
    <div className="bg-white" id="college-transcript-template">
      {/* A4 Page Container - 210mm x 297mm - Optimized for PDF */}
      <div 
        className="bg-white mx-auto relative"
        style={{
          width: '210mm',
          height: '297mm',
          padding: '12mm 15mm',
          boxShadow: '0 0 10px rgba(0,0,0,0.1)',
          overflow: 'hidden',
        }}
      >
        {/* Header Section */}
        <div className="text-center mb-5 relative pt-3">
          {/* Coat of Arms - Top Left */}
          <div className="absolute top-0 left-0">
            <img 
              src="/Coat.png" 
              alt="Coat of Arms" 
              className="w-14 h-16 object-contain"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                const placeholder = e.currentTarget.nextElementSibling as HTMLElement;
                if (placeholder) placeholder.style.display = 'flex';
              }}
            />
            <div className="w-14 h-16 border-2 border-gray-400 hidden items-center justify-center text-[10px] text-gray-500">
              Coat
            </div>
          </div>

          {/* Flag - Top Right */}
          <div className="absolute top-0 right-0">
            <img 
              src="/flag.png" 
              alt="DRC Flag" 
              className="w-16 h-14 object-contain"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                const placeholder = e.currentTarget.nextElementSibling as HTMLElement;
                if (placeholder) placeholder.style.display = 'flex';
              }}
            />
            <div className="w-16 h-14 border-2 border-gray-400 hidden items-center justify-center text-[10px] text-gray-500">
              Flag
            </div>
          </div>

          <div className="flex flex-col items-center space-y-3">
            {/* Institution Header */}
            <div className="text-[13px] leading-snug pt-1">
              <div className="font-bold block text-[14px] uppercase">
                DEMOCRATIC REPUBLIC OF THE CONGO
              </div>
              <div className="font-bold block uppercase text-[14px] tracking-wide">
                HIGHER EDUCATION AND UNIVERSITY
              </div>
              <EditableField
                value={transcriptData.institutionName}
                onChange={(v) => handleFieldChange('institutionName', v)}
                isEditable={isEditable}
                className="font-bold block uppercase text-[14px] tracking-wide"
              />
              <EditableField
                value={transcriptData.institutionAbbreviation}
                onChange={(v) => handleFieldChange('institutionAbbreviation', v)}
                isEditable={isEditable}
                className="block text-[12px]"
              />
            </div>

            {/* Email and Department */}
            <div className="text-[12px]">
              <div>
                Email: <EditableField
                  value={transcriptData.institutionEmail}
                  onChange={(v) => handleFieldChange('institutionEmail', v)}
                  isEditable={isEditable}
                />
              </div>
              <div className="italic text-[12px]">
                Academic Services
              </div>
            </div>

            {/* Document Title */}
            <div className="mt-1">
              <h1 className="text-[16px] font-bold uppercase underline tracking-wide">
                TRANSCRIPT OF SUBJECTS AND GRADES
              </h1>
              <div className="text-[12px] mt-1">
                <EditableField
                  value={transcriptData.documentNumber}
                  onChange={(v) => handleFieldChange('documentNumber', v)}
                  isEditable={isEditable}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Student Information */}
        <div className="text-[11px] mb-3 leading-relaxed">
          <p className="mb-1">
            We, the undersigned, Members of the Section Office of the Institut Supérieur de Commerce (I.S.C.) of{' '}
            <EditableField
              value={transcriptData.institutionAbbreviation.split('-')[1]?.trim() || 'Beni'}
              onChange={(v) => handleFieldChange('institutionAbbreviation', `${transcriptData.institutionAbbreviation.split('-')[0]?.trim()} - ${v}`)}
              isEditable={isEditable}
              className="font-bold"
            />
            , certify by this document that <span className="font-bold">Mr./Ms.</span>{' '}
            <EditableField
              value={transcriptData.studentName}
              onChange={(v) => handleFieldChange('studentName', v)}
              isEditable={isEditable}
              className="font-bold uppercase"
            />
            , Registration Number{' '}
            <EditableField
              value={transcriptData.matricule}
              onChange={(v) => handleFieldChange('matricule', v)}
              isEditable={isEditable}
              className="font-bold"
            />{' '}
            <EditableField
              value={transcriptData.hasFollowedCourses}
              onChange={(v) => handleFieldChange('hasFollowedCourses', v)}
              isEditable={isEditable}
            />{' '}
            <EditableField
              value={transcriptData.section}
              onChange={(v) => handleFieldChange('section', v)}
              isEditable={isEditable}
              className="font-bold"
            />, <EditableField
              value={transcriptData.option}
              onChange={(v) => handleFieldChange('option', v)}
              isEditable={isEditable}
              className="font-bold"
            />{' '}
            Level:{' '}
            <EditableField
              value={transcriptData.level}
              onChange={(v) => handleFieldChange('level', v)}
              isEditable={isEditable}
              className="font-bold"
            />
            , during the academic year{' '}
            <EditableField
              value={transcriptData.academicYear}
              onChange={(v) => handleFieldChange('academicYear', v)}
              isEditable={isEditable}
              className="font-bold"
            />{' '}
            and obtained in the{' '}
            <EditableField
              value={transcriptData.session}
              onChange={(v) => handleFieldChange('session', v)}
              isEditable={isEditable}
              className="font-bold italic"
            />
            , the following grades:
          </p>
        </div>

        {/* Edit Controls - Only visible in edit mode */}
        {isEditable && (
          <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-md">
            <div className="text-[10px] font-semibold text-blue-900 mb-2">📝 Edit Controls</div>
            <div className="flex flex-wrap gap-2">
              {/* Table Format Toggle */}
              <button
                onClick={toggleTableFormat}
                className="px-3 py-1 text-[9px] bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                title="Switch between 3-column and 4-column table formats"
              >
                🔄 Switch to {transcriptData.tableFormat === 'simple' ? 'Weighted (4-col)' : 'Simple (3-col)'}
              </button>

              {/* Add Course */}
              <button
                onClick={addCourse}
                className="px-3 py-1 text-[9px] bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                title="Add a new course row"
              >
                ➕ Add Course
              </button>

              {/* Add Summary Row Dropdown */}
              <div className="relative inline-block">
                <select
                  onChange={(e) => {
                    if (e.target.value) {
                      addSummaryRow(e.target.value as 'subtotal' | 'component' | 'total' | 'percentage' | 'average');
                      e.target.value = ''; // Reset selection
                    }
                  }}
                  className="px-3 py-1 text-[9px] bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors cursor-pointer"
                  defaultValue=""
                >
                  <option value="" disabled>➕ Add Summary Row</option>
                  <option value="component">Component (Mémoire, Stage, etc.)</option>
                  <option value="subtotal">Subtotal (Total cours)</option>
                  <option value="average">Average (Moyenne)</option>
                  <option value="total">Total</option>
                  <option value="percentage">Percentage</option>
                </select>
              </div>

              {/* Help Text */}
              <div className="text-[8px] text-blue-700 italic ml-auto self-center">
                Click fields to edit • Hover rows for delete options
              </div>
            </div>
          </div>
        )}

        {/* Grades Table - Dynamic rendering based on tableFormat */}
        <div className="mb-4">
          <table className="w-full border-2 border-black text-[10px]">
            <thead>
              <tr className="border-b-2 border-black">
                <th className="border-r border-black p-0.5 w-6 text-center font-bold">N°</th>
                <th className="border-r border-black p-0.5 text-left font-bold">
                  {transcriptData.tableFormat === 'weighted' ? 'SUBJECTS' : 'COURSE TITLES'}
                </th>
                <th className="border-r border-black p-0.5 w-16 text-center font-bold">
                  VOL.<br />HOURLY
                </th>
                
                {/* Additional columns for weighted format */}
                {transcriptData.tableFormat === 'weighted' && (
                  <>
                    <th className="border-r border-black p-0.5 w-12 text-center font-bold">UNITS</th>
                    <th className="border-r border-black p-0.5 w-12 text-center font-bold">MAX</th>
                  </>
                )}
                
                <th className="p-0.5 w-16 text-center font-bold">
                  {transcriptData.tableFormat === 'weighted' ? 'WEIGHTED GRADES' : 'GRADES'}
                </th>
              </tr>
            </thead>
            <tbody>
              {transcriptData.courses.map((course, index) => (
                <tr key={index} className="border-b border-black group hover:bg-yellow-50">
                  {/* Course Number */}
                  <td className="border-r border-black p-0.5 text-center relative">
                    {course.courseNumber}
                    {/* Delete button - only visible on hover in edit mode */}
                    {isEditable && (
                      <button
                        onClick={() => removeCourse(index)}
                        className="absolute left-0 top-0 bottom-0 w-full bg-red-600 text-white text-[8px] opacity-0 group-hover:opacity-90 transition-opacity hover:opacity-100"
                        title="Delete this course"
                      >
                        🗑️
                      </button>
                    )}
                  </td>
                  
                  {/* Course Name */}
                  <td className="border-r border-black p-0.5">
                    {isEditable ? (
                      <EditableField
                        value={course.courseName}
                        onChange={(v) => handleCourseChange(index, 'courseName', v)}
                        isEditable={isEditable}
                      />
                    ) : (
                      course.courseName
                    )}
                  </td>
                  
                  {/* Credit Hours */}
                  <td className="border-r border-black p-0.5 text-center">
                    {isEditable ? (
                      <EditableField
                        value={course.creditHours}
                        onChange={(v) => handleCourseChange(index, 'creditHours', v)}
                        isEditable={isEditable}
                      />
                    ) : (
                      course.creditHours
                    )}
                  </td>
                  
                  {/* Weighted format: Units column */}
                  {transcriptData.tableFormat === 'weighted' && (
                    <td className="border-r border-black p-0.5 text-center">
                      {isEditable ? (
                        <EditableField
                          value={course.units || ''}
                          onChange={(v) => handleCourseChange(index, 'units', v)}
                          isEditable={isEditable}
                          placeholder="0"
                        />
                      ) : (
                        course.units || ''
                      )}
                    </td>
                  )}
                  
                  {/* Weighted format: Max Grade column */}
                  {transcriptData.tableFormat === 'weighted' && (
                    <td className="border-r border-black p-0.5 text-center">
                      {isEditable ? (
                        <EditableField
                          value={course.maxGrade || ''}
                          onChange={(v) => handleCourseChange(index, 'maxGrade', v)}
                          isEditable={isEditable}
                          placeholder="0"
                        />
                      ) : (
                        course.maxGrade || ''
                      )}
                    </td>
                  )}
                  
                  {/* Grade (or Weighted Grade for weighted format) */}
                  <td className="p-0.5 text-center">
                    {isEditable ? (
                      <EditableField
                        value={transcriptData.tableFormat === 'weighted' ? (course.weightedGrade || course.grade) : course.grade}
                        onChange={(v) => handleCourseChange(index, transcriptData.tableFormat === 'weighted' ? 'weightedGrade' : 'grade', v)}
                        isEditable={isEditable}
                      />
                    ) : (
                      transcriptData.tableFormat === 'weighted' ? (course.weightedGrade || course.grade) : course.grade
                    )}
                  </td>
                </tr>
              ))}
              
              {/* Dynamic Summary Rows */}
              {getSummaryRows().map((row, index) => {
                const isWeighted = transcriptData.tableFormat === 'weighted';
                
                return (
                  <tr 
                    key={index} 
                    className={`${row.type === 'total' ? 'border-b-2' : 'border-b'} border-black ${row.isBold ? 'font-bold' : ''} group hover:bg-yellow-50`}
                  >
                    {/* Label column - spans first 3 columns */}
                    <td colSpan={3} className="border-r border-black p-0.5 text-left pl-2 relative">
                      {isEditable ? (
                        <>
                          <EditableField
                            value={row.label}
                            onChange={(v) => handleSummaryRowChange(index, 'label', v)}
                            isEditable={isEditable}
                          />
                          {/* Delete button - only visible on hover in edit mode */}
                          <button
                            onClick={() => removeSummaryRow(index)}
                            className="absolute right-1 top-1 bottom-1 px-2 bg-red-600 text-white text-[7px] opacity-0 group-hover:opacity-90 transition-opacity hover:opacity-100 rounded"
                            title="Delete this row"
                          >
                            🗑️ Delete
                          </button>
                        </>
                      ) : (
                        row.label
                      )}
                    </td>
                    
                    {/* For weighted format: Units column */}
                    {isWeighted && (
                      <td className="border-r border-black p-0.5 text-center">
                        {row.values.units ? (
                          isEditable ? (
                            <EditableField
                              value={row.values.units}
                              onChange={(v) => handleSummaryRowChange(index, 'units', v)}
                              isEditable={isEditable}
                            />
                          ) : (
                            row.values.units
                          )
                        ) : null}
                      </td>
                    )}
                    
                    {/* For weighted format: Max Grade column */}
                    {isWeighted && (
                      <td className="border-r border-black p-0.5 text-center">
                        {row.values.maxGrade ? (
                          isEditable ? (
                            <EditableField
                              value={row.values.maxGrade}
                              onChange={(v) => handleSummaryRowChange(index, 'maxGrade', v)}
                              isEditable={isEditable}
                            />
                          ) : (
                            row.values.maxGrade
                          )
                        ) : null}
                      </td>
                    )}
                    
                    {/* Grade column - always present */}
                    <td className="p-0.5 text-center">
                      {isEditable ? (
                        <EditableField
                          value={row.values.grade || ''}
                          onChange={(v) => handleSummaryRowChange(index, 'grade', v)}
                          isEditable={isEditable}
                        />
                      ) : (
                        row.values.grade
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Jury Decision */}
  <div className="mb-3 text-[11px]">
          <p className="font-bold">
            JURY DECISION:{' '}
            <EditableField
              value={transcriptData.decision}
              onChange={(v) => handleFieldChange('decision', v)}
              isEditable={isEditable}
              className="italic"
            />
          </p>
        </div>

        {/* Signatures Section */}
        <div className="mt-4 mb-2">
          <div className="text-right mb-4 text-[11px]">
            Done in{' '}
            <EditableField
              value={transcriptData.issueLocation}
              onChange={(v) => handleFieldChange('issueLocation', v)}
              isEditable={isEditable}
              className="font-bold"
            />
            , on{' '}
            <EditableField
              value={transcriptData.issueDate}
              onChange={(v) => handleFieldChange('issueDate', v)}
              isEditable={isEditable}
              className="font-bold"
            />
          </div>

          <div className="grid grid-cols-5 gap-4 items-start text-[10px]">
            {/* Left Signature - Secretary */}
            <div className="col-span-2 text-center">
              <div className="mb-0.5 italic">
                <EditableField
                  value={transcriptData.secretaryTitle}
                  onChange={(v) => handleFieldChange('secretaryTitle', v)}
                  isEditable={isEditable}
                />
              </div>
              <div className="h-10 flex items-center justify-center">
                <div className="text-[9px] text-gray-500 border border-gray-300 p-1">Signature</div>
              </div>
              <div className="mt-1 font-bold">
                = : <EditableField
                  value={transcriptData.secretary}
                  onChange={(v) => handleFieldChange('secretary', v)}
                  isEditable={isEditable}
                  className="underline"
                /> :=
              </div>
              <div className="text-[9px] italic">Assistant</div>
            </div>

            {/* Center Stamp */}
            <div className="col-span-1 flex flex-col items-center justify-start">
              <div className="flex flex-col items-center">
                <img
                  src="/stamp.png"
                  alt="Official Stamp"
                  className="w-24 h-24 object-contain"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    const placeholder = e.currentTarget.nextElementSibling as HTMLElement;
                    if (placeholder) placeholder.style.display = 'flex';
                  }}
                />
                <div className="w-24 h-24 rounded-full border-2 border-gray-400 hidden items-center justify-center text-[9px] text-gray-500">
                  Official Stamp
                </div>
              </div>
            </div>

            {/* Right Signature - Chief of Works */}
            <div className="col-span-2 text-center">
              <div className="mb-0.5 italic">
                = : <EditableField
                  value={transcriptData.chiefOfWorksTitle}
                  onChange={(v) => handleFieldChange('chiefOfWorksTitle', v)}
                  isEditable={isEditable}
                /> :=
              </div>
              <div className="h-10 flex items-center justify-center">
                <div className="text-[9px] text-gray-500 border border-gray-300 p-1">Signature</div>
              </div>
              <div className="mt-1 font-bold underline">
                <EditableField
                  value={transcriptData.chiefOfWorks}
                  onChange={(v) => handleFieldChange('chiefOfWorks', v)}
                  isEditable={isEditable}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Verification Section */}
        <div className="relative mt-4 mb-2">
          {documentId && (
            <div className="flex justify-start">
              <div className="flex flex-col items-center">
                <QRCodeComponent documentId={documentId} size={60} />
                <p className="text-[9px] font-semibold text-gray-700 mt-1">Verify Document</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CollegeAnnualTranscriptTemplate;
