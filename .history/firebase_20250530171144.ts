// firebase.ts
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyC6jKMnlwW8Iqucf5RlTXkSjCTOfDn_fhY",
  authDomain: "chopmeet-dda66.firebaseapp.com",
  databaseURL: "https://chopmeet-dda66-default-rtdb.firebaseio.com",
  projectId: "chopmeet-dda66",
  storageBucket: "chopmeet-dda66.appspot.com",
  messagingSenderId: "114256882016",
  appId: "1:114256882016:web:36db75c94b0f741021d605",
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);
const storage = getStorage(app);

export { db, auth, storage };
