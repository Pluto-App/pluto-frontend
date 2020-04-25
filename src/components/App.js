import * as React from 'react'
import { useOvermind } from '../overmind'
import LoginPage from './loginPageComponent'
import TopBar from './topBarComponent'

const App = () => {
  
  const { state, actions, effects, reaction } = useOvermind()

  return (
    <div className="App">
      <TopBar />
      <LoginPage />
    </div>
  );
}

export default App;
