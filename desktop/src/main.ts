import { app, BrowserWindow, Tray, Menu } from 'electron'
import path from 'path';
import * as fs from 'fs';
import activeWin from 'active-win';
import axios from 'axios';

// tray is of type Tray | null and originally set to null
let tray: Tray | null = null;
let mainWindow: BrowserWindow | null = null;
const userId = "1234"

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 400,
        height: 600,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    })

    const mainPath = path.join(__dirname, 'auth.html');
    mainWindow.loadFile(mainPath);

    mainWindow.on('close', (event: Electron.Event) => {
        event.preventDefault();
        mainWindow?.hide();
    })
}

async function trackVsCode() {
    const window = await activeWin();
    if (window && window.owner.name === 'Code') {
        const activeFile = window.title; // Extract active file name from window title
        const language = activeFile.split('.').pop(); // Extract file extension as language

        try {
            // Send data to your backend
            await axios.post('http://127.0.0.1:5001/livsashdal204240sjmfd/us-central1/trackCodingSession', {
                userId: '1234', // Replace with dynamic user ID if needed
                editor: 'vscode',
                language: language,
            });

            console.log(`Tracking active file: ${activeFile}`);

        } catch (error: any) {
            console.error('Error sending data:', error.message);
        }
    }
}

    

function createTray() {
    const iconPath = path.join(__dirname, 'assets', 'code.png');

    if (!fs.existsSync(iconPath)) {
        console.error("Icon not found");
        return;
    }

    tray = new Tray(iconPath);
    const contextMenu = Menu.buildFromTemplate([
        {
          label: 'Open',
          click: () => {
            if (!mainWindow) {
              createWindow();
            } else {
              mainWindow.show();
            }
          },
        },
        { label: 'Quit', click: () => app.quit() },
      ]);
      tray.setToolTip('Code Time Tracker');
      tray.setContextMenu(contextMenu);
}

app.whenReady().then(() => {
    createTray();
    setInterval(trackVsCode, 30000);

    app.on('activate', () => {
        if (!mainWindow) {
            createWindow();
        } else {
            mainWindow.show();
        }
    })
})

