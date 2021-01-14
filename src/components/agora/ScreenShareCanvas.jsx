import React, { useEffect, useState, useContext } from 'react'
import { merge } from 'lodash'
import AgoraRTC from 'agora-rtc-sdk'

import { useOvermind } from '../../overmind'
import { socket_live, events } from '../sockets'

import {AuthContext} from '../../context/AuthContext'

const { remote } = window.require('electron');

const tile_canvas = {
  '1': ['1 / 1 / 4 / 2'],
  '2': ['1 / 1 / 4 / 2', '4 / 1 / 7 / 2'],
  '3': ['1 / 1 / 4 / 2', '4 / 1 / 7 / 2', '7 / 1 / 10 / 2'],
  '4': ['1 / 1 / 4 / 2', '4 / 1 / 7 / 2', '7 / 1 / 10 / 2', '10 / 1 / 13 / 2'],
  // '5': ['span 3/span 4/13/9', 'span 3/span 4/13/13', 'span 3/span 4/13/17', 'span 3/span 4/13/21', 'span 9/span 16/10/21'],
  // '6': ['span 3/span 4/13/7', 'span 3/span 4/13/11', 'span 3/span 4/13/15', 'span 3/span 4/13/19', 'span 3/span 4/13/23', 'span 9/span 16/10/21'],
  // '7': ['span 3/span 4/10/1', 'span 3/span 4/13/1', 'span 3/span 4/16/1', 'span 3/span 4/19/1', 'span 3/span 4/13/21', 'span 3/span 4/13/25', 'span 9/span 16/10/21'],
}

const ScreenShareCanvas = React.memo((props) => {

	const { state, actions } = useOvermind();
	const { authData, setAuthData } = useContext(AuthContext);

	const AgoraClient = AgoraRTC.createClient({ mode: props.transcode, codec: "vp8" });

	var localStream = {};

	const [ mediaSource, setMediaSource ] = useState({ audio: false, video: false, screen: true});
	const [ screenShareState, setScreenShareState ] = useState({ ready: false});
	const [ streamList, setStreamList ] = useState([]);

	const streamInit = (uid, attendeeMode, videoProfile, config) => {

	    let defaultConfig = {
	      	streamID: uid,
	      	audio: mediaSource.audio,
	      	video: mediaSource.video,
	      	screen: mediaSource.screen,
	    }

    	switch (attendeeMode) {

      		case 'audio-only':
        		defaultConfig.video = false
		        defaultConfig.audio = true
		        defaultConfig.screen = false
		        break;

	      	case 'audience':
		        defaultConfig.video = false
		        defaultConfig.audio = false
		        defaultConfig.screen = false
		        break;

	      	case 'video':
		        defaultConfig.video = true
		        defaultConfig.audio = true
		        defaultConfig.screen = false
		        break;

	      	case 'screen':
		        defaultConfig.video = false
		        defaultConfig.audio = false
		        defaultConfig.screen = true
		        break;

	      	default:
		        break
    	}

    	let stream = AgoraRTC.createStream(merge(defaultConfig, config))
    	stream.setVideoProfile(videoProfile)
    	return stream
  	}

	const subscribeStreamEvents = () => {

	    AgoraClient.on('stream-added', function (evt) {

	      	let stream = evt.stream
	      	console.log("New stream added: " + stream.getId())
	      	console.log('At ' + new Date().toLocaleTimeString())
	      	console.log("Subscribe ", stream)

	      	AgoraClient.subscribe(stream, function (err) {
	        	console.log("Subscribe stream failed", err)
	      	})
	    })

	    AgoraClient.on('user-published', function (evt) {

	      	let stream = evt.stream
	      	console.log("New stream added: " + stream.getId())
	      	console.log('At ' + new Date().toLocaleTimeString())
	      	console.log("Subscribe ", stream)

	      	AgoraClient.subscribe(stream, function (err) {
	        	console.log("Subscribe stream failed", err)
	      	})
	    })

	    AgoraClient.on('peer-leave', function (evt) {

	      	console.log("Peer has left: " + evt.uid)
	      	console.log(new Date().toLocaleTimeString())
	      	console.log(evt)

	      	removeStream(evt.uid)
	    })

	    AgoraClient.on('stream-subscribed', function (evt) {

	      	let stream = evt.stream
	      	console.log("Got stream-subscribed event")
	      	console.log(new Date().toLocaleTimeString())
	      	console.log("Subscribe remote stream successfully: " + stream.getId())
	      	console.log(evt)

	     	addStream(stream)
	    })

	    AgoraClient.on("stream-removed", function (evt) {
	      	
	      	let stream = evt.stream
	      	console.log("Stream removed: " + stream.getId())
	      	console.log(new Date().toLocaleTimeString())
	      	console.log(evt)
	      
	      	removeStream(stream.getId())
	    })
  	}

  	const addStream = (stream, push = false) => {
	    let repeatition = streamList.some(item => {
	      return item.getId() === stream.getId()
	    })
	    if (repeatition) {
	      return
	    }
	    if (push) {
	    	setStreamList(
	    		streamList.concat([stream])
    		)
	    } else {
	    	setStreamList(
	    		[stream].concat(streamList)
    		)
	    }
  	}

  	const removeStream = (uid) => {
	    streamList.map((item, index) => {
	      if (item.getId() === uid) {
	        item.close()
	        let element = document.querySelector('#ag-item-' + uid)
	        if (element) {
	          element.parentNode.removeChild(element)
	        }
	        let tempList = [...streamList]
	        tempList.splice(index, 1)

	        setStreamList(tempList)
	      }

	    })
  	}

  	const exitScreenShare = () => {
  		
  		actions.app.clearScreenShareData();
  		var window = remote.getCurrentWindow();
      	window.close();
  	}

    useEffect(() => {

        AgoraClient.init(props.appId, () => {

	      	subscribeStreamEvents()
	      	
	      	AgoraClient.join(props.appId, props.channel, props.uid, (uid) => {

	      		socket_live.emit(events.joinRoom, props.channel);

	        	if (props.attendeeMode !== 'audience') {

	        		localStream = streamInit(uid, props.attendeeMode, props.videoProfile);
	        		localStream.init(() => {
		          		if (props.attendeeMode !== 'audience') {
		            		addStream(localStream, true)

		            		AgoraClient.publish(localStream, err => {
		              			alert("Publish local stream error: " + err);
		            		})

						 	socket_live.emit(events.viewScreenShare, {
						 		channel_id: props.channel,
						 		user:  		{
						 			id: 	state.userProfileData.id,
						 			uid: 	state.userProfileData.uid,
						 			name: 	state.userProfileData.name
					 			}
						 	});

			          		window.require("electron").ipcRenderer.send('sharing-screen');
		          		}
		          		setScreenShareState({ ready: true })
		        	},
		          	err => {
		            	alert("No Access to media stream", err)
		            	exitScreenShare();
		            	setScreenShareState({ ready: true })
		          	})
		          	
	        	} else {
	        		socket_live.emit(events.userScreenShare, {
	          			call_channel_id: 	localStorage.getItem("call_channel_id"),
				 		channel_id: 		props.channel,
				 		sender_id:  		state.userProfileData.uid
				 	});
	        	}
	      	})
    	})

    }, [])

    useEffect(() => {

	    streamList.map((stream, index) => {	     
	     	stream.play('ag-screen');
	    })

    }, [streamList])

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
    		<div id="ag-screen" class="ag-item" >
    		</div>
        	<div className="ag-btn-group">
    		</div>
      	</div>
	);

})

export default ScreenShareCanvas;