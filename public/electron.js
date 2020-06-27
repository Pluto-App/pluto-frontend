const { app, BrowserWindow, ipcMain, protocol, screen } = require('electron')
const path = require('path')
const isDev = require('electron-is-dev');
const url = require('url')

if (isDev) {
  require('electron-reload')
}

let mainWindow
let video_player

// TODO Now we can add external window for settings.
// TODO Add support for App Signing.

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 315,
    height: 320,
    titleBarStyle: 'hiddenInset',
    title : "MainWindow",
    frame: false,
    webPreferences: {
      nodeIntegration: true,
      plugins: true
    }
  })

  mainWindow.setMenu(null);
  
  // FIXME Maximize/Minimize Issue.
  mainWindow.setAlwaysOnTop(true, 'screen');

  mainWindow.loadURL(isDev ? process.env.ELECTRON_START_URL : 
                        `file://${path.join(__dirname, '../build/index.html')}`);

  if (isDev) {
    // Open the DevTools.
    // BrowserWindow.addDevToolsExtension('<location to your react chrome extension>');
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('closed', () => {
    mainWindow = null
  });

  ipcMain.on('resize-login', (event, arg) => {
    mainWindow.setSize(315, 320)
  })

  ipcMain.on('resize-normal', (event, arg) => {
    mainWindow.setSize(315, 606)
  })

  ipcMain.on('close-video', (event, arg) => {
    if(video_player !== null) {
      video_player = null
    }
  })

  ipcMain.on('load-video-window', (event, data) => {

    if(video_player !== null) {
        video_player = null;
    }
  
    let display = screen.getPrimaryDisplay();
    let swidth = display.bounds.width;
    let sheight = display.bounds.height;
    
    // create the window
    video_player = new BrowserWindow({ 
      show: true,
      width: 250,
      height: 150,
      frame: false,
      title: "VideoWindow",
      x: swidth - 260,
      y: sheight - 200,
      webPreferences: {
        nodeIntegration: true,
        plugins: true
      } 
    })
  
    video_player.setAlwaysOnTop(true, 'screen');
    video_player.setMenu(null);
  
    // FIXME this fails during packaging. Is the routing working?
    const video_url = url.format({
      pathname: path.join(__dirname, '../build/index.html' + '#/videocall'),
      hash: 'baz',
      protocol: 'file',
      slashes: true
    })

    // video_player.loadURL(video_url);
    video_player.loadURL(isDev ? process.env.ELECTRON_START_URL + '#/videocall' : video_url);
  
    video_player.on('closed', () => {
      video_player = null
    })
  
    // here we can send the data to the new window
    video_player.webContents.on('did-finish-load', () => {
        video_player.webContents.send('data', data);
    });
  
    mainWindow.on('closed', () => {
      if(video_player !== null) {
        video_player.close();
      }
    })
    
  });
}

app.on('ready', createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})

// Exit cleanly on request from parent process in development mode.
if (isDev) {
  if (process.platform === 'win32') {
    process.on('message', data => {
      if (data === 'graceful-exit') {
        app.quit()
      }
    })
  } else {
    process.on('SIGTERM', () => {
      app.quit()
    })
  }
}