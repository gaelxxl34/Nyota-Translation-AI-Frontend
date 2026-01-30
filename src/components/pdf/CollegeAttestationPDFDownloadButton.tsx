// College Attestation PDF Download Button
// Created for testing the College Attestation Certificate template PDF conversion

import React, { useState } from 'react';

interface CollegeAttestationData {
  country: string;
  institutionType: string;
  institutionName: string;
  institutionAbbreviation: string;
  institutionEmail: string;
  institutionWebsite: string;
  departmentName: string;
  documentTitle: string;
  documentNumber: string;
  signatoryTitle: string;
  signatoryName: string;
  signatoryPosition: string;
  studentName: string;
  studentGender: string;
  birthPlace: string;
  birthDate: string;
  matricule: string;
  enrollmentStatus: string;
  section: string;
  option: string;
  institutionLocation: string;
  academicYear: string;
  yearLevel: string;
  performance: string;
  percentage: string;
  session: string;
  purpose: string;
  issueLocation: string;
  issueDate: string;
  secretaryTitle: string;
  chiefTitle: string;
  chiefName: string;
  chiefPosition: string;
}

interface CollegeAttestationPDFDownloadButtonProps {
  data: CollegeAttestationData;
  documentId?: string;
  className?: string;
  iconOnly?: boolean; // Show only icon without text
}

const CollegeAttestationPDFDownloadButton: React.FC<CollegeAttestationPDFDownloadButtonProps> = ({ 
  data, 
  documentId = '',
  className = '',
  iconOnly = false
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const generatePDF = async () => {
    setIsGenerating(true);
    setErrorMessage(null);

    try {
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

      console.log('📄 Generating College Attestation PDF with document ID:', documentId);

      // Prepare the attestation data
      const attestationData = {
        ...data,
        formType: 'collegeAttestation',
        documentId: documentId || `ATTESTATION-${Date.now()}`,
        firestoreId: documentId || `ATTESTATION-${Date.now()}`,
        id: documentId || `ATTESTATION-${Date.now()}`,
      };

      // Send request to backend
      const response = await fetch(`${backendUrl}/api/college-attestation-pdf`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          attestationData: attestationData,
          frontendUrl: frontendUrl,
          waitForImages: true,
          pdfOptions: {
            format: 'A4',
            landscape: false, // Portrait orientation
            printBackground: true,
            margin: { 
              top: '5mm', 
              right: '5mm', 
              bottom: '5mm', 
              left: '5mm' 
            },
          },
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ College Attestation PDF generation failed:', errorText);
        throw new Error(`PDF generation failed: ${response.statusText}`);
      }

      // Get the PDF blob
      const blob = await response.blob();
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      
      // Generate filename from student name
      const studentNameClean = data.studentName.replace(/[^a-zA-Z0-9]/g, '_').toUpperCase();
      link.href = url;
      link.download = `COLLEGE_ATTESTATION_${studentNameClean}.pdf`;
      
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      console.log('✅ College Attestation PDF downloaded successfully');
      setIsGenerating(false);

    } catch (error) {
      console.error('❌ Error generating College Attestation PDF:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Unknown error occurred');
      setIsGenerating(false);
    }
  };

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <button
        onClick={generatePDF}
        disabled={isGenerating}
        className={`
          px-6 py-3 rounded-lg font-semibold text-white
          transition-all duration-200 shadow-lg
          ${isGenerating 
            ? 'bg-gray-400 cursor-not-allowed' 
            : 'bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 hover:shadow-xl'
          }
        `}
      >
        {isGenerating ? (
          <div className="flex items-center justify-center">
            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {!iconOnly && <span className="ml-2">Generating PDF...</span>}
          </div>
        ) : (
          <div className="flex items-center justify-center">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            {!iconOnly && <span className="ml-2">Download Attestation PDF</span>}
          </div>
        )}
      </button>
      {errorMessage && (
        <p className="mt-2 text-sm text-red-600">{errorMessage}</p>
      )}
    </div>
  );
};

export default CollegeAttestationPDFDownloadButton;
