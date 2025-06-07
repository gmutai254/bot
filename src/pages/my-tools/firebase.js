import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyA2WIu5van2aqyn2U9dVZgD38LhuZ9EpRw",
    authDomain: "members-a5efc.firebaseapp.com",
    projectId: "members-a5efc",
    storageBucket: "members-a5efc.appspot.com",
    messagingSenderId: "882680583507",
    appId: "1:882680583507:web:3b320341b98682ef6afda6",
    measurementId: "G-NY5BX5KKS3"
  };

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);