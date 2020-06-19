/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from 'react'
import { useOvermind } from '../../../overmind'
import { useHistory } from "react-router-dom"
import BackButton from '../../widgets/BackButton'
import UserListItem from '../Users/UserListItem'

function MembersList(props) {


    const memberList = props.map((member) =>
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
            {memberList}
        </div>
    );
}

export default function RoomProfile() {

    let history = useHistory();

    const { state, actions } = useOvermind();
    const [OnlineRoomMemberList, updateOnlineList] = useState([]);

    useEffect(() => {
        // FIXME Load Room Members oon room change by activeRoomId and activeTeamId
        updateOnlineList(state.memberList.filter(elem => elem.roomid === state.activeRoomId))
    }, [state.memberList, state.activeRoomId])

    return (
        <div className="w-full flex">
            <div className="bg-black flex-1 px-3 text-white pt-2" style={{ height: "calc(100vh - 30px)" }}>
                <BackButton url={'/home'}></BackButton>
                <div className="flex">
                    <div className="bg-white h-12 w-12 flex items-center justify-center text-black text-2xl font-semibold rounded-full mb-1 overflow-hidden">
                        <img src={state.teamDataInfo[state.activeTeamId].avatar} alt="" />
                    </div>
                    <div className="ml-3">
                        <p className="font-bold text-white">{state.teamDataInfo[state.activeTeamId].teamname}</p>
                        <p className="text-gray-500">{state.teamDataInfo[state.activeTeamId].teamowner}</p>
                    </div>
                </div>
                <p className="text-grey font-bold text-sm tracking-wide mt-2">Room | {state.activeRoomName}</p>
                <div className="mt-3 mb-4 bg-gray-900" style={{ height: "1px", width: "100%" }}></div>
                <div className="w-full">
                    {
                        MembersList(OnlineRoomMemberList)
                    }
                </div>
            </div>
        </div>
    )
}