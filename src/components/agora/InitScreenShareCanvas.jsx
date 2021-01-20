import React, { useEffect, useState, useContext } from 'react'
import { merge } from 'lodash'
import AgoraRTC from 'agora-rtc-sdk'

import { useOvermind } from '../../overmind'
import { socket_live, events } from '../sockets'

import {AuthContext} from '../../context/AuthContext'

const { remote } = window.require('electron');

const InitScreenShareCanvas = React.memo((props) => {

	const { state, actions } = useOvermind();
	const { authData, setAuthData } = useContext(AuthContext);

	const AgoraClient = AgoraRTC.createClient({ mode: props.transcode, codec: "vp8" });

	var localStream = {};

	const [ mediaSource, setMediaSource ] = useState({ audio: false, video: false, screen: true});
	const [ screenShareState, setScreenShareState ] = useState({ ready: false});

	const streamInit = (uid, attendeeMode, videoProfile, config) => {

	    let defaultConfig = {
	      	streamID: uid,
	      	audio: false,
	      	video: false,
	      	screen: true,
	    }

    	let stream = AgoraRTC.createStream(merge(defaultConfig, config))
    	stream.setVideoProfile(videoProfile)
    	return stream
  	}

  	const exitScreenShare = () => {
  		
  		actions.app.clearScreenShareData();
  		var window = remote.getCurrentWindow();
      	window.close();
  	}

    useEffect(() => {

    	actions.app.setScreenSize();

        AgoraClient.init(props.appId, () => {
	      	
	      	AgoraClient.join(props.appId, props.channel, props.uid, (uid) => {

	      		socket_live.emit(events.joinRoom, props.channel);

        		localStream = streamInit(uid, props.attendeeMode, props.videoProfile);

        		localStream.init(() => {

            		AgoraClient.publish(localStream, err => {
              			alert("Publish local stream error: " + err);
            		})

				 	socket_live.emit(events.userScreenShare, {
	          			call_channel_id: 	localStorage.getItem("call_channel_id"),
	          			resolution: 		state.screenSize,
				 		channel_id: 		props.channel,
				 		sender_id:  		state.userProfileData.uid
				 	});

	          		window.require("electron").ipcRenderer.send('sharing-screen');

	          		setScreenShareState({ ready: true })
	        	},
	          	err => {

	            	alert("No Access to media stream", err)
	            	exitScreenShare();
	            	setScreenShareState({ ready: true })
	          	})
	      	})
    	})

    }, [])

    useEffect(() => {

        actions.user.getLoggedInUser({authData: authData})

    }, [actions, authData])

    const style = {
  		display: 'grid',
  		alignItems: 'center',
  		justifyItems: 'center',
  		gridTemplateRows: 'repeat(1, auto)',
  		gridTemplateColumns: 'repeat(1, auto)'
    }

    return (
		<div id="ag-screenshare-canvas" >
      	</div>
	);
})

export default InitScreenShareCanvas;