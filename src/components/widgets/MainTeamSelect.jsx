/* eslint-disable no-unused-vars */
import React, { useEffect, useState} from 'react'
import { useOvermind } from '../../overmind'
import { useHistory } from "react-router-dom"

const MainBar = React.memo((props) => {

    let history = useHistory();
    const { state, actions } = useOvermind();


    const [showOptions, setShowOptions] = useState(false);


    return (
        <div className="main-team-select-container">
            <div className="main-team-select hover:bg-gray-700">
                <div class="custom-select__trigger" onClick={() => {
                    setShowOptions( showOptions ? false : true )
                }}>
                    <span style={{fontSize: '16px', fontWeight: '400'}}>
                        {state.currentTeam.name}
                    </span>
                    <div className="flex justify-center items-center">
                       <i className="material-icons" style={{ fontSize: "18px", margin: "0" }}>
                        unfold_more
                    </i>
                    </div>
                </div>
            </div>
            {
                showOptions ? 
                <div class="main-team-select-options">
                    {   state.userProfileData.teams ?
                        <div>
                        {
                            state.userProfileData.teams.map(team =>
                                <div class="main-team-select-option"
                                    onClick={(e) => {
                                        e.preventDefault()
                                        actions.team.updateCurrentTeam({team_id: team.id}).then(() => {
                                            setShowOptions(false);
                                            history.push('/')
                                        })
                                    }}
                                >
                                    <div className="bg-white flex items-center justify-center text-black text-2xl font-semibold 
                                    rounded-lg mb-1 overflow-hidden" style={{width: '45px', float: 'left'}}>
                                        <img src={team.avatar} alt='T' />
                                    </div>
                                    <div data-value={team.id} style={{width: '145px', paddingTop: '3px', float: 'right'}}>
                                        { team.name }
                                    </div>
                                </div>
                            )
                        }
                            <div class="main-team-select-option">
                                <div className="bg-black flex items-center justify-center text-2xl font-semibold 
                                rounded-lg mb-1 overflow-hidden" style={{width: '45px', height: '45px', float: 'left'}}>
                                    <i className="material-icons hover:bg-gray-700" style={{ fontSize: "18px", margin: "0" }}
                                        style={{ transition: "all .60s ease" }}
                                    >add</i>
                                </div>
                                <div style={{width: '145px', paddingTop: '8px', float: 'right'}}>
                                    Create Team
                                </div>
                            </div>
                        </div>
                        : ''
                    }
                </div>
                : ''
            }
        </div>
    )
})

export default MainBar;