const showRouteChangeloading = () => {
  let dom = document.getElementById("__loading_Content");
  if(dom){
    dom.className = 'show-loading'
  }
 
}

const hideRouteChangeloading = () => {
  let dom = document.getElementById("__loading_Content");
  if(dom){
    dom.className = 'hide-loading'
  } 
}

export {
  showRouteChangeloading,hideRouteChangeloading
}