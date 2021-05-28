import React, { useEffect, useState, useContext } from 'react'
import AgoraRTC from 'agora-rtc-sdk'

import { useOvermind } from '../../overmind'
import { socket_live, events } from '../sockets'

import {AuthContext} from '../../context/AuthContext'
const { remote, ipcRenderer } = window.require('electron');

const InitScreenShareCanvas = React.memo((props) => {

	const { state, actions } = useOvermind();
	const { authData } = useContext(AuthContext);

	const AgoraClient = AgoraRTC.createClient({ mode: props.transcode, codec: "vp8" });

	var localStream = {};

	const [ screenSources, setScreenSources ] = useState([]);

	const streamInit = (uid, videoProfile, sourceId) => {

	    let defaultConfig = {
	      	streamID: uid,
	      	audio: false,
	      	video: false,
	      	screen: true,
	      	sourceId: sourceId
	    }

    	let stream = AgoraRTC.createStream(defaultConfig)
    	stream.setVideoProfile(videoProfile)
    	return stream
  	}

  	const exitScreenShare = () => {
  		
  		actions.app.clearScreenShareData();
  		var window = remote.getCurrentWindow();
      	window.close();
  	}

    const initScreenShare = (sourceInfo) => {

        AgoraClient.init(props.appId, async () => {
	      	
	      	const agoraAccessToken = await actions.auth.getAgoraAccessToken({ requestParams: {channel: props.channel}});

	      	AgoraClient.join(agoraAccessToken, props.channel, props.uid, (uid) => {

	      		socket_live.emit(events.joinRoom, props.channel);

        		localStream = streamInit(uid, props.videoProfile, sourceInfo);

        		localStream.init( async () => {

            		AgoraClient.publish(localStream, err => {
              			alert("Publish local stream error: " + err);
            		})

            		var overlayBounds = await window.require("electron").ipcRenderer.sendSync('screenshare-source-bounds', 
            								sourceInfo);

				 	socket_live.emit(events.userScreenShare, {
	          			call_channel_id: 	localStorage.getItem("call_channel_id"),
	          			resolution: 		overlayBounds,
				 		channel_id: 		props.channel,
				 		sender_id:  		state.userProfileData.uid,
				 		user_id: 			state.userProfileData.id
				 	});

				 	localStorage.setItem('screenshare_channel_id', props.channel);
				 	localStorage.setItem('screenshare_source', sourceInfo);
	          		ipcRenderer.send('sharing-screen', overlayBounds);
	        	},

	          	err => {

	            	alert("No Access to media stream", err)
	            	exitScreenShare();
	          	})
	      	})
    	})
    };

    useEffect(() => {

    	actions.app.setScreenSize();

    	AgoraRTC.getScreenSources(function(err, sources) {

		    setScreenSources(sources);
		})

    },[])

    useEffect(() => {

        actions.user.getLoggedInUser({authData: authData})

    }, [actions, authData])

    return (
		<div>
			<div className="mb-4 text-lg px-3 center">
				Select Screen/Window to share..
			</div>
			{
				screenSources.map(source => 

					<li 
                        key={source.id}
                        className='px-3 pt-2 pb-2 flex pointer settings-menu-item mb-2'
                        style={{
                            width: '33%', float: 'left', listStyle: 'none'
                        }}
                        onClick={() =>{initScreenShare(source.id)}}
                    >
                    	<div className="w-full">
                    		 <div 
	                            className="w-full flex items-center justify-center mr-3 overflow-hidden"
	                            style={{}}
	                        >
	                            <img style={{height: '100px'}} src={source.thumbnail.toDataURL()} alt="" />
	                        </div> 
	                        <div className="center mt-2 text-sm" style={{
	                        	textOverflow: 'ellipsis',
							    overflow: 'hidden',
							    width: '160px',
							    height: '1.2em',
							    whiteSpace: 'nowrap',
	                        }}>
	                            {source.name}
	                        </div>
                    	</div>
                    </li>
				)
			}
      	</div>
	);
})

export default InitScreenShareCanvas;