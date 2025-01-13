// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from 'firebase/auth';

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDnMscEpjBugNdk99UdKgILjDNs_riNBEM",
  authDomain: "aceinterview-4fbbb.firebaseapp.com",
  projectId: "aceinterview-4fbbb",
  storageBucket: "aceinterview-4fbbb.appspot.com",
  messagingSenderId: "12462264746",
  appId: "1:12462264746:web:481ecd96bd48c86e981bd3",
  measurementId: "G-P41EBDK0TQ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

const auth = getAuth(app);

export { auth };
