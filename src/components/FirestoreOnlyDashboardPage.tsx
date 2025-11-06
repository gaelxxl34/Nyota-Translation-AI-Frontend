// FIRESTORE-ONLY Dashboard Page
// Displays user's bulletins from Firestore with real-time editing
// No localStorage dependency - everything comes from and goes to Firestore

import React, { useState, useEffect, useCallback } from 'react';
import { collection, query, where, getDocs, getFirestore, doc, updateDoc } from 'firebase/firestore';
import { useAuth } from '../AuthProvider';
import { useLoading } from '../contexts/LoadingContext';
import { useTranslation } from 'react-i18next';
import SEOHead from './SEOHead';
import LanguageSwitcher from './LanguageSwitcher';
import Form6Template from './Form6Template';
import CollegeAnnualTranscriptTemplate from './CollegeAnnualTranscriptTemplate';
import type { CollegeTranscriptData } from './CollegeAnnualTranscriptTemplate';
import CollegeAttestationTemplate from './CollegeAttestationTemplate';
import type { CollegeAttestationData } from './CollegeAttestationTemplate';
import Form4Template from './Form4Template';
import StateDiplomaTemplate from './StateDiplomaTemplate';
import BachelorDiplomaTemplate from './BachelorDiplomaTemplate';
import FirestoreOnlyPDFDownloadButton from './FirestoreOnlyPDFDownloadButton';
import StateDiplomaPDFDownloadButton from './StateDiplomaPDFDownloadButton';
import BachelorDiplomaPDFDownloadButton from './BachelorDiplomaPDFDownloadButton';
import CollegeTranscriptPDFDownloadButton from './CollegeTranscriptPDFDownloadButton';
import CollegeAttestationPDFDownloadButton from './CollegeAttestationPDFDownloadButton';
import HighSchoolAttestationTemplate from './HighSchoolAttestationTemplate';
import type { HighSchoolAttestationData } from './HighSchoolAttestationTemplate';
import HighSchoolAttestationPDFDownloadButton from './HighSchoolAttestationPDFDownloadButton';
import StateExamAttestationTemplate from './StateExamAttestationTemplate';
import type { StateExamAttestationData } from './StateExamAttestationTemplate';
import StateExamAttestationPDFDownloadButton from './StateExamAttestationPDFDownloadButton';
import Swal from 'sweetalert2';

interface BulletinRecord {
  id: string;
  metadata: {
    studentName: string;
    fileName: string;
    uploadedAt: any;
    lastModified: any;
    status: string;
    formType?: 'form4' | 'form6' | 'collegeTranscript' | 'collegeAttestation' | 'stateDiploma' | 'bachelorDiploma' | 'highSchoolAttestation' | 'stateExamAttestation';
  };
  editedData: any;
  originalData: any;
  userId: string;
}

