// Document Verification Utilities
// Fetches verification data from the backend API (public, no auth required)

/** Interface for legacy verification data (bulletins collection) */
export interface VerificationData {
  studentName: string;
  generationDate: string;
  documentTitle?: string;
  documentType?: string;
  sourceLanguage?: string;
  targetLanguage?: string;
  formType?: string;
}

/** Interface for certified document verification */
export interface CertifiedVerificationData {
  certificationId: string;
  certifiedAt: { _seconds: number; _nanoseconds: number } | string;
  documentHash: string;
  certifiedByName: string | null;
  documentTitle: string | null;
  studentName: string;
  formType: string;
  sourceLanguage: string;
  targetLanguage: string;
}


const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

/** Check if an ID matches the NTC certification format */
export const isCertificationId = (id: string): boolean =>
  /^NTC-\d{4}-[A-Z2-9]{6}$/.test(id);

/** 
 * Retry helper function with exponential backoff 
 * This helps with mobile network issues
 */
const retryWithBackoff = async <T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delayMs: number = 1000
): Promise<T> => {
  let lastError: Error | undefined;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      if (attempt < maxRetries - 1) {
        const waitTime = delayMs * Math.pow(2, attempt);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
  }
  
  throw lastError || new Error('Max retries exceeded');
};

/** Retrieve legacy verification data via the backend API */
export const getVerificationData = async (documentId: string): Promise<VerificationData | null> => {
  try {
    const data = await retryWithBackoff(async () => {
      const response = await fetch(`${API_URL}/api/verify/${encodeURIComponent(documentId)}`);
      
      if (response.status === 404) return null;
      if (!response.ok) {
        throw new Error(`Verification API error: ${response.status}`);
      }
      
      return await response.json() as VerificationData;
    }, 3, 1500);
    
    return data;
  } catch (error) {
    console.error('Failed to get verification data:', error);
    return null;
  }
};

/** Verify a certified document by certification ID */
export const verifyCertifiedDocument = async (certificationId: string): Promise<CertifiedVerificationData | null> => {
  try {
    const result = await retryWithBackoff(async () => {
      const response = await fetch(`${API_URL}/api/certification/verify/${encodeURIComponent(certificationId)}`);
      
      if (response.status === 404) return null;
      if (!response.ok) {
        const err = await response.json().catch(() => ({ error: 'Verification failed' }));
        throw new Error(err.error || `Verification failed: ${response.status}`);
      }
      
      const data = await response.json();
      return data.certificate as CertifiedVerificationData;
    }, 3, 1500);
    
    return result;
  } catch (error) {
    console.error('Failed to verify certified document:', error);
    return null;
  }
};

