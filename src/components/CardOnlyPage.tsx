// Card-Only Page Component
// Displays the correct bulletin template (Form 4 or Form 6) for PDF generation via Puppeteer

import React, { useEffect, useState } from 'react';
import Form4Template from './Form4Template';
import Form6Template from './Form6Template';
import { sampleBulletinData } from '../utils/sampleData';

// Use the same interface as Form6Template expects
interface BulletinData {
  // Form type selection
  formType?: 'form4' | 'form6';
  
  // Student Information
  province?: string;
  city?: string;
  municipality?: string;
  school?: string;
  schoolCode?: string;
  studentName?: string;
  gender?: string;
  birthPlace?: string;
  birthDate?: string;
  class?: string;
  permanentNumber?: string;
  idNumber?: string;
  academicYear?: string;
  
  // Grades
  subjects?: Array<{
    subject: string;
    firstSemester: {
      period1: number | string;
      period2: number | string;
      exam: number | string;
      total: number | string;
    };
    secondSemester: {
      period3: number | string;
      period4: number | string;
      exam: number | string;
      total: number | string;
    };
    overallTotal: number | string;
    maxima?: {
      periodMaxima: number;
      examMaxima: number;
      totalMaxima: number;
    };
    nationalExam?: {
      marks: number | string;
      max: number | string;
    };
  }>;
  
  // Summary
  firstSemesterTotal?: number | string;
  secondSemesterTotal?: number | string;
  overallTotal?: number | string;
  rank?: number | string;
  outOf?: number | string;
  
  // Attendance
  totalDays?: number | string;
  daysPresent?: number | string;
  
  // Comments
  conduct?: string;
  generalObservations?: string;
  decision?: string;
  
  // Teachers
  classMaster?: string;
  headMaster?: string;
  
  // Date
  date?: string;
}

const CardOnlyPage: React.FC = () => {
  const [studentData, setStudentData] = useState<BulletinData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Priority 1: Check for pre-injected data (from Puppeteer)
    const checkInjectedData = () => {
      const dataToUse = (window as any).studentData || (window as any).injectedStudentData;
      
      if (dataToUse) {
        // Data validation and normalization
        let normalizedData: any = dataToUse;
        const anyData = dataToUse as any;
        
        // Handle different data structures from OpenAI processing
        if (anyData.success && anyData.data) {
          normalizedData = anyData.data;
        } else if (anyData.translatedData) {
          normalizedData = anyData.translatedData;
        } else if (anyData.extractedData) {
          normalizedData = anyData.extractedData;
        } else if (anyData.processing) {
          normalizedData = anyData.processing;
          
          if (normalizedData.data) {
            normalizedData = normalizedData.data;
          } else if (normalizedData.translatedData) {
            normalizedData = normalizedData.translatedData;
          } else if (normalizedData.extractedData) {
            normalizedData = normalizedData.extractedData;
          }
        }
        
        // Check if we have minimum required data
        const hasMinimumData = normalizedData.studentName && normalizedData.subjects && normalizedData.subjects.length > 0;
        
        if (!hasMinimumData) {
          setStudentData(sampleBulletinData);
        } else {
          // Ensure formType is present with backward compatibility
          const dataWithFormType = {
            ...normalizedData,
            formType: normalizedData.formType || 'form6' // Default to form6 for backward compatibility
          } as BulletinData;
          setStudentData(dataWithFormType);
        }
        setIsLoading(false);
        return true;
      }
      return false;
    };
    
    // Priority 2: Check localStorage for saved OpenAI data
    const checkLocalStorage = () => {
      const latestDataKey = localStorage.getItem('latest_bulletin_data');
      
      if (latestDataKey) {
        const savedData = localStorage.getItem(latestDataKey);
        
        if (savedData) {
          try {
            const parsedData = JSON.parse(savedData);
            setStudentData(parsedData.data);
            setIsLoading(false);
            return true;
          } catch (error) {
            console.error('Failed to parse localStorage data:', error);
          }
        }
      }
      return false;
    };
    
    // Priority 3: Check URL parameters for data ID
    const checkURLParams = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const dataId = urlParams.get('dataId');
      
      if (dataId) {
        const savedData = localStorage.getItem(dataId);
        
        if (savedData) {
          try {
            const parsedData = JSON.parse(savedData);
            setStudentData(parsedData.data);
            setIsLoading(false);
            return true;
          } catch (error) {
            console.error('Failed to parse URL data:', error);
          }
        }
      }
      return false;
    };
    
    // Try injected data first (most reliable for PDF generation)
    if (checkInjectedData()) {
      return;
    }
    
    // Try localStorage second
    if (checkLocalStorage()) {
      return;
    }
    
    // Try URL parameters third
    if (checkURLParams()) {
      return;
    }

    // Listen for student data from Puppeteer injection
    const handleStudentDataLoaded = (event: CustomEvent) => {
      setStudentData(event.detail);
      setIsLoading(false);
    };

    // Periodically check for injected data (for Puppeteer)
    const checkForInjectedData = setInterval(() => {
      if (((window as any).studentData || (window as any).injectedStudentData) && !studentData) {
        if (checkInjectedData()) {
          clearInterval(checkForInjectedData);
        }
      }
    }, 200); // Check more frequently

    // Listen for custom events from Puppeteer
    window.addEventListener('studentDataLoaded', handleStudentDataLoaded as EventListener);

    // Final fallback to sample data after a timeout
    const fallbackTimeout = setTimeout(() => {
      if (isLoading) {
        setStudentData(sampleBulletinData);
        setIsLoading(false);
      }
    }, 5000); // 5 second timeout

    return () => {
      clearInterval(checkForInjectedData);
      clearTimeout(fallbackTimeout);
      window.removeEventListener('studentDataLoaded', handleStudentDataLoaded as EventListener);
    };
  }, [isLoading, studentData]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading bulletin template...</p>
        </div>
      </div>
    );
  }

  if (!studentData) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center text-red-600">
          <p>❌ No student data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Container for the bulletin - this will be isolated by Puppeteer */}
      <div className="bulletin-container w-full min-h-screen flex items-center justify-center p-4">
        {(() => {
          const formType = studentData.formType || 'form6';
          console.log(`🎯 CardOnlyPage: Rendering template for formType: ${formType}`);
          
          if (formType === 'form4') {
            console.log('📄 Using Form4Template');
            return (
              <Form4Template 
                data={studentData}
                className="shadow-none border-none"
              />
            );
          } else {
            console.log('📄 Using Form6Template (default)');
            return (
              <Form6Template 
                data={studentData}
                className="shadow-none border-none"
              />
            );
          }
        })()}
      </div>
    </div>
  );
};

// Extend Window interface to include studentData
declare global {
  interface Window {
    studentData?: BulletinData;
    injectedStudentData?: BulletinData;
  }
}

export default CardOnlyPage;
