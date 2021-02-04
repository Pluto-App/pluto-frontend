import React, { useEffect, useState, useContext } from 'react'
import { merge } from 'lodash'
import AgoraRTC from 'agora-rtc-sdk'

import { useOvermind } from '../../overmind'
import { socket_live, events } from '../sockets'

import {AuthContext} from '../../context/AuthContext'

import { appLogo } from '../../utils/AppLogo';

const { remote } = window.require('electron');
var localStream = {};

const VideoCallCanvas = React.memo((props) => {

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

      AgoraClient.on("mute-video", function (evt) {
          
          let uid = evt.uid;
          console.log("Mute videos: " + uid);

          let elementID = 'ag-item-' + uid;
          let element = document.getElementById(elementID);
          element.style.display = 'none';
          element.classList.toggle('ag-video-on');
          updateWindowSize();
      })

      AgoraClient.on("unmute-video", function (evt) {
          
          let uid = evt.uid;
          console.log("Unmute video: " + uid);

          let elementID = 'ag-item-' + uid;
          let element = document.getElementById(elementID);
          element.style.display = 'block';
          element.classList.toggle('ag-video-on');
          updateWindowSize();
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

    let element = document.getElementById('ag-item-' + uid)
    if (element) {
      element.parentNode.removeChild(element)
    }

    streamList.map((item, index) => {

      if (item.getId() === uid) {

        item.close()
        
        let tempList = [...streamList]
        tempList.splice(index, 1)

        setStreamList(tempList)
      }
    })
	}

  useEffect(() => {

    AgoraClient.init(props.appId, () => {
      	
        subscribeStreamEvents();
      	
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

  	// Load and Resize Event
    window.addEventListener("load", function (event) {
        Dish();
        window.onresize = Dish;
    }, false);

  }, [])


  useEffect(() => {

      actions.user.getLoggedInUser({authData: authData})

  }, [actions, authData])

  useEffect(() => {

    var canvasSelector = 'Dish' 
    var canvas = document.getElementById(canvasSelector);

    streamList.map((stream, index) => {

     	let id = stream.getId()
     	let elementID = 'ag-item-' + id;

      if(stream.isPlaying())
          stream.stop();

        stream.play(elementID);
    })

    updateWindowSize();

  }, [streamList, state.videoCallCompactMode])

  const updateWindowSize = () => {

    if(state.videoCallCompactMode){
      
      let videoElements = document.getElementsByClassName('ag-video-on').length
      let userDetailsElements = document.getElementsByClassName('user-details').length

      let height = 70 + (videoElements*148) + (userDetailsElements*60);

      window.require("electron").ipcRenderer.send('set-video-player-height', height);

    }

    Dish();
  }

 	const handleCamera = (e) => {

    let elementID = 'ag-item-' + localStream.getId();
    let element = document.getElementById(elementID);
    element.classList.toggle('ag-video-on');

    let userDetailsID = 'user-details-' + localStream.getId();
    let userDetailsElement = document.getElementById(userDetailsID);
    userDetailsElement.classList.toggle('user-details');

		if (localStream.isVideoOn()) {
      	
      		localStream.disableVideo()
      		document.getElementById("video-icon").innerHTML = "videocam_off"

          if(element)
            element.style.display = 'none';
          
          if(userDetailsElement)
            userDetailsElement.style.display = 'flex';
		
		} else {

      		localStream.unmuteVideo()
      		document.getElementById("video-icon").innerHTML = "videocam"

          if(element)
            element.style.display = 'block';

          if(userDetailsElement)
            userDetailsElement.style.display = 'none';
    }

    updateWindowSize();
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

  const handleCollapse = async (e) => {
    
    let no = document.getElementsByClassName('ag-item').length
    let height = 75 + (no*120);

    window.require("electron").ipcRenderer.send('collapse-video-call-window', height);
    actions.app.setVideoCallCompactMode(true);
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

  const collapseBtn = (

    !state.videoCallCompactMode ?
       <span
        onClick={handleCollapse}
        className='ag-btn exitBtn'
        title="Collapse Video Call"
        style={{opacity: 1}}
      >
        <i className="material-icons focus:outline-none md-light" id="screen-share" style={{ fontSize: "30px" }} >fullscreen_exit</i>
      </span>

      : ''
  )

  function Area(Increment, Count, Width, Height, Margin = 10) {
      let w = 0;
      let i = 0;
      let h = Increment * 0.75 + (Margin * 2);
      while (i < (Count)) {
          if ((w + Increment) > Width) {
              w = 0;
              h = h + (Increment * 0.75) + (Margin * 2);
          }
          w = w + Increment + (Margin * 2);
          i++;
      }
      if (h > Height) return false;
      else return Increment;
  }

  function Dish() {

    let Margin = 2;
    let Scenary = document.getElementById('Dish');

    if(Scenary){
      let Width = Scenary.offsetWidth - (Margin * 2);
      let Height = Scenary.offsetHeight - (Margin * 2);
      let Cameras = document.getElementsByClassName('Camera');
      let max = 0;

      let i = 1;
      while (i < 5000) {
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
      for (var s = 0; s < Cameras.length; s++) {
          Cameras[s].style.width = width + "px";
          Cameras[s].style.margin = margin + "px";
          Cameras[s].style.height = (width * 0.75) + "px";
      }
  }

  const activeAppClick = (e, usersActiveWindow) => {
      e.preventDefault();
      
      if(usersActiveWindow && usersActiveWindow.url){
          window.require("electron").shell.openExternal(usersActiveWindow.url);
      }
  }

  const getAppLogo = (appData) => {

      try {
          if(appData.owner && appData.owner.name) {

              var logo = appLogo(
                  appData.owner.name.toLowerCase().replace(/ /g,'').replace('.exe',''),
                  appData.url
              ); 

              return logo;   
          } else {
              
              throw new Error('App Data Incorrect');
          }

      } catch (error) {

          if(process.env.REACT_APP_DEV_BUILD)
               console.log(error)

          return "https://ui-avatars.com/api/?background=black&name="   
      }
  }

  return (

	  <div id="ag-canvas" style={{background: '#2F3136'}}>
	    
      <div id="Dish">

        {
          streamList.map(stream =>
            <section style={{ width: 'auto'}}>
              <div 
                id={'ag-item-' + stream.getId()} 
                class={stream.isVideoOn() ? 'ag-item Camera ag-video-on' : 'ag-item Camera'}
                style={{ 
                  height: '120px',
                  display: stream.isVideoOn() ? 'block' : 'none'
                }}
              >
              </div>
              <div 
                id={'user-details-' + stream.getId()} 
                className={stream.isVideoOn() ? '' : 'user-details'}
                style={{ 
                  height: '40px',
                  display: stream.isVideoOn() ? 'none' : 'flex',
                  margin: '10px'
                }}
              >
               <div className="bg-white h-12 w-12 flex items-center justify-center text-black text-2xl font-semibold rounded-full mb-1 overflow-hidden">
                    <img src={state.userProfileData.avatar} alt="" />
                </div>
                <div className="text-white px-1 font-bold tracking-wide"
                  style={{display: 'table', height: '40px', marginLeft: '10px'}}
                >
                    <span style={{ display: 'table-cell', verticalAlign: 'middle', fontSize: '14px' }}>
                      {state.userProfileData.name ? state.userProfileData.name.split(' ')[0] : ''}
                      </span>
                </div>
                <div className="pointer items-center h-6 w-6 flex font-semibold overflow-hidden" 
                  style={{ display: 'table', marginLeft: '10px' }}
                >
                    <a 
                      style={{ display: 'table-cell', verticalAlign: 'middle', fontSize: '14px', height: '40px' }}
                      onClick={(e) => {
                        activeAppClick( e, state.usersActiveWindows[state.userProfileData.id] )
                      }}
                    >
                       { state.usersActiveWindows[state.userProfileData.id] ? 

                            <div>
                                <img 
                                    src = { getAppLogo(state.usersActiveWindows[state.userProfileData.id]) } 
                                    style = {{ borderRadius: '30%' }}
                                />
                            </div>
                            :
                            <div></div>
                        }
                    </a>
                </div>

              </div>
            </section>
          )
        }
        <div className={state.videoCallCompactMode ? "ag-btn-group-compact" : "ag-btn-group"} 
          style={{background: 'rgba(34, 36, 37, 0.8)', height: '45px'}}
          >
          {exitBtn}
          {videoControlBtn}
          {audioControlBtn}
          {screenShareBtn}
          {collapseBtn}
        </div>
      </div>
    </div>
	);
})

export default VideoCallCanvas;



