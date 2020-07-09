![Build/release Mac OSX Latest](https://github.com/Pluto-App/plutoapp-new-frontend/workflows/Build/release%20Mac%20OSX%20Latest/badge.svg?branch=master)

## Available Scripts

```Yarn``` is also available.

In the project directory, you can run:

### `npm install`

Installs all ```npm``` packages needed for development.

### `npm start`

Runs the app in the development mode.<br />
Opens as ```electron``` app. 

The page will reload if you make edits.<br />
You will also see any lint errors in the console.

### `npm run start-local`

Local electron app starts with backend connection to ```localhost```. 

### `npm run start-prod`

Local electron app starts with backend connection to ```heroku``` backend. 

### `npm run build`

Builds the app for production to the `build` folder.<br />
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br />
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

Post-install on ```npm install``` build some ```electron``` modules. You might need ```node-gyp``` for that.

### `npm run win-release`

First build the app with ```npm run build``` and then run this command for building for ```Windows```.

### `npm run mac-release`

First build the app with ```npm run build``` and then run this command for building for ```Mac```.

### `npm run linux-release`

First build the app with ```npm run build``` and then run this command for building for ```Ubuntu```.

### Code Splitting

This section has moved here: https://facebook.github.io/create-react-app/docs/code-splitting

### Analyzing the Bundle Size

This section has moved here: https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size

### Advanced Configuration

This section has moved here: https://facebook.github.io/create-react-app/docs/advanced-configuration
