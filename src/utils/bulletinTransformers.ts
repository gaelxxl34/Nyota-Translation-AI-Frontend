// Bulletin Data Transformers for NTC Dashboard
// Transform Firestore data to template-specific formats

import type { CollegeTranscriptData } from '../components/templates/CollegeAnnualTranscriptTemplate';
import type { CollegeAttestationData } from '../components/templates/CollegeAttestationTemplate';
import type { HighSchoolAttestationData } from '../components/templates/HighSchoolAttestationTemplate';
import type { StateExamAttestationData } from '../components/templates/StateExamAttestationTemplate';
import type { BulletinRecord } from '../types/bulletin';

/**
 * Get display data for bulletin (edited data if available, otherwise original)
 */
export const getBulletinDisplayData = (bulletin: BulletinRecord) => {
  return bulletin.editedData || bulletin.originalData;
};

/**
 * Transform Firestore data to StateDiploma format
 */
export const transformDataForStateDiploma = (data: any) => {
  const transformedData = {
    studentName: data?.studentName || 'STUDENT NAME',
    gender: data?.gender || 'male',
    birthPlace: data?.birthPlace || 'BIRTHPLACE', 
    birthDate: data?.birthDate || {
      day: "01",
      month: "01", 
      year: "2000"
    },
    examSession: data?.examSession || data?.academicYear || 'JUNE 2023',
    percentage: (() => {
      // Handle both object format {total: "40.0%"} and string format "40%"
      let rawPercentage;
      if (typeof data?.percentage === 'object' && data?.percentage?.total) {
        rawPercentage = data.percentage.total;
      } else if (typeof data?.percentage === 'string') {
        rawPercentage = data.percentage;
      } else {
        rawPercentage = data?.finalResultPercentage || '00.0%';
      }
      
      // Extract just the integer part (ignore decimals completely)
      const numericValue = parseFloat(rawPercentage.replace('%', '')) || 0;
      const integerPercentage = Math.round(numericValue);
      const result = integerPercentage.toString() + '%';
      
      return result;
    })(),
    percentageText: data?.percentageText || 'PERCENTAGE IN WORDS',
    section: data?.section || data?.class || 'SECTION NAME',
    option: data?.option || 'OPTION NAME',
    issueDate: data?.issueDate || 'JANUARY 1, 2023',
    referenceNumber: data?.referenceNumber || 'T S 0 7',
    serialNumbers: (() => {
      if (data?.serialNumbers && Array.isArray(data.serialNumbers) && data.serialNumbers.length >= 4) {
        return data.serialNumbers;
      }
      if (data?.referenceNumber && typeof data.referenceNumber === 'string') {
        const cleanRef = data.referenceNumber.replace(/\s+/g, '');
        if (cleanRef.length >= 4) {
          return cleanRef.split('');
        }
      }
      return ['T', 'S', '0', '7', '5', '2', '0', '7', '2', '4', '0', '7', '0', '3', '7', '0', '7', '0'];
    })(),
    serialCode: data?.serialCode || '3564229'
  };

  return transformedData;
};

/**
 * Transform Firestore data to BachelorDiploma format
 */
export const transformDataForBachelorDiploma = (data: any) => {
  const transformedData = {
    institutionName: data?.institutionName || 'INSTITUT SUPERIEUR DE COMMERCE DE GOMA',
    institutionLocation: data?.institutionLocation || 'GOMA',
    diplomaNumber: data?.diplomaNumber || '0000',
    studentName: data?.studentName || 'STUDENT NAME',
    birthPlace: data?.birthPlace || 'BIRTHPLACE',
    birthDate: data?.birthDate || '01 janvier 2000',
    degree: data?.degree || 'troisième graduat en sciences',
    specialization: data?.specialization || 'commerciales et fin',
    orientation: data?.orientation || 'douanes et accises',
    gradeLevel: data?.gradeLevel || 'GRADE EN SCIENCES',
    gradeSpecialization: data?.gradeSpecialization || 'COMML ET FIN',
    option: data?.option || 'douanes et accises',
    orientationDetail: data?.orientationDetail || '',
    completionDate: data?.completionDate || '30 décembre 2020',
    graduationYear: data?.graduationYear || 'deuxième quadrimestre',
    issueLocation: data?.issueLocation || 'À Goma',
    issueDate: data?.issueDate || '03 juin 2021',
    registrationDate: data?.registrationDate || '03 juin 2021',
    registrationNumber: data?.registrationNumber || '1487',
    serialCode: data?.serialCode || 'XXX',
    examDate: data?.examDate || '25 juillet 2021',
    registerLetter: data?.registerLetter || 'M'
  };

  return transformedData;
};

