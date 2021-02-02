import React, { useEffect, useState } from 'react'
import { useOvermind } from '../../../overmind'
const os = window.require('os');
const { remote } = window.require('electron');

// TODO Need to show some tooltip using Tailwind CSS ToolTip
const MiniVideoCallTopBar = React.memo((props) => {

  const { actions } = useOvermind();

  const expand = () => {

    actions.app.setVideoCallCompactMode(false);
    window.require("electron").ipcRenderer.send('expand-video-call-window');

  }

  return (
    <div style={{textAlign: 'right', color:'#B8B9BC'}}>

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
