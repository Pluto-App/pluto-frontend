import React from 'react'

export default function Sidebar() {
    return (
        <div class="w-15 bg-gray-900 text-white border-r border-blackblack fixed min-h-screen ">
            <div class="sidebar-icons">
                <a href="/home" className="sidebar-icon flex items-center text-grey  px-2 py-2 no-underline cursor-pointer hover:bg-grey-darker">
                    <div class="bg-white h-8 w-8 flex items-center justify-center text-black text-2xl font-semibold rounded-lg mb-1 overflow-hidden">
                        <img src="https://api.adorable.io/avatars/285/abott@adorable1.png" alt="" />
                    </div>
                </a>
                <a href="/home" className="sidebar-icon flex items-center text-grey  px-2 py-2 no-underline cursor-pointer hover:bg-grey-darker">
                    <div class="bg-white h-8 w-8 flex items-center justify-center text-black text-2xl font-semibold rounded-lg mb-1 overflow-hidden">
                        <img src="https://api.adorable.io/avatars/285/abott@adorable.png" alt="" />
                    </div>
                </a>
                <a href="/new-company" class="sidebar-icon flex items-center text-grey  px-2 py-2 no-underline cursor-pointer hover:bg-grey-darker">
                    <div class="bg-white h-8 w-8 flex items-center justify-center text-black text-2xl font-semibold rounded-lg mb-1 overflow-hidden">
                        <i class="material-icons">add</i>
                    </div>
                </a>
            </div>
        </div>
    )
}