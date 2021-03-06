
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL; 

function headers(token) {

  return { 'Content-Type': 'application/json', 'Authorization': 'Bearer '+token }
}


export const createRating = async (authData, ratingData) => {

  const token = authData.token;

    return fetch(

      BACKEND_URL + "/rating",
      {
          method: 'POST', 
          headers: headers(token),
          body:    JSON.stringify({rating: ratingData})
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


