/* eslint-disable no-unused-vars */
import React, { useState } from 'react'
import * as Cookies from "js-cookie";
import { useOvermind } from '../../../overmind'
import InitScreenShareCanvas from "../../agora/InitScreenShareCanvas";

const InitScreenShare = React.memo((props) => {

  const { state, actions } = useOvermind();

    const screenShareChannel = localStorage.getItem('screenshare_channel_id');
    
    const [ config, setConfig ] = useState({
        videoProfile: "720p_1",
        mode: "live",
        channel:  screenShareChannel || 'scr-' + localStorage.getItem('call_channel_id'),
        transcode:  Cookies.get("transcode") || "interop",
        attendeeMode: "screen",
        baseMode:  Cookies.get("baseMode") || "avc",
        appId : process.env.REACT_APP_AGORA_APP_ID,
        uid:  undefined
    });

    return (

        <div className="font-sans" style={{background: '#2F3136', maxHeight: '100vh', overflowY: 'scroll'}}>
            <div className="flex">
              <div className="text-white flex-1 p-0 w-100">
                <InitScreenShareCanvas
                  videoProfile={config.videoProfile}
                  channel={config.channel}
                  transcode={config.transcode}
                  attendeeMode={config.attendeeMode}
                  baseMode={config.baseMode}
                  appId={config.appId}
                  uid={config.uid}
                />
              </div>
            </div>
        </div>
    )
})

export default InitScreenShare;
