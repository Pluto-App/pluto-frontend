const { app, BrowserWindow, ipcMain, protocol, screen, Menu } = require('electron')
const path = require('path')
const isDev = require('electron-is-dev');
const url = require('url')
const { PythonShell } = require( 'python-shell');
const robot = require('robotjs');

if (isDev) {
  require('electron-reload')
}

let mainWindow

let miniVideoCallWindow
let videoCallWindow

let initScreenShareWindow
let streamScreenShareWindow
let screenShareContainerWindow
let screenShareControlsWindow

let settings_page

const isWindows = process.platform === 'win32'
const isMac = process.platform === "darwin";

const activeWin = require('active-win');
const runApplescript = require('run-applescript');

// TODO Now we can add external window for settings.
// TODO Add support for App Signing.

const minWidth = 315;
const minHeight = 320;

const robotKeyMap = {
  'arrowup'     : 'up',
  'arrowdown'   : 'down',
  'arrowleft'   : 'left',
  'arrowright'  : 'right',
  'backspace'   : 'backspace',
  'enter'       : 'enter',
  ' '           : 'space',
  'control'     : 'control',
  'tab'         : 'tab',
  'shift'       : 'shift',
  'alt'         : 'alt',
  'command'     : 'command'
};

const robotMods = ['shift','control','alt'];
var currentMods = [];

async function runPythonScript(py_script){

   return new Promise(function (resolve, reject) {
    PythonShell.run(py_script, null, function (err, results) {

      if (err) throw err;
      resolve(results[0]);
    });
  })
}

async function getTabUrl (activeWinInfo){

  var url = activeWinInfo ? activeWinInfo.url : undefined;

  if(activeWinInfo && !url) {
    
    if(activeWinInfo.platform == 'macos') {

      if(activeWinInfo.owner.bundleId == 'com.google.Chrome') {
      
        url = await runApplescript('tell application "Google Chrome" to return URL of active tab of front window');
     
      } else if(activeWinInfo.owner.bundleId == 'com.apple.Safari') {
        
        url = await runApplescript('tell app "Safari" to get URL of front document');
      }

    } else if (activeWinInfo.platform == 'windows') {

      var py_script = './src/scripts/windows_chrome_active_tab_url.py';
      url = await runPythonScript(py_script);
      url = url == 'null' ? undefined : url;
    }
  }

  return url;
}


