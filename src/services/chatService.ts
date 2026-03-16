// Chat Service — API layer for the chatbot translation flow
// Handles upload, certification submission, and document fetching

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:3001";

/**
 * Upload a document for AI extraction
 */
export const uploadDocument = async (
  idToken: string,
  file: File,
  sourceLanguage: string,
  formType: string = "generalDocument"
): Promise<{
  success: boolean;
  data?: Record<string, unknown>;
  firestoreId?: string;
  formType?: string;
  storageUrl?: string;
  storagePath?: string;
  fileName?: string;
  fileSize?: number;
  error?: string;
}> => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("formType", formType);
  formData.append("sourceLanguage", sourceLanguage);
  formData.append("targetLanguage", "en");

  const response = await fetch(`${API_BASE}/api/upload`, {
    method: "POST",
    headers: { Authorization: `Bearer ${idToken}` },
    body: formData,
  });

  const result = await response.json();

  if (!response.ok) {
    return { success: false, error: result.error || "Upload failed" };
  }

  // Data is nested under result.processing from the backend
  const processingData = result.processing?.data || result.data;
  const firestoreId = result.firestoreId || result.processing?.firestoreId;

  if (!processingData) {
    return { success: false, error: "No data returned from processing" };
  }

  return {
    success: true,
    data: processingData,
    firestoreId,
    formType: result.formType || result.processing?.formType || formType,
    storageUrl: result.file?.storageUrl || undefined,
    storagePath: result.file?.storagePath || undefined,
    fileName: result.file?.originalName || undefined,
    fileSize: result.file?.size || undefined,
  };
};

/**
 * Create a certified document submission from an existing bulletin
 */
export const createCertifiedSubmission = async (
  idToken: string,
  params: {
    firestoreId: string;
    formType: string;
    sourceLanguage: string;
    originalData: Record<string, unknown>;
    storageUrl?: string;
    storagePath?: string;
    fileName?: string;
    fileSize?: number;
  }
): Promise<{ success: boolean; certDocId?: string; error?: string }> => {
  // Create in certifiedDocuments collection via the upload result data
  const response = await fetch(`${API_BASE}/api/certification/create`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${idToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(params),
  });

  const result = await response.json();
  if (!response.ok) {
    return { success: false, error: result.error || "Submission failed" };
  }

  return { success: true, certDocId: result.id };
};

/**
 * Submit a certified document for review with speed tier
 */
export const submitForReview = async (
  idToken: string,
  certDocId: string,
  speedTier: string
): Promise<{ success: boolean; error?: string }> => {
  const response = await fetch(
    `${API_BASE}/api/certification/submit/${encodeURIComponent(certDocId)}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${idToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ speedTier }),
    }
  );

  const result = await response.json();
  if (!response.ok) {
    return { success: false, error: result.error || "Submission failed" };
  }

  return { success: true };
};

/**
 * Get user's certified documents
 */
export const getMyCertifiedDocuments = async (
  idToken: string,
  status?: string
): Promise<{ success: boolean; documents?: Record<string, unknown>[]; error?: string }> => {
  const url = status
    ? `${API_BASE}/api/certification/my-documents?status=${encodeURIComponent(status)}`
    : `${API_BASE}/api/certification/my-documents`;

  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${idToken}` },
  });

  const result = await response.json();
  if (!response.ok) {
    return { success: false, error: result.error || "Failed to fetch documents" };
  }

  return { success: true, documents: result.documents };
};

/**
 * Export bulletin as PDF (for draft download)
 */
export const exportDraftPdf = async (
  idToken: string,
  firestoreId: string,
  frontendUrl: string
): Promise<Blob> => {
  const response = await fetch(`${API_BASE}/api/export-pdf`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${idToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      firestoreId,
      frontendUrl,
      watermark: true,
      waitForImages: true,
      pdfOptions: { format: "A4", printBackground: true },
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "PDF export failed" }));
    throw new Error(error.error || "PDF export failed");
  }

  return response.blob();
};

/**
 * Get user's bulletins (draft/processed documents not yet submitted)
 */
export const getMyBulletins = async (
  idToken: string
): Promise<{
  success: boolean;
  bulletins?: {
    id: string;
    formType: string;
    sourceLanguage: string;
    studentName: string;
    documentTitle: string | null;
    status: string;
    createdAt: string | null;
    hasStorageFile: boolean;
  }[];
  error?: string;
}> => {
  const response = await fetch(`${API_BASE}/api/bulletins/my`, {
    headers: { Authorization: `Bearer ${idToken}` },
  });

  const result = await response.json();
  if (!response.ok) {
    return { success: false, error: result.error || "Failed to fetch documents" };
  }

  return { success: true, bulletins: result.bulletins };
};

