import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyC6Sxddk-IQZOhp-A4-TsfsLYLlxg7_Z30",
  authDomain: "testtask-e88dc.firebaseapp.com",
  projectId: "testtask-e88dc",
  storageBucket: "testtask-e88dc.firebasestorage.app",
  messagingSenderId: "1010561781721",
  appId: "1:1010561781721:web:e7fac1a53d6ddd4bb693c8",
  measurementId: "G-PVKCSETE5B"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);