"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
// desktop/src/main.ts
const electron_1 = require("electron");
const auth_1 = require("firebase/auth");
const firebase_1 = require("./utils/firebase");
const path = require("path");
const fs = __importStar(require("fs"));
let tray = null;
let authWindow = null;
async function handleGoogleSignIn() {
    try {
        const provider = new auth_1.GoogleAuthProvider();
        const result = await (0, auth_1.signInWithPopup)(firebase_1.auth, provider);
        // Store user info
        const user = result.user;
        console.log('Signed in user:', user.email);
        // Close auth window and start tracking
        if (authWindow) {
            authWindow.webContents.send('auth-success');
            authWindow = null;
        }
        // Start the tracking functionality
        startTracking();
    }
    catch (error) {
        console.error('Auth error:', error);
    }
}
function createTray() {
    // Get the application's root directory (where package.json is)
    const rootDir = process.cwd();
    // Define multiple possible locations for the icon
    const iconPaths = [
        path.join(rootDir, 'assets', 'code.png'), // For production
        path.join(rootDir, 'src', 'assets', 'code.png'), // For development
        path.join(__dirname, '..', 'assets', 'code.png') // Alternative production path
    ];
    // Log all the paths we're checking (this helps us debug)
    console.log('Searching for tray icon in these locations:');
    iconPaths.forEach(p => {
        console.log(`Checking ${p}: ${fs.existsSync(p) ? 'Found!' : 'Not found'}`);
    });
    // Find the first path that exists
    const iconPath = iconPaths.find(p => fs.existsSync(p));
    if (!iconPath) {
        console.error('Could not find the tray icon in any of the expected locations.');
        console.log('Working directory:', process.cwd());
        console.log('__dirname:', __dirname);
        // Create a tray without an icon as a fallback
        tray = new electron_1.Tray('');
    }
    else {
        console.log('Successfully found tray icon at:', iconPath);
        tray = new electron_1.Tray(iconPath);
    }
    const contextMenu = electron_1.Menu.buildFromTemplate([
        {
            label: 'Sign Out',
            click: async () => {
                await firebase_1.auth.signOut();
                createAuthWindow();
            }
        },
        { type: 'separator' },
        {
            label: 'Quit',
            click: () => electron_1.app.quit()
        }
    ]);
    tray.setToolTip('Code Time Tracker');
    tray.setContextMenu(contextMenu);
}
// Also update the auth window creation to use the correct path
async function createAuthWindow() {
    authWindow = new electron_1.BrowserWindow({
        width: 400,
        height: 600,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });
    try {
        const authPath = path.join(__dirname, 'auth.html');
        console.log('Loading auth window from:', authPath);
        console.log('File exists:', fs.existsSync(authPath));
        await authWindow.loadFile(authPath);
        // Add error handling for page loads
        authWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
            console.error('Failed to load auth window:', errorDescription);
        });
        // Debug: Show developer tools in development
        if (process.argv.includes('--debug')) {
            authWindow.webContents.openDevTools();
        }
    }
    catch (error) {
        console.error('Error loading auth window:', error);
    }
}
// Add error handling to the main app ready handler
electron_1.app.whenReady().then(async () => {
    try {
        createTray();
        const currentUser = firebase_1.auth.currentUser;
        if (currentUser) {
            startTracking();
        }
        else {
            await createAuthWindow();
        }
    }
    catch (error) {
        console.error('Error during app initialization:', error);
    }
});
function startTracking() {
    // Your existing tracking code goes here
    console.log('Starting tracking for user:', firebase_1.auth.currentUser?.email);
}
// Handle auth request from renderer
electron_1.ipcMain.on('google-sign-in', handleGoogleSignIn);
electron_1.app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        electron_1.app.quit();
    }
});
