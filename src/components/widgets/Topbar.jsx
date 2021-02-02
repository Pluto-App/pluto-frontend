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
  var page;

  switch(pageHash) {
    case '#/video-call':
      page = 'video-call'
      break;
    default:
      page = 'main'
  }


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

  const videoTopBarStyle = {
    background: '#202225',
    height: '25px'
  }



  return (
    <div className="topBar draggable-elem" style={ page == 'video-call' ? videoTopBarStyle : {}}>
      <div className="flex justify-between items-center px-2 p-0">
        {/*
        <button className="text-white cursor-pointer hover:bg-gray-900 focus:outline-none">
          <i className="material-icons md-light md-inactive" onClick={() => { openMenu() }} style={{ fontSize: "16px" }}> menu </i>
        </button>
        */}

        {
          page == 'video-call' && 
          <div className="flex-1 draggable-elem text-white font-bold center" >
            <i className="material-icons md-light md-inactive" 
               style={{ fontSize: "24px" }}> 
              drag_handle 
            </i>
          </div>
        }
        
        {
          {
            '#/': <MainTopBar />,
            'video-call': <VideoCallTopBar />
          }[page]
        }
      </div>
    </div>
  );
})

export default TopBar;