import { hot } from 'react-hot-loader';
import * as React from 'react'
import { render } from 'react-dom'
import { createOvermind } from 'overmind'
import { Provider } from 'overmind-react'
import { config } from './overmind'

import './styles/tailwind.css';
import './assets/fonts/css/icons.css'
import App from './components/App';

const overmind = createOvermind(config, {
  devtools: "http://127.0.0.1:5000"
})

const NewOverMind = hot(module)(overmind)
const NewApp = hot(module)(App)

render(
  <Provider value={NewOverMind}>
    <NewApp />
  </Provider> , 
  document.getElementById('root')
);
