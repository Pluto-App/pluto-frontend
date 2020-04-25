import * as React from 'react'
import { render } from 'react-dom'
import { createOvermind } from 'overmind'
import { Provider } from 'overmind-react'
import { config } from './overmind'

import './styles/tailwind.css';
import './assets/fonts/css/icons.css'
import App from './components/App';

const overmind = createOvermind(config)

render(
  <Provider value={overmind}>
    <App />
  </Provider> , 
  document.getElementById('root')
);
