import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY?.trim(),
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN?.trim(),
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID?.trim(),
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET?.trim(),
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID?.trim(),
  appId: import.meta.env.VITE_FIREBASE_APP_ID?.trim(),
};

// Validate configuration
let isValidConfig = true;
let configError: string | null = null;

if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
  isValidConfig = false;
  configError = 'VITE_FIREBASE_API_KEY and VITE_FIREBASE_PROJECT_ID are required';
  console.error(
    '❌ Firebase Configuration Error:\n' +
    configError + '\n\n' +
    'Silakan buat file .env di root project dengan:\n' +
    'VITE_FIREBASE_API_KEY=your_api_key\n' +
    'VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com\n' +
    'VITE_FIREBASE_PROJECT_ID=your_project_id\n' +
    'VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com\n' +
    'VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id\n' +
    'VITE_FIREBASE_APP_ID=your_app_id\n\n' +
    'Dapatkan credentials dari: https://console.firebase.google.com → Project Settings → General'
  );
}

// Initialize Firebase
let app: FirebaseApp | null = null;
let db: Firestore | null = null;
let auth: Auth | null = null;

if (isValidConfig) {
  try {
    // Initialize app only if not already initialized
    if (getApps().length === 0) {
      app = initializeApp(firebaseConfig);
    } else {
      app = getApps()[0];
    }
    
    // Initialize Firestore
    db = getFirestore(app);
    
    // Initialize Auth (we're using Supabase for auth, but Firebase Auth is available if needed)
    auth = getAuth(app);
    
    console.log('✅ Firebase initialized successfully');
  } catch (error) {
    console.error('Error initializing Firebase:', error);
    isValidConfig = false;
    configError = error instanceof Error ? error.message : 'Unknown error';
  }
}

export { app, db, auth, isValidConfig, configError };
export default app;

