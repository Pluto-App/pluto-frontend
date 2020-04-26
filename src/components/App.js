import * as React from 'react'
import { useOvermind } from '../overmind'
import LoginPage from './pages/LoginPage'
import HomePage from './pages/HomePage'
import TopBar from './topBar'
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link
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
      </Switch>
      
    </Router>
  );
}

export default App;
