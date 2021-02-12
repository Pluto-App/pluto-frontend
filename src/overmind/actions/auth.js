
import { googleSignIn } from '../../auth/authhandle'
import ToastNotification from '../../components/widgets/ToastNotification'

export const googleLogin = async ({state, effects}, {setAuthData}) => {

    try {

        state.userProfileData = await googleSignIn();

        var loginData = await effects.auth.googleLogin(state.userProfileData);

        localStorage.setItem('currentUser', JSON.stringify(loginData));
        state.userProfileData = loginData.user;

        window.require("electron").ipcRenderer.send('resize-normal');
        setAuthData(loginData);

    } catch (error){
        
        state.error = error;
    }
}

export const logOut = async ({state, effects}, {setAuthData}) => {

    localStorage.clear();

    setAuthData({});
}


