const {
  app,
  BrowserWindow,
  ipcMain,
  screen,
  dialog,
  systemPreferences,
} = require('electron');
const path = require('path');
const isDev = require('electron-is-dev');
const url = require('url');
const robot = require('robotjs');
const { windowManager } = require('node-window-manager');
const childProcess = require('child_process');
const { openSystemPreferences } = require('electron-util');
const { autoUpdater } = require('electron-updater');

if (isDev) {
  require('electron-reload');
}

let user32;
let winurl;

let mainWindow;
let videoCallWindow;

let initScreenShareWindow;
let screenShareContainerWindow;
let screenShareControlsWindow;

let initWindowShareWindow;
let windowShareContainerWindow;
let streamWindowShareWindows = [];

let settingsPage;

let user_color;
let call_data;

const isWindows = process.platform === 'win32';
const isMac = process.platform === 'darwin';

var macUtilsPath;
if (isDev) macUtilsPath = path.join(app.getAppPath(), 'src/bin/macutil');
else macUtilsPath = path.join(app.getAppPath(), '..', 'src/bin/macutil');

var windowsUtilsPath;
let windowsUtil;

if (isWindows) {
  if (isDev)
    windowsUtilsPath = path.join(app.getAppPath(), 'src/lib/windowsutil');
  else
    windowsUtilsPath = path.join(app.getAppPath(), '..', 'src/lib/windowsutil');
  windowsUtil = require(windowsUtilsPath);
}

var browserURLsDllPath;
if (isDev)
  browserURLsDllPath = path.join(app.getAppPath(), 'src/dlls/BrowserURLs.dll');
else
  browserURLsDllPath = path.join(
    app.getAppPath(),
    '..',
    'src/dlls/BrowserURLs.dll'
  );

const minWidth = 350;
const minHeight = 475;

const robotKeyMap = {
  arrowup: 'up',
  arrowdown: 'down',
  arrowleft: 'left',
  arrowright: 'right',
  backspace: 'backspace',
  enter: 'enter',
  ' ': 'space',
  control: 'control',
  tab: 'tab',
  shift: 'shift',
  alt: 'alt',
  command: 'command',
  '>': '.',
  '<': ',',
  ':': ';',
  '{': '[',
  '}': ']',
  '?': '/',
  '|': '\\',
};

var primaryDisplay;
var sWidth;
var sHeight;
var compactVideoWidth = 255;
var previousVideoBounds;
var scaleFactor = 1;

async function getMediaAccess() {
  const hasScreenAccess =
    systemPreferences.getMediaAccessStatus('screen') === 'granted';
  const hasCameraAccess =
    systemPreferences.getMediaAccessStatus('camera') === 'granted';
  const hasMicAccess =
    systemPreferences.getMediaAccessStatus('microphone') === 'granted';

  const hasAllMediaAccess = hasScreenAccess && hasCameraAccess && hasMicAccess;
  if (hasAllMediaAccess) return;
  // open permission dialog with payload of which permission are granted/missing
  const mediaAccessPage = new BrowserWindow({
    show: true,
    width: 400,
    height: 550,
    minHeight: 550,
    minWidth: 400,
    frame: false,
    titleBarStyle: 'hiddenInset',
    webPreferences: {
      nodeIntegration: true,
      plugins: true,
      enableRemoteModule: true,
    },
  });

  mediaAccessPage.setMenu(null);
  mediaAccessPage.setAlwaysOnTop(true, 'screen');
  if (isDev) {
    mediaAccessPage.webContents.openDevTools();
  }
  const mediaAccessPageUrl = url.format({
    pathname: path.join(__dirname, '../build/index.html'),
    hash: '/permissions',
    protocol: 'file:',
    slashes: true,
  });

  mediaAccessPage.loadURL(
    isDev
      ? process.env.ELECTRON_START_URL + '#/permissions'
      : mediaAccessPageUrl
  );
  mediaAccessPage.webContents.once('dom-ready', () => {
    mediaAccessPage.webContents.send('permission-data', {
      hasCameraAccess,
      hasMicAccess,
      hasScreenAccess,
    });
  });
}

