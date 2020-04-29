
import React from 'react'
import Sidebar from '../../widgets/Sidebar'
import { useOvermind } from '../../../overmind'
import { useHistory } from "react-router-dom"

export default function TeamRegisterPage() {

    let history = useHistory();

    const { state, actions, effects, reaction } = useOvermind();

    const back = (e) => {
        history.push('/home');
    }

    return (
        <div className="w-full flex">
            <div class="w-full bg-gray-900 ml-15 flex-1 text-white" style={{height: "calc(100vh - 30px)"}}>
                <button
                    onClick={back}
                    className="w-full bg-gray-800 hover:bg-gray-700 text-white font-bold py-2 px-4 mt-2 focus:outline-none focus:shadow-outline"
                    type="button"> Back
                </button> 
                <form className="px-8 pt-6 pb-8 mb-4">
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2" for="username">
                            Unquie Team Name
                        </label>
                        <input className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" 
                                name="teamname" 
                                id="teamname" 
                                type="text" 
                                placeholder="Team Name" />
                    </div>
                    <div className="mb-6">
                        <label className="block text-gray-700 text-sm font-bold mb-2" for="password">
                            Choose Team Owner
                        </label>
                        <input className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" 
                                name="teamowner"
                                id="teamowner" 
                                type="text" 
                                placeholder="Team Owner" />
                    </div>
                    <div className="flex items-center justify-between">
                        <button className="bg-indigo-500 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" type="button">
                            Create Team
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
