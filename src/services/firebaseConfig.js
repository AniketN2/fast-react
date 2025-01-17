// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDnvSinzJ_rb2X88aii3iLw2K9RsAtyzq8",
  authDomain: "fast-react-pizza-2826e.firebaseapp.com",
  projectId: "fast-react-pizza-2826e",
  storageBucket: "fast-react-pizza-2826e.firebasestorage.app",
  messagingSenderId: "503746871566",
  appId: "1:503746871566:web:07cbd2676fcafb423f575f",
  measurementId: "G-P6TW7SJ974"
};


const app = initializeApp(firebaseConfig);

// Optional: Use analytics only if needed
// const analytics = getAnalytics(app); // Uncomment if analytics is required

// Initialize Firestore
const db = getFirestore(app);

export default db;