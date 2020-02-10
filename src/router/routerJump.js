
import { baseRoute, routerConfig } from '../config/router.config';

const goLogin =()=>{ 
  window.location.href = routerConfig['login'].path;
} 

export {
  goLogin
}