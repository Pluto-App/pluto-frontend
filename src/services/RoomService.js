
// Commons

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL; 

function headers(token) {

  return { 'Content-Type': 'application/json', 'Authorization': 'Bearer '+token }
}

export const getRooms = async ({ state }, setRoomsList, authData, params) => {
    const token = authData.token;

    console.log(token);

    fetch(
      BACKEND_URL + "/rooms?team_id="+params.team_id,
      {
        method: 'GET', 
        headers: headers(token)
      }
    )
    .then(response => response.json())
    .then(responseData => {
      setRoomsList(responseData);
    })
    .catch((error) => {
        // Error handling
    });
}

// export async function getRooms(setRoomsList, authData, params){

  
// };