import React, { useEffect, useState, useLayoutEffect } from 'react'
import AgoraRTC from 'agora-rtc-sdk'

import { useOvermind } from '../../overmind'
import { socket_live, events } from '../sockets'

const AgoraClient = AgoraRTC.createClient({ mode: 'interop', codec: "vp8" });

const StreamScreenShareCanvas = React.memo((props) => {

	const { state, actions } = useOvermind();
	
	const [screenShareResolution, setScreenShareResolution] = useState(JSON.parse(localStorage.getItem("screenshare_resolution")));

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
	    
	    if(state.screenShareUser.id != state.userProfileData.id)
	    	actions.app.setStreamingScreenShare(true);
  	}

  	const removeStream = (uid) => {
	    streamList.forEach((item, index) => {
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

	    if(streamList.length == 0)
	    	exitScreenShare();
  	}

  	const exitScreenShare = () => {

  		actions.app.setStreamingScreenShare(false);
  		//actions.app.clearScreenShareData();
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

  		if(e.type !== 'wheel')
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
 				type: 		e.type || e.nativeEvent.type,
 				key:  		e.key || e.nativeEvent.key,
 				keyCode: 	e.keyCode || e.nativeEvent.keyCode,
 				which: 		e.which || e.nativeEvent.which  		
 			}

 			if(e.type === 'wheel')
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

  	function Area(Increment, Count, Width, Height, Margin = 0) {
      
      var resolution = screenShareResolution;
      var ratio = screenShareResolution ? resolution.height/resolution.width : 1.33;

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
      if (Increment > Width) return false;
      else return Increment;
  	}

  	const Dish = () => {

	    let Margin = 0;
	    let Scenary = document.getElementById('ScreenShareDish');

	    if(Scenary){
	      let Width = Scenary.offsetWidth - (Margin * 2);
	      let Height = Scenary.offsetHeight - (Margin * 2);
	      let Cameras = document.getElementsByClassName('ScreenShareCamera');
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

      let Cameras = document.getElementsByClassName('ScreenShareCamera');
      var resolution = screenShareResolution;
      var ratio = screenShareResolution ? resolution.height/resolution.width : 1.33;

      for (var s = 0; s < Cameras.length; s++) {
          Cameras[s].style.width = width + "px";
          Cameras[s].style.margin = 'auto';
          Cameras[s].style.height = (width * ratio) + "px";
      }
  	}

    useEffect(() => {

    	actions.app.setLoggedInUser();
    	actions.app.setScreenSize();

        AgoraClient.init(props.appId, async () => {

	      	subscribeStreamEvents();
	      	const agoraAccessToken = await actions.auth.getAgoraAccessToken({ requestParams: {channel: props.channel}});

	      	AgoraClient.join(agoraAccessToken, props.channel, props.uid, (uid) => {

	      		socket_live.emit(events.joinRoom, props.channel);
	        	viewingScreenShare();
	      	})
    	})

    	document.getElementById("root").addEventListener("wheel", handleScroll);

    	socket_live.on(events.screenShareSourceResize, (data) => {
            setScreenShareResolution(data.resolution);
        });

    	return () => {
      		document.getElementById("root").removeEventListener("wheel", handleScroll);
    	};

    }, [])

    useEffect(() => {

	    streamList.forEach((stream, index) => {	     
	     	stream.play('ag-screen');
	    })

	    Dish();

    }, [streamList])

    useEffect(() => {

	    Dish();
	    window.addEventListener("resize", Dish);

	    return () => window.removeEventListener("resize", Dish);

    }, [screenShareResolution])

    return (
		<div id="ScreenShareDish" >
			<div style={{ display: 'flex', width: '100%' }}>
				<section style={{ 
					width: '100%', 
					position: 'relative',
					border: '1px #636161 solid'
				}}>
					<div id="ag-screen" className="ScreenShareCamera" tabIndex="0"
						onMouseMove={ shareCursorData }
						onDoubleClick={ shareCursorData }
						onKeyUp={ shareCursorData }
						onKeyDown={ shareCursorData }
						onMouseDown={ shareCursorData }
						onMouseUp={ shareCursorData }
					>
	    			</div>
                  
                  	<div 
                    	id='ag-item-info' 
                    	className="ag-item-info"
	                    style={{ 
	                      display: 'flex',
	                      bottom: '5px',
	                      right: '5px'
	                    }}
                  	>
	                    <div style={{ display: "table", height: '30px'}}>
	                      <span className="text-gray-200 px-1" style={{ display: 'table-cell', verticalAlign: 'middle'}}>
	                        {
	                          state.screenShareUser && state.screenShareUser.name ?
	                          state.screenShareUser.name.split(' ')[0] + "'s Screen"
	                          : ''
	                        }
	                      </span>
	                    </div>
                  </div>
				</section>
    		</div>
		</div>
	);
})

export default StreamScreenShareCanvas;

