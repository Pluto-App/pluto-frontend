
// Commons

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL; 

function headers(token) {

  return { 'Content-Type': 'application/json', 'Authorization': 'Bearer '+token }
}


export const getTeam = async ({ state }, setTeamData, authData, params) => {

  const token = authData.token;

  fetch(
    BACKEND_URL + "/team/"+params.team_id,
    {
      method: 'GET', 
      headers: headers(token)
    }
  )
  .then(response => response.json())
  .then(responseData => {
    setTeamData({loading: false, data: responseData});
  })
  .catch((error) => {
      // Error handling
  });
};