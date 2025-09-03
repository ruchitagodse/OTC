import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth'

const firebaseConfig = {
  apiKey: "AIzaSyDV_bXxf4AEfwgva1OvXgUZFBJ0D2j7m2w",
  authDomain: "ujb-auth-login-app.firebaseapp.com",
  projectId: "ujb-auth-login-app",
  storageBucket: "ujb-auth-login-app.firebasestorage.app",
  messagingSenderId: "320676018585",
  appId: "1:320676018585:web:bec0e4b80b7387af42bb08"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);
const auth = getAuth(app);

export { db, storage,RecaptchaVerifier,signInWithPhoneNumber,auth};
