import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAEyFBMCtC5dfvKWV5l4mDGnl9sJH3JF2A",
  authDomain: "integration-discord-9e262.firebaseapp.com",
  projectId: "integration-discord-9e262",
  storageBucket: "integration-discord-9e262.firebasestorage.app",
  messagingSenderId: "332636920346",
  appId: "1:332636920346:web:e5a49918c25521900e8fa3",
  measurementId: "G-D2J647FLMH"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
