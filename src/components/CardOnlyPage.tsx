// Card-Only Page for PDF Generation
// This page renders only the bulletin template for Puppeteer to capture

import React, { useEffect, useState } from 'react';
import Form4Template from './Form4Template';
import Form6Template from './Form6Template';
import StateDiplomaTemplate from './StateDiplomaTemplate';

const CardOnlyPage: React.FC = () => {
  const [studentData, setStudentData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for data in window object (injected by Puppeteer)
    const checkForData = () => {
      if (window.studentData) {
        setStudentData(window.studentData);
        setIsLoading(false);
        return true;
      }

      if (window.injectedStudentData) {
        setStudentData(window.injectedStudentData);
        setIsLoading(false);
        return true;
      }

      return false;
    };

    // Check immediately
    if (!checkForData()) {
      // If no data found, listen for the custom event
      const handleStudentDataLoaded = (event: CustomEvent) => {
        setStudentData(event.detail);
        setIsLoading(false);
      };

      window.addEventListener('studentDataLoaded', handleStudentDataLoaded as EventListener);

      // Also check periodically for 10 seconds
      let attempts = 0;
      const maxAttempts = 20; // 10 seconds with 500ms intervals
      const interval = setInterval(() => {
        attempts++;
        
        if (checkForData() || attempts >= maxAttempts) {
          clearInterval(interval);
          if (attempts >= maxAttempts && !studentData) {
            setIsLoading(false);
          }
        }
      }, 500);

      // Cleanup
      return () => {
        window.removeEventListener('studentDataLoaded', handleStudentDataLoaded as EventListener);
        clearInterval(interval);
      };
    }
  }, []);

  if (isLoading) {
    return (
      <div id="bulletin-template" className="min-h-screen bg-white flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading bulletin template...</p>
        </div>
      </div>
    );
  }

  if (!studentData) {
    return (
      <div id="bulletin-template" className="min-h-screen bg-white flex items-center justify-center p-8">
        <div className="text-center">
          <p className="text-red-600 text-lg font-medium">No student data available</p>
          <p className="text-gray-600 mt-2">Unable to load bulletin template</p>
        </div>
      </div>
    );
  }

  // Determine which template to render based on formType
  const formType = studentData.formType || 'form6';

  const renderTemplate = () => {
    switch (formType) {
      case 'form4':
        return (
          <Form4Template 
            data={studentData} 
            isEditable={false}
            onDataChange={() => {}} // No-op for PDF generation
          />
        );
      case 'form6':
        return (
          <Form6Template 
            data={studentData} 
            isEditable={false}
            onDataChange={() => {}} // No-op for PDF generation
          />
        );
      case 'stateDiploma':
        return (
          <StateDiplomaTemplate 
            data={studentData} 
            isEditable={false}
            onDataChange={() => {}} // No-op for PDF generation
          />
        );      default:
        return (
          <Form6Template 
            data={studentData} 
            isEditable={false}
            onDataChange={() => {}} // No-op for PDF generation
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div id="bulletin-template" data-testid="bulletin-template" className="bulletin-container">
        {renderTemplate()}
      </div>
    </div>
  );
};

// Extend window interface for TypeScript
declare global {
  interface Window {
    studentData?: any;
    injectedStudentData?: any;
  }
}

export default CardOnlyPage;
