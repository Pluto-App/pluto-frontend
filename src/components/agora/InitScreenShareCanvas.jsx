import React, { useEffect, useState, useContext } from 'react'
import { merge } from 'lodash'
import AgoraRTC from 'agora-rtc-sdk'

import { useOvermind } from '../../overmind'
import { socket_live, events } from '../sockets'

import {AuthContext} from '../../context/AuthContext'

const { remote } = window.require('electron');

const InitScreenShareCanvas = React.memo((props) => {

	const { state, actions } = useOvermind();
	const { authData, setAuthData } = useContext(AuthContext);

	const AgoraClient = AgoraRTC.createClient({ mode: props.transcode, codec: "vp8" });

	var localStream = {};
	const [ screenShareState, setScreenShareState ] = useState({ ready: false});

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

    useEffect(() => {

    	actions.app.setScreenSize();

    	AgoraRTC.getScreenSources(function(err, sources) {
		    setScreenSources(sources);
		    console.log(sources);
		})

    }, [])

    const initScreenShare = (sourceId) => {

        AgoraClient.init(props.appId, () => {
	      	
	      	AgoraClient.join(props.appId, props.channel, props.uid, (uid) => {

	      		socket_live.emit(events.joinRoom, props.channel);

        		localStream = streamInit(uid, props.videoProfile, sourceId);

        		localStream.init(() => {

            		AgoraClient.publish(localStream, err => {
              			alert("Publish local stream error: " + err);
            		})

				 	socket_live.emit(events.userScreenShare, {
	          			call_channel_id: 	localStorage.getItem("call_channel_id"),
	          			resolution: 		state.screenSize,
				 		channel_id: 		props.channel,
				 		sender_id:  		state.userProfileData.uid
				 	});

	          		window.require("electron").ipcRenderer.send('sharing-screen');

	          		setScreenShareState({ ready: true })
	        	},

	          	err => {

	            	alert("No Access to media stream", err)
	            	exitScreenShare();
	            	setScreenShareState({ ready: true })
	          	})
	      	})
    	})
    };

    useEffect(() => {

        actions.user.getLoggedInUser({authData: authData})

    }, [actions, authData])

    const style = {
  		display: 'grid',
  		alignItems: 'center',
  		justifyItems: 'center',
  		gridTemplateRows: 'repeat(1, auto)',
  		gridTemplateColumns: 'repeat(1, auto)'
    }

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