function createWindow() {
  mainWindow = new BrowserWindow({
    width: minWidth,
    height: minHeight,
    minWidth: minWidth,
    minHeight: minHeight,
    titleBarStyle: 'hiddenInset',
    title: "MainWindow",
    frame: false,
    webPreferences: {
      nodeIntegration: true,
      plugins: true,
      enableRemoteModule: true
    }
  })

  mainWindow.setMenu(null);

  const settingsUrl = url.format({
    pathname: path.join(__dirname, '../build/index.html'),
    hash: '/user-profile',
    protocol: 'file:',
    slashes: true
  })

  const startPageUrl = url.format({
    pathname: path.join(__dirname, '../build/index.html'),
    hash: '/',
    protocol: 'file:',
    slashes: true
  })

  mainWindow.loadURL(isDev ? process.env.ELECTRON_START_URL : startPageUrl);

  if (isDev) {
    // Open the DevTools.
    // BrowserWindow.addDevToolsExtension('<location to your react chrome extension>');
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('closed', () => {
    // Close all windows.
    var windows = BrowserWindow.getAllWindows();
    windows.forEach(x => x.close());

  });

  ipcMain.on('active-win', async (event, arg) => {

    const activeWinInfo = await activeWin()
    activeWinInfo.url = await getTabUrl(activeWinInfo);
    activeWinInfo.cursor = screen.getCursorScreenPoint();

    if (activeWinInfo.owner !== undefined && activeWinInfo.owner.name !== undefined)
      event.returnValue = activeWinInfo
    else
      event.returnValue = "None"
  })

  ipcMain.on('logout', (event, arg) => {
    mainWindow.loadURL(isDev ? process.env.ELECTRON_START_URL : startPageUrl);
    mainWindow.setSize(minWidth, minHeight)
  })

  ipcMain.on('resize-login', (event, arg) => {
    mainWindow.setSize(minWidth, minHeight)
  })

  ipcMain.on('resize-normal', (event, arg) => {
    mainWindow.setSize(minWidth, 700)
  })

  ipcMain.on('close-video', (event, arg) => {
    if (miniVideoCallWindow !== null) {
      miniVideoCallWindow.close()
    }
  })

  ipcMain.on(`display-app-menu`, function (e, args) {
    if (isWindows && mainWindow) {
      menu.popup({
        window: mainWindow,
        x: args.x,
        y: args.y
      });
    }
  });

  ipcMain.on(`open-settings`, (events, data) => {
    let display = screen.getPrimaryDisplay();
    let swidth = display.bounds.width;
    let sheight = display.bounds.height;

    settings_page = new BrowserWindow({
      show: true,
      width: 400,
      height: 750,
      frame: false,
      title: "VideoWindow",
      x: swidth / 2,
      y: sheight / 2,
      webPreferences: {
        nodeIntegration: true,
        plugins: true,
        enableRemoteModule: true
      }
    })

    settings_page.setAlwaysOnTop(true, 'screen');
    settings_page.setMenu(null);

    const settingsUrl = url.format({
      pathname: path.join(__dirname, '../build/index.html'),
      hash: '/user-profile',
      protocol: 'file:',
      slashes: true
    })

    settings_page.loadURL(isDev ? process.env.ELECTRON_START_URL + '#/user-profile' : settingsUrl);
    settings_page.on('closed', () => {
      settings_page.close()
    })

    // here we can send the data to the new window
    settings_page.webContents.on('did-finish-load', () => {
      settings_page.webContents.send('data', data);
    });

    mainWindow.on('closed', () => {
      if (settings_page !== null) {
        settings_page.close();
      }
    })
  });

  ipcMain.on('init-video-call-window', (event, data) => {

    if(miniVideoCallWindow){
      try{
        miniVideoCallWindow.hide();
      } catch (error) {
        console.error(error);
      }
    }

    if (videoCallWindow) {
      try{
        videoCallWindow.close();
      } catch (error) {
        console.error(error);
      }
    }

    let display = screen.getPrimaryDisplay();
    let swidth = display.bounds.width;
    let sheight = display.bounds.height;

    // create the window
    videoCallWindow = new BrowserWindow({
      show: true,
      width: swidth,
      height: sheight,
      frame: false,
      title: "VideoWindow",
      x: 0,
      y: 0,
      webPreferences: {
        nodeIntegration: true,
        plugins: true,
        enableRemoteModule: true
      }
    })

    videoCallWindow.setAlwaysOnTop(true, 'screen');
    videoCallWindow.setMenu(null);

    const videoUrl = url.format({
      pathname: path.join(__dirname, '../build/index.html'),
      hash: '/video-call',
      protocol: 'file:',
      slashes: true
    })

    videoCallWindow.loadURL(isDev ? process.env.ELECTRON_START_URL + '#/video-call' : videoUrl);

    videoCallWindow.on('closed', () => {

       try{
          if(screenShareControlsWindow)
            screenShareControlsWindow.close();
        } catch (error) {
          console.error(error);
        }

       try{
          if(streamScreenShareWindow)
            streamScreenShareWindow.close();
        } catch (error) {
          console.error(error);
        }

        if(miniVideoCallWindow){
          try{
            miniVideoCallWindow.close();
          } catch (error) {
            console.error(error);
          }
        }

        videoCallWindow = undefined;
    })

    // here we can send the data to the new window
    videoCallWindow.webContents.on('did-finish-load', () => {
      videoCallWindow.webContents.send('data', data);
    });

    // Close the video player window when we 
    // close the main window of the app. 
    mainWindow.on('closed', () => {
      if (videoCallWindow !== null) {
        videoCallWindow.close();
      }
    })

    if (isDev) {
       videoCallWindow.webContents.openDevTools();
    }

  });

  ipcMain.on('init-mini-video-call-window', (event, data) => {

    if (videoCallWindow) {
      try{
        videoCallWindow.close();
      } catch (error) {
        console.error(error);
      }
    }

    if (miniVideoCallWindow) {
      try{
        miniVideoCallWindow.close();
      } catch (error) {
        console.error(error);
      }
    }

    let display = screen.getPrimaryDisplay();
    let swidth = display.bounds.width;
    let sheight = display.bounds.height;

    // create the window
    miniVideoCallWindow = new BrowserWindow({
      show: true,
      width: 200,
      height: 150,
      frame: false,
      resizable: false,
      title: "VideoWindow",
      x: swidth - 270,
      y: sheight - 870,
      webPreferences: {
        nodeIntegration: true,
        plugins: true,
        enableRemoteModule: true
      }
    })

    miniVideoCallWindow.setAlwaysOnTop(true, 'screen');
    miniVideoCallWindow.setMenu(null);

    const videoUrl = url.format({
      pathname: path.join(__dirname, '../build/index.html'),
      hash: '/mini-video-call',
      protocol: 'file:',
      slashes: true
    })

    miniVideoCallWindow.loadURL(isDev ? process.env.ELECTRON_START_URL + '#/mini-video-call' : videoUrl);

    miniVideoCallWindow.on('closed', () => {

       try{
          if(screenShareControlsWindow)
            screenShareControlsWindow.close();
        } catch (error) {
          console.error(error);
        }

       try{
          if(streamScreenShareWindow)
            streamScreenShareWindow.close();
        } catch (error) {
          console.error(error);
        }


       try{
          if(videoCallWindow)
            videoCallWindow.close();
        } catch (error) {
          console.error(error);
        }

        miniVideoCallWindow = undefined;
    })

    // here we can send the data to the new window
    miniVideoCallWindow.webContents.on('did-finish-load', () => {
      miniVideoCallWindow.webContents.send('data', data);
    });

    // Close the video player window when we 
    // close the main window of the app. 
    mainWindow.on('closed', () => {
      if (miniVideoCallWindow !== null) {
        miniVideoCallWindow.close();
      }
    })

    if (isDev) {
       miniVideoCallWindow.webContents.openDevTools();
    }

  });

  ipcMain.on('video-resize-normal', (event, arg) => {
    miniVideoCallWindow.setSize(200, 150)
  })

  ipcMain.on('video-call-window-collapse', (event, arg) => {
    if(miniVideoCallWindow){
      try{
        miniVideoCallWindow.show();
      } catch (error) {
        console.error(error);
      }
    }

    if (videoCallWindow) {
      try{
        videoCallWindow.hide();
      } catch (error) {
        console.error(error);
      }
    }
  })

  ipcMain.on('set-video-player-height', (event, height) => {
    miniVideoCallWindow.setSize(miniVideoCallWindow.getSize()[0], height);
  })


  ipcMain.on('init-screenshare', (event, arg) => {

    if(initScreenShareWindow){
      try{
        initScreenShareWindow.close();
      } catch (error) {
        console.error(error);
      }
    }

    initScreenShareWindow = new BrowserWindow({
        width: 650,
        height: 650,
        frame: true,
        title: "ScreenShare",
        webPreferences: {
          nodeIntegration: true,
          plugins: true,
          enableRemoteModule: true
        }
    });

    initScreenShareWindow.setMenu(null);

    const screenShareWindowUrl = url.format({
      pathname: path.join(__dirname, '../build/index.html'),
      hash: '/init-screenshare',
      protocol: 'file:',
      slashes: true
    });

    initScreenShareWindow.loadURL(isDev ? process.env.ELECTRON_START_URL + '#/init-screenshare' : screenShareWindowUrl);

    initScreenShareWindow.on('closed', () => {

    })

    if (isDev) {
      // initScreenShareWindow.webContents.openDevTools();
    }

  })

  ipcMain.on('stream-screenshare', (event, arg) => {

    if(streamScreenShareWindow){
      try{
        streamScreenShareWindow.close();
      } catch (error) {
        console.error(error);
      }
    }

    streamScreenShareWindow = new BrowserWindow({
        width: 1024,
        height: 680,
        show: false,
        frame: true,
        title: "ScreenShare",
        webPreferences: {
          nodeIntegration: true,
          plugins: true,
          enableRemoteModule: true
        }
    });

    streamScreenShareWindow.setMenu(null);

    const screenShareWindowUrl = url.format({
      pathname: path.join(__dirname, '../build/index.html'),
      hash: '/stream-screenshare',
      protocol: 'file:',
      slashes: true
    });

    streamScreenShareWindow.loadURL(isDev ? process.env.ELECTRON_START_URL + '#/stream-screenshare' : screenShareWindowUrl);

    //streamScreenShareWindow.maximize();
    streamScreenShareWindow.show();

    if (isDev) {
      streamScreenShareWindow.setSize(500,400);
    }

    streamScreenShareWindow.on('closed', () => {
      streamScreenShareWindow = undefined;
    })

    if (isDev) {
       //streamScreenShareWindow.webContents.openDevTools();
    }

  })

  ipcMain.on('sharing-screen', (event, arg) => {

    if(initScreenShareWindow) {

      // ScreenShare Container
      const mainScreen = screen.getPrimaryDisplay();
      let workArea = mainScreen.bounds;
      let displayWidth = workArea.width;
      let displayHeight = workArea.height;

      initScreenShareWindow.hide();

      screenShareContainerWindow = new BrowserWindow({
        x: 0,
        y: 0,
        hasShadow: false,
        transparent: true,
        frame: false,
        minimizable: false,
        maximizable: false,
        resizable: false,
        closeable: false,
        alwaysOnTop: true,
        focusable: false,
        enableLargerThanScreen: true,
        webPreferences: {
          nodeIntegration: true,
          plugins: true,
          enableRemoteModule: true
        }
      });

      const screenshareContainerUrl = url.format({
        pathname: path.join(__dirname, '../build/index.html'),
        hash: '/screenshare-container',
        protocol: 'file:',
        slashes: true
      })

      screenShareContainerWindow.loadURL(isDev ? process.env.ELECTRON_START_URL + '#/screenshare-container' : screenshareContainerUrl);
      screenShareContainerWindow.setIgnoreMouseEvents(true);
      screenShareContainerWindow.setSize(displayWidth, displayHeight);
      //screenShareContainerWindow.setVisibleOnAllWorkspaces(true,{visibleOnFullScreen: true})
      //screenShareContainerWindow.maximize();

      if (isDev) {
       
        // screenShareContainerWindow.webContents.openDevTools();
      }

      // ScreenShare Controls
      let windowWidth = 460;
      let windowHeight = 80;

      screenShareControlsWindow = new BrowserWindow({
        width: windowWidth,
        height: windowHeight,
        x: displayWidth/2 - windowWidth/2,
        y: displayHeight - 80,
        movable: true,
        minimizable: false,
        maximizable: false,
        resizable: false,
        alwaysOnTop: true,
        titleBarStyle: 'hidden',
        title: "ScreenShare Controls",
        frame: false,
        trafficLightPosition: { x: -100, y: 0 },
        webPreferences: {
          nodeIntegration: true,
          plugins: true,
          enableRemoteModule: true
        }
      })

      const screenShareControlsUrl = url.format({
        pathname: path.join(__dirname, '../build/index.html'),
        hash: '/screenshare-controls',
        protocol: 'file:',
        slashes: true
      })

      screenShareControlsWindow.loadURL(isDev ? process.env.ELECTRON_START_URL + '#/screenshare-controls'  : screenShareControlsUrl);

      screenShareControlsWindow.on('closed', () => {

        screenShareControlsWindow = undefined;
        try{

            screenShareContainerWindow.close();
            initScreenShareWindow.close();

        } catch (error) {
          console.error(error);
        }

      })

      if (isDev) {
        // screenShareControlsWindow.webContents.openDevTools();
      }

    }
  })

  ipcMain.on('stop-screenshare', (event, arg) => {

    try{

        if(screenShareControlsWindow)
          screenShareControlsWindow.close();

        if(streamScreenShareWindow)
          streamScreenShareWindow.close();

      } catch (error) {
        console.error(error);
      }
  })

  ipcMain.on('screen-share-options', (event, arg) => {
    miniVideoCallWindow.setSize(675, 675)
  })

  ipcMain.on('screen-size', async (event, arg) => {

      const mainScreen = screen.getPrimaryDisplay();
      event.returnValue = mainScreen.size;
  })

  var menu = Menu.buildFromTemplate([
    {
      label: 'App ',
      submenu: [
        {
          label: 'Join Team',
          click() {

          }
        },
        {
          label: 'Join Room',
          click() {

          }
        },
        { type: 'separator' },
        {
          label: 'Exit',
          click() {

          }
        }
      ],
    },
    {
      label: 'File 📁',
      submenu: [
        {
          label: 'Share File',
          click() {

          }
        },
        {
          label: 'Sync With GCloud',
          click() {

          }
        },
        { type: 'separator' },
        {
          label: 'Exit',
          click() {

          }
        }
      ]
    },
    {
      label: 'Refersh 🔄',
      submenu: [
        {
          label: 'Reset',
          click() {

          }
        },
        {
          label: 'Logout',
          click() {

          }
        },
        { type: 'separator' },
        {
          label: 'Exit',
          click() {

          }
        }
      ]
    }
  ])

  ipcMain.on('emit-click', async (event, arg) => {

    originalPos = robot.getMousePos();
    robot.moveMouse(arg.cursor.x, arg.cursor.y);
    robot.mouseClick();
    robot.moveMouse(originalPos.x, originalPos.y);

  })

  ipcMain.on('emit-scroll', async (event, arg) => {

    originalPos = robot.getMousePos();
    robot.moveMouse(arg.cursor.x, arg.cursor.y);

    switch(arg.event.direction) {
      case 'up':
        robot.scrollMouse(0, -5);
        break;
      case 'down':
        robot.scrollMouse(0, 5);
        break;
      default:
        // code block
    }
    robot.moveMouse(originalPos.x, originalPos.y);
  })

  ipcMain.on('emit-drag', async (event, arg) => {

    originalPos = robot.getMousePos();
    robot.moveMouse(arg.cursor.x, arg.cursor.y);

    robot.moveMouse(arg.event.start_x, arg.event.start_y);
    robot.mouseToggle("down");
    robot.dragMouse(arg.cursor.x, arg.cursor.y);
    robot.mouseToggle("up");
    
    robot.moveMouse(originalPos.x, originalPos.y);
  })

  ipcMain.on('emit-mousedown', async (event, arg) => {

    originalPos = robot.getMousePos();
    robot.moveMouse(arg.cursor.x, arg.cursor.y);
    robot.mouseToggle("down");
    //robot.moveMouse(originalPos.x, originalPos.y);

  })

  ipcMain.on('emit-mouseup', async (event, arg) => {

    originalPos = robot.getMousePos();
    robot.moveMouse(arg.cursor.x, arg.cursor.y);
    robot.mouseToggle("up"); 
    //robot.moveMouse(originalPos.x, originalPos.y);
  })


  //////////////////////////////////////////////////////////////////////
  // Use attributes from javascript keyboard event to fetch robotMods //
  //////////////////////////////////////////////////////////////////////
  ipcMain.on('emit-key', async (event, arg) => {

    var rawKey = arg.event.key.toLowerCase();
    var key = robotKeyMap[rawKey] || arg.event.key

    if(robotMods.includes(key)){
      
      if(arg.event.type == 'keyup'){

        if(currentMods.indexOf(key) != -1)
          currentMods.splice(currentMods.indexOf(key), 1);

        robot.keyToggle(key,'up');
      
      } else if(arg.event.type == 'keydown'){

        if(currentMods.indexOf(key) == -1)
          currentMods.push(key)

        robot.keyToggle(key,'down');
      }

    }  else if(arg.event.type == 'keydown'){

      if(Object.keys(robotKeyMap).includes(rawKey)){

        robot.keyTap(key, currentMods);
      
      } else {
        if(currentMods.includes('control')){

          robot.keyTap(key.toLowerCase(), currentMods);

        } else {

          robot.typeString(key);
        }
      }
    }
  })
}

app.on('ready', () => {
  createWindow()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (mainWindow === null) {
    Menu.setApplicationMenu(menu);
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