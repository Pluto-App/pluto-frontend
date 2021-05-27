import React, { useEffect, useState, useLayoutEffect } from 'react'
import AgoraRTC from 'agora-rtc-sdk'

import { useOvermind } from '../../overmind'
import { socket_live, events } from '../sockets'

const { remote } = window.require('electron');
const StreamWindowShareCanvas = React.memo((props) => {

	const { state, actions } = useOvermind();

	const AgoraClient = AgoraRTC.createClient({ mode: props.config.transcode, codec: "vp8" });
	var currentWindow = remote.getCurrentWindow();
	const windowshare_resolutions = JSON.parse(localStorage.getItem('windowshare_resolutions'))
	const [windowShareResolution, setWindowShareResolution] = useState(windowshare_resolutions[currentWindow.data.user_uid]);

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
	    
	    if(props.config.owner.id != state.userProfileData.id)
	    	actions.app.setStreamingWindowShare(true);
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
	    	exitWindowShare();
  	}

  	const exitWindowShare = () => {

  		actions.app.setStreamingWindowShare(false);
  		currentWindow.destroy();
  		//actions.app.clearWindowShareData();
  	}

  	const viewingWindowShare = async () => {

  		socket_live.emit(events.viewWindowShare, {
	 		channel_id: props.config.channel,
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
            	x: xPercentage * windowShareResolution.width,
            	y: yPercentage * windowShareResolution.height
            }

            var eventData = {
 				type: 		e.type ||(e.nativeEvent ? e.nativeEvent.type : undefined),
 				key:  		e.key || (e.nativeEvent ? e.nativeEvent.key : undefined),
 				keyCode: 	e.keyCode || (e.nativeEvent ? e.nativeEvent.keyCode : undefined),
 				which: 		e.which || (e.nativeEvent ? e.nativeEvent.which : undefined),
 				deltaX: 	e.deltaX,
 				deltaY: 	e.deltaY,
 				altKey: 	e.altKey,
 				ctrlKey: 	e.ctrlKey,
 				metaKey: 	e.metaKey,
 				shiftKey: 	e.shiftKey

 			}

 			var data = {
		 		channel_id: 		props.config.channel,
		 		windowshare_owner: 	props.config.channel.split('-')[1],
		 		user:  	{
		 			id: 	state.loggedInUser.id,
		 			uid: 	state.loggedInUser.uid,
		 			name: 	state.loggedInUser.name
		 		},
	 			cursor: cursorData,
	 			event: 	eventData
		 	};

        	socket_live.emit(events.windowShareCursor, data);

        } catch (error) {
        	console.log(error);
            // Do something here!
        }
  	}

  	const handleScroll = (e) => {

  		shareCursorData(e);
  	}

  	function Area(Increment, Count, Width, Height, Margin = 0) {
      
      var resolution = windowShareResolution;
      var ratio = windowShareResolution ? resolution.height/resolution.width : 1.33;

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
      var resolution = windowShareResolution;
      var ratio = windowShareResolution ? resolution.height/resolution.width : 1.33;

      for (var s = 0; s < Cameras.length; s++) {
          Cameras[s].style.width = width + "px";
          Cameras[s].style.margin = 'auto';
          Cameras[s].style.height = (width * ratio) + "px";
      }
  	}

  	useLayoutEffect(() => {
 		window.addEventListener("resize", Dish());
 	},[])

    useEffect(() => {

    	actions.app.setLoggedInUser();
    	actions.app.setScreenSize();

        AgoraClient.init(props.config.appId, async () => {

	      	subscribeStreamEvents();
	      	const agoraAccessToken = await actions.auth.getAgoraAccessToken({ requestParams: {channel: props.config.channel}});

	      	AgoraClient.join(agoraAccessToken, props.config.channel, props.config.user_uid+'tmp', (uid) => {

	      		socket_live.emit(events.joinRoom, props.config.channel);
	        	viewingWindowShare();
	      	})
    	})

    	document.getElementById("root").addEventListener("wheel", handleScroll);

    	socket_live.on(events.windowShareSourceResize, (data) => {
            setWindowShareResolution(data.resolution);
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

    }, [windowShareResolution])

    const controlsTopBarStyle = {
	    'height': '25px',
	    'backgroundColor': 'transparent',
	    'WebkitUserSelect': 'none',
	    'WebkitAppRegion': 'drag',
    	'width': '100%',
    	'position': 'fixed',
    	'top': 0,
    	'zIndex': 100
  	}

  	const streamContainerStyle = { 
  		// display: 'flex', width: '100%', position: 'fixed', top: 0,
  		// 'border': '5px solid ' + '#' + Math.floor(Math.random()*16770000).toString(16)
  	}

    return (
		<div id="ScreenShareDish">
			<div id="controls-topbar" style={controlsTopBarStyle}>
	      	</div>
			<div style={streamContainerStyle}>
				<section style={{ 
					width: '100%', 
					position: 'relative'
				}}>
					<div id="ag-screen" className="ScreenShareCamera" tabIndex="0"
						onMouseMove={ shareCursorData }
						onDoubleClick={ shareCursorData }
						onKeyUp={ shareCursorData }
						onKeyDown={ shareCursorData }
						onMouseDown={ shareCursorData }
						onMouseUp={ shareCursorData }
						style={{border: '5px solid ' + '#' + Math.floor(Math.random()*16770000).toString(16)}}
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
	                          props.config.owner.name ? props.config.owner.name.split(' ')[0] + "'s Screen"
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

export default StreamWindowShareCanvas;
