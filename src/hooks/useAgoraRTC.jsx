import { useState, useEffect, useCallback } from 'react';
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

  	const addStream = useCallback( (stream, push = false) => {
    	let repeatition = streamList.some((item) => {
      		return item.getId() === stream.getId();
		});
    	
    	if (repeatition)
      		return;

    	let tempStreamList;
    	if (push)
      		tempStreamList = streamList.concat([stream]);
    	else 
      		tempStreamList = [stream].concat(streamList);
    
    	setStreamList(tempStreamList);
  	}, [streamList]);

  	const removeStream = useCallback( (uid) => {

	    streamList.forEach((item, index) => {
	      if (item.getId() === uid) {
	        item.close();

	        let tempList = [...streamList.current];
	        tempList.splice(index, 1);

	        setStreamList(tempList);
	      }
	    });
  	},[streamList]);

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
	      
	    });

	    AgoraRTCClient.on('unmute-video', function (evt) {
	      
	    });
	  };

	return {
		initAgoraRTC, streamList, setStreamList, localStream
  	};
}