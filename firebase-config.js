import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js";

import { getFirestore } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";

import { getAuth } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyDmqHmJE5VAFhnpb96GvBp1R1cVnWu4Gtc",
  authDomain: "vikstock-15ad1.firebaseapp.com",
  projectId: "vikstock-15ad1",
  storageBucket: "vikstock-15ad1.firebasestorage.app",
  messagingSenderId: "430360978659",
  appId: "1:430360978659:web:38e11fbb08b69cff6311d6"
};

const app = initializeApp(firebaseConfig);

const db = getFirestore(app);

const auth = getAuth(app);

export { db, auth };
