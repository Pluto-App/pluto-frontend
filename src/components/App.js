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

import {
  BrowserRouter as Router,
  Switch,
  Route
} from "react-router-dom";

const App = () => {

  useEffect(
    () => {

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

        // TODO Populate Online Users list based on this, 

        return () => {
            ToastNotification('error', "App Unmount")
        }
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
      </Switch>
      <ToastContainer />
    </Router>
  );
}

export default App;