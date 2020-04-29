
import React from 'react'
import Sidebar from '../../widgets/Sidebar'
import { useOvermind } from '../../../overmind'
import { useHistory } from "react-router-dom"

export default function TeamProfile() {

    let history = useHistory();

    const { state, actions, effects, reaction } = useOvermind();

    const back = (e) => {
        e.preventDefault()
        history.push('/home');
    }

    return (
        <div className="w-full flex">
            <div class="w-full bg-gray-900 ml-15 flex-1 text-white" style={{height: "calc(100vh - 30px)"}}>
                <pre className="px-8 pt-6 pb-8 mb-4 w-full text-white font-bold py-2 px-4 mt-2">
                    Team Name : 
                </pre>
                <pre className="px-8 pt-6 pb-8 mb-4 w-full text-white font-bold py-2 px-4 mt-2">
                    Team Members : 
                </pre>
                <div className="w-full flex px-8 pt-6 pb-8 mb-4 items-center">
                    <div className="py-2 m-2">
                        <button
                            // onClick={back}
                            className="bg-green-900 hover:bg-green-700 text-white font-bold py-2 px-4 mt-2  focus:outline-none focus:shadow-outline rounded-full"
                            type="button"> Video
                        </button> 
                    </div>
                    <div className="py-2 m-2">
                        <button
                            // onClick={back}
                            className="bg-blue-900 hover:bg-blue-700 text-white font-bold py-2 px-4 mt-2  focus:outline-none focus:shadow-outline rounded-full"
                            type="button"> Audio
                        </button> 
                    </div>
                    <div className="py-2 m-2">
                        <button
                            onClick={back}
                            className="bg-yellow-900 hover:bg-yellow-700 text-white font-bold py-2 px-4 mt-2 focus:outline-none focus:shadow-outline rounded-full"
                            type="button"> Back
                        </button>
                    </div> 
                </div>
            </div>
        </div>
    )
}
