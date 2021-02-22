/* eslint-disable no-unused-vars */
import React, { useEffect, useState, useContext } from 'react'
import { useOvermind } from '../../overmind'
import { useHistory } from "react-router-dom"
import { AuthContext } from '../../context/AuthContext'

const MainBar = React.memo((props) => {

    let history = useHistory();
    const { state, actions } = useOvermind();

    const { authData } = useContext(AuthContext);

    const [showOptions, setShowOptions] = useState(false);

    const addTeam = (e) => {
        e.preventDefault()
        history.push('/add-team');
    }

    useEffect(() => {

        window.addEventListener('click', () => {
            setShowOptions(false);
        });

    },[])


    return (
        <div className="main-team-select-container">
            <div className="main-team-select hover:bg-gray-700">
                <div className="custom-select__trigger" onClick={(e) => {
                    e.stopPropagation();
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
                <div className="main-team-select-options">
                    {   state.userProfileData.teams ?
                        <div>
                        {
                            state.userProfileData.teams.map(team =>
                                <div key={team.id} className="main-team-select-option"
                                    onClick={(e) => {
                                        e.preventDefault()
                                        actions.team.getTeam({team_id: team.id, authData: authData}).then(() => {
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
                            <div className="main-team-select-option" onClick={addTeam}>
                                <div className="bg-black flex items-center justify-center text-2xl font-semibold 
                                rounded-lg mb-1 overflow-hidden" style={{width: '45px', height: '45px', float: 'left'}}>
                                    <i className="material-icons hover:bg-gray-700" style={{ fontSize: "18px", margin: "0" }}
                                        style={{ transition: "all .60s ease" }}
                                    >add</i>
                                </div>
                                <div style={{width: '145px', paddingTop: '8px', float: 'right'}}>
                                    Add Team
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