/* eslint-disable no-unused-vars */
import React, { useEffect, useState, useContext } from 'react';

import HomePage from './components/pages/HomePage';
import TeamRegisterPage from './components/pages/Teams/TeamRegisterPage';
import Settings from './components/pages/Settings';

import VideoCall from './components/windows/videocall/VideoCall';

import InitScreenShare from './components/windows/screenshare/InitScreenShare';
import StreamScreenShare from './components/windows/screenshare/StreamScreenShare';
import ScreenShareContainer from './components/widgets/ScreenShareContainer';
import ScreenShareControls from './components/windows/screenshare/ScreenShareControls';
import PermissionRequestWindow from './components/windows/PermissionRequestWindow/PermissionRequestWindow';
import InitWindowShare from './components/windows/windowshare/InitWindowShare';
import WindowShareContainer from './components/widgets/WindowShareContainer';
import StreamWindowShare from './components/windows/windowshare/StreamWindowShare';

import TopBar from './components/widgets/Topbar';
import ToastNotification from './components/widgets/ToastNotification';

import { ToastContainer } from 'react-toastify';
import { loadProgressBar } from 'axios-progress-bar';

import 'axios-progress-bar/dist/nprogress.css';
import { socket_live, events } from './components/sockets';
import { useOvermind } from './overmind';

import { HashRouter, Switch, Route } from 'react-router-dom';

import { AuthContext } from './context/AuthContext';

import useSound from 'use-sound';

import receiveCallSound from './assets/sounds/receive_call.wav';

const { remote, ipcRenderer } = window.require('electron');
export default function App() {
  const { state, actions } = useOvermind();
  const { authData, setAuthData } = useContext(AuthContext);
  const [ playReceiveCallSound ] = useSound(receiveCallSound);
  var currentWindow = remote.getCurrentWindow();

  useEffect(() => {
    if (state.error && state.error.message) {
      if (process && process.env.NODE_ENV === 'development') {
        alert(state.error);
        console.log(state.error);
      }
    }
  }, [state.error]);

  useEffect(() => {
    loadProgressBar();

    const logout = () => {
      actions.auth.logOut({ setAuthData: setAuthData }).then(() => {
        socket_live.emit(events.offline, state.userProfileData);
        ipcRenderer.send('resize-login');
      });
    };

    ipcRenderer.on('logout', function (e, args) {
      logout();
    });

    const setActiveWin = setInterval(async () => {
      try {
        const activeWinAppData = await ipcRenderer.sendSync('active-win');
        actions.app.setActiveWinInfo(activeWinAppData);
      } catch (error) {
        if (process.env.REACT_APP_DEV_BUILD) console.log(error);
      }
    }, 3000);

    socket_live.on(events.online, (user_id) => {
      if (
        state.teamMembersMap &&
        state.teamMembersMap[user_id] &&
        !state.teamMembersMap[user_id].online
      ) {
        actions.app.setUserOnline(user_id);
      }
    });

    socket_live.on(events.offline, (user_id) => {
      if (
        state.teamMembersMap &&
        state.teamMembersMap[user_id] &&
        state.teamMembersMap[user_id].online
      ) {
        actions.app.setUserOffline(user_id);
        actions.app.updateUserActiveWindowData({
          user_id: user_id,
          active_window_data: {},
        });
      }
    });

    socket_live.on(events.activeWindowUpdate, (data) => {
      actions.app.updateUserActiveWindowData(data);
    });

    socket_live.on(events.userVideoCall, (data) => {
        console.log(data);
      playReceiveCallSound();
      actions.app.userVideoCall(data);
    });

    socket_live.on(events.viewScreenShare, (data) => {
      actions.app.updateScreenShareViewers(data);
    });

    socket_live.on(events.updateTeam, (data) => {
      if (data.tid === state.currentTeam.tid) {
        setTimeout(() => {
          actions.team.getTeam({
            authData: authData,
            team_id: state.currentTeam.id,
          });
        }, 500);
      }
    });

    socket_live.on(events.updateTeamMembers, (data) => {
      if (data.tid === state.currentTeam.tid) {
        actions.user.getTeamMembers({
          authData: authData,
          team_id: state.currentTeam.id,
        });
      }
    });

    socket_live.on(events.updateTeamRooms, (data) => {
      if (data.tid === state.currentTeam.tid) {
        actions.room.getTeamRooms({
          authData: authData,
          team_id: state.currentTeam.id,
        });
      }
    });

    return () => {
      socket_live.removeAllListeners();
      clearInterval(setActiveWin);
    };
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      socket_live.emit(events.online, state.userProfileData);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <HashRouter>
      <Switch>
        <Route exact path="/init-screenshare">
          <InitScreenShare />
        </Route>

        <Route exact path="/init-windowshare">
          <InitWindowShare />
        </Route>

        <Route exact path="/stream-windowshare">
          <StreamWindowShare />
        </Route>

        <Route exact path="/screenshare-container">
          <ScreenShareContainer />
        </Route>

        <Route exact path="/windowshare-container">
          <WindowShareContainer />
        </Route>

        <Route exact path="/screenshare-controls">
          <ScreenShareControls />
        </Route>

        <Route exact path="/settings">
          <Settings />
          <ToastContainer />
        </Route>

        <Route exact path="/permissions">
          <PermissionRequestWindow />
        </Route>

        <Route path="*">
          <TopBar />
          <Switch>
            <Route exact path="/">
              <HomePage />
            </Route>
            <Route exact path="/add-team">
              <TeamRegisterPage />
            </Route>
            <Route exact path="/video-call">
              <VideoCall />
            </Route>
          </Switch>
          <ToastContainer />
        </Route>
      </Switch>
    </HashRouter>
  );
}
