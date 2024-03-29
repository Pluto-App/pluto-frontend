/* eslint-disable no-unused-vars */
import React, { useState } from 'react'
import * as Cookies from "js-cookie";
import { useOvermind } from '../../../overmind'

import { socket_live, events } from '../../sockets'

const { remote, ipcRenderer } = window.require('electron');

const ScreenShareControls = React.memo((props) => {

  const { state, actions } = useOvermind();
  const [ remoteAccess, setRemoteAccess ] = useState(false);

  const toggleRemoteAccess = function(value) {
    setRemoteAccess(value);
    localStorage.setItem('remoteAccessEnabled', value);
  }

  const stopScreenShare = () => {

    ipcRenderer.send('stop-screenshare');
  }

  const controlsContainerStyle = {
    'display': 'flex',
    'backgroundColor': '#2F3136',
    'height': 'calc(100vh - 20px)'
  }

  const controlsButtonStyle = {
    fontSize: '12px',
    transition: 'all .60s ease',
    whiteSpace: 'nowrap'
  }

  const controlsTopBarStyle = {
    height: '20px',
    textAlign: 'right',
    color: 'white',
    backgroundColor: '#202225',
    WebkitUserSelect: 'none',
    WebkitAppRegion: 'drag'
  }

  return (
    <>
      <div id="controls-topbar" style={controlsTopBarStyle}>
        <i className="material-icons md-light md-inactive mr-2" style={{fontSize: '16px'}}>drag_handle</i>
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
                <i className="material-icons md-light md-inactive mr-2" style={{fontSize: '16px'}}>stop_screen_share</i>
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
              
                  <i className="material-icons md-light md-inactive mr-2" style={{fontSize: '16px'}}>desktop_access_disabled</i>
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
              
                  <i className="material-icons md-light md-inactive mr-2" style={{fontSize: '16px'}}>
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
