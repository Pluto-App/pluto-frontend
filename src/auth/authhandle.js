import { signInWithPopup, fetchAccessTokens, fetchGoogleProfile } from "./signInPopup";

/**
 * @param none
 * Auth handler for google Sign-in
 * Returns an Object with 
 *     userid: id,
 *     useremail: email,
 *     username: name,
 *     avatar: picture,
 *     idToken: tokens.id_token
 */

export const googleSignIn = async () => {
  const code = await signInWithPopup()
  const tokens = await fetchAccessTokens(code)
  const { id, email, name, picture } = await fetchGoogleProfile(tokens.access_token)
  const providerUser = {
    userid: id,
    useremail: email,
    username: name,
    avatar: picture,
    idToken: tokens.id_token
  }
  return providerUser
}