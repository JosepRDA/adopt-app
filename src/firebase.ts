// import the functions you need from the sdks you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// todo: add sdks for firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// your web app's firebase configuration
const firebaseconfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// initialize firebase
const app = initializeApp(firebaseconfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
