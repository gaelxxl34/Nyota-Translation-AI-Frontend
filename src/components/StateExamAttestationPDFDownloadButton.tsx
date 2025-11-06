import React, { useState } from 'react';
import { type StateExamAttestationData } from './StateExamAttestationTemplate';

interface StateExamAttestationPDFDownloadButtonProps {
  data: StateExamAttestationData;
  documentId?: string;
  className?: string;
}

const StateExamAttestationPDFDownloadButton: React.FC<StateExamAttestationPDFDownloadButtonProps> = ({
  data,
  documentId,
  className = ''
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDownloadPDF = async () => {
    setIsGenerating(true);
    setError(null);

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

      // Send request to backend to generate PDF
      const response = await fetch(`${backendUrl}/api/state-exam-attestation-pdf`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data,
          documentId: documentId || 'ATTESTATION-' + Date.now(),
          frontendUrl: frontendUrl,
          waitForImages: true, // Wait for QR codes to load
          pdfOptions: {
            format: 'A4',
            landscape: true,
            printBackground: true,
            margin: { 
              top: '8mm', 
              right: '8mm', 
              bottom: '12mm', 
              left: '8mm' 
            }
          }
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate PDF');
      }

      // Get the PDF blob
      const blob = await response.blob();

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `State_Exam_Attestation_${data.studentName.replace(/\s+/g, '_')}_${Date.now()}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      console.log('✅ State Exam Attestation PDF downloaded successfully');
    } catch (err) {
      console.error('❌ Error generating PDF:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate PDF');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={handleDownloadPDF}
        disabled={isGenerating}
        className={`px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 ${className}`}
      >
        {isGenerating ? (
          <>
            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Generating PDF...</span>
          </>
        ) : (
          <>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>Download Attestation PDF</span>
          </>
        )}
      </button>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StateExamAttestationPDFDownloadButton;
