
import React, { useEffect, useState } from 'react'
import { useOvermind } from '../../../overmind'
import { useHistory } from "react-router-dom"

export default function RoomListItem(props) {

    let history = useHistory();

    const { state, actions, effects, reaction } = useOvermind();

    const [showModal, toggleShowModal] = useState(false);
    const [startedEditing, updateEditSataus] = useState(false);
    const [editText, updateEditText] = useState(props.name);

    const clickFunc = (e) => {
        updateEditSataus(startedEditing => !startedEditing)
    }

    const customStyle = {
        "top": "65%",
        "width": "100%"
    }

    const handleVideoCall = (e, id) => {
        //load video call window. 
        // window.require("electron").ipcRenderer.send('load-video-window', id);
    }
    
    return (
        <div>
            {
                startedEditing ? 
                    <div className="flex justify-center items-center hover:bg-gray-800" 
                    onDoubleClick={(e) => {
                        e.preventDefault();
                        clickFunc()
                    }}>
                        <input className="shadow appearance-none border rounded w-full py-1 px-5 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" 
                            style={{ width:"80%" }}
                            onMouseOver={(e) => {
                                e.preventDefault()
                                e.target.select()
                            }}
                            onChange={(e) => 
                                updateEditText(e.target.value)
                            }
                            onKeyPress={(e) => {
                                if(e.keyCode === 13 || e.which === 13) {
                                    e.target.value === '' ? alert("Text Cant be Empty !") : updateEditSataus(false)
                                    updateEditText(e.target.value)
                                    // TODO Trigger Name Edit to database via backend
                                } 
                            }}
                            type="text" 
                            value={editText}
                        />
                    </div>  
                :
                    <div className="flex py-0 justify-between p-1 hover:bg-gray-800" id={props.id} onDoubleClick={(e) => {
                        e.preventDefault();
                        clickFunc()
                    }}>
                        <div className="flex justify-start p-2">
                            <div className="flex text-gray-500 font-semibold rounded-lg overflow-hidden">
                                <i className="material-icons md-light md-inactive hover:text-indigo-400" style={{fontSize: "20px", margin: "0"}}>volume_up</i>
                            </div>
                            <div className="text-white px-2 font-bold tracking-wide text-xs">
                                {editText} 
                            </div>
                        </div>
                        <div className="flex justify-end">
                            <button className="text-gray-300 hover:text-indigo-500 px-1">
                                <i className="material-icons md-light md-inactive" style={{fontSize: "15px", margin: "0"}}>notes</i>
                            </button>
                            <button className="text-gray-300 hover:text-indigo-500 px-1" onClick={() => {
                                toggleShowModal(showModal => !showModal) }}>
                                <i className="material-icons md-light md-inactive" style={{fontSize: "15px", margin: "0"}}>question_answer</i>
                            </button>
                            <button className="text-gray-300 hover:text-indigo-500 px-1">
                                <i className="material-icons md-light md-inactive" onClick={(e) => {
                                    e.preventDefault();
                                    handleVideoCall(e, props.id)
                                }} style={{fontSize: "18px", margin: "0"}}>video_call</i>
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
            }
        </div>
    )
}