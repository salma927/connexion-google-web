import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyB-i_VIZBY8ch_4e9ESofx3GKOHNyN-IT0",
  authDomain: "studyhub-d56f4.firebaseapp.com",
  projectId: "studyhub-d56f4",
  storageBucket: "studyhub-d56f4.firebasestorage.app",
  messagingSenderId: "922472024808",
  appId: "1:922472024808:web:1bc53c3792735f2d4bd75d"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: "select_account" });
