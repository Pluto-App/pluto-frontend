import React, { useEffect, useState, useContext } from 'react'
import { merge } from 'lodash'
import AgoraRTC from 'agora-rtc-sdk'

import { useOvermind } from '../../overmind'
import { socket_live, events } from '../sockets'

import {AuthContext} from '../../context/AuthContext'

const { remote } = window.require('electron');

const StreamScreenShareCanvas = React.memo((props) => {

	const { state, actions } = useOvermind();
	const { authData, setAuthData } = useContext(AuthContext);

	const AgoraClient = AgoraRTC.createClient({ mode: props.transcode, codec: "vp8" });
	const screenShareResolution = JSON.parse(localStorage.getItem("screenshare_resolution"));

	const [ screenShareState, setScreenShareState ] = useState({ ready: false});
	const [ streamList, setStreamList ] = useState([]);
	const [ userData, setUserData ] = useState({});

	// Hack to maintain aspect ratio
	const [ canvasStyle, setCanvasStyle ] = useState({});

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

  	const viewingScreenShare = async () => {

  		socket_live.emit(events.viewScreenShare, {
	 		channel_id: props.channel,
	 		user:  		{
	 			id: 	state.loggedInUser.id,
	 			uid: 	state.loggedInUser.uid,
	 			name: 	state.loggedInUser.name,
	 			color:  '#' + Math.floor(Math.random()*16770000).toString(16)
	 		}
	 	});
  	}

  	const shareCursorData = async (e) => {
  		e.persist();

  		try {

            var rect = e.target.getBoundingClientRect();
      		var x = e.clientX - rect.left; //x position within the element.
      		var y = e.clientY - rect.top;  //y position within the element.

      		var xPercentage = x/rect.width;
      		var yPercentage = y/rect.height;

            var cursorData = {
            	x: xPercentage * screenShareResolution.width,
            	y: yPercentage * screenShareResolution.height
            }

            if(cursorData['x'] > 0 && cursorData['y'] > 0){
            	socket_live.emit(events.screenShareCursor, {
			 		channel_id: props.channel,
			 		user:  		{
			 			id: 	state.loggedInUser.id,
			 			uid: 	state.loggedInUser.uid,
			 			name: 	state.loggedInUser.name
			 		},
		 			cursor: 	cursorData
			 	});	
            }
            
		 	//console.log(cursorData);

        } catch (error) {
            // Do something here!
        }
  	}

    useEffect(() => {

    	actions.app.setLoggedInUser();
    	actions.app.setScreenSize();

        AgoraClient.init(props.appId, () => {

	      	subscribeStreamEvents();
	      	
	      	AgoraClient.join(props.appId, props.channel, props.uid, (uid) => {

	      		socket_live.emit(events.joinRoom, props.channel);
	        	viewingScreenShare();
	        	
	        	// Hack to maintain aspect ratio
	        	setCanvasStyle({position: 'absolute'});
	      	})
    	})

    }, [])

    useEffect(() => {

	    streamList.map((stream, index) => {	     
	     	stream.play('ag-screen');
	    })

    }, [streamList])

    return (
		<div id="ag-screenshare-canvas" style={canvasStyle} onMouseMove={ shareCursorData }>
    		<div id="ag-screen" className="ag-item">
    		</div>
      	</div>
	);
})

export default StreamScreenShareCanvas;
