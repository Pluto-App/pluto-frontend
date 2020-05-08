import socketIOClient from "socket.io-client";

export const socket_live = socketIOClient(process.env.REACT_APP_LIVE_ENDPOINT);
export const socket_chat = socketIOClient(process.env.REACT_APP_CHAT_ENDPOINT);