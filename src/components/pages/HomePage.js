import React from 'react'
import Sidebar from '../widgets/Sidebar'

export default function HomePage() {
    return (
        <div className="w-full flex">
            <Sidebar></Sidebar>
            <div class="w-full bg-gray-900 ml-15 flex-1 text-white" style={{height: "calc(100vh - 30px)"}}>

            </div>
        </div>
    )
}
