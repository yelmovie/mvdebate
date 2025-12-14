// DEBATETOGETHER Project Firebase Config
// IMPORTANT: Replace the placeholders below with the actual values from your Firebase Console.
// Best practice: Use environment variables (e.g. .env.local) to keep these secure.

const config = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// Validate Config
const requiredKeys = [
  "apiKey", 
  "authDomain", 
  "projectId"
] as const;

const missingKeys = requiredKeys.filter(key => !config[key]);

if (missingKeys.length > 0) {
  if (typeof window !== "undefined") {
    console.error(
      `[Firebase Config] Missing required environment variables: ${missingKeys.join(", ")}. \n` +
      `If you are running locally, check your .env.local file.\n` +
      `If you are deployed (e.g. Vercel), add these variables in your Project Settings.`
    );
  }
} else {
  // Debug Verification
  if (typeof window !== "undefined") {
    console.log("[Firebase Config] Environment variables loaded successfully:", {
      apiKey: !!config.apiKey,
      authDomain: !!config.authDomain,
      projectId: !!config.projectId,
      storageBucket: !!config.storageBucket,
      messagingSenderId: !!config.messagingSenderId,
      appId: !!config.appId
    });
  }
}

export const firebaseConfig = config;

// If you want to use hardcoded values temporarily (NOT RECOMMENDED for production),
// uncomment and fill in the values below:

/*
export const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "debatetogether-xxxxx.firebaseapp.com",
  projectId: "debatetogether-xxxxx",
  storageBucket: "debatetogether-xxxxx.appspot.com",
  messagingSenderId: "1234567890",
  appId: "1:1234567890:web:xxxxx"
};
*/
