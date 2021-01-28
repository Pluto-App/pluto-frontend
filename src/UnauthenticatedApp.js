/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from 'react'

import LoginPage from './components/pages/LoginPage'
import TopBar from './components/widgets/Topbar'

import ToastNotification from './components/widgets/ToastNotification'

import { ToastContainer } from 'react-toastify';
import { loadProgressBar } from 'axios-progress-bar'
import 'axios-progress-bar/dist/nprogress.css'
import { socket_live, events } from './components/sockets'
import { useOvermind } from './overmind'

import {
  HashRouter as Router,
  Switch,
  Route
} from "react-router-dom";

const isOnline = require('is-online');

export default function App() {

  const { state, actions } = useOvermind();

  useEffect(() => {

    if(state.error && state.error.message){

      if(process.env.NODE_ENV == 'development') {
        console.log(state.error);
      } 

      if(process.env.REACT_APP_DEV_BUILD == 'true') {
        console.log('alert!');
        alert(state.error.stack);
      }

      actions.app.clearNotifications();
      ToastNotification('error', 'Something Went Wrong! Try again or Contact Support.',{autoClose: false});
    }

  }, [actions, state.error])

  useEffect(
    () => {

      loadProgressBar()
      let interval = 0;
      let onlineInterval = 0;
      // Check and emit liveness
      // socket_live.on(events.ping, () => {
      //   socket_live.emit(events.pong, state.userProfileData.userid)
      // });

      // // Welcome Message when you join a new room. 
      // socket_live.on(events.room_welcome, (data) => {
      //   ToastNotification('info', data.message)
      // })

      // // FIXME Hello Broadcast to all in a room (if any)
      // socket_live.on(events.room_broadcast, (data) => {
      //   ToastNotification('success', data.message)
      // })

      // // New notification telling that a user joined 
      // // the room you are a part of currently.
      // socket_live.on(events.user_join, (data) => {
      //   // TODO Handle new user join. Add user to list.
      //   actions.updateRoomOfMember({
      //     userid: data.userinfo.userid,
      //     roomid: data.userinfo.roomid,
      //   })
      //   ToastNotification('success', data.message)
      // })

      // // Others in the team get notified that you switched rooms. 
      // // You recieve only a welcome message
      // socket_live.on(events.room_switch, (data) => {
      //   // TODO Add new User to room as per roomId. 
      //   // data.userinfo => Contains user info. 
      //   actions.updateRoomOfMember({
      //     userid: data.userinfo.userid,
      //     roomid: data.userinfo.roomid,
      //   })
      //   ToastNotification('info', data.message)
      // })

      // // Someone created a new room .
      // // Name of the new room notified
      // // to all members of the room.
      // socket_live.on(events.new_room, (data) => {
      //   actions.addNewEmitRoom(data)
      //   ToastNotification('info', data.message)
      // })

      // // Someone deleted an existing room .
      // // Name of the new room notified
      // // to all members of the room.
      // socket_live.on(events.remove_room, (data) => {
      //   ToastNotification('error', data.message)
      // })

      // // When a new person joins a team 
      // // or switches team, we show who joined in.
      // socket_live.on(events.team_switch, (data) => {
      //   // TODO Update Status of User in the team here. User switched team. 
      //   actions.updateTeamOfMember({
      //     userid: data.userinfo.userid,
      //     teamid: data.userinfo.teamid,
      //   })
      //   ToastNotification('success', `${data.message} 🤝`)
      // })

      // // When a new team is created, 
      // // users of the app are notified. 
      // socket_live.on(events.new_team, (data) => {
      //   ToastNotification('success', data.message)
      // })

      // socket_live.on(events.new_team_mate, async (data) => {
      //   await actions.addNewTeamMember(data);
      //   ToastNotification('success', data.message)
      // })

      // // Some User is Online
      // socket_live.on(events.online, (data) => {
      //   // FIXME Update Status of User Online ?
      //   actions.updateStatusColor({
      //     userid: data,
      //     statusColor: 'green'
      //   })
      // })

      // // Some User is Offline
      // socket_live.on(events.offline, (data) => {
      //   // FIXME Update Status of User Offline ?
      //   actions.updateStatusColor({
      //     userid: data,
      //     statusColor: 'gray'
      //   })
      // })

      // socket_live.on('disconnect', () => {
      //   ToastNotification('error', 'Socket disconnect')
      // })

      // if (interval) {
      //   clearInterval(interval);
      //   clearInterval(onlineInterval)
      // }

      // interval = setInterval(() => {
      //   //if (state.loggedIn)
      //     // Emit User is online.
      //     // socket_live.emit(events.online, state.userProfileData.userid)
      // }, 6000)

      onlineInterval = setInterval(async () => {

        var isAppConnected = await isOnline();

        if (!isAppConnected && state.online) {
          actions.app.setAppOnlineStatus(false);
          ToastNotification('error', 'You are Offline 😢',{autoClose: false});

        } else if(isAppConnected && !(state.online)) {
          actions.app.setAppOnlineStatus(true);
          actions.app.clearNotifications();
          ToastNotification('success', 'You are now Online');
        }
      }, 2000)

      // return () => {
      //   ToastNotification('error', "App Unmount");
      //   clearInterval(interval);
      //   clearInterval(onlineInterval)
      // }

    }, []
  );

  return (
    <Router>
      <TopBar />
      <Switch>
        <Route exact path="/">
          <LoginPage />
        </Route>
      </Switch>
      <ToastContainer />
    </Router>
  );
}