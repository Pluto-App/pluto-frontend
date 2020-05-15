import React, { useEffect, useState } from 'react'
import LoginPage from './pages/LoginPage'
import HomePage from './pages/HomePage'
import TopBar from './widgets/Topbar'
import TeamRegisterPage from './pages/Teams/TeamRegisterPage'
import RoomProfile from './pages/Rooms/RoomProfile'
import TeamProfile from './pages/Teams/TeamProfile'
import UserProfile from './pages/Users/UserProfile'
import UserUpdate from './pages/Users/UserUpdate'
import { ToastContainer } from 'react-toastify';
import ToastNotification from './widgets/ToastNotification'
import { socket_live, events } from './sockets'
import { useOvermind } from '../overmind'

import {
  BrowserRouter as Router,
  Switch,
  Route
} from "react-router-dom";

const App = () => {

  const { state, actions } = useOvermind();

  useEffect(
    () => {

      let interval = 0;
      // Check and emit liveness
      socket_live.on(events.live, data => {
        ToastNotification('info', data.message)
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
      // or switches team, we show who joined 
      // in.
      socket_live.on(events.team_switch, (data) => {
        ToastNotification('info', data.message)
      })

      // When a new team is created, users of the app
      // are notified. 
      socket_live.on(events.new_team, (data) => {
        ToastNotification('success', data.message)
      })

      socket_live.on(events.online, (data) => {
        // TODO Add users to set here.
      })

      socket_live.on(events.offline, (data) => {
        // TODO Delete users from set if already 
        // present in online list. 
      })

      socket_live.on('disconnect', () => {
        ToastNotification('error', 'Socket disconnect')
      })

      if (interval) {
        clearInterval(interval);
      }

      // Emit online event
      interval = setInterval(() => {
        let data = {
          userid: state.userProfileData.userid,
          username: state.userProfileData.username,
          useremail: state.userProfileData.useremail,
          avatar: state.userProfileData.avatar
        }
        socket_live.emit(events.online, data)
      }, 10000)

      return () => {
        ToastNotification('error', "App Unmount");
        clearInterval(interval);
      }
    }
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
      </Switch>
      <ToastContainer />
    </Router>
  );
}

export default App;