// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAd4H9qAq7HMhOre9AmgOQpNRxQyFmZjS4",
  authDomain: "career-counselling-4c5e6.firebaseapp.com",
  databaseURL: "https://career-counselling-4c5e6-default-rtdb.firebaseio.com",
  projectId: "career-counselling-4c5e6",
  storageBucket: "career-counselling-4c5e6.appspot.com",
  messagingSenderId: "114334936254",
  appId: "1:114334936254:web:472475503b50a54c3982ef",
  measurementId: "G-LJZ8J70L3T",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);
const auth = getAuth(app);

// Initialize storage with custom settings to help with CORS
const storage = getStorage(app);

// Add CORS configuration helper
export const getStorageDownloadURL = (path: string | number | boolean) => {
  // Add cache-busting parameter to avoid CORS issues during development
  const timestamp = new Date().getTime();
  return `https://firebasestorage.googleapis.com/v0/b/${
    firebaseConfig.storageBucket
  }/o/${encodeURIComponent(path)}?alt=media&t=${timestamp}`;
};

export { app, analytics, db, auth, storage };
