// Document Verification Utilities
// Handles fetching verification data from Firestore

import { db } from '../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

/** Interface for verification data */
export interface VerificationData {
  studentName: string;
  generationDate: string;
}

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

/** Retrieve verification data from Firestore - Look in bulletins collection */
export const getVerificationData = async (documentId: string): Promise<VerificationData | null> => {
  console.log('🔍 Starting verification for document:', documentId);
  console.log('📱 User Agent:', navigator.userAgent);
  console.log('🌐 Online status:', navigator.onLine);
  
  try {
    // Use retry logic to handle mobile network issues
    const querySnapshot = await retryWithBackoff(async () => {
      // Query the bulletins collection for a document where id field matches documentId
      const bulletinsRef = collection(db, 'bulletins');
      const q = query(bulletinsRef, where('id', '==', documentId));
      
      console.log('📤 Executing Firestore query for documentId:', documentId);
      const snapshot = await getDocs(q);
      console.log('📥 Query completed. Documents found:', snapshot.size);
      
      return snapshot;
    }, 3, 1500); // 3 retries with 1.5s initial delay
    
    if (!querySnapshot.empty) {
      console.log('✅ Document found in Firestore');
      const bulletinDoc = querySnapshot.docs[0];
      const bulletinData = bulletinDoc.data();
      
      console.log('📄 Document data keys:', Object.keys(bulletinData));
      console.log('📄 Has editedData:', !!bulletinData.editedData);
      console.log('📄 editedData keys:', bulletinData.editedData ? Object.keys(bulletinData.editedData) : 'N/A');
      
      let studentName = 'Unknown Student';
      
      // Step 1: Check if editedData exists and has studentName
      if (bulletinData.editedData?.studentName) {
        studentName = bulletinData.editedData.studentName;
        console.log('✅ Found studentName in editedData:', studentName);
      } 
      // Step 2: If no studentName found in editedData, check versions subcollection
      else {
        console.log('⚠️ No studentName in editedData, checking versions...');
        try {
          const versionsRef = collection(bulletinDoc.ref, 'versions');
          const versionsSnapshot = await getDocs(versionsRef);
          
          console.log('📚 Versions subcollection size:', versionsSnapshot.size);
          
          if (!versionsSnapshot.empty) {
            const versionDoc = versionsSnapshot.docs[0];
            const versionData = versionDoc.data();
            
            console.log('📚 Version data keys:', Object.keys(versionData));
            
            // Check if there's a data array
            if (versionData.data && Array.isArray(versionData.data)) {
              console.log('📚 Version has data array with length:', versionData.data.length);
              // Look through the data array for studentName
              for (const item of versionData.data) {
                if (item.studentName) {
                  studentName = item.studentName;
                  console.log('✅ Found studentName in version data array:', studentName);
                  break;
                }
              }
            } else if (versionData.data?.studentName) {
              // Check if data is an object with studentName
              studentName = versionData.data.studentName;
              console.log('✅ Found studentName in version data object:', studentName);
            }
          }
        } catch (versionsError) {
          console.error('❌ Error checking versions subcollection:', versionsError);
        }
      }
      
      // Step 3: Fallback to other possible field locations
      if (studentName === 'Unknown Student') {
        console.log('⚠️ Still no studentName found, trying fallback fields...');
        const fallbackFields = ['studentName', 'student_name', 'name', 'Student Name'];
        
        for (const field of fallbackFields) {
          if (bulletinData[field]) {
            studentName = bulletinData[field];
            console.log(`✅ Found studentName in fallback field "${field}":`, studentName);
            break;
          }
        }
      }
      
      const verificationData = {
        studentName: studentName,
        generationDate: bulletinData.createdAt || bulletinData.uploadedAt || new Date().toISOString()
      };
      
      console.log('✅ Returning verification data:', verificationData);
      return verificationData;
    }
    
    console.log('❌ No document found with ID:', documentId);
    return null;
  } catch (error) {
    console.error('❌ Failed to get verification data from bulletins:', error);
    console.error('❌ Error details:', {
      name: (error as Error)?.name,
      message: (error as Error)?.message,
      stack: (error as Error)?.stack
    });
    return null;
  }
};
