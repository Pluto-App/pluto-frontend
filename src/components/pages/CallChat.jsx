/* eslint-disable no-unused-vars */
import React, { useEffect, useState, useContext } from 'react'
import { useOvermind } from '../../overmind'
import { useHistory } from "react-router-dom"
import ToastNotification from '../widgets/ToastNotification';

import { supportedApps } from '../../utils/AppLogo';

import {AuthContext} from '../../context/AuthContext'

const os = window.require('os');
const { remote } = window.require('electron');

const CallChat = React.memo(() => {

    let history = useHistory();
    const supportedAppsList = supportedApps();

    const isWindows = os.platform() === 'win32';
    const isMac = os.platform() === "darwin";

    const { authData, setAuthData } = useContext(AuthContext);

    const { state, actions } = useOvermind();



    const close = () => {
        var win = remote.getCurrentWindow();
        win.destroy();
    }


    const containerStyle = {
        background: '#2F3136',
        height: 'calc(100vh - 0px)'
    }

    return (
        <div className="w-full flex" style={containerStyle}>
        </div>
    )
})

export default CallChat;
