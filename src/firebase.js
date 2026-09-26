import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBYHamG2__2kqyBN0sSwyUYlRNWE8LFR5M",
  authDomain: "afro-services-guangzhou.firebaseapp.com",
  projectId: "afro-services-guangzhou",
  storageBucket: "afro-services-guangzhou.firebasestorage.app",
  messagingSenderId: "88282769759",
  appId: "1:88282769759:web:8299e50170c51a8c78aeea",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);