const { app, BrowserWindow, Menu, ipcMain } = require('electron');
const path = require('path');
const isDev = require('electron-is-dev');

// Cargar variables de entorno
require('dotenv').config();

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
    icon: path.join(__dirname, '../assets/icon.ico'),
  });

  const startUrl = isDev
    ? 'http://localhost:3000'
    : `file://${path.join(__dirname, '../build/index.html')}`;

  mainWindow.loadFile(path.join(__dirname, 'index.html'));

  // Comentar esta línea para desactivar DevTools en producción
  // mainWindow.webContents.openDevTools();

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

// IPC handlers
ipcMain.handle('get-app-version', () => {
  return app.getVersion();
});

ipcMain.handle('get-env-vars', () => {
  return {
    sharepoint: {
      connected: !!process.env.SHAREPOINT_TENANT_ID,
      hasCredentials: !!(
        process.env.SHAREPOINT_TENANT_ID &&
        process.env.SHAREPOINT_CLIENT_ID &&
        process.env.SHAREPOINT_CLIENT_SECRET
      )
    }
  };
});

// Menu
const template = [
  {
    label: 'Archivo',
    submenu: [
      {
        label: 'Salir',
        accelerator: 'CmdOrCtrl+Q',
        click: () => {
          app.quit();
        },
      },
    ],
  },
  {
    label: 'Ver',
    submenu: [
      {
        label: 'Recargar',
        accelerator: 'CmdOrCtrl+R',
        click: () => {
          mainWindow.webContents.reload();
        },
      },
      {
        label: 'Herramientas de desarrollador',
        accelerator: 'CmdOrCtrl+Shift+I',
        click: () => {
          mainWindow.webContents.toggleDevTools();
        },
      },
    ],
  },
];

const menu = Menu.buildFromTemplate(template);
Menu.setApplicationMenu(menu);

