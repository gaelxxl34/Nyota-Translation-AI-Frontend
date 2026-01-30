// Bachelor Diploma PDF Download Button
// Created specifically for testing the Bachelor Diploma template PDF conversion

import React, { useState } from 'react';

interface BachelorDiplomaData {
  // Institution info
  institutionName: string;
  institutionLocation: string;
  
  // Diploma details
  diplomaNumber: string;
  
  // Student info
  studentName: string;
  birthPlace: string;
  birthDate: string;
  
  // Academic details
  degree: string;
  specialization: string;
  orientation: string;
  gradeLevel: string;
  gradeSpecialization: string;
  option: string;
  orientationDetail: string;
  
  // Completion details
  completionDate: string;
  graduationYear: string;
  
  // Issue details
  issueLocation: string;
  issueDate: string;
  
  // Registration details
  registrationDate: string;
  registrationNumber: string;
  serialCode: string;
  examDate: string;
  registerLetter: string;
}

interface BachelorDiplomaPDFDownloadButtonProps {
  data: BachelorDiplomaData;
  documentId?: string; // Add optional document ID for QR codes
  className?: string;
  disabled?: boolean;
  iconOnly?: boolean; // Show only icon without text
}

const BachelorDiplomaPDFDownloadButton: React.FC<BachelorDiplomaPDFDownloadButtonProps> = ({ 
  data,
  documentId, // Accept document ID for QR codes
  className = '',
  disabled = false,
  iconOnly = false,
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleDownloadPDF = async () => {
    try {
      setIsGenerating(true);
      setErrorMessage(null);

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
        : (envApiUrl || `${currentProtocol}//${currentHostname}`);
      
      const frontendUrl = isLocalDevelopment
        ? 'http://localhost:5173'
        : (envFrontendUrl || `${currentProtocol}//${currentHostname}`);

      console.log('🎓 Generating Bachelor Diploma PDF with document ID:', documentId);

      // Generate PDF directly without creating a Firestore document
      const response = await fetch(`${backendUrl}/api/bachelor-diploma-pdf`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          diplomaData: { 
            ...data, 
            documentId: documentId, // Include document ID for QR codes
            firestoreId: documentId,
            id: documentId 
          },
          frontendUrl: frontendUrl,
          waitForImages: true, // Wait for QR codes to load
          pdfOptions: {
            format: 'A4',
            landscape: true,
            printBackground: true,
            margin: { top: '10mm', right: '10mm', bottom: '10mm', left: '10mm' }
          }
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Bachelor Diploma PDF generation failed:', errorText);
        throw new Error(`PDF generation failed: ${response.statusText}`);
      }

      // Convert the response to a blob and download it
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      
      const studentNameClean = data.studentName.replace(/\s+/g, '_').toUpperCase();
      link.href = url;
      link.download = `BACHELOR_DIPLOMA_${studentNameClean}.pdf`;
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      console.log('✅ Bachelor Diploma PDF downloaded successfully');
      setIsGenerating(false);

    } catch (error) {
      console.error('❌ Error generating Bachelor Diploma PDF:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Unknown error occurred');
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-col items-center">
      <button
        onClick={handleDownloadPDF}
        disabled={disabled || isGenerating}
        className={`px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors ${
          disabled || isGenerating ? 'opacity-50 cursor-not-allowed' : ''
        } ${className}`}
      >
        <div className="flex items-center justify-center">
          {isGenerating ? (
            <>
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {!iconOnly && <span className="ml-2">Generating PDF...</span>}
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              {!iconOnly && <span className="ml-2">Download PDF</span>}
            </>
          )}
        </div>
      </button>
      {errorMessage && (
        <p className="mt-2 text-sm text-red-600">{errorMessage}</p>
      )}
    </div>
  );
};

export default BachelorDiplomaPDFDownloadButton;
