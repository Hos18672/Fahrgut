// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAkyw23Qchz9ZMjfJPpDiwdmFko_S9HyJI",
  authDomain: "fahrgut-17c77.firebaseapp.com",
  projectId: "fahrgut-17c77",
  storageBucket: "fahrgut-17c77.firebasestorage.app",
  messagingSenderId: "101434959455",
  appId: "1:101434959455:web:f81b78a0f82daa1daaddea",
  measurementId: "G-86SGX8JQQX"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);