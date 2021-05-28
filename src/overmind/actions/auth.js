
import { googleSignIn } from '../../auth/authhandle'
import ToastNotification from '../../components/widgets/ToastNotification'

const { ipcRenderer } = window.require('electron');

export const googleLogin = async ({state, effects}, {setAuthData}) => {

    try {

        state.userProfileData = await googleSignIn();

        var loginData = await effects.auth.googleLogin(state.userProfileData);
        
        if(loginData.user){
            localStorage.setItem('currentUser', JSON.stringify(loginData));
            state.userProfileData = loginData.user;

            ipcRenderer.send('resize-normal');
            setAuthData(loginData);    
        
        } else {
            throw(new Error('Login Failed! Please try again..'));
        }
        
    } catch (error){
        
        state.error = error;
        ToastNotification('error', error);
    }
}

export const loginViaCode = async ({state, effects}, {userData, setAuthData}) => {

    try {

        var loginData = await effects.auth.loginViaCode(userData);

        if(loginData.user){
            localStorage.setItem('currentUser', JSON.stringify(loginData));
            state.userProfileData = loginData.user;

            ipcRenderer.send('resize-normal');
            setAuthData(loginData);    
        
        } else {
            throw(new Error('Login Failed! Please try again..'));
        }
        
    } catch (error){
        
        state.error = error;
        ToastNotification('error', error);
    }
}

export const logOut = async ({state, effects}, {setAuthData}) => {

    localStorage.clear();
    state.currentUser = {};
    state.currentTeam = {};
    setAuthData({});
}

export const getAgoraAccessToken = async ({state, effects}, {requestParams}) => {

    try {

        var agoraAccessToken = await effects.auth.getAgoraAccessToken(requestParams);
        return agoraAccessToken.token;
      
        
    } catch (error){
        
        state.error = error;
        ToastNotification('error', error);
    }
}


