/* eslint-disable no-unused-vars */
import React, { useEffect, useState, useContext } from 'react'
import * as Cookies from "js-cookie";
import { css } from "@emotion/core";
import { useOvermind } from '../../../overmind'

import { socket_live, events } from '../../sockets'
import { AuthContext } from '../../../context/AuthContext'

import VideoCallCanvas from "../../agora/VideoCallCanvas";

const VideoCall = React.memo((props) => {

  const { state, actions } = useOvermind();

  const { authData } = useContext(AuthContext);
  
  const user_id = JSON.parse(localStorage.getItem('currentUser')).user.id;
  const channel_id = localStorage.getItem('call_channel_id');

  const [ config, setConfig ] = useState({
      videoProfile: "1080p_1",
      mode: "live",
      channel: channel_id,
      transcode:  Cookies.get("transcode") || "interop",
      baseMode:  Cookies.get("baseMode") || "avc",
      appId : process.env.REACT_APP_AGORA_APP_ID,
      uid: user_id
  });

  useEffect(() => {

      if(state.currentTeam.id){

        actions.team.getTeam({authData: authData, team_id: state.currentTeam.id})    
      }

  }, [actions, authData, state.currentTeam.id])

  useEffect(() => {

    socket_live.emit('join_room',{ room: channel_id, user_id: user_id });

    socket_live.on(events.activeWindowUpdate, (data) => {
      actions.app.updateUserActiveWindowData(data);
    });

  },[]);


  return (
    <div className="font-sans w-full" style={{position: 'absolute', top: '25px'}}>
      
      <div className="flex" style={{ height: "calc(100vh - 25px)" }}>
        <div className="bg-black flex-1 p-0 w-100">
          <VideoCallCanvas
            videoProfile={config.videoProfile}
            channel={config.channel}
            transcode={config.transcode}
            baseMode={config.baseMode}
            appId={config.appId}
            uid={ config.uid }
          />
        </div>
      </div>
    </div>
  )
})

export default VideoCall;
