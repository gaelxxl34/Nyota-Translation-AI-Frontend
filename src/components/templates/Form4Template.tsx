// Form4Template.tsx - A4 Report Card Template for Form 4 (4th Year) - NTC
// Converts French school bulletins to English format with proper A4 sizing
// Specifically designed for 4th Year Humanities Math-Physics class structure

import React, { useMemo, useState, useEffect } from 'react';
import { QRCodeComponent } from '../common';

interface Maxima {
  periodMaxima: number; // e.g., 10 for religion, 40 for physics
  examMaxima: number;   // e.g., 20 for religion, 80 for physics  
  totalMaxima: number;  // e.g., 40 for religion, 160 for physics
}

interface SubjectGrade {
  subject: string;
  firstSemester: {
    period1: number | string;
    period2: number | string;
    exam: number | string;
    total: number | string;
  };
  secondSemester: {
    period3: number | string;
    period4: number | string;
    exam: number | string;
    total: number | string;
  };
  overallTotal: number | string;
  maxima?: Maxima; // Maxima for this subject
  secondSitting?: {
    marks: number | string;
    max: number | string;
  };
}

interface BulletinData {
  // Display Settings
  tableSize?: 'auto' | 'normal' | '11px' | '12px' | '13px' | '14px' | '15px'; // Stored in Firestore
  
  // Student Information
  province?: string;
  city?: string;
  municipality?: string;
  school?: string;
  schoolCode?: string;
  studentName?: string;
  gender?: string;
  birthPlace?: string;
  birthDate?: string;
  class?: string;
  permanentNumber?: string;
  idNumber?: string;
  academicYear?: string;
  
  // Grades
  subjects?: SubjectGrade[];
  
  // Totals
  totalMarksOutOf?: {
    firstSemester: number | string;
    secondSemester: number | string;
  };
  totalMarksObtained?: {
    firstSemester: number | string;
    secondSemester: number | string;
  };
  percentage?: {
    firstSemester: number | string;
    secondSemester: number | string;
  };
  position?: string;
  totalStudents?: number | string;
  
  // Assessment
  application?: string;
  behaviour?: string;
  
  // Summary row values (for editable cells)
  summaryValues?: {
    aggregatesMaxima?: {
      period1?: string;
      period2?: string;
      exam1?: string;
      total1?: string;
      period3?: string;
      period4?: string;
      exam2?: string;
      total2?: string;
      overall?: string;
      secondSittingMarks?: string;
      secondSittingMax?: string;
    };
    aggregates?: {
      period1?: string;
      period2?: string;
      exam1?: string;
      total1?: string;
      period3?: string;
      period4?: string;
      exam2?: string;
      total2?: string;
      overall?: string;
      secondSittingMarks?: string;
      secondSittingMax?: string;
    };
    percentage?: {
      period1?: string;
      period2?: string;
      exam1?: string;
      total1?: string;
      period3?: string;
      period4?: string;
      exam2?: string;
      total2?: string;
      overall?: string;
    };
    position?: {
      period1?: string;
      period2?: string;
      exam1?: string;
      total1?: string;
      period3?: string;
      period4?: string;
      exam2?: string;
      total2?: string;
      overall?: string;
    };
    application?: {
      period1?: string;
      period2?: string;
      period3?: string;
      period4?: string;
      overall?: string;
    };
    behaviour?: {
      period1?: string;
      period2?: string;
      period3?: string;
      period4?: string;
      overall?: string;
    };
  };
  
  // Final Results
  finalResultPercentage?: string;
  isPromoted?: boolean;
  shouldRepeat?: string;
  issueLocation?: string;
  issueDate?: string;
  secondSittingDate?: string;
  centerCode?: string;
  verifierName?: string;
  endorsementDate?: string;
}

interface Form4TemplateProps {
  data?: BulletinData;
  className?: string;
  isEditable?: boolean;
  onDataChange?: (updatedData: BulletinData) => void;
  documentId?: string; // Allow passing document ID from parent
  initialTableSize?: 'auto' | 'normal' | '11px' | '12px' | '13px' | '14px' | '15px'; // Allow setting initial table size
  onTableSizeChange?: (size: 'auto' | 'normal' | '11px' | '12px' | '13px' | '14px' | '15px') => void; // Callback for size changes
}

