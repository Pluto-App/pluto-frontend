import { hot } from 'react-hot-loader/root';
import * as React from 'react'
import { render } from 'react-dom'
import { createOvermind } from 'overmind'
import { Provider } from 'overmind-react'
import { config } from './overmind'

import './styles/tailwind.css';
import './assets/fonts/css/icons.css'
import App from './App';

import {AppProviders} from './context'

const overmind = createOvermind(config, {
  devtools: true 
  // defaults to 'localhost:3031'
})

const NewOverMind = hot(overmind)

render(
	<AppProviders>
		<App />
	</AppProviders>,
  	document.getElementById('root')
);
