// FIRESTORE-ONLY Dashboard Page
// Displays user's bulletins from Firestore with real-time editing
// No localStorage dependency - everything comes from and goes to Firestore
// Refactored to use reusable components for maintainability

import React, { useState, useEffect, useCallback } from 'react';
import { collection, query, where, getDocs, getFirestore, doc, updateDoc } from 'firebase/firestore';
import { useAuth } from '../AuthProvider';
import { useLoading } from '../contexts/LoadingContext';
import { useTranslation } from 'react-i18next';
import { SEOHead } from '../components/common';
import {
  DashboardHeader
} from '../components/dashboard';
import {
  Form4Template,
  Form6Template,
  CollegeAnnualTranscriptTemplate,
  CollegeAttestationTemplate,
  StateDiplomaTemplate,
  BachelorDiplomaTemplate,
  HighSchoolAttestationTemplate,
  StateExamAttestationTemplate,
  GeneralDocumentTemplate
} from '../components/templates';
import {
  FirestoreOnlyPDFDownloadButton,
  StateDiplomaPDFDownloadButton,
  BachelorDiplomaPDFDownloadButton,
  CollegeTranscriptPDFDownloadButton,
  CollegeAttestationPDFDownloadButton,
  HighSchoolAttestationPDFDownloadButton,
  StateExamAttestationPDFDownloadButton
} from '../components/pdf';
import {
  getBulletinDisplayData,
  transformDataForTemplate,
  transformDataForStateDiploma,
  transformDataForBachelorDiploma,
  transformDataForCollegeTranscript,
  transformDataForCollegeAttestation,
  transformDataForHighSchoolAttestation,
  transformDataForStateExamAttestation
} from '../utils/bulletinTransformers';
import type { BulletinRecord, FormType, FilterType } from '../types/bulletin';
import Swal from 'sweetalert2';

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
  const [selectedFormType, setSelectedFormType] = useState<FormType>('form6');
  
  // Document list organization states
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(9); // 3x3 grid
  const [isPreviewExpanded, setIsPreviewExpanded] = useState(true); // Toggle for selected bulletin preview
  
  // Preview states
  const [previewFile, setPreviewFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [targetLanguage, setTargetLanguage] = useState<'english' | 'french' | 'swahili'>('english');
  
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

  // Filter and paginate bulletins
  const filteredBulletins = React.useMemo(() => {
    let result = bulletins;
    
    // Filter by document type
    if (filterType !== 'all') {
      result = result.filter(b => (b.metadata.formType || 'form6') === filterType);
    }
    
    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(b => {
        const displayData = b.editedData || b.originalData;
        const studentName = (displayData?.studentName || displayData?.documentTitle || b.metadata.studentName || '').toLowerCase();
        const fileName = (b.metadata.fileName || '').toLowerCase();
        return studentName.includes(query) || fileName.includes(query);
      });
    }
    
    return result;
  }, [bulletins, filterType, searchQuery]);

  // Paginated bulletins
  const paginatedBulletins = React.useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredBulletins.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredBulletins, currentPage, itemsPerPage]);

  // Reset to page 1 when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [filterType, searchQuery]);

  // Get document type counts
  const documentTypeCounts = React.useMemo(() => {
    const counts: Record<string, number> = { all: bulletins.length };
    bulletins.forEach(b => {
      const type = b.metadata.formType || 'form6';
      counts[type] = (counts[type] || 0) + 1;
    });
    return counts;
  }, [bulletins]);

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
      // Get current data (either edited or original)
      const currentData = selectedBulletin.editedData || selectedBulletin.originalData;
      
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

      // Merge updated data with current data to preserve all fields
      const mergedData = {
        ...currentData,
        ...cleanData(updatedData)
      };

      // Update the bulletin document in Firestore
      const bulletinRef = doc(db, 'bulletins', selectedBulletin.id);
      
      await updateDoc(bulletinRef, {
        editedData: mergedData,
        'metadata.lastModified': new Date(),
        'metadata.lastModifiedAt': new Date().toISOString()
      });

      // Update local state to reflect the change
      setSelectedBulletin(prev => prev ? {
        ...prev,
        editedData: mergedData,
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
              editedData: mergedData,
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

  // Handle file upload - Show preview first
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type - PDF allowed only for generalDocument
    const imageTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp'];
    const allowedTypes = selectedFormType === 'generalDocument' 
      ? [...imageTypes, 'application/pdf']
      : imageTypes;
    
    if (!allowedTypes.includes(file.type)) {
      if (selectedFormType === 'generalDocument') {
        setError('Please select a valid file type (PNG, JPG, JPEG, GIF, WEBP, or PDF)');
      } else {
        setError('Please select a valid file type (PNG, JPG, JPEG, GIF, WEBP)');
      }
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
      if (selectedFormType === 'generalDocument') {
        formData.append('targetLanguage', targetLanguage); // Add target translation language
      }

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
      <DashboardHeader userEmail={currentUser.email || ''} />

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
        <div className="mb-8 bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">{t('dashboard.upload.title')}</h2>
          {/* Form Type Selection */}
          <div className="mb-6">
            <h3 className="text-xs sm:text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">{t('dashboard.upload.selectType')}</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {/* Form 4 */}
              <button
                onClick={() => setSelectedFormType('form4')}
                className={`group relative p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                  selectedFormType === 'form4'
                    ? 'border-emerald-500 bg-emerald-50 shadow-md'
                    : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                }`}
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${
                  selectedFormType === 'form4' ? 'bg-emerald-500' : 'bg-gray-100 group-hover:bg-gray-200'
                }`}>
                  <svg className={`w-5 h-5 ${selectedFormType === 'form4' ? 'text-white' : 'text-gray-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h4 className={`font-semibold text-sm ${selectedFormType === 'form4' ? 'text-emerald-700' : 'text-gray-900'}`}>
                  {t('dashboard.upload.form4.title')}
                </h4>
                <p className={`text-xs mt-1 ${selectedFormType === 'form4' ? 'text-emerald-600' : 'text-gray-500'}`}>
                  {t('dashboard.upload.form4.subtitle')}
                </p>
                {selectedFormType === 'form4' && (
                  <div className="absolute top-2 right-2 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
              </button>

              {/* Form 6 */}
              <button
                onClick={() => setSelectedFormType('form6')}
                className={`group relative p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                  selectedFormType === 'form6'
                    ? 'border-blue-500 bg-blue-50 shadow-md'
                    : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                }`}
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${
                  selectedFormType === 'form6' ? 'bg-blue-500' : 'bg-gray-100 group-hover:bg-gray-200'
                }`}>
                  <svg className={`w-5 h-5 ${selectedFormType === 'form6' ? 'text-white' : 'text-gray-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h4 className={`font-semibold text-sm ${selectedFormType === 'form6' ? 'text-blue-700' : 'text-gray-900'}`}>
                  {t('dashboard.upload.form6.title')}
                </h4>
                <p className={`text-xs mt-1 ${selectedFormType === 'form6' ? 'text-blue-600' : 'text-gray-500'}`}>
                  {t('dashboard.upload.form6.subtitle')}
                </p>
                {selectedFormType === 'form6' && (
                  <div className="absolute top-2 right-2 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
              </button>

              {/* College Transcript */}
              <button
                onClick={() => setSelectedFormType('collegeTranscript')}
                className={`group relative p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                  selectedFormType === 'collegeTranscript'
                    ? 'border-indigo-500 bg-indigo-50 shadow-md'
                    : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                }`}
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${
                  selectedFormType === 'collegeTranscript' ? 'bg-indigo-500' : 'bg-gray-100 group-hover:bg-gray-200'
                }`}>
                  <svg className={`w-5 h-5 ${selectedFormType === 'collegeTranscript' ? 'text-white' : 'text-gray-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <h4 className={`font-semibold text-sm ${selectedFormType === 'collegeTranscript' ? 'text-indigo-700' : 'text-gray-900'}`}>
                  {t('dashboard.upload.collegeTranscript.title')}
                </h4>
                <p className={`text-xs mt-1 ${selectedFormType === 'collegeTranscript' ? 'text-indigo-600' : 'text-gray-500'}`}>
                  {t('dashboard.upload.collegeTranscript.subtitle')}
                </p>
                {selectedFormType === 'collegeTranscript' && (
                  <div className="absolute top-2 right-2 w-5 h-5 bg-indigo-500 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
              </button>

              {/* College Attestation */}
              <button
                onClick={() => setSelectedFormType('collegeAttestation')}
                className={`group relative p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                  selectedFormType === 'collegeAttestation'
                    ? 'border-teal-500 bg-teal-50 shadow-md'
                    : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                }`}
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${
                  selectedFormType === 'collegeAttestation' ? 'bg-teal-500' : 'bg-gray-100 group-hover:bg-gray-200'
                }`}>
                  <svg className={`w-5 h-5 ${selectedFormType === 'collegeAttestation' ? 'text-white' : 'text-gray-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                  </svg>
                </div>
                <h4 className={`font-semibold text-sm ${selectedFormType === 'collegeAttestation' ? 'text-teal-700' : 'text-gray-900'}`}>
                  {t('dashboard.upload.collegeAttestation.title')}
                </h4>
                <p className={`text-xs mt-1 ${selectedFormType === 'collegeAttestation' ? 'text-teal-600' : 'text-gray-500'}`}>
                  {t('dashboard.upload.collegeAttestation.subtitle')}
                </p>
                {selectedFormType === 'collegeAttestation' && (
                  <div className="absolute top-2 right-2 w-5 h-5 bg-teal-500 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
              </button>

              {/* State Diploma */}
              <button
                onClick={() => setSelectedFormType('stateDiploma')}
                className={`group relative p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                  selectedFormType === 'stateDiploma'
                    ? 'border-purple-500 bg-purple-50 shadow-md'
                    : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                }`}
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${
                  selectedFormType === 'stateDiploma' ? 'bg-purple-500' : 'bg-gray-100 group-hover:bg-gray-200'
                }`}>
                  <svg className={`w-5 h-5 ${selectedFormType === 'stateDiploma' ? 'text-white' : 'text-gray-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path d="M12 14l9-5-9-5-9 5 9 5z" />
                    <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
                  </svg>
                </div>
                <h4 className={`font-semibold text-sm ${selectedFormType === 'stateDiploma' ? 'text-purple-700' : 'text-gray-900'}`}>
                  {t('dashboard.upload.stateDiploma.title')}
                </h4>
                <p className={`text-xs mt-1 ${selectedFormType === 'stateDiploma' ? 'text-purple-600' : 'text-gray-500'}`}>
                  {t('dashboard.upload.stateDiploma.subtitle')}
                </p>
                {selectedFormType === 'stateDiploma' && (
                  <div className="absolute top-2 right-2 w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
              </button>

              {/* Bachelor Diploma */}
              <button
                onClick={() => setSelectedFormType('bachelorDiploma')}
                className={`group relative p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                  selectedFormType === 'bachelorDiploma'
                    ? 'border-amber-500 bg-amber-50 shadow-md'
                    : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                }`}
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${
                  selectedFormType === 'bachelorDiploma' ? 'bg-amber-500' : 'bg-gray-100 group-hover:bg-gray-200'
                }`}>
                  <svg className={`w-5 h-5 ${selectedFormType === 'bachelorDiploma' ? 'text-white' : 'text-gray-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                </div>
                <h4 className={`font-semibold text-sm ${selectedFormType === 'bachelorDiploma' ? 'text-amber-700' : 'text-gray-900'}`}>
                  {t('dashboard.upload.bachelorDiploma.title')}
                </h4>
                <p className={`text-xs mt-1 ${selectedFormType === 'bachelorDiploma' ? 'text-amber-600' : 'text-gray-500'}`}>
                  {t('dashboard.upload.bachelorDiploma.subtitle')}
                </p>
                {selectedFormType === 'bachelorDiploma' && (
                  <div className="absolute top-2 right-2 w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
              </button>

              {/* High School Attestation */}
              <button
                onClick={() => setSelectedFormType('highSchoolAttestation')}
                className={`group relative p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                  selectedFormType === 'highSchoolAttestation'
                    ? 'border-rose-500 bg-rose-50 shadow-md'
                    : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                }`}
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${
                  selectedFormType === 'highSchoolAttestation' ? 'bg-rose-500' : 'bg-gray-100 group-hover:bg-gray-200'
                }`}>
                  <svg className={`w-5 h-5 ${selectedFormType === 'highSchoolAttestation' ? 'text-white' : 'text-gray-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h4 className={`font-semibold text-sm ${selectedFormType === 'highSchoolAttestation' ? 'text-rose-700' : 'text-gray-900'}`}>
                  {t('dashboard.upload.highSchoolAttestation.title')}
                </h4>
                <p className={`text-xs mt-1 ${selectedFormType === 'highSchoolAttestation' ? 'text-rose-600' : 'text-gray-500'}`}>
                  {t('dashboard.upload.highSchoolAttestation.subtitle')}
                </p>
                {selectedFormType === 'highSchoolAttestation' && (
                  <div className="absolute top-2 right-2 w-5 h-5 bg-rose-500 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
              </button>

              {/* State Exam Attestation */}
              <button
                onClick={() => setSelectedFormType('stateExamAttestation')}
                className={`group relative p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                  selectedFormType === 'stateExamAttestation'
                    ? 'border-cyan-500 bg-cyan-50 shadow-md'
                    : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                }`}
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${
                  selectedFormType === 'stateExamAttestation' ? 'bg-cyan-500' : 'bg-gray-100 group-hover:bg-gray-200'
                }`}>
                  <svg className={`w-5 h-5 ${selectedFormType === 'stateExamAttestation' ? 'text-white' : 'text-gray-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                </div>
                <h4 className={`font-semibold text-sm ${selectedFormType === 'stateExamAttestation' ? 'text-cyan-700' : 'text-gray-900'}`}>
                  {t('dashboard.upload.stateExamAttestation.title')}
                </h4>
                <p className={`text-xs mt-1 ${selectedFormType === 'stateExamAttestation' ? 'text-cyan-600' : 'text-gray-500'}`}>
                  {t('dashboard.upload.stateExamAttestation.subtitle')}
                </p>
                {selectedFormType === 'stateExamAttestation' && (
                  <div className="absolute top-2 right-2 w-5 h-5 bg-cyan-500 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
              </button>

              {/* General Document (PDF) */}
              <button
                onClick={() => setSelectedFormType('generalDocument')}
                className={`group relative p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                  selectedFormType === 'generalDocument'
                    ? 'border-orange-500 bg-orange-50 shadow-md'
                    : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                }`}
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${
                  selectedFormType === 'generalDocument' ? 'bg-orange-500' : 'bg-gray-100 group-hover:bg-gray-200'
                }`}>
                  <svg className={`w-5 h-5 ${selectedFormType === 'generalDocument' ? 'text-white' : 'text-gray-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <h4 className={`font-semibold text-sm ${selectedFormType === 'generalDocument' ? 'text-orange-700' : 'text-gray-900'}`}>
                  {i18n.language === 'fr' ? 'Document Général' : 'General Document'}
                </h4>
                <p className={`text-xs mt-1 ${selectedFormType === 'generalDocument' ? 'text-orange-600' : 'text-gray-500'}`}>
                  {i18n.language === 'fr' ? 'PDF multi-pages' : 'Multi-page PDF'}
                </p>
                {selectedFormType === 'generalDocument' && (
                  <div className="absolute top-2 right-2 w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
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
                  accept={selectedFormType === 'generalDocument' ? '.png,.jpg,.jpeg,.gif,.webp,.pdf' : '.png,.jpg,.jpeg,.gif,.webp'}
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

              {/* Modal Body - Document Preview */}
              <div className="flex-1 overflow-auto p-4 sm:p-6 bg-gray-50">
                <div className="bg-white rounded-lg shadow-md p-4 flex items-center justify-center">
                  {previewFile?.type === 'application/pdf' ? (
                    <div className="text-center py-8">
                      <svg className="w-20 h-20 text-red-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                      <p className="text-lg font-medium text-gray-700">{previewFile.name}</p>
                      <p className="text-sm text-gray-500 mt-1">PDF Document - Ready for AI translation</p>
                    </div>
                  ) : (
                    <img
                      src={previewUrl || ''}
                      alt="Document preview"
                      className="max-w-full max-h-[60vh] object-contain rounded"
                    />
                  )}
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
                           selectedFormType === 'stateExamAttestation' ? 'State Exam Attestation' :
                           selectedFormType === 'generalDocument' ? 'General Document' : selectedFormType}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Language Selector - Only for General Document */}
                {selectedFormType === 'generalDocument' && (
                  <div className="mt-4 bg-orange-50 border border-orange-200 rounded-lg p-4">
                    <label className="block font-semibold text-gray-700 mb-2">
                      🌍 {i18n.language === 'fr' ? 'Traduire vers :' : 'Translate to:'}
                    </label>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => setTargetLanguage('english')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                          targetLanguage === 'english'
                            ? 'bg-orange-500 text-white shadow-md'
                            : 'bg-white text-gray-700 border border-gray-300 hover:border-orange-300 hover:bg-orange-50'
                        }`}
                      >
                        🇬🇧 English
                      </button>
                      <button
                        type="button"
                        onClick={() => setTargetLanguage('french')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                          targetLanguage === 'french'
                            ? 'bg-orange-500 text-white shadow-md'
                            : 'bg-white text-gray-700 border border-gray-300 hover:border-orange-300 hover:bg-orange-50'
                        }`}
                      >
                        🇫🇷 Français
                      </button>
                      <button
                        type="button"
                        onClick={() => setTargetLanguage('swahili')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                          targetLanguage === 'swahili'
                            ? 'bg-orange-500 text-white shadow-md'
                            : 'bg-white text-gray-700 border border-gray-300 hover:border-orange-300 hover:bg-orange-50'
                        }`}
                      >
                        🇰🇪 Kiswahili
                      </button>
                    </div>
                    <p className="text-xs text-orange-600 mt-2">
                      {i18n.language === 'fr'
                        ? 'Le document sera traduit dans la langue sélectionnée'
                        : 'The document will be translated into the selected language'}
                    </p>
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
        <div className="mb-8 bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
          {/* Header with title and count */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-2">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">📚 {t('dashboard.bulletinsList.title')}</h2>
            <span className="text-xs sm:text-sm text-gray-500">
              {filteredBulletins.length} {i18n.language === 'fr' ? 'sur' : 'of'} {bulletins.length} document{bulletins.length !== 1 ? 's' : ''}
            </span>
          </div>

          {/* Search and Filter Controls */}
          {bulletins.length > 0 && (
            <div className="mb-6 space-y-4">
              {/* Search Bar */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={i18n.language === 'fr' ? 'Rechercher par nom d\'étudiant...' : 'Search by student name...'}
                  className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    <svg className="h-5 w-5 text-gray-400 hover:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>

              {/* Filter Tabs */}
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setFilterType('all')}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                    filterType === 'all'
                      ? 'bg-gray-900 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {i18n.language === 'fr' ? 'Tous' : 'All'} ({documentTypeCounts.all || 0})
                </button>
                {documentTypeCounts.form4 > 0 && (
                  <button
                    onClick={() => setFilterType('form4')}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                      filterType === 'form4'
                        ? 'bg-emerald-500 text-white'
                        : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                    }`}
                  >
                    Form 4 ({documentTypeCounts.form4})
                  </button>
                )}
                {documentTypeCounts.form6 > 0 && (
                  <button
                    onClick={() => setFilterType('form6')}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                      filterType === 'form6'
                        ? 'bg-blue-500 text-white'
                        : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                    }`}
                  >
                    Form 6 ({documentTypeCounts.form6})
                  </button>
                )}
                {documentTypeCounts.collegeTranscript > 0 && (
                  <button
                    onClick={() => setFilterType('collegeTranscript')}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                      filterType === 'collegeTranscript'
                        ? 'bg-indigo-500 text-white'
                        : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
                    }`}
                  >
                    {i18n.language === 'fr' ? 'Relevé Univ.' : 'Transcript'} ({documentTypeCounts.collegeTranscript})
                  </button>
                )}
                {documentTypeCounts.collegeAttestation > 0 && (
                  <button
                    onClick={() => setFilterType('collegeAttestation')}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                      filterType === 'collegeAttestation'
                        ? 'bg-teal-500 text-white'
                        : 'bg-teal-50 text-teal-700 hover:bg-teal-100'
                    }`}
                  >
                    {i18n.language === 'fr' ? 'Attestation Univ.' : 'College Att.'} ({documentTypeCounts.collegeAttestation})
                  </button>
                )}
                {documentTypeCounts.stateDiploma > 0 && (
                  <button
                    onClick={() => setFilterType('stateDiploma')}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                      filterType === 'stateDiploma'
                        ? 'bg-purple-500 text-white'
                        : 'bg-purple-50 text-purple-700 hover:bg-purple-100'
                    }`}
                  >
                    {i18n.language === 'fr' ? 'Diplôme d\'État' : 'State Diploma'} ({documentTypeCounts.stateDiploma})
                  </button>
                )}
                {documentTypeCounts.bachelorDiploma > 0 && (
                  <button
                    onClick={() => setFilterType('bachelorDiploma')}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                      filterType === 'bachelorDiploma'
                        ? 'bg-amber-500 text-white'
                        : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                    }`}
                  >
                    {i18n.language === 'fr' ? 'Licence' : 'Bachelor'} ({documentTypeCounts.bachelorDiploma})
                  </button>
                )}
                {documentTypeCounts.highSchoolAttestation > 0 && (
                  <button
                    onClick={() => setFilterType('highSchoolAttestation')}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                      filterType === 'highSchoolAttestation'
                        ? 'bg-rose-500 text-white'
                        : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                    }`}
                  >
                    {i18n.language === 'fr' ? 'Att. Scolaire' : 'HS Attestation'} ({documentTypeCounts.highSchoolAttestation})
                  </button>
                )}
                {documentTypeCounts.stateExamAttestation > 0 && (
                  <button
                    onClick={() => setFilterType('stateExamAttestation')}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                      filterType === 'stateExamAttestation'
                        ? 'bg-cyan-500 text-white'
                        : 'bg-cyan-50 text-cyan-700 hover:bg-cyan-100'
                    }`}
                  >
                    {i18n.language === 'fr' ? 'Att. Réussite' : 'Exam Att.'} ({documentTypeCounts.stateExamAttestation})
                  </button>
                )}
                {documentTypeCounts.generalDocument > 0 && (
                  <button
                    onClick={() => setFilterType('generalDocument')}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                      filterType === 'generalDocument'
                        ? 'bg-orange-500 text-white'
                        : 'bg-orange-50 text-orange-700 hover:bg-orange-100'
                    }`}
                  >
                    {i18n.language === 'fr' ? 'Doc. Général' : 'General Doc.'} ({documentTypeCounts.generalDocument})
                  </button>
                )}
              </div>
            </div>
          )}

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
          ) : filteredBulletins.length === 0 ? (
            <div className="text-center py-8 sm:py-12">
              <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <h3 className="mt-4 text-lg font-medium text-gray-900">
                {i18n.language === 'fr' ? 'Aucun résultat trouvé' : 'No results found'}
              </h3>
              <p className="mt-2 text-gray-500">
                {i18n.language === 'fr' 
                  ? 'Essayez de modifier votre recherche ou vos filtres' 
                  : 'Try adjusting your search or filters'}
              </p>
              <button
                onClick={() => { setSearchQuery(''); setFilterType('all'); }}
                className="mt-4 text-blue-600 hover:text-blue-800 font-medium"
              >
                {i18n.language === 'fr' ? 'Réinitialiser les filtres' : 'Reset filters'}
              </button>
            </div>
          ) : (
            <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {paginatedBulletins.map((bulletin) => {
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
                          {displayData?.studentName || displayData?.documentTitle || bulletin.metadata.studentName || 'Unknown Student'}
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
                          ) : (bulletin.metadata.formType || 'form6') === 'generalDocument' ? (
                            // For General Document, show document type and organization
                            <>
                              {displayData?.documentType || 'Document'} {displayData?.organization ? ' • ' + displayData.organization : ''}
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
                            : (bulletin.metadata.formType || 'form6') === 'generalDocument'
                            ? 'bg-orange-100 text-orange-800'
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
                            : (bulletin.metadata.formType || 'form6') === 'generalDocument'
                            ? 'General Document'
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
                              displayData?.studentName || displayData?.documentTitle || bulletin.metadata.studentName || 'Unknown Student'
                            );
                          }}
                          className="group flex items-center justify-center w-7 h-7 rounded-full bg-red-50 hover:bg-red-100 border border-red-200 hover:border-red-300 transition-all duration-200"
                          title={i18n.language === 'fr' ? 'Supprimer' : 'Delete'}
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
                        
                        {/* Hide/Show Preview Button */}
                        {selectedBulletin?.id === bulletin.id && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setIsPreviewExpanded(!isPreviewExpanded);
                            }}
                            className="group flex items-center justify-center w-7 h-7 rounded-full bg-gray-50 hover:bg-gray-100 border border-gray-200 hover:border-gray-300 transition-all duration-200"
                            title={isPreviewExpanded ? (i18n.language === 'fr' ? 'Masquer' : 'Hide') : (i18n.language === 'fr' ? 'Afficher' : 'Show')}
                          >
                            <svg 
                              className="w-4 h-4 text-gray-500 group-hover:text-gray-600" 
                              fill="none" 
                              stroke="currentColor" 
                              viewBox="0 0 24 24"
                            >
                              {isPreviewExpanded ? (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                              ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              )}
                            </svg>
                          </button>
                        )}
                        
                        {selectedBulletin?.id === bulletin.id && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination Controls */}
            {filteredBulletins.length > itemsPerPage && (
              <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
                <div className="text-sm text-gray-600">
                  {i18n.language === 'fr' 
                    ? `Affichage ${(currentPage - 1) * itemsPerPage + 1}-${Math.min(currentPage * itemsPerPage, filteredBulletins.length)} sur ${filteredBulletins.length}` 
                    : `Showing ${(currentPage - 1) * itemsPerPage + 1}-${Math.min(currentPage * itemsPerPage, filteredBulletins.length)} of ${filteredBulletins.length}`}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className={`
                      px-3 py-2 rounded-lg text-sm font-medium transition-colors
                      ${currentPage === 1 
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                        : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'}
                    `}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.ceil(filteredBulletins.length / itemsPerPage) }, (_, i) => i + 1)
                      .filter(page => {
                        const totalPages = Math.ceil(filteredBulletins.length / itemsPerPage);
                        // Show first page, last page, current page, and pages around current
                        return page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1;
                      })
                      .map((page, index, arr) => (
                        <React.Fragment key={page}>
                          {index > 0 && arr[index - 1] !== page - 1 && (
                            <span className="px-2 text-gray-400">...</span>
                          )}
                          <button
                            onClick={() => setCurrentPage(page)}
                            className={`
                              w-9 h-9 rounded-lg text-sm font-medium transition-colors
                              ${currentPage === page 
                                ? 'bg-blue-600 text-white' 
                                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'}
                            `}
                          >
                            {page}
                          </button>
                        </React.Fragment>
                      ))}
                  </div>
                  
                  <button
                    onClick={() => setCurrentPage(p => Math.min(Math.ceil(filteredBulletins.length / itemsPerPage), p + 1))}
                    disabled={currentPage >= Math.ceil(filteredBulletins.length / itemsPerPage)}
                    className={`
                      px-3 py-2 rounded-lg text-sm font-medium transition-colors
                      ${currentPage >= Math.ceil(filteredBulletins.length / itemsPerPage)
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                        : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'}
                    `}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            )}
            </>
          )}
        </div>

        {/* Selected Bulletin Display */}
        {selectedBulletin && isPreviewExpanded && (
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 overflow-x-auto">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-3">
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                    📄 {getBulletinDisplayData(selectedBulletin)?.studentName || getBulletinDisplayData(selectedBulletin)?.documentTitle || 'Student Report Card'}
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
                      : (selectedBulletin.metadata.formType || 'form6') === 'generalDocument'
                      ? 'bg-orange-100 text-orange-800'
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
                      : (selectedBulletin.metadata.formType || 'form6') === 'generalDocument'
                      ? 'General Document'
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
                  ) : (selectedBulletin.metadata.formType || 'form6') === 'generalDocument' ? (
                    // For General Document, show document type and organization
                    <>
                      {getBulletinDisplayData(selectedBulletin)?.documentType || 'Document'} {getBulletinDisplayData(selectedBulletin)?.organization ? ' • ' + getBulletinDisplayData(selectedBulletin)?.organization : ''}
                    </>
                  ) : (
                    // For Form 4/6, show class and school
                    `${getBulletinDisplayData(selectedBulletin)?.class} • ${getBulletinDisplayData(selectedBulletin)?.school}`
                  )}
                </p>
              </div>
              <div className="flex flex-row items-center gap-2 mt-4 sm:mt-0">
                {/* Hide Preview Button */}
                <button
                  onClick={() => setIsPreviewExpanded(false)}
                  className="inline-flex items-center justify-center w-10 h-10 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-all duration-200 border border-gray-200"
                  title={i18n.language === 'fr' ? 'Masquer' : 'Hide'}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                  </svg>
                </button>
                
                {/* Edit/View Button */}
                {!isEditing && (
                  <button
                    onClick={() => handleStartEditing(selectedBulletin)}
                    className="inline-flex items-center justify-center w-10 h-10 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-md hover:shadow-lg"
                    title={i18n.language === 'fr' ? 'Modifier' : 'Edit'}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                )}
                {isEditing && (
                  <button
                    onClick={() => setIsEditing(false)}
                    className="inline-flex items-center justify-center w-10 h-10 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all duration-200 shadow-md hover:shadow-lg"
                    title={i18n.language === 'fr' ? 'Voir seulement' : 'View Only'}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </button>
                )}

                {/* Download PDF Button */}
                <div className="flex-shrink-0">
                  {(selectedBulletin.metadata.formType || 'form6') === 'stateDiploma' ? (
                    <StateDiplomaPDFDownloadButton
                      data={transformDataForStateDiploma(getBulletinDisplayData(selectedBulletin))}
                      documentId={selectedBulletin.id}
                      className="inline-flex items-center justify-center w-10 h-10 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all duration-200 shadow-md hover:shadow-lg"
                      iconOnly={true}
                    />
                  ) : (selectedBulletin.metadata.formType || 'form6') === 'bachelorDiploma' ? (
                    <BachelorDiplomaPDFDownloadButton
                      data={transformDataForBachelorDiploma(getBulletinDisplayData(selectedBulletin))}
                      documentId={selectedBulletin.id}
                      className="inline-flex items-center justify-center w-10 h-10 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-all duration-200 shadow-md hover:shadow-lg"
                      iconOnly={true}
                    />
                  ) : (selectedBulletin.metadata.formType || 'form6') === 'highSchoolAttestation' ? (
                    <HighSchoolAttestationPDFDownloadButton
                      data={transformDataForHighSchoolAttestation(getBulletinDisplayData(selectedBulletin))}
                      documentId={selectedBulletin.id}
                      className="inline-flex items-center justify-center w-10 h-10 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-all duration-200 shadow-md hover:shadow-lg"
                      iconOnly={true}
                    />
                  ) : (selectedBulletin.metadata.formType || 'form6') === 'stateExamAttestation' ? (
                    <StateExamAttestationPDFDownloadButton
                      data={transformDataForStateExamAttestation(getBulletinDisplayData(selectedBulletin))}
                      documentId={selectedBulletin.id}
                      className="inline-flex items-center justify-center w-10 h-10 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-all duration-200 shadow-md hover:shadow-lg"
                      iconOnly={true}
                    />
                  ) : (selectedBulletin.metadata.formType || 'form6') === 'collegeTranscript' ? (
                    <CollegeTranscriptPDFDownloadButton
                      data={transformDataForCollegeTranscript(getBulletinDisplayData(selectedBulletin))}
                      documentId={selectedBulletin.id}
                      className="inline-flex items-center justify-center w-10 h-10 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all duration-200 shadow-md hover:shadow-lg"
                      iconOnly={true}
                    />
                  ) : (selectedBulletin.metadata.formType || 'form6') === 'collegeAttestation' ? (
                    <CollegeAttestationPDFDownloadButton
                      data={transformDataForCollegeAttestation(getBulletinDisplayData(selectedBulletin))}
                      documentId={selectedBulletin.id}
                      className="inline-flex items-center justify-center w-10 h-10 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-all duration-200 shadow-md hover:shadow-lg"
                      iconOnly={true}
                    />
                  ) : (
                    <FirestoreOnlyPDFDownloadButton
                      firestoreId={selectedBulletin.id}
                      studentName={getBulletinDisplayData(selectedBulletin)?.studentName || getBulletinDisplayData(selectedBulletin)?.documentTitle}
                      onSuccess={handlePDFSuccess}
                      onError={handlePDFError}
                      iconOnly={true}
                    />
                  )}
                </div>

                {/* Delete Button */}
                <button
                  onClick={() => handleDeleteBulletin(
                    selectedBulletin.id,
                    getBulletinDisplayData(selectedBulletin)?.studentName || getBulletinDisplayData(selectedBulletin)?.documentTitle || 'Student'
                  )}
                  className="inline-flex items-center justify-center w-10 h-10 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-200 shadow-md hover:shadow-lg"
                  title={i18n.language === 'fr' ? 'Supprimer' : 'Delete'}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
            {/* Official Template View with Auto-Save Inline Editing */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-x-auto">
              <div className="bg-blue-900 text-white p-3 sm:p-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                <h3 className="font-bold text-base sm:text-lg">
                  {isEditing 
                    ? ((selectedBulletin?.metadata?.formType) === 'generalDocument' ? '✏️ Editing Document (Auto-Save)' : '✏️ Editing Report Card (Auto-Save)')
                    : ((selectedBulletin?.metadata?.formType) === 'generalDocument' ? '📄 Official Translated Document' : '📄 Official Report Card Template')
                  }
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
                ) : (selectedBulletin.metadata.formType || 'form6') === 'generalDocument' ? (
                  <GeneralDocumentTemplate 
                    data={getBulletinDisplayData(selectedBulletin)} 
                    isEditable={isEditing}
                    onDataChange={handleFieldUpdate}
                    documentId={selectedBulletin.id}
                  />
                ) : (
                  <Form6Template 
                    data={transformDataForTemplate(getBulletinDisplayData(selectedBulletin))} 
                    isEditable={isEditing}
                    onDataChange={handleFieldUpdate}
                    documentId={selectedBulletin.id} // Pass Firestore document ID as documentId for QR codes
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
