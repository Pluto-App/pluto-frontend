
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL; 

function headers(token) {

  return { 'Content-Type': 'application/json', 'Authorization': 'Bearer '+token }
}

export const getCurrentWindowShares = async (authData, callChannelId) => {

  const token = authData.token;

    return fetch(

      BACKEND_URL + "/videocall/windowshares/"+callChannelId,
      {
          method: 'GET', 
          headers: headers(token)
      }
    )
    .then(response => response.json())
    .then(responseData => {
      return responseData;
    })
    .catch((error) => {
        // Error handling
    });
}