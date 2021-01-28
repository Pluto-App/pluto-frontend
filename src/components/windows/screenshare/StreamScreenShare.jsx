/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from 'react'
import * as Cookies from "js-cookie";
import { css } from "@emotion/core";
import { AGORA_APP_ID } from "../../../agora.config";
import { useOvermind } from '../../../overmind'
import StreamScreenShareCanvas from "../../agora/StreamScreenShareCanvas";

const StreamScreenShare = React.memo((props) => {

  const { state, actions } = useOvermind();

    const screenShareChannel = localStorage.getItem('screenshare_channel_id');
    const screenShareResolution = JSON.parse(localStorage.getItem("screenshare_resolution")) || {width: 16, height: 10};

    const paddingPercentage = (1/(screenShareResolution.width/screenShareResolution.height))*100 + '%';
    
    const [ screenShareState, setScreeenShareState] = useState({options: 'show', status: 'stopped'});
    const [ config, setConfig ] = useState({
        videoProfile: "1080p_1",
        mode: "live",
        backgroundColor: '#2e2c29',
        channel:  screenShareChannel || 'scr-' + localStorage.getItem('call_channel_id'),
        transcode:  Cookies.get("transcode") || "interop",
        attendeeMode: 'audience',
        baseMode:  Cookies.get("baseMode") || "avc",
        appId : AGORA_APP_ID,
        uid:  undefined
    });

    const display_video = css`
        -webkit-app-region: drag;
        height: 10px; 
        width: 100%;
    `;

    const wrapper_style = {
      //padding: '10px',
      background: 'white',
      'box-sizing': 'border-box',
      resize: 'horizontal',
      border: '1px dashed',
      overflow: 'auto',
      'max-width': '100%',
      //height: 'calc(100vh - 30px)',
    };

    const media_style = {
      'width': '100%',
      'padding-bottom': paddingPercentage,
      'background': 'black',
      'position': 'relative'
    };

    return (

        <div style={wrapper_style} className='screen-share-wrapper'>
          <div style={media_style} className='screen-share-media'>

            <StreamScreenShareCanvas
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
    )
})

export default StreamScreenShare;
