
import { googleSignIn } from '../../auth/authhandle'
import ToastNotification from '../../components/widgets/ToastNotification'

export const googleLogin = async ({state, effects}, {setAuthData}) => {

  	state.loginStarted = true;
    ToastNotification('info', "Logging In...🚀");

    try {

        state.userProfileData = await googleSignIn();

        var loginData = await effects.auth.googleLogin(state.userProfileData);

        localStorage.setItem('currentUser', JSON.stringify(loginData));
        state.userProfileData = loginData.user;

        state.userProfileData.addStatus = loginData.addStatus || 0
        state.teamowner = state.userProfileData.username
        state.loggedIn = true
        state.signedUp = true;

        window.require("electron").ipcRenderer.send('resize-normal');
        setAuthData(loginData);

    } catch (error){
        
        state.error = error;
    }

    state.loginStarted = false;
}

export const logOut = async ({state, effects}, {setAuthData}) => {

    ToastNotification('info', "Logging Out...🚀");

    localStorage.clear();

    state.loggedOut = true
    state.signedUp = true;
    state.loginStarted = false;

    setAuthData({});
}


