// Chat Flow Types for NTC
// State machine types for the zero-typing chatbot UX

export type ChatStep =
  | "welcome"
  | "select_language"
  | "select_drc_template"
  | "upload_document"
  | "uploading"
  | "processing"
  | "preview_draft"
  | "select_action"
  | "select_speed_tier"
  | "payment"
  | "payment_processing"
  | "submitting"
  | "submitted"
  | "viewing_draft"
  | "error";

export interface ChatMessage {
  id: string;
  type: "bot" | "user" | "system";
  content: string;
  timestamp: Date;
  options?: ChatOption[];
  component?: "upload" | "preview" | "tier_select";
  metadata?: Record<string, unknown>;
}

export interface ChatOption {
  id: string;
  label: string;
  value: string;
  icon?: string;
  description?: string;
  disabled?: boolean;
}

export interface UploadResult {
  success: boolean;
  data?: Record<string, unknown>;
  firestoreId?: string;
  certDocId?: string;
  formType?: string;
  storageUrl?: string;
  storagePath?: string;
  fileName?: string;
  fileSize?: number;
  error?: string;
}

export interface DraftPreview {
  certDocId: string;
  firestoreId: string;
  formType: string;
  studentName?: string;
  sourceLanguage: string;
  targetLanguage: string;
  data: Record<string, unknown>;
}

export interface PaymentData {
  certDocId: string;
  speedTier: string;
  formType?: string;
  documentTitle?: string;
}

export interface ChatState {
  step: ChatStep;
  messages: ChatMessage[];
  sourceLanguage: string | null;
  selectedFormType: string | null;
  uploadResult: UploadResult | null;
  draftPreview: DraftPreview | null;
  draftPdfUrl: string | null;
  selectedTier: string | null;
  certDocId: string | null;
  paymentData: PaymentData | null;
  error: string | null;
}

export const LANGUAGE_OPTIONS: ChatOption[] = [
  { id: "drc", label: "🇨🇩 DRC Format", value: "drc", description: "Congo — French academic documents" },
  { id: "fr", label: "🇫🇷 French", value: "fr", description: "Français" },
  { id: "ar", label: "🇸🇦 Arabic", value: "ar", description: "العربية" },
  { id: "es", label: "🇪🇸 Spanish", value: "es", description: "Español" },
  { id: "auto", label: "🔍 Auto-detect", value: "auto", description: "Let AI detect the language" },
];

export const DRC_TEMPLATE_OPTIONS: ChatOption[] = [
  { id: "form4", label: "📝 Bulletin Form 4", value: "form4", description: "Bulletin Scolaire, 4ème Secondaire" },
  { id: "form6", label: "📝 Bulletin Form 6", value: "form6", description: "Bulletin Scolaire, 6ème Secondaire" },
  { id: "stateDiploma", label: "🎓 State Diploma", value: "stateDiploma", description: "Diplôme d'État" },
  { id: "stateExamAttestation", label: "📋 State Exam Attestation", value: "stateExamAttestation", description: "Attestation de Réussite" },
  { id: "bachelorDiploma", label: "🎓 Bachelor's Diploma", value: "bachelorDiploma", description: "Diplôme de Licence / Graduat" },
  { id: "collegeTranscript", label: "📊 College Transcript", value: "collegeTranscript", description: "Relevé de Notes Universitaire" },
  { id: "collegeAttestation", label: "📋 College Attestation", value: "collegeAttestation", description: "Attestation de Fréquentation" },
  { id: "highSchoolAttestation", label: "📋 High School Attestation", value: "highSchoolAttestation", description: "Attestation de Scolarité" },
  { id: "generalDRC", label: "📄 Other DRC Document", value: "generalDocument", description: "Autre document congolais" },
];

export const SPEED_TIER_OPTIONS: ChatOption[] = [
  {
    id: "express",
    label: "🚀 Express — $45",
    value: "express",
    description: "1–5 hours",
  },
  {
    id: "rush",
    label: "⚡ Rush — $35",
    value: "rush",
    description: "Up to 12 hours",
  },
  {
    id: "standard",
    label: "📋 Standard — $30",
    value: "standard",
    description: "Up to 24 hours",
  },
];

export const ACTION_OPTIONS: ChatOption[] = [
  {
    id: "view_draft",
    label: "👁 View Free Draft",
    value: "view_draft",
    description: "Preview AI-generated draft in browser",
  },
  {
    id: "certify",
    label: "✅ Get Certified Translation",
    value: "certify",
    description: "Agent-reviewed, tamper-proof",
  },
];
