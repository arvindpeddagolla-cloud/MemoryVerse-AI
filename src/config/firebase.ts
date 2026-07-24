import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyDJYQUrGBXrrfq-glajWMNrb3Bdj4po1Zg",
  authDomain: "memory-ai-7a8be.firebaseapp.com",
  projectId: "memory-ai-7a8be",
  storageBucket: "memory-ai-7a8be.firebasestorage.app",
  messagingSenderId: "104918154366",
  appId: "1:104918154366:web:ae855613b0e2b162952c2f",
  measurementId: "G-T3TKDZ12V5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Configure Google Provider settings
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

export default app;
