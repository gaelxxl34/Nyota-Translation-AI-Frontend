// Sample data for the Form6Template component
// This file provides realistic sample data that matches our template structure

export const sampleBulletinData = {
  province: "KINSHASA",
  city: "KINSHASA",
  municipality: "GOMBE",
  school: "INSTITUT TECHNIQUE COMMERCIAL DE GOMBE",
  schoolCode: "12345678",
  studentName: "MUKENDI KALALA Jean-Pierre",
  gender: "M",
  birthPlace: "LUBUMBASHI",
  birthDate: "15/03/2005",
  class: "6TH YEAR HUMANITIES MATH – PHYSICS",
  permanentNumber: "87654321",
  idNumber: "1234567890123456",
  academicYear: "2023-2024",
  
  subjects: [
    // Subjects sorted by maxima values (lower to higher: /10, /20, /40, /50, /100)
    
    // Religious Education - /10 maxima (smallest)
    {
      subject: "Religious Education",
      firstSemester: {
        period1: "8",
        period2: "9",
        exam: "8",
        total: "8"
      },
      secondSemester: {
        period3: "9",
        period4: "8",
        exam: "9",
        total: "9"
      },
      overallTotal: "8.5",
      maxima: {
        periodMaxima: 10,
        examMaxima: 10,
        totalMaxima: 10
      },
      nationalExam: {
        marks: "8",
        max: "10"
      }
    },
    
    // Civic Education - /20 maxima
    {
      subject: "Civic Education",
      firstSemester: {
        period1: "17",
        period2: "16",
        exam: "17",
        total: "17"
      },
      secondSemester: {
        period3: "16",
        period4: "17",
        exam: "16",
        total: "16"
      },
      overallTotal: "16.5",
      maxima: {
        periodMaxima: 20,
        examMaxima: 20,
        totalMaxima: 20
      },
      nationalExam: {
        marks: "17",
        max: "20"
      }
    },
    {
      subject: "English",
      firstSemester: {
        period1: "17",
        period2: "16",
        exam: "18",
        total: "17"
      },
      secondSemester: {
        period3: "16",
        period4: "17",
        exam: "17",
        total: "17"
      },
      overallTotal: "17",
      maxima: {
        periodMaxima: 20,
        examMaxima: 20,
        totalMaxima: 20
      },
      nationalExam: {
        marks: "17",
        max: "20"
      }
    },
    {
      subject: "French Language",
      firstSemester: {
        period1: "13",
        period2: "14",
        exam: "12",
        total: "13"
      },
      secondSemester: {
        period3: "14",
        period4: "13",
        exam: "15",
        total: "14"
      },
      overallTotal: "13.5",
      maxima: {
        periodMaxima: 20,
        examMaxima: 20,
        totalMaxima: 20
      },
      nationalExam: {
        marks: "14",
        max: "20"
      }
    },
    {
      subject: "Geography",
      firstSemester: {
        period1: "14",
        period2: "15",
        exam: "14",
        total: "14"
      },
      secondSemester: {
        period3: "16",
        period4: "14",
        exam: "15",
        total: "15"
      },
      overallTotal: "14.5",
      maxima: {
        periodMaxima: 20,
        examMaxima: 20,
        totalMaxima: 20
      },
      nationalExam: {
        marks: "15",
        max: "20"
      }
    },
    {
      subject: "History",
      firstSemester: {
        period1: "15",
        period2: "14",
        exam: "16",
        total: "15"
      },
      secondSemester: {
        period3: "15",
        period4: "16",
        exam: "15",
        total: "15"
      },
      overallTotal: "15",
      maxima: {
        periodMaxima: 20,
        examMaxima: 20,
        totalMaxima: 20
      },
      nationalExam: {
        marks: "15",
        max: "20"
      }
    },
    
    // Biology and Chemistry - /40 maxima
    {
      subject: "Biology",
      firstSemester: {
        period1: "32",
        period2: "30",
        exam: "34",
        total: "32"
      },
      secondSemester: {
        period3: "30",
        period4: "32",
        exam: "32",
        total: "32"
      },
      overallTotal: "32",
      maxima: {
        periodMaxima: 40,
        examMaxima: 40,
        totalMaxima: 40
      },
      nationalExam: {
        marks: "32",
        max: "40"
      }
    },
    {
      subject: "Chemistry",
      firstSemester: {
        period1: "32",
        period2: "34",
        exam: "30",
        total: "32"
      },
      secondSemester: {
        period3: "30",
        period4: "32",
        exam: "34",
        total: "32"
      },
      overallTotal: "32",
      maxima: {
        periodMaxima: 40,
        examMaxima: 40,
        totalMaxima: 40
      },
      nationalExam: {
        marks: "32",
        max: "40"
      }
    },
    
    // Philosophy - /50 maxima
    {
      subject: "Philosophy",
      firstSemester: {
        period1: "39",
        period2: "42",
        exam: "39",
        total: "40"
      },
      secondSemester: {
        period3: "42",
        period4: "45",
        exam: "42",
        total: "43"
      },
      overallTotal: "41.5",
      maxima: {
        periodMaxima: 50,
        examMaxima: 50,
        totalMaxima: 50
      },
      nationalExam: {
        marks: "42",
        max: "50"
      }
    },
    
    // Mathematics and Physics - /100 maxima (highest)
    {
      subject: "Mathematics",
      firstSemester: {
        period1: "75",
        period2: "80",
        exam: "70",
        total: "75"
      },
      secondSemester: {
        period3: "85",
        period4: "80",
        exam: "75",
        total: "80"
      },
      overallTotal: "77.5",
      maxima: {
        periodMaxima: 100,
        examMaxima: 100,
        totalMaxima: 100
      },
      nationalExam: {
        marks: "78",
        max: "100"
      }
    },
    {
      subject: "Physics",
      firstSemester: {
        period1: "70",
        period2: "75",
        exam: "65",
        total: "70"
      },
      secondSemester: {
        period3: "80",
        period4: "75",
        exam: "70",
        total: "75"
      },
      overallTotal: "72.5",
      maxima: {
        periodMaxima: 100,
        examMaxima: 100,
        totalMaxima: 100
      },
      nationalExam: {
        marks: "72",
        max: "100"
      }
    }
  ],
  
  totalMarksOutOf: {
    firstSemester: "200",
    secondSemester: "200"
  },
  totalMarksObtained: {
    firstSemester: "148",
    secondSemester: "154"
  },
  percentage: {
    firstSemester: "74%",
    secondSemester: "77%"
  },
  position: "3",
  totalStudents: "45",
  application: "Good",
  behaviour: "Very Good",
  finalResultPercentage: "75.5",
  isPromoted: true,
  shouldRepeat: "",
  issueLocation: "KINSHASA",
  issueDate: "15/07/2024",
  centerCode: "54321",
  verifierName: "MUTOMBO KABONGO Pierre",
  endorsementDate: "20/07/2024",
  verificationDate: "15/07/2024",
  headTeacherName: "MUTOMBO KABONGO Pierre",
  marksOutOf: {
    firstSemester: "200",
    secondSemester: "200"
  },
  summaryValues: {
    aggregatesMaxima: {
      period1: "20",
      period2: "20",
      exam1: "40",
      total1: "80",
      period3: "20",
      period4: "20",
      exam2: "40",
      total2: "80",
      overall: "160"
    },
    aggregates: {
      period1: "18",
      period2: "17",
      exam1: "32",
      total1: "67",
      period3: "19",
      period4: "18",
      exam2: "35",
      total2: "72",
      overall: "139"
    },
    percentage: {
      period1: "90",
      period2: "85",
      exam1: "80",
      total1: "83.8",
      period3: "95",
      period4: "90",
      exam2: "87.5",
      total2: "90",
      overall: "86.9"
    },
    position: {
      period1: "2",
      period2: "3",
      exam1: "4",
      total1: "3/45",
      period3: "1",
      period4: "2",
      exam2: "2",
      total2: "2/45",
      overall: "3"
    },
    application: {
      period1: "B",
      period2: "B",
      period3: "B",
      period4: "B"
    },
    behaviour: {
      period1: "B",
      period2: "B",
      period3: "B",
      period4: "B"
    }
  }
};

