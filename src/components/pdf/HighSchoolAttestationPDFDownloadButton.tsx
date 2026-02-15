// HighSchoolAttestationPDFDownloadButton.tsx
// Component for downloading high school attestation as PDF
// Unified single template with white background

import React, { useState } from 'react';

interface HighSchoolAttestationData {
  // Header - Institution (School info only)
  schoolName: string;
  schoolAddress: string;
  province: string;
  division: string;
  
  // Document
  documentTitle: string; // e.g., "Attestation de Fréquentation"
  
  // Student (CORE - Always needed)
  studentName: string;
  studentGender: 'M' | 'F';
  birthDate: string;
  birthPlace: string;
  
  // Main Content (The actual attestation text extracted from uploaded document)
  mainContent: string;
  
  // Footer
  issueLocation: string;
  issueDate: string;
  signatoryName: string;
  signatoryTitle: string;
  purpose: string; // "pour servir à qui de droit"
}

interface HighSchoolAttestationPDFDownloadButtonProps {
  data: HighSchoolAttestationData;
  documentId?: string; // Optional document ID for QR codes
  buttonText?: string;
  buttonClassName?: string;
  className?: string; // Alternative className prop
  apiUrl?: string;
  iconOnly?: boolean; // Show only icon without text
}

const HighSchoolAttestationPDFDownloadButton: React.FC<HighSchoolAttestationPDFDownloadButtonProps> = ({ 
  data,
  documentId,
  buttonText = 'Download PDF',
  buttonClassName,
  className,
  apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api',
  iconOnly = false
}) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Use className if provided, otherwise use buttonClassName
  const finalClassName = className || buttonClassName || 'bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg shadow-lg transition-all duration-300 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed';

  const handleDownloadPDF = async () => {
    setIsDownloading(true);
    setError(null);

    try {
      console.log('📤 Sending high school attestation data to backend for PDF generation');
      console.log('📊 Data being sent:', data);

      // Force local development URLs when running on localhost
      const isLocalDevelopment = window.location.hostname === 'localhost';
      const currentProtocol = window.location.protocol;
      const currentHostname = window.location.hostname;
      
      // Get environment variables
      const envApiUrl = import.meta.env.VITE_API_BASE_URL;
      const envFrontendUrl = import.meta.env.VITE_FRONTEND_URL;
      
      // Always use localhost:3001 when running on localhost
      const backendUrl = isLocalDevelopment 
        ? 'http://localhost:3001'
        : (envApiUrl || apiUrl || `${currentProtocol}//${currentHostname}`);
      
      const frontendUrl = isLocalDevelopment
        ? 'http://localhost:5173'
        : (envFrontendUrl || `${currentProtocol}//${currentHostname}`);

      console.log('✅ Generating High School Attestation PDF with document ID:', documentId);

      // Prepare the payload with formType and documentId
      const payload = {
        attestationData: {
          ...data,
          formType: 'highSchoolAttestation',
          documentId: documentId, // Include document ID for QR codes
          firestoreId: documentId,
          id: documentId
        },
        frontendUrl: frontendUrl,
        waitForImages: true,
        pdfOptions: {
          format: 'A4',
          landscape: true,
          printBackground: true,
          margin: {
            top: '8mm',
            right: '8mm',
            bottom: '8mm',
            left: '8mm'
          },
          preferCSSPageSize: true
        }
      };

      console.log('📦 Full payload:', payload);

      const response = await fetch(`${backendUrl}/api/highschool-attestation-pdf`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      console.log('📊 Response details:', {
        status: response.status,
        statusText: response.statusText,
        contentType: response.headers.get('content-type')
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ High School Attestation PDF generation failed:', errorText);
        throw new Error(`PDF generation failed: ${response.statusText}`);
      }

      // Create blob from response
      const blob = await response.blob();
      console.log('📦 Blob created:', {
        size: blob.size,
        type: blob.type
      });

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      const studentNameClean = (data.studentName || 'document').replace(/[^a-zA-Z0-9]/g, '_').toUpperCase();
      const fileName = `HIGHSCHOOL_ATTESTATION_${studentNameClean}.pdf`;
      link.setAttribute('download', fileName);
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      console.log('✅ PDF downloaded successfully:', fileName);
    } catch (err: any) {
      console.error('❌ Error downloading PDF:', err);
      
      let errorMessage = 'Failed to generate PDF. Please try again.';
      
      if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <button
        onClick={handleDownloadPDF}
        disabled={isDownloading}
        className={finalClassName}
      >
        {isDownloading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {!iconOnly && <span>Generating PDF...</span>}
          </span>
        ) : (
          <span className="flex items-center justify-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            {!iconOnly && <span>{buttonText}</span>}
          </span>
        )}
      </button>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg max-w-md text-sm">
          <div className="flex items-start gap-2">
            <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <div>
              <strong className="font-bold">Error: </strong>
              <span>{error}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HighSchoolAttestationPDFDownloadButton;
