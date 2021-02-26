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

// const isOnline = require('is-online');

export default function App() {

  const { state, actions } = useOvermind();

  useEffect(() => {

    if(state.error && state.error.message){

      if(process.env.NODE_ENV === 'development') {
        console.log(state.error);
      } 

      if(process.env.REACT_APP_DEV_BUILD === 'true') {
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

      // onlineInterval = setInterval(async () => {

      //   var isAppConnected = await isOnline();

      //   if (!isAppConnected && state.online) {
      //     actions.app.setAppOnlineStatus(false);
      //     ToastNotification('error', 'You are Offline 😢',{autoClose: false});

      //   } else if(isAppConnected && !(state.online)) {
      //     actions.app.setAppOnlineStatus(true);
      //     actions.app.clearNotifications();
      //     ToastNotification('success', 'You are now Online');
      //   }
      // }, 2000)


  },[]);

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