const FirestoreOnlyDashboardPage: React.FC = () => {
  const { currentUser } = useAuth();
  const { showSplash, hideSplash } = useLoading();
  const { t, i18n } = useTranslation();
  
  // Set French as default language for dashboard
  useEffect(() => {
    if (i18n.language !== 'fr') {
      i18n.changeLanguage('fr');
    }
  }, [i18n]);

  const [bulletins, setBulletins] = useState<BulletinRecord[]>([]);
  const [selectedBulletin, setSelectedBulletin] = useState<BulletinRecord | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStage, setUploadStage] = useState<string>('');
  const [selectedFormType, setSelectedFormType] = useState<'form4' | 'form6' | 'collegeTranscript' | 'collegeAttestation' | 'stateDiploma' | 'bachelorDiploma' | 'highSchoolAttestation' | 'stateExamAttestation'>('form6');
  const [tableSize, setTableSize] = useState<'auto' | 'normal' | '11px' | '12px' | '13px' | '14px' | '15px'>('auto'); // Track table size for PDF generation
  
  // Preview states
  const [previewFile, setPreviewFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  
  const db = getFirestore();

  // Load user's bulletins from Firestore ONLY
  const loadUserBulletins = useCallback(async () => {
    if (!currentUser) return;

    try {
      setIsLoading(true);
      setError(null);

      // Loading bulletins from Firestore for authenticated user

      // Simple query without orderBy to avoid composite index requirement
      const bulletinsQuery = query(
        collection(db, 'bulletins'),
        where('userId', '==', currentUser.uid)
      );

      const querySnapshot = await getDocs(bulletinsQuery);
      // Execute query to get user's bulletins

      const bulletinsList: BulletinRecord[] = [];

      if (querySnapshot.empty) {
        // No bulletins found for this user
      } else {
        // Process found bulletins
      }

      querySnapshot.forEach((doc) => {
        // Process each document
        const data = doc.data();
        bulletinsList.push({
          id: doc.id,
          metadata: data.metadata,
          editedData: data.editedData,
          originalData: data.originalData,
          userId: data.userId,
        });
      });

      // Sort bulletins by upload date (newest first) on client side
      bulletinsList.sort((a, b) => {
        const aDate = a.metadata?.uploadedAt?.toDate?.() || new Date(0);
        const bDate = b.metadata?.uploadedAt?.toDate?.() || new Date(0);
        return bDate.getTime() - aDate.getTime();
      });

      setBulletins(bulletinsList);
      // Bulletins loaded successfully
    } catch (err) {
      console.error('❌ Failed to load bulletins:', err);
      setError('Failed to load your bulletins. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [currentUser, db]);

  // Load bulletins when user is available
  useEffect(() => {
    loadUserBulletins();
  }, [loadUserBulletins]);

  // Handle bulletin selection for viewing
  const handleSelectBulletin = (bulletin: BulletinRecord) => {
    setSelectedBulletin(bulletin);
    setIsEditing(false);
  };

  // Handle editing mode
  const handleStartEditing = (bulletin: BulletinRecord) => {
    setSelectedBulletin(bulletin);
    setIsEditing(true);
  };

  // Handle automatic field updates to Firestore
  const handleFieldUpdate = async (updatedData: any) => {
    if (!selectedBulletin) return;

    try {
      // 🔧 DEBUG: Log the update attempt
      console.log('🔄 handleFieldUpdate called');
      console.log('📊 Updated data:', updatedData);
      console.log('📝 Selected bulletin ID:', selectedBulletin.id);
      console.log('📋 Data keys:', Object.keys(updatedData));
      
      // Check if updatedData has courses
      if (updatedData.courses) {
        console.log('📚 Number of courses:', updatedData.courses.length);
        console.log('📚 First course:', updatedData.courses[0]);
      }

      // Check if updatedData has summaryRows
      if (updatedData.summaryRows) {
        console.log('📊 Number of summary rows:', updatedData.summaryRows.length);
      }

      // Clean undefined values from the data (Firestore doesn't allow undefined)
      const cleanData = (obj: any): any => {
        if (obj === null || obj === undefined) return null;
        if (typeof obj !== 'object') return obj;
        if (Array.isArray(obj)) return obj.map(item => cleanData(item));

        const cleaned: any = {};
        for (const [key, value] of Object.entries(obj)) {
          if (value !== undefined) {
            cleaned[key] = cleanData(value);
          }
        }
        return cleaned;
      };

      const cleanedData = cleanData(updatedData);
      console.log('🧹 Cleaned data (removed undefined values)');

      // Auto-saving field update to Firestore
      
      // Update the bulletin document in Firestore
      const bulletinRef = doc(db, 'bulletins', selectedBulletin.id);
      
      console.log('💾 Saving to Firestore:', {
        bulletinId: selectedBulletin.id,
        dataKeys: Object.keys(cleanedData),
        coursesCount: cleanedData.courses?.length,
        summaryRowsCount: cleanedData.summaryRows?.length
      });

      await updateDoc(bulletinRef, {
        editedData: cleanedData,
        'metadata.lastModified': new Date(),
        'metadata.lastModifiedAt': new Date().toISOString()
      });

      console.log('✅ Data saved to Firestore successfully');

      // Data saved to Firestore successfully

      // Update local state to reflect the change
      setSelectedBulletin(prev => prev ? {
        ...prev,
        editedData: cleanedData,
        metadata: {
          ...prev.metadata,
          lastModified: new Date()
        }
      } : null);

      // Update the bulletins list to reflect the change
      setBulletins(prev => prev.map(bulletin => 
        bulletin.id === selectedBulletin.id 
          ? {
              ...bulletin,
              editedData: cleanedData,
              metadata: {
                ...bulletin.metadata,
                lastModified: new Date()
              }
            }
          : bulletin
      ));

      console.log('✅ Local state updated');
      // Field auto-saved successfully
    } catch (error) {
      console.error('❌ Auto-save error:', error);
      console.error('❌ Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        bulletinId: selectedBulletin?.id,
        dataKeys: updatedData ? Object.keys(updatedData) : []
      });
      setError(`Failed to save changes: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  // Handle PDF download success
  const handlePDFSuccess = () => {
    // PDF downloaded successfully
  };

  // Handle PDF download error
  const handlePDFError = (error: string) => {
    console.error('❌ PDF error:', error);
    setError(`Failed to generate PDF: ${error}`);
  };

  // Handle bulletin deletion with confirmation
  const handleDeleteBulletin = async (bulletinId: string, studentName: string) => {
    try {
      // Show confirmation dialog
      const confirmResult = await Swal.fire({
        title: 'Delete Bulletin',
        html: `
          <div class="text-left">
            <p class="mb-3">Are you sure you want to delete this bulletin?</p>
            <div class="bg-gray-100 p-3 rounded">
              <strong>Student:</strong> ${studentName || 'Unknown Student'}<br>
              <strong>ID:</strong> ${bulletinId}
            </div>
            <p class="mt-3 text-red-600 font-medium">
              ⚠️ This action cannot be reversed!
            </p>
          </div>
        `,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#ef4444',
        cancelButtonColor: '#6b7280',
        confirmButtonText: 'Yes, Delete It!',
        cancelButtonText: 'Cancel',
        focusCancel: true,
        customClass: {
          popup: 'text-sm'
        }
      });

      if (!confirmResult.isConfirmed) {
        // Bulletin deletion cancelled by user
        return;
      }

      // Show loading state
      Swal.fire({
        title: 'Deleting Bulletin...',
        text: 'Please wait while we delete the bulletin.',
        allowOutsideClick: false,
        allowEscapeKey: false,
        showConfirmButton: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      // Starting bulletin deletion process

      // Get Firebase ID token
      const idToken = await currentUser?.getIdToken();
      if (!idToken) {
        throw new Error('Authentication token not available');
      }

      // Get the backend URL
      const envApiUrl = import.meta.env.VITE_API_BASE_URL;
      const isProduction = import.meta.env.PROD;
      const currentProtocol = window.location.protocol;
      const currentHostname = window.location.hostname;
      
      let deleteBackendUrl: string;
      if (envApiUrl && envApiUrl !== 'https://your-backend-domain.com') {
        deleteBackendUrl = envApiUrl;
      } else if (isProduction) {
        deleteBackendUrl = `${currentProtocol}//${currentHostname}`;
      } else {
        deleteBackendUrl = 'http://localhost:3001';
      }

      // Call backend delete API
      const response = await fetch(`${deleteBackendUrl}/api/bulletins/${bulletinId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${idToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        let errorMessage = 'Failed to delete bulletin';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch {
          errorMessage = `Server error: ${response.status} ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      await response.json();
      // Bulletin deleted successfully

      // Close loading dialog
      Swal.close();

      // Show success message
      await Swal.fire({
        title: 'Deleted!',
        text: 'The bulletin has been deleted successfully.',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false
      });

      // If the deleted bulletin was selected, clear selection
      if (selectedBulletin?.id === bulletinId) {
        setSelectedBulletin(null);
        setIsEditing(false);
      }

      // Refresh the bulletins list
      await loadUserBulletins();

    } catch (error) {
      console.error('❌ Failed to delete bulletin:', error);
      
      // Close any loading dialogs
      Swal.close();
      
      // Show error message
      await Swal.fire({
        title: 'Deletion Failed',
        text: error instanceof Error ? error.message : 'An unexpected error occurred',
        icon: 'error',
        confirmButtonText: 'OK'
      });
      
      setError(`Failed to delete bulletin: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  // Get display data for bulletin (edited data if available, otherwise original)
  const getBulletinDisplayData = (bulletin: BulletinRecord) => {
    return bulletin.editedData || bulletin.originalData;
  };

  // Transform Firestore data to StateDiploma format
  const transformDataForStateDiploma = (data: any) => {
    // Transforming data for State Diploma template

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
        const integerPercentage = Math.round(numericValue); // Round to nearest integer
        const result = integerPercentage.toString() + '%';
        
        return result;
      })(),
      percentageText: data?.percentageText || 'PERCENTAGE IN WORDS',
      section: data?.section || data?.class || 'SECTION NAME',
      option: data?.option || 'OPTION NAME',
      issueDate: data?.issueDate || 'JANUARY 1, 2023',
      referenceNumber: data?.referenceNumber || 'T S 0 7',
      serialNumbers: (() => {
        // Priority 1: Use serialNumbers if it's a proper array with data
        if (data?.serialNumbers && Array.isArray(data.serialNumbers) && data.serialNumbers.length >= 4) {
          return data.serialNumbers;
        }
        // Priority 2: Try to extract from referenceNumber if it exists and has data
        if (data?.referenceNumber && typeof data.referenceNumber === 'string') {
          const cleanRef = data.referenceNumber.replace(/\s+/g, ''); // Remove all spaces
          if (cleanRef.length >= 4) {
            return cleanRef.split(''); // Convert string to array of characters
          }
        }
        // Fallback: Return default array
        return ['T', 'S', '0', '7', '5', '2', '0', '7', '2', '4', '0', '7', '0', '3', '7', '0', '7', '0'];
      })(),
      serialCode: data?.serialCode || '3564229'
    };

    // State Diploma transformed data ready
    return transformedData;
  };

  // Transform Firestore data to BachelorDiploma format
  const transformDataForBachelorDiploma = (data: any) => {
    // Transforming data for Bachelor Diploma template
    
    const transformedData = {
      // Institution info
      institutionName: data?.institutionName || 'INSTITUT SUPERIEUR DE COMMERCE DE GOMA',
      institutionLocation: data?.institutionLocation || 'GOMA',
      
      // Diploma details
      diplomaNumber: data?.diplomaNumber || '0000',
      
      // Student info
      studentName: data?.studentName || 'STUDENT NAME',
      birthPlace: data?.birthPlace || 'BIRTHPLACE',
      birthDate: data?.birthDate || '01 janvier 2000',
      
      // Academic details
      degree: data?.degree || 'troisième graduat en sciences',
      specialization: data?.specialization || 'commerciales et fin',
      orientation: data?.orientation || 'douanes et accises',
      gradeLevel: data?.gradeLevel || 'GRADE EN SCIENCES',
      gradeSpecialization: data?.gradeSpecialization || 'COMML ET FIN',
      option: data?.option || 'douanes et accises',
      orientationDetail: data?.orientationDetail || '',
      
      // Completion details
      completionDate: data?.completionDate || '30 décembre 2020',
      graduationYear: data?.graduationYear || 'deuxième quadrimestre',
      
      // Issue details
      issueLocation: data?.issueLocation || 'À Goma',
      issueDate: data?.issueDate || '03 juin 2021',
      
      // Registration details
      registrationDate: data?.registrationDate || '03 juin 2021',
      registrationNumber: data?.registrationNumber || '1487',
      serialCode: data?.serialCode || 'XXX',
      examDate: data?.examDate || '25 juillet 2021',
      registerLetter: data?.registerLetter || 'M'
    };

    // Bachelor Diploma transformed data ready
    return transformedData;
  };

  // Transform Firestore data to College Annual Transcript format
  const transformDataForCollegeTranscript = (data: any): CollegeTranscriptData => {
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
      // Note: totalGrade and percentage are optional and only added if they have values
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

      // Build the course object with basic fields
      const mappedCourse: any = {
        courseNumber,
        courseName: stringify(course?.courseName ?? course?.subject ?? course?.title, `Course ${index + 1}`),
        creditHours: stringify(course?.creditHours ?? course?.hours ?? course?.volumeHoraire, ''),
        grade: stringify(course?.grade ?? course?.score ?? course?.total, ''),
      };

      // Add weighted format fields if they exist
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

    // Preserve summaryRows if they exist in the data, otherwise use empty array
    const summaryRows = Array.isArray(data?.summaryRows) ? data.summaryRows : [];
    
    console.log('🔄 transformDataForCollegeTranscript - Summary rows:', {
      hasSummaryRows: !!data?.summaryRows,
      summaryRowsCount: summaryRows.length,
      summaryRowsData: summaryRows
    });

    // Build the return object, conditionally including optional fields
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
      tableFormat: data?.tableFormat || 'simple', // Preserve table format
      courses,
      summaryRows, // Preserve summary rows
      decision: data?.decision || data?.outcome || baseData.decision,
      issueLocation: data?.issueLocation || baseData.issueLocation,
      issueDate: data?.issueDate || baseData.issueDate,
      secretary: data?.secretary || baseData.secretary,
      secretaryTitle: data?.secretaryTitle || baseData.secretaryTitle,
      chiefOfWorks: data?.chiefOfWorks || baseData.chiefOfWorks,
      chiefOfWorksTitle: data?.chiefOfWorksTitle || baseData.chiefOfWorksTitle,
    };

    // Only include totalGrade and percentage if they have actual values (not undefined)
    if (data?.totalGrade || data?.finalScore) {
      result.totalGrade = data?.totalGrade || data?.finalScore;
    }
    if (data?.percentage || data?.finalPercentage) {
      result.percentage = data?.percentage || data?.finalPercentage;
    }

    return result;
  };

  // Transform Firestore data to College Attestation format
  const transformDataForCollegeAttestation = (data: any): CollegeAttestationData => {
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

  // Transform Firestore data for High School Attestation
  const transformDataForHighSchoolAttestation = (data: any): HighSchoolAttestationData => {
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

  // Transform Firestore data for State Exam Attestation
  const transformDataForStateExamAttestation = (data: any): StateExamAttestationData => {
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
      inspectorName: data?.inspectorName || data?.signatoryName || baseData.inspectorName,
    };
  };


  // Transform Firestore data to Form6Template format
  const transformDataForTemplate = (data: any) => {
    if (!data) return {};

    // Transforming data for template

    // Transform subjects to match Form6Template format
    const transformedSubjects = data.subjects?.map((subject: any) => {
      // Handle different possible data structures
      const firstSemester = subject.firstSemester || subject.gradesSemester1 || {};
      const secondSemester = subject.secondSemester || subject.gradesSemester2 || {};
      
      // Map individual grade fields to template format
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

      // Transform subject data
      return templateSubject;
    }) || [];

    const transformedData = {
      // Basic info
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
      
      // Subjects
      subjects: transformedSubjects,
      
      // Totals
      totalMarksOutOf: data.totalMarksOutOf || {},
      totalMarksObtained: data.totalMarksObtained || {},
      percentage: data.percentage || {},
      position: data.position || '',
      totalStudents: data.totalStudents || '',
      
      // Assessment
      application: data.application || '',
      behaviour: data.behaviour || '',
      
      // Summary values for editable cells (AGGREGATES MAXIMA, AGGREGATES, PERCENTAGE, POSITION, BEHAVIOUR rows)
      summaryValues: data.summaryValues || {},
      
      // Final results
      finalResultPercentage: data.finalResultPercentage || '',
      isPromoted: data.isPromoted || false,
      shouldRepeat: data.shouldRepeat || '',
      issueLocation: data.issueLocation || '',
      issueDate: data.issueDate || '',
      centerCode: data.centerCode || '',
      verifierName: data.verifierName || '',
      endorsementDate: data.endorsementDate || ''
    };

    // Final transformed data ready
    return transformedData;
  };

  // Handle file upload - Show preview first
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp']; // Removed PDF
    if (!allowedTypes.includes(file.type)) {
      setError('Please select a valid file type (PNG, JPG, JPEG, GIF, WEBP)\nMiye Sipendi pdf pardon');
      return;
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      setError('File size must be less than 10MB');
      return;
    }

    // Create preview URL
    const objectUrl = URL.createObjectURL(file);
    setPreviewFile(file);
    setPreviewUrl(objectUrl);
    setShowPreview(true);
    setError(null);
  };

  // Cancel preview and clear file
  const handleCancelPreview = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewFile(null);
    setPreviewUrl(null);
    setShowPreview(false);
    // Clear the file input
    const fileInput = document.getElementById('file-upload') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };

  // Process the file after preview confirmation
  const handleProcessFile = async () => {
    if (!previewFile) return;

    try {
      setIsUploading(true);
      setError(null);
      setUploadProgress(0);
      setShowPreview(false); // Hide preview modal

      // Show splash screen for upload process
      showSplash('Preparing your document upload...');

      // Get Firebase ID token
      const idToken = await currentUser?.getIdToken();
      if (!idToken) {
        throw new Error('Authentication required');
      }

      // Create form data
      const formData = new FormData();
      formData.append('file', previewFile);
      formData.append('formType', selectedFormType); // Add form type to the upload

      // Uploading file to server

      // Simulate upload progress stages with splash screen messages
      const updateProgress = (stage: string, progress: number) => {
        // Upload progress update
        setUploadProgress(progress);
        setUploadStage(stage);
        showSplash(stage);
      };

      // Stage 1: Preparing upload (0-10%)
      updateProgress('Preparing upload...', 10);
      await new Promise(resolve => setTimeout(resolve, 200));

      // Stage 2: Uploading file (10-30%)
      updateProgress('Uploading your document...', 30);
      
      // Determine backend URL based on environment
      const isProduction = import.meta.env.PROD;
      const currentProtocol = window.location.protocol;
      const currentHostname = window.location.hostname;
      const envApiUrl = import.meta.env.VITE_API_BASE_URL;

      // Debug logging for production
      console.log('🔧 Environment debug info:');
      console.log(`  - isProduction: ${isProduction}`);
      console.log(`  - currentHostname: ${currentHostname}`);
      console.log(`  - envApiUrl: ${envApiUrl}`);

      let backendUrl: string;
      
      if (envApiUrl && envApiUrl !== 'https://your-backend-domain.com') {
        // Use environment variable if set and not placeholder
        backendUrl = envApiUrl;
      } else if (isProduction) {
        // Production fallback - same domain (reverse proxy should handle /api routing)
        backendUrl = `${currentProtocol}//${currentHostname}`;
      } else {
        // Local development - use localhost with default port
        backendUrl = 'http://localhost:3001';
      }
      
      console.log(`🎯 Using backend URL: ${backendUrl}`);

      // Upload to backend with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 300000); // 5 minute timeout for AI processing

      console.log(`🔄 Uploading to: ${backendUrl}/api/upload`);
      console.log(`📄 File: ${previewFile.name} (${previewFile.size} bytes)`);
      console.log(`📋 Form Type: ${selectedFormType}`);

      const response = await fetch(`${backendUrl}/api/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${idToken}`,
        },
        body: formData,
        signal: controller.signal,
      });

      console.log(`📨 Response status: ${response.status} ${response.statusText}`);
      clearTimeout(timeoutId);

      // Stage 3: Processing response (30-50%)
      updateProgress('Processing your document...', 50);

      // Response received from server

      // Response received from server

      if (!response.ok) {
        let errorMessage = 'Upload failed';
        let responseText = '';
        
        try {
          responseText = await response.text();
          const errorData = JSON.parse(responseText);
          errorMessage = errorData.error || errorMessage;
          console.error('❌ Error response data:', errorData);
        } catch (jsonError) {
          // If response is not valid JSON, use status text
          errorMessage = `Upload failed: ${response.status} ${response.statusText}`;
          console.warn('Response is not valid JSON:', jsonError);
          console.warn('Raw response text:', responseText);
        }
        throw new Error(errorMessage);
      }

      // Stage 4: Extracting data (50-70%)
      updateProgress('Extracting text with AI...', 70);
      await new Promise(resolve => setTimeout(resolve, 500));

      try {
        const responseText = await response.text();
        JSON.parse(responseText);
        // Response JSON parsed successfully
      } catch (jsonError) {
        console.error('❌ Failed to parse JSON response:', jsonError);
        throw new Error('Server returned invalid JSON response');
      }

      // Stage 5: Translating data (70-90%)
      updateProgress('Translating to English...', 90);
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Upload successful

      // Stage 6: Saving to database (90-100%)
      updateProgress('Saving to database...', 100);
      await new Promise(resolve => setTimeout(resolve, 300));

      // Reset preview and file input
      handleCancelPreview();

      // Refresh bulletins list
      await loadUserBulletins();

      // Hide splash screen and show success message briefly
      hideSplash();
      setTimeout(() => {
        setUploadProgress(0);
        setUploadStage('');
      }, 1000);

    } catch (error) {
      console.error('❌ Upload error:', error);
      
      if (error instanceof Error && error.name === 'AbortError') {
        setError('Upload timed out. Please try again with a smaller file or check your internet connection.');
      } else if (error instanceof Error && error.message.includes('timeout')) {
        setError('Processing timed out. Please try again with a smaller or simpler document.');
      } else if (error instanceof Error && error.message.includes('413')) {
        setError('File too large. Please upload a smaller file (max 10MB).');
      } else if (error instanceof Error && error.message.includes('504')) {
        setError('Server timeout. Please try again in a few moments.');
      } else if (error instanceof Error && error.message.includes('502')) {
        setError('Server temporarily unavailable. Please try again in a few moments.');
      } else {
        setError(error instanceof Error ? error.message : 'Upload failed. Please try again.');
      }
    } finally {
      setIsUploading(false);
      setUploadStage('');
      hideSplash(); // Always hide splash screen when upload completes
    }
  };

  // Handle drag and drop
  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    
    const files = event.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      // Create a fake event to reuse the upload handler
      const fakeEvent = {
        target: {
          files: [file],
          value: ''
        }
      } as unknown as React.ChangeEvent<HTMLInputElement>;
      handleFileUpload(fakeEvent);
    }
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Please log in to view your bulletins</h2>
          <p className="text-gray-600">You need to be authenticated to access your bulletins stored in Firestore.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <SEOHead 
        title="Dashboard - Nyota Translation Center | Manage Your Academic Documents"
        description="Access and manage your translated academic documents. View, edit, and download your French to English bulletin translations with AI-powered precision."
        keywords="dashboard, academic documents, translated bulletins, document management, IUEA, AI translation, report cards, academic transcripts"
        url="https://nyotatranslate.com/dashboard"
      />
      
      {/* Navigation Header */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <img
                src="/log.PNG"
                alt="Nyota Translation Center Logo"
                className="h-10 w-auto rounded-lg shadow-md"
              />
              {/* Hide the text on mobile, show on sm+ */}
              <h1 className="hidden sm:block text-xl font-bold text-gray-900">{t('dashboard.navigation.title')}</h1>
            </div>
            <div className="flex items-center space-x-4">
              {/* Language Switcher */}
              <LanguageSwitcher />
              <div className="flex items-center space-x-2">
                {/* Hide email on mobile, show on sm+ */}
                <span className="hidden sm:inline text-sm text-gray-600">{currentUser.email}</span>
                <button
                  onClick={() => {
                    import('../firebase').then(({ auth }) => {
                      import('firebase/auth').then(({ signOut }) => {
                        signOut(auth);
                      });
                    });
                  }}
                  className="px-3 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
                >
                  {t('dashboard.navigation.signOut')}
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-6 sm:py-8">
        {/* Responsive Header */}
        <div className="mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{t('dashboard.header.title')}</h1>
            <p className="text-gray-600 mt-2 text-sm sm:text-base">
              {t('dashboard.header.subtitle')}
            </p>
          </div>
        </div>

        {/* Upload Section */}
        <div className="mb-8 bg-white rounded-lg shadow-md p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">{t('dashboard.upload.title')}</h2>
          {/* Form Type Selection */}
          <div className="mb-6">
            <h3 className="text-xs sm:text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">{t('dashboard.upload.selectType')}</h3>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <button
                onClick={() => setSelectedFormType('form4')}
                className={`flex-1 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                  selectedFormType === 'form4'
                    ? 'bg-green-600 text-white shadow-lg scale-105'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
                }`}
              >
                <div className="flex items-center justify-center space-x-2">
                  <span>📋</span>
                  <span>{t('dashboard.upload.form4.title')}</span>
                </div>
                <div className="text-xs mt-1 opacity-75">{t('dashboard.upload.form4.subtitle')}</div>
              </button>
              <button
                onClick={() => setSelectedFormType('form6')}
                className={`flex-1 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                  selectedFormType === 'form6'
                    ? 'bg-blue-600 text-white shadow-lg scale-105'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
                }`}
              >
                <div className="flex items-center justify-center space-x-2">
                  <span>📄</span>
                  <span>{t('dashboard.upload.form6.title')}</span>
                </div>
                <div className="text-xs mt-1 opacity-75">{t('dashboard.upload.form6.subtitle')}</div>
              </button>
              <button
                onClick={() => setSelectedFormType('collegeTranscript')}
                className={`flex-1 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                  selectedFormType === 'collegeTranscript'
                    ? 'bg-indigo-600 text-white shadow-lg scale-105'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
                }`}
              >
                <div className="flex items-center justify-center space-x-2">
                  <span>🏛️</span>
                  <span>{t('dashboard.upload.collegeTranscript.title')}</span>
                </div>
                <div className="text-xs mt-1 opacity-75">{t('dashboard.upload.collegeTranscript.subtitle')}</div>
              </button>
              <button
                onClick={() => setSelectedFormType('collegeAttestation')}
                className={`flex-1 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                  selectedFormType === 'collegeAttestation'
                    ? 'bg-teal-600 text-white shadow-lg scale-105'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
                }`}
              >
                <div className="flex items-center justify-center space-x-2">
                  <span>📝</span>
                  <span>College Attestation</span>
                </div>
                <div className="text-xs mt-1 opacity-75">Certificate of attendance</div>
              </button>
              <button
                onClick={() => setSelectedFormType('stateDiploma')}
                className={`flex-1 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                  selectedFormType === 'stateDiploma'
                    ? 'bg-purple-600 text-white shadow-lg scale-105'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
                }`}
              >
                <div className="flex items-center justify-center space-x-2">
                  <span>🎓</span>
                  <span>{t('dashboard.upload.stateDiploma.title')}</span>
                </div>
                <div className="text-xs mt-1 opacity-75">{t('dashboard.upload.stateDiploma.subtitle')}</div>
              </button>
              <button
                onClick={() => setSelectedFormType('bachelorDiploma')}
                className={`flex-1 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                  selectedFormType === 'bachelorDiploma'
                    ? 'bg-amber-600 text-white shadow-lg scale-105'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
                }`}
              >
                <div className="flex items-center justify-center space-x-2">
                  <span>📜</span>
                  <span>Bachelor Diploma</span>
                </div>
                <div className="text-xs mt-1 opacity-75">University degree certificate</div>
              </button>
              <button
                onClick={() => setSelectedFormType('highSchoolAttestation')}
                className={`flex-1 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                  selectedFormType === 'highSchoolAttestation'
                    ? 'bg-rose-600 text-white shadow-lg scale-105'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
                }`}
              >
                <div className="flex items-center justify-center space-x-2">
                  <span>✅</span>
                  <span>High School Attestation</span>
                </div>
                <div className="text-xs mt-1 opacity-75">School attendance certificate</div>
              </button>
              <button
                onClick={() => setSelectedFormType('stateExamAttestation')}
                className={`flex-1 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                  selectedFormType === 'stateExamAttestation'
                    ? 'bg-cyan-600 text-white shadow-lg scale-105'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
                }`}
              >
                <div className="flex items-center justify-center space-x-2">
                  <span>📋</span>
                  <span>State Exam Attestation</span>
                </div>
                <div className="text-xs mt-1 opacity-75">Provisional pass certificate</div>
              </button>
            </div>
          </div>
          <div 
            className={`border-2 border-dashed rounded-lg p-4 sm:p-6 text-center transition-colors ${
              isUploading 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-300 hover:border-blue-500'
            }`}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            {isUploading ? (
              <div className="space-y-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
                <h3 className="text-lg font-medium text-gray-900">
                  {t('dashboard.upload.processing')}
                </h3>
                <p className="text-gray-600">
                  {uploadStage || t('dashboard.upload.preparingUpload')}
                </p>
                <div className="w-full max-w-md mx-auto">
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-500 ease-out"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    {uploadProgress}% {t('dashboard.upload.completed')}
                  </p>
                </div>
              </div>
            ) : (
              <>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {t('dashboard.upload.dragDrop')}
                </h3>
                <input
                  type="file"
                  accept=".png,.jpg,.jpeg,.gif,.webp" // Removed .pdf
                  className="hidden"
                  id="file-upload"
                  onChange={handleFileUpload}
                  disabled={isUploading}
                />
                <label
                  htmlFor="file-upload"
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 cursor-pointer"
                >
                  {t('dashboard.upload.selectFile')}
                </label>
                <p className="text-sm text-gray-500 mt-2">
                  {t('dashboard.upload.supportedFormats')}
                </p>
              </>
            )}
          </div>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 text-sm sm:text-base">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 15.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
              <div className="ml-auto">
                <button
                  onClick={() => setError(null)}
                  className="text-red-400 hover:text-red-500"
                >
                  <span className="sr-only">Close</span>
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Document Preview Modal */}
        {showPreview && previewUrl && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-75 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold">📄 Document Preview</h2>
                    <p className="text-blue-100 text-sm mt-1">Review your document before processing</p>
                  </div>
                  <button
                    onClick={handleCancelPreview}
                    className="text-white hover:text-red-200 transition-colors"
                    title="Close preview"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Modal Body - Image Preview */}
              <div className="flex-1 overflow-auto p-4 sm:p-6 bg-gray-50">
                <div className="bg-white rounded-lg shadow-md p-4 flex items-center justify-center">
                  <img
                    src={previewUrl}
                    alt="Document preview"
                    className="max-w-full max-h-[60vh] object-contain rounded"
                  />
                </div>
                
                {/* File Info */}
                {previewFile && (
                  <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="font-semibold text-gray-700">File Name:</span>
                        <p className="text-gray-900 truncate">{previewFile.name}</p>
                      </div>
                      <div>
                        <span className="font-semibold text-gray-700">File Size:</span>
                        <p className="text-gray-900">{(previewFile.size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                      <div>
                        <span className="font-semibold text-gray-700">File Type:</span>
                        <p className="text-gray-900">{previewFile.type}</p>
                      </div>
                      <div>
                        <span className="font-semibold text-gray-700">Form Type:</span>
                        <p className="text-gray-900 capitalize">
                          {selectedFormType === 'form4' ? 'Form 4' : 
                           selectedFormType === 'form6' ? 'Form 6' : 
                           selectedFormType === 'collegeTranscript' ? 'College Transcript' :
                           selectedFormType === 'collegeAttestation' ? 'College Attestation' :
                           selectedFormType === 'stateDiploma' ? 'State Diploma' :
                           selectedFormType === 'bachelorDiploma' ? 'Bachelor Diploma' :
                           selectedFormType === 'highSchoolAttestation' ? 'High School Attestation' :
                           selectedFormType === 'stateExamAttestation' ? 'State Exam Attestation' : selectedFormType}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer - Action Buttons */}
              <div className="bg-gray-100 p-4 sm:p-6 border-t border-gray-200 flex flex-col sm:flex-row gap-3 sm:justify-end">
                <button
                  onClick={handleCancelPreview}
                  className="w-full sm:w-auto px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors font-medium flex items-center justify-center space-x-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <span>Cancel</span>
                </button>
                <button
                  onClick={handleProcessFile}
                  disabled={isUploading}
                  className={`w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-all font-medium flex items-center justify-center space-x-2 shadow-md ${
                    isUploading ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Process Document</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Bulletins List */}
        <div className="mb-8 bg-white rounded-lg shadow-md p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-2">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">📚 {t('dashboard.bulletinsList.title')}</h2>
            <span className="text-xs sm:text-sm text-gray-500">
              {bulletins.length} bulletin{bulletins.length !== 1 ? 's' : ''}
            </span>
          </div>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">
                {i18n.language === 'fr' ? 'Chargement depuis Firestore...' : 'Loading from Firestore...'}
              </span>
            </div>
          ) : bulletins.length === 0 ? (
            <div className="text-center py-8 sm:py-12">
              <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="mt-4 text-lg font-medium text-gray-900">
                {i18n.language === 'fr' ? 'Aucun bulletin pour le moment' : 'No bulletins yet'}
              </h3>
              <p className="mt-2 text-gray-500">{t('dashboard.bulletinsList.noUploads')}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {bulletins.map((bulletin) => {
                const displayData = getBulletinDisplayData(bulletin);
                return (
                  <div
                    key={bulletin.id}
                    className={`
                      border rounded-lg p-4 cursor-pointer transition-all duration-200 hover:shadow-md
                      ${selectedBulletin?.id === bulletin.id
                        ? 'border-blue-500 bg-blue-50 shadow-md'
                        : 'border-gray-200 hover:border-gray-300'
                      }
                    `}
                    onClick={() => handleSelectBulletin(bulletin)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 text-lg">
                          {displayData?.studentName || bulletin.metadata.studentName || 'Unknown Student'}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {(bulletin.metadata.formType || 'form6') === 'stateDiploma' ? (
                            // For State Diploma, show section/option or just leave empty if no additional info
                            <>
                              {displayData?.section && displayData?.section !== 'SECTION NAME' ? displayData.section : ''}
                              {displayData?.option && displayData?.option !== 'OPTION NAME' && displayData?.section && displayData?.section !== 'SECTION NAME' ? ' • ' + displayData.option : (displayData?.option && displayData?.option !== 'OPTION NAME' ? displayData.option : '')}
                              {(!displayData?.section || displayData?.section === 'SECTION NAME') && (!displayData?.option || displayData?.option === 'OPTION NAME') ? 'State Diploma Certificate' : ''}
                            </>
                          ) : (bulletin.metadata.formType || 'form6') === 'bachelorDiploma' ? (
                            // For Bachelor Diploma, show institution and specialization
                            <>
                              {displayData?.institutionName || 'University'} {displayData?.specialization ? ' • ' + displayData.specialization : ''}
                            </>
                          ) : (bulletin.metadata.formType || 'form6') === 'highSchoolAttestation' ? (
                            // For High School Attestation, show school name and province
                            <>
                              {displayData?.schoolName || 'School'} {displayData?.province ? ' • ' + displayData.province : ''}
                            </>
                          ) : (bulletin.metadata.formType || 'form6') === 'stateExamAttestation' ? (
                            // For State Exam Attestation, show school name and exam session
                            <>
                              {displayData?.schoolName || 'School'} {displayData?.examSession ? ' • ' + displayData.examSession : ''}
                            </>
                          ) : (bulletin.metadata.formType || 'form6') === 'collegeTranscript' ? (
                            // For College Transcript, show institution and level
                            <>
                              {displayData?.institutionName || displayData?.institutionAbbreviation || 'College'} {displayData?.level ? ' • ' + displayData.level : ''}
                            </>
                          ) : (bulletin.metadata.formType || 'form6') === 'collegeAttestation' ? (
                            // For College Attestation, show institution and year level
                            <>
                              {displayData?.institutionName || displayData?.institutionAbbreviation || 'College'} {displayData?.yearLevel ? ' • ' + displayData.yearLevel : (displayData?.academicYear ? ' • ' + displayData.academicYear : '')}
                            </>
                          ) : (
                            // For Form 4/6, show class and school
                            `${displayData?.class || 'Unknown Class'} • ${displayData?.school || 'Unknown School'}`
                          )}
                        </p>
                        <p className="text-xs text-gray-500 mt-2">
                          {bulletin.metadata.fileName || 'No filename'}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {bulletin.metadata.uploadedAt?.toDate?.()?.toLocaleDateString() || 'Unknown date'}
                        </p>
                      </div>
                      <div className="flex flex-col items-end space-y-2">
                        {/* Form Type Badge */}
                        <span className={`
                          px-2 py-1 rounded-full text-xs font-medium
                          ${(bulletin.metadata.formType || 'form6') === 'form4' 
                            ? 'bg-green-100 text-green-800' 
                            : (bulletin.metadata.formType || 'form6') === 'collegeTranscript'
                            ? 'bg-indigo-100 text-indigo-800'
                            : (bulletin.metadata.formType || 'form6') === 'collegeAttestation'
                            ? 'bg-teal-100 text-teal-800'
                            : (bulletin.metadata.formType || 'form6') === 'stateDiploma'
                            ? 'bg-purple-100 text-purple-800'
                            : (bulletin.metadata.formType || 'form6') === 'bachelorDiploma'
                            ? 'bg-amber-100 text-amber-800'
                            : (bulletin.metadata.formType || 'form6') === 'highSchoolAttestation'
                            ? 'bg-rose-100 text-rose-800'
                            : (bulletin.metadata.formType || 'form6') === 'stateExamAttestation'
                            ? 'bg-cyan-100 text-cyan-800'
                            : 'bg-blue-100 text-blue-800'
                          }
                        `}>
                          {(bulletin.metadata.formType || 'form6') === 'form4' 
                            ? 'Form 4' 
                            : (bulletin.metadata.formType || 'form6') === 'collegeTranscript'
                            ? 'College Transcript'
                            : (bulletin.metadata.formType || 'form6') === 'collegeAttestation'
                            ? 'College Attestation'
                            : (bulletin.metadata.formType || 'form6') === 'stateDiploma'
                            ? 'State Diploma'
                            : (bulletin.metadata.formType || 'form6') === 'bachelorDiploma'
                            ? 'Bachelor Diploma'
                            : (bulletin.metadata.formType || 'form6') === 'highSchoolAttestation'
                            ? 'High School Attestation'
                            : (bulletin.metadata.formType || 'form6') === 'stateExamAttestation'
                            ? 'State Exam Attestation'
                            : 'Form 6'
                          }
                        </span>
                        <span className={`
                          px-2 py-1 rounded-full text-xs font-medium
                          ${bulletin.editedData
                            ? 'bg-orange-100 text-orange-800'
                            : 'bg-gray-100 text-gray-800'
                          }
                        `}>
                          {bulletin.editedData ? 'Edited' : 'Original'}
                        </span>
                        
                        {/* Delete Button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation(); // Prevent card selection when clicking delete
                            handleDeleteBulletin(
                              bulletin.id, 
                              displayData?.studentName || bulletin.metadata.studentName || 'Unknown Student'
                            );
                          }}
                          className="group flex items-center justify-center w-7 h-7 rounded-full bg-red-50 hover:bg-red-100 border border-red-200 hover:border-red-300 transition-all duration-200"
                          title="Delete bulletin"
                        >
                          <svg 
                            className="w-4 h-4 text-red-500 group-hover:text-red-600" 
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                          >
                            <path 
                              strokeLinecap="round" 
                              strokeLinejoin="round" 
                              strokeWidth={2} 
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" 
                            />
                          </svg>
                        </button>
                        
                        {selectedBulletin?.id === bulletin.id && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Selected Bulletin Display */}
        {selectedBulletin && (
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 overflow-x-auto">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-3">
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                    📄 {getBulletinDisplayData(selectedBulletin)?.studentName || 'Student Report Card'}
                  </h2>
                  {/* Form Type Badge */}
                  <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-medium ${
                    (selectedBulletin.metadata.formType || 'form6') === 'form4' 
                      ? 'bg-green-100 text-green-800' 
                      : (selectedBulletin.metadata.formType || 'form6') === 'collegeTranscript'
                      ? 'bg-indigo-100 text-indigo-800'
                      : (selectedBulletin.metadata.formType || 'form6') === 'collegeAttestation'
                      ? 'bg-teal-100 text-teal-800'
                      : (selectedBulletin.metadata.formType || 'form6') === 'stateDiploma'
                      ? 'bg-purple-100 text-purple-800'
                      : (selectedBulletin.metadata.formType || 'form6') === 'bachelorDiploma'
                      ? 'bg-amber-100 text-amber-800'
                      : (selectedBulletin.metadata.formType || 'form6') === 'highSchoolAttestation'
                      ? 'bg-rose-100 text-rose-800'
                      : (selectedBulletin.metadata.formType || 'form6') === 'stateExamAttestation'
                      ? 'bg-cyan-100 text-cyan-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {(selectedBulletin.metadata.formType || 'form6') === 'form4' 
                      ? 'Form 4' 
                      : (selectedBulletin.metadata.formType || 'form6') === 'collegeTranscript'
                      ? 'College Transcript'
                      : (selectedBulletin.metadata.formType || 'form6') === 'collegeAttestation'
                      ? 'College Attestation'
                      : (selectedBulletin.metadata.formType || 'form6') === 'stateDiploma'
                      ? 'State Diploma'
                      : (selectedBulletin.metadata.formType || 'form6') === 'bachelorDiploma'
                      ? 'Bachelor Diploma'
                      : (selectedBulletin.metadata.formType || 'form6') === 'highSchoolAttestation'
                      ? 'High School Attestation'
                      : (selectedBulletin.metadata.formType || 'form6') === 'stateExamAttestation'
                      ? 'State Exam Attestation'
                      : 'Form 6'
                    }
                  </span>
                </div>
                <p className="text-gray-600 mt-1 text-sm sm:text-base">
                  {(selectedBulletin.metadata.formType || 'form6') === 'stateDiploma' ? (
                    // For State Diploma, show section/option or exam session
                    <>
                      {getBulletinDisplayData(selectedBulletin)?.section && getBulletinDisplayData(selectedBulletin)?.section !== 'SECTION NAME' ? getBulletinDisplayData(selectedBulletin)?.section : ''}
                      {getBulletinDisplayData(selectedBulletin)?.option && getBulletinDisplayData(selectedBulletin)?.option !== 'OPTION NAME' && getBulletinDisplayData(selectedBulletin)?.section && getBulletinDisplayData(selectedBulletin)?.section !== 'SECTION NAME' ? ' • ' + getBulletinDisplayData(selectedBulletin)?.option : (getBulletinDisplayData(selectedBulletin)?.option && getBulletinDisplayData(selectedBulletin)?.option !== 'OPTION NAME' ? getBulletinDisplayData(selectedBulletin)?.option : '')}
                      {(!getBulletinDisplayData(selectedBulletin)?.section || getBulletinDisplayData(selectedBulletin)?.section === 'SECTION NAME') && (!getBulletinDisplayData(selectedBulletin)?.option || getBulletinDisplayData(selectedBulletin)?.option === 'OPTION NAME') ? (getBulletinDisplayData(selectedBulletin)?.examSession && getBulletinDisplayData(selectedBulletin)?.examSession !== 'JUNE 2023' ? getBulletinDisplayData(selectedBulletin)?.examSession : 'State Diploma Certificate') : ''}
                    </>
                  ) : (selectedBulletin.metadata.formType || 'form6') === 'bachelorDiploma' ? (
                    // For Bachelor Diploma, show institution and specialization
                    <>
                      {getBulletinDisplayData(selectedBulletin)?.institutionName || 'University'} {getBulletinDisplayData(selectedBulletin)?.specialization ? ' • ' + getBulletinDisplayData(selectedBulletin)?.specialization : ''}
                    </>
                  ) : (selectedBulletin.metadata.formType || 'form6') === 'highSchoolAttestation' ? (
                    // For High School Attestation, show school name and province
                    <>
                      {getBulletinDisplayData(selectedBulletin)?.schoolName || 'School'} {getBulletinDisplayData(selectedBulletin)?.province ? ' • ' + getBulletinDisplayData(selectedBulletin)?.province : ''}
                    </>
                  ) : (selectedBulletin.metadata.formType || 'form6') === 'stateExamAttestation' ? (
                    // For State Exam Attestation, show school name and exam session
                    <>
                      {getBulletinDisplayData(selectedBulletin)?.schoolName || 'School'} {getBulletinDisplayData(selectedBulletin)?.examSession ? ' • ' + getBulletinDisplayData(selectedBulletin)?.examSession : ''}
                    </>
                  ) : (selectedBulletin.metadata.formType || 'form6') === 'collegeTranscript' ? (
                    // For College Transcript, show institution and level
                    <>
                      {getBulletinDisplayData(selectedBulletin)?.institutionName || getBulletinDisplayData(selectedBulletin)?.institutionAbbreviation || 'College'} {getBulletinDisplayData(selectedBulletin)?.level ? ' • ' + getBulletinDisplayData(selectedBulletin)?.level : ''}
                    </>
                  ) : (selectedBulletin.metadata.formType || 'form6') === 'collegeAttestation' ? (
                    // For College Attestation, show institution and section/option
                    <>
                      {getBulletinDisplayData(selectedBulletin)?.institutionName || getBulletinDisplayData(selectedBulletin)?.institutionAbbreviation || 'College'} {getBulletinDisplayData(selectedBulletin)?.section ? ' • ' + getBulletinDisplayData(selectedBulletin)?.section : ''} {getBulletinDisplayData(selectedBulletin)?.option && getBulletinDisplayData(selectedBulletin)?.section ? ' - ' + getBulletinDisplayData(selectedBulletin)?.option : (getBulletinDisplayData(selectedBulletin)?.option ? ' • ' + getBulletinDisplayData(selectedBulletin)?.option : '')}
                    </>
                  ) : (
                    // For Form 4/6, show class and school
                    `${getBulletinDisplayData(selectedBulletin)?.class} • ${getBulletinDisplayData(selectedBulletin)?.school}`
                  )}
                </p>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 mt-4 sm:mt-0">
                {/* Edit/View Button */}
                {!isEditing && (
                  <button
                    onClick={() => handleStartEditing(selectedBulletin)}
                    className="inline-flex items-center justify-center px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-md hover:shadow-lg font-medium text-sm"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    <span>Edit Document</span>
                  </button>
                )}
                {isEditing && (
                  <button
                    onClick={() => setIsEditing(false)}
                    className="inline-flex items-center justify-center px-5 py-2.5 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all duration-200 shadow-md hover:shadow-lg font-medium text-sm"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    <span>View Only</span>
                  </button>
                )}

                {/* Download PDF Button */}
                <div className="flex-shrink-0">
                  {(selectedBulletin.metadata.formType || 'form6') === 'stateDiploma' ? (
                    <StateDiplomaPDFDownloadButton
                      data={transformDataForStateDiploma(getBulletinDisplayData(selectedBulletin))}
                      documentId={selectedBulletin.id}
                      className="inline-flex items-center justify-center w-full px-5 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all duration-200 shadow-md hover:shadow-lg font-medium text-sm"
                    />
                  ) : (selectedBulletin.metadata.formType || 'form6') === 'bachelorDiploma' ? (
                    <BachelorDiplomaPDFDownloadButton
                      data={transformDataForBachelorDiploma(getBulletinDisplayData(selectedBulletin))}
                      documentId={selectedBulletin.id}
                      className="inline-flex items-center justify-center w-full px-5 py-2.5 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-all duration-200 shadow-md hover:shadow-lg font-medium text-sm"
                    />
                  ) : (selectedBulletin.metadata.formType || 'form6') === 'highSchoolAttestation' ? (
                    <HighSchoolAttestationPDFDownloadButton
                      data={transformDataForHighSchoolAttestation(getBulletinDisplayData(selectedBulletin))}
                      documentId={selectedBulletin.id}
                      className="inline-flex items-center justify-center w-full px-5 py-2.5 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-all duration-200 shadow-md hover:shadow-lg font-medium text-sm"
                    />
                  ) : (selectedBulletin.metadata.formType || 'form6') === 'stateExamAttestation' ? (
                    <StateExamAttestationPDFDownloadButton
                      data={transformDataForStateExamAttestation(getBulletinDisplayData(selectedBulletin))}
                      documentId={selectedBulletin.id}
                      className="inline-flex items-center justify-center w-full px-5 py-2.5 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-all duration-200 shadow-md hover:shadow-lg font-medium text-sm"
                    />
                  ) : (selectedBulletin.metadata.formType || 'form6') === 'collegeTranscript' ? (
                    <CollegeTranscriptPDFDownloadButton
                      data={transformDataForCollegeTranscript(getBulletinDisplayData(selectedBulletin))}
                      documentId={selectedBulletin.id}
                      className="inline-flex items-center justify-center w-full px-5 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all duration-200 shadow-md hover:shadow-lg font-medium text-sm"
                    />
                  ) : (selectedBulletin.metadata.formType || 'form6') === 'collegeAttestation' ? (
                    <CollegeAttestationPDFDownloadButton
                      data={transformDataForCollegeAttestation(getBulletinDisplayData(selectedBulletin))}
                      documentId={selectedBulletin.id}
                      className="inline-flex items-center justify-center w-full px-5 py-2.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-all duration-200 shadow-md hover:shadow-lg font-medium text-sm"
                    />
                  ) : (
                    <FirestoreOnlyPDFDownloadButton
                      firestoreId={selectedBulletin.id}
                      studentName={getBulletinDisplayData(selectedBulletin)?.studentName}
                      onSuccess={handlePDFSuccess}
                      onError={handlePDFError}
                      tableSize={tableSize}
                    />
                  )}
                </div>

                {/* Delete Button */}
                <button
                  onClick={() => handleDeleteBulletin(
                    selectedBulletin.id,
                    getBulletinDisplayData(selectedBulletin)?.studentName || 'Student'
                  )}
                  className="inline-flex items-center justify-center px-5 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-200 shadow-md hover:shadow-lg font-medium text-sm"
                  title="Delete this bulletin"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  <span>Delete</span>
                </button>
              </div>
            </div>
            {/* Official Template View with Auto-Save Inline Editing */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-x-auto">
              <div className="bg-blue-900 text-white p-3 sm:p-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                <h3 className="font-bold text-base sm:text-lg">
                  {isEditing ? '✏️ Editing Report Card (Auto-Save)' : '📄 Official Report Card Template'}
                </h3>
                <div className="flex items-center space-x-2">
                  {isEditing && (
                    <div className="flex items-center space-x-2 text-xs sm:text-sm text-blue-200">
                      <svg className="w-4 h-4 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      <span>Changes auto-saved</span>
                    </div>
                  )}
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white text-xs sm:text-sm rounded-md flex items-center space-x-1"
                  >
                    {isEditing ? (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span>Done Editing</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        <span>View Only</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
              <div className="p-2 sm:p-4 bg-gray-50 overflow-x-auto">
                {/* Conditional template rendering based on form type */}
                {(() => {
                  console.log('🔍 Dashboard - selectedBulletin.id:', selectedBulletin?.id, 'formType:', selectedBulletin?.metadata?.formType);
                  return null;
                })()}
                {(selectedBulletin.metadata.formType || 'form6') === 'form4' ? (
                  <Form4Template 
                    data={transformDataForTemplate(getBulletinDisplayData(selectedBulletin))} 
                    isEditable={isEditing}
                    onDataChange={handleFieldUpdate}
                    documentId={selectedBulletin.id} // Pass Firestore document ID as documentId for QR codes
                  />
                ) : (selectedBulletin.metadata.formType || 'form6') === 'collegeTranscript' ? (
                  <CollegeAnnualTranscriptTemplate
                    data={transformDataForCollegeTranscript(getBulletinDisplayData(selectedBulletin))}
                    isEditable={isEditing}
                    onDataChange={handleFieldUpdate}
                    documentId={selectedBulletin.id}
                  />
                ) : (selectedBulletin.metadata.formType || 'form6') === 'collegeAttestation' ? (
                  <CollegeAttestationTemplate
                    data={transformDataForCollegeAttestation(getBulletinDisplayData(selectedBulletin))}
                    isEditable={isEditing}
                    onDataChange={handleFieldUpdate}
                    documentId={selectedBulletin.id}
                  />
                ) : (selectedBulletin.metadata.formType || 'form6') === 'stateDiploma' ? (
                  <StateDiplomaTemplate 
                    data={transformDataForStateDiploma(getBulletinDisplayData(selectedBulletin))} 
                    isEditable={isEditing}
                    onDataChange={handleFieldUpdate}
                    documentId={selectedBulletin.id} // Pass Firestore document ID as documentId for QR codes
                  />
                ) : (selectedBulletin.metadata.formType || 'form6') === 'bachelorDiploma' ? (
                  <BachelorDiplomaTemplate 
                    data={transformDataForBachelorDiploma(getBulletinDisplayData(selectedBulletin))} 
                    isEditable={isEditing}
                    onDataChange={handleFieldUpdate}
                    documentId={selectedBulletin.id} // Pass Firestore document ID as documentId for QR codes
                  />
                ) : (selectedBulletin.metadata.formType || 'form6') === 'highSchoolAttestation' ? (
                  <HighSchoolAttestationTemplate 
                    data={transformDataForHighSchoolAttestation(getBulletinDisplayData(selectedBulletin))} 
                    isEditable={isEditing}
                    onDataChange={handleFieldUpdate}
                    documentId={selectedBulletin.id} // Pass Firestore document ID as documentId for QR codes
                  />
                ) : (selectedBulletin.metadata.formType || 'form6') === 'stateExamAttestation' ? (
                  <StateExamAttestationTemplate 
                    data={transformDataForStateExamAttestation(getBulletinDisplayData(selectedBulletin))} 
                    isEditable={isEditing}
                    onDataChange={handleFieldUpdate}
                    documentId={selectedBulletin.id} // Pass Firestore document ID as documentId for QR codes
                  />
                ) : (
                  <Form6Template 
                    data={transformDataForTemplate(getBulletinDisplayData(selectedBulletin))} 
                    isEditable={isEditing}
                    onDataChange={handleFieldUpdate}
                    documentId={selectedBulletin.id} // Pass Firestore document ID as documentId for QR codes
                    initialTableSize={tableSize} // Pass current table size
                    onTableSizeChange={setTableSize} // Update table size when changed
                  />
                )}
                {isEditing && (
                  <div className="mt-4 p-3 sm:p-4 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-xs sm:text-sm text-green-800">
                      <strong>Auto-Save Mode:</strong> Click on any field to edit it directly. 
                      Changes are automatically saved to Firestore when you finish editing each field.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FirestoreOnlyDashboardPage;
