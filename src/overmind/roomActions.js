import { socket_live, events } from '../components/sockets'

export const removeFromRoom = ({ state, effects }, values) => {
    state.activeRoomId  = 0;
    state.activeRoomName = "";
}

export const sendRoomBroadcast = async ({ state, effects }, values) => {
    socket_live.emit(events.room_broadcast, {
        message : values.message,
        sender : values.sender
    })
}