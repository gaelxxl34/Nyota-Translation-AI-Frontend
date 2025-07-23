// State Diploma PDF Download Button
// Created specifically for testing the State Diploma template PDF conversion

import React, { useState } from 'react';

interface DiplomaData {
  studentName: string;
  gender: 'male' | 'female' | string;
  birthPlace: string;
  birthDate: {
    day: string;
    month: string;
    year: string;
  };
  examSession: string;
  percentage: string;
  percentageText: string;
  section: string;
  option: string;
  issueDate: string;
  referenceNumber: string;
  serialNumbers: string[];
  serialCode: string;
}

interface StateDiplomaPDFDownloadButtonProps {
  data: DiplomaData;
  documentId?: string; // Add optional document ID for QR codes
  className?: string;
  disabled?: boolean;
}

const StateDiplomaPDFDownloadButton: React.FC<StateDiplomaPDFDownloadButtonProps> = ({ 
  data,
  documentId, // Accept document ID for QR codes
  className = '',
  disabled = false,
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

      // Generate PDF directly without creating a Firestore document
      const response = await fetch(`${backendUrl}/api/state-diploma-pdf`, {
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
        throw new Error(`PDF generation failed: ${response.statusText}`);
      }

      // Convert the response to a blob and download it
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      
      const studentNameClean = data.studentName.replace(/\s+/g, '_').toUpperCase();
      link.href = url;
      link.download = `STATE_DIPLOMA_${studentNameClean}.pdf`;
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      setIsGenerating(false);

    } catch (error) {
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
          isGenerating ? 'opacity-75 cursor-not-allowed' : ''
        } ${className}`}
      >
        {isGenerating ? (
          <span className="flex items-center">
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Generating PDF...
          </span>
        ) : (
          <span className="flex items-center">
            <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download State Diploma PDF
          </span>
        )}
      </button>
      
      {errorMessage && (
        <div className="mt-2 text-red-600 text-sm">
          Error: {errorMessage}
        </div>
      )}
    </div>
  );
};

export default StateDiplomaPDFDownloadButton;
