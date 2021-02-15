import React, { useEffect, useState, useContext, useLayoutEffect } from 'react'
import { merge } from 'lodash'
import AgoraRTC from 'agora-rtc-sdk'

import { useOvermind } from '../../overmind'
import { socket_live, events } from '../sockets'

import {AuthContext} from '../../context/AuthContext'

const { remote } = window.require('electron');

const StreamScreenShareCanvas = React.memo((props) => {

	const { state, actions } = useOvermind();

	const AgoraClient = AgoraRTC.createClient({ mode: props.transcode, codec: "vp8" });
	const screenShareResolution = JSON.parse(localStorage.getItem("screenshare_resolution"));

	const [ streamList, setStreamList ] = useState([]);

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
	    exitScreenShare();
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

  	useLayoutEffect(() => {
 		window.addEventListener("resize", Dish);
 	}, [])

    useEffect(() => {

    	actions.app.setLoggedInUser();
    	actions.app.setScreenSize();

        AgoraClient.init(props.appId, () => {

	      	subscribeStreamEvents();
	      	
	      	AgoraClient.join(props.appId, props.channel, props.uid, (uid) => {

	      		socket_live.emit(events.joinRoom, props.channel);
	        	viewingScreenShare();
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

	    Dish();

    }, [streamList])

  	function Area(Increment, Count, Width, Height, Margin = 10) {
      
      var resolution = JSON.parse(localStorage.getItem('screenshare_resolution'))
      var ratio = resolution.height/resolution.width;

      let w = 0;
      let i = 0;
      let h = Increment * ratio + (Margin * 2);
      while (i < (Count)) {
          if ((w + Increment) > Width) {
              w = 0;
              h = h + (Increment * ratio) + (Margin * 2);
          }
          w = w + Increment + (Margin * 2);
          i++;
      }
      if (h > Height) return false;
      else return Increment;
  	}

  	const Dish = () => {

	    let Margin = 20;
	    let Scenary = document.getElementById('Dish');

	    if(Scenary){
	      let Width = Scenary.offsetWidth - (Margin * 2);
	      let Height = Scenary.offsetHeight - (Margin * 2);
	      let Cameras = document.getElementsByClassName('Camera');
	      let max = 0;

	      let i = 1;
	      while (i < 2500) {
	          let w = Area(i, Cameras.length, Width, Height, Margin);
	          if (w === false) {
	              max =  i - 1;
	              break;
	          }
	          i++;
	      }

	      max = max - (Margin * 2);

	      setWidth(max, Margin);  
	    }
  	}

  	function setWidth(width, margin) {

      let Cameras = document.getElementsByClassName('Camera');
      var resolution = JSON.parse(localStorage.getItem('screenshare_resolution'))
      var ratio = resolution.height/resolution.width;

      for (var s = 0; s < Cameras.length; s++) {
          Cameras[s].style.width = width + "px";
          Cameras[s].style.margin = margin + "px";
          Cameras[s].style.height = (width * ratio) + "px";
      }
  	}

    return (
		<div id="ag-canvas" tabIndex="0" style={{background: '#2F3136'}} 
			onMouseMove={ shareCursorData }
			onDoubleClick={ shareCursorData }
			onKeyUp={ shareCursorData }
			onKeyDown={ shareCursorData }
			onMouseDown={ shareCursorData }
			onMouseUp={ shareCursorData }

		>
			<div id="Dish">
				<div style={{ display: 'flex' }}>
					<section style={{ width: 'auto', position: 'relative'}}>
						<div id="ag-screen" className="ag-item Camera">
		    			</div>
					</section>
	    		</div>
    		</div>
      	</div>
	);
})

export default StreamScreenShareCanvas;