function getModsArray(event) {
  var mods = [];

  if (event.altKey) {
    mods.push('alt');
  }

  if (event.ctrlKey || event.metaKey) {
    isMac ? mods.push('command') : mods.push('control');
  }

  if (event.shiftKey) {
    mods.push('shift');
  }

  return mods;
}

async function getwindowBounds(sourceInfo, sWidth, sHeight) {
  var [sourceType, sourceId] = sourceInfo.split(':');
  var overlayBounds;

  if (sourceType == 'screen') {
    overlayBounds = {
      x: 0,
      y: 0,
      width: sWidth,
      height: sHeight,
    };
  } else {
    var retry = 2;

    while (retry > 0) {
      try {
        //console.log('Fetching window bounds #getwindowBounds: ' + sourceInfo + ' for try: ' + retry);
        retry -= 1;
        if (isMac) {
          var windowInfo = JSON.parse(
            childProcess.execFileSync(
              macUtilsPath,
              ['window-bounds', sourceId],
              { encoding: 'utf8' }
            )
          );
          overlayBounds = windowInfo.bounds;
        } else {
          overlayBounds = windowManager
            .getWindows()
            .find((o) => o.id == sourceId)
            .getBounds();
        }

        break;
      } catch (error) {
        console.log('Error fetching bounds for: ' + sourceInfo);
        console.log(error);
      }
    }
  }

  return overlayBounds;
}

