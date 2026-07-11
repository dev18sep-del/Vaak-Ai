import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import firebaseConfig from "../../firebase-applet-config.json";

let auth: ReturnType<typeof getAuth> | null = null;

if (firebaseConfig.apiKey) {
  const app = initializeApp(firebaseConfig);
  auth = getAuth(app);
}

export { auth };
