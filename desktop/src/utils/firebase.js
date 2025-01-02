"use strict";
// SDK in backend has access to privileged features and doesn't need the same client-side authentication setup.
Object.defineProperty(exports, "__esModule", { value: true });
exports.functions = exports.auth = exports.app = void 0;
var app_1 = require("firebase/app");
var auth_1 = require("firebase/auth");
var functions_1 = require("firebase/functions");
var firebaseConfig = {
    apiKey: "AIzaSyDmNToii9cMhcGsDOcGz24tDQij1RbPqw8",
    authDomain: "livsashdal204240sjmfd.firebaseapp.com",
    projectId: "livsashdal204240sjmfd",
    storageBucket: "livsashdal204240sjmfd.firebasestorage.app",
    messagingSenderId: "440601274990",
    appId: "1:440601274990:web:d549610ac0ea32636cd47f"
};
exports.app = (0, app_1.initializeApp)(firebaseConfig);
exports.auth = (0, auth_1.getAuth)(exports.app);
exports.functions = (0, functions_1.getFunctions)(exports.app);
