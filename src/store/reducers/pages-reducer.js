import { RECOVER_PAGE, SAVE_PAGE } from '../actions/pages-actions';
const initialState = [];
export default (state, action) => {
  switch (action.type) {
    case RECOVER_PAGE:
      return {
        ...state,
        pageStates:action.payload.pageStates
      }
    case SAVE_PAGE:
      return {
        ...state,
        pageStates:action.payload.pageStates
      }


    default:
      return {
        ...state
      }

  }
}