/**
 * Transform Firestore data to College Annual Transcript format
 */
export const transformDataForCollegeTranscript = (data: any): CollegeTranscriptData => {
  const baseData: any = {
    country: 'RÉPUBLIQUE DÉMOCRATIQUE DU CONGO',
    institutionType: 'ENSEIGNEMENT SUPÉRIEUR ET UNIVERSITAIRE',
    institutionName: 'INSTITUT SUPÉRIEUR DE COMMERCE',
    institutionAbbreviation: 'I.S.C - Beni',
    institutionEmail: 'iscbeni@yahoo.fr / iscbeni@gmail.com',
    departmentName: 'Academic Services',
    documentTitle: 'TRANSCRIPT OF SUBJECTS AND GRADES',
    documentNumber: '',
    studentName: 'STUDENT FULL NAME',
    matricule: '000/00',
    hasFollowedCourses: 'regularly followed the subjects planned in the program in',
    section: 'Commercial Sciences and Finance Section',
    option: 'Fiscal Option',
    level: 'First Year License',
    academicYear: '2020-2021',
    session: 'First Session',
    courses: [
      { courseNumber: 1, courseName: 'Business Economics', creditHours: '120H', grade: '44/60' },
      { courseNumber: 2, courseName: 'Quantitative Management Methods', creditHours: '120H', grade: '61/80' },
      { courseNumber: 3, courseName: 'Fiscal Law and Procedures', creditHours: '90H', grade: '41/60' },
      { courseNumber: 4, courseName: 'Business Law and Ethics', creditHours: '60H', grade: '24/40' },
      { courseNumber: 5, courseName: 'Project Preparation and Evaluation', creditHours: '60H', grade: '24.5/40' },
      { courseNumber: 6, courseName: 'Business Taxation', creditHours: '60H', grade: '30.5/40' },
      { courseNumber: 7, courseName: 'In-depth Questions in HR Management', creditHours: '60H', grade: '28.5/40' },
      { courseNumber: 8, courseName: 'Financial Management', creditHours: '45H', grade: '22.5/30' },
      { courseNumber: 9, courseName: 'Business English I', creditHours: '45H', grade: '24/30' },
      { courseNumber: 10, courseName: 'In-depth IT Questions I', creditHours: '45H', grade: '20/30' },
      { courseNumber: 11, courseName: 'Customs and Finance Law', creditHours: '45H', grade: '20/30' },
      { courseNumber: 12, courseName: 'National Accounting', creditHours: '30H', grade: '13.5/20' },
      { courseNumber: 13, courseName: 'Scientific Research Methods', creditHours: '30H', grade: '10/20' },
    ],
    decision: '',
    issueLocation: 'Beni',
    issueDate: '',
    secretary: '',
    secretaryTitle: 'Academic Secretary of Sections',
    chiefOfWorks: '',
    chiefOfWorksTitle: 'The Chief of Sections of I.S.C./Beni',
  };

  if (!data) {
    return baseData;
  }

  const sourceCourses = Array.isArray(data?.courses)
    ? data.courses
    : Array.isArray(data?.subjects)
      ? data.subjects
      : baseData.courses;

  const stringify = (value: any, fallback: string) => {
    if (value === undefined || value === null || value === '') {
      return fallback;
    }
    return String(value);
  };

  const courses = sourceCourses.map((course: any, index: number) => {
    const courseNumber =
      typeof course?.courseNumber === 'number'
        ? course.courseNumber
        : typeof course?.number === 'number'
          ? course.number
          : index + 1;

    const mappedCourse: any = {
      courseNumber,
      courseName: stringify(course?.courseName ?? course?.subject ?? course?.title, `Course ${index + 1}`),
      creditHours: stringify(course?.creditHours ?? course?.hours ?? course?.volumeHoraire, ''),
      grade: stringify(course?.grade ?? course?.score ?? course?.total, ''),
    };

    if (course?.units !== undefined) {
      mappedCourse.units = stringify(course.units, '');
    }
    if (course?.maxGrade !== undefined) {
      mappedCourse.maxGrade = stringify(course.maxGrade, '');
    }
    if (course?.weightedGrade !== undefined) {
      mappedCourse.weightedGrade = stringify(course.weightedGrade, '');
    }

    return mappedCourse;
  });

  const summaryRows = Array.isArray(data?.summaryRows) ? data.summaryRows : [];

  const result: any = {
    ...baseData,
    country: data?.country || baseData.country,
    institutionType: data?.institutionType || baseData.institutionType,
    institutionName: data?.institutionName || baseData.institutionName,
    institutionAbbreviation: data?.institutionAbbreviation || baseData.institutionAbbreviation,
    institutionEmail: data?.institutionEmail || baseData.institutionEmail,
    departmentName: data?.departmentName || baseData.departmentName,
    documentTitle: data?.documentTitle || baseData.documentTitle,
    documentNumber: data?.documentNumber || baseData.documentNumber,
    studentName: data?.studentName || baseData.studentName,
    matricule: data?.matricule || data?.registrationNumber || baseData.matricule,
    hasFollowedCourses: data?.hasFollowedCourses || baseData.hasFollowedCourses,
    section: data?.section || baseData.section,
    option: data?.option || baseData.option,
    level: data?.level || baseData.level,
    academicYear: data?.academicYear || baseData.academicYear,
    session: data?.session || baseData.session,
    tableFormat: data?.tableFormat || 'simple',
    courses,
    summaryRows,
    decision: data?.decision || data?.outcome || baseData.decision,
    issueLocation: data?.issueLocation || baseData.issueLocation,
    issueDate: data?.issueDate || baseData.issueDate,
    secretary: data?.secretary || baseData.secretary,
    secretaryTitle: data?.secretaryTitle || baseData.secretaryTitle,
    chiefOfWorks: data?.chiefOfWorks || baseData.chiefOfWorks,
    chiefOfWorksTitle: data?.chiefOfWorksTitle || baseData.chiefOfWorksTitle,
  };

  if (data?.totalGrade || data?.finalScore) {
    result.totalGrade = data?.totalGrade || data?.finalScore;
  }
  if (data?.percentage || data?.finalPercentage) {
    result.percentage = data?.percentage || data?.finalPercentage;
  }

  return result;
};

