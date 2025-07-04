// BulletinTemplatePage.tsx - Page for bulletin templates (Form 4 & Form 6)
import React, { useState } from 'react';
import Form6Template from './Form6Template';
import Form4Template from './Form4Template';

interface BulletinTemplatePageProps {
  onNavigate?: (page: 'landing' | 'login' | 'register' | 'dashboard' | 'bulletin-template' | 'card-only') => void;
}

const BulletinTemplatePage: React.FC<BulletinTemplatePageProps> = ({ onNavigate }) => {
  const [showWithData, setShowWithData] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<'form4' | 'form6'>('form6');

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
    class: '4th Human Sciences',
    permanentNumber: '87654321',
    idNumber: '123456789012345678',
    academicYear: '2023-2024',
    subjects: [
      // High maxima subjects (Physics, Chemistry, Math) - 40 periods, 80 exams, 160 total
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
      // Medium maxima subjects (Languages, Social Sciences) - 20 periods, 40 exams, 80 total
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
      // Low maxima subjects (Religion, Computer Studies, Arts) - 10 periods, 20 exams, 40 total
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
        subject: 'Biology',
        firstSemester: { period1: '13', period2: '14', exam: '26', total: '53' },
        secondSemester: { period3: '14', period4: '13', exam: '28', total: '55' },
        overallTotal: '108',
        maxima: { periodMaxima: 20, examMaxima: 40, totalMaxima: 80 },
        nationalExam: { marks: '65', max: '100' }
      },
      {
        subject: 'Civics and Moral Education',
        firstSemester: { period1: '17', period2: '18', exam: '36', total: '71' },
        secondSemester: { period3: '18', period4: '17', exam: '38', total: '73' },
        overallTotal: '144',
        maxima: { periodMaxima: 20, examMaxima: 40, totalMaxima: 80 },
        nationalExam: { marks: '80', max: '100' }
      }
    ],
    totalMarksOutOf: {
      firstSemester: '200',
      secondSemester: '200'
    },
    totalMarksObtained: {
      firstSemester: '152',
      secondSemester: '158'
    },
    percentage: {
      firstSemester: '76%',
      secondSemester: '79%'
    },
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
      // High maxima subjects for Form 4 (similar to Form 6 but adjusted for 4th year level)
      {
        subject: 'Mathematics',
        firstSemester: { period1: '34', period2: '32', exam: '68', total: '134' },
        secondSemester: { period3: '36', period4: '34', exam: '72', total: '142' },
        overallTotal: '276',
        maxima: { periodMaxima: 40, examMaxima: 80, totalMaxima: 160 },
        nationalExam: { marks: '82', max: '100' }
      },
      {
        subject: 'Physics',
        firstSemester: { period1: '30', period2: '28', exam: '64', total: '122' },
        secondSemester: { period3: '32', period4: '30', exam: '66', total: '128' },
        overallTotal: '250',
        maxima: { periodMaxima: 40, examMaxima: 80, totalMaxima: 160 },
        nationalExam: { marks: '70', max: '100' }
      },
      {
        subject: 'Chemistry',
        firstSemester: { period1: '26', period2: '28', exam: '60', total: '114' },
        secondSemester: { period3: '28', period4: '26', exam: '62', total: '116' },
        overallTotal: '230',
        maxima: { periodMaxima: 40, examMaxima: 80, totalMaxima: 160 },
        nationalExam: { marks: '65', max: '100' }
      },
      // Medium maxima subjects
      {
        subject: 'French Language',
        firstSemester: { period1: '15', period2: '16', exam: '34', total: '65' },
        secondSemester: { period3: '16', period4: '15', exam: '36', total: '67' },
        overallTotal: '132',
        maxima: { periodMaxima: 20, examMaxima: 40, totalMaxima: 80 },
        nationalExam: { marks: '75', max: '100' }
      },
      {
        subject: 'English',
        firstSemester: { period1: '15', period2: '16', exam: '32', total: '63' },
        secondSemester: { period3: '16', period4: '15', exam: '34', total: '65' },
        overallTotal: '128',
        maxima: { periodMaxima: 20, examMaxima: 40, totalMaxima: 80 },
        nationalExam: { marks: '72', max: '100' }
      },
      {
        subject: 'History',
        firstSemester: { period1: '14', period2: '15', exam: '30', total: '59' },
        secondSemester: { period3: '15', period4: '14', exam: '32', total: '61' },
        overallTotal: '120',
        maxima: { periodMaxima: 20, examMaxima: 40, totalMaxima: 80 },
        nationalExam: { marks: '60', max: '100' }
      },
      {
        subject: 'Geography',
        firstSemester: { period1: '13', period2: '14', exam: '28', total: '55' },
        secondSemester: { period3: '14', period4: '13', exam: '30', total: '57' },
        overallTotal: '112',
        maxima: { periodMaxima: 20, examMaxima: 40, totalMaxima: 80 },
        nationalExam: { marks: '67', max: '100' }
      },
      // Low maxima subjects
      {
        subject: 'Religious Education',
        firstSemester: { period1: '7', period2: '8', exam: '16', total: '31' },
        secondSemester: { period3: '8', period4: '7', exam: '17', total: '32' },
        overallTotal: '63',
        maxima: { periodMaxima: 10, examMaxima: 20, totalMaxima: 40 },
        nationalExam: { marks: '80', max: '100' }
      },
      {
        subject: 'Computer Studies',
        firstSemester: { period1: '6', period2: '7', exam: '15', total: '28' },
        secondSemester: { period3: '7', period4: '6', exam: '16', total: '29' },
        overallTotal: '57',
        maxima: { periodMaxima: 10, examMaxima: 20, totalMaxima: 40 },
        nationalExam: { marks: '75', max: '100' }
      },
      {
        subject: 'Biology',
        firstSemester: { period1: '12', period2: '13', exam: '24', total: '49' },
        secondSemester: { period3: '13', period4: '12', exam: '26', total: '51' },
        overallTotal: '100',
        maxima: { periodMaxima: 20, examMaxima: 40, totalMaxima: 80 },
        nationalExam: { marks: '62', max: '100' }
      }
    ],
    totalMarksOutOf: {
      firstSemester: '180',
      secondSemester: '180'
    },
    totalMarksObtained: {
      firstSemester: '135',
      secondSemester: '142'
    },
    percentage: {
      firstSemester: '75%',
      secondSemester: '79%'
    },
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

  // Handle back navigation
  const handleBackClick = () => {
    if (onNavigate) {
      // Use provided navigation function
      onNavigate('dashboard');
    } else {
      // Fallback navigation methods
      if (window.history.length > 1) {
        window.history.back();
      } else {
        window.location.href = '/dashboard';
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Enhanced Header */}
      <div className="bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          {/* Header Top Row - Back Button & Title */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleBackClick}
                className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all duration-200 group"
                title="Go back to dashboard"
              >
                <svg 
                  className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform duration-200" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span className="font-medium">Back</span>
              </button>
              <div className="h-6 w-px bg-gray-300"></div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center space-x-3">
                  <span className="text-2xl">📄</span>
                  <span>Bulletin Template Preview</span>
                </h1>
                <p className="text-gray-600 mt-1">
                  Choose and preview Form 4 or Form 6 bulletin templates with dynamic data
                </p>
              </div>
            </div>
            
            {/* Status Badge */}
            <div className="flex items-center space-x-2 bg-green-50 border border-green-200 rounded-lg px-4 py-2">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span className="text-sm font-medium text-green-700">Print Ready</span>
              <span className="text-xs text-green-600">A4 (210×297mm)</span>
            </div>
          </div>
          
          {/* Control Panel */}
          <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Template Selection */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Template Type</h3>
                <div className="flex space-x-3">
                  <button
                    onClick={() => setSelectedTemplate('form4')}
                    className={`flex-1 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                      selectedTemplate === 'form4'
                        ? 'bg-green-600 text-white shadow-lg transform scale-105'
                        : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 hover:border-green-300'
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
                    className={`flex-1 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                      selectedTemplate === 'form6'
                        ? 'bg-blue-600 text-white shadow-lg transform scale-105'
                        : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 hover:border-blue-300'
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
              
              {/* Data View Toggle */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Preview Mode</h3>
                <div className="flex space-x-3">
                  <button
                    onClick={() => setShowWithData(false)}
                    className={`flex-1 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                      !showWithData
                        ? 'bg-purple-600 text-white shadow-lg transform scale-105'
                        : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 hover:border-purple-300'
                    }`}
                  >
                    <div className="flex items-center justify-center space-x-2">
                      <span>📝</span>
                      <span>Empty Template</span>
                    </div>
                    <div className="text-xs mt-1 opacity-75">Blank Form</div>
                  </button>
                  <button
                    onClick={() => setShowWithData(true)}
                    className={`flex-1 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                      showWithData
                        ? 'bg-purple-600 text-white shadow-lg transform scale-105'
                        : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 hover:border-purple-300'
                    }`}
                  >
                    <div className="flex items-center justify-center space-x-2">
                      <span>📊</span>
                      <span>With Sample Data</span>
                    </div>
                    <div className="text-xs mt-1 opacity-75">Populated Form</div>
                  </button>
                </div>
              </div>
            </div>
            
            {/* Quick Info */}
            <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
              <div className="flex items-center space-x-4">
                <span className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                  <span>Dynamic subject rows</span>
                </span>
                <span className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                  <span>TypeScript interfaces</span>
                </span>
                <span className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-purple-400 rounded-full"></span>
                  <span>A4 print optimization</span>
                </span>
              </div>
              <div className="text-xs bg-white rounded-full px-3 py-1 border border-gray-200">
                Currently viewing: <span className="font-medium text-gray-900">
                  {selectedTemplate === 'form6' ? 'Form 6' : 'Form 4'} 
                  {showWithData ? ' with sample data' : ' empty template'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Template Display */}
      <div className="max-w-7xl mx-auto px-4 pb-8">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          {/* Template Header */}
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                {selectedTemplate === 'form6' ? 'Form 6 Template' : 'Form 4 Template'} Preview
              </h2>
              <div className="flex items-center space-x-3 text-sm text-gray-600">
                <span className="flex items-center space-x-1">
                  <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                  <span>Live Preview</span>
                </span>
                {showWithData && (
                  <span className="flex items-center space-x-1">
                    <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                    <span>Sample Data Loaded</span>
                  </span>
                )}
              </div>
            </div>
          </div>
          
          {/* Template Content */}
          <div className="p-6">
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
        
        {/* Enhanced Info Panel */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Features Panel */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <span className="text-xl">🚀</span>
              </div>
              <h3 className="text-lg font-semibold text-blue-900">
                Template Features - {selectedTemplate === 'form6' ? 'Form 6' : 'Form 4'}
              </h3>
            </div>
            <ul className="space-y-3 text-sm text-blue-800">
              <li className="flex items-start space-x-2">
                <span className="text-green-500 mt-0.5">✅</span>
                <span><strong>Exact visual match</strong> to your HTML template</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-green-500 mt-0.5">✅</span>
                <span><strong>A4 dimensions</strong> (210mm × 297mm) for perfect printing</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-green-500 mt-0.5">✅</span>
                <span><strong>Dynamic subject rows</strong> - adjusts to number of subjects from OpenAI</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-green-500 mt-0.5">✅</span>
                <span><strong>TypeScript interfaces</strong> for data binding</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-green-500 mt-0.5">✅</span>
                <span><strong>Tailwind CSS</strong> for consistency with your app</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-green-500 mt-0.5">✅</span>
                <span><strong>Print-ready styling</strong> - remove shadows and optimize for PDF</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-green-500 mt-0.5">✅</span>
                <span><strong>Multiple templates</strong> - Form 4 and Form 6 support</span>
              </li>
            </ul>
          </div>
          
          {/* Template Differences & Next Steps */}
          <div className="space-y-6">
            {/* Template Differences */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-2xl p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                  <span className="text-xl">🔄</span>
                </div>
                <h4 className="text-lg font-semibold text-purple-900">Template Differences</h4>
              </div>
              <ul className="space-y-3 text-sm text-purple-800">
                <li className="flex items-start space-x-2">
                  <span className="text-green-500 mt-0.5 text-xs">📋</span>
                  <span><strong>Form 4:</strong> Designed for 4th year students with adjusted grade levels and subject structure</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-blue-500 mt-0.5 text-xs">📄</span>
                  <span><strong>Form 6:</strong> Designed for 6th year (final year) students with comprehensive assessment including national exam scores</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-purple-500 mt-0.5 text-xs">🔧</span>
                  <span><strong>Both templates:</strong> Support dynamic maxima grouping and editable fields for customization</span>
                </li>
              </ul>
            </div>
            
            {/* Next Steps */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                  <span className="text-xl">🎯</span>
                </div>
                <h4 className="text-lg font-semibold text-green-900">Next Steps</h4>
              </div>
              <ol className="space-y-3 text-sm text-green-800">
                <li className="flex items-start space-x-2">
                  <span className="text-green-500 font-bold">✅</span>
                  <span><strong>PDF Generation</strong> - Convert template to PDF using html2canvas + jsPDF</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-gray-400 font-bold">2.</span>
                  <span>Integrate with your OpenAI data extraction results</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-gray-400 font-bold">3.</span>
                  <span>Add template selection to your dashboard for display after processing</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-gray-400 font-bold">4.</span>
                  <span>Add print functionality with proper CSS media queries</span>
                </li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BulletinTemplatePage;
