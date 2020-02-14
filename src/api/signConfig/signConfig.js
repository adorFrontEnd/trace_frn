


import baseHttpProvider from '../base/baseHttpProvider';

const getSignInConfigDetail = (params) => {
  return baseHttpProvider.getApi('api/signInConfig/getDetail',params)
}

const saveOrUpdateSignInConfig = (params) => {
  return baseHttpProvider.postFormApi('api/signInConfig/saveOrUpdate',params)
}



export {
  getSignInConfigDetail,
  saveOrUpdateSignInConfig
}