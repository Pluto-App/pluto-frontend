/* eslint-disable no-unused-vars */
import React, { useState } from 'react'
import * as Cookies from "js-cookie";
import { AGORA_APP_ID } from "../../../agora.config";
import { useOvermind } from '../../../overmind'
import StreamWindowShareCanvas from "../../agora/StreamWindowShareCanvas";

import { getWindowShareChannel } from '../../../utils/Util';

const { remote } = window.require('electron');
const StreamWindowShare = React.memo((props) => {

    const { state, actions }  = useOvermind();
    const call_data           = JSON.parse(localStorage.getItem('call_data'));

    var currentWindow           = remote.getCurrentWindow();
    const windowShareChannel    = getWindowShareChannel({user_uid: currentWindow.data.user_uid, 
        call_channel_id: call_data.call_channel_id});
    
    const [ screenShareState, setScreeenShareState] = useState({options: 'show', status: 'stopped'});
    const [ config, setConfig ] = useState({
        videoProfile: "720p_1",
        mode: "live",
        channel:  windowShareChannel,
        transcode:  "interop",
        attendeeMode: 'audience',
        baseMode: "avc",
        appId : process.env.REACT_APP_AGORA_APP_ID,
        user_id: currentWindow.data.user_id,
        user_uid: currentWindow.data.user_uid,
        owner: currentWindow.data.owner
     });

    return (
      <StreamWindowShareCanvas
        config={ config }
      />
    )
})

export default StreamWindowShare;
