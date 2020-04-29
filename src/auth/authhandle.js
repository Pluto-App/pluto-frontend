import { mySignInFunction } from './customSignIn'
import { signInWithPopup, fetchAccessTokens, fetchGoogleProfile } from "./signInPopup";

export const googleSignIn = async () => {
  const code = await signInWithPopup()
  const tokens = await fetchAccessTokens(code)
  const {id, email, name} = await fetchGoogleProfile(tokens.access_token)
  const providerUser = {
    id: id,
    email: email,
    name: name,
    // idToken: tokens.id_token,
  }
  return await mySignInFunction(providerUser)
}