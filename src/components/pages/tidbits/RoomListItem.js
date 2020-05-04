
import React, { useEffect, useState } from 'react'
import { useOvermind } from '../../../overmind'
import { useHistory } from "react-router-dom"

export default function RoomListItem(props) {

    let history = useHistory();

    const { state, actions, effects, reaction } = useOvermind();

    const [showModal, toggleShowModal] = useState(false);

    const clickFunc = (e) => {

    }

    const customStyle = {
        "top": "65%",
        "width": "100%"
    }

    
    return (
        <div className="flex py-0 justify-between p-1 hover:bg-gray-800" id={props.id} onClick={() => {
            clickFunc()
        }}>
            <div className="flex justify-start p-2">
                <div className="bg-white h-5 w-5 flex text-black text-2xl font-semibold rounded-lg mb-1 overflow-hidden">
                    <img src={props.url} alt="T" />
                </div>
                <div className="text-white px-2 font-bold tracking-wide text-xs">
                    {props.name} 
                </div>
            </div>
            <div className="flex justify-end">
                <button className="text-indigo-400 hover:text-indigo-900 px-1">
                    <i className="material-icons md-light md-inactive" style={{fontSize: "15px", margin: "0"}}>description</i>
                </button>
                <button className="text-white hover:text-green-400 px-1" onClick={() => {
                    toggleShowModal(showModal => !showModal) }}>
                    <i className="material-icons md-light md-inactive" style={{fontSize: "15px", margin: "0"}}>chat</i>
                </button>
                <button className="text-indigo-600 hover:text-indigo-300 px-1">
                    <i className="material-icons md-light md-inactive" style={{fontSize: "18px", margin: "0"}}>video_call</i>
                </button>
                {
                    showModal ? 
                    <div className="items-center absolute rounded-lg bg-white mx-1 p-1 py-1" style={customStyle}>
                      <h4 className="font-bold text-xl text-gray-600 text-center mb-1"> Group Chat <br/> {props.name} </h4>
                        <input 
                            placeholder='Send Message'
                            className="w-full shadow appearance-none border rounded py-1 text-gray-900 bg-purple-200"
                        />
                    </div> : <a></a>
                }
            </div>
        </div>
    )
}