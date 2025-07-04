// Data transformation utilities for NTC
// Ensures compatibility between backend OpenAI response and frontend template

/**
 * Transform OpenAI response data to match Form6Template interface
 * @param {Object} rawData - Raw data from OpenAI processing
 * @returns {Object} Transformed data compatible with Form6Template
 */
export const transformBulletinData = (rawData: any) => {
  if (!rawData) {
    console.error('transformBulletinData: No data provided');
    return null;
  }

  try {
    // Transform subjects to ensure proper structure
    const transformedSubjects = rawData.subjects?.map((subject: any, index: number) => {
      const transformed = {
        subject: subject.subject || `Subject ${index + 1}`,
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
        maxima: subject.maxima ? {
          periodMaxima: subject.maxima.periodMaxima ?? null,
          examMaxima: subject.maxima.examMaxima ?? null,
          totalMaxima: subject.maxima.totalMaxima ?? null
        } : undefined,
        nationalExam: subject.nationalExam ? {
          marks: subject.nationalExam.marks ?? '',
          max: subject.nationalExam.max ?? ''
        } : undefined,
        // Include confidence data if available
        confidence: subject.confidence ? {
          subject: subject.confidence.subject ?? 100,
          gradesAvg: subject.confidence.gradesAvg ?? 100,
          maxima: subject.confidence.maxima ?? 100,
          nationalExam: subject.confidence.nationalExam ?? 100
        } : {
          subject: 100,
          gradesAvg: 100,
          maxima: 100,
          nationalExam: 100
        }
      };

      return transformed;
    }) || [];

    const transformedData = {
      // Student Information
      province: rawData.province || '',
      city: rawData.city || '',
      municipality: rawData.municipality || '',
      school: rawData.school || '',
      schoolCode: rawData.schoolCode || '',
      studentName: rawData.studentName || '',
      gender: rawData.gender || '',
      birthPlace: rawData.birthPlace || '',
      birthDate: rawData.birthDate || '',
      class: rawData.class || '',
      permanentNumber: rawData.permanentNumber || '',
      idNumber: rawData.idNumber || '',
      academicYear: rawData.academicYear || '',
      
      // Subjects
      subjects: transformedSubjects,
      
      // Totals - ensure proper number conversion
      totalMarksOutOf: {
        firstSemester: rawData.totalMarksOutOf?.firstSemester ?? '',
        secondSemester: rawData.totalMarksOutOf?.secondSemester ?? ''
      },
      totalMarksObtained: {
        firstSemester: rawData.totalMarksObtained?.firstSemester ?? '',
        secondSemester: rawData.totalMarksObtained?.secondSemester ?? ''
      },
      percentage: {
        firstSemester: rawData.percentage?.firstSemester ?? '',
        secondSemester: rawData.percentage?.secondSemester ?? ''
      },
      
      // Additional fields
      position: rawData.position || '',
      totalStudents: rawData.totalStudents ?? '',
      application: rawData.application || '',
      behaviour: rawData.behaviour || '',
      finalResultPercentage: rawData.finalResultPercentage || '',
      isPromoted: rawData.isPromoted ?? null,
      shouldRepeat: rawData.shouldRepeat || '',
      issueLocation: rawData.issueLocation || '',
      issueDate: rawData.issueDate || '',
      centerCode: rawData.centerCode || '',
      verifierName: rawData.verifierName || '',
      endorsementDate: rawData.endorsementDate || '',
      
      // AI metadata
      extractionMetadata: rawData.extractionMetadata ? {
        confidence: rawData.extractionMetadata.confidence ?? 0,
        missingFields: rawData.extractionMetadata.missingFields ?? [],
        uncertainFields: rawData.extractionMetadata.uncertainFields ?? [],
        extractionNotes: rawData.extractionMetadata.extractionNotes ?? ''
      } : undefined
    };

    return transformedData;
  } catch (error) {
    console.error('Error transforming bulletin data:', error);
    return null;
  }
};

/**
 * Validate transformed data before passing to template
 * @param {Object} data - Transformed bulletin data
 * @returns {Object} Validation result
 */
export const validateBulletinData = (data: any) => {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!data) {
    errors.push('No data provided');
    return { isValid: false, errors, warnings };
  }

  // Check required fields
  if (!data.studentName) warnings.push('Missing student name');
  if (!data.class) warnings.push('Missing class');
  if (!data.subjects || data.subjects.length === 0) {
    errors.push('No subjects found');
  }

  // Check subjects structure
  if (data.subjects) {
    data.subjects.forEach((subject: any, index: number) => {
      if (!subject.subject) {
        warnings.push(`Subject ${index + 1}: Missing subject name`);
      }
      if (!subject.firstSemester && !subject.secondSemester) {
        warnings.push(`Subject ${subject.subject || index + 1}: Missing semester data`);
      }
    });
  }

  const isValid = errors.length === 0;

  return { isValid, errors, warnings };
};
