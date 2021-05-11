import React, { useEffect, useState, useContext, useRef } from 'react'
import { merge } from 'lodash'
import AgoraRTC from 'agora-rtc-sdk'

import { useOvermind } from '../../overmind'
import { socket_live, events } from '../sockets'

import {AuthContext} from '../../context/AuthContext'

import ActiveWindowInfo from "../widgets/VideoCall/ActiveWindowInfo";
import StreamScreenShare from "../windows/screenshare/StreamScreenShare";

import useSound from 'use-sound';
import endCallSound from '../../assets/sounds/end_call.wav';

const { remote } = window.require('electron');
const os = window.require('os');

var localStream = {};
var streamState = {};
var needWindowUpdate = false;

const AgoraClient = AgoraRTC.createClient({ mode: 'interop', codec: "vp8" });

const VideoCallCanvas = React.memo((props) => {

	const { state, actions } = useOvermind();
	const { authData } = useContext(AuthContext);

  const isMac = os.platform() === "darwin";

	const [ streamList, setStreamList ] = useState([]);
  const streamListRef = useRef();
  streamListRef.current = streamList;

  const [usersInCallIds, setUsersInCallIds] = useState([]);
  const usersInCallIdsRef = useRef();
  usersInCallIdsRef.current = usersInCallIds;

  const [usersInCall, setUsersInCall] = useState({});
  const usersInCallRef = useRef();
  usersInCallRef.current = usersInCall;

  const [ numActiveVideo, setNumActiveVideo ] = useState(0);
  const [playEndCallSound] = useSound(endCallSound);

  if(needWindowUpdate){

    setNumActiveVideo(document.getElementsByClassName('ag-video-on').length);
    needWindowUpdate = false;  
  }

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

          streamListRef.current.forEach( (stream,index) => {
            if(stream.getId() === uid){
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

          streamListRef.current.forEach( (stream,index) => {
            if(stream.getId() === uid){
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

    streamListRef.current.forEach((item, index) => {

      if (item.getId() === uid) {

        item.close()
        
        let tempList = [...streamListRef.current]
        tempList.splice(index, 1)

        setStreamList(tempList)
      }
    })
	}

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

    if (action === 'mute') {
        
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

  const getHeight = () => {

    let videoElements = document.getElementsByClassName('ag-video-on').length
    let userDetailsElements = document.getElementsByClassName('user-details').length
    let screenShareElement = document.getElementById('ag-screen') ? 1 : 0;

    let height = 70 + (videoElements*123) + (userDetailsElements*60) + (screenShareElement * 123);

    return height;
  }

  const updateWindowSize = () => {

    if(state.videoCallCompactMode){

      window.require("electron").ipcRenderer.send('set-video-player-height', getHeight());
    }

    Dish();
  }

  useEffect(() => {

    if(state.userProfileData.id){

      AgoraClient.init(props.config.appId, async () => {
          
          subscribeStreamEvents();
          const agoraAccessToken = await actions.auth.getAgoraAccessToken({ requestParams: {channel: props.config.channel}});

          AgoraClient.join(agoraAccessToken, props.config.channel, props.config.user_id, (user_id) => {
      
            localStream = streamInit(user_id, props.config.videoProfile);

            localStream.init(() => {
              
              localStream.muteVideo();
              localStream.muteAudio();

              addStream(localStream, true);

              //const interval = setInterval(() => {

                socket_live.emit(events.joinRoom, { room: props.config.channel, user_id: props.config.user_id},
                  (data) => {
                    if(data.created){
                      actions.app.emitUpdateTeam();  
                    }
                });

              //}, 2000);

              AgoraClient.publish(localStream, err => {
                  alert("Publish local stream error: " + err);
              })
            },
            async (err) => {

              var hasMediaAccess = await window.require("electron").ipcRenderer.sendSync('check-media-access');
              
              if(!hasMediaAccess){
                
                alert("No Access to camera or microphone!");  
              
              } else {

                 alert("Unexpected Error!\n " + JSON.stringify(err));
              }

              actions.app.setError(err);
            })
          })
      }, function(err) {
          console.log("client init failed ", err);
          // Error handling
      })

      return () => {
        handleExit();
      }
    }
    
  },[state.userProfileData.id])

  useEffect(() => {

    // Load and Resize Event
    window.addEventListener("load", function (event) {
        Dish();
        window.onresize = Dish;
    }, false);

    window.require("electron").ipcRenderer.on('stop-screenshare', function (e, args) {

      if(!state.streamingScreenShare){
        socket_live.emit(events.endScreenShare, {
            channel_id: 'scr-' + localStorage.getItem('call_channel_id')
        });  
      }
      
      actions.app.setSharingScreen(false);
    });

    socket_live.on(events.userScreenShare, (data) => {

      data['user'] = usersInCallRef.current[data.user_id];
      actions.app.userScreenShare(data);
      updateWindowSize();
    });

    socket_live.on(events.userWindowShare, (data) => {

      data['owner'] = usersInCallRef.current[data.user_id];
      actions.app.userWindowShare(data);
    });

  },[])

  useEffect(() => {

      actions.user.getLoggedInUser({authData: authData});

  }, [actions.user, authData])

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

  }, [usersInCallIds, actions.user, authData])

  useEffect(() => {

    streamList.forEach( (stream, index) => {

     	let streamId = stream.getId()
     	let elementID = 'ag-item-' + streamId;

      if( !usersInCallIdsRef.current.includes(streamId) ){
        var tempUsersInCallIds = usersInCallIdsRef.current.concat([streamId]);
        setUsersInCallIds(tempUsersInCallIds); 
      }

      if(stream.isPlaying())
          stream.stop();

      if(streamState[streamId]){

        if(streamState[streamId]['video'] === false){
          stream.muteVideo();
          toggleVideoView(stream, 'mute')
        }
        streamState[streamId] = undefined;
      }

      stream.play(elementID);
    })

    updateWindowSize();

  }, [streamList, state.videoCallCompactMode])

  useEffect(() => {
    
    updateWindowSize();

  },[numActiveVideo, state.streamingScreenShare])

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

  	if (state.sharingScreen) {

    		window.require("electron").ipcRenderer.send('stop-screenshare');
        actions.app.setSharingScreen(false);

  	} else {
      
    		window.require("electron").ipcRenderer.send('init-screenshare');
        actions.app.setSharingScreen(true);
  	}
	}

  const handleMultiWindowShare = async (e) => {

    if (state.sharingWindow) {

        window.require("electron").ipcRenderer.send('stop-windowshare');
        actions.app.setSharingWindow(false);

    } else {
      
        window.require("electron").ipcRenderer.send('init-windowshare');
        actions.app.setSharingWindow(true);
    }
  }

  const handleCollapse = async (e) => {

    window.require("electron").ipcRenderer.send('collapse-video-call-window', getHeight());
    actions.app.setVideoCallCompactMode(true);
  }

  const handleExpand = () => {

    actions.app.setVideoCallCompactMode(false);
    window.require("electron").ipcRenderer.send('expand-video-call-window');

  }

	const handleExit = async (e) => {
    
    playEndCallSound();

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

      var call_channel_id = localStorage.getItem('call_channel_id');
      var rid = call_channel_id.split('-')[1];
      window.require("electron").ipcRenderer.send('exit-user-call', rid);

    	actions.app.clearVideoCallData();
      actions.app.emitUpdateTeam();

      var win = remote.getCurrentWindow();
      setTimeout( () => {win.destroy()}, 400);
    	
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
        { state.sharingScreen ? 'stop_screen_share' : 'screen_share' }
      </i>
  	</span>
  )

    const multiWindowShareBtn = (
     <span
      onClick={handleMultiWindowShare}
      className='ag-btn exitBtn'
      title="Multi Window Share"
      style={{opacity: 1}}
    >
      <i className="material-icons focus:outline-none md-light" id="compare" style={{ fontSize: "30px" }} >compare</i>
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
        <i className="material-icons focus:outline-none md-light" style={{ fontSize: "30px" }} >fullscreen_exit</i>
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
      if (Increment > Width) return false;
      else return Increment;
  }

  const Dish = () => {

    let Margin;
    let Scenary = document.getElementById('Dish');

    if(state.videoCallCompactMode || state.streamingScreenShare)
      Margin = 2;
    else
      Margin = 2;

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

      if(state.videoCallCompactMode || state.streamingScreenShare ){
        max = Width - 4;
      }

      setWidth(max, Margin);  
    }
  }

  function setWidth(width, margin) {

    let Scenary = document.getElementById('Dish');
    let Width = Scenary.offsetWidth;
    let Cameras = document.getElementsByClassName('Camera');
    let numPerRow = Math.ceil(Math.sqrt(Cameras.length));
    var videoWidth;

    for (var s = 0; s < Cameras.length; s++) {

      if(state.videoCallCompactMode || state.streamingScreenShare){
        Cameras[s].style.width = width + "px";
      } else {
        Cameras[s].style.width = (Width/numPerRow - 5) +'px';
      }

      Cameras[s].style.margin = "auto";
      Cameras[s].style.height = (width * 0.75) + "px";
    }
  }

  return (

	  <div id="ag-canvas" 
      style={{
        background: '#2F3136'
      }}
      className={state.videoCallCompactMode ? "" : "flex"}
    >
      {
        state.streamingScreenShare && 
        <div id="ScreenShare"
          className={state.videoCallCompactMode ? "pointer" : "flex"}
          style={{
            width: state.videoCallCompactMode ? "" : "calc(100vw - 200px)",
            height: state.videoCallCompactMode ? "117px" : "100%",
            marginLeft: state.videoCallCompactMode ? "" : "5px"
          }}
          onClick={() => {
              if(state.videoCallCompactMode)
                handleExpand()
          }}
        >
          <section style={{ 
              width: '100%', 
              position: 'relative',
              height: state.videoCallCompactMode ? '100%' : 'calc(100% - 50px)'
            }}>
              <StreamScreenShare/>
            </section>
        </div>
      }
      
      <div id="Video"
        className={!state.videoCallCompactMode && state.streamingScreenShare ? "flex-1" : ""}
        style={{
          position: state.streamingScreenShare ? 'relative' : '',
          width: !state.videoCallCompactMode && state.streamingScreenShare ? "185px" : "",
          height: !state.videoCallCompactMode && state.streamingScreenShare ? "100vh" : "",
          marginLeft: !state.videoCallCompactMode && state.streamingScreenShare ? "5px" : "",
          marginRight: !state.videoCallCompactMode && state.streamingScreenShare ? "10px" : ""
        }}
      >
        <div id="Dish">
          <div style={{ 
              height:     state.videoCallCompactMode ? '100%' : '',
              display:    state.videoCallCompactMode || state.streamingScreenShare ? '' : 'flex',
              maxHeight:  state.streamingScreenShare ? 'calc(100vh - 75px)' : '',
              top:        state.streamingScreenShare ? '10px' : '',
              position:   state.streamingScreenShare ? 'relative' : '',
              flexWrap:   'wrap',
              overflowY:  'scroll'
            }}
          >
            {
              //Array(6).fill(0).map((x, i) =>
              streamList.map(stream =>
                <section className="flex-1 center" 
                  style={{ 
                    width: '100%', 
                    position: 'relative', 
                    margin: '2px',
                    cursor: stream.isVideoOn() ? 'pointer' : ''
                  }} 
                  key={stream.getId()}
                >

                  <div 
                    style={{ 
                      display:  state.videoCallCompactMode || state.streamingScreenShare ? '' : 'inline-block',
                    }}
                    >
                    <div 
                      id={'ag-item-' + stream.getId()} 
                      className={stream.isVideoOn() ? 'ag-item Camera ag-video-on' : 'ag-item Camera'}
                      style={{ 
                        height: '120px',
                        display: stream.isVideoOn() ? 'block' : 'none'
                      }}
                      onClick={() => {
                          if(state.videoCallCompactMode)
                            handleExpand()
                      }}
                    >
                    </div>
                    
                    <div 
                      id={'ag-item-info-' + stream.getId()} 
                      className="ag-item-info"
                      style={{ 
                        display: stream.isVideoOn() ? 'flex' : 'none',
                        bottom: state.videoCallCompactMode || state.streamingScreenShare ? '5px' : '10px'
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
                        height:   '50px',
                        display:  stream.isVideoOn() ? 'none' : 'flex',
                        width:    state.videoCallCompactMode || state.streamingScreenShare ? '' : '180px',
                        margin:   '10px'
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
                      <div className="text-white px-1 font-bold pointer"
                        style={{display: 'table', height: '50px', marginLeft: '10px'}}
                        onClick={() => {
                            if(state.videoCallCompactMode)
                              handleExpand()
                        }}
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
                  </div>
                </section>
              )
              //)
            }
          </div>
        </div>
      </div>

      <div className={state.videoCallCompactMode ? "ag-btn-group-compact" : "ag-btn-group"} 
          style={{background: 'rgba(34, 36, 37, 0.8)', height: '45px', position: 'absolute', bottom: '0'}}
          >
          {exitBtn}
          {videoControlBtn}
          {audioControlBtn}
          {screenShareBtn}
          {multiWindowShareBtn}
          {collapseBtn}
      </div>
    </div>
	);
})

export default VideoCallCanvas;



