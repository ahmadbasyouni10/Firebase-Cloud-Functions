// SDK in backend has access to privileged features and doesn't need the same client-side authentication setup.

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFunctions } from "firebase/functions";

const firebaseConfig = {
    apiKey: "AIzaSyDmNToii9cMhcGsDOcGz24tDQij1RbPqw8",
    authDomain: "livsashdal204240sjmfd.firebaseapp.com",
    projectId: "livsashdal204240sjmfd",
    storageBucket: "livsashdal204240sjmfd.firebasestorage.app",
    messagingSenderId: "440601274990",
    appId: "1:440601274990:web:d549610ac0ea32636cd47f"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const functions = getFunctions(app);