async function bringToTop(sourceInfo, skipCheck) {
  var [sourceType, sourceId] = sourceInfo.split(':');
  try {
    if (skipCheck || windowManager.getActiveWindow().id != sourceId) {
      if (isMac)
        childProcess.execFileSync(macUtilsPath, ['focus-window', sourceId], {
          encoding: 'utf8',
        });
      else
        windowManager
          .getWindows()
          .find((o) => o.id == sourceId)
          .bringToTop();
    }
  } catch (error) {
    console.log('#bringToTop Error: ' + error);
  }
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: minWidth,
    height: minHeight,
    minWidth: minWidth,
    minHeight: minHeight,
    titleBarStyle: 'hiddenInset',
    title: 'MainWindow',
    frame: false,
    webPreferences: {
      nodeIntegration: true,
      plugins: true,
      enableRemoteModule: true,
    },
  });

  mainWindow.setMenu(null);

  const startPageUrl = url.format({
    pathname: path.join(__dirname, '../build/index.html'),
    hash: '/',
    protocol: 'file:',
    slashes: true,
  });

  mainWindow.loadURL(isDev ? process.env.ELECTRON_START_URL : startPageUrl);

  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('closed', () => {
    // Close all windows.
    var windows = BrowserWindow.getAllWindows();
    windows.forEach((x) => x.close());
  });

  primaryDisplay = screen.getPrimaryDisplay();
  sWidth = primaryDisplay.bounds.width;
  sHeight = primaryDisplay.bounds.height;

  if (isWindows) scaleFactor = primaryDisplay.scaleFactor;

  if (isMac) getMediaAccess();

  ipcMain.on('active-win', async (event, arg) => {
    try {
      var activeWinInfo;
      if (isMac) {
        try {
          activeWinInfo = JSON.parse(
            childProcess.execFileSync(macUtilsPath, ['active-window'], {
              encoding: 'utf8',
            })
          );
        } catch (error) {
          console.error(error);
          activeWinInfo = {};
        }
      } else if (isWindows) {
        activeWinInfo = windowsUtil.activeWindow(browserURLsDllPath);
      } else {
        activeWinInfo = {};
      }

      if (activeWinInfo && activeWinInfo.owner && activeWinInfo.owner.name) {
        event.returnValue = activeWinInfo;
      } else {
        event.returnValue = undefined;
      }
    } catch (error) {
      console.error(error);
      event.returnValue = undefined;
    }
  });

  ipcMain.on('ask-media-status', async (event, mediaType) => {
    const hasScreenAccess =
      systemPreferences.getMediaAccessStatus('screen') === 'granted';
    const hasCameraAccess =
      systemPreferences.getMediaAccessStatus('camera') === 'granted';
    const hasMicAccess =
      systemPreferences.getMediaAccessStatus('microphone') === 'granted';
    event.sender.send('permission-data', {
      hasScreenAccess,
      hasCameraAccess,
      hasMicAccess,
    });
  });

  ipcMain.handle('ask-media-access', async (event, mediaType) => {
    const mediaTypeToKeyMap = {
      screen: 'hasScreenAccess',
      camera: 'hasCameraAccess',
      microphone: 'hasMicAccess',
    };
    let returnValue = {};
    const hasAccess =
      systemPreferences.getMediaAccessStatus(mediaType) === 'granted';
    if (hasAccess) {
      returnValue[mediaType] = true;
      return returnValue;
    } else {
      try {
        if (mediaType === 'screen') {
          openSystemPreferences('security', 'Privacy_ScreenCapture');
        } else {
          const status = await systemPreferences.askForMediaAccess(mediaType);
          returnValue[mediaTypeToKeyMap[mediaType]] = status;
          return returnValue;
        }
      } catch (e) {
        console.error('ERROR: Failed to get media access ', e);
      }
    }
  });

  ipcMain.on('logout', (event, arg) => {
    mainWindow.webContents.send('logout', {});
  });

  ipcMain.on('exit-user-call', (event, room_id) => {
    mainWindow.webContents.send('exitUserCall', room_id);
  });

  ipcMain.on('resize-login', (event, arg) => {
    mainWindow.setMinimumSize(minWidth, minHeight);
    mainWindow.setSize(minWidth, minHeight);
  });

  ipcMain.on('resize-normal', (event, arg) => {
    mainWindow.setSize(minWidth, 690);
    mainWindow.setMinimumSize(minWidth, 690);
    mainWindow.center();
  });

  ipcMain.on('check-media-access', async (event, arg) => {
    event.returnValue =
      systemPreferences.getMediaAccessStatus('camera') == 'granted' &&
      systemPreferences.getMediaAccessStatus('microphone') == 'granted';
  });

  ipcMain.on('set-user-color', async (event, args) => {
    user_color = args.user_color;
  });

  ipcMain.on('set-call-data', async (event, args) => {
    call_data = args.call_data;
  });

  ipcMain.on('set-call-data', async (event, args) => {
    call_data = args.call_data;
  });

  ipcMain.on('refresh-app', async (event, arg) => {
    mainWindow.webContents.send('refresh', {});
  });

  ipcMain.on(`open-settings`, (events, data) => {
    if (settingsPage) {
      settingsPage.close();
    }

    settingsPage = new BrowserWindow({
      show: true,
      width: 900,
      height: sHeight,
      minHeight: 500,
      minWidth: 400,
      frame: false,
      titleBarStyle: 'hiddenInset',
      webPreferences: {
        nodeIntegration: true,
        plugins: true,
        enableRemoteModule: true,
      },
    });

    settingsPage.setMenu(null);
    settingsPage.setAlwaysOnTop(true, 'screen');

    const settingsUrl = url.format({
      pathname: path.join(__dirname, '../build/index.html'),
      hash: '/settings',
      protocol: 'file:',
      slashes: true,
    });

    settingsPage.loadURL(
      isDev ? process.env.ELECTRON_START_URL + '#/settings' : settingsUrl
    );
    settingsPage.on('closed', () => {
      settingsPage = undefined;
      mainWindow.webContents.send('refresh', {});
    });

    // here we can send the data to the new window
    settingsPage.webContents.on('did-finish-load', () => {
      settingsPage.webContents.send('data', data);
    });

    if (isDev) {
      settingsPage.webContents.openDevTools();
    }

    mainWindow.on('closed', () => {
      if (settingsPage) {
        settingsPage.close();
      }
    });
  });

  ipcMain.on('init-video-call-window', (event, args) => {
    if (videoCallWindow) {
      try {
        videoCallWindow.close();
      } catch (error) {
        console.error(error);
      }
    }

    // create the window
    videoCallWindow = new BrowserWindow({
      show: true,
      width: compactVideoWidth,
      height: 130,
      resizable: false,
      frame: false,
      title: 'VideoWindow',
      alwaysOnTop: true,
      x: sWidth - 230,
      y: sHeight - 200,
      maximizable: false,
      webPreferences: {
        nodeIntegration: true,
        plugins: true,
        enableRemoteModule: true,
      },
    });

    videoCallWindow.setAlwaysOnTop(true, 'pop-up-menu');
    videoCallWindow.setMenu(null);

    const videoUrl = url.format({
      pathname: path.join(__dirname, '../build/index.html'),
      hash: '/video-call',
      protocol: 'file:',
      slashes: true,
    });

    videoCallWindow.data = {
      call_data: args.call_data,
      call_channel_id: args.call_channel_id,
    };

    videoCallWindow.data = {
      call_data: args.call_data,
      call_channel_id: args.call_channel_id,
    };
    if (isDev) {
      videoCallWindow.webContents.openDevTools();
    }
    videoCallWindow.loadURL(
      isDev ? process.env.ELECTRON_START_URL + '#/video-call' : videoUrl
    );

    videoCallWindow.on('closed', () => {
      try {
        if (initScreenShareWindow) initScreenShareWindow.close();

        if (screenShareControlsWindow) screenShareControlsWindow.close();

        if (initWindowShareWindow) initWindowShareWindow.close();

        if (windowShareContainerWindow) windowShareContainerWindow.close();

        for (var streamWindowShareWindow of streamWindowShareWindows) {
          if (streamWindowShareWindow && !streamWindowShareWindow.isDestroyed())
            streamWindowShareWindow.close();
        }

        streamWindowShareWindows = [];
      } catch (error) {
        console.error(error);
      }

      videoCallWindow = undefined;
    });

    if (isDev) {
      videoCallWindow.webContents.openDevTools();
    }
  });

  ipcMain.on('expand-video-call-window', (event, data) => {
    if (videoCallWindow) {
      previousVideoBounds = videoCallWindow.getBounds();
      videoCallWindow.setPosition(0, 0);
      videoCallWindow.setResizable(true);
      videoCallWindow.setSize(sWidth - 100, sHeight - 100);
      videoCallWindow.setMinimumSize(800, 600);
      videoCallWindow.setAlwaysOnTop(false);
      videoCallWindow.center();
    }
  });

  ipcMain.on('collapse-video-call-window', (event, height) => {
    if (videoCallWindow) {
      videoCallWindow.setMinimumSize(compactVideoWidth, height);
      videoCallWindow.setBounds({
        ...previousVideoBounds,
        height: height,
      });

      videoCallWindow.setResizable(false);
      videoCallWindow.setAlwaysOnTop(true, 'pop-up-menu');
    }
  });

  ipcMain.on('set-video-player-height', (event, height) => {
    if (videoCallWindow) {
      if (height > sHeight - 125) height = sHeight - 125;

      var resizeDisabled = videoCallWindow.isResizable() == true;

      var bounds = videoCallWindow.getBounds();
      videoCallWindow.setMinimumSize(videoCallWindow.getSize()[0], height);

      var newY = bounds.y;

      if (height > bounds.height) {
        newY = bounds.y - (height - bounds.height);
      } else {
        newY = bounds.y + (bounds.height - height);
      }

      var newBounds = {
        ...bounds,
        height: height,
        y: newY,
      };

      videoCallWindow.setBounds(newBounds);
    }
  });

  ipcMain.on('init-windowshare', (event, args) => {
    if (initWindowShareWindow) {
      try {
        initWindowShareWindow.hide();
      } catch (error) {
        console.error(error);
      }
    }

    initWindowShareWindow = new BrowserWindow({
      width: 650,
      height: 650,
      frame: true,
      title: 'WindowShare',
      resizable: false,
      webPreferences: {
        nodeIntegration: true,
        plugins: true,
        enableRemoteModule: true,
      },
    });

    initWindowShareWindow.setMenu(null);

    const windowShareWindowUrl = url.format({
      pathname: path.join(__dirname, '../build/index.html'),
      hash: '/init-windowshare',
      protocol: 'file:',
      slashes: true,
    });

    initWindowShareWindow.data = {
      user_color: user_color,
      call_data: call_data,
    };

    initWindowShareWindow.loadURL(
      isDev
        ? process.env.ELECTRON_START_URL + '#/init-windowshare'
        : windowShareWindowUrl
    );

    initWindowShareWindow.on('closed', () => {
      initWindowShareWindow = undefined;
    });

    if (isDev) {
      // initWindowShareWindow.webContents.openDevTools();
    }
  });

  ipcMain.on('stop-windowshare', (event, arg) => {
    videoCallWindow.webContents.send('stop-windowshare', {});
    try {
      if (windowShareContainerWindow) windowShareContainerWindow.close();

      if (initWindowShareWindow) initWindowShareWindow.close();
    } catch (error) {
      console.error(error);
    }
  });

  ipcMain.on('init-screenshare', (event, arg) => {
    if (initScreenShareWindow) {
      try {
        initScreenShareWindow.close();
      } catch (error) {
        console.error(error);
      }
    }

    initScreenShareWindow = new BrowserWindow({
      width: 650,
      height: 650,
      frame: true,
      title: 'ScreenShare',
      resizable: false,
      webPreferences: {
        nodeIntegration: true,
        plugins: true,
        enableRemoteModule: true,
      },
    });

    initScreenShareWindow.setMenu(null);

    const screenShareWindowUrl = url.format({
      pathname: path.join(__dirname, '../build/index.html'),
      hash: '/init-screenshare',
      protocol: 'file:',
      slashes: true,
    });

    initScreenShareWindow.loadURL(
      isDev
        ? process.env.ELECTRON_START_URL + '#/init-screenshare'
        : screenShareWindowUrl
    );

    initScreenShareWindow.on('closed', () => {
      initScreenShareWindow = undefined;
    });

    if (isDev) {
      // initScreenShareWindow.webContents.openDevTools();
    }
  });

  ipcMain.on('sharing-window', async (event, args) => {
    if (initWindowShareWindow) {
      initWindowShareWindow.hide();

      windowShareContainerWindow = new BrowserWindow({
        x: args.overlayBounds.x || 400,
        y: args.overlayBounds.y || 400,
        hasShadow: false,
        transparent: true,
        frame: false,
        minimizable: false,
        maximizable: false,
        resizable: false,
        closeable: false,
        focusable: false,
        webPreferences: {
          nodeIntegration: true,
          plugins: true,
          enableRemoteModule: true,
        },
        show: false,
      });

      const windowshareContainerUrl = url.format({
        pathname: path.join(__dirname, '../build/index.html'),
        hash: '/windowshare-container',
        protocol: 'file:',
        slashes: true,
      });

      windowShareContainerWindow.data = {
        channel_id: args.channel_id,
      };
      alert(args.sourceInfo);
      await bringToTop(args.sourceInfo, true);

      windowShareContainerWindow.loadURL(
        isDev
          ? process.env.ELECTRON_START_URL + '#/windowshare-container'
          : windowshareContainerUrl
      );
      windowShareContainerWindow.setIgnoreMouseEvents(true);
      windowShareContainerWindow.setSize(
        args.overlayBounds.width,
        args.overlayBounds.height
      );
      windowShareContainerWindow.setVisibleOnAllWorkspaces(true, {
        visibleOnFullScreen: true,
      });

      app.dock && app.dock.hide();
      windowShareContainerWindow.showInactive();
      app.dock && app.dock.show();

      windowShareContainerWindow.moveAbove(args.sourceInfo);

      windowShareContainerWindow.on('closed', () => {
        windowShareContainerWindow = undefined;

        if (initWindowShareWindow) initWindowShareWindow.close();
      });

      if (isDev) {
        windowShareContainerWindow.webContents.openDevTools();
      }
    }
  });

  ipcMain.on('streaming-windowshare', (event, args) => {
    if (args.resolution) {
      var streamWindowShareWindow = new BrowserWindow({
        width: args.resolution.width,
        height: args.resolution.height,
        frame: false,
        title: 'WindowShare',
        resizable: true,
        webPreferences: {
          nodeIntegration: true,
          plugins: true,
          enableRemoteModule: true,
        },
      });

      streamWindowShareWindow.setMenu(null);

      const streamWindowShareWindowUrl = url.format({
        pathname: path.join(__dirname, '../build/index.html'),
        hash: '/stream-windowshare',
        protocol: 'file:',
        slashes: true,
      });

      streamWindowShareWindow.data = {
        user_id: args.user_id,
        user_uid: args.user_uid,
        owner: args.owner,
        owner_color: args.owner_color,
        user_color: user_color,
        call_data: call_data,
      };

      streamWindowShareWindow.loadURL(
        isDev
          ? process.env.ELECTRON_START_URL + '#/stream-windowshare'
          : streamWindowShareWindowUrl
      );
      streamWindowShareWindow.once('did-finish-load', () => {
        streamWindowShareWindows.push(streamWindowShareWindow);
      });

      streamWindowShareWindow.on('closed', () => {
        streamWindowShareWindow = undefined;
      });

      if (isDev) {
        streamWindowShareWindow.webContents.openDevTools();
      }
    } else {
      console.log(
        '#streaming-windowshare Error: No resolution provided to stream windowshare.'
      );
    }
  });

  ipcMain.on('update-windowshare-container-bounds', (event, overlayBounds) => {
    if (windowShareContainerWindow) {
      // overlayBounds.width = overlayBounds.width + 10
      // overlayBounds.height = overlayBounds.width + 10
      // overlayBounds.x = overlayBounds.x - 5
      // overlayBounds.y = overlayBounds.y - 5

      windowShareContainerWindow.setBounds(overlayBounds);
    }
  });

  ipcMain.on('sharing-screen', (event, overlayBounds) => {
    if (initScreenShareWindow) {
      initScreenShareWindow.hide();

      screenShareContainerWindow = new BrowserWindow({
        x: overlayBounds.x,
        y: overlayBounds.y,
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
          enableRemoteModule: true,
        },
        show: false,
      });

      const screenshareContainerUrl = url.format({
        pathname: path.join(__dirname, '../build/index.html'),
        hash: '/screenshare-container',
        protocol: 'file:',
        slashes: true,
      });

      screenShareContainerWindow.setVisibleOnAllWorkspaces(true);
      screenShareContainerWindow.loadURL(
        isDev
          ? process.env.ELECTRON_START_URL + '#/screenshare-container'
          : screenshareContainerUrl
      );
      screenShareContainerWindow.setIgnoreMouseEvents(true);
      screenShareContainerWindow.setSize(
        overlayBounds.width,
        overlayBounds.height
      );
      screenShareContainerWindow.setAlwaysOnTop(true, 'pop-up-menu');
      screenShareContainerWindow.setVisibleOnAllWorkspaces(true, {
        visibleOnFullScreen: true,
      });

      app.dock && app.dock.hide();
      screenShareContainerWindow.show();
      app.dock && app.dock.show();

      screenShareContainerWindow.on('closed', () => {
        screenShareContainerWindow = undefined;
      });

      if (isDev) {
        screenShareContainerWindow.webContents.openDevTools();
      }

      // ScreenShare Controls
      let windowWidth = 370;
      let windowHeight = 80;

      screenShareControlsWindow = new BrowserWindow({
        width: windowWidth,
        height: windowHeight,
        x: sWidth / 2 - windowWidth / 2,
        y: sHeight - 80,
        movable: true,
        minimizable: false,
        maximizable: false,
        resizable: false,
        titleBarStyle: 'hidden',
        title: 'ScreenShare Controls',
        frame: false,
        trafficLightPosition: { x: -100, y: 0 },
        webPreferences: {
          nodeIntegration: true,
          plugins: true,
          enableRemoteModule: true,
        },
      });

      screenShareControlsWindow.setVisibleOnAllWorkspaces(true);
      screenShareControlsWindow.setMenu(null);
      screenShareControlsWindow.setAlwaysOnTop(true, 'pop-up-menu');

      const screenShareControlsUrl = url.format({
        pathname: path.join(__dirname, '../build/index.html'),
        hash: '/screenshare-controls',
        protocol: 'file:',
        slashes: true,
      });

      screenShareControlsWindow.loadURL(
        isDev
          ? process.env.ELECTRON_START_URL + '#/screenshare-controls'
          : screenShareControlsUrl
      );

      screenShareControlsWindow.on('closed', () => {
        screenShareControlsWindow = undefined;

        if (initScreenShareWindow) initScreenShareWindow.close();
        if (screenShareContainerWindow) screenShareContainerWindow.close();
      });

      if (isDev) {
        screenShareControlsWindow.webContents.openDevTools();
      }
    }
  });

  ipcMain.on('update-screenshare-container-bounds', (event, overlayBounds) => {
    if (screenShareContainerWindow) {
      screenShareContainerWindow.setBounds(overlayBounds);
    }
  });

  ipcMain.on('stop-screenshare', (event, arg) => {
    videoCallWindow.webContents.send('stop-screenshare', {});

    try {
      if (initScreenShareWindow) initScreenShareWindow.close();

      if (screenShareControlsWindow) screenShareControlsWindow.close();
    } catch (error) {
      console.error(error);
    }
  });

  ipcMain.on('screen-size', async (event, arg) => {
    event.returnValue = primaryDisplay.size;
  });

  ipcMain.on('screenshare-source-bounds', async (event, sourceInfo) => {
    var overlayBounds = await getwindowBounds(sourceInfo, sWidth, sHeight);

    event.returnValue = overlayBounds;
  });

  // Make and use common methods for screenshare/windowshare wherever possible
  ipcMain.on('windowshare-source-bounds', async (event, sourceInfo) => {
    var overlayBounds = await getwindowBounds(sourceInfo, sWidth, sHeight);

    // if (windowShareContainerWindow)
    //   windowShareContainerWindow.moveAbove(sourceInfo);

    event.returnValue = overlayBounds;
  });

  ipcMain.on('move-container-above-source', (event, sourceInfo) => {
    var [sourceType, sourceId] = sourceInfo.split(':');

    // if(windowManager.getActiveWindow().id == sourceId) {
    //   if (windowShareContainerWindow)
    //     windowShareContainerWindow.setAlwaysOnTop(true);
    // } else {
    //   if (windowShareContainerWindow)
    //     windowShareContainerWindow.setAlwaysOnTop(false);
    // }

    if (windowShareContainerWindow) {
      //windowShareContainerWindow.showInactive();
      windowShareContainerWindow.moveAbove(sourceInfo);
      //windowShareContainerWindow.blur();
    }
  });

  ipcMain.on('emit-scroll', async (event, args) => {
    originalPos = robot.getMousePos();
    var containerBounds =
      args.container == 'window'
        ? windowShareContainerWindow.getBounds()
        : screenShareContainerWindow.getBounds();

    robot.moveMouse(
      (containerBounds.x + args.cursor.x) * scaleFactor,
      (containerBounds.y + args.cursor.y) * scaleFactor
    );
    robot.scrollMouse(-1 * args.event.deltaX, -1 * args.event.deltaY);
  });
  // TODO: How do we get sourceInfo here?
  ipcMain.on('profile-picture-click', async (event, args) => {
    console.log(
      'streamWindowShareWindows--------->',
      streamWindowShareWindows,
      args
    );
    // await bringToTop(args.sourceInfo);
  });

  ipcMain.on('emit-mousedown', async (event, args) => {
    await bringToTop(args.sourceInfo);

    originalPos = robot.getMousePos();
    var containerBounds =
      args.container == 'window'
        ? windowShareContainerWindow.getBounds()
        : screenShareContainerWindow.getBounds();

    robot.moveMouse(
      (containerBounds.x + args.cursor.x) * scaleFactor,
      (containerBounds.y + args.cursor.y) * scaleFactor
    );

    if (args.event.which == 3) robot.mouseToggle('down', 'right');
    else robot.mouseToggle('down', 'left');
  });

  ipcMain.on('emit-mouseup', async (event, args) => {
    originalPos = robot.getMousePos();
    var containerBounds =
      args.container == 'window'
        ? windowShareContainerWindow.getBounds()
        : screenShareContainerWindow.getBounds();

    robot.moveMouse(
      (containerBounds.x + args.cursor.x) * scaleFactor,
      (containerBounds.y + args.cursor.y) * scaleFactor
    );

    if (args.event.which == 3) robot.mouseToggle('up', 'right');
    else robot.mouseToggle('up', 'left');
  });

  ipcMain.on('emit-key', async (event, args) => {
    await bringToTop(args.sourceInfo);

    var rawKey = args.event.key.toLowerCase();
    var key = robotKeyMap[rawKey] || rawKey;
    var keyCode = args.event.which || args.event.keyCode;

    key = keyCode >= 48 && keyCode <= 57 ? String.fromCharCode(keyCode) : key;

    if (keyCode == 222) key = "'";

    if (keyCode == 192) key = '`';

    var mods = getModsArray(args.event);

    // Ignore if only a mod is pressed.
    if (mods.indexOf(key) == -1) {
      if (args.event.type == 'keyup') {
        robot.keyToggle(key, 'up', mods);
      } else if (args.event.type == 'keydown') {
        robot.keyToggle(key, 'down', mods);
      }
    }
  });
}

///////////////////
// Auto upadater //
///////////////////
autoUpdater.autoDownload = true;
autoUpdater.autoInstallOnAppQuit = true;

autoUpdater.logger = require('electron-log');
autoUpdater.logger.transports.file.level = 'info';

autoUpdater.on('update-downloaded', () => {
  dialog.showMessageBox(mainWindow, {
    message: 'A new update has been downloaded. Restart the app to install.',
  });
});

app.on('ready', () => {
  //autoUpdater.checkForUpdates();
  autoUpdater.checkForUpdatesAndNotify();
  createWindow();
});

app.on('window-all-closed', () => {
  // if (process.platform !== 'darwin') {
  //   app.quit()
  // }

  app.quit();
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

app.setLoginItemSettings({
  openAtLogin: true,
});

// Exit cleanly on request from parent process in development mode.
if (isDev) {
  if (process.platform === 'win32') {
    process.on('message', (data) => {
      if (data === 'graceful-exit') {
        app.quit();
      }
    });
  } else {
    process.on('SIGTERM', () => {
      app.quit();
    });
  }
}
