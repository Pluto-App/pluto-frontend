
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL; 

function headers(token) {

  return { 'Content-Type': 'application/json', 'Authorization': 'Bearer '+token }
}

export const getTeam = async (authData, team_id) => {

	const token = authData.token;

  	return fetch(

    	BACKEND_URL + "/team/"+team_id,
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

export const createTeam = async (authData, teamData) => {

  const token = authData.token;

    return fetch(

      BACKEND_URL + "/team",
      {
          method: 'POST', 
          headers: headers(token),
          body:    JSON.stringify({team: teamData})
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

export const deleteTeam = async (authData, teamData) => {

  const token = authData.token;

    return fetch(

      BACKEND_URL + "/team/"+teamData.id,
      {
          method: 'DELETE', 
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

export const addUser = async (authData, params) => {

  const token = authData.token;

  return fetch(

    BACKEND_URL + "/team/" + params.tid + '/add-user/' + params.user_id,
    {
        method: 'PUT', 
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

export const removeUser = async (authData, params) => {

  const token = authData.token;

  return fetch(

    BACKEND_URL + "/team/" + params.team_id + '/remove-user/' + params.user_id,
    {
        method: 'DELETE', 
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
