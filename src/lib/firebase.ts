import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDpTpNBuNv1l_-26l1HJBkfAMAv1Ho6Eng",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "gen-lang-client-0009333899.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "gen-lang-client-0009333899",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "gen-lang-client-0009333899.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "826888509817",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:826888509817:web:0771292652facb332db7a8"
};

const app = initializeApp(firebaseConfig);
const databaseId = import.meta.env.VITE_FIREBASE_DATABASE_ID || "ai-studio-creativeagencyla-cfa05794-9491-4748-8045-c46e5ed37f9c";

export const db = getFirestore(app, databaseId);
export const auth = getAuth(app);
export const storage = getStorage(app);

export const uploadImage = async (file: File, path: string): Promise<string> => {
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, file);
  return getDownloadURL(storageRef);
};
