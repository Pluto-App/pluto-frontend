import socketIOClient from "socket.io-client";

// TODO Do we need other events?
export const socket_live = socketIOClient(process.env.REACT_APP_LIVE_ENDPOINT);

export const events = {
  offline: "Offline",
  online: "Online",
  sleeping: "Sleeping",
  new_team: "New Team",
  new_room: "New Room",
  team_switch: "Team Switch",
  remove_room: "Remove Room",
  room_switch: "Room Switch",
  audio_call: "Audio Call",
  video_call: "Video Call",
  ping: "ping",
  pong: "pong",
  remove_member: "Remove Member",
  room_welcome: "Room Welcome",
  user_join: "User Joined"
}