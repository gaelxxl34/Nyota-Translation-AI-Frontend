// FIRESTORE-ONLY PDF Download Button
// No localStorage dependency - everything comes from Firestore

import React, { useState } from 'react';
import { useAuth } from '../AuthProvider';

interface FirestoreOnlyPDFDownloadButtonProps {
  firestoreId: string; // REQUIRED: Firestore document ID
  studentName?: string;
  className?: string;
  disabled?: boolean;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

const FirestoreOnlyPDFDownloadButton: React.FC<FirestoreOnlyPDFDownloadButtonProps> = ({ 
  firestoreId,
  studentName,
  className = '',
  disabled = false,
  onSuccess,
  onError
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const { currentUser } = useAuth();

  const handleDownloadPDF = async () => {
    if (!firestoreId) {
      const error = "No Firestore document ID provided";
      console.error('❌', error);
      onError?.(error);
      return;
    }

    if (!currentUser) {
      const error = "User not authenticated";
      console.error('❌', error);
      onError?.(error);
      return;
    }

    try {
      setIsGenerating(true);



      // Smart backend URL detection with fallbacks
      const isProduction = window.location.hostname !== 'localhost';
      const currentProtocol = window.location.protocol;
      const currentHostname = window.location.hostname;
      
      // Environment variable configuration
      const envApiUrl = import.meta.env.VITE_API_BASE_URL;
      const envFrontendUrl = import.meta.env.VITE_FRONTEND_URL;
      

      
      let backendUrls: string[] = [];
      
      if (envApiUrl && envApiUrl !== 'https://your-backend-domain.com') {
        // Use environment variable if set and not placeholder
        backendUrls.push(envApiUrl);
      } else if (isProduction) {
        // Production fallbacks in order of preference
        backendUrls = [
          `${currentProtocol}//${currentHostname}`,           // Same domain, backend will handle /api routing
          `${currentProtocol}//${currentHostname}:3001`,      // Same domain with port 3001
          `https://api.${currentHostname}`,                   // Subdomain approach
          `http://${currentHostname}:3001`                    // HTTP fallback (less secure)
        ];
      } else {
        // Local development
        backendUrls = ['http://localhost:3001'];
      }

      const frontendUrl = (envFrontendUrl && envFrontendUrl !== 'https://your-frontend-domain.com') 
        ? envFrontendUrl 
        : (isProduction ? `${currentProtocol}//${currentHostname}` : 'http://localhost:5173');
      


      // Try each backend URL until one works
      let lastError: Error | null = null;
      for (let i = 0; i < backendUrls.length; i++) {
        const backendUrl = backendUrls[i];

        
        try {
          const response = await fetch(`${backendUrl}/api/export-pdf`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              firestoreId: firestoreId, // ONLY send Firestore ID
              frontendUrl: frontendUrl,
              waitSelector: '#bulletin-template',
              waitForImages: true, // Wait for all images including QR codes
              pdfOptions: {
                format: 'A4',
                printBackground: true,
                margin: {
                  top: '10mm',
                  bottom: '10mm',
                  left: '10mm',
                  right: '10mm'
                }
              }
            })
          });



          if (!response.ok) {
            const errorText = await response.text();
            console.warn(`❌ Backend ${backendUrl} failed:`, response.status, errorText);
            throw new Error(`${response.status} ${response.statusText}`);
          }

          // Success! Get the PDF blob
          const pdfBlob = await response.blob();
          
          // Create download link
          const url = window.URL.createObjectURL(pdfBlob);
          const link = document.createElement('a');
          link.href = url;
          
          // Use student name from props or fallback
          const fileName = studentName 
            ? `${studentName.replace(/\s+/g, '_')}_Report_Card.pdf`
            : 'Report_Card.pdf';
          
          link.download = fileName;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          
          // Clean up object URL
          window.URL.revokeObjectURL(url);
          

          
          // Show success feedback
          setShowSuccess(true);
          setTimeout(() => setShowSuccess(false), 3000);
          
          onSuccess?.();
          return; // Exit the loop on success
          
        } catch (fetchError) {
          lastError = fetchError instanceof Error ? fetchError : new Error(String(fetchError));
          console.warn(`❌ Failed to connect to ${backendUrl}:`, lastError.message);
          
          // If this is the last URL to try, we'll throw the error below
          if (i === backendUrls.length - 1) {
            console.error('❌ All backend URLs failed');
          }
        }
      }

      // If we get here, all backend URLs failed
      throw lastError || new Error('All backend URLs failed to respond');
      
    } catch (error) {
      console.error('❌ PDF generation error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      onError?.(errorMessage);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={handleDownloadPDF}
        disabled={disabled || isGenerating || !firestoreId}
        className={`
          relative overflow-hidden transition-all duration-200 ease-in-out
          ${disabled || isGenerating || !firestoreId
            ? 'bg-gray-300 cursor-not-allowed text-gray-500'
            : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl'
          }
          px-6 py-3 rounded-lg font-semibold text-sm flex items-center justify-center space-x-2
          ${className}
        `}
      >
        {isGenerating ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            <span>Generating PDF...</span>
          </>
        ) : (
          <>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>Download PDF</span>
          </>
        )}
      </button>
      
      {showSuccess && (
        <div className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-3 py-1 rounded-lg text-sm whitespace-nowrap animate-fade-in">
          ✅ PDF Downloaded Successfully!
        </div>
      )}
      
      {!firestoreId && (
        <div className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-3 py-1 rounded-lg text-sm whitespace-nowrap">
          ❌ No Firestore ID available
        </div>
      )}
    </div>
  );
};

export default FirestoreOnlyPDFDownloadButton;
