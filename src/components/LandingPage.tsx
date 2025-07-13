// Landing Page Component for NTC
// Visually stunning hero section that brands "Nyota Translation Center"

import React, { useState } from 'react';
import Form6Template from './Form6Template';
import Form4Template from './Form4Template';

interface LandingPageProps {
  onNavigate: (page: 'landing' | 'login' | 'register' | 'dashboard') => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  const [showTemplatePreview, setShowTemplatePreview] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState<'form4' | 'form6'>('form6');
  const [showWithData, setShowWithData] = useState(true);

  // Sample data for Form 6 template
  const sampleDataForm6 = {
    province: 'Kinshasa',
    city: 'Kinshasa',
    municipality: 'Gombe',
    school: 'COLLEGE NOTRE DAME AU CONGO',
    schoolCode: '12345678',
    studentName: 'ONGORIKO BINANI GABI',
    gender: 'M',
    birthPlace: 'Kinshasa',
    birthDate: '15/03/2005',
    class: '6th Human Sciences',
    permanentNumber: '87654321',
    idNumber: '123456789012345678',
    academicYear: '2023-2024',
    subjects: [
      // High maxima subjects (40/80/160) - Science subjects
      {
        subject: 'Mathematics',
        firstSemester: { period1: '36', period2: '34', exam: '72', total: '142' },
        secondSemester: { period3: '38', period4: '36', exam: '76', total: '150' },
        overallTotal: '292',
        maxima: { periodMaxima: 40, examMaxima: 80, totalMaxima: 160 },
        nationalExam: { marks: '85', max: '100' }
      },
      {
        subject: 'Physics',
        firstSemester: { period1: '32', period2: '30', exam: '68', total: '130' },
        secondSemester: { period3: '34', period4: '32', exam: '70', total: '136' },
        overallTotal: '266',
        maxima: { periodMaxima: 40, examMaxima: 80, totalMaxima: 160 },
        nationalExam: { marks: '72', max: '100' }
      },
      {
        subject: 'Chemistry',
        firstSemester: { period1: '28', period2: '30', exam: '64', total: '122' },
        secondSemester: { period3: '30', period4: '28', exam: '66', total: '124' },
        overallTotal: '246',
        maxima: { periodMaxima: 40, examMaxima: 80, totalMaxima: 160 },
        nationalExam: { marks: '68', max: '100' }
      },
      {
        subject: 'Biology',
        firstSemester: { period1: '30', period2: '32', exam: '66', total: '128' },
        secondSemester: { period3: '32', period4: '30', exam: '68', total: '130' },
        overallTotal: '258',
        maxima: { periodMaxima: 40, examMaxima: 80, totalMaxima: 160 },
        nationalExam: { marks: '74', max: '100' }
      },
      // Medium maxima subjects (20/40/80) - Languages and Humanities
      {
        subject: 'French Language',
        firstSemester: { period1: '16', period2: '17', exam: '36', total: '69' },
        secondSemester: { period3: '17', period4: '16', exam: '38', total: '71' },
        overallTotal: '140',
        maxima: { periodMaxima: 20, examMaxima: 40, totalMaxima: 80 },
        nationalExam: { marks: '78', max: '100' }
      },
      {
        subject: 'English',
        firstSemester: { period1: '16', period2: '17', exam: '34', total: '67' },
        secondSemester: { period3: '17', period4: '16', exam: '36', total: '69' },
        overallTotal: '136',
        maxima: { periodMaxima: 20, examMaxima: 40, totalMaxima: 80 },
        nationalExam: { marks: '75', max: '100' }
      },
      {
        subject: 'History',
        firstSemester: { period1: '15', period2: '16', exam: '32', total: '63' },
        secondSemester: { period3: '16', period4: '15', exam: '34', total: '65' },
        overallTotal: '128',
        maxima: { periodMaxima: 20, examMaxima: 40, totalMaxima: 80 },
        nationalExam: { marks: '62', max: '100' }
      },
      {
        subject: 'Geography',
        firstSemester: { period1: '14', period2: '15', exam: '30', total: '59' },
        secondSemester: { period3: '15', period4: '14', exam: '32', total: '61' },
        overallTotal: '120',
        maxima: { periodMaxima: 20, examMaxima: 40, totalMaxima: 80 },
        nationalExam: { marks: '70', max: '100' }
      },
      {
        subject: 'Philosophy',
        firstSemester: { period1: '15', period2: '16', exam: '32', total: '63' },
        secondSemester: { period3: '16', period4: '15', exam: '34', total: '65' },
        overallTotal: '128',
        maxima: { periodMaxima: 20, examMaxima: 40, totalMaxima: 80 },
        nationalExam: { marks: '73', max: '100' }
      },
      {
        subject: 'Economics',
        firstSemester: { period1: '17', period2: '18', exam: '35', total: '70' },
        secondSemester: { period3: '18', period4: '17', exam: '37', total: '72' },
        overallTotal: '142',
        maxima: { periodMaxima: 20, examMaxima: 40, totalMaxima: 80 },
        nationalExam: { marks: '76', max: '100' }
      },
      {
        subject: 'Literature',
        firstSemester: { period1: '16', period2: '15', exam: '33', total: '64' },
        secondSemester: { period3: '15', period4: '16', exam: '35', total: '66' },
        overallTotal: '130',
        maxima: { periodMaxima: 20, examMaxima: 40, totalMaxima: 80 },
        nationalExam: { marks: '69', max: '100' }
      },
      {
        subject: 'Civics and Moral Education',
        firstSemester: { period1: '17', period2: '18', exam: '36', total: '71' },
        secondSemester: { period3: '18', period4: '17', exam: '38', total: '73' },
        overallTotal: '144',
        maxima: { periodMaxima: 20, examMaxima: 40, totalMaxima: 80 },
        nationalExam: { marks: '80', max: '100' }
      },
      // Low maxima subjects (10/20/40) - Electives and Skills
      {
        subject: 'Religious Education',
        firstSemester: { period1: '8', period2: '9', exam: '18', total: '35' },
        secondSemester: { period3: '9', period4: '8', exam: '19', total: '36' },
        overallTotal: '71',
        maxima: { periodMaxima: 10, examMaxima: 20, totalMaxima: 40 },
        nationalExam: { marks: '85', max: '100' }
      },
      {
        subject: 'Computer Studies',
        firstSemester: { period1: '7', period2: '8', exam: '16', total: '31' },
        secondSemester: { period3: '8', period4: '7', exam: '17', total: '32' },
        overallTotal: '63',
        maxima: { periodMaxima: 10, examMaxima: 20, totalMaxima: 40 },
        nationalExam: { marks: '78', max: '100' }
      },
      {
        subject: 'Physical Education',
        firstSemester: { period1: '9', period2: '8', exam: '19', total: '36' },
        secondSemester: { period3: '8', period4: '9', exam: '18', total: '35' },
        overallTotal: '71',
        maxima: { periodMaxima: 10, examMaxima: 20, totalMaxima: 40 },
        nationalExam: { marks: '88', max: '100' }
      },
      {
        subject: 'Art and Design',
        firstSemester: { period1: '8', period2: '7', exam: '17', total: '32' },
        secondSemester: { period3: '7', period4: '8', exam: '18', total: '33' },
        overallTotal: '65',
        maxima: { periodMaxima: 10, examMaxima: 20, totalMaxima: 40 },
        nationalExam: { marks: '82', max: '100' }
      },
      {
        subject: 'Music',
        firstSemester: { period1: '9', period2: '8', exam: '18', total: '35' },
        secondSemester: { period3: '8', period4: '9', exam: '19', total: '36' },
        overallTotal: '71',
        maxima: { periodMaxima: 10, examMaxima: 20, totalMaxima: 40 },
        nationalExam: { marks: '90', max: '100' }
      }
    ],
    totalMarksOutOf: { firstSemester: '200', secondSemester: '200' },
    totalMarksObtained: { firstSemester: '152', secondSemester: '158' },
    percentage: { firstSemester: '76%', secondSemester: '79%' },
    position: '5',
    totalStudents: '30',
    application: 'E',
    behaviour: 'Good',
    finalResultPercentage: '77.5',
    isPromoted: true,
    shouldRepeat: '',
    issueLocation: 'Kinshasa',
    issueDate: '25/06/2024',
    centerCode: '12345',
    verifierName: 'Prof. MUKENDI KALALA Jean',
    endorsementDate: '30/06/2024'
  };