/**
 * Transform Firestore data to College Attestation format
 */
export const transformDataForCollegeAttestation = (data: any): CollegeAttestationData => {
  const baseData: CollegeAttestationData = {
    country: 'RÉPUBLIQUE DÉMOCRATIQUE DU CONGO',
    institutionType: 'ENSEIGNEMENT SUPÉRIEUR ET UNIVERSITAIRE',
    institutionName: 'INSTITUT SUPÉRIEUR DE COMMERCE',
    institutionAbbreviation: 'I.S.C - Beni',
    institutionEmail: 'iscbeni@yahoo.fr / iscbeni@gmail.com',
    institutionWebsite: 'www.iscbeni.ac.cd',
    departmentName: 'Academic Services',
    documentTitle: 'ATTESTATION DE FRÉQUENTATION',
    documentNumber: '',
    signatoryTitle: 'The Undersigned',
    signatoryName: '',
    signatoryPosition: 'Academic Secretary',
    studentName: 'STUDENT FULL NAME',
    studentGender: 'le',
    birthPlace: 'BIRTHPLACE',
    birthDate: 'January 1, 2000',
    matricule: '000/00',
    enrollmentStatus: 'régulièrement inscrit(e) en Section de',
    section: 'Commercial Sciences and Finance',
    option: 'Fiscal Option',
    institutionLocation: 'Beni',
    academicYear: '2020-2021',
    yearLevel: 'Deuxième Licence',
    performance: 'mention SATISFAISANT',
    percentage: '(69,1%)',
    session: 'en première session',
    purpose: 'Cette attestation de fréquentation lui est delivrée pour valoir ce que de droit',
    issueLocation: 'Beni',
    issueDate: '',
    secretaryTitle: 'Academic Secretary of Sections',
    chiefTitle: 'The Chief of Sections',
    chiefName: '',
    chiefPosition: 'Chief of Sections of I.S.C./Beni',
  };

  if (!data) {
    return baseData;
  }

  return {
    ...baseData,
    country: data?.country || baseData.country,
    institutionType: data?.institutionType || baseData.institutionType,
    institutionName: data?.institutionName || baseData.institutionName,
    institutionAbbreviation: data?.institutionAbbreviation || baseData.institutionAbbreviation,
    institutionEmail: data?.institutionEmail || baseData.institutionEmail,
    institutionWebsite: data?.institutionWebsite || baseData.institutionWebsite,
    departmentName: data?.departmentName || baseData.departmentName,
    documentTitle: data?.documentTitle || baseData.documentTitle,
    documentNumber: data?.documentNumber || baseData.documentNumber,
    signatoryTitle: data?.signatoryTitle || baseData.signatoryTitle,
    signatoryName: data?.signatoryName || baseData.signatoryName,
    signatoryPosition: data?.signatoryPosition || baseData.signatoryPosition,
    studentName: data?.studentName || baseData.studentName,
    studentGender: data?.studentGender || data?.gender === 'female' ? 'la' : 'le',
    birthPlace: data?.birthPlace || baseData.birthPlace,
    birthDate: data?.birthDate || baseData.birthDate,
    matricule: data?.matricule || data?.registrationNumber || baseData.matricule,
    enrollmentStatus: data?.enrollmentStatus || baseData.enrollmentStatus,
    section: data?.section || baseData.section,
    option: data?.option || baseData.option,
    institutionLocation: data?.institutionLocation || baseData.institutionLocation,
    academicYear: data?.academicYear || baseData.academicYear,
    yearLevel: data?.yearLevel || data?.level || baseData.yearLevel,
    performance: data?.performance || baseData.performance,
    percentage: data?.percentage || baseData.percentage,
    session: data?.session || baseData.session,
    purpose: data?.purpose || baseData.purpose,
    issueLocation: data?.issueLocation || baseData.issueLocation,
    issueDate: data?.issueDate || baseData.issueDate,
    secretaryTitle: data?.secretaryTitle || baseData.secretaryTitle,
    chiefTitle: data?.chiefTitle || baseData.chiefTitle,
    chiefName: data?.chiefName || baseData.chiefName,
    chiefPosition: data?.chiefPosition || baseData.chiefPosition,
  };
};

