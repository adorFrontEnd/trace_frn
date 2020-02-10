import baseHttpProvider from '../base/baseHttpProvider';

/* api/user/findUserData 用户列表*******************************************************************
@params
page	Int	true	第几页
size	Int	true	每页数据条数
*/
const searchAttentionList = (params) => {
  return baseHttpProvider.postFormApi('api/attention/searchAttentionList',
    {
      size: 10,
      ...params
    },
    {
      total: true
    })
}

const getSurplusExportQuantity = (params) => {
  return baseHttpProvider.getApi('api/user/getSurplusExportQuantity', params)
}

const exportUserList = (params) => {
  params = baseHttpProvider.filterAllNullKeyInParams(params)
  let result = baseHttpProvider.getReqObj('api/attention/export', params)
  if (result.url) {
    return result.url
  }
}

const searchUserAuthList = (params) => {
  return baseHttpProvider.postFormApi('api/userAuth/searchUserAuthList',
    {
      size: 10,
      ...params
    },
    {
      total: true
    })
}

const getUserAuthDetail = (params) => {
  return baseHttpProvider.getApi('api/userAuth/getDetail', params)
}

const resetSecretKey = (params) => {
  return baseHttpProvider.getApi('api/userAuth/resetSecretKey', params)
}

const deleteAuth = (params) => {
  return baseHttpProvider.getApi('api/userAuth/delete', params)
}

const saveOrUpdateAuth = (params) => {
  return baseHttpProvider.postFormApi('api/userAuth/saveOrUpdate', params)
}


export {
  getSurplusExportQuantity,
  searchAttentionList,
  exportUserList,
  searchUserAuthList,
  getUserAuthDetail,
  resetSecretKey,
  saveOrUpdateAuth,
  deleteAuth
}