import React, { useEffect, useState } from 'react'
import { useOvermind } from '../../../overmind'
import { useHistory } from "react-router-dom"
import BackButton from '../tidbits/BackButton'
import UserListItem from '../tidbits/UserListItem'
import Sidebar from '../../widgets/Sidebar'
import MainBar from '../../widgets/MainBar'

export default function TeamProfile() {

    let history = useHistory();

    const { state, actions, effects, reaction } = useOvermind();

    const [MemberArray, updateMembersArray] = useState([]);

    useEffect(() => {

        // Populate using POST request data from /usersbyteamid, pass teamid. Memo it. Populate MemberArray
        const MembersData = async (teamid) => {
            await actions.usersbyteamid({
                teamid : teamid
            })
        }

        let TeamMembers = [
            {
                id : 55486464,
                url : 'https://gravatar.com/avatar/42a342f34c62e2951e25ad55c7920647?s=400&d=robohash&r=x',
                name : 'Chris Wane',
                statusColor : 'red'
            },
            {
                id : 884574541,
                url : 'https://gravatar.com/avatar/f8bb85e63f1f81ac473f8439db9309da?s=400&d=robohash&r=x',
                name : 'Abhishek Wani',
                statusColor : 'orange'
            },
            {
                id : 9653214567,
                url : 'https://gravatar.com/avatar/2186b975d2d8ac084397b3fe1a42795d?s=400&d=robohash&r=x',
                name : 'Robin Pike',
                statusColor : 'green'
            },
            {
                id : 66352144,
                url : 'https://gravatar.com/avatar/fe78f037abc7274b60227211bcaddc2e?s=400&d=robohash&r=x',
                name : 'Harish Yadav',
                statusColor : 'green'
            },
            {
                id : 77415523,
                url : state.userProfileData.avatar,
                name : 'Sumit Lahiri',
                statusColor : 'green'
            },
        ]

        updateMembersArray(TeamMembers)

    }, [actions, state.userProfileData.avatar])

    return (
        <div className="w-full flex">
            <Sidebar></Sidebar>
            <div className="w-full bg-gray-900 ml-15 flex-1 text-white" style={{height: "calc(100vh - 30px)", marginLeft: "49px"}}>
                <MainBar/>
                <BackButton url={'/home'}></BackButton>
                <pre className="text-grey font-bold text-sm px-2 tracking-wide mt-2">
                    Team Name : {state.teamDataInfo[state.activeTeamId].name}
                </pre>
                <pre className="text-grey font-bold text-sm px-2 tracking-wide mt-2">
                    Team Owner : {state.teamDataInfo[state.activeTeamId].owner}
                </pre>
                <pre className="text-grey font-bold text-sm px-2 tracking-wide mt-2">
                    Team Plan : {state.teamDataInfo[state.activeTeamId].plan}
                </pre>
                <div className="w-full flex px-8 pt-6 pb-8 mb-4 items-center">
                    <div className="py-2 m-2">
                        <button
                            className="bg-green-900 hover:bg-green-700 text-white font-bold py-2 px-4 mt-2 focus:outline-none focus:shadow-outline rounded-full"
                            type="button"><i className="material-icons mr-1">videocam</i>
                        </button> 
                    </div>
                    <div className="py-2 m-2">
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
                    MemberArray.map((member) => 
                        <UserListItem id={member.id} url={member.url} name={member.name} statusColor={member.statusColor}/>
                    )
                }
            </div>
        </div>
    )
}