/**
 * Transform Firestore data for High School Attestation
 */
export const transformDataForHighSchoolAttestation = (data: any): HighSchoolAttestationData => {
  const baseData: HighSchoolAttestationData = {
    schoolName: 'School Name',
    schoolAddress: 'School Address',
    province: 'Province',
    division: 'Division',
    documentTitle: 'School Attendance Certificate',
    studentName: 'STUDENT FULL NAME',
    studentGender: 'M',
    birthDate: 'January 1, 2000',
    birthPlace: 'Birthplace',
    mainContent: 'This is to certify that the above-named student has attended this institution during the academic year.',
    purpose: 'This certificate is issued for official purposes.',
    issueLocation: 'City',
    issueDate: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
    signatoryName: 'Director Name',
    signatoryTitle: 'School Director',
  };

  if (!data) {
    return baseData;
  }

  return {
    ...baseData,
    schoolName: data?.schoolName || data?.school || baseData.schoolName,
    schoolAddress: data?.schoolAddress || baseData.schoolAddress,
    province: data?.province || baseData.province,
    division: data?.division || baseData.division,
    documentTitle: data?.documentTitle || baseData.documentTitle,
    studentName: data?.studentName || baseData.studentName,
    studentGender: data?.studentGender || (data?.gender?.toLowerCase() === 'female' ? 'F' : 'M'),
    birthDate: data?.birthDate || baseData.birthDate,
    birthPlace: data?.birthPlace || baseData.birthPlace,
    mainContent: data?.mainContent || baseData.mainContent,
    purpose: data?.purpose || baseData.purpose,
    issueLocation: data?.issueLocation || data?.city || baseData.issueLocation,
    issueDate: data?.issueDate || baseData.issueDate,
    signatoryName: data?.signatoryName || data?.directorName || baseData.signatoryName,
    signatoryTitle: data?.signatoryTitle || data?.directorTitle || baseData.signatoryTitle,
  };
};

/**
 * Transform Firestore data for State Exam Attestation
 */
