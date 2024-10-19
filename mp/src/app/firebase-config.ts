import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth'; // Import Auth functions
import { getFirestore } from 'firebase/firestore'; // If using Firestore

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyByKKRL3FvkR6km-TAPS6ih4mvBnK_-hY8",
    authDomain: "miniproyecto-561b9.firebaseapp.com",
    projectId: "miniproyecto-561b9",
    storageBucket: "miniproyecto-561b9.appspot.com",
    messagingSenderId: "1019422216789",
    appId: "1:1019422216789:web:415a54c5f7b3a360b83adc"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app); // Get Auth instance
// export const db = getFirestore(app); // If using Firestore