  // Sample data for Form 4 template
  const sampleDataForm4 = {
    province: 'Kinshasa',
    city: 'Kinshasa',
    municipality: 'Gombe',
    school: 'COLLEGE NOTRE DAME AU CONGO',
    schoolCode: '12345678',
    studentName: 'ONGORIKO BINANI GABI',
    gender: 'M',
    birthPlace: 'Kinshasa',
    birthDate: '15/03/2007',
    class: '4th Sciences',
    permanentNumber: '87654321',
    idNumber: '123456789012345678',
    academicYear: '2023-2024',
    subjects: [
      // High maxima subjects (40/80/160) - Science subjects
      {
        subject: 'Mathematics',
        firstSemester: { period1: '34', period2: '32', exam: '68', total: '134' },
        secondSemester: { period3: '36', period4: '34', exam: '72', total: '142' },
        overallTotal: '276',
        maxima: { periodMaxima: 40, examMaxima: 80, totalMaxima: 160 },
        secondSitting: { marks: '82', max: '100' }
      },
      {
        subject: 'Physics',
        firstSemester: { period1: '30', period2: '28', exam: '64', total: '122' },
        secondSemester: { period3: '32', period4: '30', exam: '66', total: '128' },
        overallTotal: '250',
        maxima: { periodMaxima: 40, examMaxima: 80, totalMaxima: 160 },
        secondSitting: { marks: '70', max: '100' }
      },
      {
        subject: 'Chemistry',
        firstSemester: { period1: '26', period2: '28', exam: '60', total: '114' },
        secondSemester: { period3: '28', period4: '26', exam: '62', total: '116' },
        overallTotal: '230',
        maxima: { periodMaxima: 40, examMaxima: 80, totalMaxima: 160 },
        secondSitting: { marks: '65', max: '100' }
      },
      {
        subject: 'Biology',
        firstSemester: { period1: '28', period2: '30', exam: '62', total: '120' },
        secondSemester: { period3: '30', period4: '28', exam: '64', total: '122' },
        overallTotal: '242',
        maxima: { periodMaxima: 40, examMaxima: 80, totalMaxima: 160 },
        secondSitting: { marks: '68', max: '100' }
      },
      // Medium maxima subjects (20/40/80) - Languages and Humanities
      {
        subject: 'French Language',
        firstSemester: { period1: '15', period2: '16', exam: '34', total: '65' },
        secondSemester: { period3: '16', period4: '15', exam: '36', total: '67' },
        overallTotal: '132',
        maxima: { periodMaxima: 20, examMaxima: 40, totalMaxima: 80 },
        secondSitting: { marks: '75', max: '100' }
      },
      {
        subject: 'English',
        firstSemester: { period1: '15', period2: '16', exam: '32', total: '63' },
        secondSemester: { period3: '16', period4: '15', exam: '34', total: '65' },
        overallTotal: '128',
        maxima: { periodMaxima: 20, examMaxima: 40, totalMaxima: 80 },
        secondSitting: { marks: '72', max: '100' }
      },
      {
        subject: 'History',
        firstSemester: { period1: '14', period2: '15', exam: '30', total: '59' },
        secondSemester: { period3: '15', period4: '14', exam: '32', total: '61' },
        overallTotal: '120',
        maxima: { periodMaxima: 20, examMaxima: 40, totalMaxima: 80 },
        secondSitting: { marks: '60', max: '100' }
      },
      {
        subject: 'Geography',
        firstSemester: { period1: '13', period2: '14', exam: '28', total: '55' },
        secondSemester: { period3: '14', period4: '13', exam: '30', total: '57' },
        overallTotal: '112',
        maxima: { periodMaxima: 20, examMaxima: 40, totalMaxima: 80 },
        secondSitting: { marks: '67', max: '100' }
      },
      {
        subject: 'Literature',
        firstSemester: { period1: '14', period2: '15', exam: '31', total: '60' },
        secondSemester: { period3: '15', period4: '14', exam: '33', total: '62' },
        overallTotal: '122',
        maxima: { periodMaxima: 20, examMaxima: 40, totalMaxima: 80 },
        secondSitting: { marks: '66', max: '100' }
      },
      {
        subject: 'Philosophy',
        firstSemester: { period1: '16', period2: '15', exam: '33', total: '64' },
        secondSemester: { period3: '15', period4: '16', exam: '35', total: '66' },
        overallTotal: '130',
        maxima: { periodMaxima: 20, examMaxima: 40, totalMaxima: 80 },
        secondSitting: { marks: '71', max: '100' }
      },
      {
        subject: 'Civics and Moral Education',
        firstSemester: { period1: '16', period2: '17', exam: '35', total: '68' },
        secondSemester: { period3: '17', period4: '16', exam: '37', total: '70' },
        overallTotal: '138',
        maxima: { periodMaxima: 20, examMaxima: 40, totalMaxima: 80 },
        secondSitting: { marks: '78', max: '100' }
      },
      // Low maxima subjects (10/20/40) - Electives and Skills
      {
        subject: 'Religious Education',
        firstSemester: { period1: '7', period2: '8', exam: '16', total: '31' },
        secondSemester: { period3: '8', period4: '7', exam: '17', total: '32' },
        overallTotal: '63',
        maxima: { periodMaxima: 10, examMaxima: 20, totalMaxima: 40 },
        secondSitting: { marks: '80', max: '100' }
      },
      {
        subject: 'Computer Studies',
        firstSemester: { period1: '6', period2: '7', exam: '15', total: '28' },
        secondSemester: { period3: '7', period4: '6', exam: '16', total: '29' },
        overallTotal: '57',
        maxima: { periodMaxima: 10, examMaxima: 20, totalMaxima: 40 },
        secondSitting: { marks: '75', max: '100' }
      },
      {
        subject: 'Physical Education',
        firstSemester: { period1: '8', period2: '9', exam: '18', total: '35' },
        secondSemester: { period3: '9', period4: '8', exam: '19', total: '36' },
        overallTotal: '71',
        maxima: { periodMaxima: 10, examMaxima: 20, totalMaxima: 40 },
        secondSitting: { marks: '87', max: '100' }
      },
      {
        subject: 'Art and Design',
        firstSemester: { period1: '7', period2: '8', exam: '16', total: '31' },
        secondSemester: { period3: '8', period4: '7', exam: '17', total: '32' },
        overallTotal: '63',
        maxima: { periodMaxima: 10, examMaxima: 20, totalMaxima: 40 },
        secondSitting: { marks: '81', max: '100' }
      },
      {
        subject: 'Music',
        firstSemester: { period1: '8', period2: '7', exam: '17', total: '32' },
        secondSemester: { period3: '7', period4: '8', exam: '18', total: '33' },
        overallTotal: '65',
        maxima: { periodMaxima: 10, examMaxima: 20, totalMaxima: 40 },
        secondSitting: { marks: '89', max: '100' }
      }
    ],
    totalMarksOutOf: { firstSemester: '180', secondSemester: '180' },
    totalMarksObtained: { firstSemester: '135', secondSemester: '142' },
    percentage: { firstSemester: '75%', secondSemester: '79%' },
    position: '3',
    totalStudents: '25',
    application: 'Very Good',
    behaviour: 'Excellent',
    finalResultPercentage: '77.0',
    isPromoted: true,
    shouldRepeat: '',
    issueLocation: 'Kinshasa',
    issueDate: '25/06/2024',
    secondSittingDate: '10/09/2024',
    centerCode: '12345',
    verifierName: 'Prof. MUKENDI KALALA Jean',
    endorsementDate: '30/06/2024'
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50">
      {/* Navigation Header */}
      <nav className="container mx-auto px-4 sm:px-6 py-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center space-x-3">
            <img
              src="/log.PNG"
              alt="Nyota Translation Center Logo"
              className="h-12 w-auto rounded-lg shadow-md"
            />
            <h1 className="text-xl font-heading font-bold text-gray-900">
              Nyota Translation Center
            </h1>
          </div>
          <div className="flex space-x-2 w-full sm:w-auto">
            <button
              onClick={() => onNavigate('login')}
              className="btn-secondary flex-1 sm:flex-none"
            >
              Login
            </button>
            <button
              onClick={() => onNavigate('register')}
              className="btn-primary flex-1 sm:flex-none"
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section - More compact on mobile */}
      <main className="container mx-auto px-4 sm:px-6 py-6 sm:py-10 lg:py-16">
        <div className="max-w-4xl mx-auto text-center">
          {/* Hero Content */}
          <div className="mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-heading font-bold text-gray-900 mb-4 sm:mb-6 leading-tight">
              Transform French
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-secondary-600">
                {' '}School Bulletins
              </span>
              <br className="hidden sm:block" />
              Into English Reports
            </h2>
            <p className="text-sm sm:text-lg lg:text-xl text-gray-600 mb-6 sm:mb-8 max-w-2xl mx-auto leading-relaxed">
              Upload your French school bulletin and get an instant, professionally
              translated English report card powered by advanced AI technology.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
              <button
                onClick={() => onNavigate('register')}
                className="btn-primary text-base sm:text-lg px-6 sm:px-8 py-2 sm:py-3"
              >
                Start Translation
              </button>
              <button
                onClick={() => onNavigate('login')}
                className="btn-secondary text-base sm:text-lg px-6 sm:px-8 py-2 sm:py-3"
              >
                Already have an account?
              </button>
            </div>
          </div>

