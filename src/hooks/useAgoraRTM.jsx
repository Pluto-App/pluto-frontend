import { useState, useEffect, useCallback } from 'react';
import AgoraRTM from 'agora-rtm-sdk';

import { useOvermind } from '../overmind';

const AgoraRTMClient = AgoraRTM.createInstance(process.env.REACT_APP_AGORA_APP_ID);

export default function useAgoraRTM(props) {

	const { state, actions } = useOvermind();
	const [ newMessage, setNewMessage ] = useState(undefined);
	const [ rtmChannel, setRtmChannel ] = useState(undefined);

	useEffect(() => {
		if (!AgoraRTMClient) return;

		const rtmLogin = async () => {
			const agoraRTMToken = await actions.auth.getAgoraRTMToken({
	        	requestParams: { user_id: props.user_id },
	      	});

			AgoraRTMClient.login({uid: String(props.user_id), token: agoraRTMToken});
		}

		rtmLogin();

		return () => {
	    	AgoraRTMClient.logout();
      	};

	}, [AgoraRTMClient]);

	useEffect(() => {

		if(!rtmChannel) return;

		const joinChannel = async () => {
			
			await rtmChannel.join();
			subscribeChannelEvents();
		}

		joinChannel();

		return () => {
			rtmChannel.leave();
      	};

	}, [rtmChannel])

	const joinRTMChannel = async (channel) => {
		
		setRtmChannel(await AgoraRTMClient.createChannel(channel));
		return;
	}

	const subscribeChannelEvents = () => {
		
		rtmChannel.on('ChannelMessage', function (message, userId) {

  			setNewMessage({message: message, userId: userId})
		});	
	}

	const sendChannelMessage = useCallback( (message) => {
       
		if(rtmChannel){

			if(message.messageType)
				rtmChannel.sendMessage(message);
			else
				rtmChannel.sendMessage({ text: message});
		}
		
    }, [rtmChannel])

	const sendChannelMediaMessage = useCallback( async (blob) => {

		const mediaMessage = await AgoraRTMClient.createMediaMessageByUploading(blob, {
			
      		messageType: blob.type.startsWith("image/") ? 'IMAGE' : 'FILE',
      		fileName: blob.name
	    })

	    sendChannelMessage(mediaMessage);
		
    }, [sendChannelMessage])

	return {
    	newMessage, joinRTMChannel, sendChannelMessage, sendChannelMediaMessage
  	};
}