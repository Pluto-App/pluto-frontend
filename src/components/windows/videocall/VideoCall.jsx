/* eslint-disable no-unused-vars */
import React, { useEffect, useState, useContext } from 'react'
import * as Cookies from "js-cookie";
import { useOvermind } from '../../../overmind'

import { socket_live, events } from '../../sockets'
import { AuthContext } from '../../../context/AuthContext'

import VideoCallCanvas from "../../agora/VideoCallCanvas";

const VideoCall = React.memo((props) => {

  const { state, actions } = useOvermind();

  const { authData } = useContext(AuthContext);
  
  const user        = JSON.parse(localStorage.getItem('currentUser')).user;
  const call_data   = JSON.parse(localStorage.getItem('call_data'));

  const [ config, setConfig ] = useState({
      videoProfile: "720p_1",
      channel: call_data.call_channel_id,
      appId : process.env.REACT_APP_AGORA_APP_ID,
      user_id: user.id,
      user_uid: user.uid
  });

  useEffect(() => {

    socket_live.on(events.activeWindowUpdate, (data) => {
      actions.app.updateUserActiveWindowData(data);
    });

  },[]);

  return (
    <div className="font-sans w-full" style={{position: 'fixed', top: '25px'}}>
      
      <div className="flex" style={{ height: "calc(100vh - 25px)" }}>
        <div className="bg-black flex-1 p-0 w-100">
          <VideoCallCanvas
            config={ config }
          />
        </div>
      </div>
    </div>
  )
})

export default VideoCall;
