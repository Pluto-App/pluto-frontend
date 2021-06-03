// process.env['NODE_' + 'ENV'] = process.env.NODE_ENV

import * as React from 'react';
import { render } from 'react-dom';
import { createOvermind } from 'overmind';
import { ThemeProvider } from 'styled-components';
import { hot } from 'react-hot-loader/root';

import './styles/tailwind.css';
import './styles/index.css';
import './assets/fonts/css/icons.css';

import App from './App';
import { config } from './overmind';
import { AppProviders } from './context';
import { lightTheme } from './themes';

const overmind = createOvermind(config);
const theme = lightTheme;
hot(overmind);

render(
  <AppProviders>
    <ThemeProvider theme={theme}>
      <App />
    </ThemeProvider>
  </AppProviders>,
  document.getElementById('root')
);
