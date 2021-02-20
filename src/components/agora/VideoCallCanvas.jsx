import React, { useEffect, useState, useContext, useRef } from 'react'
import { merge } from 'lodash'
import AgoraRTC from 'agora-rtc-sdk'

import { useOvermind } from '../../overmind'
import { socket_live, events } from '../sockets'

import {AuthContext} from '../../context/AuthContext'

import ActiveWindowInfo from "../widgets/VideoCall/ActiveWindowInfo";


const { remote } = window.require('electron');
const os = window.require('os');

var localStream = {};
var streamState = {};
var needWindowUpdate = false;

const AgoraClient = AgoraRTC.createClient({ mode: 'interop', codec: "vp8" });

const VideoCallCanvas = React.memo((props) => {

	const { state, actions } = useOvermind();
	const { authData, setAuthData } = useContext(AuthContext);

  const isWindows = os.platform() === 'win32';
  const isMac = os.platform() === "darwin";

  const [activeAppInfo, setActiveAppInfo] = useState({});

	const [ streamList, setStreamList ] = useState([]);
  const streamListRef = useRef();
  streamListRef.current = streamList;

  const [usersInCallIds, setUsersInCallIds] = useState([]);
  const usersInCallIdsRef = useRef();
  usersInCallIdsRef.current = usersInCallIds;

  const [usersInCall, setUsersInCall] = useState({});
  const usersInCallRef = useRef();
  usersInCallRef.current = usersInCall;

	const [ userData, setUserData ] = useState({});
  const [ numActiveVideo, setNumActiveVideo ] = useState(0);

  if(needWindowUpdate){

    setNumActiveVideo(document.getElementsByClassName('ag-video-on').length);
    needWindowUpdate = false;  
  }

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

	      	AgoraClient.subscribe(stream, function (err) {
	        	console.log("Subscribe stream failed", err)
	      	})
	    })

	    AgoraClient.on('user-published', function (evt) {

	      	let stream = evt.stream
	      	console.log("New stream added: " + stream.getId())

	      	AgoraClient.subscribe(stream, function (err) {
	        	console.log("Subscribe stream failed", err)
	      	})
	    })

	    AgoraClient.on('peer-leave', function (evt) {

	      	console.log("Peer has left: " + evt.uid)
	      	removeStream(evt.uid)
	    })

	    AgoraClient.on('stream-subscribed', function (evt) {

      	let stream = evt.stream
      	console.log("New stream subscribed: " + stream.getId());

     	  addStream(stream)
	    })

	    AgoraClient.on("stream-removed", function (evt) {
	      	
	      	let stream = evt.stream
	      	console.log("Stream removed: " + stream.getId())
	      
	      	removeStream(stream.getId())
	    })

      AgoraClient.on("mute-video", function (evt) {
          
          let uid = evt.uid;
          console.log("Mute videos: " + uid);
          var found = false;

          streamListRef.current.map( (stream,index) => {
            if(stream.getId() == uid){
              toggleVideoView(stream, 'mute');
              found = true;
            }
          })

          if(!found){
            if(!streamState[uid])
              streamState[uid] = {};

            streamState[uid]['video'] = false;
          }

          needWindowUpdate = true;
      })

      AgoraClient.on("unmute-video", function (evt) {
          
          let uid = evt.uid;
          console.log("Unmute video: " + uid);
          var found = false;

          streamListRef.current.map( (stream,index) => {
            if(stream.getId() == uid){
              toggleVideoView(stream, 'unmute');
              found = true;
            }
          })

          if(!found){
            if(!streamState[uid])
              streamState[uid] = {};

            streamState[uid]['video'] = true;
          }

          needWindowUpdate = true;
      })
	}

	const addStream = (stream, push = false) => {

    let repeatition = streamListRef.current.some(item => {
      return item.getId() === stream.getId()
    })
    if (repeatition) {
      return
    }

    var tempStreamList;
    if (push) {
      tempStreamList = streamListRef.current.concat([stream]);
    } else {
    	tempStreamList = [stream].concat(streamListRef.current);
    }

    setStreamList(tempStreamList)
	}

	const removeStream = (uid) => {

    let element = document.getElementById('ag-item-' + uid)
    if (element) {
      element.parentNode.removeChild(element)
    }

    streamListRef.current.map((item, index) => {

      if (item.getId() === uid) {

        item.close()
        
        let tempList = [...streamListRef.current]
        tempList.splice(index, 1)

        setStreamList(tempList)
      }
    })
	}

  useEffect(() => {

    if(isMac){
      window.require('electron').ipcRenderer.send('media-access');      
    }

    AgoraClient.init(props.appId, () => {
      	
        subscribeStreamEvents();
      	
        AgoraClient.join(props.appId, props.channel, props.uid, (uid) => {

      		socket_live.emit(events.joinRoom, { room: props.channel, user_id: props.uid},
            (data) => {
              actions.app.emitUpdateTeam();
            });
      		localStream = streamInit(uid, props.videoProfile);

      		localStream.init(() => {
            
            localStream.muteVideo();
            localStream.muteAudio();

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

    window.require("electron").ipcRenderer.on('stop-screenshare', function (e, args) {
      socket_live.emit(events.endScreenShare, {
            channel_id: 'scr-' + localStorage.getItem('call_channel_id')
        });
      setSharingScreen(false);
    });

    return () => {
      handleExit();
    }

  }, [])


  useEffect(() => {

      actions.user.getLoggedInUser({authData: authData, skipFetchTeam: true, joinRooms: true});

      
  }, [actions, authData])

  useEffect(() => {

    const getUserData = async () => {

      if(usersInCallIds){
        for (var userId of usersInCallIds){
          if(!usersInCallRef.current[userId]){
            setUsersInCall({...usersInCallRef.current, [userId]: await actions.user.getUser({authData: authData, user_id: userId})})
          }
        }  
      }
    }

    getUserData();

  }, [usersInCallIds])

  useEffect(() => {

    var canvasSelector = 'Dish' 
    var canvas = document.getElementById(canvasSelector);

    streamList.map( (stream, index) => {

     	let streamId = stream.getId()
     	let elementID = 'ag-item-' + streamId;

      if( !usersInCallIdsRef.current.includes(streamId) ){
        var tempUsersInCallIds = usersInCallIdsRef.current.concat([streamId]);
        setUsersInCallIds(tempUsersInCallIds); 
      }

      if(stream.isPlaying())
          stream.stop();

      if(streamState[streamId]){

        if(streamState[streamId]['video'] == false){
          stream.muteVideo();
          toggleVideoView(stream, 'mute')
        }

        let element = document.getElementById(elementID);
        streamState[streamId] = undefined;
      }

      stream.play(elementID);
    })

    updateWindowSize();

  }, [streamList, state.videoCallCompactMode])

  useEffect(() => {
    
    updateWindowSize();

  },[numActiveVideo])

  const toggleVideoView = (stream, action) => {

    var uid = stream.getId();

    let elementID = 'ag-item-' + uid;
    let element = document.getElementById(elementID);
    element.classList.toggle('ag-video-on');

    let elementInfoId = 'ag-item-info-' + uid;
    let elementInfo = document.getElementById(elementInfoId);

    let userDetailsID = 'user-details-' + uid;
    let userDetailsElement = document.getElementById(userDetailsID);
    userDetailsElement.classList.toggle('user-details');

    if (action == 'mute') {
        
          stream.muteVideo()

          if(element)
            element.style.display = 'none';

          if(elementInfo)
            elementInfo.style.display = 'none';
          
          if(userDetailsElement)
            userDetailsElement.style.display = 'flex';
    
    } else {

          stream.unmuteVideo()

          if(element)
            element.style.display = 'block';

          if(elementInfo)
            elementInfo.style.display = 'flex';

          if(userDetailsElement)
            userDetailsElement.style.display = 'none';
    }

    updateWindowSize();
  }

  const updateWindowSize = () => {

    if(state.videoCallCompactMode){
      
      let videoElements = document.getElementsByClassName('ag-video-on').length
      let userDetailsElements = document.getElementsByClassName('user-details').length

      let height = 70 + (videoElements*123) + (userDetailsElements*60);

      window.require("electron").ipcRenderer.send('set-video-player-height', height);
    }

    Dish();
  }

 	const handleCamera = (e) => {

    let elementID = 'ag-item-' + localStream.getId();
    let element = document.getElementById(elementID);
    element.classList.toggle('ag-video-on');

    let elementInfoId = 'ag-item-info-' + localStream.getId();
    let elementInfo = document.getElementById(elementInfoId);

    let userDetailsID = 'user-details-' + localStream.getId();
    let userDetailsElement = document.getElementById(userDetailsID);
    userDetailsElement.classList.toggle('user-details');

		if (localStream.isVideoOn()) {
      	
      		localStream.muteVideo()
      		document.getElementById("video-icon").innerHTML = "videocam_off"

          if(element)
            element.style.display = 'none';

          if(elementInfo)
            elementInfo.style.display = 'none';
          
          if(userDetailsElement)
            userDetailsElement.style.display = 'flex';
		
		} else {

      		localStream.unmuteVideo()
      		document.getElementById("video-icon").innerHTML = "videocam"

          if(element)
            element.style.display = 'block';

          if(elementInfo)
            elementInfo.style.display = 'flex';

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

	const handleExit = async (e) => {
    
    if (e && e.currentTarget.classList.contains('disabled')) {
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
      actions.app.emitUpdateTeam();
    	var win = remote.getCurrentWindow();
    	win.destroy();
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
    	<i className="material-icons focus:outline-none md-light" id="screen-share" style={{ fontSize: "30px" }} >
        { sharingScreen ? 'stop_screen_share' : 'screen_share' }
      </i>
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

  const Dish = () => {

    let Margin;
    let Scenary = document.getElementById('Dish');

    if(state.videoCallCompactMode)
      Margin = 2;
    else
      Margin = 20;

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

      if(state.videoCallCompactMode){
        max = Width - 4;
      }

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

  return (

	  <div id="ag-canvas" style={{background: '#2F3136'}}>
	    
      <div id="Dish">
        <div style={{ 
            height: state.videoCallCompactMode ? '100%' : '',
            display: state.videoCallCompactMode ? '' : 'flex'
          }}
        >
          {
            streamList.map(stream =>
              <section style={{ width: 'auto', position: 'relative'}} key={stream.getId()}>

                <div 
                  id={'ag-item-' + stream.getId()} 
                  className={stream.isVideoOn() ? 'ag-item Camera ag-video-on' : 'ag-item Camera'}
                  style={{ 
                    height: '120px',
                    display: stream.isVideoOn() ? 'block' : 'none'
                  }}
                >
                </div>
                
                <div 
                  id={'ag-item-info-' + stream.getId()} 
                  className="ag-item-info"
                  style={{ 
                    display: stream.isVideoOn() ? 'flex' : 'none',
                    bottom: state.videoCallCompactMode ? '5px' : '30px',
                    right: state.videoCallCompactMode ? '5px' : '30px'
                  }}
                >
                  <div style={{ display: "table", height: '30px'}}>
                    <span className="text-gray-200 px-1" style={{ display: 'table-cell', verticalAlign: 'middle'}}>
                      {
                        usersInCall[stream.getId()] ?
                        usersInCall[stream.getId()].name.split(' ')[0]
                        : ''
                      }
                    </span>
                  </div>
                  <div className="pointer items-center flex overflow-hidden" 
                    style={{ display: 'table'}}
                  >
                    {
                      usersInCall[stream.getId()] && usersInCall[stream.getId()].id &&
                      <ActiveWindowInfo user={usersInCall[stream.getId()]} user_id={usersInCall[stream.getId()].id} videoOn={true}/>
                    }
                  </div>
                </div>

                <div 
                  id={'user-details-' + stream.getId()} 
                  className={stream.isVideoOn() ? '' : 'user-details'}
                  style={{ 
                    height: '50px',
                    display: stream.isVideoOn() ? 'none' : 'flex',
                    margin: '10px'
                  }}
                >
                  <div style={{display: 'table'}}>
                    <div className="rounded-full"
                      style={{display: 'table-cell', verticalAlign: 'middle', height: '50px'}}
                    >
                      <img 
                        style={{height: '30px'}}
                        src={
                          usersInCall[stream.getId()] ?
                          usersInCall[stream.getId()].avatar
                          : ''
                        } 
                      alt="" />
                    </div>
                  </div>
                  <div className="text-white px-1 font-bold "
                    style={{display: 'table', height: '50px', marginLeft: '10px'}}
                  >
                      <span style={{ display: 'table-cell', verticalAlign: 'middle', fontSize: '14px' }}>
                        {
                          usersInCall[stream.getId()] ?
                          usersInCall[stream.getId()].name.split(' ')[0]
                          : ''
                        }
                      </span>
                  </div>
                  {
                    usersInCall[stream.getId()] && usersInCall[stream.getId()].id &&
                    <ActiveWindowInfo user={usersInCall[stream.getId()]} user_id={usersInCall[stream.getId()].id}/>
                  }
                  
                </div>

              </section>
            )
          }
        </div>
        <div className={state.videoCallCompactMode ? "ag-btn-group-compact" : "ag-btn-group"} 
          style={{background: 'rgba(34, 36, 37, 0.8)', height: '45px', position: 'absolute', bottom: '0'}}
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



