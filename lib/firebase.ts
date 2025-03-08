'use client';

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getAnalytics } from "firebase/analytics";
import { getDatabase } from 'firebase/database';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// Initialize Analytics only on client side
let analytics;
if (typeof window !== 'undefined') {
  analytics = getAnalytics(app);
}
const storage = getStorage(app);

// Get Realtime Database instance
export const database = getDatabase(app);

export const uploadImage = async (file: File): Promise<string> => {
  try {
    console.log("Starting file upload...", { fileName: file.name, fileSize: file.size });

    // Create a unique file name
    const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
    console.log("Generated filename:", fileName);

    // Create storage reference with the correct path
    const storageRef = ref(storage, `leakage-images/${fileName}`);
    console.log("Storage reference created:", storageRef.fullPath);

    // Upload the file with metadata
    const metadata = {
      contentType: file.type,
      customMetadata: {
        'uploadedAt': new Date().toISOString(),
      }
    };

    console.log("Uploading file with metadata...");
    const snapshot = await uploadBytes(storageRef, file, metadata);
    console.log("File uploaded successfully", snapshot);

    // Get the download URL
    console.log("Getting download URL...");
    const downloadURL = await getDownloadURL(snapshot.ref);
    console.log("Download URL obtained:", downloadURL);

    return downloadURL;
  } catch (error) {
    console.error("Error in uploadImage:", error);
    if (error instanceof Error) {
      // Log more details about the error
      console.error("Error details:", {
        message: error.message,
        name: error.name,
        stack: error.stack,
        config: firebaseConfig // Log config for debugging
      });
      throw new Error(`Upload failed: ${error.message}`);
    }
    throw new Error("Failed to upload image. Please try again.");
  }
};




