
export const CHANGE_ROUTE = 'CHANGE_ROUTE';
export const DELETE_ROUTE = 'DELETE_ROUTE';


export function changeRoute(routeInfo){
  return {
    type:CHANGE_ROUTE,
    payload:{
      routeInfo:routeInfo
    }    
  }
}

export function deleteRoute(path){
  return {
    type:DELETE_ROUTE,
    payload:path    
  }
}
