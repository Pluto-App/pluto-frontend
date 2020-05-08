import socketIOClient from "socket.io-client";

export const socket_live = socketIOClient(process.env.REACT_APP_LIVE_ENDPOINT);
export const socket_chat = socketIOClient(process.env.REACT_APP_CHAT_ENDPOINT);

export const events = {
    offline : "Offline", 
    online : "Online",
    sleeping : "Sleeping", 
    new_team : "New Team", 
    new_room : "New Room",
    team_switch : "Team Switch", 
    remove_room : "Remove Room", 
    room_switch : "Room Switch", 
    audio_call : "Audio Call", 
    video_call : "Video Call", 
    live : "live", 
    remove_member : "Remove Member"
}