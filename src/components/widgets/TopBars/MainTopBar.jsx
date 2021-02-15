import React, { useEffect, useState } from 'react'
import { useOvermind } from '../../../overmind'
const os = window.require('os');
const { remote } = window.require('electron');

// TODO Need to show some tooltip using Tailwind CSS ToolTip
const MiniVideoCallTopBar = React.memo((props) => {

  const { actions } = useOvermind();

  const isWindows = os.platform() === 'win32';
  const isMac = os.platform() === "darwin";

  const minimize = () => {
    var win = remote.getCurrentWindow();
    win.minimize();
  }

  const close = () => {
    var win = remote.getCurrentWindow();
    win.destroy();
  }

  const openMenu = () => {
    window.require("electron").ipcRenderer.send('display-app-menu', {
      x : 10,
      y : 20
    });
  }

  return (
    <>
      {
        isMac ?
        ''
        : 
        <div className="flex items-center">
          <button className="text-white hover:bg-gray-900 focus:outline-none" style={{ marginRight: "10px" }}>
            <i className="material-icons md-light md-inactive" onClick={() => { minimize() }} style={{ fontSize: "16px", margin: "0", marginTop: "-15px" }}> minimize </i></button>
          <button className="text-white hover:bg-gray-900 focus:outline-none" >
            <i className="material-icons md-light md-inactive" onClick={() => { close() }} style={{ fontSize: "16px", margin: "0" }}> close </i>
          </button>
        </div>  
      }
    </>  
  );
})

export default MiniVideoCallTopBar;
