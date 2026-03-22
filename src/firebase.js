import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyAE0GQYWCfy9UD6zMyvH3Ty3HvvnWPK0l8",
  authDomain: "grest-classifica-112e7.firebaseapp.com",
  databaseURL: "https://grest-classifica-112e7-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "grest-classifica-112e7",
  storageBucket: "grest-classifica-112e7.firebasestorage.app",
  messagingSenderId: "418655604162",
  appId: "1:418655604162:web:3d31f0f398127c9b6eda5b"
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);