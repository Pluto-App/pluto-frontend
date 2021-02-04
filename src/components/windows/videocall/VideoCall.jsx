/* eslint-disable no-unused-vars */
import React, { useEffect, useState, useContext } from 'react'
import * as Cookies from "js-cookie";
import { css } from "@emotion/core";
import { AGORA_APP_ID } from "../../../agora.config";
import { useOvermind } from '../../../overmind'

import { socket_live, events } from '../../sockets'
import { AuthContext } from '../../../context/AuthContext'

import VideoCallCanvas from "../../agora/VideoCallCanvas";

const VideoCall = React.memo((props) => {

  const { state, actions } = useOvermind();

  const { authData } = useContext(AuthContext);
    
  const [ config, setConfig ] = useState({
      videoProfile: "1080p_1",
      mode: "live",
      channel: localStorage.getItem('call_channel_id'),
      transcode:  Cookies.get("transcode") || "interop",
      baseMode:  Cookies.get("baseMode") || "avc",
      appId : AGORA_APP_ID,
      uid:  undefined
  });

   useEffect(() => {

        if(state.currentTeamId){
            actions.team.getTeam({authData: authData, team_id: state.currentTeamId})    
        }

    }, [actions, authData, state.currentTeamId, state.teamUpdateReq])

  useEffect(() => {

      socket_live.on(events.activeWindowUpdate, (data) => {
        actions.app.updateUserActiveWindowData(data);
      });

    },[]
  );


  return (
    <div className="font-sans w-full" style={{position: 'absolute', top: '25px'}}>
      
      <div className="flex" style={{ height: "calc(100vh - 25px)" }}>
        <div className="bg-black text-white flex-1 p-0 w-100">
          <VideoCallCanvas
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

export default VideoCall;
