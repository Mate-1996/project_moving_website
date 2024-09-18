// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAN9VykJqaLhQ7ln5z-sHADktufA2hwST8",
  authDomain: "centori-moving.firebaseapp.com",
  projectId: "centori-moving",
  storageBucket: "centori-moving.appspot.com",
  messagingSenderId: "117443118737",
  appId: "1:117443118737:web:cc14ea475604907779e130",
  measurementId: "G-XQ275Y304Z"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { auth };