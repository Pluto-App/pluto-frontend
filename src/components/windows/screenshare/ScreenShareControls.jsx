/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from 'react'
import * as Cookies from "js-cookie";
import { css } from "@emotion/core";
import { useOvermind } from '../../../overmind'

const { remote } = window.require('electron');

const ScreenShareControls = React.memo((props) => {

  const { state, actions } = useOvermind();
  const [ remoteAccess, setRemoteAccess ] = useState(false);

  const toggleRemoteAccess = function(value) {
    setRemoteAccess(value);
    localStorage.setItem('remoteAccessEnabled', value);
  }

  const stopScreenShare = () => {

    actions.app.clearScreenShareData();
    var window = remote.getCurrentWindow();
    window.close();
  }

  const controlsContainerStyle = {
    'display': 'flex',
    'background-color': 'black',
    '-webkit-user-select': 'none',
    '-webkit-app-region': 'drag',
    'height': '80px'
  }

  const controlsButtonStyle = {
    'font-size': '14px',
    'transition': 'all .60s ease',
    'white-space': 'nowrap'
  }

  return (

     <div id="controls-container" style={controlsContainerStyle}>
        <div className="mt-4 px-3 w-full">
            <button
                className="bg-indigo-800 w-full rounded-full flex justify-center items-center hover:bg-indigo-400 
                text-white font-bold py-2 px-4 mt-2 focus:outline-none focus:shadow-outline"
                type="button"
                style={controlsButtonStyle}
                onClick={() => {
                      stopScreenShare();
                  }}
              >
                <i className="material-icons md-light md-inactive mr-2">stop_screen_share</i>
                  Stop ScreenShare
            </button>
        </div>
        <div className="mt-4 px-3 w-full">

          {
                remoteAccess ?

                <button
                  className="bg-pink-800 w-full rounded-full flex justify-center items-center hover:bg-pink-400 
                  text-white font-bold py-2 px-4 mt-2 focus:outline-none focus:shadow-outline"
                  type="button"
                  style={controlsButtonStyle}
                  onClick={() => {
                      toggleRemoteAccess(false);
                  }}
                >
              
                  <i className="material-icons md-light md-inactive mr-2">desktop_access_disabled</i>
                    Disable Remote Access
                </button>

                :

                <button
                  className="bg-pink-800 w-full rounded-full flex justify-center items-center hover:bg-pink-400 
                  text-white font-bold py-2 px-4 mt-2 focus:outline-none focus:shadow-outline"
                  type="button"
                  style={controlsButtonStyle}
                  onClick={() => {
                      toggleRemoteAccess(true);
                  }}
                >
              
                  <i className="material-icons md-light md-inactive mr-2">desktop_windows</i>
                    Enable Remote Access
                </button>

          }
            
        </div>
     </div>
  )
})

export default ScreenShareControls;
