
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL; 

function headers(token) {

  return { 'Content-Type': 'application/json', 'Authorization': 'Bearer '+token }
}

export const getUser = async (authData, user_id) => {

  const token = authData.token;

  return fetch(

    BACKEND_URL + "/user/"+user_id,
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

export const registerUser = async (userData) => {


    return fetch(

      BACKEND_URL + "/user/register",
      {
          method: 'POST', 
          headers: { 'Content-Type': 'application/json'},
          body:    JSON.stringify(userData)
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

export const resendLoginCode = async (userData) => {


    return fetch(

      BACKEND_URL + "/user/resend-login-code",
      {
          method: 'POST', 
          headers: { 'Content-Type': 'application/json'},
          body:    JSON.stringify(userData)
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

export const updateUser = async (authData, userData) => {

  const token = authData.token;

    return fetch(

      BACKEND_URL + "/user/"+userData.id,
      {
          method: 'PUT', 
          headers: headers(token),
          body:    JSON.stringify({user: userData})
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

export const getTeamMembers = async (authData, teamId) => {

  const token = authData.token;

  return fetch(

    BACKEND_URL + "/user/team/"+teamId,
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


