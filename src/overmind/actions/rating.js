

export const createRating = async ({state, effects}, {authData, ratingData}) => {

	var responseData = await effects.rating.createRating(authData, ratingData);
  return responseData;

}
