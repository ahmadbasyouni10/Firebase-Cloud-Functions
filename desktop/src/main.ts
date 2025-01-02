// desktop/src/main.ts
import { app, BrowserWindow, ipcMain, Tray, Menu } from 'electron';
import { getAuth, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from './utils/firebase';
import path = require('path');
import * as fs from 'fs';

let tray: Tray | null = null;
let authWindow: BrowserWindow | null = null;

async function handleGoogleSignIn() {
    try {
        const provider = new GoogleAuthProvider();
        const result = await signInWithPopup(auth, provider);
        
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
    } catch (error) {
        console.error('Auth error:', error);
    }
}

function createTray() {
    // Get the application's root directory (where package.json is)
    const rootDir = process.cwd();
    
    // Define multiple possible locations for the icon
    const iconPaths = [
        path.join(rootDir, 'assets', 'code.png'),        // For production
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
        tray = new Tray('');
    } else {
        console.log('Successfully found tray icon at:', iconPath);
        tray = new Tray(iconPath);
    }
        
        const contextMenu = Menu.buildFromTemplate([
            {
                label: 'Sign Out',
                click: async () => {
                    await auth.signOut();
                    createAuthWindow();
                }
            },
            { type: 'separator' },
            {
                label: 'Quit',
                click: () => app.quit()
            }
        ]);
        
        tray.setToolTip('Code Time Tracker');
        tray.setContextMenu(contextMenu);
}

// Also update the auth window creation to use the correct path
async function createAuthWindow() {
    authWindow = new BrowserWindow({
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
    } catch (error) {
        console.error('Error loading auth window:', error);
    }
}


// Add error handling to the main app ready handler
app.whenReady().then(async () => {
    try {
        createTray();
        
        const currentUser = auth.currentUser;
        if (currentUser) {
            startTracking();
        } else {
            await createAuthWindow();
        }
    } catch (error) {
        console.error('Error during app initialization:', error);
    }
});

function startTracking() {
    // Your existing tracking code goes here
    console.log('Starting tracking for user:', auth.currentUser?.email);
}

// Handle auth request from renderer
ipcMain.on('google-sign-in', handleGoogleSignIn);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});