// FIRESTORE-ONLY Dashboard Page
// Displays user's bulletins from Firestore with real-time editing
// No localStorage dependency - everything comes from and goes to Firestore

import React, { useState, useEffect, useCallback } from 'react';
import { collection, query, where, getDocs, getFirestore, doc, updateDoc } from 'firebase/firestore';
import { useAuth } from '../AuthProvider';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from './LanguageSwitcher';
import Form6Template from './Form6Template';
import Form4Template from './Form4Template';
import StateDiplomaTemplate from './StateDiplomaTemplate';
import FirestoreOnlyPDFDownloadButton from './FirestoreOnlyPDFDownloadButton';
import StateDiplomaPDFDownloadButton from './StateDiplomaPDFDownloadButton';
import Swal from 'sweetalert2';

interface BulletinRecord {
  id: string;
  metadata: {
    studentName: string;
    fileName: string;
    uploadedAt: any;
    lastModified: any;
    status: string;
    formType?: 'form4' | 'form6' | 'stateDiploma'; // Add state diploma to metadata
  };
  editedData: any;
  originalData: any;
  userId: string;
}

const FirestoreOnlyDashboardPage: React.FC = () => {
  const { currentUser } = useAuth();
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
  const [selectedFormType, setSelectedFormType] = useState<'form4' | 'form6' | 'stateDiploma'>('form6'); // Add state diploma selection
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
      // Auto-saving field update to Firestore
      
      // Update the bulletin document in Firestore
      const bulletinRef = doc(db, 'bulletins', selectedBulletin.id);
      
      await updateDoc(bulletinRef, {
        editedData: updatedData,
        'metadata.lastModified': new Date(),
        'metadata.lastModifiedAt': new Date().toISOString()
      });

      // Data saved to Firestore successfully

      // Update local state to reflect the change
      setSelectedBulletin(prev => prev ? {
        ...prev,
        editedData: updatedData,
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
              editedData: updatedData,
              metadata: {
                ...bulletin.metadata,
                lastModified: new Date()
              }
            }
          : bulletin
      ));

      // Field auto-saved successfully
    } catch (error) {
      console.error('❌ Auto-save error:', error);
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

      // Call backend delete API
      const response = await fetch(`/api/bulletins/${bulletinId}`, {
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
      serialNumbers: data?.serialNumbers || ['T', 'S', '0', '7', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0'],
      serialCode: data?.serialCode || '0000000'
    };

    // State Diploma transformed data ready
    return transformedData;
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

  // Handle file upload
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

    try {
      setIsUploading(true);
      setError(null);
      setUploadProgress(0);

      // Get Firebase ID token
      const idToken = await currentUser?.getIdToken();
      if (!idToken) {
        throw new Error('Authentication required');
      }

      // Create form data
      const formData = new FormData();
      formData.append('file', file);
      formData.append('formType', selectedFormType); // Add form type to the upload

      // Uploading file to server

      // Simulate upload progress stages
      const updateProgress = (stage: string, progress: number) => {
        // Upload progress update
        setUploadProgress(progress);
        setUploadStage(stage);
      };

      // Stage 1: Preparing upload (0-10%)
      updateProgress('Preparing upload', 10);
      await new Promise(resolve => setTimeout(resolve, 200));

      // Stage 2: Uploading file (10-30%)
      updateProgress('Uploading file', 30);
      
      // Upload to backend with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 120000); // 2 minute timeout for processing

      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${idToken}`,
        },
        body: formData,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Stage 3: Processing response (30-50%)
      updateProgress('Processing response', 50);

      // Stage 3: Processing response (30-50%)
      updateProgress('Processing response', 50);

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
      updateProgress('Extracting text with AI', 70);
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
      updateProgress('Translating to English', 90);
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Upload successful

      // Stage 6: Saving to database (90-100%)
      updateProgress('Saving to database', 100);
      await new Promise(resolve => setTimeout(resolve, 300));

      // Reset form
      event.target.value = '';

      // Refresh bulletins list
      await loadUserBulletins();

      // Show success message briefly
      setTimeout(() => {
        setUploadProgress(0);
        setUploadStage('');
      }, 2000);

    } catch (error) {
      console.error('❌ Upload error:', error);
      
      if (error instanceof Error && error.name === 'AbortError') {
        setError('Upload timed out. Please try again with a smaller file.');
      } else {
        setError(error instanceof Error ? error.message : 'Upload failed');
      }
    } finally {
      setIsUploading(false);
      setUploadStage('');
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
                            : (bulletin.metadata.formType || 'form6') === 'stateDiploma'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-blue-100 text-blue-800'
                          }
                        `}>
                          {(bulletin.metadata.formType || 'form6') === 'form4' 
                            ? 'Form 4' 
                            : (bulletin.metadata.formType || 'form6') === 'stateDiploma'
                            ? 'State Diploma'
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
                      : (selectedBulletin.metadata.formType || 'form6') === 'stateDiploma'
                      ? 'bg-purple-100 text-purple-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {(selectedBulletin.metadata.formType || 'form6') === 'form4' 
                      ? 'Form 4' 
                      : (selectedBulletin.metadata.formType || 'form6') === 'stateDiploma'
                      ? 'State Diploma'
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
                  ) : (
                    // For Form 4/6, show class and school
                    `${getBulletinDisplayData(selectedBulletin)?.class} • ${getBulletinDisplayData(selectedBulletin)?.school}`
                  )}
                </p>
              </div>
              <div className="flex flex-wrap gap-2 sm:gap-3 mt-3 sm:mt-0">
                {!isEditing && (
                  <button
                    onClick={() => handleStartEditing(selectedBulletin)}
                    className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    <span>Edit</span>
                  </button>
                )}
                {isEditing && (
                  <button
                    onClick={() => setIsEditing(false)}
                    className="w-full sm:w-auto px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 flex items-center space-x-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    <span>View</span>
                  </button>
                )}
                <div className="w-full sm:w-auto">
                  {(selectedBulletin.metadata.formType || 'form6') === 'stateDiploma' ? (
                    <StateDiplomaPDFDownloadButton
                      data={transformDataForStateDiploma(getBulletinDisplayData(selectedBulletin))}
                      className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center justify-center space-x-2"
                    />
                  ) : (
                    <FirestoreOnlyPDFDownloadButton
                      firestoreId={selectedBulletin.id}
                      studentName={getBulletinDisplayData(selectedBulletin)?.studentName}
                      onSuccess={handlePDFSuccess}
                      onError={handlePDFError}
                    />
                  )}
                </div>
                <button
                  onClick={() => handleDeleteBulletin(
                    selectedBulletin.id,
                    getBulletinDisplayData(selectedBulletin)?.studentName || 'Student'
                  )}
                  className="w-full sm:w-auto px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center space-x-2"
                  title="Delete this bulletin"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                {(selectedBulletin.metadata.formType || 'form6') === 'form4' ? (
                  <Form4Template 
                    data={transformDataForTemplate(getBulletinDisplayData(selectedBulletin))} 
                    isEditable={isEditing}
                    onDataChange={handleFieldUpdate}
                  />
                ) : (selectedBulletin.metadata.formType || 'form6') === 'stateDiploma' ? (
                  <StateDiplomaTemplate 
                    data={transformDataForStateDiploma(getBulletinDisplayData(selectedBulletin))} 
                    isEditable={isEditing}
                    onDataChange={handleFieldUpdate}
                  />
                ) : (
                  <Form6Template 
                    data={transformDataForTemplate(getBulletinDisplayData(selectedBulletin))} 
                    isEditable={isEditing}
                    onDataChange={handleFieldUpdate}
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
