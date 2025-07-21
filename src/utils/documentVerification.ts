// Document Verification Utilities
// Handles fetching verification data from Firestore

import { db } from '../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

/** Interface for verification data */
export interface VerificationData {
  studentName: string;
  generationDate: string;
}

/** Retrieve verification data from Firestore - Look in bulletins collection */
export const getVerificationData = async (documentId: string): Promise<VerificationData | null> => {
  try {
    // Query the bulletins collection for a document where id field matches documentId
    const bulletinsRef = collection(db, 'bulletins');
    const q = query(bulletinsRef, where('id', '==', documentId));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const bulletinDoc = querySnapshot.docs[0];
      const bulletinData = bulletinDoc.data();
      
      let studentName = 'Unknown Student';
      
      // Step 1: Check if editedData exists and has studentName
      if (bulletinData.editedData?.studentName) {
        studentName = bulletinData.editedData.studentName;
      } 
      // Step 2: If no studentName found in editedData, check versions subcollection
      else {
        try {
          const versionsRef = collection(bulletinDoc.ref, 'versions');
          const versionsSnapshot = await getDocs(versionsRef);
          
          if (!versionsSnapshot.empty) {
            const versionDoc = versionsSnapshot.docs[0];
            const versionData = versionDoc.data();
            
            // Check if there's a data array
            if (versionData.data && Array.isArray(versionData.data)) {
              // Look through the data array for studentName
              for (const item of versionData.data) {
                if (item.studentName) {
                  studentName = item.studentName;
                  break;
                }
              }
            } else if (versionData.data?.studentName) {
              // Check if data is an object with studentName
              studentName = versionData.data.studentName;
            }
          }
        } catch (versionsError) {
          console.error('Error checking versions subcollection:', versionsError);
        }
      }
      
      // Step 3: Fallback to other possible field locations
      if (studentName === 'Unknown Student') {
        const fallbackFields = ['studentName', 'student_name', 'name', 'Student Name'];
        
        for (const field of fallbackFields) {
          if (bulletinData[field]) {
            studentName = bulletinData[field];
            break;
          }
        }
      }
      
      return {
        studentName: studentName,
        generationDate: bulletinData.createdAt || bulletinData.uploadedAt || new Date().toISOString()
      };
    }
    
    return null;
  } catch (error) {
    console.error('Failed to get verification data from bulletins:', error);
    return null;
  }
};
