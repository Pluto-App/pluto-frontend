import React, { useEffect, useState, useContext } from 'react'
import AgoraRTC from 'agora-rtc-sdk'

import { useOvermind } from '../../overmind'
import { socket_live, events } from '../sockets'

import {AuthContext} from '../../context/AuthContext'
const { remote } = window.require('electron');

const InitWindowShareCanvas = React.memo((props) => {

	const { state, actions } = useOvermind();
	const { authData } = useContext(AuthContext);

	const AgoraClient = AgoraRTC.createClient({ mode: props.config.transcode, codec: "vp8" });

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

  	const exitWindowShare = () => {
  		
  		actions.app.clearWindowShareData();
  		var window = remote.getCurrentWindow();
      	window.close();
  	}

    const initWindowShare = (sourceInfo) => {

        AgoraClient.init(props.config.appId, async () => {
	      	
	      	const agoraAccessToken = await actions.auth.getAgoraAccessToken({ requestParams: {channel: props.config.channel}});

	      	AgoraClient.join(agoraAccessToken, props.config.channel, props.config.user_uid, (uid) => {

	      		socket_live.emit(events.joinRoom, props.config.channel);

        		localStream = streamInit(uid, props.config.videoProfile, sourceInfo);

        		localStream.init( async () => {

            		AgoraClient.publish(localStream, err => {
              			alert("Publish local stream error: " + err);
            		})

            		var overlayBounds = await window.require("electron").ipcRenderer.sendSync('windowshare-source-bounds', 
            								sourceInfo);

				 	socket_live.emit(events.userWindowShare, {
	          			call_channel_id: 	localStorage.getItem("call_channel_id"),
	          			channel_id: 		props.config.channel,
	          			resolution: 		overlayBounds,
				 		user_uid:  			props.config.user_uid,
				 		user_id: 			props.config.user_id
				 	});

				 	localStorage.setItem('windowshare_channel_id', props.config.channel);
				 	localStorage.setItem('windowshare_source', sourceInfo);


	          		window.require('electron').ipcRenderer.send('sharing-window', {
	          			'overlayBounds': overlayBounds,
	          			'channel_id': props.config.channel,
	          			'sourceInfo': sourceInfo
	          		});
	        	},

	          	err => {

	            	alert("No Access to media stream", err)
	            	exitWindowShare();
	          	})
	      	})
    	})
    };

    useEffect(() => {

    	actions.app.setScreenSize();

    	AgoraRTC.getScreenSources(function(err, sources) {
			
			var windowSources = sources.filter(function(source) { return source.display_id === ''; });
		    setScreenSources(windowSources);
		})

		socket_live.on(events.viewWindowShare, (data) => {
        	actions.app.updateWindowShareViewers(data);
      	});

    },[])

    useEffect(() => {

        actions.user.getLoggedInUser({authData: authData})

    }, [actions, authData])

    return (
		<div>
			<div className="mb-4 text-lg px-3 center">
				Select Window to share..
			</div>
			{
				screenSources.map(source => 

					<li 
                        key={source.id}
                        className='px-3 pt-2 pb-2 flex pointer settings-menu-item mb-2'
                        style={{
                            width: '33%', float: 'left', listStyle: 'none'
                        }}
                        onClick={() =>{initWindowShare(source.id)}}
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

export default InitWindowShareCanvas;