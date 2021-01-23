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
	const [ orgCursorPos, setOrgCursorPos ] = useState(undefined);
	const [ mouseState, setMouseState ] = useState('up');

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

  		if(e.type != 'wheel')
  			e.persist();

  		if(e.type != 'mousemove'){
			//console.log(e.type);
  		}

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

            var eventData = {
 				type: 		e.type,
 				key:  		e.key,
 				keyCode: 	e.keyCode,
 				which: 		e.which  		
 			}

 			if(e.type == 'wheel')
 				eventData['direction'] = e.deltaY > 0 ? 'up' : 'down';

 			if(e.type == 'mousedown'){

      			setOrgCursorPos({x: x, y: y});
      			setMouseState('down');

      		} else if(e.type == 'mouseup'){

      			setMouseState('up');
      			if(orgCursorPos['x'] == x && orgCursorPos['y'] == y)
      				eventData['type'] = 'click';

      		} else if (e.type == 'mousemove' && mouseState == 'down'){

      			eventData['start_x'] = orgCursorPos['x'];
      			eventData['start_y'] = orgCursorPos['y'];
      		}

        	socket_live.emit(events.screenShareCursor, {
		 		channel_id: 		props.channel,
		 		screenshare_owner: 	localStorage.getItem("screenshare_owner"),
		 		user:  	{
		 			id: 	state.loggedInUser.id,
		 			uid: 	state.loggedInUser.uid,
		 			name: 	state.loggedInUser.name
		 		},
	 			cursor: cursorData,
	 			event: 	eventData
		 	});	

        } catch (error) {
            // Do something here!
        }
  	}

  	const handleScroll = (e) => {

  		shareCursorData(e);
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

    	document.getElementById("root").addEventListener("wheel", handleScroll);

    	return () => {
      		document.getElementById("root").removeEventListener("wheel", handleScroll);
    	};

    }, [])

    useEffect(() => {

	    streamList.map((stream, index) => {	     
	     	stream.play('ag-screen');
	    })

    }, [streamList])


    return (
		<div id="ag-screenshare-canvas" tabindex="0" style={canvasStyle} 
			onMouseMove={ shareCursorData }
			onDblClick={ shareCursorData }
			onKeyUp={ shareCursorData }
			onKeyDown={ shareCursorData }
			onMouseDown={ shareCursorData }
			onMouseUp={ shareCursorData }

		>
    		<div id="ag-screen" className="ag-item">
    		</div>
      	</div>
	);
})

export default StreamScreenShareCanvas;
