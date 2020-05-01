import React from 'react'
import { useOvermind } from '../../../overmind'
import { useHistory } from "react-router-dom"
import BackButton from '../tidbits/BackButton'
import Sidebar from '../../widgets/Sidebar'

export default function UserProfile() {

    let history = useHistory();

    const { state, actions, effects, reaction } = useOvermind();

    const logout = (e) => {
        e.preventDefault();
        actions.handleLogout().then(() => {
            window.require("electron").ipcRenderer.send('resize-login');
            history.push('/');
        }); 
    }


    return (
        <div className="w-full flex">
            <Sidebar avatarArray={state.avatarArray}></Sidebar>
            <div className="w-full bg-gray-900 ml-15 flex-1 text-white" style={{height: "calc(100vh - 30px)", marginLeft: "49px"}}>
                <BackButton url={'/home'}></BackButton> User Profile Page
                    <code>
                        {
                            state.userProfileData.name 
                        }
                    </code>
                    <button
                        onClick={logout}
                        className="w-full bg-gray-900 hover:bg-gray-700 text-white font-bold py-2 px-4 mt-2 focus:outline-none focus:shadow-outline"
                        type="button"> Logout
                    </button> 
            </div>
        </div>
    )
    
}
