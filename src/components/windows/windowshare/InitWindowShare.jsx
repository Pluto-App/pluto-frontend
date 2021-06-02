/* eslint-disable no-unused-vars */
import React, { useState, useContext } from 'react'
import * as Cookies from "js-cookie";
import { useOvermind } from '../../../overmind'
import { AuthContext } from '../../../context/AuthContext'

import InitWindowShareCanvas from "../../agora/InitWindowShareCanvas";

import { getWindowShareChannel } from '../../../utils/Util';

const { remote } = window.require('electron');
const currentWindow = remote.getCurrentWindow();

const InitWindowShare = React.memo((props) => {

    const { state, actions } = useOvermind();
    const { authData } = useContext(AuthContext);

    const windowShareChannel  = getWindowShareChannel({user_uid: authData.user.uid, 
        call_channel_id: currentWindow.data.call_data.call_channel_id});
    
    const [ config, setConfig ] = useState({
        videoProfile: "720p_1",
        mode: "live",
        channel:  windowShareChannel,
        transcode: "interop",
        attendeeMode: "screen",
        baseMode: "avc",
        appId : process.env.REACT_APP_AGORA_APP_ID,
        user_id: authData.user.id,
        user_uid: authData.user.uid,
        user_color: currentWindow.data.user_color
    });

    return (

        <div className="font-sans" style={{background: '#2F3136', maxHeight: '100vh', overflowY: 'scroll'}}>
            <div className="flex">
              <div className="text-white flex-1 p-0 w-100">
                <InitWindowShareCanvas
                  config={ config }
                />
              </div>
            </div>
        </div>
    )
})

export default InitWindowShare;
