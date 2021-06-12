import { useState, useEffect, useRef } from 'react';
import AgoraRTC from 'agora-rtc-sdk';
import { merge } from 'lodash';

import { socket_live, events } from '../components/sockets';
import { useOvermind } from '../overmind';


const AgoraRTCClient = AgoraRTC.createClient({ mode: 'interop', codec: 'vp8' });
let localStream;
const { remote, ipcRenderer } = window.require('electron');

export default function useAgoraRTC(props) {

	const { state, actions } = useOvermind();
	const [ streamList, setStreamList ] = useState([]);
	
	const streamListRef = useRef();
  	streamListRef.current = streamList;

	useEffect (() => {

		return () => {

			AgoraRTCClient && AgoraRTCClient.unpublish(localStream);
			localStream && localStream.close();

			AgoraRTCClient &&
	        AgoraRTCClient.leave(
          		() => {
	            	console.log('Client succeed to leave.');
	          	},
	          	() => {
	            	console.log('Client failed to leave.');
	          	}
	        );
		}
	},[])

	const initAgoraRTC = async () => {
		
		const agoraRTCToken = await actions.auth.getAgoraAccessToken({
        	requestParams: { channel: props.channel, user_id: props.user_id },
      	});

		AgoraRTCClient.init(
			props.appId,
			() => {
				subscribeStreamEvents();

				AgoraRTCClient.join(
					agoraRTCToken,
					props.channel,
					props.user_id,
					(user_id) => {

						localStream = streamInit(user_id, props.videoProfile);

						localStream.init(
			                () => {
			                  	localStream.muteVideo();
			                  	localStream.muteAudio();

			                  	addStream(localStream, true);

			                  	ipcRenderer.send('set-user-color', {
			                    	user_color:
			                      	'#' + Math.floor(Math.random() * 16770000).toString(16),
			                  	});

			                  	socket_live.emit(
			                    	events.joinRoom,
			                    	{
			                      		room: props.channel,
			                      		user_id: props.user_id,
			                    	},
			                    	(data) => {
			                      		if (data.created) {
			                        		actions.app.emitUpdateTeam();
			                      		}
			                    	}
			                  	);

			                  	AgoraRTCClient.publish(localStream, (err) => {
			                    	alert('Publish local stream error: ' + err);
			                  	});
			                	},
		                		async (err) => {
		                  			var hasMediaAccess = await ipcRenderer.sendSync(
			                    		'check-media-access'
			                  		);

			                  		if (!hasMediaAccess) {
			                    		alert('No Access to camera or microphone!');
			                  		} else {
			                    		alert('Unexpected Error!\n ' + JSON.stringify(err));
			                  		}

			                  	actions.app.setError(err);
			                }
		              	);
					}
				)
			}
		)
	}

  	const streamInit = (uid, videoProfile, config) => {
    	let defaultConfig = {
      		streamID: uid,
      		audio: true,
      		video: true,
      		screen: false,
		};

    	let stream = AgoraRTC.createStream(merge(defaultConfig, config));
    	stream.setVideoProfile(videoProfile);

    	return stream;
  	};

  	const addStream = (stream, push = false) => {
    	let repetition = streamListRef.current.some((item) => {
      		return item.getId() === stream.getId();
		});
    	
    	if (repetition)
      		return;

    	let tempStreamList;
    	if (push)
      		tempStreamList = streamListRef.current.concat([stream]);
    	else 
      		tempStreamList = [stream].concat(streamListRef.current);
    
    	setStreamList(tempStreamList);
  	};

  	const removeStream = (uid) => {

	    streamListRef.current.forEach((item, index) => {
	      if (item.getId() === uid) {
	        item.close();

	        let tempList = [...streamListRef.current];
	        tempList.splice(index, 1);

	        setStreamList(tempList);
	      }
	    });
  	};

  	const subscribeStreamEvents = () => {

	    AgoraRTCClient.on('stream-added', function (evt) {
	      let stream = evt.stream;

	      AgoraRTCClient.subscribe(stream, function (err) {
	        console.log('Subscribe stream failed', err);
	      });
	    });

	    AgoraRTCClient.on('user-published', function (evt) {
	      let stream = evt.stream;

	      AgoraRTCClient.subscribe(stream, function (err) {
	        console.log('Subscribe stream failed', err);
	      });
	    });

	    AgoraRTCClient.on('peer-leave', function (evt) {

	      removeStream(evt.uid);
	    });

	    AgoraRTCClient.on('stream-subscribed', function (evt) {
	      let stream = evt.stream;

	      addStream(stream);
	    });

	    AgoraRTCClient.on('stream-removed', function (evt) {
	      let stream = evt.stream;

	      removeStream(stream.getId());
	    });

	    AgoraRTCClient.on('mute-video', function (evt) {
	    	
	    	let uid = evt.uid;
	      	var found = false;

	      	streamList.forEach((stream, index) => {
	        	if (stream.getId() === uid) {
	          		toggleVideoView(stream, 'mute');
	          		found = true;
	        	}
	      	});

	      	if (!found) {
	        	if (!streamState[uid]) streamState[uid] = {};

        		streamState[uid]['video'] = false;
	      	}
	    });

	    AgoraRTCClient.on('unmute-video', function (evt) {

	    	let uid = evt.uid;
	        var found = false;

	        streamList.forEach((stream, index) => {
	          if (stream.getId() === uid) {
	            toggleVideoView(stream, 'unmute');
	            found = true;
	          }
	        });

	        if (!found) {
	          	if (!streamState[uid]) streamState[uid] = {};

	          	streamState[uid]['video'] = true;
	        }
	    });
  	};

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
	      stream.muteVideo();

	      if (element) element.style.display = 'none';

	      if (elementInfo) elementInfo.style.display = 'none';

	      if (userDetailsElement) userDetailsElement.style.display = 'flex';
	    } else {
	      stream.unmuteVideo();

	      if (element) element.style.display = 'block';

	      if (elementInfo) elementInfo.style.display = 'flex';

	      if (userDetailsElement) userDetailsElement.style.display = 'none';
	    }

	    updateWindowSize();
  	};

	return {
		initAgoraRTC, streamList, localStream
  	};
}