          {/* Features Grid - More compact on mobile */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 mb-12 sm:mb-16 lg:mb-20">
            <div className="bg-white rounded-xl p-4 sm:p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="w-10 sm:w-12 h-10 sm:h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-3 sm:mb-4 mx-auto">
                <svg className="w-5 sm:w-6 h-5 sm:h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <h3 className="text-base sm:text-lg lg:text-xl font-heading font-semibold text-gray-900 mb-2">
                Easy Upload
              </h3>
              <p className="text-gray-600 text-xs sm:text-sm lg:text-base">
                Simply upload your French bulletin as an image or PDF file
              </p>
            </div>

            <div className="bg-white rounded-xl p-4 sm:p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="w-10 sm:w-12 h-10 sm:h-12 bg-secondary-100 rounded-lg flex items-center justify-center mb-3 sm:mb-4 mx-auto">
                <svg className="w-5 sm:w-6 h-5 sm:h-6 text-secondary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-base sm:text-lg lg:text-xl font-heading font-semibold text-gray-900 mb-2">
                AI-Powered Translation
              </h3>
              <p className="text-gray-600 text-xs sm:text-sm lg:text-base">
                Advanced AI extracts and translates content with high accuracy
              </p>
            </div>

            <div className="bg-white rounded-xl p-4 sm:p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="w-10 sm:w-12 h-10 sm:h-12 bg-accent-100 rounded-lg flex items-center justify-center mb-3 sm:mb-4 mx-auto">
                <svg className="w-5 sm:w-6 h-5 sm:h-6 text-accent-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-base sm:text-lg lg:text-xl font-heading font-semibold text-gray-900 mb-2">
                Professional Report
              </h3>
              <p className="text-gray-600 text-xs sm:text-sm lg:text-base">
                Get a clean, formatted English report card ready to use
              </p>
            </div>
          </div>

          {/* Template Preview Section */}
          <div>
            <div className="text-center mb-6 sm:mb-8">
              <h3 className="text-xl sm:text-2xl lg:text-3xl font-heading font-bold text-gray-900 mb-3 sm:mb-4">
                See What You'll Get
              </h3>
              <p className="text-gray-600 text-sm sm:text-base lg:text-lg max-w-2xl mx-auto">
                Preview the professional English report cards that our AI will generate from your French bulletins
              </p>
            </div>

            {/* Template Controls */}
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 mb-6 sm:mb-8">
              <div className="flex flex-col gap-4 sm:gap-6">
                {/* Template Selection */}
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide text-center sm:text-left">
                    Choose Template Type
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      onClick={() => setSelectedTemplate('form4')}
                      className={`px-3 sm:px-4 py-3 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 ${
                        selectedTemplate === 'form4'
                          ? 'bg-green-600 text-white shadow-lg scale-105'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
                      }`}
                    >
                      <div className="flex items-center justify-center space-x-2">
                        <span>📋</span>
                        <span>Form 4 Template</span>
                      </div>
                      <div className="text-xs mt-1 opacity-75">4th Year Students</div>
                    </button>
                    <button
                      onClick={() => setSelectedTemplate('form6')}
                      className={`px-3 sm:px-4 py-3 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 ${
                        selectedTemplate === 'form6'
                          ? 'bg-blue-600 text-white shadow-lg scale-105'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
                      }`}
                    >
                      <div className="flex items-center justify-center space-x-2">
                        <span>📄</span>
                        <span>Form 6 Template</span>
                      </div>
                      <div className="text-xs mt-1 opacity-75">Final Year Students</div>
                    </button>
                  </div>
                </div>

                {/* Data Toggle and Preview Toggle Combined for Mobile */}
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide text-center sm:text-left">
                    Preview Options
                  </h3>
                  <div className="flex flex-col sm:flex-row gap-3">
                    {/* Data Toggle */}
                    <div className="flex gap-2 sm:gap-3 flex-1">
                      <button
                        onClick={() => setShowWithData(false)}
                        className={`flex-1 px-3 py-2 sm:py-3 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 ${
                          !showWithData
                            ? 'bg-purple-600 text-white shadow-lg'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
                        }`}
                      >
                        <div className="flex items-center justify-center space-x-1 sm:space-x-2">
                          <span>📝</span>
                          <span className="hidden sm:inline">Empty Template</span>
                          <span className="sm:hidden">Empty</span>
                        </div>
                      </button>
                      <button
                        onClick={() => setShowWithData(true)}
                        className={`flex-1 px-3 py-2 sm:py-3 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 ${
                          showWithData
                            ? 'bg-purple-600 text-white shadow-lg'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
                        }`}
                      >
                        <div className="flex items-center justify-center space-x-1 sm:space-x-2">
                          <span>📊</span>
                          <span className="hidden sm:inline">With Sample Data</span>
                          <span className="sm:hidden">Sample Data</span>
                        </div>
                      </button>
                    </div>

                    {/* Preview Toggle */}
                    <button
                      onClick={() => setShowTemplatePreview(!showTemplatePreview)}
                      className="px-4 sm:px-6 py-2 sm:py-3 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-all duration-200 flex items-center justify-center space-x-2"
                    >
                      <span>{showTemplatePreview ? '🙈' : '👁️'}</span>
                      <span className="text-xs sm:text-sm">
                        {showTemplatePreview ? 'Hide Preview' : 'Show Preview'}
                      </span>
                    </button>
                  </div>
                </div>

                {/* Template Info */}
                <div className="text-center text-xs sm:text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
                  Currently showing: <span className="font-medium text-gray-900">
                    {selectedTemplate === 'form6' ? 'Form 6' : 'Form 4'} 
                    {showWithData ? ' with sample data' : ' empty template'}
                  </span>
                </div>
              </div>
            </div>

            {/* Template Display */}
            {showTemplatePreview && (
              <div className="bg-white rounded-lg sm:rounded-2xl shadow-xl border border-gray-200 overflow-hidden mb-6 sm:mb-8">
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-3 sm:px-6 py-3 sm:py-4 border-b border-gray-200">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <h4 className="text-base sm:text-lg font-semibold text-gray-900">
                      {selectedTemplate === 'form6' ? 'Form 6 Template' : 'Form 4 Template'} Preview
                    </h4>
                    <div className="flex items-center space-x-2 sm:space-x-3 text-xs sm:text-sm text-gray-600">
                      <span className="flex items-center space-x-1">
                        <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                        <span className="hidden sm:inline">A4 Print Ready</span>
                        <span className="sm:hidden">Print Ready</span>
                      </span>
                      {showWithData && (
                        <span className="flex items-center space-x-1">
                          <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                          <span>Sample Data</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Mobile-optimized template container with full document height */}
                <div className="relative">
                  {/* Mobile view (under sm) - Constrained height for better mobile fit */}
                  <div className="block sm:hidden">
                    <div className="p-3 overflow-x-auto overflow-y-auto max-h-[60vh]">
                      <div className="transform scale-50 origin-top-left" style={{ width: '200%', transformOrigin: 'top left' }}>
                        {selectedTemplate === 'form6' ? (
                          <Form6Template 
                            data={showWithData ? sampleDataForm6 : undefined}
                            className="mx-auto"
                          />
                        ) : (
                          <Form4Template 
                            data={showWithData ? sampleDataForm4 : undefined}
                            className="mx-auto"
                          />
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Tablet view (sm to lg) - Full height display */}
                  <div className="hidden sm:block lg:hidden">
                    <div className="p-4 overflow-x-auto">
                      <div className="transform scale-75 origin-top" style={{ transformOrigin: 'top center' }}>
                        {selectedTemplate === 'form6' ? (
                          <Form6Template 
                            data={showWithData ? sampleDataForm6 : undefined}
                            className="mx-auto"
                          />
                        ) : (
                          <Form4Template 
                            data={showWithData ? sampleDataForm4 : undefined}
                            className="mx-auto"
                          />
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Desktop view (lg and up) - Full height display */}
                  <div className="hidden lg:block">
                    <div className="p-6 overflow-x-auto">
                      <div className="transform scale-90 xl:scale-100 origin-top" style={{ transformOrigin: 'top center' }}>
                        {selectedTemplate === 'form6' ? (
                          <Form6Template 
                            data={showWithData ? sampleDataForm6 : undefined}
                            className="mx-auto"
                          />
                        ) : (
                          <Form4Template 
                            data={showWithData ? sampleDataForm4 : undefined}
                            className="mx-auto"
                          />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Features Panel */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                    <span className="text-xl">🚀</span>
                  </div>
                  <h5 className="text-lg font-semibold text-blue-900">Template Features</h5>
                </div>
                <ul className="space-y-3 text-sm text-blue-800">
                  <li className="flex items-start space-x-2">
                    <span className="text-green-500 mt-0.5">✅</span>
                    <span><strong>A4 dimensions</strong> (210mm × 297mm) for perfect printing</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-green-500 mt-0.5">✅</span>
                    <span><strong>Dynamic subject rows</strong> - adjusts to your bulletin data</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-green-500 mt-0.5">✅</span>
                    <span><strong>Professional formatting</strong> matching DRC standards</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-green-500 mt-0.5">✅</span>
                    <span><strong>Ready for official use</strong> and archiving</span>
                  </li>
                </ul>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-2xl p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                    <span className="text-xl">🔄</span>
                  </div>
                  <h5 className="text-lg font-semibold text-purple-900">How It Works</h5>
                </div>
                <ol className="space-y-3 text-sm text-purple-800">
                  <li className="flex items-start space-x-2">
                    <span className="text-purple-600 font-bold min-w-[16px]">1.</span>
                    <span>Upload your French bulletin as an image</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-purple-600 font-bold min-w-[16px]">2.</span>
                    <span>AI extracts and translates all data accurately</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-purple-600 font-bold min-w-[16px]">3.</span>
                    <span>Get your professional English report card</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-purple-600 font-bold min-w-[16px]">4.</span>
                    <span>Download, print, or share as needed</span>
                  </li>
                </ol>
              </div>
            </div>
          </div>

          {/* Trust Indicators */}
          <div className="mt-16 pt-8 border-t border-gray-200">
            <p className="text-sm text-gray-500 mb-4">Trusted by families worldwide</p>
            <div className="flex flex-col sm:flex-row justify-center items-center space-y-2 sm:space-y-0 sm:space-x-8 opacity-60 mb-2">
              <div className="text-xs text-gray-400">🔒 Secure & Private</div>
              <div className="text-xs text-gray-400">⚡ Fast Processing</div>
              <div className="text-xs text-gray-400">✨ High Accuracy</div>
            </div>
            <div className="flex justify-center items-center">
              <span className="text-xs text-gray-400 italic">Powered by Nyota Innovations</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default LandingPage;
