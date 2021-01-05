/* eslint-disable no-unused-vars */
import React, { useEffect, useState, useContext } from 'react'

import HomePage from './components/pages/HomePage'
import OrgRegisterPage from './components/pages/Organization/OrgRegisterPage'
import TeamRegisterPage from './components/pages/Teams/TeamRegisterPage'
import RoomProfile from './components/pages/Rooms/RoomProfile'
import TeamProfile from './components/pages/Teams/TeamProfile'
import UserProfile from './components/pages/Users/UserProfile'
import UserUpdate from './components/pages/Users/UserUpdate'
import VideoCall from './components/pages/Video/VideoCall'

import TopBar from './components/widgets/Topbar'
import ToastNotification from './components/widgets/ToastNotification'

import { ToastContainer } from 'react-toastify';
import { loadProgressBar } from 'axios-progress-bar'

import 'axios-progress-bar/dist/nprogress.css'
import { socket_live, events } from './components/sockets'
import { useOvermind } from './overmind'

import {
  HashRouter,
  Switch,
  Route
} from "react-router-dom";

import {AuthContext} from './context/AuthContext'


export default function App() {

  window.require("electron").ipcRenderer.send('resize-normal');

  const { state, actions } = useOvermind();
  const { authData, setAuthData } = useContext(AuthContext);

  useEffect(() => {
      if(state.error && state.error.message){
        
        if(process && process.env.NODE_ENV == 'development') {
          console.log(state.error);
        }

        actions.auth.logOut({setAuthData: setAuthData}).then(() => {
            window.require("electron").ipcRenderer.send('logout');
        });
      }

    }, [actions, state.error])

  useEffect(
    () => {

      loadProgressBar()
      let interval = 0;
      let onlineInterval = 0;

      // Some User is Online
      socket_live.on(events.online, (user_id) => {

        actions.app.addOnlineUser(user_id);
      });

      socket_live.on(events.activeWindowUpdate, (data) => {
        actions.app.updateUserActiveWindowData(data);
      });

      socket_live.on(events.userVideoCall, (data) => {
        actions.app.userVideoCall(data);
      });
   
      interval = setInterval(() => {
          // Emit User is online.
          socket_live.emit(events.online, state.userProfileData.id)
      }, 3000)

    }, [authData]
  );

  return (
    <HashRouter>
      <TopBar />
      <Switch>
        <Route exact path="/">
          <HomePage />
        </Route>
        <Route exact path="/add-team">
          <TeamRegisterPage />
        </Route>
        <Route exact path="/team-profile">
          <TeamProfile />
        </Route>
        <Route exact path="/user-profile">
          <UserProfile />
        </Route>
        <Route exact path="/room-profile">
          <RoomProfile />
        </Route>
        <Route exact path="/user-update">
          <UserUpdate />
        </Route>
        <Route exact path="/videocall">
          <VideoCall />
        </Route>
        <Route exact path="/add-org">
          <OrgRegisterPage />
        </Route>
      </Switch>
      <ToastContainer />
    </HashRouter>
  );
}