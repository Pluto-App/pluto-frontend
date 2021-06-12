import React, { useEffect, useState, useContext, useRef } from 'react';
import { merge } from 'lodash';
import AgoraRTC from 'agora-rtc-sdk';
import AgoraRTM from 'agora-rtm-sdk';

import { useOvermind } from '../../overmind';
import { socket_live, events } from '../sockets';

import { AuthContext } from '../../context/AuthContext';

import StreamSection from '../widgets/VideoCall/StreamSection';
import ActiveWindowInfo from '../widgets/VideoCall/ActiveWindowInfo';
import StreamScreenShare from '../windows/screenshare/StreamScreenShare';

import useSound from 'use-sound';
import endCallSound from '../../assets/sounds/end_call.wav';

import useAgoraRTM from '../../hooks/useAgoraRTM';
import useAgoraRTC from '../../hooks/useAgoraRTC';

const { remote, ipcRenderer } = window.require('electron');

var localStream = {};
var streamState = {};
var needWindowUpdate = false;

const VideoCallCanvas = React.memo((props) => {
  const { state, actions } = useOvermind();
  const { authData } = useContext(AuthContext);

  const [usersInCallIds, setUsersInCallIds] = useState([]);
  const usersInCallIdsRef = useRef();
  usersInCallIdsRef.current = usersInCallIds;

  const [usersInCall, setUsersInCall] = useState({});
  const usersInCallRef = useRef();
  usersInCallRef.current = usersInCall;

  const [numActiveVideo, setNumActiveVideo] = useState(0);
  const [playEndCallSound] = useSound(endCallSound);

  const { rtmLoggedIn, joinRTMChannel, sendChannelMessage, sendChannelMediaMessage, newMessage } = useAgoraRTM(props.config);
  const {initAgoraRTC, streamList, localStream, toggleVideoView } = useAgoraRTC(props.config);

  if (needWindowUpdate) {
    setNumActiveVideo(document.getElementsByClassName('ag-video-on').length);
    needWindowUpdate = false;
  }

  const getHeight = () => {
    let videoElements = document.getElementsByClassName('ag-video-on').length;
    let userDetailsElements =
      document.getElementsByClassName('user-details').length;
    let screenShareElement = document.getElementById('ag-screen') ? 1 : 0;

    let height =
      70 +
      videoElements * 123 +
      userDetailsElements * 60 +
      screenShareElement * 123;

    return height;
  };

  const updateWindowSize = () => {
    if (state.videoCallCompactMode) {
      ipcRenderer.send('set-video-player-height', getHeight());
    }

    Dish();
  };

  useEffect(() => {
    if(!state.userProfileData.id) return;

    initAgoraRTC(props.config);

    return () => {
      handleExit();
    };
  }, [state.userProfileData.id]);

  useEffect(() => {
    
    if(newMessage)
      console.log(newMessage);

  }, [newMessage])

  useEffect(() => {
    
    if(rtmLoggedIn)
      joinRTMChannel(props.config.channel);

  }, [rtmLoggedIn])

  // useEffect(() => {

  //   const interval = setInterval(() => {
  //     sendChannelMessage( "What's up bro?! The time is: " + new Date().toLocaleTimeString() );

  //   }, 3000);

  //   return () => {
  //     clearInterval(interval);
  //   }

  // }, [sendChannelMessage])

  useEffect(() => {
    // Load and Resize Event
    window.addEventListener(
      'load',
      function (event) {
        Dish();
        window.onresize = Dish;
      },
      false
    );

    ipcRenderer.on('stop-screenshare', function (e, args) {
      if (!state.streamingScreenShare) {
        socket_live.emit(events.endScreenShare, {
          channel_id: 'scr-' + props.config.channel,
        });
      }

      actions.app.setSharingScreen(false);
    });

    ipcRenderer.on('stop-windowshare', function (e, args) {
      socket_live.emit(events.endWindowShare, {
        channel_id: localStorage.getItem('windowshare_channel_id'),
      });

      actions.app.setSharingWindow(false);
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
  }, []);

  useEffect(() => {
    actions.user.getLoggedInUser({ authData: authData });
  }, [actions.user, authData]);

  useEffect(() => {
    const getUserData = async () => {
      if (usersInCallIds) {
        for (var userId of usersInCallIds) {
          if (!usersInCallRef.current[userId]) {
            setUsersInCall({
              ...usersInCallRef.current,
              [userId]: await actions.user.getUser({
                authData: authData,
                user_id: userId,
              }),
            });
          }
        }
      }
    };

    getUserData();
  }, [usersInCallIds, actions.user, authData]);

  useEffect(() => {
    streamList.forEach((stream, index) => {
      let streamId = stream.getId();
      let elementID = 'ag-item-' + streamId;

      if (!usersInCallIdsRef.current.includes(streamId)) {
        var tempUsersInCallIds = usersInCallIdsRef.current.concat([streamId]);
        setUsersInCallIds(tempUsersInCallIds);
      }

      if (stream.isPlaying()) stream.stop();

      if (streamState[streamId]) {
        if (streamState[streamId]['video'] === false) {
          stream.muteVideo();
          toggleVideoView(stream, 'mute');
        }
        streamState[streamId] = undefined;
      }

      stream.play(elementID);
    });

    updateWindowSize();
  }, [streamList, state.videoCallCompactMode]);

  useEffect(() => {
    updateWindowSize();
  }, [numActiveVideo, state.streamingScreenShare]);

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
      localStream.muteVideo();
      document.getElementById('video-icon').innerHTML = 'videocam_off';

      if (element) element.style.display = 'none';

      if (elementInfo) elementInfo.style.display = 'none';

      if (userDetailsElement) userDetailsElement.style.display = 'flex';
    } else {
      localStream.unmuteVideo();
      document.getElementById('video-icon').innerHTML = 'videocam';

      if (element) element.style.display = 'block';

      if (elementInfo) elementInfo.style.display = 'flex';

      if (userDetailsElement) userDetailsElement.style.display = 'none';
    }

    updateWindowSize();
  };

  const handleMic = (e) => {
    if (localStream.isAudioOn()) {
      localStream.disableAudio();
      document.getElementById('mic-icon').innerHTML = 'mic_off';
    } else {
      localStream.unmuteAudio();
      document.getElementById('mic-icon').innerHTML = 'mic';
    }
  };

  const handleScreenShare = async (e) => {
    if (state.sharingScreen) {
      ipcRenderer.send('stop-screenshare');
      actions.app.setSharingScreen(false);
    } else {
      ipcRenderer.send('init-screenshare');
      actions.app.setSharingScreen(true);
    }
  };

  const handleMultiWindowShare = async (e) => {
    if (state.sharingWindow) {
      ipcRenderer.send('stop-windowshare');
      actions.app.setSharingWindow(false);
    } else {
      ipcRenderer.send('init-windowshare');
      actions.app.setSharingWindow(true);
    }
  };

  const handleCollapse = async (e) => {
    ipcRenderer.send('collapse-video-call-window', getHeight());
    actions.app.setVideoCallCompactMode(true);
  };

  const handleExpand = () => {
    actions.app.setVideoCallCompactMode(false);
    ipcRenderer.send('expand-video-call-window');
  };

  const handleExit = async (e) => {
    playEndCallSound();

    if (e && e.currentTarget.classList.contains('disabled')) {
      return;
    }

    try {
      // AgoraClient && AgoraClient.unpublish(localStream);
      // localStream && localStream.close();

      // AgoraClient &&
      //   AgoraClient.leave(
      //     () => {
      //       console.log('Client succeed to leave.');
      //     },
      //     () => {
      //       console.log('Client failed to leave.');
      //     }
      //   );
    } finally {
      var call_channel_id = props.config.channel;
      var rid = call_channel_id.split('-')[1];
      ipcRenderer.send('exit-user-call', rid);

      actions.app.clearVideoCallData({ call_channel_id: call_channel_id });
      actions.app.emitUpdateTeam();

      var win = remote.getCurrentWindow();
      setTimeout(() => {
        win.destroy();
      }, 400);
    }
  };

  const videoControlBtn = (
    <span
      onClick={handleCamera}
      className="ag-btn videoControlBtn"
      title="Enable/Disable Video"
      style={{ opacity: 1 }}
    >
      <i
        className="material-icons focus:outline-none md-light"
        style={{ fontSize: '30px' }}
        id="video-icon"
      >
        videocam_off
      </i>
    </span>
  );

  const audioControlBtn = (
    <span
      onClick={handleMic}
      className="ag-btn audioControlBtn"
      title="Enable/Disable Audio"
      style={{ opacity: 1 }}
    >
      <i
        className="material-icons focus:outline-none md-light"
        style={{ fontSize: '30px' }}
        id="mic-icon"
      >
        mic_off
      </i>
    </span>
  );

  const exitBtn = (
    <span
      onClick={handleExit}
      className="ag-btn exitBtn"
      title="Exit"
      style={{ opacity: 1 }}
    >
      <i
        className="material-icons exit focus:outline-none md-light"
        style={{ fontSize: '30px' }}
      >
        call_end
      </i>
    </span>
  );

  const screenShareBtn = (
    <span
      onClick={handleScreenShare}
      className="ag-btn exitBtn"
      title="Enable/Disable Screen Share"
      style={{ opacity: 1 }}
    >
      <i
        className="material-icons focus:outline-none md-light"
        id="screen-share"
        style={{ fontSize: '30px' }}
      >
        {state.sharingScreen ? 'stop_screen_share' : 'screen_share'}
      </i>
    </span>
  );

  const multiWindowShareBtn = (
    <span
      onClick={handleMultiWindowShare}
      className="ag-btn exitBtn"
      title="Multi Window Share"
      style={{
        opacity: 1,
        textDecoration: state.sharingWindow ? 'line-through' : '',
      }}
    >
      <i
        className="material-icons focus:outline-none md-light"
        id="compare"
        style={{ fontSize: '30px' }}
      >
        compare
      </i>
    </span>
  );

  const collapseBtn = !state.videoCallCompactMode ? (
    <span
      onClick={handleCollapse}
      className="ag-btn exitBtn"
      title="Collapse Video Call"
      style={{ opacity: 1 }}
    >
      <i
        className="material-icons focus:outline-none md-light"
        style={{ fontSize: '30px' }}
      >
        fullscreen_exit
      </i>
    </span>
  ) : (
    ''
  );

  function Area(Increment, Count, Width, Height, Margin = 10) {
    let w = 0;
    let i = 0;
    let h = Increment * 0.75 + Margin * 2;
    while (i < Count) {
      if (w + Increment > Width) {
        w = 0;
        h = h + Increment * 0.75 + Margin * 2;
      }
      w = w + Increment + Margin * 2;
      i++;
    }
    if (h > Height) return false;
    if (Increment > Width) return false;
    else return Increment;
  }

  const Dish = () => {
    let Margin;
    let Scenary = document.getElementById('Dish');

    if (state.videoCallCompactMode || state.streamingScreenShare) Margin = 2;
    else Margin = 2;

    if (Scenary) {
      let Width = Scenary.offsetWidth - Margin * 2;
      let Height = Scenary.offsetHeight - Margin * 2;
      let Cameras = document.getElementsByClassName('Camera');
      let max = 0;

      let i = 1;
      while (i < 2500) {
        let w = Area(i, Cameras.length, Width, Height, Margin);
        if (w === false) {
          max = i - 1;
          break;
        }
        i++;
      }

      max = max - Margin * 2;

      if (state.videoCallCompactMode || state.streamingScreenShare) {
        max = Width - 4;
      }

      setWidth(max, Margin);
    }
  };

  function setWidth(width, margin) {
    let Scenary = document.getElementById('Dish');
    let Width = Scenary.offsetWidth;
    let Cameras = document.getElementsByClassName('Camera');
    let numPerRow = Math.ceil(Math.sqrt(Cameras.length));
    var videoWidth;

    for (var s = 0; s < Cameras.length; s++) {
      if (state.videoCallCompactMode || state.streamingScreenShare) {
        Cameras[s].style.width = width + 'px';
      } else {
        Cameras[s].style.width = Width / numPerRow - 5 + 'px';
      }

      Cameras[s].style.margin = 'auto';
      Cameras[s].style.height = width * 0.75 + 'px';
    }
  }

  return (
    <div
      id="ag-canvas"
      style={{
        background: '#2F3136',
      }}
      className={state.videoCallCompactMode ? '' : 'flex'}
    >
      {state.streamingScreenShare && (
        <div
          id="ScreenShare"
          className={state.videoCallCompactMode ? 'pointer' : 'flex'}
          style={{
            width: state.videoCallCompactMode ? '' : 'calc(100vw - 200px)',
            height: state.videoCallCompactMode ? '117px' : '100%',
            marginLeft: state.videoCallCompactMode ? '' : '5px',
          }}
          onClick={() => {
            if (state.videoCallCompactMode) handleExpand();
          }}
        >
          <section
            style={{
              width: '100%',
              position: 'relative',
              height: state.videoCallCompactMode ? '100%' : 'calc(100% - 50px)',
            }}
          >
            <StreamScreenShare />
          </section>
        </div>
      )}

      <div
        id="Video"
        className={
          !state.videoCallCompactMode && state.streamingScreenShare
            ? 'flex-1'
            : ''
        }
        style={{
          position: state.streamingScreenShare ? 'relative' : '',
          width:
            !state.videoCallCompactMode && state.streamingScreenShare
              ? '185px'
              : '',
          height:
            !state.videoCallCompactMode && state.streamingScreenShare
              ? '100vh'
              : '',
          marginLeft:
            !state.videoCallCompactMode && state.streamingScreenShare
              ? '5px'
              : '',
          marginRight:
            !state.videoCallCompactMode && state.streamingScreenShare
              ? '10px'
              : '',
        }}
      >
        <div id="Dish">
          <div
            style={{
              height: state.videoCallCompactMode ? '100%' : '',
              display:
                state.videoCallCompactMode || state.streamingScreenShare
                  ? ''
                  : 'flex',
              maxHeight: state.streamingScreenShare ? 'calc(100vh - 75px)' : '',
              top: state.streamingScreenShare ? '10px' : '',
              position: state.streamingScreenShare ? 'relative' : '',
              flexWrap: 'wrap',
              overflowY: 'scroll',
            }}
          >
            {
              streamList.map((stream) => (

                <StreamSection key={stream.getId()} stream={stream} usersInCall={usersInCall} handleExpand={handleExpand}/> 
                
              ))
            }
          </div>
        </div>
      </div>

      <div
        className={
          state.videoCallCompactMode ? 'ag-btn-group-compact' : 'ag-btn-group'
        }
        style={{
          background: 'rgba(34, 36, 37, 0.8)',
          height: '45px',
          position: 'absolute',
          bottom: '0',
        }}
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
});

export default VideoCallCanvas;
