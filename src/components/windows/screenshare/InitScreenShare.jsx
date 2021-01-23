/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from 'react'
import * as Cookies from "js-cookie";
import { css } from "@emotion/core";
import { AGORA_APP_ID } from "../../../agora.config";
import { useOvermind } from '../../../overmind'
import InitScreenShareCanvas from "../../agora/InitScreenShareCanvas";

const ScreenShare = React.memo((props) => {

  const { state, actions } = useOvermind();

    const screenShareChannel = localStorage.getItem('screenshare_channel_id');
    
    const [ screenShareState, setScreeenShareState] = useState({options: 'show', status: 'stopped'});
    const [ config, setConfig ] = useState({
        videoProfile: "1080p_1",
        mode: "live",
        channel:  screenShareChannel || 'scr-' + localStorage.getItem('call_channel_id'),
        transcode:  Cookies.get("transcode") || "interop",
        attendeeMode: "screen",
        baseMode:  Cookies.get("baseMode") || "avc",
        appId : AGORA_APP_ID,
        uid:  undefined
    });

    const display_video = css`
        -webkit-app-region: drag;
        height: 10px; 
        width: 100%;
    `;

    return (

        <div className="font-sans min-h-screen">
            <div style={display_video} className="bg-black"></div>
            <div className="flex" style={{ height: "calc(100vh - 10px)" }}>
              <div className="bg-black text-white flex-1 p-0 w-100">
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

export default ScreenShare;