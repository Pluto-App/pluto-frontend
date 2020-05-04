import React, { useEffect, useState }from 'react'
import { useOvermind } from '../../overmind'
import { useHistory } from "react-router-dom"

export default function Sidebar(props) {

    let history = useHistory();
    
    const [ teamArray, updateTeamArray ] = useState([])
    const { state, actions, effects, reaction } = useOvermind();

    const addTeam = (e) => {
        e.preventDefault()
        history.push('/add-team');
    }

    useEffect(() => {

        const loadTeams = async (id) => {
            actions.teamsbyuserid({
                userid : id
            })   
        }

        loadTeams(state.userProfileData.userid)

    }, [state.userProfileData.userid, actions])
    
    return (
        <div className="w-15 bg-gray-900 text-white border-r border-blackblack fixed min-h-screen ">
            <div className="sidebar-icons">
                {
                    // This is how we useEffect & useState 
                    Object.entries(state.teamDataInfo).map(([id, value]) => 
                        state.teamDataInfo[id].isActive ?
                        <a href="/home" className="sidebar-icon flex items-center text-grey px-2 py-2 no-underline cursor-pointer bg-indigo-900 hover:bg-gray-800" id={id} key={id}
                            onClick={(e) => {
                                e.preventDefault()
                                actions.changeActiveTeam(id).then(() => {
                                    history.push('/home')
                                })
                            }}>
                            <div className="bg-white h-8 w-8 flex items-center justify-center text-black text-2xl font-semibold rounded-lg mb-1 overflow-hidden">
                                <img src={state.teamDataInfo[id].avatar} alt="T" />
                            </div>
                        </a> :
                        <a href="/home" className="sidebar-icon flex items-center text-grey px-2 py-2 no-underline cursor-pointer hover:bg-gray-800" id={id} key={id}
                            onClick={(e) => {
                                e.preventDefault()
                                actions.changeActiveTeam(id).then(() => {
                                    history.push('/home')
                                })
                            }}>
                            <div className="bg-white h-8 w-8 flex items-center justify-center text-black text-2xl font-semibold rounded-lg mb-1 overflow-hidden">
                                <img src={state.teamDataInfo[id].avatar} alt="T" />
                            </div>
                        </a>
                    )
                }
                <a href="/add-team" className="sidebar-icon flex items-center text-grey  px-2 py-2 no-underline cursor-pointer hover:bg-gray-800" onClick={addTeam}>
                    <div className="bg-white h-8 w-8 flex items-center justify-center text-black text-2xl font-semibold rounded-lg mb-1 overflow-hidden">
                        <i className="material-icons">add</i>
                    </div>
                </a>
            </div>
        </div>
    )
}
