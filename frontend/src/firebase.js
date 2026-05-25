import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDQumn5PNlNouMEDyKBlHlppzog9d37htU",
  authDomain: "boosting-service-ad556.firebaseapp.com",
  projectId: "boosting-service-ad556",
  storageBucket: "boosting-service-ad556.firebasestorage.app",
  messagingSenderId: "366648169018",
  appId: "1:366648169018:web:e5e143d873537957161b03",
  measurementId: "G-5Q22Q4X846",
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
