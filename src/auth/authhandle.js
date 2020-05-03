import { signInWithPopup, fetchAccessTokens, fetchGoogleProfile } from "./signInPopup";

export const googleSignIn = async () => {
  const code = await signInWithPopup()
  const tokens = await fetchAccessTokens(code)
  const {id, email, name, picture} = await fetchGoogleProfile(tokens.access_token)
  const providerUser = {
    userid: id,
    useremail: email,
    username: name,
    profilePictureUrl: picture,
    idToken: tokens.id_token,
  }
  return providerUser
}