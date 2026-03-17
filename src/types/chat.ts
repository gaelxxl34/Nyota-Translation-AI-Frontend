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

// TFunction type for i18next t()
type TFunction = (key: string, options?: Record<string, unknown>) => string;

export const getLanguageOptions = (t: TFunction): ChatOption[] => [
  { id: "drc", label: t("chat.options.drc"), value: "drc", description: t("chat.options.drcDesc") },
  { id: "fr", label: t("chat.options.french"), value: "fr", description: t("chat.options.frenchDesc") },
  { id: "ar", label: t("chat.options.arabic"), value: "ar", description: t("chat.options.arabicDesc") },
  { id: "es", label: t("chat.options.spanish"), value: "es", description: t("chat.options.spanishDesc") },
  { id: "auto", label: t("chat.options.autoDetect"), value: "auto", description: t("chat.options.autoDetectDesc") },
];

export const getDrcTemplateOptions = (t: TFunction): ChatOption[] => [
  { id: "form4", label: t("chat.options.form4"), value: "form4", description: t("chat.options.form4Desc") },
  { id: "form6", label: t("chat.options.form6"), value: "form6", description: t("chat.options.form6Desc") },
  { id: "stateDiploma", label: t("chat.options.stateDiploma"), value: "stateDiploma", description: t("chat.options.stateDiplomaDesc") },
  { id: "stateExamAttestation", label: t("chat.options.stateExamAttestation"), value: "stateExamAttestation", description: t("chat.options.stateExamAttestationDesc") },
  { id: "bachelorDiploma", label: t("chat.options.bachelorDiploma"), value: "bachelorDiploma", description: t("chat.options.bachelorDiplomaDesc") },
  { id: "collegeTranscript", label: t("chat.options.collegeTranscript"), value: "collegeTranscript", description: t("chat.options.collegeTranscriptDesc") },
  { id: "collegeAttestation", label: t("chat.options.collegeAttestation"), value: "collegeAttestation", description: t("chat.options.collegeAttestationDesc") },
  { id: "highSchoolAttestation", label: t("chat.options.highSchoolAttestation"), value: "highSchoolAttestation", description: t("chat.options.highSchoolAttestationDesc") },
  { id: "generalDRC", label: t("chat.options.otherDrc"), value: "generalDocument", description: t("chat.options.otherDrcDesc") },
];

export const getSpeedTierOptions = (t: TFunction): ChatOption[] => [
  { id: "express", label: t("chat.options.express"), value: "express", description: t("chat.options.expressDesc") },
  { id: "rush", label: t("chat.options.rush"), value: "rush", description: t("chat.options.rushDesc") },
  { id: "standard", label: t("chat.options.standard"), value: "standard", description: t("chat.options.standardDesc") },
];

export const getActionOptions = (t: TFunction): ChatOption[] => [
  { id: "view_draft", label: t("chat.options.viewDraft"), value: "view_draft", description: t("chat.options.viewDraftDesc") },
  { id: "certify", label: t("chat.options.certify"), value: "certify", description: t("chat.options.certifyDesc") },
];
