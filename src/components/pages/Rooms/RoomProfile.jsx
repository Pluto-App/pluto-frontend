/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from 'react'
import { useOvermind } from '../../../overmind'
import { useHistory } from "react-router-dom"
import BackButton from '../../widgets/BackButton'
import UserListItem from '../Users/UserListItem'
import ToastNotification from '../../widgets/ToastNotification'

const MembersList = React.memo((props) => {

    const teamMemberList = props.map((member) =>
        <UserListItem
            data-record-id={member.userid}
            id={member.userid}
            key={member.userid.toString()}
            url={member.avatar}
            name={member.username}
            email={member.useremail}
            statusColor={member.statusColor}
        />
    )

    return (
        <div>
            {teamMemberList}
        </div>
    );
});

export default function RoomProfile() {

    let history = useHistory();

    const { state, actions } = useOvermind();
    const [OnlineRoomteamMemberList, updateOnlineList] = useState([]);
    const [roomTextAll, setRoomTextAll] = useState("");
    const [roomId, setRoomId] = useState(state.activeRoomId)

    useEffect(() => {
        // TODO Testing this map.
        let arr = []
        Object.entries(state.userMapping).map(([key, value]) => {
            if (value.roomid === state.activeRoomId) {
                arr.push(value);
            }
        })

        updateOnlineList(arr)

        // TODO Setup room level Video Call. 
        return () => {
            // TODO Remove User and Emit Room Leave Event. 
            actions.removeFromRoom()
            setRoomId("")
        }
    }, [actions, state.userMapping, state.activeRoomId])

    const getJoinedRoomUsers = (e) => {

    }

    return (
        <div className="w-full flex">
            <div className="bg-black flex-1 px-3 text-white pt-2" style={{ height: "calc(100vh - 30px)" }}>
                <BackButton url={'/home'}></BackButton>
                <div className="flex">
                    <div className="bg-white h-12 w-12 flex items-center justify-center text-black text-2xl font-semibold rounded-full mb-1 overflow-hidden">
                        <img src={state.userTeamDataInfo[state.activeTeamId].avatar} alt="" />
                    </div>
                    <div className="ml-3">
                        <p className="font-bold text-white">{state.userTeamDataInfo[state.activeTeamId].teamname}</p>
                        <p className="text-gray-500">{state.userTeamDataInfo[state.activeTeamId].teamowner}</p>
                    </div>
                </div>
                <p className="text-grey font-bold text-sm tracking-wide mt-2">Room | {state.activeRoomName}
                <button className="text-white hover:bg-gray-900 py-1 px-3 focus:outline-none"
                        onClick={(e) => {
                            getJoinedRoomUsers(e)
                        }}
                    >
                        <i className="material-icons md-light " style={{ fontSize: "14px", margin: "0" }}>autorenew</i>
                    </button></p>
                <div className="mt-3 mb-4 bg-gray-900" style={{ height: "1px", width: "100%" }}></div>
                <div className="flex justify-center items-center hover:bg-gray-800">
                    <input className="shadow appearance-none border rounded w-full py-1 px-5
                            px-2 text-gray-700 leading-tight focus:outline-none"
                        style={{ width: "100%" }}
                        onChange={(e) => {
                            setRoomTextAll(e.target.value)
                        }}
                        onKeyPress={(e) => {
                            if (e.keyCode === 13 || e.which === 13) {
                                if (e.target.value === '') {
                                    ToastNotification('error', "Write Something")
                                } else {
                                    ToastNotification('success', "Sending to all ...📨")
                                    actions.sendRoomBroadcast({
                                        roomname: state.activeRoomName,
                                        teamid: state.activeTeamId,
                                        roomid: state.activeRoomId,
                                        message: roomTextAll,
                                        sender: state.userProfileData.username
                                    })
                                    e.target.value = '';
                                    setRoomTextAll('');
                                }
                            }

                        }}
                        name="roomtextall"
                        id="roomtextall"
                        type="text"
                        placeholder="Send to All...🤟"
                        autoFocus />
                </div>
                <div className="mt-3 mb-4 bg-gray-900" style={{ height: "1px", width: "100%" }}></div>
                <div className="w-full">
                    {
                        MembersList(OnlineRoomteamMemberList)
                    }
                </div>
            </div>
        </div>
    )
}