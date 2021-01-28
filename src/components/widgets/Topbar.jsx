import React, { useEffect, useState } from 'react'
import { useOvermind } from '../../overmind'

import VideoCallTopBar from './TopBars/VideoCallTopBar'
import MainTopBar from './TopBars/MainTopBar'

const os = window.require('os');
const { remote } = window.require('electron');

// TODO Need to show some tooltip using Tailwind CSS ToolTip
const TopBar = React.memo((props) => {

  const { actions } = useOvermind();

  const isWindows = os.platform() === 'win32'
  const isMac = os.platform() === "darwin";

  const pageHash = window.location.hash;

  const minimize = () => {
    var window = remote.getCurrentWindow();
    // TODO Emit user is away/sleeping mode. 
    window.minimize();
  }

  const close = () => {
    // TODO need to close all windows here. 
    var window = remote.getCurrentWindow();
    window.close();
  }

  const openMenu = () => {
    window.require("electron").ipcRenderer.send('display-app-menu', {
      x : 10,
      y : 20
    });
  }

  return (
    <div className="topBar">
      <div className="flex justify-between items-center px-2 p-0">
        {/*
        <button className="text-white cursor-pointer hover:bg-gray-900 focus:outline-none">
          <i className="material-icons md-light md-inactive" onClick={() => { openMenu() }} style={{ fontSize: "16px" }}> menu </i>
        </button>
        */}

        <div className="flex-1 draggable-elem text-white font-bold" style={{ height: "30px" }}>
        </div>
        {
          {
            '#/': <MainTopBar />,
            '#/video-call': <VideoCallTopBar />
          }[pageHash]
        }
      </div>
    </div>
  );
})

export default TopBar;