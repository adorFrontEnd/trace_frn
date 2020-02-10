
import baseHttpProvider from '../base/baseHttpProvider';

const getDetail = (params) => {
  return baseHttpProvider.getApi('api/securityTemplate/getDetail',params)
}

const saveOrUpdate = (params) => {
  return baseHttpProvider.postFormApi('api/securityTemplate/saveOrUpdate',params)
}


const searchSecurityList = (params) => {
  return baseHttpProvider.postFormApi('api/security/searchSecurityList',{page:1,size:10,...params},{total:true})
}

const querySecurity = (params) => {
  return baseHttpProvider.getApi('api/security/query',params)
}


export {
  getDetail,
  saveOrUpdate,
  searchSecurityList,
  querySecurity
}