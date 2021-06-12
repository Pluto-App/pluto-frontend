import { useState, useEffect } from 'react';
import AgoraRTC from 'agora-rtc-sdk';

const AgoraClient = AgoraRTC.createClient({ mode: 'interop', codec: 'vp8' });

export default function useAgoraRTC(props) {


	useEffect(() => {
		if (!AgoraClient) return;


	}, [AgoraClient]);

	return {
  	};
}