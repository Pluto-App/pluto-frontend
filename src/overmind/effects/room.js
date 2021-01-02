
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL; 

function headers(token) {

  return { 'Content-Type': 'application/json', 'Authorization': 'Bearer '+token }
}

export const addRoom = async (authData, roomData) => {

	const token = authData.token;

  	return fetch(

    	BACKEND_URL + "/room",
    	{
      		method: 'POST', 
      		headers: headers(token),
          body:    JSON.stringify({room: roomData})
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

export const deleteRoom = async (authData, roomData) => {

  const token = authData.token;

    return fetch(

      BACKEND_URL + "/room/"+roomData.id,
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