
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL; 

function headers(token) {

  return { 'Content-Type': 'application/json', 'Authorization': 'Bearer '+token }
}

export const googleLogin = async (loginData) => {

	return fetch(

  	BACKEND_URL + "/google-login",
	   {
      		method: 'POST',
          headers: headers(),
          body: JSON.stringify(loginData)
  	 }
	)
	.then(response => response.json())
	.then(responseData => {
  	return responseData;
	})
	.catch((error) => {
    return {};
    	// Error handling
	});
}

export const loginViaCode = async (loginData) => {

  return fetch(

    BACKEND_URL + "/login-via-code",
     {
          method: 'POST',
          headers: headers(),
          body: JSON.stringify(loginData)
     }
  )
  .then(response => response.json())
  .then(responseData => {
    return responseData;
  })
  .catch((error) => {
    return {};
      // Error handling
  });
}

export const getAgoraAccessToken = async (requestParams) => {

  return fetch(

    BACKEND_URL + "/agora-access-token" ,
     {
          method: 'POST',
          headers: headers(),
          body: JSON.stringify(requestParams)
     }
  )
  .then(response => response.json())
  .then(responseData => {
    return responseData;
  })
  .catch((error) => {
    return {};
      // Error handling
  });
}