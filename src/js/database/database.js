import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import * as firestore from "firebase/firestore";
import * as fireauth from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyDqoSqneXDFOmyi9-XFDyk9quKtVDBb-v4",
    authDomain: "registrator-a9b97.firebaseapp.com",
    projectId: "registrator-a9b97",
    storageBucket: "registrator-a9b97.appspot.com",
    messagingSenderId: "989621159927",
    appId: "1:989621159927:web:f26d4bd4635bc18493d0f2",
    measurementId: "G-MEK11PRP2T"
  };

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const database = firestore.getFirestore(app);
export const auth = fireauth.getAuth(app);