// Firebase Configuration for NTC Frontend
// Initialize Firebase services for authentication and Firestore

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, enableIndexedDbPersistence, enableMultiTabIndexedDbPersistence } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';

// Your web app's Firebase configuration
// Using environment variables for better security and deployment flexibility
const firebaseConfig = {
  apiKey: "AIzaSyDRPc_RVdYxhXysqql-jeHC4V0w_N8aOXo",
  authDomain: "ntc-app-7ac7e.firebaseapp.com",
  projectId: "ntc-app-7ac7e",
  storageBucket: "ntc-app-7ac7e.firebasestorage.app",
  messagingSenderId: "580867573863",
  appId: "1:580867573863:web:f146130f87fe313b54acc2",
  measurementId: "G-9W9LKKVGST"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

// Enable offline persistence for Firestore
// This helps with mobile connectivity issues
if (typeof window !== 'undefined') {
  // Try to enable multi-tab persistence first (works in most modern browsers)
  enableMultiTabIndexedDbPersistence(db).catch((err) => {
    if (err.code === 'failed-precondition') {
      // Multiple tabs open, persistence can only be enabled in one tab at a time.
      console.warn('⚠️ Multi-tab persistence failed, trying single-tab persistence');
      enableIndexedDbPersistence(db).catch((error) => {
        if (error.code === 'unimplemented') {
          // The current browser doesn't support persistence
          console.warn('⚠️ Firestore persistence is not available in this browser');
        } else {
          console.error('❌ Failed to enable Firestore persistence:', error);
        }
      });
    } else if (err.code === 'unimplemented') {
      // The current browser doesn't support all required features
      console.warn('⚠️ Firestore multi-tab persistence is not available in this browser');
    } else {
      console.error('❌ Failed to enable Firestore multi-tab persistence:', err);
    }
  });
}

// Initialize Firebase Analytics
export const analytics = getAnalytics(app);

export default app;
