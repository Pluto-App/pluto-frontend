import { hot } from 'react-hot-loader';
import * as React from 'react'
import { useOvermind } from '../overmind'
import LoginPage from './pages/LoginPage'
import HomePage from './pages/HomePage'
import TopBar from './widgets/Topbar'
import TeamRegisterPage from './pages/Teams/TeamRegisterPage'
import TeamProfile from './pages/Teams/TeamProfile'
import UserProfile from './pages/Users/UserProfile'

import {
  BrowserRouter as Router,
  Switch,
  Route
} from "react-router-dom";

const App = () => {
  
  const { state, actions, effects, reaction } = useOvermind()

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
      </Switch>
      
    </Router>
  );
}

export default hot(module)(App);
