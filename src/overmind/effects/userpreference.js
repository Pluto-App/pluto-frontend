
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL; 

function headers(token) {

  return { 'Content-Type': 'application/json', 'Authorization': 'Bearer '+token }
}

export const getUserPreference = async (authData, user_id) => {

	const token = authData.token;

  	return fetch(

    	BACKEND_URL + "/user-preference?user_id="+user_id,
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

export const createUserPreference = async (authData, userPreferenceData) => {

  const token = authData.token;

    return fetch(

      BACKEND_URL + "/user-preference",
      {
          method: 'POST', 
          headers: headers(token),
          body:    JSON.stringify({user_preference: userPreferenceData})
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

export const updateUserPreference = async (authData, userPreferenceData) => {

  const token = authData.token;

    return fetch(

      BACKEND_URL + "/user-preference/"+userPreferenceData.id,
      {
          method: 'PUT', 
          headers: headers(token),
          body:    JSON.stringify({user_preference: userPreferenceData})
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


