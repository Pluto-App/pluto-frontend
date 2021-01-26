/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from 'react'
import * as Cookies from "js-cookie";
import { css } from "@emotion/core";
import { AGORA_APP_ID } from "../../../agora.config";
import { useOvermind } from '../../../overmind'
import MiniVideoCallCanvas from "../../agora/MiniVideoCallCanvas";

const MiniVideoCall = React.memo((props) => {

  const { state, actions } = useOvermind();
    
  const [ config, setConfig ] = useState({
      videoProfile: "1080p_1",
      mode: "live",
      channel: localStorage.getItem('call_channel_id'),
      transcode:  Cookies.get("transcode") || "interop",
      baseMode:  Cookies.get("baseMode") || "avc",
      appId : AGORA_APP_ID,
      uid:  undefined
  });


  return (

    <div className="font-sans" style={{marginTop: '30px'}}>
      <div className="bg-black"></div>
      
      <div className="flex" style={{ height: "calc(100vh - 30px)" }}>
        <div className="bg-black text-white flex-1 p-0 w-100">
          <MiniVideoCallCanvas
            videoProfile={config.videoProfile}
            channel={config.channel}
            transcode={config.transcode}
            baseMode={config.baseMode}
            appId={config.appId}
            uid={config.uid}
          />
        </div>
      </div>
    </div>


    )
})

export default MiniVideoCall;
