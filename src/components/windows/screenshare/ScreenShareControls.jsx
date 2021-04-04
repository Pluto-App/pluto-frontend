/* eslint-disable no-unused-vars */
import React, { useState } from 'react'
import * as Cookies from "js-cookie";
import { useOvermind } from '../../../overmind'

import { socket_live, events } from '../../sockets'

const { remote } = window.require('electron');

const ScreenShareControls = React.memo((props) => {

  const { state, actions } = useOvermind();
  const [ remoteAccess, setRemoteAccess ] = useState(false);

  const toggleRemoteAccess = function(value) {
    setRemoteAccess(value);
    localStorage.setItem('remoteAccessEnabled', value);
  }

  const stopScreenShare = () => {

    window.require("electron").ipcRenderer.send('stop-screenshare');
  }

  const controlsContainerStyle = {
    'display': 'flex',
    'background-color': '#2F3136',
    'height': 'calc(100vh - 20px)'
  }

  const controlsButtonStyle = {
    'font-size': '12px',
    'transition': 'all .60s ease',
    'white-space': 'nowrap'
  }

  const controlsTopBarStyle = {
    'height': '20px',
    'text-align': 'right',
    'color': 'white',
    'background-color': '#202225',
    '-webkit-user-select': 'none',
    '-webkit-app-region': 'drag'
  }

  return (
    <>
      <div id="controls-topbar" style={controlsTopBarStyle}>
        <i className="material-icons md-light md-inactive mr-2" style={{'font-size': '16px'}}>drag_handle</i>
      </div>
      <div id="controls-container" style={controlsContainerStyle}>
        <div className="px-2 w-full">
            <button
                className="bg-indigo-800 w-full rounded-full flex justify-center items-center hover:bg-indigo-400 
                text-white py-2 px-4 mt-2 focus:outline-none focus:shadow-outline"
                type="button"
                style={controlsButtonStyle}
                onClick={() => {
                      stopScreenShare();
                  }}
              >
                <i className="material-icons md-light md-inactive mr-2" style={{'font-size': '16px'}}>stop_screen_share</i>
                  Stop ScreenShare
            </button>
        </div>
        <div className="px-2 w-full">

          {
                remoteAccess ?

                <button
                  className="bg-pink-800 w-full rounded-full flex justify-center items-center hover:bg-pink-400 
                  text-white py-2 px-3 mt-2 focus:outline-none focus:shadow-outline"
                  type="button"
                  style={controlsButtonStyle}
                  onClick={() => {
                      toggleRemoteAccess(false);
                  }}
                >
              
                  <i className="material-icons md-light md-inactive mr-2" style={{'font-size': '16px'}}>desktop_access_disabled</i>
                    Disable Remote Access
                </button>

                :

                <button
                  className="bg-pink-800 w-full rounded-full flex justify-center items-center hover:bg-pink-400 
                  text-white py-2 px-3 mt-2 focus:outline-none focus:shadow-outline"
                  type="button"
                  style={controlsButtonStyle}
                  onClick={() => {
                      toggleRemoteAccess(true);
                  }}
                >
              
                  <i className="material-icons md-light md-inactive mr-2" style={{'font-size': '16px'}}>
                    desktop_windows
                  </i>
                    Enable Remote Access
                </button>

          }    
        </div>
    </div>
    </>
  )
})

export default ScreenShareControls;