// Function to generate random sample data
export const generateRandomBulletinData = () => {
  const subjects = [
    "Mathematics", "Physics", "Chemistry", "French", "English", 
    "History", "Geography", "Biology", "Philosophy", "Civic Education",
    "Computer Science", "Economics", "Literature", "Art", "Music"
  ];
  
  const randomSubjects = subjects.slice(0, 10 + Math.floor(Math.random() * 5)).map(subject => ({
    subject,
    firstSemester: {
      period1: (10 + Math.floor(Math.random() * 10)).toString(),
      period2: (10 + Math.floor(Math.random() * 10)).toString(),
      exam: (10 + Math.floor(Math.random() * 10)).toString(),
      total: (10 + Math.floor(Math.random() * 10)).toString()
    },
    secondSemester: {
      period3: (10 + Math.floor(Math.random() * 10)).toString(),
      period4: (10 + Math.floor(Math.random() * 10)).toString(),
      exam: (10 + Math.floor(Math.random() * 10)).toString(),
      total: (10 + Math.floor(Math.random() * 10)).toString()
    },
    overallTotal: (10 + Math.floor(Math.random() * 10)).toString(),
    nationalExam: {
      marks: (60 + Math.floor(Math.random() * 40)).toString(),
      max: "100"
    }
  }));
  
  return {
    ...sampleBulletinData,
    subjects: randomSubjects,
    studentName: `Sample Student ${Math.floor(Math.random() * 1000)}`,
    idNumber: Math.random().toString().substr(2, 16)
  };
};
