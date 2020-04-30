import { postHandler } from '../custom/customHandlers'
import { state } from '../overmind/state'
import { signInWithPopup, fetchAccessTokens, fetchGoogleProfile } from "./signInPopup";

export const googleSignIn = async () => {
  const code = await signInWithPopup()
  const tokens = await fetchAccessTokens(code)
  const {id, email, name} = await fetchGoogleProfile(tokens.access_token)
  state.providerUser = {
    id: id,
    email: email,
    name: name,
    idToken: tokens.id_token,
  }
  return await postHandler(state.loginUrl, state.providerUser)
}