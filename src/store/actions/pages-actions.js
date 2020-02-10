
export const RECOVER_PAGE = 'RECOVER_PAGE';
export const SAVE_PAGE = 'SAVE_PAGE';

export function recoverPage(pageStates){
  return {
    type:RECOVER_PAGE,
    payload:{
      pageStates:pageStates
    }    
  }
}

export function savePage(pageStates){
  return {
    type:SAVE_PAGE,
    payload:{
      pageStates:pageStates
    }    
  }
}
