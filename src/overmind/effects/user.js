
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL; 

function headers(token) {

  return { 'Content-Type': 'application/json', 'Authorization': 'Bearer '+token }
}

export const getUser = async (authData, params) => {

  const token = authData.token;

	return fetch(

  	BACKEND_URL + "/user/"+authData.user.id,
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
    return {};
    	// Error handling
	});
}

export const getOnlineUsers = async (authData, tid) => {

  const token = authData.token;

  return fetch(

    BACKEND_URL + "/online-users/"+tid,
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
    return {};
      // Error handling
  });
}