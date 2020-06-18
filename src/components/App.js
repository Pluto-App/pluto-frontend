import React, { useEffect, useState } from 'react'
import LoginPage from './pages/LoginPage'
import HomePage from './pages/HomePage'
import TopBar from './widgets/Topbar'
import TeamRegisterPage from './pages/Teams/TeamRegisterPage'
import RoomProfile from './pages/Rooms/RoomProfile'
import TeamProfile from './pages/Teams/TeamProfile'
import UserProfile from './pages/Users/UserProfile'
import UserUpdate from './pages/Users/UserUpdate'
import VideoCall from './pages/Video/VideoCall'
import { ToastContainer } from 'react-toastify';
import ToastNotification from './widgets/ToastNotification'
import { socket_live, events } from './sockets'
import { useOvermind } from '../overmind'

import {
  HashRouter as Router,
  Switch,
  Route
} from "react-router-dom";

const App = () => {

  const { state, actions } = useOvermind();
  const [OnlMem, updateOnlMem] = useState(new Set())

  useEffect(
    () => {

      let interval = 0;

      // Check and emit liveness
      socket_live.on(events.ping, () => {
        socket_live.emit(events.pong, state.userProfileData.userid)
      });

      // Welcome Message when you join a new room. 
      socket_live.on(events.room_welcome, (data) => {
        ToastNotification('info', data.message)
      })

      // New notification telling that a user joined the room
      // you are a part of.
      socket_live.on(events.user_join, (data) => {
        ToastNotification('success', data.message)
      })

      // Others in the team get notified that you switched rooms. 
      // You recieve only a welcome message
      socket_live.on(events.room_switch, (data) => {
        ToastNotification('info', data.message)
      })

      // Someone created a new room .
      // Name of the new room notified
      // to all members of the room.
      socket_live.on(events.new_room, (data) => {
        ToastNotification('info', data.message)
      })

      // Someone deleted an existing room .
      // Name of the new room notified
      // to all members of the room.
      socket_live.on(events.remove_room, (data) => {
        ToastNotification('error', data.message)
      })

      // When a new person joins a team 
      // or switches team, we show who joined in.
      socket_live.on(events.team_switch, (data) => {
        ToastNotification('info', data.message)
      })

      // When a new team is created, 
      // users of the app are notified. 
      socket_live.on(events.new_team, (data) => {
        ToastNotification('success', data.message)
      })

      // Some User is Online
      socket_live.on(events.online, (data) => {
        const newOnlMemSet = new Set(OnlMem)
        newOnlMemSet.add(data)
        updateOnlMem(newOnlMemSet)
        actions.updateOnlineMembersList(OnlMem)
      })

      // Some User is Offline
      socket_live.on(events.offline, (data) => {
        const newOnlMemSet = new Set(OnlMem)
        newOnlMemSet.delete(data)
        updateOnlMem(newOnlMemSet)
        actions.updateOnlineMembersList(OnlMem)
      })

      socket_live.on('disconnect', () => {
        ToastNotification('error', 'Socket disconnect')
      })

      if (interval) {
        clearInterval(interval);
      }

      interval = setInterval(() => {
        if (state.loggedIn)
          // Emit User is online.
          socket_live.emit(events.online, state.userProfileData.userid)
      }, 10000)

      return () => {
        ToastNotification('error', "App Unmount");
        clearInterval(interval);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []
  );

  return (
    <Router>
      <TopBar />
      <Switch>
        <Route exact path="/">
          <LoginPage />
        </Route>
        <Route exact path="/home">
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
      </Switch>
      <ToastContainer />
    </Router>
  );
}

export default App;