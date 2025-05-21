import { initializeApp } from "firebase/app";
import { getAuth,GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyD_Ya40MIhqG3b8UxQ31sZYV9DuF-3_vmM",
  authDomain: "interview-459619.firebaseapp.com",
  projectId: "interview-459619",
  storageBucket: "interview-459619.firebasestorage.app",
  messagingSenderId: "318289304307",
  appId: "1:318289304307:web:5edf2d5c303a086adc7586",
  measurementId: "G-H28NRXW5VJ"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();


// ***************************** AUTH Has been inmplmented following : https://medium.com/@daboigbae/learn-react-authentication-with-firebase-83c12a08f0f5