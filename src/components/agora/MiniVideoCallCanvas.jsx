import React, { useEffect, useState, useContext } from 'react'
import { merge } from 'lodash'
import AgoraRTC from 'agora-rtc-sdk'

import { useOvermind } from '../../overmind'
import { socket_live, events } from '../sockets'

import {AuthContext} from '../../context/AuthContext'

const { remote } = window.require('electron');
var localStream = {};

const MiniVideoCallCanvas = React.memo((props) => {

	const tile_canvas = {
	  '1': ['1 / 1 / 4 / 2'],
	  '2': ['1 / 1 / 4 / 2', '4 / 1 / 7 / 2'],
	  '3': ['1 / 1 / 4 / 2', '4 / 1 / 7 / 2', '7 / 1 / 10 / 2'],
	  '4': ['1 / 1 / 4 / 2', '4 / 1 / 7 / 2', '7 / 1 / 10 / 2', '10 / 1 / 13 / 2'],
	  // '5': ['span 3/span 4/13/9', 'span 3/span 4/13/13', 'span 3/span 4/13/17', 'span 3/span 4/13/21', 'span 9/span 16/10/21'],
	  // '6': ['span 3/span 4/13/7', 'span 3/span 4/13/11', 'span 3/span 4/13/15', 'span 3/span 4/13/19', 'span 3/span 4/13/23', 'span 9/span 16/10/21'],
	  // '7': ['span 3/span 4/10/1', 'span 3/span 4/13/1', 'span 3/span 4/16/1', 'span 3/span 4/19/1', 'span 3/span 4/13/21', 'span 3/span 4/13/25', 'span 9/span 16/10/21'],
	}

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

	    streamList.map((stream, index) => {	     
	     	let id = stream.getId()
     		let dom = document.querySelector('#ag-item-' + id)
	      	
	      	if (!dom) {
	        	dom = document.createElement('section')
	        	dom.setAttribute('id', 'ag-item-' + id)
	        	dom.setAttribute('class', 'ag-item')
	        	canvas.appendChild(dom)
	        	stream.play('ag-item-' + id)
	     	}
	      	
	      	dom.setAttribute('style', 'height: 120px')
	      	stream.player.resize && stream.player.resize()
	    })

	    window.require("electron").ipcRenderer.send('set-video-player-height', (120 * no) + 30);

    }, [streamList])


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
        	title="Enable/Disable Video">
        	<i className="material-icons focus:outline-none md-light" style={{ fontSize: "30px" }} id="video-icon">videocam_off</i>
      	</span>
  	)

    const audioControlBtn = (
    	<span
        	onClick={handleMic}
        	className="ag-btn audioControlBtn"
        	title="Enable/Disable Audio">
        	<i className="material-icons focus:outline-none md-light" style={{ fontSize: "30px" }} id="mic-icon">mic_off</i>
      	</span>
  	)

    const exitBtn = (
      	<span
        	onClick={handleExit}
        	className='ag-btn exitBtn'
        	title="Exit">
        	<i className="material-icons exit focus:outline-none md-light" style={{ fontSize: "30px" }} >logout</i>
      	</span>
    )

    const screenShareBtn = (
      	<span
        	onClick={handleScreenShare}
       		className='ag-btn exitBtn'
        	title="Enable/Disable Screen Share">
        	<i className="material-icons focus:outline-none md-light" id="screen-share" style={{ fontSize: "30px" }} >screen_share</i>
      	</span>
    )

    const style = {
    }

    return (
		<div id="ag-canvas" style={style}>
	        <div className="ag-btn-group">
	          {exitBtn}
	          {videoControlBtn}
	          {audioControlBtn}
	          {screenShareBtn}
	        </div>
	      </div>
	);
})

export default MiniVideoCallCanvas;



