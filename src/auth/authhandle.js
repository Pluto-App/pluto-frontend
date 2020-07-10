import { signInWithPopup, fetchAccessTokens, fetchGoogleProfile } from "./signInPopup";
import md5 from 'md5';

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
    // Donot send Google ID Directly.
    userid: md5(id),
    useremail: email,
    username: name,
    avatar: picture,
    idToken: tokens.id_token
  }
  return providerUser
}