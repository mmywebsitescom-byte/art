// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDtD0x7ugRWrWmJr0e2hkcwy8gPCUquo5c",
  authDomain: "ascii-art-generator-7482b.firebaseapp.com",
  projectId: "ascii-art-generator-7482b",
  storageBucket: "ascii-art-generator-7482b.firebasestorage.app",
  messagingSenderId: "213573760148",
  appId: "1:213573760148:web:aa82f3d0f44472268db081",
  measurementId: "G-TT5FTN5TP3"
};

// Initialize Firebase (prevent re-initialization in Next.js development)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export { app, auth, googleProvider };
