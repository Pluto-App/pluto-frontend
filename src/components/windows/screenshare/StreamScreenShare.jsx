/* eslint-disable no-unused-vars */
import React, { useState } from 'react'
import * as Cookies from "js-cookie";
import { AGORA_APP_ID } from "../../../agora.config";
import { useOvermind } from '../../../overmind'
import StreamScreenShareCanvas from "../../agora/StreamScreenShareCanvas";

const StreamScreenShare = React.memo((props) => {

  const { state, actions } = useOvermind();

    const screenShareChannel = localStorage.getItem('screenshare_channel_id');
    
    const [ screenShareState, setScreeenShareState] = useState({options: 'show', status: 'stopped'});
    const [ config, setConfig ] = useState({
        videoProfile: "720p_1",
        mode: "live",
        backgroundColor: '#2e2c29',
        channel:  screenShareChannel || 'scr-' + localStorage.getItem('call_channel_id'),
        transcode:  "interop",
        attendeeMode: 'audience',
        baseMode: "avc",
        appId : process.env.REACT_APP_AGORA_APP_ID,
        uid:  undefined
    });

    return (
      <StreamScreenShareCanvas
        videoProfile={config.videoProfile}
        channel={config.channel}
        transcode={config.transcode}
        attendeeMode={config.attendeeMode}
        baseMode={config.baseMode}
        appId={config.appId}
        uid={config.uid}
      />
    )
})

export default StreamScreenShare;