export const transformDataForStateExamAttestation = (data: any): StateExamAttestationData => {
  const baseData: StateExamAttestationData = {
    attestationNumber: 'N°000000000/2021',
    studentName: 'STUDENT NAME',
    birthPlace: 'BIRTHPLACE',
    birthDate: {
      day: '01',
      month: '01',
      year: '2003'
    },
    schoolName: 'SCHOOL NAME',
    schoolCode: '000000000000',
    examSession: '2021',
    section: 'TECHNICAL',
    option: 'COMMERCIAL AND MANAGEMENT',
    percentage: '56',
    issuePlace: 'KINSHASA',
    issueDate: {
      day: '21',
      month: '10',
      year: '2021'
    },
    validUntil: {
      day: '21',
      month: '02',
      year: '2022'
    },
    inspectorName: 'INSPECTOR NAME'
  };

  if (!data) {
    return baseData;
  }

  // Helper to parse date strings into day/month/year object
  const parseDateString = (dateStr: string | any): { day: string; month: string; year: string } => {
    if (typeof dateStr === 'object' && dateStr.day && dateStr.month && dateStr.year) {
      return dateStr;
    }
    if (typeof dateStr === 'string') {
      const parts = dateStr.split('/');
      if (parts.length === 3) {
        return {
          day: parts[0].padStart(2, '0'),
          month: parts[1].padStart(2, '0'),
          year: parts[2].padStart(4, '0')
        };
      }
    }
    return { day: '01', month: '01', year: '2000' };
  };

  return {
    ...baseData,
    attestationNumber: data?.attestationNumber || baseData.attestationNumber,
    studentName: data?.studentName || baseData.studentName,
    birthPlace: data?.birthPlace || baseData.birthPlace,
    birthDate: data?.birthDate ? parseDateString(data.birthDate) : baseData.birthDate,
    schoolName: data?.schoolName || data?.school || baseData.schoolName,
    schoolCode: data?.schoolCode || baseData.schoolCode,
    examSession: data?.examSession || data?.academicYear || baseData.examSession,
    section: data?.section || baseData.section,
    option: data?.option || baseData.option,
    percentage: data?.percentage?.toString() || baseData.percentage,
    issuePlace: data?.issuePlace || data?.issueLocation || baseData.issuePlace,
    issueDate: data?.issueDate ? parseDateString(data.issueDate) : baseData.issueDate,
    validUntil: data?.validUntil ? parseDateString(data.validUntil) : baseData.validUntil,
    showValidUntil: data?.showValidUntil !== undefined ? data.showValidUntil : true, // Default to showing validUntil
    inspectorName: data?.inspectorName || data?.signatoryName || baseData.inspectorName,
  };
};

/**
 * Transform Firestore data to Form6Template format
 */
export const transformDataForTemplate = (data: any) => {
  if (!data) return {};

  // Transform subjects to match Form6Template format
  const transformedSubjects = data.subjects?.map((subject: any) => {
    const firstSemester = subject.firstSemester || subject.gradesSemester1 || {};
    const secondSemester = subject.secondSemester || subject.gradesSemester2 || {};
    
    const templateSubject = {
      subject: subject.subject || subject.subjectName || 'Unknown Subject',
      firstSemester: {
        period1: firstSemester.period1 || firstSemester.journal1 || '',
        period2: firstSemester.period2 || firstSemester.journal2 || '',
        exam: firstSemester.exam || '',
        total: firstSemester.total || ''
      },
      secondSemester: {
        period3: secondSemester.period3 || secondSemester.journal1 || '',
        period4: secondSemester.period4 || secondSemester.journal2 || '',
        exam: secondSemester.exam || '',
        total: secondSemester.total || ''
      },
      overallTotal: subject.overallTotal || subject.total || '',
      maxima: subject.maxima || {
        periodMaxima: 20,
        examMaxima: 40,
        totalMaxima: 80
      },
      secondSitting: subject.secondSitting || {
        marks: '',
        max: ''
      },
      nationalExam: subject.nationalExam || {
        marks: '',
        max: ''
      }
    };

    return templateSubject;
  }) || [];

  const transformedData = {
    province: data.province || '',
    city: data.city || '',
    municipality: data.municipality || '',
    school: data.school || '',
    schoolCode: data.schoolCode || '',
    studentName: data.studentName || '',
    gender: data.gender || '',
    birthPlace: data.birthPlace || '',
    birthDate: data.birthDate || '',
    class: data.class || '',
    permanentNumber: data.permanentNumber || '',
    idNumber: data.idNumber || '',
    academicYear: data.academicYear || '',
    subjects: transformedSubjects,
    totalMarksOutOf: data.totalMarksOutOf || {},
    totalMarksObtained: data.totalMarksObtained || {},
    percentage: data.percentage || {},
    position: data.position || '',
    totalStudents: data.totalStudents || '',
    application: data.application || '',
    behaviour: data.behaviour || '',
    summaryValues: data.summaryValues || {},
    finalResultPercentage: data.finalResultPercentage || '',
    isPromoted: data.isPromoted || false,
    shouldRepeat: data.shouldRepeat || '',
    issueLocation: data.issueLocation || '',
    issueDate: data.issueDate || '',
    centerCode: data.centerCode || '',
    verifierName: data.verifierName || '',
    endorsementDate: data.endorsementDate || '',
    tableSize: data.tableSize || 'auto', // Preserve table size setting
    secondSittingDate: data.secondSittingDate || '' // Preserve second sitting date
  };

  return transformedData;
};
