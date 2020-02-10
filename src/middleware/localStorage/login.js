


const isUserLogin = () => {
  return getCacheToken() ? true : false;
}
const getCacheToken = () => {
  let userInfo = getCacheUserInfo();
  if (userInfo && userInfo.token) {
    return userInfo.token;
  }
  return null;
}

const getCacheRouterConfig = () => {
  let userInfo = getCacheUserInfo();
  if (userInfo && userInfo.data) {
    return userInfo.data;
  }
  return null;
}

const userLogout = (token) => {
  window.localStorage['_frnUserInfo'] = null;
}

const setCacheUserInfo = (userInfo) => {
  if (!userInfo) {
    window.localStorage['_frnUserInfo'] = null;
  } else {
    if (userInfo.token) {
      userInfo.token = decodeURIComponent(userInfo.token);
    }
    window.localStorage['_frnUserInfo'] = JSON.stringify(userInfo);
  }
}

const getCacheUserInfo = () => {
  let userInfo = window.localStorage['_frnUserInfo'];
  if (userInfo) {
    return JSON.parse(userInfo);
  }
  return null
}

const getCacheFrnId = () => {
  let userInfo = getCacheUserInfo();
  if (userInfo && (userInfo.frnId || userInfo.frnId == 0)) {
    return userInfo.frnId
  }
}

const isRootOrgUser = () => {

  let userInfo = getCacheUserInfo();
  if (userInfo && userInfo.organizationParent == '0') {
    return true;
  }
  return
}

const getCacheOrgId = () => {

  let userInfo = getCacheUserInfo();
  if (userInfo && userInfo.organizationId) {
    let result = userInfo.organizationId;
    return result;
  }
}

const getCacheOrgName = () => {

  let userInfo = getCacheUserInfo();
  if (userInfo && userInfo.organizationName) {
    let result = userInfo.organizationName;
    return result;
  }
}

const getCacheOperId = () => {

  let userInfo = getCacheUserInfo();
  if (userInfo && userInfo.id) {
    let result = userInfo.id;
    return result;
  }
}

const setCacheDomain = (domain) => {
  if (!domain) {
    return;
  }
  window.localStorage['_domain'] = domain;
}

const getCacheDomain = () => {
  let domain = window.localStorage['_domain'];
  return domain || "ador";
}

const setCacheDecoration = (data) => {
  if (!data) {
    window.localStorage['_decoration'] = "";
    return;
  }
  window.localStorage['_decoration'] = data;
}

const getCacheDecoration = () => {
  let data = window.localStorage['_decoration'];
  if (data) {
    return JSON.parse(data);
  }
  return;
}


const isUserAdmin = () => {
  let userInfo = getCacheUserInfo();
  if (userInfo && userInfo.roleName == '超级管理员') {
    return true;
  }
  return
}

export {
  setCacheUserInfo,
  getCacheRouterConfig,
  getCacheToken,
  getCacheUserInfo,
  isUserLogin,
  userLogout,
  getCacheFrnId,
  isRootOrgUser,
  getCacheOrgId,
  getCacheOrgName,
  getCacheOperId,
  getCacheDomain,
  setCacheDomain,
  setCacheDecoration,
  getCacheDecoration,
  isUserAdmin
} 