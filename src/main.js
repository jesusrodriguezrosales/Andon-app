const { app, BrowserWindow, Menu, ipcMain, dialog } = require('electron');
const path = require('path');
const isDev = require('electron-is-dev');
const fs = require('fs');
const XLSX = require('xlsx');

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

// Save file dialog
ipcMain.handle('save-file', async (event, options) => {
  const { defaultPath = 'andones.xlsx', filters = [] } = options;
  
  const result = await dialog.showSaveDialog(mainWindow, {
    defaultPath: defaultPath,
    filters: filters.length > 0 ? filters : [
      { name: 'Excel Files', extensions: ['xlsx'] },
      { name: 'CSV Files', extensions: ['csv'] },
      { name: 'All Files', extensions: ['*'] }
    ]
  });
  
  return result; // { canceled: boolean, filePath: string }
});

// Handle export to Excel/CSV
ipcMain.handle('export-to-file', async (event, data) => {
  try {
    const { filePath, records } = data;
    const isCSV = filePath.toLowerCase().endsWith('.csv');
    
    // Preparar datos
    const excelData = records.map(record => ({
      'Hora Inicio': record.startTime || '-',
      'Hora Fin': record.endTime || '-',
      'Departamento': record.department || '-',
      'Zona': record.station || '-',
      'Problema': record.problem || '-',
      'Reportado Por': record.reportedBy || '-',
      'Respondió': record.employeeResponded || '-',
      'T. Respuesta': record.responseTime || '-',
      'T. Resolución': record.resolutionTime || '-',
      'T. Total': record.duration || '-'
    }));
    
    if (isCSV) {
      // Guardar como CSV
      const ws = XLSX.utils.json_to_sheet(excelData);
      XLSX.writeFile({ Sheet1: ws }, filePath);
    } else {
      // Guardar como Excel
      const ws = XLSX.utils.json_to_sheet(excelData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Andones');
      
      // Ajustar ancho de columnas
      const colWidths = [
        { wch: 15 },
        { wch: 15 },
        { wch: 14 },
        { wch: 12 },
        { wch: 25 },
        { wch: 15 },
        { wch: 15 },
        { wch: 12 },
        { wch: 12 },
        { wch: 12 },
        { wch: 20 }
      ];
      ws['!cols'] = colWidths;
      
      XLSX.writeFile(wb, filePath);
    }
    
    return { success: true, message: 'Archivo exportado exitosamente' };
  } catch (error) {
    return { success: false, message: error.message };
  }
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

