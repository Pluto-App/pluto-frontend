import socketIOClient from "socket.io-client";

// TODO Do we need other events?
export const socket_live = socketIOClient(process.env.REACT_APP_BACKEND_URL);
//export const backend_live = socketIOClient(process.env.REACT_APP_BACKEND_URL);

export const events = {

  online:             'online',
  offline:            'offline',
  joinRoom:           'joinRoom',
  activeWindowUpdate: 'activeWindowUpdate',

  userVideoCall:            'userVideoCall',
  roomVideoCall:            'roomVideoCall',
  userScreenShare:          'userScreenShare',
  viewScreenShare:          'viewScreenShare',
  screenShareCursor:        'screenShareCursor',
  exitRoomVideoCall:        'exitRoomVideoCall',
  endScreenShare:           'endScreenShare',
  screenShareSourceResize:  'screenShareSourceResize',

  roomMessage: 'roomMessage',
  updateTeam:  'updateTeam',

  offline: "Offline",
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
  user_join: "User Joined",
  room_broadcast: "Room Broacast",
  new_team_mate: "New Team Mate"
}