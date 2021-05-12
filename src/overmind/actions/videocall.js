
export const getCurrentWindowShares = async ({state, effects}, {authData, callChannelId}) => {

    var windowShares = await effects.videocall.getCurrentWindowShares(authData, callChannelId)

    return windowShares;
}