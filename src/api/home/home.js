import baseHttpProvider from '../base/baseHttpProvider';

const getSecurityCount = (params) => {
  return baseHttpProvider.getApi('api/dataStatistics/getSecurityCount', params)
}

const getSecurityStatistics = (params) => {
  return baseHttpProvider.postFormApi('api/dataStatistics/getSecurityStatistics', params)
}

const getDecorationSetting = (params) => {
  return baseHttpProvider.getApi('api/decorationSetting/getDecorationSetting', params,{tokenless:true})
}

const getAttentionCount = (params) => {
  return baseHttpProvider.getApi('api/dataStatistics/getAttentionCount', params)
}

const getAttentionStatistics = (params) => {
  return baseHttpProvider.postFormApi('api/dataStatistics/getAttentionStatistics', params)
}
 
const getScanQuantityStatistics = (params) => {
  return baseHttpProvider.postFormApi('api/dataStatistics/getScanQuantityStatistics', params)
}

const getScanAreaStatistics = (params) => {
  return baseHttpProvider.postFormApi('api/dataStatistics/getScanAreaStatistics', params)
}

const getScanStatistics = (params) => {
  return baseHttpProvider.postFormApi('api/dataStatistics/getScanStatistics', params)
}

const getAreaStatistics = (params) => {
  return baseHttpProvider.getApi('api/dataStatistics/getAreaStatistics', params)
}



export {
  getSecurityCount,
  getSecurityStatistics,
  getDecorationSetting,
  getAttentionCount,
  getAttentionStatistics,
  getScanQuantityStatistics,
  getScanAreaStatistics,
  getScanStatistics,
  getAreaStatistics
}