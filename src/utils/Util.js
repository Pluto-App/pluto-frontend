
export const getWindowShareChannel = function(params) {

	if(!params['user_uid'] || !params['call_channel_id'])
		return undefined 
	
	return 'wscr-' + params['user_uid'] + '-' + params['call_channel_id'];	
}