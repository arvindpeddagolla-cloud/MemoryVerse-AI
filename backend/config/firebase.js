import admin from 'firebase-admin';
import dotenv from 'dotenv';

dotenv.config();

let dbInstance = null;
let bucketInstance = null;
let isFirebaseInitialized = false;

try {
  // Check if we have Firebase service account environment variables or a configuration JSON
  // In standard deployments, FIREBASE_SERVICE_ACCOUNT can be set as a JSON string
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET
    });
    dbInstance = admin.firestore();
    bucketInstance = admin.storage().bucket();
    isFirebaseInitialized = true;
    console.log('Firebase Admin SDK initialized successfully.');
  } else if (process.env.VITE_FIREBASE_PROJECT_ID) {
    // Attempt default configuration initialization
    admin.initializeApp({
      projectId: process.env.VITE_FIREBASE_PROJECT_ID,
      storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET
    });
    dbInstance = admin.firestore();
    bucketInstance = admin.storage().bucket();
    isFirebaseInitialized = true;
    console.log('Firebase Admin SDK initialized using Project ID.');
  } else {
    console.log('Firebase environment variables missing. Firebase services running in Local Mock mode.');
  }
} catch (error) {
  console.warn('Failed to initialize Firebase Admin SDK. Falling back to Local Mock mode.', error.message);
}

export const db = dbInstance;
export const bucket = bucketInstance;
export const firebaseEnabled = isFirebaseInitialized;