/**
 * Get pre-delete info: what linked data will be removed
 */
export const getBulletinDeleteInfo = async (
  idToken: string,
  bulletinId: string
): Promise<{
  success: boolean;
  bulletinId?: string;
  hasStorageFile?: boolean;
  versionsCount?: number;
  paymentsCount?: number;
  invoicesCount?: number;
  linkedSubmissions?: Array<{
    id: string;
    status: string;
    formType: string;
    certificationId: string | null;
  }>;
  error?: string;
}> => {
  const response = await fetch(
    `${API_BASE}/api/bulletins/${encodeURIComponent(bulletinId)}/delete-info`,
    {
      method: "GET",
      headers: { Authorization: `Bearer ${idToken}` },
    }
  );

  const result = await response.json();
  if (!response.ok) {
    return { success: false, error: result.error || "Failed to check" };
  }

  return result;
};

/**
 * Delete a bulletin and its associated Storage file
 */
export const deleteBulletin = async (
  idToken: string,
  bulletinId: string
): Promise<{ success: boolean; error?: string }> => {
  const response = await fetch(
    `${API_BASE}/api/bulletins/${encodeURIComponent(bulletinId)}`,
    {
      method: "DELETE",
      headers: { Authorization: `Bearer ${idToken}` },
    }
  );

  const result = await response.json();
  if (!response.ok) {
    return { success: false, error: result.error || "Failed to delete" };
  }

  return { success: true };
};

/**
 * Get a single bulletin's full data (for resuming drafts)
 */
export const getBulletin = async (
  idToken: string,
  bulletinId: string
): Promise<{
  success: boolean;
  bulletin?: {
    id: string;
    formType: string;
    sourceLanguage: string;
    data: Record<string, unknown>;
    storageUrl?: string;
    storagePath?: string;
    fileName?: string;
    fileSize?: number;
  };
  error?: string;
}> => {
  const response = await fetch(
    `${API_BASE}/api/bulletins/${encodeURIComponent(bulletinId)}`,
    {
      headers: { Authorization: `Bearer ${idToken}` },
    }
  );

  const result = await response.json();
  if (!response.ok) {
    return { success: false, error: result.error || "Failed to load bulletin" };
  }

  return { success: true, bulletin: result.bulletin };
};

/**
 * Export a certified document as PDF for inline browser viewing.
 * Uses the same Firestore-first PDF pipeline as draft export, without watermark.
 */
export const exportCertifiedPdf = async (
  idToken: string,
  docId: string
): Promise<Blob> => {
  const response = await fetch(`${API_BASE}/api/export-pdf`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${idToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      certDocId: docId,
      watermark: false,
      waitForImages: true,
      pdfOptions: { format: "A4", printBackground: true },
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Certified PDF export failed" }));
    throw new Error(error.error || "Certified PDF export failed");
  }

  return response.blob();
};

/**
 * Re-upload a better original image for a rejected document
 * This replaces the original image without re-running AI processing
 */
export const reuploadDocument = async (
  idToken: string,
  docId: string,
  file: File
): Promise<{ success: boolean; error?: string }> => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(
    `${API_BASE}/api/certification/reupload/${encodeURIComponent(docId)}`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${idToken}` },
      body: formData,
    }
  );

  const result = await response.json();
  if (!response.ok) {
    return { success: false, error: result.error || "Re-upload failed" };
  }

  return { success: true };
};

/**
 * Get a single certified document's details
 */
export const getCertifiedDocument = async (
  idToken: string,
  docId: string
): Promise<{ success: boolean; document?: Record<string, unknown>; error?: string }> => {
  const response = await fetch(
    `${API_BASE}/api/certification/document/${encodeURIComponent(docId)}`,
    {
      headers: { Authorization: `Bearer ${idToken}` },
    }
  );

  const result = await response.json();
  if (!response.ok) {
    return { success: false, error: result.error || "Failed to fetch document" };
  }

  return { success: true, document: result.document };
};

/**
 * Check if a bulletin already has a certification submission
 */
export const checkBulletinSubmission = async (
  idToken: string,
  bulletinId: string
): Promise<{
  success: boolean;
  hasSubmission?: boolean;
  submission?: {
    id: string;
    status: string;
    certificationId?: string;
    rejectionReason?: string;
    rejectionType?: string;
  };
  error?: string;
}> => {
  const response = await fetch(
    `${API_BASE}/api/certification/check-bulletin/${encodeURIComponent(bulletinId)}`,
    {
      headers: { Authorization: `Bearer ${idToken}` },
    }
  );

  const result = await response.json();
  if (!response.ok) {
    return { success: false, error: result.error || "Failed to check submission" };
  }

  return {
    success: true,
    hasSubmission: result.hasSubmission,
    submission: result.submission,
  };
};
