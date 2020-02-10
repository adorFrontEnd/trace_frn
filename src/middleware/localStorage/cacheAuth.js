import { getCacheUserInfo,isUserAdmin } from './login';

const getCacheSpecAuth = () => {
  let userInfo = getCacheUserInfo();
  if (userInfo && userInfo.specialData && userInfo.specialData.length) {
    return userInfo.specialData
  }
}

const isSpecAuthExistByName = (name) => {
  let specAuth = getCacheSpecAuth();
  if (!specAuth || !name) {
    return
  }
  return specAuth.includes(name);
}

const getCacheFirstEnterPage = (allAuth) => {
  let userInfo = getCacheUserInfo();

  if (userInfo && userInfo.data && userInfo.data.length) {
    let data = userInfo.data;
    if (!allAuth) {
      data = data.filter(item => item && (item.indexOf('.') != -1 || item=='dataStatistics'));
    }   
    let route = data.includes("dataStatistics") || isUserAdmin() ? "dataStatistics" : data[0];
   
    return route
  }
}

export {
  getCacheSpecAuth,
  isSpecAuthExistByName,
  getCacheFirstEnterPage
} 