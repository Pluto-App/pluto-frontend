import React from 'react'
import { useOvermind } from '../../overmind'
import { useHistory } from "react-router-dom"

export default function Sidebar(props) {

    let history = useHistory();

    const teamPage = (e) => {
        e.preventDefault()
        history.push('/team-profile');
    }

    const addTeam = (e) => {
        e.preventDefault()
        history.push('/add-team');
    }

    return (
        <div className="w-15 bg-gray-900 text-white border-r border-blackblack fixed min-h-screen ">
            <div className="sidebar-icons">
                {
                    // This is how we use a prop.
                    props.avatarArray.map((x) => 
                        <a href="#" className="sidebar-icon flex items-center text-grey  px-2 py-2 no-underline cursor-pointer hover:bg-gray-800" onClick={teamPage} key={x}>
                            <div className="bg-white h-8 w-8 flex items-center justify-center text-black text-2xl font-semibold rounded-lg mb-1 overflow-hidden">
                                <img src={'https://api.adorable.io/avatars/285/abott@adorable' + x} alt="T" />
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
