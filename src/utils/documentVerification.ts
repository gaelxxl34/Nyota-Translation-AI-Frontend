// Document Verification Utilities
// Fetches verification data from the backend API (public, no auth required)

/** Interface for verification data */
export interface VerificationData {
  studentName: string;
  generationDate: string;
  documentTitle?: string;
  documentType?: string;
  sourceLanguage?: string;
  targetLanguage?: string;
  formType?: string;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

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
      console.log(`🔄 Verification attempt ${attempt + 1}/${maxRetries}`);
      return await fn();
    } catch (error) {
      lastError = error as Error;
      console.warn(`⚠️ Attempt ${attempt + 1} failed:`, error);
      
      if (attempt < maxRetries - 1) {
        const waitTime = delayMs * Math.pow(2, attempt);
        console.log(`⏳ Waiting ${waitTime}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
  }
  
  throw lastError || new Error('Max retries exceeded');
};

/** Retrieve verification data via the backend API (no Firestore permissions needed) */
export const getVerificationData = async (documentId: string): Promise<VerificationData | null> => {
  console.log('🔍 Starting verification for document:', documentId);
  
  try {
    const data = await retryWithBackoff(async () => {
      console.log('📤 Calling backend verification API for:', documentId);
      const response = await fetch(`${API_URL}/api/verify/${encodeURIComponent(documentId)}`);
      
      if (response.status === 404) {
        console.log('❌ Document not found (404)');
        return null;
      }
      
      if (!response.ok) {
        throw new Error(`Verification API error: ${response.status} ${response.statusText}`);
      }
      
      const result = await response.json();
      console.log('📥 Received verification data:', result);
      return result as VerificationData;
    }, 3, 1500);
    
    return data;
  } catch (error) {
    console.error('❌ Failed to get verification data:', error);
    console.error('❌ Error details:', {
      name: (error as Error)?.name,
      message: (error as Error)?.message,
    });
    return null;
  }
};
