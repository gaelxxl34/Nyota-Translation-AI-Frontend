// Form6Template.tsx - A4 Report Card Template for Form 6 (6th Year) - NTC
// Converts French school bulletins to English format with proper A4 sizing
// Specifically designed for 6th Year Humanities Math-Physics class structure

import React, { useMemo } from 'react';

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
  nationalExam?: {
    marks: number | string;
    max: number | string;
  };
}

interface BulletinData {
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
  centerCode?: string;
  verifierName?: string;
  endorsementDate?: string;
}

interface Form6TemplateProps {
  data?: BulletinData;
  className?: string;
  isEditable?: boolean;
  onDataChange?: (updatedData: BulletinData) => void;
}

const Form6Template: React.FC<Form6TemplateProps> = ({ 
  data = {}, 
  className = '',
  isEditable = false,
  onDataChange 
}) => {

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

    // Update edit value when prop value changes
    React.useEffect(() => {
      setEditValue(String(value || ''));
    }, [value]);

    const handleSave = async () => {
      if (!onChange || editValue === String(value || '')) {
        setIsEditing(false);
        return;
      }

      try {
        setIsSaving(true);
        
        // Call the onChange handler which will trigger the Firestore update
        await onChange(editValue);
        
        setIsEditing(false);
        
        // Show success indicator
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 2000); // Hide after 2 seconds
      } catch (error) {
        console.error(`Failed to save field "${field}":`, error);
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

  // Helper function to update subject data
  const updateSubjectField = (subjectIndex: number, fieldPath: string, value: string) => {
    if (!onDataChange) return;
    
    const newSubjects = [...(data.subjects || [])];
    const subject = newSubjects[subjectIndex];
    if (!subject) return;
    
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
    
    onDataChange({ ...data, subjects: newSubjects });
  };

  // Helper function to update summary values
  const updateSummaryField = (section: string, field: string, value: string) => {
    if (!onDataChange) {
      console.warn(`onDataChange is not provided, cannot update summary field ${section}.${field}`);
      return;
    }
    
    console.log(`📝 Updating summary field: ${section}.${field} = "${value}"`);
    
    const newSummaryValues = { ...data.summaryValues };
    if (!newSummaryValues[section as keyof typeof newSummaryValues]) {
      newSummaryValues[section as keyof typeof newSummaryValues] = {} as any;
    }
    
    (newSummaryValues[section as keyof typeof newSummaryValues] as any)[field] = value;
    
    const updatedData = { ...data, summaryValues: newSummaryValues };
    
    console.log(`📊 Updated summary values:`, newSummaryValues);
    console.log(`📊 Full updated data structure includes summaryValues:`, !!updatedData.summaryValues);
    
    onDataChange(updatedData);
  };

  // Helper function to render grade values
  const renderGrade = (value: string | number | undefined) => {
    return String(value || '');
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

      // If maxima are equal, sort alphabetically by subject name
      const subjectA = a.subject || '';
      const subjectB = b.subject || '';
      return subjectA.localeCompare(subjectB);
    });
  };

  // Sort subjects before grouping (memoized for performance)
  const sortedSubjects = useMemo(() => {
    return sortSubjectsByMaxima([...(data.subjects || [])]);
  }, [data.subjects]);

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
            setTimeout(() => {
              const nextInput = e.currentTarget.nextElementSibling as HTMLInputElement;
              if (nextInput) nextInput.focus();
            }, 0);
          }
        }}
      />
    ));
  };

  try {
    return (
    <div className={`bg-white ${className}`}>        {/* A4 Container with proper dimensions */}
        <div 
          id="bulletin-template"
          data-testid="bulletin-template"
          className="mx-auto bg-white shadow-lg overflow-hidden print:shadow-none"
          style={{
            width: '210mm',
            height: '297mm',
            minHeight: '297mm',
            maxWidth: '210mm',
            fontSize: '6pt',
            lineHeight: '1.0',
            fontFamily: 'Arial, sans-serif'
          }}
        >
        {/* Outer table wrapper for guaranteed PDF borders */}
        <table className="w-full border-2 border-black print:border-black print:border-1 border-collapse" style={{minHeight: '297mm'}}>
          <tbody>
            <tr>
              <td className="p-0 align-top" style={{minHeight: '297mm'}}>
                {/* All content wrapped in table cell */}
        {/* Header with Logos and Titles */}
        <div className="flex items-center justify-between p-1 border-b border-gray-300">
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Flag_of_the_Democratic_Republic_of_the_Congo.svg/640px-Flag_of_the_Democratic_Republic_of_the_Congo.svg.png"
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
            src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTXsF5nQx4tanE26gNkogT9BDi0w7A9niMRlg&s"
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
            REPORT CARD - {data.class || '6TH YEAR HUMANITIES MATH – PHYSICS'} | SCHOOL YEAR: <EditableField 
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
          <table className="table-fixed w-full border-collapse text-xs">
            <thead>
              {/* Semester Group Headers */}
              <tr className="text-center">
                <th rowSpan={3} className="border border-black px-0.5 py-0.5 text-xs w-20 uppercase bg-white">
                  SUBJECTS
                </th>
                <th colSpan={4} className="border border-black px-0.5 py-0.5 uppercase text-xs w-24 bg-white">
                  FIRST SEMESTER
                </th>
                <th colSpan={4} className="border border-black px-0.5 py-0.5 uppercase text-xs w-24 bg-white">
                  SECOND SEMESTER
                </th>
                <th rowSpan={3} className="border border-black px-0.5 py-0.5 uppercase text-xs w-8 bg-white">
                  OVERALL TOTAL
                </th>
                <th rowSpan={3} className="border border-black px-0.5 py-0.5 bg-black w-1">&nbsp;</th>
                <th rowSpan={2} colSpan={3} className="border border-black px-0.5 py-0.5 uppercase text-xs w-16 bg-white">
                  NATIONAL EXAM
                </th>
              </tr>
              {/* Criteria Headers */}
              <tr className="text-center">
                <th colSpan={2} className="border border-black px-0.5 py-0.5 text-xs uppercase bg-white">
                  DAILY WORK
                </th>
                <th rowSpan={2} className="border border-black px-0.5 py-0.5 text-xs uppercase bg-white">
                  EXAM
                </th>
                <th rowSpan={2} className="border border-black px-0.5 py-0.5 text-xs uppercase bg-white">
                  TOTAL
                </th>
                <th colSpan={2} className="border border-black px-0.5 py-0.5 text-xs uppercase bg-white">
                  DAILY WORK
                </th>
                <th rowSpan={2} className="border border-black px-0.5 py-0.5 text-xs uppercase bg-white">
                  EXAM
                </th>
                <th rowSpan={2} className="border border-black px-0.5 py-0.5 text-xs uppercase bg-white">
                  TOTAL
                </th>
              </tr>
              {/* Period Labels */}
              <tr className="text-center">
                <th className="border border-black px-0.5 py-0.5 text-xs bg-white">1<sup>st</sup> P.</th>
                <th className="border border-black px-0.5 py-0.5 text-xs bg-white">2<sup>nd</sup> P.</th>
                <th className="border border-black px-0.5 py-0.5 text-xs bg-white">3<sup>rd</sup> P.</th>
                <th className="border border-black px-0.5 py-0.5 text-xs bg-white">4<sup>th</sup> P.</th>
                <th className="border border-black px-0.5 py-0.5 text-xs bg-white"></th>
                <th className="border border-black px-0.5 py-0.5 text-[8px] bg-white">MARKS</th>
                <th className="border border-black px-0.5 py-0.5 text-[8px] bg-white">MAX</th>
              </tr>
            </thead>
            <tbody>
              {(() => {
                let rowIndex = 0;
                let isFirstMaxima = true;
                let isSecondMaxima = false;
                let hasStartedVerificationSection = false;
                
                const totalRows = subjectGroups.reduce((sum, group) => sum + group.subjects.length + 1, 0) + 6; // +1 for MAXIMA row per group, +6 for summary rows
                
                return subjectGroups.map((group, groupIndex) => {
                  const groupRows = [];
                  
                  // MAXIMA row for this group
                  groupRows.push(
                    <tr key={`maxima-${groupIndex}`} className="bg-gray-100 print:bg-gray-200">
                      <td className="border border-black px-0.5 py-0.5 text-xs font-bold bg-white">MAXIMA</td>
                      <td className="border border-black px-0.5 py-0.5 text-xs text-center font-bold bg-white">
                        <EditableField 
                          value={group.maxima.periodMaxima}
                          onChange={(value) => updateMaximaField(groupIndex, 'periodMaxima', value)}
                          isEditable={isEditable}
                          placeholder=""
                          field={`maxima-${groupIndex}-period1`}
                          isTableCell={true}
                        />
                      </td>
                      <td className="border border-black px-0.5 py-0.5 text-xs text-center font-bold bg-white">
                        <EditableField 
                          value={group.maxima.periodMaxima}
                          onChange={(value) => updateMaximaField(groupIndex, 'periodMaxima', value)}
                          isEditable={isEditable}
                          placeholder=""
                          field={`maxima-${groupIndex}-period2`}
                          isTableCell={true}
                        />
                      </td>
                      <td className="border border-black px-0.5 py-0.5 text-xs text-center font-bold bg-white">
                        <EditableField 
                          value={group.maxima.examMaxima}
                          onChange={(value) => updateMaximaField(groupIndex, 'examMaxima', value)}
                          isEditable={isEditable}
                          placeholder=""
                          field={`maxima-${groupIndex}-exam1`}
                          isTableCell={true}
                        />
                      </td>
                      <td className="border border-black px-0.5 py-0.5 text-xs text-center font-bold bg-white">
                        <EditableField 
                          value={group.maxima.totalMaxima}
                          onChange={(value) => updateMaximaField(groupIndex, 'totalMaxima', value)}
                          isEditable={isEditable}
                          placeholder=""
                          field={`maxima-${groupIndex}-total1`}
                          isTableCell={true}
                        />
                      </td>
                      <td className="border border-black px-0.5 py-0.5 text-xs text-center font-bold bg-white">
                        <EditableField 
                          value={group.maxima.periodMaxima}
                          onChange={(value) => updateMaximaField(groupIndex, 'periodMaxima', value)}
                          isEditable={isEditable}
                          placeholder=""
                          field={`maxima-${groupIndex}-period3`}
                          isTableCell={true}
                        />
                      </td>
                      <td className="border border-black px-0.5 py-0.5 text-xs text-center font-bold bg-white">
                        <EditableField 
                          value={group.maxima.periodMaxima}
                          onChange={(value) => updateMaximaField(groupIndex, 'periodMaxima', value)}
                          isEditable={isEditable}
                          placeholder=""
                          field={`maxima-${groupIndex}-period4`}
                          isTableCell={true}
                        />
                      </td>
                      <td className="border border-black px-0.5 py-0.5 text-xs text-center font-bold bg-white">
                        <EditableField 
                          value={group.maxima.examMaxima}
                          onChange={(value) => updateMaximaField(groupIndex, 'examMaxima', value)}
                          isEditable={isEditable}
                          placeholder=""
                          field={`maxima-${groupIndex}-exam2`}
                          isTableCell={true}
                        />
                      </td>
                      <td className="border border-black px-0.5 py-0.5 text-xs text-center font-bold bg-white">
                        <EditableField 
                          value={group.maxima.totalMaxima}
                          onChange={(value) => updateMaximaField(groupIndex, 'totalMaxima', value)}
                          isEditable={isEditable}
                          placeholder=""
                          field={`maxima-${groupIndex}-total2`}
                          isTableCell={true}
                        />
                      </td>
                      <td className="border border-black px-0.5 py-0.5 text-xs text-center font-bold bg-white">
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
                          <td className="border border-black px-1 py-1 text-[8px] text-center bg-white">Total</td>
                          <td className="border border-black px-1 py-1 text-xs bg-white"></td>
                          <td className="border border-black px-1 py-1 text-xs bg-white">&nbsp;</td>
                        </>
                      )}
                      {isSecondMaxima && !hasStartedVerificationSection && (
                        <>
                          <td colSpan={3} rowSpan={totalRows - rowIndex} className="px-2 py-2 text-xs align-top">
                            <div className="space-y-2">
                              <div className="font-bold text-xs">Verified</div>
                              <div>Date: <EditableField 
                                value={data.issueDate || ''} 
                                isEditable={isEditable}
                                placeholder="Enter issue date"
                                field="issueDate"
                                className="inline-block min-w-[80px]"
                                onChange={(value) => {
                                  if (onDataChange) {
                                    onDataChange({ ...data, issueDate: value });
                                  }
                                }}
                              /></div>
                              
                              <div className="pt-1">By the Head of Center</div>
                              <div><EditableField 
                                value={data.verifierName || ''} 
                                isEditable={isEditable}
                                placeholder="Enter verifier name"
                                field="verifierName"
                                className="inline-block min-w-[100px]"
                                onChange={(value) => {
                                  if (onDataChange) {
                                    onDataChange({ ...data, verifierName: value });
                                  }
                                }}
                              /></div>
                              <div className="font-bold">(signed)</div>
                              
                              <div className="pt-2">
                                <div className="font-bold">CENTER CODE:</div>
                                <div className="flex justify-start mt-1">
                                  {renderEditableCodeBoxes(
                                    data.centerCode || '', 
                                    5, 
                                    isEditable, 
                                    (value) => {
                                      if (onDataChange) {
                                        onDataChange({ ...data, centerCode: value });
                                      }
                                    }
                                  )}
                                </div>
                              </div>
                              
                              <div className="pt-2">
                                <div className="font-bold">FINAL RESULTS</div>
                                <div className="mt-0.5">Passed (1)</div>
                                <div>With <EditableField 
                                  value={data.finalResultPercentage || ''} 
                                  isEditable={isEditable}
                                  placeholder="Enter percentage"
                                  field="finalResultPercentage"
                                  className="inline-block min-w-[16px]"
                                  onChange={(value) => {
                                    if (onDataChange) {
                                      onDataChange({ ...data, finalResultPercentage: value });
                                    }
                                  }}
                                /> %</div>
                              </div>
                              
                              <div className="pt-2">
                                <div>Endorsed by Head Teacher</div>
                                <div>On <EditableField 
                                  value={data.endorsementDate || ''} 
                                  isEditable={isEditable}
                                  placeholder="Enter endorsement date"
                                  field="endorsementDate"
                                  className="inline-block min-w-[80px]"
                                  onChange={(value) => {
                                    if (onDataChange) {
                                      onDataChange({ ...data, endorsementDate: value });
                                    }
                                  }}
                                /></div>
                                <div className="mt-0.5 text-[10px]">School Stamp and Signature</div>
                              </div>
                            </div>
                          </td>
                        </>
                      )}
                    </tr>
                  );
                  
                  rowIndex++;
                  if (isFirstMaxima) { 
                    isFirstMaxima = false; 
                    isSecondMaxima = true; 
                  } else if (isSecondMaxima) { 
                    isSecondMaxima = false; 
                    hasStartedVerificationSection = true; 
                  }
                  
                  // Subject rows for this group
                  group.subjects.forEach((subject, subjectIndex) => {
                    // Find the original subject index in the flat subjects array
                    const originalSubjectIndex = (data.subjects || []).findIndex(s => s === subject);
                    
                    groupRows.push(
                      <tr key={`subject-${groupIndex}-${subjectIndex}`}>
                        <td className="border border-black px-0.5 py-0.5 text-xs bg-white text-left">
                          <EditableField 
                            value={subject.subject}
                            onChange={(value) => updateSubjectField(originalSubjectIndex, 'subject', value)}
                            isEditable={isEditable}
                            placeholder="Subject name"
                            field={`subject-${originalSubjectIndex}-name`}
                            isTableCell={true}
                            className="text-left"
                          />
                        </td>
                        <td className="border border-black px-0.5 py-0.5 text-xs text-center bg-white">
                          <EditableField 
                            value={subject.firstSemester.period1}
                            onChange={(value) => updateSubjectField(originalSubjectIndex, 'firstSemester.period1', value)}
                            isEditable={isEditable}
                            placeholder=""
                            field={`subject-${originalSubjectIndex}-period1`}
                            isTableCell={true}
                          />
                        </td>
                        <td className="border border-black px-0.5 py-0.5 text-xs text-center bg-white">
                          <EditableField 
                            value={subject.firstSemester.period2}
                            onChange={(value) => updateSubjectField(originalSubjectIndex, 'firstSemester.period2', value)}
                            isEditable={isEditable}
                            placeholder=""
                            field={`subject-${originalSubjectIndex}-period2`}
                            isTableCell={true}
                          />
                        </td>
                        <td className="border border-black px-0.5 py-0.5 text-xs text-center bg-white">
                          <EditableField 
                            value={subject.firstSemester.exam}
                            onChange={(value) => updateSubjectField(originalSubjectIndex, 'firstSemester.exam', value)}
                            isEditable={isEditable}
                            placeholder=""
                            field={`subject-${originalSubjectIndex}-exam1`}
                            isTableCell={true}
                          />
                        </td>
                        <td className="border border-black px-0.5 py-0.5 text-xs text-center bg-white">
                          <EditableField 
                            value={subject.firstSemester.total}
                            onChange={(value) => updateSubjectField(originalSubjectIndex, 'firstSemester.total', value)}
                            isEditable={isEditable}
                            placeholder=""
                            field={`subject-${originalSubjectIndex}-total1`}
                            isTableCell={true}
                          />
                        </td>
                        <td className="border border-black px-0.5 py-0.5 text-xs text-center bg-white">
                          <EditableField 
                            value={subject.secondSemester.period3}
                            onChange={(value) => updateSubjectField(originalSubjectIndex, 'secondSemester.period3', value)}
                            isEditable={isEditable}
                            placeholder=""
                            field={`subject-${originalSubjectIndex}-period3`}
                            isTableCell={true}
                          />
                        </td>
                        <td className="border border-black px-0.5 py-0.5 text-xs text-center bg-white">
                          <EditableField 
                            value={subject.secondSemester.period4}
                            onChange={(value) => updateSubjectField(originalSubjectIndex, 'secondSemester.period4', value)}
                            isEditable={isEditable}
                            placeholder=""
                            field={`subject-${originalSubjectIndex}-period4`}
                            isTableCell={true}
                          />
                        </td>
                        <td className="border border-black px-0.5 py-0.5 text-xs text-center bg-white">
                          <EditableField 
                            value={subject.secondSemester.exam}
                            onChange={(value) => updateSubjectField(originalSubjectIndex, 'secondSemester.exam', value)}
                            isEditable={isEditable}
                            placeholder=""
                            field={`subject-${originalSubjectIndex}-exam2`}
                            isTableCell={true}
                          />
                        </td>
                        <td className="border border-black px-0.5 py-0.5 text-xs text-center bg-white">
                          <EditableField 
                            value={subject.secondSemester.total}
                            onChange={(value) => updateSubjectField(originalSubjectIndex, 'secondSemester.total', value)}
                            isEditable={isEditable}
                            placeholder=""
                            field={`subject-${originalSubjectIndex}-total2`}
                            isTableCell={true}
                          />
                        </td>
                        <td className="border border-black px-0.5 py-0.5 text-xs text-center bg-white">
                          <EditableField 
                            value={subject.overallTotal}
                            onChange={(value) => updateSubjectField(originalSubjectIndex, 'overallTotal', value)}
                            isEditable={isEditable}
                            placeholder=""
                            field={`subject-${originalSubjectIndex}-overall`}
                            isTableCell={true}
                          />
                        </td>
                        {rowIndex === 1 && (
                          <>
                            <td className="border border-black px-0.5 py-0.5 text-[8px] text-center">%</td>
                            <td className="border border-black px-0.5 py-0.5 text-xs">&nbsp;</td>
                            <td className="border border-black px-0.5 py-0.5 text-xs">&nbsp;</td>
                          </>
                        )}
                      </tr>
                    );
                    rowIndex++;
                  });
                  
                  return groupRows;
                }).flat();
              })()}

              {/* Summary rows */}
              <tr>
                <td className="border border-black px-0.5 py-0.5 text-xs font-bold">AGGREGATES MAXIMA</td>
                <td className="border border-black px-0.5 py-0.5 text-xs text-center">
                  <EditableField 
                    value={data.summaryValues?.aggregatesMaxima?.period1 || ''}
                    onChange={(value) => updateSummaryField('aggregatesMaxima', 'period1', value)}
                    isEditable={isEditable}
                    placeholder=""
                    field="aggregatesMaxima-period1"
                    isTableCell={true}
                  />
                </td>
                <td className="border border-black px-0.5 py-0.5 text-xs text-center">
                  <EditableField 
                    value={data.summaryValues?.aggregatesMaxima?.period2 || ''}
                    onChange={(value) => updateSummaryField('aggregatesMaxima', 'period2', value)}
                    isEditable={isEditable}
                    placeholder=""
                    field="aggregatesMaxima-period2"
                    isTableCell={true}
                  />
                </td>
                <td className="border border-black px-0.5 py-0.5 text-xs text-center">
                  <EditableField 
                    value={data.summaryValues?.aggregatesMaxima?.exam1 || ''}
                    onChange={(value) => updateSummaryField('aggregatesMaxima', 'exam1', value)}
                    isEditable={isEditable}
                    placeholder=""
                    field="aggregatesMaxima-exam1"
                    isTableCell={true}
                  />
                </td>
                <td className="border border-black px-0.5 py-0.5 text-xs text-center">
                  <EditableField 
                    value={data.summaryValues?.aggregatesMaxima?.total1 || renderGrade(data.totalMarksOutOf?.firstSemester)}
                    onChange={(value) => updateSummaryField('aggregatesMaxima', 'total1', value)}
                    isEditable={isEditable}
                    placeholder=""
                    field="aggregatesMaxima-total1"
                    isTableCell={true}
                  />
                </td>
                <td className="border border-black px-0.5 py-0.5 text-xs text-center">
                  <EditableField 
                    value={data.summaryValues?.aggregatesMaxima?.period3 || ''}
                    onChange={(value) => updateSummaryField('aggregatesMaxima', 'period3', value)}
                    isEditable={isEditable}
                    placeholder=""
                    field="aggregatesMaxima-period3"
                    isTableCell={true}
                  />
                </td>
                <td className="border border-black px-0.5 py-0.5 text-xs text-center">
                  <EditableField 
                    value={data.summaryValues?.aggregatesMaxima?.period4 || ''}
                    onChange={(value) => updateSummaryField('aggregatesMaxima', 'period4', value)}
                    isEditable={isEditable}
                    placeholder=""
                    field="aggregatesMaxima-period4"
                    isTableCell={true}
                  />
                </td>
                <td className="border border-black px-0.5 py-0.5 text-xs text-center">
                  <EditableField 
                    value={data.summaryValues?.aggregatesMaxima?.exam2 || ''}
                    onChange={(value) => updateSummaryField('aggregatesMaxima', 'exam2', value)}
                    isEditable={isEditable}
                    placeholder=""
                    field="aggregatesMaxima-exam2"
                    isTableCell={true}
                  />
                </td>
                <td className="border border-black px-0.5 py-0.5 text-xs text-center">
                  <EditableField 
                    value={data.summaryValues?.aggregatesMaxima?.total2 || renderGrade(data.totalMarksOutOf?.secondSemester)}
                    onChange={(value) => updateSummaryField('aggregatesMaxima', 'total2', value)}
                    isEditable={isEditable}
                    placeholder=""
                    field="aggregatesMaxima-total2"
                    isTableCell={true}
                  />
                </td>
                <td className="border border-black px-0.5 py-0.5 text-xs text-center">
                  <EditableField 
                    value={data.summaryValues?.aggregatesMaxima?.overall || ''}
                    onChange={(value) => updateSummaryField('aggregatesMaxima', 'overall', value)}
                    isEditable={isEditable}
                    placeholder=""
                    field="aggregatesMaxima-overall"
                    isTableCell={true}
                  />
                </td>
              </tr>
              
              <tr>
                <td className="border border-black px-0.5 py-0.5 text-xs font-bold">AGGREGATES</td>
                <td className="border border-black px-0.5 py-0.5 text-xs text-center">
                  <EditableField 
                    value={data.summaryValues?.aggregates?.period1 || ''}
                    onChange={(value) => updateSummaryField('aggregates', 'period1', value)}
                    isEditable={isEditable}
                    placeholder=""
                    field="aggregates-period1"
                    isTableCell={true}
                  />
                </td>
                <td className="border border-black px-0.5 py-0.5 text-xs text-center">
                  <EditableField 
                    value={data.summaryValues?.aggregates?.period2 || ''}
                    onChange={(value) => updateSummaryField('aggregates', 'period2', value)}
                    isEditable={isEditable}
                    placeholder=""
                    field="aggregates-period2"
                    isTableCell={true}
                  />
                </td>
                <td className="border border-black px-0.5 py-0.5 text-xs text-center">
                  <EditableField 
                    value={data.summaryValues?.aggregates?.exam1 || ''}
                    onChange={(value) => updateSummaryField('aggregates', 'exam1', value)}
                    isEditable={isEditable}
                    placeholder=""
                    field="aggregates-exam1"
                    isTableCell={true}
                  />
                </td>
                <td className="border border-black px-0.5 py-0.5 text-xs text-center">
                  <EditableField 
                    value={data.summaryValues?.aggregates?.total1 || renderGrade(data.totalMarksObtained?.firstSemester)}
                    onChange={(value) => updateSummaryField('aggregates', 'total1', value)}
                    isEditable={isEditable}
                    placeholder=""
                    field="aggregates-total1"
                    isTableCell={true}
                  />
                </td>
                <td className="border border-black px-0.5 py-0.5 text-xs text-center">
                  <EditableField 
                    value={data.summaryValues?.aggregates?.period3 || ''}
                    onChange={(value) => updateSummaryField('aggregates', 'period3', value)}
                    isEditable={isEditable}
                    placeholder=""
                    field="aggregates-period3"
                    isTableCell={true}
                  />
                </td>
                <td className="border border-black px-0.5 py-0.5 text-xs text-center">
                  <EditableField 
                    value={data.summaryValues?.aggregates?.period4 || ''}
                    onChange={(value) => updateSummaryField('aggregates', 'period4', value)}
                    isEditable={isEditable}
                    placeholder=""
                    field="aggregates-period4"
                    isTableCell={true}
                  />
                </td>
                <td className="border border-black px-0.5 py-0.5 text-xs text-center">
                  <EditableField 
                    value={data.summaryValues?.aggregates?.exam2 || ''}
                    onChange={(value) => updateSummaryField('aggregates', 'exam2', value)}
                    isEditable={isEditable}
                    placeholder=""
                    field="aggregates-exam2"
                    isTableCell={true}
                  />
                </td>
                <td className="border border-black px-0.5 py-0.5 text-xs text-center">
                  <EditableField 
                    value={data.summaryValues?.aggregates?.total2 || renderGrade(data.totalMarksObtained?.secondSemester)}
                    onChange={(value) => updateSummaryField('aggregates', 'total2', value)}
                    isEditable={isEditable}
                    placeholder=""
                    field="aggregates-total2"
                    isTableCell={true}
                  />
                </td>
                <td className="border border-black px-0.5 py-0.5 text-xs text-center">
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
                <td className="border border-black px-0.5 py-0.5 text-xs font-bold">PERCENTAGE</td>
                <td className="border border-black px-0.5 py-0.5 text-xs text-center">
                  <EditableField 
                    value={data.summaryValues?.percentage?.period1 || ''}
                    onChange={(value) => updateSummaryField('percentage', 'period1', value)}
                    isEditable={isEditable}
                    placeholder=""
                    field="percentage-period1"
                    isTableCell={true}
                  />
                </td>
                <td className="border border-black px-0.5 py-0.5 text-xs text-center">
                  <EditableField 
                    value={data.summaryValues?.percentage?.period2 || ''}
                    onChange={(value) => updateSummaryField('percentage', 'period2', value)}
                    isEditable={isEditable}
                    placeholder=""
                    field="percentage-period2"
                    isTableCell={true}
                  />
                </td>
                <td className="border border-black px-0.5 py-0.5 text-xs text-center">
                  <EditableField 
                    value={data.summaryValues?.percentage?.exam1 || ''}
                    onChange={(value) => updateSummaryField('percentage', 'exam1', value)}
                    isEditable={isEditable}
                    placeholder=""
                    field="percentage-exam1"
                    isTableCell={true}
                  />
                </td>
                <td className="border border-black px-0.5 py-0.5 text-xs text-center">
                  <EditableField 
                    value={data.summaryValues?.percentage?.total1 || renderGrade(data.percentage?.firstSemester)}
                    onChange={(value) => updateSummaryField('percentage', 'total1', value)}
                    isEditable={isEditable}
                    placeholder=""
                    field="percentage-total1"
                    isTableCell={true}
                  />
                </td>
                <td className="border border-black px-0.5 py-0.5 text-xs text-center">
                  <EditableField 
                    value={data.summaryValues?.percentage?.period3 || ''}
                    onChange={(value) => updateSummaryField('percentage', 'period3', value)}
                    isEditable={isEditable}
                    placeholder=""
                    field="percentage-period3"
                    isTableCell={true}
                  />
                </td>
                <td className="border border-black px-0.5 py-0.5 text-xs text-center">
                  <EditableField 
                    value={data.summaryValues?.percentage?.period4 || ''}
                    onChange={(value) => updateSummaryField('percentage', 'period4', value)}
                    isEditable={isEditable}
                    placeholder=""
                    field="percentage-period4"
                    isTableCell={true}
                  />
                </td>
                <td className="border border-black px-0.5 py-0.5 text-xs text-center">
                  <EditableField 
                    value={data.summaryValues?.percentage?.exam2 || ''}
                    onChange={(value) => updateSummaryField('percentage', 'exam2', value)}
                    isEditable={isEditable}
                    placeholder=""
                    field="percentage-exam2"
                    isTableCell={true}
                  />
                </td>
                <td className="border border-black px-0.5 py-0.5 text-xs text-center">
                  <EditableField 
                    value={data.summaryValues?.percentage?.total2 || renderGrade(data.percentage?.secondSemester)}
                    onChange={(value) => updateSummaryField('percentage', 'total2', value)}
                    isEditable={isEditable}
                    placeholder=""
                    field="percentage-total2"
                    isTableCell={true}
                  />
                </td>
                <td className="border border-black px-0.5 py-0.5 text-xs text-center">
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
                <td className="border border-black px-0.5 py-0.5 text-xs">POSITION/OUT OF</td>
                <td className="border border-black px-0.5 py-0.5 text-xs text-center">
                  <EditableField 
                    value={data.summaryValues?.position?.period1 || ''}
                    onChange={(value) => updateSummaryField('position', 'period1', value)}
                    isEditable={isEditable}
                    placeholder=""
                    field="position-period1"
                    isTableCell={true}
                  />
                </td>
                <td className="border border-black px-0.5 py-0.5 text-xs text-center">
                  <EditableField 
                    value={data.summaryValues?.position?.period2 || ''}
                    onChange={(value) => updateSummaryField('position', 'period2', value)}
                    isEditable={isEditable}
                    placeholder=""
                    field="position-period2"
                    isTableCell={true}
                  />
                </td>
                <td className="border border-black px-0.5 py-0.5 text-xs text-center">
                  <EditableField 
                    value={data.summaryValues?.position?.exam1 || ''}
                    onChange={(value) => updateSummaryField('position', 'exam1', value)}
                    isEditable={isEditable}
                    placeholder=""
                    field="position-exam1"
                    isTableCell={true}
                  />
                </td>
                <td className="border border-black px-0.5 py-0.5 text-xs text-center">
                  <EditableField 
                    value={data.summaryValues?.position?.total1 || `${data.position} / ${data.totalStudents}`}
                    onChange={(value) => updateSummaryField('position', 'total1', value)}
                    isEditable={isEditable}
                    placeholder="1/30"
                    field="position-total1"
                    isTableCell={true}
                  />
                </td>
                <td className="border border-black px-0.5 py-0.5 text-xs text-center">
                  <EditableField 
                    value={data.summaryValues?.position?.period3 || ''}
                    onChange={(value) => updateSummaryField('position', 'period3', value)}
                    isEditable={isEditable}
                    placeholder=""
                    field="position-period3"
                    isTableCell={true}
                  />
                </td>
                <td className="border border-black px-0.5 py-0.5 text-xs text-center">
                  <EditableField 
                    value={data.summaryValues?.position?.period4 || ''}
                    onChange={(value) => updateSummaryField('position', 'period4', value)}
                    isEditable={isEditable}
                    placeholder=""
                    field="position-period4"
                    isTableCell={true}
                  />
                </td>
                <td className="border border-black px-0.5 py-0.5 text-xs text-center">
                  <EditableField 
                    value={data.summaryValues?.position?.exam2 || ''}
                    onChange={(value) => updateSummaryField('position', 'exam2', value)}
                    isEditable={isEditable}
                    placeholder=""
                    field="position-exam2"
                    isTableCell={true}
                  />
                </td>
                <td className="border border-black px-0.5 py-0.5 text-xs text-center">
                  <EditableField 
                    value={data.summaryValues?.position?.total2 || `${data.position} / ${data.totalStudents}`}
                    onChange={(value) => updateSummaryField('position', 'total2', value)}
                    isEditable={isEditable}
                    placeholder="1/30"
                    field="position-total2"
                    isTableCell={true}
                  />
                </td>
                <td className="border border-black px-0.5 py-0.5 text-xs text-center">
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
                <td className="border border-black px-0.5 py-0.5 text-xs">APPLICATION</td>
                <td className="border border-black px-0.5 py-0.5 text-xs text-center">
                  <EditableField 
                    value={data.summaryValues?.application?.period1 || data.application || 'B'}
                    onChange={(value) => updateSummaryField('application', 'period1', value)}
                    isEditable={isEditable}
                    placeholder="B"
                    field="application-period1"
                    isTableCell={true}
                  />
                </td>
                <td className="border border-black px-0.5 py-0.5 text-xs text-center">
                  <EditableField 
                    value={data.summaryValues?.application?.period2 || data.application || 'B'}
                    onChange={(value) => updateSummaryField('application', 'period2', value)}
                    isEditable={isEditable}
                    placeholder="B"
                    field="application-period2"
                    isTableCell={true}
                  />
                </td>
                <td colSpan={2} className="border border-black px-0.5 py-0.5 text-xs bg-black">&nbsp;</td>
                <td className="border border-black px-0.5 py-0.5 text-xs text-center">
                  <EditableField 
                    value={data.summaryValues?.application?.period3 || data.application || 'B'}
                    onChange={(value) => updateSummaryField('application', 'period3', value)}
                    isEditable={isEditable}
                    placeholder="B"
                    field="application-period3"
                    isTableCell={true}
                  />
                </td>
                <td className="border border-black px-0.5 py-0.5 text-xs text-center">
                  <EditableField 
                    value={data.summaryValues?.application?.period4 || data.application || 'B'}
                    onChange={(value) => updateSummaryField('application', 'period4', value)}
                    isEditable={isEditable}
                    placeholder="B"
                    field="application-period4"
                    isTableCell={true}
                  />
                </td>
                <td colSpan={2} className="border border-black px-0.5 py-0.5 text-xs bg-black">&nbsp;</td>
                <td className="border border-black px-0.5 py-0.5 text-xs bg-black">&nbsp;</td>
              </tr>

              <tr>
                <td className="border border-black px-0.5 py-0.5 text-xs">BEHAVIOUR</td>
                <td className="border border-black px-0.5 py-0.5 text-xs text-center">
                  <EditableField 
                    value={data.summaryValues?.behaviour?.period1 || data.behaviour || 'B'}
                    onChange={(value) => updateSummaryField('behaviour', 'period1', value)}
                    isEditable={isEditable}
                    placeholder="B"
                    field="behaviour-period1"
                    isTableCell={true}
                  />
                </td>
                <td className="border border-black px-0.5 py-0.5 text-xs text-center">
                  <EditableField 
                    value={data.summaryValues?.behaviour?.period2 || data.behaviour || 'B'}
                    onChange={(value) => updateSummaryField('behaviour', 'period2', value)}
                    isEditable={isEditable}
                    placeholder="B"
                    field="behaviour-period2"
                    isTableCell={true}
                  />
                </td>
                <td colSpan={2} className="border border-black px-0.5 py-0.5 text-xs bg-black">&nbsp;</td>
                <td className="border border-black px-0.5 py-0.5 text-xs text-center">
                  <EditableField 
                    value={data.summaryValues?.behaviour?.period3 || data.behaviour || 'B'}
                    onChange={(value) => updateSummaryField('behaviour', 'period3', value)}
                    isEditable={isEditable}
                    placeholder="B"
                    field="behaviour-period3"
                    isTableCell={true}
                  />
                </td>
                <td className="border border-black px-0.5 py-0.5 text-xs text-center">
                  <EditableField 
                    value={data.summaryValues?.behaviour?.period4 || data.behaviour || 'B'}
                    onChange={(value) => updateSummaryField('behaviour', 'period4', value)}
                    isEditable={isEditable}
                    placeholder="B"
                    field="behaviour-period4"
                    isTableCell={true}
                  />
                </td>
                <td colSpan={2} className="border border-black px-0.5 py-0.5 text-xs bg-black">&nbsp;</td>
                <td className="border border-black px-0.5 py-0.5 text-xs bg-black">&nbsp;</td>
              </tr>

              <tr>
                <td className="border border-black px-0.5 py-0.5 text-xs">GUARDIAN SIGNATURE</td>
                <td className="border border-black px-0.5 py-0.5 text-xs">&nbsp;</td>
                <td className="border border-black px-0.5 py-0.5 text-xs">&nbsp;</td>
                <td className="border border-black px-0.5 py-0.5 text-xs">&nbsp;</td>
                <td className="border border-black px-0.5 py-0.5 text-xs">&nbsp;</td>
                <td className="border border-black px-0.5 py-0.5 text-xs">&nbsp;</td>
                <td className="border border-black px-0.5 py-0.5 text-xs">&nbsp;</td>
                <td className="border border-black px-0.5 py-0.5 text-xs">&nbsp;</td>
                <td colSpan={3} className="border border-black px-0.5 py-0.5 text-xs">&nbsp;</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Footer with Totals & Signatures */}
        <div className="p-2 border-t border-gray-300">
          <div className="flex flex-col space-y-2">
            {/* Promotion Status Section */}
            <div className="space-y-2">
              <p className="text-xs leading-tight">
                Student can only be promoted to the next class after he has passed the supplementary exams in: {data.shouldRepeat || '........................'}
              </p>
              
              <div className="flex justify-between items-center">
                <p className="text-xs">The student is promoted to the next class (1)</p>
                <p className="text-xs">Issued at: {data.issueLocation || '............'} on: {data.issueDate || '................'}</p>
              </div>
              
              <p className="text-xs">The student should repeat: {data.shouldRepeat || '........................'} (1)</p>
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
            <div className="space-y-2 pt-2">
              <div>
                <p className="text-xs text-left font-medium">NOTE: This report card is invalid if altered or modified.</p>
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
    console.error('🚨 Form6Template Error:', error);
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

export default Form6Template;
