import socketIOClient from "socket.io-client";

// TODO Do we need other events?
export const socket_live = socketIOClient(process.env.REACT_APP_SOCKET_URL);

export const events = {

  online:             'online',
  offline:            'offline',
  joinRoom:           'joinRoom',
  activeWindowUpdate: 'activeWindowUpdate',

  userVideoCall:            'userVideoCall',
  roomVideoCall:            'roomVideoCall',
  userScreenShare:          'userScreenShare',
  userWindowShare:          'userWindowShare',
  viewScreenShare:          'viewScreenShare',
  screenShareCursor:        'screenShareCursor',
  exitRoomVideoCall:        'exitRoomVideoCall',
  endScreenShare:           'endScreenShare',
  screenShareSourceResize:  'screenShareSourceResize',

  roomMessage:        'roomMessage',
  updateTeam:         'updateTeam',
  updateTeamMembers:  'updateTeamMembers',
  updateTeamRooms:    'updateTeamRooms',

}