const Form4Template: React.FC<Form4TemplateProps> = ({ 
  data = {}, 
  className = '',
  isEditable = false,
  onDataChange,
  documentId: propDocumentId // Accept documentId as prop
}) => {

  // Get tableSize from Firestore data (default to 'auto' if not set)
  const currentTableSize = data.tableSize || 'auto';

  // Handle table size changes - save to Firestore like any other field
  const handleTableSizeChange = (newSize: 'auto' | 'normal' | '11px' | '12px' | '13px' | '14px' | '15px') => {
    if (onDataChange) {
      // Pass the entire updated data object to prevent data loss
      onDataChange({ ...data, tableSize: newSize });
    }
  };

  // Normalize subject data to ensure all required properties exist
  const normalizeSubjectData = (subjects: any[]): SubjectGrade[] => {
    if (!subjects || !Array.isArray(subjects)) return [];
    
    return subjects.map(subject => ({
      subject: subject.subject || '',
      firstSemester: {
        period1: subject.firstSemester?.period1 ?? '',
        period2: subject.firstSemester?.period2 ?? '',
        exam: subject.firstSemester?.exam ?? '',
        total: subject.firstSemester?.total ?? ''
      },
      secondSemester: {
        period3: subject.secondSemester?.period3 ?? '',
        period4: subject.secondSemester?.period4 ?? '',
        exam: subject.secondSemester?.exam ?? '',
        total: subject.secondSemester?.total ?? ''
      },
      overallTotal: subject.overallTotal ?? '',
      maxima: subject.maxima || {
        periodMaxima: 20,
        examMaxima: 40,
        totalMaxima: 80
      },
      secondSitting: subject.secondSitting
    }));
  };

  // Normalize the input data to prevent errors
  const normalizedData = {
    ...data,
    subjects: normalizeSubjectData(data.subjects || [])
  };

  // Calculate dynamic sizing based on total subjects count with manual override support
  const getDynamicSizing = useMemo(() => {
    const totalSubjects = (normalizedData.subjects || []).filter(s => s.subject || s.maxima).length;
    const maxBaseRows = 15; // Same as Form6
    
    // Determine sizing tier
    let sizingTier: 'normal' | '11px' | '12px' | '13px' | '14px' | '15px';
    
    // Use tableSize from data if set, otherwise use automatic sizing
    if (currentTableSize !== 'auto') {
      sizingTier = currentTableSize;
      console.log(`📏 Form4 Manual Sizing: Using size "${sizingTier}" from Firestore for ${totalSubjects} subjects`);
    } else {
      // Automatic sizing based on subject count - same as Form6
      if (totalSubjects <= maxBaseRows) {
        sizingTier = '13px'; // Start with 13px for better fit
      } else if (totalSubjects <= 25) {
        sizingTier = '12px';
      } else {
        sizingTier = '11px';
      }
      console.log(`📏 Form4 Auto Sizing: ${totalSubjects} subjects → "${sizingTier}" tier`);
    }
    
    // Apply the sizing configuration
    let sizing;
    if (sizingTier === 'normal') {
      // Normal sizing - more compact than before
      sizing = {
        cellPadding: 'px-0.5 py-[1px]',
        fontSize: 'text-xs',
        headerPadding: 'px-0.5 py-[1px]',
        headerFontSize: 'text-xs',
        compactMode: false
      };
    } else if (sizingTier === '15px') {
      // 15px sizing
      sizing = {
        cellPadding: 'px-0.5 py-[2px]',
        fontSize: 'text-[15px]',
        headerPadding: 'px-0.5 py-[2px]',
        headerFontSize: 'text-[15px]',
        compactMode: false
      };
    } else if (sizingTier === '14px') {
      // 14px sizing
      sizing = {
        cellPadding: 'px-0.5 py-[1px]',
        fontSize: 'text-[14px]',
        headerPadding: 'px-0.5 py-[1px]',
        headerFontSize: 'text-[14px]',
        compactMode: false
      };
    } else if (sizingTier === '13px') {
      // 13px sizing - default for moderate tables
      sizing = {
        cellPadding: 'px-0.5 py-[0.5px]',
        fontSize: 'text-[13px]',
        headerPadding: 'px-0.5 py-[0.5px]',
        headerFontSize: 'text-[13px]',
        compactMode: true
      };
    } else if (sizingTier === '12px') {
      // 12px sizing for medium tables
      sizing = {
        cellPadding: 'px-0.5 py-[0.5px]',
        fontSize: 'text-[12px]',
        headerPadding: 'px-0.5 py-[0.5px]',
        headerFontSize: 'text-[12px]',
        compactMode: true
      };
    } else {
      // 11px sizing for large tables
      sizing = {
        cellPadding: 'px-0.5 py-0',
        fontSize: 'text-[11px]',
        headerPadding: 'px-0.5 py-0',
        headerFontSize: 'text-[11px]',
        compactMode: true
      };
    }
    
    return sizing;
  }, [normalizedData.subjects, currentTableSize]);

  // Editable field component with auto-save
  const EditableField: React.FC<{
    value: string | number;
    onChange?: (value: string) => void;
    className?: string;
    isEditable?: boolean;
    placeholder?: string;
    field?: string;
    isTableCell?: boolean; // New prop to indicate if this is in a table cell
  }> = ({ value, onChange, className = '', isEditable = false, placeholder = '', field = '', isTableCell = false }) => {
    const [isEditing, setIsEditing] = React.useState(false);
    const [editValue, setEditValue] = React.useState(String(value || ''));
    const [isSaving, setIsSaving] = React.useState(false);
    const [showSuccess, setShowSuccess] = React.useState(false);

    // Update edit value when prop value changes (but not while editing)
    React.useEffect(() => {
      if (!isEditing) {
        setEditValue(String(value || ''));
      }
    }, [value, isEditing]);

    const handleSave = async () => {
      if (!onChange || editValue === String(value || '')) {
        setIsEditing(false);
        return;
      }

      try {
        setIsSaving(true);
        
        console.log(`💾 Saving field "${field}": "${editValue}"`);
        
        // Call the onChange handler which will trigger the Firestore update
        await onChange(editValue);
        
        console.log(`✅ Field "${field}" saved successfully`);
        
        setIsEditing(false);
        
        // Show success indicator
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 2000); // Hide after 2 seconds
      } catch (error) {
        console.error(`❌ Failed to save field "${field}":`, error);
        // Revert to original value on error
        setEditValue(String(value || ''));
        setIsEditing(false);
      } finally {
        setIsSaving(false);
      }
    };

    const handleCancel = () => {
      setEditValue(String(value || ''));
      setIsEditing(false);
    };

    if (isEditable && isEditing) {
      return (
        <div className={isTableCell ? "w-full h-full relative" : "inline-block relative"}>
          <input
            type="text"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            className={`${isTableCell ? 'w-full h-full' : ''} border-2 border-blue-400 bg-white px-1 py-0.5 text-xs rounded-none shadow-sm focus:border-blue-600 focus:outline-none min-w-0 ${className}`}
            placeholder={placeholder}
            autoFocus
            disabled={isSaving}
            onBlur={handleSave}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleSave();
              } else if (e.key === 'Escape') {
                e.preventDefault();
                handleCancel();
              }
            }}
            style={{ 
              fontSize: 'inherit', 
              lineHeight: 'inherit',
              boxSizing: 'border-box'
            }}
          />
          {isSaving && (
            <div className="absolute -top-1 -right-1">
              <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse flex items-center justify-center">
                <div className="w-1 h-1 bg-white rounded-full"></div>
              </div>
            </div>
          )}
        </div>
      );
    }

    const displayValue = String(value || placeholder || '');
    
    if (isTableCell) {
      return (
        <div 
          className={`w-full h-full relative ${className} ${isEditable ? 'cursor-pointer hover:bg-yellow-100 hover:shadow-sm px-1 py-0.5 rounded-none transition-colors duration-150' : ''} ${displayValue ? '' : 'text-gray-400 italic'}`}
          onClick={() => isEditable && setIsEditing(true)}
          title={isEditable ? 'Click to edit' : ''}
          style={{ 
            fontSize: 'inherit', 
            lineHeight: 'inherit',
            minHeight: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: className.includes('text-left') ? 'flex-start' : 
                           className.includes('text-right') ? 'flex-end' : 'center',
            boxSizing: 'border-box'
          }}
        >
          {displayValue || (isEditable ? 'Click to edit' : '')}
          {showSuccess && (
            <div className="absolute -top-1 -right-1">
              <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center animate-pulse">
                <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          )}
        </div>
      );
    }
    
    return (
      <span 
        className={`relative inline-block ${className} ${isEditable ? 'cursor-pointer hover:bg-yellow-100 hover:shadow-sm px-1 py-0.5 rounded-none transition-colors duration-150' : ''} ${displayValue ? '' : 'text-gray-400 italic'}`}
        onClick={() => isEditable && setIsEditing(true)}
        title={isEditable ? 'Click to edit' : ''}
        style={{ 
          fontSize: 'inherit', 
          lineHeight: 'inherit'
        }}
      >
        {displayValue || (isEditable ? 'Click to edit' : '')}
        {showSuccess && (
          <div className="absolute -top-1 -right-1">
            <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center animate-pulse">
              <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        )}
      </span>
    );
  };

  // Helper functions for automatic calculations
  const calculateFirstSemesterTotal = (subject: any) => {
    const period1 = parseFloat(subject.firstSemester?.period1 || '0') || 0;
    const period2 = parseFloat(subject.firstSemester?.period2 || '0') || 0;
    const exam = parseFloat(subject.firstSemester?.exam || '0') || 0;
    return period1 + period2 + exam;
  };

  const calculateSecondSemesterTotal = (subject: any) => {
    const period3 = parseFloat(subject.secondSemester?.period3 || '0') || 0;
    const period4 = parseFloat(subject.secondSemester?.period4 || '0') || 0;
    const exam = parseFloat(subject.secondSemester?.exam || '0') || 0;
    return period3 + period4 + exam;
  };

  const calculateOverallTotal = (subject: any) => {
    const firstTotal = calculateFirstSemesterTotal(subject);
    const secondTotal = calculateSecondSemesterTotal(subject);
    return firstTotal + secondTotal;
  };

  // Helper function to update subject data
  const updateSubjectField = (subjectIndex: number, fieldPath: string, value: string) => {
    if (!onDataChange) return;
    
    const newSubjects = [...(data.subjects || [])];
    const subject = newSubjects[subjectIndex];
    if (!subject) return;

    // Ensure secondSitting exists for all subjects
    if (!subject.secondSitting) {
      subject.secondSitting = { marks: '', max: '' };
    }
    
    // Update the specific field using dot notation
    const fields = fieldPath.split('.');
    let target: any = subject;
    
    for (let i = 0; i < fields.length - 1; i++) {
      if (!target[fields[i]]) {
        target[fields[i]] = {};
      }
      target = target[fields[i]];
    }
    
    target[fields[fields.length - 1]] = value;
    
    // Automatically calculate totals after updating period or exam values
    if (fieldPath.includes('period1') || fieldPath.includes('period2') || fieldPath.includes('firstSemester.exam')) {
      subject.firstSemester.total = calculateFirstSemesterTotal(subject);
    }
    
    if (fieldPath.includes('period3') || fieldPath.includes('period4') || fieldPath.includes('secondSemester.exam')) {
      subject.secondSemester.total = calculateSecondSemesterTotal(subject);
    }
    
    // Always recalculate overall total when any semester values change
    if (fieldPath.includes('period') || fieldPath.includes('exam')) {
      subject.overallTotal = calculateOverallTotal(subject);
    }
    
    // Subject field updated
    
    onDataChange({ ...data, subjects: newSubjects });
  };

  // Helper function to update summary values with auto-calculation for aggregates
  const updateSummaryField = (section: string, field: string, value: string) => {
    if (!onDataChange) {
      console.warn(`onDataChange is not provided, cannot update summary field ${section}.${field}`);
      return;
    }
    
    console.log(`📝 updateSummaryField called: section="${section}", field="${field}", value="${value}"`);
    
    const newSummaryValues = { ...data.summaryValues };
    
    // Initialize section if it doesn't exist OR if it's a string (old format)
    if (!newSummaryValues[section as keyof typeof newSummaryValues] || 
        typeof newSummaryValues[section as keyof typeof newSummaryValues] === 'string') {
      newSummaryValues[section as keyof typeof newSummaryValues] = {} as any;
    }
    
    (newSummaryValues[section as keyof typeof newSummaryValues] as any)[field] = value;
    
    // Auto-calculate totals for AGGREGATES row (like subjects)
    if (section === 'aggregates') {
      const aggregates = newSummaryValues.aggregates || {};
      
      // Calculate first semester total (period1 + period2 + exam1)
      if (field === 'period1' || field === 'period2' || field === 'exam1') {
        const period1 = parseFloat(aggregates.period1 || '0') || 0;
        const period2 = parseFloat(aggregates.period2 || '0') || 0;
        const exam1 = parseFloat(aggregates.exam1 || '0') || 0;
        aggregates.total1 = String(period1 + period2 + exam1);
      }
      
      // Calculate second semester total (period3 + period4 + exam2)
      if (field === 'period3' || field === 'period4' || field === 'exam2') {
        const period3 = parseFloat(aggregates.period3 || '0') || 0;
        const period4 = parseFloat(aggregates.period4 || '0') || 0;
        const exam2 = parseFloat(aggregates.exam2 || '0') || 0;
        aggregates.total2 = String(period3 + period4 + exam2);
      }
      
      // Calculate overall total (total1 + total2)
      const total1 = parseFloat(aggregates.total1 || '0') || 0;
      const total2 = parseFloat(aggregates.total2 || '0') || 0;
      aggregates.overall = String(total1 + total2);
      
      newSummaryValues.aggregates = aggregates;
    }
    
    const updatedData = { ...data, summaryValues: newSummaryValues };
    
    console.log(`🔄 Calling onDataChange with updatedData:`, updatedData);
    
    onDataChange(updatedData);
  };

  // Sort subjects by maxima values (same logic as backend)
  const sortSubjectsByMaxima = (subjects: SubjectGrade[]) => {
    if (!subjects || !Array.isArray(subjects)) {
      return subjects;
    }

    return subjects.sort((a, b) => {
      // Get the maximum maxima value for each subject
      const getMaxMaxima = (subject: SubjectGrade) => {
        if (!subject.maxima) return 0;
        
        const { periodMaxima, examMaxima, totalMaxima } = subject.maxima;
        
        // Use totalMaxima if available, otherwise use the highest of period/exam maxima
        if (totalMaxima !== null && totalMaxima !== undefined) {
          return totalMaxima;
        }
        
        const maxPeriod = periodMaxima || 0;
        const maxExam = examMaxima || 0;
        
        return Math.max(maxPeriod, maxExam);
      };

      const maximaA = getMaxMaxima(a);
      const maximaB = getMaxMaxima(b);

      // Sort by maxima values (ascending: lower values first)
      if (maximaA !== maximaB) {
        return maximaA - maximaB;
      }

      // Keep original order when maxima are equal (no alphabetical sorting)
      return 0;
    });
  };

  // Sort subjects before grouping (memoized for performance)
  // const sortedSubjects = useMemo(() => {
  //   return sortSubjectsByMaxima([...(data.subjects || [])]);
  // }, [data.subjects]);

  // Helper function to update maxima values for a specific group
  const updateMaximaField = (groupIndex: number, field: string, value: string) => {
    if (!onDataChange) return;
    
    const newSubjects = [...(data.subjects || [])];
    const numericValue = value === '' ? 0 : parseInt(value) || 0;
    
    // Get the current subject groups to find which subjects belong to this group
    const sortedSubjects = sortSubjectsByMaxima([...newSubjects]);
    const currentGroups = (() => {
      const groupSubjectsByMaxima = (subjects: SubjectGrade[]) => {
        const maximaMap = new Map<string, { maxima: Maxima; subjects: SubjectGrade[] }>();

        subjects.forEach(subject => {
          if (!subject.maxima) return;
          
          const maxima = subject.maxima;
          const key = `${maxima.periodMaxima}-${maxima.examMaxima}-${maxima.totalMaxima}`;
          
          if (!maximaMap.has(key)) {
            maximaMap.set(key, { maxima, subjects: [] });
          }
          maximaMap.get(key)!.subjects.push(subject);
        });

        if (maximaMap.size === 0) {
          return [{
            maxima: { periodMaxima: 20, examMaxima: 40, totalMaxima: 80 },
            subjects: subjects.slice(0, 10)
          }];
        }

        return Array.from(maximaMap.values()).sort((a, b) => a.maxima.totalMaxima - b.maxima.totalMaxima);
      };
      
      return groupSubjectsByMaxima(sortedSubjects);
    })();
    
    if (!currentGroups[groupIndex]) return;
    
    const group = currentGroups[groupIndex];
    
    // Update all subjects in this group with the new maxima value
    group.subjects.forEach((subject: SubjectGrade) => {
      const originalSubjectIndex = newSubjects.findIndex(s => s === subject);
      if (originalSubjectIndex !== -1 && newSubjects[originalSubjectIndex]) {
        if (!newSubjects[originalSubjectIndex].maxima) {
          newSubjects[originalSubjectIndex].maxima = {
            periodMaxima: 0,
            examMaxima: 0,
            totalMaxima: 0
          };
        }
        
        switch (field) {
          case 'periodMaxima':
            newSubjects[originalSubjectIndex].maxima!.periodMaxima = numericValue;
            break;
          case 'examMaxima':
            newSubjects[originalSubjectIndex].maxima!.examMaxima = numericValue;
            break;
          case 'totalMaxima':
            newSubjects[originalSubjectIndex].maxima!.totalMaxima = numericValue;
            break;
        }
      }
    });
    
    onDataChange({ ...data, subjects: newSubjects });
  };

  try {
  // We'll use empty array as default when normalizedData.subjects is empty

  // Safe grade rendering function to handle both strings and numbers
  const renderGrade = (grade: number | string | null | undefined): string => {
    if (grade === null || grade === undefined || grade === '') {
      return '';
    }
    
    // If it's already a string, return it
    if (typeof grade === 'string') {
      return grade;
    }
    
    // If it's a number, convert to string
    if (typeof grade === 'number') {
      return grade.toString();
    }
    
    // Fallback for any other type
    return String(grade);
  };

  // Use normalizedData.subjects directly in sortedSubjects useMemo
  
  // Drag and drop state
  const [draggedGroupIndex, setDraggedGroupIndex] = useState<number | null>(null);
  
  // Document verification state
  const [documentId, setDocumentId] = useState<string>(propDocumentId || '');
  
  console.log('🔍 Form4Template - propDocumentId:', propDocumentId, 'documentId state:', documentId);

  // Update document ID when prop changes
  useEffect(() => {
    if (propDocumentId && propDocumentId !== documentId) {
      console.log('🔄 Form4Template - Setting prop documentId:', propDocumentId);
      setDocumentId(propDocumentId);
    }
  }, [propDocumentId, documentId]);

  // Drag handlers
  const handleDragStart = (e: React.DragEvent, groupIndex: number) => {
    setDraggedGroupIndex(groupIndex);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', groupIndex.toString());
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetGroupIndex: number) => {
    e.preventDefault();
    
    if (draggedGroupIndex === null || draggedGroupIndex === targetGroupIndex) {
      setDraggedGroupIndex(null);
      return;
    }

    // Reordering group
    
    // Move the group
    moveMaximaGroup(draggedGroupIndex, targetGroupIndex);
    setDraggedGroupIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedGroupIndex(null);
  };

  // Sort subjects by maxima values (same logic as backend)
  const sortSubjectsByMaxima = (subjects: SubjectGrade[]) => {
    if (!subjects || !Array.isArray(subjects)) {
      return subjects;
    }

    return subjects.sort((a, b) => {
      // Get the maximum maxima value for each subject
      const getMaxMaxima = (subject: SubjectGrade) => {
        if (!subject.maxima) return 0;
        
        const { periodMaxima, examMaxima, totalMaxima } = subject.maxima;
        
        // Use totalMaxima if available, otherwise use the highest of period/exam maxima
        if (totalMaxima !== null && totalMaxima !== undefined) {
          return totalMaxima;
        }
        
        const maxPeriod = periodMaxima || 0;
        const maxExam = examMaxima || 0;
        
        return Math.max(maxPeriod, maxExam);
      };

      const maximaA = getMaxMaxima(a);
      const maximaB = getMaxMaxima(b);

      // Sort by maxima values (ascending: lower values first)
      if (maximaA !== maximaB) {
        return maximaA - maximaB;
      }

      // Keep original order when maxima are equal (no alphabetical sorting)
      return 0;
    });
  };

  // Sort subjects by maxima (preserve original order for equal maxima)
  const sortedSubjects = useMemo(() => {
    return sortSubjectsByMaxima([...(normalizedData.subjects || [])]);
  }, [normalizedData.subjects]);

  // Group subjects by their maxima values (memoized for performance)
  const subjectGroups = useMemo(() => {
    const groupSubjectsByMaxima = (subjects: SubjectGrade[]) => {
      const maximaMap = new Map<string, { maxima: Maxima; subjects: SubjectGrade[] }>();

      subjects.forEach(subject => {
        // Skip subjects without maxima (empty template subjects)
        if (!subject.maxima) {
          return;
        }
        
        const maxima = subject.maxima;
        const key = `${maxima.periodMaxima}-${maxima.examMaxima}-${maxima.totalMaxima}`;
        
        if (!maximaMap.has(key)) {
          maximaMap.set(key, { maxima, subjects: [] });
        }
        maximaMap.get(key)!.subjects.push(subject);
      });

      // If no subjects with maxima, return empty template group for display
      if (maximaMap.size === 0) {
        return [{
          maxima: { periodMaxima: 20, examMaxima: 40, totalMaxima: 80 },
          subjects: subjects.slice(0, 10) // Show first 10 empty subjects for template
        }];
      }

      // Convert map to array and sort by total maxima (ascending - smallest first)
      return Array.from(maximaMap.values()).sort((a, b) => a.maxima.totalMaxima - b.maxima.totalMaxima);
    };
    
    return groupSubjectsByMaxima(sortedSubjects);
  }, [sortedSubjects]);

  // MAXIMA Group Management Functions
  const addMaximaGroup = (newMaxima: Maxima = { periodMaxima: 20, examMaxima: 40, totalMaxima: 80 }) => {
    if (!onDataChange) return;
    
    const newSubjects = [...(data.subjects || [])];
    
    // Add a new empty subject with the new maxima values
    const newSubject: SubjectGrade = {
      subject: '',
      firstSemester: { period1: '', period2: '', exam: '', total: '' },
      secondSemester: { period3: '', period4: '', exam: '', total: '' },
      overallTotal: '',
      secondSitting: { marks: '', max: '' },
      maxima: newMaxima
    };
    
    newSubjects.push(newSubject);
    onDataChange({ ...data, subjects: newSubjects });
    // Added new MAXIMA group
  };

  const addSubjectToGroup = (groupIndex: number) => {
    if (!onDataChange) {
      console.error("Cannot add subject: onDataChange function not provided");
      return;
    }
    
    console.log("Adding subject to group:", groupIndex);
    
    const currentGroups = subjectGroups;
    if (groupIndex < 0 || groupIndex >= currentGroups.length) {
      console.error(`Cannot add subject: Invalid group index ${groupIndex}`);
      return;
    }
    
    const targetGroup = currentGroups[groupIndex];
    const newSubjects = [...(data.subjects || [])];
    
    // Create a new subject with the same maxima as the group
    const newSubject: SubjectGrade = {
      subject: '',
      firstSemester: { period1: '', period2: '', exam: '', total: '' },
      secondSemester: { period3: '', period4: '', exam: '', total: '' },
      overallTotal: '',
      secondSitting: { marks: '', max: '' },
      maxima: { ...targetGroup.maxima }
    };
    
    newSubjects.push(newSubject);
    console.log("Added new subject:", newSubject);
    console.log("Updated subjects array:", newSubjects);
    
    onDataChange({ ...data, subjects: newSubjects });
    console.log("Subject added to group successfully");
    // Added new subject to group
  };

  const deleteSubject = (subjectIndex: number) => {
    if (!onDataChange) {
      console.error("Cannot delete subject: onDataChange function not provided");
      return;
    }
    
    // Log the data.subjects before deletion for debugging
    console.log("Current subjects:", data.subjects);
    console.log("Attempting to delete subject at index:", subjectIndex);
    
    const currentSubjects = [...(data.subjects || [])];
    if (subjectIndex < 0 || subjectIndex >= currentSubjects.length) {
      console.error(`Cannot delete subject: Invalid index ${subjectIndex}`);
      return;
    }
    
    const subject = currentSubjects[subjectIndex];
    const subjectName = subject.subject || 'Unnamed Subject';
    
    // Confirm deletion
    if (!confirm(`Are you sure you want to delete "${subjectName}"?`)) {
      return;
    }
    
    // Remove the subject at the specified index
    currentSubjects.splice(subjectIndex, 1);
    
    // Update the data
    onDataChange({ ...data, subjects: currentSubjects });
    console.log(`Subject "${subjectName}" deleted successfully`);
    console.log("Updated subjects:", currentSubjects);
    // Deleted subject
  };

  const addCustomMaximaGroup = () => {
    const periodMaxima = prompt('Enter Period Maxima (e.g., 20):');
    const examMaxima = prompt('Enter Exam Maxima (e.g., 40):');
    const totalMaxima = prompt('Enter Total Maxima (e.g., 80):');
    
    if (periodMaxima && examMaxima && totalMaxima) {
      const newMaxima: Maxima = {
        periodMaxima: parseInt(periodMaxima) || 20,
        examMaxima: parseInt(examMaxima) || 40,
        totalMaxima: parseInt(totalMaxima) || 80
      };
      addMaximaGroup(newMaxima);
    }
  };

  const deleteMaximaGroup = (groupIndex: number) => {
    if (!onDataChange) return;
    
    const currentGroups = subjectGroups;
    if (groupIndex < 0 || groupIndex >= currentGroups.length) return;
    
    const groupToDelete = currentGroups[groupIndex];
    const newSubjects = (data.subjects || []).filter(subject => 
      !groupToDelete.subjects.includes(subject)
    );
    
    onDataChange({ ...data, subjects: newSubjects });
    // Deleted MAXIMA group
  };

  const moveMaximaGroup = (fromIndex: number, toIndex: number) => {
    if (!onDataChange) return;
    
    const currentGroups = [...subjectGroups];
    if (fromIndex < 0 || fromIndex >= currentGroups.length || 
        toIndex < 0 || toIndex >= currentGroups.length) return;
    
    // Reorder the groups
    const [movedGroup] = currentGroups.splice(fromIndex, 1);
    currentGroups.splice(toIndex, 0, movedGroup);
    
    // Reconstruct subjects array in new order
    const newSubjects: SubjectGrade[] = [];
    currentGroups.forEach(group => {
      newSubjects.push(...group.subjects);
    });
    
    onDataChange({ ...data, subjects: newSubjects });
    // Moved MAXIMA group
  };

  // Render ID number boxes
  const renderIdBoxes = () => {
    const idString = data.idNumber || '';
    return Array.from({ length: 18 }, (_, i) => (
      <td key={i} className="border border-gray-900 h-6 w-[2%] text-center text-xs bg-white">
        {idString[i] || ''}
      </td>
    ));
  };

  // Render editable code boxes
  const renderEditableCodeBoxes = (code: string = '', count: number = 8, isEditable: boolean = false, onChange?: (value: string) => void) => {
    if (!isEditable) {
      return Array.from({ length: count }, (_, i) => (
        <span key={i} className="w-5 h-5 border border-gray-900 inline-flex items-center justify-center text-xs mr-0.5 bg-white">
          {code[i] || ''}
        </span>
      ));
    }

    return Array.from({ length: count }, (_, i) => (
      <input
        key={i}
        type="text"
        maxLength={1}
        value={code[i] || ''}
        onChange={(e) => {
          const newCode = code.split('');
          newCode[i] = e.target.value;
          const updatedCode = newCode.join('').slice(0, count);
          if (onChange) onChange(updatedCode);
        }}
        className="w-5 h-5 border border-gray-900 text-center text-xs mr-0.5 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
        onKeyDown={(e) => {
          if (e.key === 'Backspace' && !e.currentTarget.value && i > 0) {
            // Focus previous input on backspace
            const prevInput = e.currentTarget.previousElementSibling as HTMLInputElement;
            if (prevInput) prevInput.focus();
          } else if (e.key.length === 1 && i < count - 1) {
            // Auto-focus next input when typing
            const nextInput = e.currentTarget.nextElementSibling as HTMLInputElement;
            if (nextInput) nextInput.focus();
          }
        }}
      />
    ));
  };



  return (
    <div className={`bg-white relative ${className}`}>        {/* A4 Container with proper dimensions + relative positioning for QR code */}
        <div 
          id="bulletin-template"
          data-testid="bulletin-template"
          className="mx-auto bg-white shadow-lg print:shadow-none"
          style={{
            width: '210mm',
            minHeight: isEditable ? 'auto' : '297mm',
            height: isEditable ? 'auto' : '297mm',
            maxWidth: '210mm',
            fontSize: '6pt',
            lineHeight: '1.0',
            fontFamily: 'Arial, sans-serif',
            overflow: isEditable ? 'visible' : 'hidden'
          }}
        >
        {/* Outer table wrapper for guaranteed PDF borders */}
        <table className="w-full border-2 border-black print:border-black print:border-1 border-collapse" style={{minHeight: isEditable ? 'auto' : '297mm'}}>
          <tbody>
            <tr>
              <td className="p-0 align-top" style={{minHeight: isEditable ? 'auto' : '297mm'}}>
                {/* All content wrapped in table cell */}
        {/* Header with Logos and Titles */}
        <div className="flex items-center justify-between p-1 border-b border-gray-300">
          <img
            src="/flag.png"
            alt="DRC Flag"
            className="h-10"
          />
          <div className="text-center">
            <h1 className="text-sm font-bold">Democratic Republic of the Congo</h1>
            <p className="text-sm uppercase font-medium">
              MINISTRY OF PRIMARY, SECONDARY & TECHNICAL EDUCATION
            </p>
          </div>
          <img
            src="/Coat.png"
            alt="Emblem"
            className="h-10"
          />
        </div>

        {/* ID Number Row */}
        <div className="p-1 border-t border-b border-gray-700">
          <table className="w-full table-fixed">
            <tbody>
              <tr>
                <th className="px-1 text-left text-sm w-[3%]">N° ID.</th>
                {renderIdBoxes()}
              </tr>
            </tbody>
          </table>
        </div>

        {/* Province Row */}
        <div className="p-1 border-t border-b border-gray-700">
          <div className="flex items-center text-xs">
            <strong className="mr-2">PROVINCE:</strong> 
            <EditableField 
              value={data.province || ''} 
              isEditable={isEditable}
              placeholder="Enter province"
              field="province"
              className="flex-grow"
              onChange={(value) => {
                if (onDataChange) {
                  onDataChange({ ...data, province: value });
                }
              }}
            />
          </div>
        </div>

        {/* Student Info Section */}
        <div className="p-1 border-b border-gray-300">
          <table className="w-full border-collapse text-xs">
            <tbody>
              <tr>
                <td className="px-1 py-0.5 w-1/2 border-r border-gray-300 align-top">
                  <div className="flex items-center">
                    <strong className="mr-1">CITY:</strong> 
                    <EditableField 
                      value={data.city || ''} 
                      isEditable={isEditable}
                      placeholder="Enter city"
                      field="city"
                      onChange={(value) => {
                        if (onDataChange) {
                          onDataChange({ ...data, city: value });
                        }
                      }}
                    />
                  </div>
                </td>
                <td className="px-1 py-0.5 align-top">
                  <div className="flex items-center flex-nowrap">
                    <strong className="mr-1 flex-shrink-0">STUDENT:</strong> 
                    <EditableField 
                      value={data.studentName || ''} 
                      isEditable={isEditable}
                      placeholder="Enter student name"
                      field="studentName"
                      className="flex-grow mr-2 min-w-0"
                      onChange={(value) => onDataChange && onDataChange({ ...data, studentName: value })}
                    />
                    <strong className="mr-1 whitespace-nowrap flex-shrink-0">GENDER:</strong> 
                    <EditableField 
                      value={data.gender || ''} 
                      isEditable={isEditable}
                      placeholder="M/F"
                      field="gender"
                      className="w-6 flex-shrink-0"
                      onChange={(value) => onDataChange && onDataChange({ ...data, gender: value })}
                    />
                  </div>
                </td>
              </tr>
              <tr>
                <td className="px-1 py-0.5 border-r border-gray-300 align-top">
                  <div className="flex items-center">
                    <strong className="mr-1">MUNICIPALITY:</strong> 
                    <EditableField 
                      value={data.municipality || ''} 
                      isEditable={isEditable}
                      placeholder="Enter municipality"
                      field="municipality"
                      onChange={(value) => {
                        if (onDataChange) {
                          onDataChange({ ...data, municipality: value });
                        }
                      }}
                    />
                  </div>
                </td>
                <td className="px-1 py-0.5 align-top">
                  <div className="flex items-center">
                    <strong className="mr-1">BORN IN:</strong> 
                    <EditableField 
                      value={data.birthPlace || ''} 
                      isEditable={isEditable}
                      placeholder="Enter birth place"
                      field="birthPlace"
                      className="flex-grow mr-3"
                      onChange={(value) => {
                        if (onDataChange) {
                          onDataChange({ ...data, birthPlace: value });
                        }
                      }}
                    />
                    <strong className="mr-1 whitespace-nowrap">ON:</strong> 
                    <EditableField 
                      value={data.birthDate || ''} 
                      isEditable={isEditable}
                      placeholder="DD/MM/YYYY"
                      field="birthDate"
                      className="w-20 flex-shrink-0"
                      onChange={(value) => {
                        if (onDataChange) {
                          onDataChange({ ...data, birthDate: value });
                        }
                      }}
                    />
                  </div>
                </td>
              </tr>
              <tr>
                <td className="px-1 py-0.5 border-r border-gray-300 align-top">
                  <div className="flex items-center">
                    <strong className="mr-1">SCHOOL:</strong> 
                    <EditableField 
                      value={data.school || ''} 
                      isEditable={isEditable}
                      placeholder="Enter school name"
                      field="school"
                      onChange={(value) => {
                        if (onDataChange) {
                          onDataChange({ ...data, school: value });
                        }
                      }}
                    />
                  </div>
                </td>
                <td className="px-1 py-0.5 align-top">
                  <div className="flex items-center">
                    <strong className="mr-1">CLASS:</strong> 
                    <EditableField 
                      value={data.class || ''} 
                      isEditable={isEditable}
                      placeholder="Enter class"
                      field="class"
                      onChange={(value) => {
                        if (onDataChange) {
                          onDataChange({ ...data, class: value });
                        }
                      }}
                    />
                  </div>
                </td>
              </tr>
              <tr>
                <td className="px-1 py-0.5 align-top">
                  <div className="flex items-center">
                    <strong className="mr-2">CODE:</strong>
                    <div className="inline-flex">
                      {renderEditableCodeBoxes(
                        data.schoolCode || '', 
                        8, 
                        isEditable, 
                        (value) => {
                          if (onDataChange) {
                            onDataChange({ ...data, schoolCode: value });
                          }
                        }
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-1 py-0.5 align-top">
                  <div className="flex items-center">
                    <strong className="mr-2">N° PERM.</strong>
                    <div className="inline-flex">
                      {renderEditableCodeBoxes(
                        data.permanentNumber || '', 
                        8, 
                        isEditable, 
                        (value) => {
                          if (onDataChange) {
                            onDataChange({ ...data, permanentNumber: value });
                          }
                        }
                      )}
                    </div>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Report Card Header */}
        <div className="px-1 py-0.5 border-t border-black">
          <p className="text-xs font-semibold uppercase text-center">
            REPORT CARD - {data.class || '4TH YEAR HUMANITIES MATH – PHYSICS'} | SCHOOL YEAR: <EditableField 
              value={data.academicYear || ''} 
              isEditable={isEditable}
              placeholder="Enter academic year"
              field="academicYear"
              onChange={(value) => {
                if (onDataChange) {
                  onDataChange({ ...data, academicYear: value });
                }
              }}
            />
          </p>
        </div>

        {/* Grades Table */}
        <div className="print:break-inside-avoid">
          {/* MAXIMA Group Controls (only in edit mode) and Size Control (always visible) */}
          <div className={`mb-2 flex items-center ${isEditable ? 'justify-between' : 'justify-end'}`}>
            {/* MAXIMA Group Controls - only in edit mode */}
            {isEditable && (
              <div className="flex space-x-2">
                <button
                  onClick={() => addMaximaGroup()}
                  className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white text-xs rounded flex items-center space-x-1"
                  title="Add new MAXIMA group with default values (20/40/80)"
                >
                  <span>+</span>
                  <span>Add MAXIMA Group</span>
                </button>
                <button
                  onClick={addCustomMaximaGroup}
                  className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white text-xs rounded flex items-center space-x-1"
                  title="Add new MAXIMA group with custom values"
                >
                  <span>⚙</span>
                  <span>Custom MAXIMA</span>
                </button>
              </div>
            )}
            
            {/* Size Control - always visible for adjusting view */}
            <div 
              className="table-size-control flex items-center space-x-2" 
              style={{ display: 'flex' }}
            >
              <label htmlFor="sizeControl" className="text-xs font-medium text-gray-700">
                Table Size:
              </label>
              <select
                id="sizeControl"
                value={currentTableSize}
                onChange={(e) => handleTableSizeChange(e.target.value as 'auto' | 'normal' | '11px' | '12px' | '13px' | '14px' | '15px')}
                className="text-xs border border-gray-300 rounded px-2 py-1 bg-white focus:border-blue-500 focus:outline-none"
              >
                <option value="auto">Auto ({(() => {
                  const totalSubjects = (normalizedData.subjects || []).filter(s => s.subject || s.maxima).length;
                  if (totalSubjects <= 15) return '13px';
                  if (totalSubjects <= 25) return '12px';
                  return '11px';
                })()})</option>
                <option value="normal">Normal (text-xs)</option>
                <option value="15px">15px</option>
                <option value="14px">14px</option>
                <option value="13px">13px</option>
                <option value="12px">12px</option>
                <option value="11px">11px</option>
              </select>
            </div>
          </div>
          
          <table className="table-fixed w-full border-collapse" style={{ fontSize: getDynamicSizing.fontSize.replace('text-', ''), lineHeight: getDynamicSizing.compactMode ? '1.0' : '1.1' }}>
            <thead>
              {/* Semester Group Headers */}
              <tr className="text-center">
                <th rowSpan={3} className={`border border-black ${getDynamicSizing.headerPadding} ${getDynamicSizing.headerFontSize} w-20 uppercase bg-white`}>
                  SUBJECTS
                </th>
                <th colSpan={4} className={`border border-black ${getDynamicSizing.headerPadding} uppercase ${getDynamicSizing.headerFontSize} w-24 bg-white`}>
                  FIRST SEMESTER
                </th>
                <th colSpan={4} className={`border border-black ${getDynamicSizing.headerPadding} uppercase ${getDynamicSizing.headerFontSize} w-24 bg-white`}>
                  SECOND SEMESTER
                </th>
                <th rowSpan={3} className={`border border-black ${getDynamicSizing.headerPadding} uppercase ${getDynamicSizing.headerFontSize} w-8 bg-white`}>
                  OVERALL TOTAL
                </th>
                <th rowSpan={3} className={`border border-black ${getDynamicSizing.headerPadding} bg-black w-1`}>&nbsp;</th>
                <th rowSpan={2} colSpan={2} className={`border border-black ${getDynamicSizing.headerPadding} uppercase ${getDynamicSizing.headerFontSize} w-14 bg-white`}>
                  SECOND SITTING
                </th>
              </tr>
              {/* Criteria Headers */}
              <tr className="text-center">
                <th colSpan={2} className={`border border-black ${getDynamicSizing.headerPadding} ${getDynamicSizing.headerFontSize} uppercase bg-white`}>
                  DAILY WORK
                </th>
                <th rowSpan={2} className={`border border-black ${getDynamicSizing.headerPadding} ${getDynamicSizing.headerFontSize} uppercase bg-white`}>
                  EXAM
                </th>
                <th rowSpan={2} className={`border border-black ${getDynamicSizing.headerPadding} ${getDynamicSizing.headerFontSize} uppercase bg-white`}>
                  TOTAL
                </th>
                <th colSpan={2} className={`border border-black ${getDynamicSizing.headerPadding} ${getDynamicSizing.headerFontSize} uppercase bg-white`}>
                  DAILY WORK
                </th>
                <th rowSpan={2} className={`border border-black ${getDynamicSizing.headerPadding} ${getDynamicSizing.headerFontSize} uppercase bg-white`}>
                  EXAM
                </th>
                <th rowSpan={2} className={`border border-black ${getDynamicSizing.headerPadding} ${getDynamicSizing.headerFontSize} uppercase bg-white`}>
                  TOTAL
                </th>
              </tr>
              {/* Period Labels */}
              <tr className="text-center">
                <th className={`border border-black ${getDynamicSizing.headerPadding} ${getDynamicSizing.headerFontSize} bg-white`}>1<sup>st</sup> P.</th>
                <th className={`border border-black ${getDynamicSizing.headerPadding} ${getDynamicSizing.headerFontSize} bg-white`}>2<sup>nd</sup> P.</th>
                <th className={`border border-black ${getDynamicSizing.headerPadding} ${getDynamicSizing.headerFontSize} bg-white`}>3<sup>rd</sup> P.</th>
                <th className={`border border-black ${getDynamicSizing.headerPadding} ${getDynamicSizing.headerFontSize} bg-white`}>4<sup>th</sup> P.</th>
                <th className={`border border-black ${getDynamicSizing.headerPadding} text-[8px] bg-white`}>%</th>
                <th className={`border border-black ${getDynamicSizing.headerPadding} text-[8px] bg-white`}>SIGN. PROF</th>
              </tr>
            </thead>
            <tbody>
              {(() => {
                let rowIndex = 0;
                let isFirstMaxima = true;
                const totalRows = subjectGroups.reduce((sum, group) => sum + group.subjects.length + 1, 0) + 6; // +1 for MAXIMA row per group, +6 for summary rows
                
                return subjectGroups.map((group, groupIndex) => {
                  const groupRows = [];
                  
                  // MAXIMA row for this group
                  groupRows.push(
                    <tr 
                      key={`maxima-${groupIndex}`} 
                      className={`bg-gray-100 print:bg-gray-200 ${isEditable ? 'cursor-move' : ''} ${draggedGroupIndex === groupIndex ? 'opacity-50' : ''}`}
                      draggable={isEditable}
                      onDragStart={(e) => handleDragStart(e, groupIndex)}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, groupIndex)}
                      onDragEnd={handleDragEnd}
                    >
                      <td className={`border border-black ${getDynamicSizing.cellPadding} ${getDynamicSizing.fontSize} font-bold bg-white relative`}>
                        <div className="flex items-center justify-between">
                          <span className="flex items-center">
                            {isEditable && (
                              <span className="mr-1 text-gray-400" title="Drag to reorder">⋮⋮</span>
                            )}
                            MAXIMA
                          </span>
                          {isEditable && (
                            <div className="flex items-center space-x-1 ml-2">
                              {/* Move Up Button */}
                              {groupIndex > 0 && (
                                <button
                                  onClick={() => moveMaximaGroup(groupIndex, groupIndex - 1)}
                                  className="w-4 h-4 bg-blue-500 hover:bg-blue-600 text-white rounded text-[8px] flex items-center justify-center"
                                  title="Move up"
                                >
                                  ↑
                                </button>
                              )}
                              {/* Move Down Button */}
                              {groupIndex < subjectGroups.length - 1 && (
                                <button
                                  onClick={() => moveMaximaGroup(groupIndex, groupIndex + 1)}
                                  className="w-4 h-4 bg-blue-500 hover:bg-blue-600 text-white rounded text-[8px] flex items-center justify-center"
                                  title="Move down"
                                >
                                  ↓
                                </button>
                              )}
                              {/* Delete Button */}
                              <button
                                onClick={() => deleteMaximaGroup(groupIndex)}
                                className="w-4 h-4 bg-red-500 hover:bg-red-600 text-white rounded text-[8px] flex items-center justify-center"
                                title="Delete group"
                              >
                                ×
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className={`border border-black ${getDynamicSizing.cellPadding} ${getDynamicSizing.fontSize} text-center font-bold bg-white`}>
                        <EditableField 
                          value={group.maxima.periodMaxima}
                          onChange={(value) => updateMaximaField(groupIndex, 'periodMaxima', value)}
                          isEditable={isEditable}
                          placeholder=""
                          field={`maxima-${groupIndex}-period1`}
                          isTableCell={true}
                        />
                      </td>
                      <td className={`border border-black ${getDynamicSizing.cellPadding} ${getDynamicSizing.fontSize} text-center font-bold bg-white`}>
                        <EditableField 
                          value={group.maxima.periodMaxima}
                          onChange={(value) => updateMaximaField(groupIndex, 'periodMaxima', value)}
                          isEditable={isEditable}
                          placeholder=""
                          field={`maxima-${groupIndex}-period2`}
                          isTableCell={true}
                        />
                      </td>
                      <td className={`border border-black ${getDynamicSizing.cellPadding} ${getDynamicSizing.fontSize} text-center font-bold bg-white`}>
                        <EditableField 
                          value={group.maxima.examMaxima}
                          onChange={(value) => updateMaximaField(groupIndex, 'examMaxima', value)}
                          isEditable={isEditable}
                          placeholder=""
                          field={`maxima-${groupIndex}-exam1`}
                          isTableCell={true}
                        />
                      </td>
                      <td className={`border border-black ${getDynamicSizing.cellPadding} ${getDynamicSizing.fontSize} text-center font-bold bg-white`}>
                        <EditableField 
                          value={group.maxima.totalMaxima}
                          onChange={(value) => updateMaximaField(groupIndex, 'totalMaxima', value)}
                          isEditable={isEditable}
                          placeholder=""
                          field={`maxima-${groupIndex}-total1`}
                          isTableCell={true}
                        />
                      </td>
                      <td className={`border border-black ${getDynamicSizing.cellPadding} ${getDynamicSizing.fontSize} text-center font-bold bg-white`}>
                        <EditableField 
                          value={group.maxima.periodMaxima}
                          onChange={(value) => updateMaximaField(groupIndex, 'periodMaxima', value)}
                          isEditable={isEditable}
                          placeholder=""
                          field={`maxima-${groupIndex}-period3`}
                          isTableCell={true}
                        />
                      </td>
                      <td className={`border border-black ${getDynamicSizing.cellPadding} ${getDynamicSizing.fontSize} text-center font-bold bg-white`}>
                        <EditableField 
                          value={group.maxima.periodMaxima}
                          onChange={(value) => updateMaximaField(groupIndex, 'periodMaxima', value)}
                          isEditable={isEditable}
                          placeholder=""
                          field={`maxima-${groupIndex}-period4`}
                          isTableCell={true}
                        />
                      </td>
                      <td className={`border border-black ${getDynamicSizing.cellPadding} ${getDynamicSizing.fontSize} text-center font-bold bg-white`}>
                        <EditableField 
                          value={group.maxima.examMaxima}
                          onChange={(value) => updateMaximaField(groupIndex, 'examMaxima', value)}
                          isEditable={isEditable}
                          placeholder=""
                          field={`maxima-${groupIndex}-exam2`}
                          isTableCell={true}
                        />
                      </td>
                      <td className={`border border-black ${getDynamicSizing.cellPadding} ${getDynamicSizing.fontSize} text-center font-bold bg-white`}>
                        <EditableField 
                          value={group.maxima.totalMaxima}
                          onChange={(value) => updateMaximaField(groupIndex, 'totalMaxima', value)}
                          isEditable={isEditable}
                          placeholder=""
                          field={`maxima-${groupIndex}-total2`}
                          isTableCell={true}
                        />
                      </td>
                      <td className={`border border-black ${getDynamicSizing.cellPadding} ${getDynamicSizing.fontSize} text-center font-bold bg-white`}>
                        <EditableField 
                          value={group.maxima.totalMaxima * 2}
                          onChange={(value) => {
                            // Overall total is calculated as totalMaxima * 2, so we update totalMaxima 
                            const newTotalMaxima = Math.round((parseInt(value) || 0) / 2);
                            updateMaximaField(groupIndex, 'totalMaxima', newTotalMaxima.toString());
                          }}
                          isEditable={isEditable}
                          placeholder=""
                          field={`maxima-${groupIndex}-overall`}
                          isTableCell={true}
                        />
                      </td>
                      {isFirstMaxima && (
                        <>
                          <td rowSpan={totalRows} className="border-l border-r border-t border-b border-black px-1 py-1 bg-black w-1">
                            &nbsp;
                          </td>
                          <td className="border border-black px-1 py-1 text-[8px] text-center bg-white">&nbsp;</td>
                          <td className="border border-black px-1 py-1 text-xs bg-white">&nbsp;</td>
                        </>
                      )}
                    </tr>
                  );
                  
                  rowIndex++;
                  if (isFirstMaxima) { 
                    isFirstMaxima = false; 
                  }
                  
                  // Subject rows for this group
                  group.subjects.forEach((subject, subjectIndex) => {
                    // Find the original subject index in the flat subjects array
                    // Using a more robust way to identify subjects that doesn't rely on reference equality
                    const originalSubjectIndex = (data.subjects || []).findIndex(s => {
                      // Compare by essential properties instead of reference
                      return s.subject === subject.subject &&
                             s.firstSemester?.period1 === subject.firstSemester?.period1 &&
                             s.firstSemester?.period2 === subject.firstSemester?.period2 &&
                             s.firstSemester?.exam === subject.firstSemester?.exam &&
                             s.secondSemester?.period3 === subject.secondSemester?.period3 &&
                             s.secondSemester?.period4 === subject.secondSemester?.period4 &&
                             s.secondSemester?.exam === subject.secondSemester?.exam;
                    });
                    
                    groupRows.push(
                      <tr key={`subject-${groupIndex}-${subjectIndex}`}>
                        <td className={`border border-black ${getDynamicSizing.cellPadding} ${getDynamicSizing.fontSize} bg-white text-left`}>
                          <div className="flex items-center justify-between">
                            <EditableField 
                              value={subject.subject}
                              onChange={(value) => updateSubjectField(originalSubjectIndex, 'subject', value)}
                              isEditable={isEditable}
                              placeholder="Subject name"
                              field={`subject-${originalSubjectIndex}-name`}
                              isTableCell={true}
                              className="text-left flex-grow"
                            />
                            {isEditable && (
                              <button
                                onClick={() => deleteSubject(originalSubjectIndex)}
                                className="ml-2 w-4 h-4 bg-red-500 hover:bg-red-600 text-white rounded text-[8px] flex items-center justify-center flex-shrink-0"
                                title="Delete subject"
                                style={{zIndex: 10}}
                              >
                                ×
                              </button>
                            )}
                          </div>
                        </td>
                        <td className={`border border-black ${getDynamicSizing.cellPadding} ${getDynamicSizing.fontSize} text-center bg-white`}>
                          <EditableField 
                            value={subject.firstSemester.period1}
                            onChange={(value) => updateSubjectField(originalSubjectIndex, 'firstSemester.period1', value)}
                            isEditable={isEditable}
                            placeholder=""
                            field={`subject-${originalSubjectIndex}-period1`}
                            isTableCell={true}
                          />
                        </td>
                        <td className={`border border-black ${getDynamicSizing.cellPadding} ${getDynamicSizing.fontSize} text-center bg-white`}>
                          <EditableField 
                            value={subject.firstSemester.period2}
                            onChange={(value) => updateSubjectField(originalSubjectIndex, 'firstSemester.period2', value)}
                            isEditable={isEditable}
                            placeholder=""
                            field={`subject-${originalSubjectIndex}-period2`}
                            isTableCell={true}
                          />
                        </td>
                        <td className={`border border-black ${getDynamicSizing.cellPadding} ${getDynamicSizing.fontSize} text-center bg-white`}>
                          <EditableField 
                            value={subject.firstSemester.exam}
                            onChange={(value) => updateSubjectField(originalSubjectIndex, 'firstSemester.exam', value)}
                            isEditable={isEditable}
                            placeholder=""
                            field={`subject-${originalSubjectIndex}-exam1`}
                            isTableCell={true}
                          />
                        </td>
                        <td className={`border border-black ${getDynamicSizing.cellPadding} ${getDynamicSizing.fontSize} text-center bg-white`}>
                          <EditableField 
                            value={calculateFirstSemesterTotal(subject)}
                            onChange={() => {}} // Non-editable - calculated automatically
                            isEditable={false} // Always non-editable since it's calculated
                            placeholder=""
                            field={`subject-${originalSubjectIndex}-total1`}
                            isTableCell={true}
                          />
                        </td>
                        <td className={`border border-black ${getDynamicSizing.cellPadding} ${getDynamicSizing.fontSize} text-center bg-white`}>
                          <EditableField 
                            value={subject.secondSemester.period3}
                            onChange={(value) => updateSubjectField(originalSubjectIndex, 'secondSemester.period3', value)}
                            isEditable={isEditable}
                            placeholder=""
                            field={`subject-${originalSubjectIndex}-period3`}
                            isTableCell={true}
                          />
                        </td>
                        <td className={`border border-black ${getDynamicSizing.cellPadding} ${getDynamicSizing.fontSize} text-center bg-white`}>
                          <EditableField 
                            value={subject.secondSemester.period4}
                            onChange={(value) => updateSubjectField(originalSubjectIndex, 'secondSemester.period4', value)}
                            isEditable={isEditable}
                            placeholder=""
                            field={`subject-${originalSubjectIndex}-period4`}
                            isTableCell={true}
                          />
                        </td>
                        <td className={`border border-black ${getDynamicSizing.cellPadding} ${getDynamicSizing.fontSize} text-center bg-white`}>
                          <EditableField 
                            value={subject.secondSemester.exam}
                            onChange={(value) => updateSubjectField(originalSubjectIndex, 'secondSemester.exam', value)}
                            isEditable={isEditable}
                            placeholder=""
                            field={`subject-${originalSubjectIndex}-exam2`}
                            isTableCell={true}
                          />
                        </td>
                        <td className={`border border-black ${getDynamicSizing.cellPadding} ${getDynamicSizing.fontSize} text-center bg-white`}>
                          <EditableField 
                            value={calculateSecondSemesterTotal(subject)}
                            onChange={() => {}} // Non-editable - calculated automatically
                            isEditable={false} // Always non-editable since it's calculated
                            placeholder=""
                            field={`subject-${originalSubjectIndex}-total2`}
                            isTableCell={true}
                          />
                        </td>
                        <td className={`border border-black ${getDynamicSizing.cellPadding} ${getDynamicSizing.fontSize} text-center bg-white`}>
                          <EditableField 
                            value={calculateOverallTotal(subject)}
                            onChange={() => {}} // Non-editable - calculated automatically
                            isEditable={false} // Always non-editable since it's calculated
                            placeholder=""
                            field={`subject-${originalSubjectIndex}-overall`}
                            isTableCell={true}
                          />
                        </td>
                        <td className={`border border-black ${getDynamicSizing.cellPadding} ${getDynamicSizing.fontSize} text-center bg-white`}>
                          <EditableField 
                            value={subject.secondSitting?.marks || ''}
                            onChange={(value) => updateSubjectField(originalSubjectIndex, 'secondSitting.marks', value)}
                            isEditable={isEditable}
                            placeholder=""
                            field={`subject-${originalSubjectIndex}-secondSitting-marks`}
                            isTableCell={true}
                          />
                        </td>
                        <td className={`border border-black ${getDynamicSizing.cellPadding} ${getDynamicSizing.fontSize} text-center bg-white`}>
                          <EditableField 
                            value={subject.secondSitting?.max || ''}
                            onChange={(value) => updateSubjectField(originalSubjectIndex, 'secondSitting.max', value)}
                            isEditable={isEditable}
                            placeholder=""
                            field={`subject-${originalSubjectIndex}-secondSitting-max`}
                            isTableCell={true}
                          />
                        </td>
                      </tr>
                    );
                    rowIndex++;
                  });

                  // Add Subject button row for this group (only in edit mode)
                  if (isEditable) {
                    groupRows.push(
                      <tr key={`add-subject-${groupIndex}`} className="bg-gray-50 print:hidden">
                        <td className={`border border-black ${getDynamicSizing.cellPadding} ${getDynamicSizing.fontSize} bg-white`}>
                          <button
                            onClick={() => addSubjectToGroup(groupIndex)}
                            className="w-full px-2 py-1 bg-green-100 hover:bg-green-200 text-green-700 text-xs rounded border border-green-300 flex items-center justify-center space-x-1"
                            title={`Add new subject to MAXIMA group ${groupIndex + 1}`}
                          >
                            <span>+</span>
                            <span>Add Subject</span>
                          </button>
                        </td>
                        <td colSpan={11} className="border border-black bg-gray-50"></td>
                      </tr>
                    );
                    rowIndex++;
                  }
                  
                  return groupRows;
                }).flat();
              })()}

              {/* Summary rows */}
              <tr>
                <td className={`border border-black ${getDynamicSizing.cellPadding} ${getDynamicSizing.fontSize} font-bold`}>AGGREGATES MAXIMA</td>
                <td className={`border border-black ${getDynamicSizing.cellPadding} ${getDynamicSizing.fontSize} text-center`}>
                  <EditableField 
                    value={data.summaryValues?.aggregatesMaxima?.period1 || ''}
                    onChange={(value) => updateSummaryField('aggregatesMaxima', 'period1', value)}
                    isEditable={isEditable}
                    placeholder=""
                    field="aggregatesMaxima-period1"
                    isTableCell={true}
                  />
                </td>
                <td className={`border border-black ${getDynamicSizing.cellPadding} ${getDynamicSizing.fontSize} text-center`}>
                  <EditableField 
                    value={data.summaryValues?.aggregatesMaxima?.period2 || ''}
                    onChange={(value) => updateSummaryField('aggregatesMaxima', 'period2', value)}
                    isEditable={isEditable}
                    placeholder=""
                    field="aggregatesMaxima-period2"
                    isTableCell={true}
                  />
                </td>
                <td className={`border border-black ${getDynamicSizing.cellPadding} ${getDynamicSizing.fontSize} text-center`}>
                  <EditableField 
                    value={data.summaryValues?.aggregatesMaxima?.exam1 || ''}
                    onChange={(value) => updateSummaryField('aggregatesMaxima', 'exam1', value)}
                    isEditable={isEditable}
                    placeholder=""
                    field="aggregatesMaxima-exam1"
                    isTableCell={true}
                  />
                </td>
                <td className={`border border-black ${getDynamicSizing.cellPadding} ${getDynamicSizing.fontSize} text-center`}>
                  <EditableField 
                    value={data.summaryValues?.aggregatesMaxima?.total1 || renderGrade(data.totalMarksOutOf?.firstSemester)}
                    onChange={(value) => updateSummaryField('aggregatesMaxima', 'total1', value)}
                    isEditable={isEditable}
                    placeholder=""
                    field="aggregatesMaxima-total1"
                    isTableCell={true}
                  />
                </td>
                <td className={`border border-black ${getDynamicSizing.cellPadding} ${getDynamicSizing.fontSize} text-center`}>
                  <EditableField 
                    value={data.summaryValues?.aggregatesMaxima?.period3 || ''}
                    onChange={(value) => updateSummaryField('aggregatesMaxima', 'period3', value)}
                    isEditable={isEditable}
                    placeholder=""
                    field="aggregatesMaxima-period3"
                    isTableCell={true}
                  />
                </td>
                <td className={`border border-black ${getDynamicSizing.cellPadding} ${getDynamicSizing.fontSize} text-center`}>
                  <EditableField 
                    value={data.summaryValues?.aggregatesMaxima?.period4 || ''}
                    onChange={(value) => updateSummaryField('aggregatesMaxima', 'period4', value)}
                    isEditable={isEditable}
                    placeholder=""
                    field="aggregatesMaxima-period4"
                    isTableCell={true}
                  />
                </td>
                <td className={`border border-black ${getDynamicSizing.cellPadding} ${getDynamicSizing.fontSize} text-center`}>
                  <EditableField 
                    value={data.summaryValues?.aggregatesMaxima?.exam2 || ''}
                    onChange={(value) => updateSummaryField('aggregatesMaxima', 'exam2', value)}
                    isEditable={isEditable}
                    placeholder=""
                    field="aggregatesMaxima-exam2"
                    isTableCell={true}
                  />
                </td>
                <td className={`border border-black ${getDynamicSizing.cellPadding} ${getDynamicSizing.fontSize} text-center`}>
                  <EditableField 
                    value={data.summaryValues?.aggregatesMaxima?.total2 || renderGrade(data.totalMarksOutOf?.secondSemester)}
                    onChange={(value) => updateSummaryField('aggregatesMaxima', 'total2', value)}
                    isEditable={isEditable}
                    placeholder=""
                    field="aggregatesMaxima-total2"
                    isTableCell={true}
                  />
                </td>
                <td className={`border border-black ${getDynamicSizing.cellPadding} ${getDynamicSizing.fontSize} text-center`}>
                  <EditableField 
                    value={data.summaryValues?.aggregatesMaxima?.overall || ''}
                    onChange={(value) => updateSummaryField('aggregatesMaxima', 'overall', value)}
                    isEditable={isEditable}
                    placeholder=""
                    field="aggregatesMaxima-overall"
                    isTableCell={true}
                  />
                </td>
                <td className={`border border-black ${getDynamicSizing.cellPadding} ${getDynamicSizing.fontSize} text-center`}>
                  <EditableField 
                    value={data.summaryValues?.aggregatesMaxima?.secondSittingMarks || ''}
                    onChange={(value) => updateSummaryField('aggregatesMaxima', 'secondSittingMarks', value)}
                    isEditable={isEditable}
                    placeholder=""
                    field="aggregatesMaxima-secondSittingMarks"
                    isTableCell={true}
                  />
                </td>
                <td className={`border border-black ${getDynamicSizing.cellPadding} ${getDynamicSizing.fontSize} text-center`}>
                  <EditableField 
                    value={data.summaryValues?.aggregatesMaxima?.secondSittingMax || ''}
                    onChange={(value) => updateSummaryField('aggregatesMaxima', 'secondSittingMax', value)}
                    isEditable={isEditable}
                    placeholder=""
                    field="aggregatesMaxima-secondSittingMax"
                    isTableCell={true}
                  />
                </td>
              </tr>
              
              <tr>
                <td className={`border border-black ${getDynamicSizing.cellPadding} ${getDynamicSizing.fontSize} font-bold`}>AGGREGATES</td>
                <td className={`border border-black ${getDynamicSizing.cellPadding} ${getDynamicSizing.fontSize} text-center`}>
                  <EditableField 
                    value={data.summaryValues?.aggregates?.period1 || ''}
                    onChange={(value) => updateSummaryField('aggregates', 'period1', value)}
                    isEditable={isEditable}
                    placeholder=""
                    field="aggregates-period1"
                    isTableCell={true}
                  />
                </td>
                <td className={`border border-black ${getDynamicSizing.cellPadding} ${getDynamicSizing.fontSize} text-center`}>
                  <EditableField 
                    value={data.summaryValues?.aggregates?.period2 || ''}
                    onChange={(value) => updateSummaryField('aggregates', 'period2', value)}
                    isEditable={isEditable}
                    placeholder=""
                    field="aggregates-period2"
                    isTableCell={true}
                  />
                </td>
                <td className={`border border-black ${getDynamicSizing.cellPadding} ${getDynamicSizing.fontSize} text-center`}>
                  <EditableField 
                    value={data.summaryValues?.aggregates?.exam1 || ''}
                    onChange={(value) => updateSummaryField('aggregates', 'exam1', value)}
                    isEditable={isEditable}
                    placeholder=""
                    field="aggregates-exam1"
                    isTableCell={true}
                  />
                </td>
                <td className={`border border-black ${getDynamicSizing.cellPadding} ${getDynamicSizing.fontSize} text-center`}>
                  <EditableField 
                    value={data.summaryValues?.aggregates?.total1 || renderGrade(data.totalMarksObtained?.firstSemester)}
                    onChange={(value) => updateSummaryField('aggregates', 'total1', value)}
                    isEditable={isEditable}
                    placeholder=""
                    field="aggregates-total1"
                    isTableCell={true}
                  />
                </td>
                <td className={`border border-black ${getDynamicSizing.cellPadding} ${getDynamicSizing.fontSize} text-center`}>
                  <EditableField 
                    value={data.summaryValues?.aggregates?.period3 || ''}
                    onChange={(value) => updateSummaryField('aggregates', 'period3', value)}
                    isEditable={isEditable}
                    placeholder=""
                    field="aggregates-period3"
                    isTableCell={true}
                  />
                </td>
                <td className={`border border-black ${getDynamicSizing.cellPadding} ${getDynamicSizing.fontSize} text-center`}>
                  <EditableField 
                    value={data.summaryValues?.aggregates?.period4 || ''}
                    onChange={(value) => updateSummaryField('aggregates', 'period4', value)}
                    isEditable={isEditable}
                    placeholder=""
                    field="aggregates-period4"
                    isTableCell={true}
                  />
                </td>
                <td className={`border border-black ${getDynamicSizing.cellPadding} ${getDynamicSizing.fontSize} text-center`}>
                  <EditableField 
                    value={data.summaryValues?.aggregates?.exam2 || ''}
                    onChange={(value) => updateSummaryField('aggregates', 'exam2', value)}
                    isEditable={isEditable}
                    placeholder=""
                    field="aggregates-exam2"
                    isTableCell={true}
                  />
                </td>
                <td className={`border border-black ${getDynamicSizing.cellPadding} ${getDynamicSizing.fontSize} text-center`}>
                  <EditableField 
                    value={data.summaryValues?.aggregates?.total2 || renderGrade(data.totalMarksObtained?.secondSemester)}
                    onChange={(value) => updateSummaryField('aggregates', 'total2', value)}
                    isEditable={isEditable}
                    placeholder=""
                    field="aggregates-total2"
                    isTableCell={true}
                  />
                </td>
                <td className={`border border-black ${getDynamicSizing.cellPadding} ${getDynamicSizing.fontSize} text-center`}>
                  <EditableField 
                    value={data.summaryValues?.aggregates?.overall || ''}
                    onChange={(value) => updateSummaryField('aggregates', 'overall', value)}
                    isEditable={isEditable}
                    placeholder=""
                    field="aggregates-overall"
                    isTableCell={true}
                  />
                </td>
              </tr>

              <tr>
                <td className={`border border-black ${getDynamicSizing.cellPadding} ${getDynamicSizing.fontSize} font-bold`}>PERCENTAGE</td>
                <td className={`border border-black ${getDynamicSizing.cellPadding} ${getDynamicSizing.fontSize} text-center`}>
                  <EditableField 
                    value={data.summaryValues?.percentage?.period1 || ''}
                    onChange={(value) => updateSummaryField('percentage', 'period1', value)}
                    isEditable={isEditable}
                    placeholder=""
                    field="percentage-period1"
                    isTableCell={true}
                                   />
                </td>
                <td className={`border border-black ${getDynamicSizing.cellPadding} ${getDynamicSizing.fontSize} text-center`}>
                  <EditableField 
                    value={data.summaryValues?.percentage?.period2 || ''}
                    onChange={(value) => updateSummaryField('percentage', 'period2', value)}
                    isEditable={isEditable}
                    placeholder=""
                    field="percentage-period2"
                    isTableCell={true}
                  />
                </td>
                <td className={`border border-black ${getDynamicSizing.cellPadding} ${getDynamicSizing.fontSize} text-center`}>
                  <EditableField 
                    value={data.summaryValues?.percentage?.exam1 || ''}
                    onChange={(value) => updateSummaryField('percentage', 'exam1', value)}
                    isEditable={isEditable}
                    placeholder=""
                    field="percentage-exam1"
                    isTableCell={true}
                  />
                </td>
                <td className={`border border-black ${getDynamicSizing.cellPadding} ${getDynamicSizing.fontSize} text-center`}>
                  <EditableField 
                    value={data.summaryValues?.percentage?.total1 || renderGrade(data.percentage?.firstSemester)}
                    onChange={(value) => updateSummaryField('percentage', 'total1', value)}
                    isEditable={isEditable}
                    placeholder=""
                    field="percentage-total1"
                    isTableCell={true}
                  />
                </td>
                <td className={`border border-black ${getDynamicSizing.cellPadding} ${getDynamicSizing.fontSize} text-center`}>
                  <EditableField 
                    value={data.summaryValues?.percentage?.period3 || ''}
                    onChange={(value) => updateSummaryField('percentage', 'period3', value)}
                    isEditable={isEditable}
                    placeholder=""
                    field="percentage-period3"
                    isTableCell={true}
                  />
                </td>
                <td className={`border border-black ${getDynamicSizing.cellPadding} ${getDynamicSizing.fontSize} text-center`}>
                  <EditableField 
                    value={data.summaryValues?.percentage?.period4 || ''}
                    onChange={(value) => updateSummaryField('percentage', 'period4', value)}
                    isEditable={isEditable}
                    placeholder=""
                    field="percentage-period4"
                    isTableCell={true}
                  />
                </td>
                <td className={`border border-black ${getDynamicSizing.cellPadding} ${getDynamicSizing.fontSize} text-center`}>
                  <EditableField 
                    value={data.summaryValues?.percentage?.exam2 || ''}
                    onChange={(value) => updateSummaryField('percentage', 'exam2', value)}
                    isEditable={isEditable}
                    placeholder=""
                    field="percentage-exam2"
                    isTableCell={true}
                  />
                </td>
                <td className={`border border-black ${getDynamicSizing.cellPadding} ${getDynamicSizing.fontSize} text-center`}>
                  <EditableField 
                    value={data.summaryValues?.percentage?.total2 || renderGrade(data.percentage?.secondSemester)}
                    onChange={(value) => updateSummaryField('percentage', 'total2', value)}
                    isEditable={isEditable}
                    placeholder=""
                    field="percentage-total2"
                    isTableCell={true}
                  />
                </td>
                <td className={`border border-black ${getDynamicSizing.cellPadding} ${getDynamicSizing.fontSize} text-center`}>
                  <EditableField 
                    value={data.summaryValues?.percentage?.overall || ''}
                    onChange={(value) => updateSummaryField('percentage', 'overall', value)}
                    isEditable={isEditable}
                    placeholder=""
                    field="percentage-overall"
                    isTableCell={true}
                  />
                </td>
              </tr>

              <tr>
                <td className={`border border-black ${getDynamicSizing.cellPadding} ${getDynamicSizing.fontSize}`}>POSITION/OUT OF</td>
                <td className={`border border-black ${getDynamicSizing.cellPadding} ${getDynamicSizing.fontSize} text-center`}>
                  <EditableField 
                    value={data.summaryValues?.position?.period1 || ''}
                    onChange={(value) => updateSummaryField('position', 'period1', value)}
                    isEditable={isEditable}
                    placeholder=""
                    field="position-period1"
                    isTableCell={true}
                  />
                </td>
                <td className={`border border-black ${getDynamicSizing.cellPadding} ${getDynamicSizing.fontSize} text-center`}>
                  <EditableField 
                    value={data.summaryValues?.position?.period2 || ''}
                    onChange={(value) => updateSummaryField('position', 'period2', value)}
                    isEditable={isEditable}
                    placeholder=""
                    field="position-period2"
                    isTableCell={true}
                  />
                </td>
                <td className={`border border-black ${getDynamicSizing.cellPadding} ${getDynamicSizing.fontSize} text-center`}>
                  <EditableField 
                    value={data.summaryValues?.position?.exam1 || ''}
                    onChange={(value) => updateSummaryField('position', 'exam1', value)}
                    isEditable={isEditable}
                    placeholder=""
                    field="position-exam1"
                    isTableCell={true}
                  />
                </td>
                <td className={`border border-black ${getDynamicSizing.cellPadding} ${getDynamicSizing.fontSize} text-center`}>
                  <EditableField 
                    value={data.summaryValues?.position?.total1 || `${data.position} / ${data.totalStudents}`}
                    onChange={(value) => updateSummaryField('position', 'total1', value)}
                    isEditable={isEditable}
                    placeholder="1/30"
                    field="position-total1"
                    isTableCell={true}
                  />
                </td>
                <td className={`border border-black ${getDynamicSizing.cellPadding} ${getDynamicSizing.fontSize} text-center`}>
                  <EditableField 
                    value={data.summaryValues?.position?.period3 || ''}
                    onChange={(value) => updateSummaryField('position', 'period3', value)}
                    isEditable={isEditable}
                    placeholder=""
                    field="position-period3"
                    isTableCell={true}
                  />
                </td>
                <td className={`border border-black ${getDynamicSizing.cellPadding} ${getDynamicSizing.fontSize} text-center`}>
                  <EditableField 
                    value={data.summaryValues?.position?.period4 || ''}
                    onChange={(value) => updateSummaryField('position', 'period4', value)}
                    isEditable={isEditable}
                    placeholder=""
                    field="position-period4"
                    isTableCell={true}
                  />
                </td>
                <td className={`border border-black ${getDynamicSizing.cellPadding} ${getDynamicSizing.fontSize} text-center`}>
                  <EditableField 
                    value={data.summaryValues?.position?.exam2 || ''}
                    onChange={(value) => updateSummaryField('position', 'exam2', value)}
                    isEditable={isEditable}
                    placeholder=""
                    field="position-exam2"
                    isTableCell={true}
                  />
                </td>
                <td className={`border border-black ${getDynamicSizing.cellPadding} ${getDynamicSizing.fontSize} text-center`}>
                  <EditableField 
                    value={data.summaryValues?.position?.total2 || `${data.position} / ${data.totalStudents}`}
                    onChange={(value) => updateSummaryField('position', 'total2', value)}
                    isEditable={isEditable}
                    placeholder="1/30"
                    field="position-total2"
                    isTableCell={true}
                  />
                </td>
                <td className={`border border-black ${getDynamicSizing.cellPadding} ${getDynamicSizing.fontSize} text-center`}>
                  <EditableField 
                    value={data.summaryValues?.position?.overall || ''}
                    onChange={(value) => updateSummaryField('position', 'overall', value)}
                    isEditable={isEditable}
                    placeholder=""
                    field="position-overall"
                    isTableCell={true}
                  />
                </td>
              </tr>

              <tr>
                <td className={`border border-black ${getDynamicSizing.cellPadding} ${getDynamicSizing.fontSize}`}>APPLICATION</td>
                <td className={`border border-black ${getDynamicSizing.cellPadding} ${getDynamicSizing.fontSize} text-center`}>
                  <EditableField 
                    value={data.summaryValues?.application?.period1 || data.application || 'B'}
                    onChange={(value) => updateSummaryField('application', 'period1', value)}
                    isEditable={isEditable}
                    placeholder="B"
                    field="application-period1"
                    isTableCell={true}
                  />
                </td>
                <td className={`border border-black ${getDynamicSizing.cellPadding} ${getDynamicSizing.fontSize} text-center`}>
                  <EditableField 
                    value={data.summaryValues?.application?.period2 || data.application || 'B'}
                    onChange={(value) => updateSummaryField('application', 'period2', value)}
                    isEditable={isEditable}
                    placeholder="B"
                    field="application-period2"
                    isTableCell={true}
                  />
                </td>
                <td colSpan={2} className={`border border-black ${getDynamicSizing.cellPadding} ${getDynamicSizing.fontSize} bg-black`}>&nbsp;</td>
                <td className={`border border-black ${getDynamicSizing.cellPadding} ${getDynamicSizing.fontSize} text-center`}>
                  <EditableField 
                    value={data.summaryValues?.application?.period3 || data.application || 'B'}
                    onChange={(value) => updateSummaryField('application', 'period3', value)}
                    isEditable={isEditable}
                    placeholder="B"
                    field="application-period3"
                    isTableCell={true}
                  />
                </td>
                <td className={`border border-black ${getDynamicSizing.cellPadding} ${getDynamicSizing.fontSize} text-center`}>
                  <EditableField 
                    value={data.summaryValues?.application?.period4 || data.application || 'B'}
                    onChange={(value) => updateSummaryField('application', 'period4', value)}
                    isEditable={isEditable}
                    placeholder="B"
                    field="application-period4"
                    isTableCell={true}
                  />
                </td>
                <td colSpan={2} className={`border border-black ${getDynamicSizing.cellPadding} ${getDynamicSizing.fontSize} bg-black`}>&nbsp;</td>
                <td className={`border border-black ${getDynamicSizing.cellPadding} ${getDynamicSizing.fontSize} bg-black`}>&nbsp;</td>
              </tr>

              <tr>
                <td className={`border border-black ${getDynamicSizing.cellPadding} ${getDynamicSizing.fontSize}`}>BEHAVIOUR</td>
                <td className={`border border-black ${getDynamicSizing.cellPadding} ${getDynamicSizing.fontSize} text-center`}>
                  <EditableField 
                    value={data.summaryValues?.behaviour?.period1 || data.behaviour || 'B'}
                    onChange={(value) => updateSummaryField('behaviour', 'period1', value)}
                    isEditable={isEditable}
                    placeholder="B"
                    field="behaviour-period1"
                    isTableCell={true}
                  />
                </td>
                <td className={`border border-black ${getDynamicSizing.cellPadding} ${getDynamicSizing.fontSize} text-center`}>
                  <EditableField 
                    value={data.summaryValues?.behaviour?.period2 || data.behaviour || 'B'}
                    onChange={(value) => updateSummaryField('behaviour', 'period2', value)}
                    isEditable={isEditable}
                    placeholder="B"
                    field="behaviour-period2"
                    isTableCell={true}
                  />
                </td>
                <td colSpan={2} className={`border border-black ${getDynamicSizing.cellPadding} ${getDynamicSizing.fontSize} bg-black`}>&nbsp;</td>
                <td className={`border border-black ${getDynamicSizing.cellPadding} ${getDynamicSizing.fontSize} text-center`}>
                  <EditableField 
                    value={data.summaryValues?.behaviour?.period3 || data.behaviour || 'B'}
                    onChange={(value) => updateSummaryField('behaviour', 'period3', value)}
                    isEditable={isEditable}
                    placeholder="B"
                    field="behaviour-period3"
                    isTableCell={true}
                  />
                </td>
                <td className={`border border-black ${getDynamicSizing.cellPadding} ${getDynamicSizing.fontSize} text-center`}>
                  <EditableField 
                    value={data.summaryValues?.behaviour?.period4 || data.behaviour || 'B'}
                    onChange={(value) => updateSummaryField('behaviour', 'period4', value)}
                    isEditable={isEditable}
                    placeholder="B"
                    field="behaviour-period4"
                    isTableCell={true}
                  />
                </td>
                <td colSpan={2} className={`border border-black ${getDynamicSizing.cellPadding} ${getDynamicSizing.fontSize} bg-black`}>&nbsp;</td>
                <td className={`border border-black ${getDynamicSizing.cellPadding} ${getDynamicSizing.fontSize} bg-black`}>&nbsp;</td>
              </tr>

              <tr>
                <td className={`border border-black ${getDynamicSizing.cellPadding} ${getDynamicSizing.fontSize}`}>GUARDIAN SIGNATURE</td>
                <td className={`border border-black ${getDynamicSizing.cellPadding} ${getDynamicSizing.fontSize}`}>&nbsp;</td>
                <td className={`border border-black ${getDynamicSizing.cellPadding} ${getDynamicSizing.fontSize}`}>&nbsp;</td>
                <td className={`border border-black ${getDynamicSizing.cellPadding} ${getDynamicSizing.fontSize}`}>&nbsp;</td>
                <td className={`border border-black ${getDynamicSizing.cellPadding} ${getDynamicSizing.fontSize}`}>&nbsp;</td>
                <td className={`border border-black ${getDynamicSizing.cellPadding} ${getDynamicSizing.fontSize}`}>&nbsp;</td>
                <td className={`border border-black ${getDynamicSizing.cellPadding} ${getDynamicSizing.fontSize}`}>&nbsp;</td>
                <td className={`border border-black ${getDynamicSizing.cellPadding} ${getDynamicSizing.fontSize}`}>&nbsp;</td>
                <td colSpan={3} className={`border border-black ${getDynamicSizing.cellPadding} ${getDynamicSizing.fontSize}`}>&nbsp;</td>
              </tr>
            </tbody>
          </table>
          
          {/* Second Sitting Text Block */}
          <div className="relative">
            <div className="absolute" style={{
              right: '0px',
              top: '-120px',
              width: '100px',
              textAlign: 'center'
            }}>
              <div className="text-[10px] leading-tight space-y-1 p-1">
                <div>Passed (1)</div>
                <div>Repeat (1)</div>
                <div className="flex items-center">
                  <span>Date:</span>
                  <EditableField 
                    value={data.secondSittingDate || ''} 
                    isEditable={isEditable}
                    placeholder=""
                    field="secondSittingDate"
                    className="text-[10px] min-w-0 flex-grow ml-1"
                    isTableCell={true}
                    onChange={(value) => {
                      if (onDataChange) {
                        onDataChange({ ...data, secondSittingDate: value });
                      }
                    }}
                  />
                </div>
                <div>The Principal</div>
                <div>Seal of School</div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer with Totals & Signatures */}
        <div className="p-2 border-t border-gray-300">
          <div className="flex flex-col space-y-2">
            {/* Promotion Status Section */}
            <div className="space-y-2">
              <p className="text-xs leading-tight">
                Student can only be promoted to the next class after he has passed the supplementary exams in: 
                <span className="inline-block min-w-[200px]">
                  <EditableField 
                    value={data.shouldRepeat || ''} 
                    isEditable={isEditable}
                    placeholder="Enter subjects"
                    field="shouldRepeat"
                    className="mx-1 min-w-full"
                    onChange={(value) => {
                      if (onDataChange) {
                        onDataChange({ ...data, shouldRepeat: value });
                      }
                    }}
                  />
                </span>
              </p>
              
              <div className="flex justify-between items-center">
                <p className="text-xs">The student is promoted to the next class (1)</p>
                <p className="text-xs flex items-center">
                  Issued at: 
                  <EditableField 
                    value={data.issueLocation || ''} 
                    isEditable={isEditable}
                    placeholder="Enter location"
                    field="issueLocation"
                    className="mx-1"
                    onChange={(value) => {
                      if (onDataChange) {
                        onDataChange({ ...data, issueLocation: value });
                      }
                    }}
                  />
                  on: 
                  <EditableField 
                    value={data.issueDate || ''} 
                    isEditable={isEditable}
                    placeholder="DD/MM/YYYY"
                    field="issueDate"
                    className="ml-1"
                    onChange={(value) => {
                      if (onDataChange) {
                        onDataChange({ ...data, issueDate: value });
                      }
                    }}
                  />
                </p>
              </div>
              
              <p className="text-xs">The student should repeat: ........................ (1)</p>
            </div>
            
            {/* Signatures Section */}
            <div className="mt-4 mb-4">
              <div className="flex justify-around items-end h-12">
                <div className="text-center">
                  <div className="h-8 flex items-end">
                    <p className="text-xs font-bold">Student's signature</p>
                  </div>
                </div>
                <div className="text-center">
                  <div className="h-8 flex items-end">
                    <p className="text-xs font-bold">School stamp</p>
                  </div>
                </div>
                <div className="text-center relative">
                  <div className="h-8 flex items-end justify-center relative z-10">
                    <p className="text-xs font-bold">Head teacher name and signature</p>
                  </div>
                  {/* Stamp Image - Positioned exactly over the head teacher text */}
                  <div className="absolute inset-0 flex items-center justify-center z-20">
                    <img 
                      src="/stamp.png" 
                      alt="School Stamp" 
                      className="w-32 h-32 opacity-80"
                    />
                  </div>
                </div>
              </div>
            </div>
            
            {/* Legal Notice Section */}
            <div className="space-y-2 pt-2 relative">
              <div className="relative">
                <p className="text-xs text-left font-medium">NOTE: This report card is invalid if altered or modified.</p>
                
                {/* QR Code for Verification - Below NOTE text, bottom left */}
                {documentId && (
                  <div 
                    className="print-qr-force-visible"
                    style={{
                      position: 'absolute',
                      top: '25px',
                      left: '0px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'flex-start',
                      gap: '2px',
                      zIndex: 30,
                      backgroundColor: 'white',
                      padding: '2px'
                    }}
                  >
                    <QRCodeComponent 
                      documentId={documentId}
                      size={60}
                      className="print-qr-force-visible qr-container"
                    />
                    <div 
                      className="print-qr-force-visible"
                      style={{
                        fontSize: '7px',
                        color: '#000',
                        textAlign: 'center',
                        fontWeight: 'bold',
                        width: '60px'
                      }}
                    >
                      Verify Document
                    </div>
                  </div>
                )}
              </div>
              
              <div className="text-center">
                <p className="text-xs font-bold italic text-gray-700">
                  Reproduction of this report is strictly prohibited and punishable by law
                </p>
              </div>
            </div>
          </div>

        </div>
                {/* End of content wrapped in table cell */}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
  } catch (error) {
    console.error('🚨 Form4Template Error:', error);
    return (
      <div className="p-4 border border-red-300 bg-red-50 rounded-lg">
        <h3 className="text-red-800 font-semibold">Template Error</h3>
        <p className="text-red-600 text-sm">Failed to render the bulletin template.</p>
        <details className="mt-2 text-xs text-red-700">
          <summary>Error Details</summary>
          <pre>{String(error)}</pre>
        </details>
      </div>
    );
  }
};

export default Form4Template;
