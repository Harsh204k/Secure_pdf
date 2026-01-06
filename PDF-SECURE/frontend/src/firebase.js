import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDkW3GI69HLYmdmhH06pvvGiWVb1uyLX_U",
  authDomain: "pdf-9bb44.firebaseapp.com",
  projectId: "pdf-9bb44",
  storageBucket: "pdf-9bb44.firebasestorage.app",
  messagingSenderId: "860500731388",
  appId: "1:860500731388:web:ff7b3f6c40106d612bbe79",
  measurementId: "G-4F76RZPDS4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();