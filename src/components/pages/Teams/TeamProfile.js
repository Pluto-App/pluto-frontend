import React, { useEffect, useState } from 'react'
import { useOvermind } from '../../../overmind'
import { useHistory } from "react-router-dom"
import BackButton from '../tidbits/BackButton'
import UserListItem from '../tidbits/UserListItem'
import Sidebar from '../../widgets/Sidebar'
import MainBar from '../../widgets/MainBar'
import { css } from "@emotion/core";
import BeatLoader from "react-spinners/BeatLoader";

export default function TeamProfile() {

    let history = useHistory();

    const override = css`
        display: block;
        margin: 0 auto;
        border-color: white;
    `;

    const { state, actions, effects, reaction } = useOvermind();

    const [MemberArray, updateMembersArray] = useState([]);

    useEffect(() => {

        const MembersData = async (teamid) => {
            await actions.usersbyteamid({
                teamid : teamid
            })
        }

        MembersData(state.activeTeamId)

    }, [actions, state.activeTeamId])

    useEffect(() => {

        let arr = []
        Object.entries(state.memberList).map(([key, value]) => {
            arr.push(value)
        })

        updateMembersArray(arr)

    }, [state.memberList])

    return (
        <div className="w-full flex">
            <Sidebar></Sidebar>
            <div className="w-full bg-gray-900 ml-15 flex-1 text-white" style={{height: "calc(100vh - 30px)", marginLeft: "49px"}}>
                <MainBar/>
                <BackButton url={'/home'}></BackButton>
                <pre className="text-grey font-bold text-sm px-2 tracking-wide mt-2">
                    Team Name : {state.teamDataInfo[state.activeTeamId].teamname}
                </pre>
                <pre className="text-grey font-bold text-sm px-2 tracking-wide mt-2">
                    Team Owner : {state.teamDataInfo[state.activeTeamId].teamowner}
                </pre>
                <pre className="text-grey font-bold text-sm px-2 tracking-wide mt-2">
                    Team Plan : {state.teamDataInfo[state.activeTeamId].plan}
                </pre>
                <div className="w-full flex px-8 pt-2 items-center">
                    <div className="m-2">
                        <button
                            className="bg-green-900 hover:bg-green-700 text-white font-bold py-2 px-4 mt-2 focus:outline-none focus:shadow-outline rounded-full"
                            type="button"><i className="material-icons mr-1">videocam</i>
                        </button> 
                    </div>
                    <div className="m-2">
                        <button
                            className="bg-blue-900 hover:bg-blue-700 text-white font-bold py-2 px-4 mt-2  focus:outline-none focus:shadow-outline rounded-full"
                            type="button"> <i className="material-icons mr-1">headset_mic</i>
                        </button> 
                    </div>
                </div>
                <pre className="text-grey font-bold text-sm px-2 tracking-wide mt-2 hover:bg-gray-800">
                   Team Members : 
                </pre>
                {
                    !state.loadingMembers ? 
                    MemberArray.map((member) => 
                        <UserListItem id={member.userid} key={member.userid} url={member.avatar} name={member.username} email={member.useremail} statusColor='red'/>
                    ) : 
                    <BeatLoader
                        css={override}
                        size={10}
                        color={"white"}
                        loading={state.loadingMembers}
                    />
                }
            </div>
        </div>
    )
}