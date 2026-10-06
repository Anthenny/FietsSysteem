import { initializeApp } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";

// Bij gebruik van emulators maken de exacte keys niet uit, zolang ze niet leeg zijn
const firebaseConfig = {
  apiKey: "demo-apikey",
  authDomain: "demo-project.firebaseapp.com",
  projectId: "fiets-meetsysteem",
  storageBucket: "demo-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:demo"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Koppel de frontend direct aan je lokale Auth Emulator op poort 9099
connectAuthEmulator(auth, "http://127.0.0.1:9099");