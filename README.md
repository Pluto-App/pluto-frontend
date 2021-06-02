![Build/release Mac OSX Latest](https://github.com/Pluto-App/plutoapp-new-frontend/workflows/Build/release%20Mac%20OSX%20Latest/badge.svg?branch=master)

## Available Scripts

### `npm run local`

Local electron app starts with backend connection to `localhost`.

### `npm run dev`

Local electron app starts with backend connection to `dev` backend.

### `npm run prod`

Local electron app starts with backend connection to `prod` backend.

## Building the app

> To build the app you'll have to
>
> 1. build the code
> 2. bundle the app

### `npm run prod-build`

Builds the app for production to the `build` folder.<br />
It correctly bundles React in production mode and optimizes the build for the best performance.

### `npm run dev-build`

Builds the dev version of the app

### `npm run windows`

First build the app with `npm run build` and then run this command for building for `Windows`.

### `npm run mac`

First build the app with `npm run build` and then run this command for building for `Mac`.

### `npm run windows-release`

Releases the app on github for windows

### `npm run mac-release`

Releases the app on github for mac

### Troubleshooting

If you need to revoke media permission for the app you can use following commands:

```bash
# MediaType are following
# For camera: Camera
# For mic: Microphone
# For screen: ScreenCapture

# command to get bundle-id
lsappinfo info -only bundleId <APP-NAME>

# command to revoke permission
tccutil reset <MediaType> <bundleId>

#Command to revoke app all media permission while developing with different Terminal:
#iTerm2:
tccutil reset Camera  com.googlecode.iterm2 && tccutil reset Microphone  com.googlecode.iterm2 && tccutil reset ScreenCapture  com.googlecode.iterm2
#Terminal:
tccutil reset Camera  com.apple.Terminal && tccutil reset Microphone  com.apple.Terminal && tccutil reset ScreenCapture  com.apple.Terminal
```
