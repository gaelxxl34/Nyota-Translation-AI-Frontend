// HighSchoolAttestationTestPage.tsx
// Test page for High School Attestation template
// Single unified template with white background - content based on uploaded document

import React, { useState } from 'react';
import HighSchoolAttestationTemplate from './HighSchoolAttestationTemplate';
import type { HighSchoolAttestationData } from './HighSchoolAttestationTemplate';
import HighSchoolAttestationPDFDownloadButton from './HighSchoolAttestationPDFDownloadButton';

const HighSchoolAttestationTestPage: React.FC = () => {
  // Sample data for unified attestation template
  const sampleData: HighSchoolAttestationData = {
    schoolName: "INSTITUT MALKIA WA MBINGU",
    schoolAddress: "QUARTIER DE L'EVECHE, Cellule: LONDO, N° 395, Commune: BULENGERA",
    province: "PROVINCE DU NORD-KIVU",
    division: "SOUS-DIVISION URBAINE DE BUTEMBO 1",
    documentTitle: "School Attendance Certificate", // In English, editable
    studentName: "MASIKA VYASOYA MIRABELLE",
    studentGender: "F",
    birthPlace: "BUTEMBO",
    birthDate: "October 2, 2003",
    mainContent: "I, the undersigned, Sister KATSUVA MATANDIKO Agnès, Dean of Studies at INSTITUT MALKIA WA MBINGU, hereby certify that the student: MASIKA VYASOYA MIRABELLE born in: BUTEMBO, on October 2, 2003 attended classes at our school and was regularly enrolled in 4th year of Commercial and Management Humanities (formerly 6th year COGE) during the 2020 - 2021 academic year and passed the national examinations with 56%. She has been our student since the 2015-2016 academic year in first year.",
    purpose: "This document is issued for official purposes.",
    issueLocation: "Butembo",
    issueDate: "October 25, 2021",
    signatoryName: "Sr. KATSUVA MATANDIKO Agnès",
    signatoryTitle: "Dean of Studies"
  };

  const [attestationData, setAttestationData] = useState<HighSchoolAttestationData>(sampleData);
  const [documentId, setDocumentId] = useState<string>('HS-TEST-' + Date.now());

  const handleDataChange = (updatedData: HighSchoolAttestationData) => {
    setAttestationData(updatedData);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Attestation Test Page
          </h1>
          <p className="text-gray-600">
            Test and preview attestation template with white background - content based on uploaded document
          </p>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Template Settings</h2>
          
          <div className="space-y-4">
            {/* Document ID */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Document ID (for QR Code)
              </label>
              <input
                type="text"
                value={documentId}
                onChange={(e) => setDocumentId(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter document ID"
              />
            </div>

            {/* Download Button */}
            <div className="pt-4">
              <HighSchoolAttestationPDFDownloadButton
                data={attestationData}
                buttonText="Download as PDF"
              />
            </div>
          </div>
        </div>

        {/* Template Preview */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-800">
              Template Preview
            </h2>
          </div>
          
          <div className="border-2 border-gray-300 rounded-lg overflow-hidden">
            <HighSchoolAttestationTemplate
              data={attestationData}
              documentId={documentId}
              isEditable={true}
              onDataChange={handleDataChange}
            />
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 mt-6 rounded-lg">
          <div className="flex items-start">
            <svg className="w-6 h-6 text-yellow-600 mr-3 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <div>
              <h3 className="font-bold text-yellow-800 mb-2">Instructions:</h3>
              <ul className="list-disc list-inside text-yellow-700 space-y-1 text-sm">
                <li>Click on any field in the template to edit it</li>
                <li>The content is based on what you upload as an image</li>
                <li>Click "Download as PDF" to generate a PDF version of the attestation</li>
                <li>The QR code will be included in the PDF for document verification</li>
                <li>Template supports landscape A4 format with white background</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HighSchoolAttestationTestPage;
