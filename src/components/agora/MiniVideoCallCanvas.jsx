import React, { useEffect, useState, useContext } from 'react'
import { merge } from 'lodash'
import AgoraRTC from 'agora-rtc-sdk'

import { useOvermind } from '../../overmind'
import { socket_live, events } from '../sockets'

import {AuthContext} from '../../context/AuthContext'

import StreamScreenShare from '../windows/screenshare/StreamScreenShare'

const { remote } = window.require('electron');
var localStream = {};

const MiniVideoCallCanvas = React.memo((props) => {

	const { state, actions } = useOvermind();
	const { authData, setAuthData } = useContext(AuthContext);

	const [ streamList, setStreamList ] = useState([]);
	const [ userData, setUserData ] = useState({});

	const AgoraClient = AgoraRTC.createClient({ mode: props.transcode, codec: "vp8" });

	const [ sharingScreen, setSharingScreen ] = useState(false);
	const [ enabledMedia, setEnabledMedia ] = useState({audio: false, video: false});

	const streamInit = (uid, videoProfile, config) => {

	    let defaultConfig = {
	      	streamID: uid,
	      	audio: true,
	      	video: true,
	      	screen: false
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

    useEffect(() => {

        AgoraClient.init(props.appId, () => {
	      	
	      	AgoraClient.join(props.appId, props.channel, props.uid, (uid) => {

	      		socket_live.emit(events.joinRoom, props.channel);
        		localStream = streamInit(uid, props.videoProfile);

        		localStream.init(() => {
        			localStream.disableVideo();
        			localStream.disableAudio();

        			addStream(localStream, true)
            		AgoraClient.publish(localStream, err => {
              			alert("Publish local stream error: " + err);
            		})

	        	},
	          	err => {

	            	alert("No Access to media stream", err)
	          	})
	      	})
    	})

    }, [])


    useEffect(() => {

        actions.user.getLoggedInUser({authData: authData})

    }, [actions, authData])

    useEffect(() => {

    	let canvas = document.querySelector('#ag-canvas')
    	let no = streamList.length
    	let height = (120 * no) + 75;

	    streamList.map((stream, index) => {

	     	let id = stream.getId()
	     	let elementId = '#ag-item-' + id;
     		let dom = document.querySelector(elementId)
	      	
	      	if (!dom) {
	        	dom = document.createElement('div')
	        	dom.setAttribute('id', elementId)
	        	dom.setAttribute('class', 'ag-item')
	        	dom.setAttribute('style', 'height: 120px')
	        	canvas.appendChild(dom)
	     	}

	     	if(stream.isPlaying())
	     		stream.stop();

	     	stream.play(elementId);
	    })

	    if(state.streamingScreenShare)
	    	height += 130;

	    window.require("electron").ipcRenderer.send('set-video-player-height', height);

    }, [streamList])

    useEffect(() => {

    	// For now we aren't doing anything here. But we know we can!
    }, [state.streamingScreenShare])

   	const handleCamera = (e) => {
		if (localStream.isVideoOn()) {
      	
      		localStream.disableVideo()
      		document.getElementById("video-icon").innerHTML = "videocam_off"
		
		} else {
      		localStream.unmuteVideo()
      		document.getElementById("video-icon").innerHTML = "videocam"
    	}
  	}

 	const handleMic = (e) => {
    	if (localStream.isAudioOn()) {
      		localStream.disableAudio()
      		document.getElementById("mic-icon").innerHTML = "mic_off"
    	} else {
      		localStream.unmuteAudio()
      		document.getElementById("mic-icon").innerHTML = "mic"
    	}
  	}

  	const handleScreenShare = async (e) => {

    	if (sharingScreen) {

      		window.require("electron").ipcRenderer.send('stop-screenshare');
      		setSharingScreen(false);
      
    	} else {
      
      		window.require("electron").ipcRenderer.send('init-screenshare');
      		setSharingScreen(true);
    	}
  	}

  	const handleExit = (e) => {
	    
	    if (e.currentTarget.classList.contains('disabled')) {
      		return
	    }

	    try {
      		
      		AgoraClient && AgoraClient.unpublish(localStream)
	      	localStream && localStream.close()
	      
	      	AgoraClient && AgoraClient.leave(() => {
	        	console.log('Client succeed to leave.')
	      	}, () => {
	        	console.log('Client failed to leave.')
	      	})
	    }
	    
	    finally {

	    	actions.app.clearVideoCallData();
	      	var window = remote.getCurrentWindow();
	      	window.close();
	    }
  	}

    const videoControlBtn = (
    	<span
        	onClick={handleCamera}
        	className="ag-btn videoControlBtn"
        	title="Enable/Disable Video"
        	style={{opacity: 1}}
    	>
        	<i className="material-icons focus:outline-none md-light" style={{ fontSize: "30px" }} id="video-icon">videocam_off</i>
      	</span>
  	)

    const audioControlBtn = (
    	<span
        	onClick={handleMic}
        	className="ag-btn audioControlBtn"
        	title="Enable/Disable Audio"
        	style={{opacity: 1}}
    	>
        	<i className="material-icons focus:outline-none md-light" style={{ fontSize: "30px" }} id="mic-icon">mic_off</i>
      	</span>
  	)

    const exitBtn = (
      	<span
        	onClick={handleExit}
        	className='ag-btn exitBtn'
        	title="Exit"
        	style={{opacity: 1}}
    	>
        	<i className="material-icons exit focus:outline-none md-light" style={{ fontSize: "30px" }} >logout</i>
      	</span>
    )

    const screenShareBtn = (
      	<span
        	onClick={handleScreenShare}
       		className='ag-btn exitBtn'
        	title="Enable/Disable Screen Share"
        	style={{opacity: 1}}
    	>
        	<i className="material-icons focus:outline-none md-light" id="screen-share" style={{ fontSize: "30px" }} >screen_share</i>
      	</span>
    )

    const style = {
    }

    return (
		<div>
			<div id="ag-canvas" style={style}>
		      {
		      	state.streamingScreenShare ?
		      		<div class="mini-video-screenshare-container" style={{height: '130px'}}>
		      			<StreamScreenShare/>
	      			</div>
	      			:
	      			''
		      }
	      	</div>
	  	 	<div className="ag-btn-group" style={{background: 'rgba(34, 36, 37, 0.8)'}}>
	          {exitBtn}
	          {videoControlBtn}
	          {audioControlBtn}
	          {screenShareBtn}
	        </div>
        </div>
	);
})

export default MiniVideoCallCanvas;



