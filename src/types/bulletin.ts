// Bulletin Types for NTC Dashboard
// Shared types for bulletin/document management

export type FormType = 
  | 'form4' 
  | 'form6' 
  | 'collegeTranscript' 
  | 'collegeAttestation' 
  | 'stateDiploma' 
  | 'bachelorDiploma' 
  | 'highSchoolAttestation' 
  | 'stateExamAttestation';

export interface BulletinRecord {
  id: string;
  metadata: {
    studentName: string;
    fileName: string;
    uploadedAt: any;
    lastModified: any;
    status: string;
    formType?: FormType;
  };
  editedData: any;
  originalData: any;
  userId: string;
}

export interface DocumentTypeCounts {
  all: number;
  [key: string]: number;
}

export type FilterType = 'all' | FormType;

export type TableSize = 'auto' | 'normal' | '11px' | '12px' | '13px' | '14px' | '15px';
