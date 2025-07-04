// Form6TemplatePage.tsx - Page for the Form 6 bulletin template
import React, { useState } from 'react';
import Form6Template from './Form6Template';

const Form6TemplatePage: React.FC = () => {
  const [showWithData, setShowWithData] = useState(false);

  // Sample data for the template
  const sampleData = {
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

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm p-4 mb-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            📄 Bulletin Template Preview
          </h1>
          <p className="text-gray-600 mb-4">
            This is the React version of your HTML bulletin template, optimized for A4 printing and ready for dynamic data integration.
          </p>
          
          {/* Controls */}
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowWithData(false)}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                !showWithData
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Empty Template
            </button>
            <button
              onClick={() => setShowWithData(true)}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                showWithData
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              With Sample Data
            </button>
            <div className="text-sm text-gray-500">
              A4 Size: 210mm × 297mm | Print Ready ✓
            </div>
          </div>
        </div>
      </div>

      {/* Template Display */}
      <div className="max-w-6xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-4">
          <Form6Template 
            data={showWithData ? sampleData : undefined}
            className="mx-auto"
          />
        </div>
        
        {/* Info Panel */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">
            📋 Template Features
          </h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>✅ <strong>Exact visual match</strong> to your HTML template</li>
            <li>✅ <strong>A4 dimensions</strong> (210mm × 297mm) for perfect printing</li>
            <li>✅ <strong>Dynamic subject rows</strong> - adjusts to number of subjects from OpenAI</li>
            <li>✅ <strong>TypeScript interfaces</strong> for data binding</li>
            <li>✅ <strong>Tailwind CSS</strong> for consistency with your app</li>
            <li>✅ <strong>Print-ready styling</strong> - remove shadows and optimize for PDF</li>
          </ul>
          
          <div className="mt-4 p-3 bg-white rounded border border-blue-300">
            <h4 className="font-semibold text-blue-900 mb-2">Next Steps:</h4>
            <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
              <li>✅ <strong>PDF Generation</strong> - Convert template to PDF using html2canvas + jsPDF</li>
              <li>Integrate with your OpenAI data extraction results</li>
              <li>Add this template to your dashboard for display after processing</li>
              <li>Add print functionality with proper CSS media queries</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Form6TemplatePage;
