import React, { useEffect, useState } from 'react'
import { useOvermind } from '../../../overmind'
const os = window.require('os');
const { remote } = window.require('electron');

// TODO Need to show some tooltip using Tailwind CSS ToolTip
const MiniVideoCallTopBar = React.memo((props) => {

  const { actions } = useOvermind();

  const expand = () => {

    let channel_id = localStorage.getItem('call_channel_id');
    window.require("electron").ipcRenderer.send('init-video-call-window', channel_id);

  }

  return (
    <div className="flex items-center">

      <button className="text-white hover:bg-gray-900 focus:outline-none" style={{cursor: 'pointer'}}>
        <i className="material-icons md-light md-inactive" 
          onClick={() => { expand() }} style={{ fontSize: "16px", margin: "0" }}> 
          fullscreen 
        </i>
      </button>
    </div>  
  );
})

export default MiniVideoCallTopBar;
