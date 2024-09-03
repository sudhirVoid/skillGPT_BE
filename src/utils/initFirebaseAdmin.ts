import admin from 'firebase-admin';
import fs from 'fs';
const initializeFirebaseAdmin = () => {
    try {
      // Read and parse the service account key file
      const serviceAccountFile = 'skillGptServiceAccountKey.json'; // Path to your JSON file
      const serviceAccountJson = fs.readFileSync(serviceAccountFile, 'utf8');
      const serviceAccount = JSON.parse(serviceAccountJson);
  
      // Initialize Firebase Admin SDK
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
  
      console.log('Firebase Admin SDK initialized successfully.');
    } catch (error:any) {
      console.error('Error initializing Firebase Admin SDK:', error.message);
      process.exit(1);
    }
  };

  export {initializeFirebaseAdmin}