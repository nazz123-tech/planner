
import { initializeApp } from "firebase/app";
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyB9bdckBZcy0e4zL542r5QviF4SIWcWGfU",
  authDomain: "planer-142df.firebaseapp.com",
  projectId: "planer-142df",
  storageBucket: "planer-142df.firebasestorage.app",
  messagingSenderId: "283633401973",
  appId: "1:283633401973:web:f2dbf4d6bbf41d0cac783c",
  measurementId: "G-ZJBKFFHN73"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app)
