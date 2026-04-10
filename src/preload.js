const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  ipcRenderer: {
    on: (channel, func) => {
      const validChannels = ['app-version'];
      if (validChannels.includes(channel)) {
        ipcRenderer.on(channel, func);
      }
    },
    once: (channel, func) => {
      const validChannels = ['app-version'];
      if (validChannels.includes(channel)) {
        ipcRenderer.once(channel, func);
      }
    },
    send: (channel, args) => {
      const validChannels = [];
      if (validChannels.includes(channel)) {
        ipcRenderer.send(channel, args);
      }
    },
  },
});
