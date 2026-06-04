import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyCSB-rNVwW5W43pRbpCO4WPuWQkByzqvIQ",
  authDomain: "talent-school-online.firebaseapp.com",
  projectId: "talent-school-online",
  storageBucket: "talent-school-online.firebasestorage.app",
  messagingSenderId: "228019828322",
  appId: "1:228019828322:web:2c7740c377610af12fc33b"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;
