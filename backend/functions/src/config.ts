// The Firebase Admin SDK needs to be initialized before you can use any of its services (Firestore, Auth, etc.)
import { initializeApp } from "firebase-admin/app";

export const adminApp = initializeApp();