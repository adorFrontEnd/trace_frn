
import baseHttpProvider from '../base/baseHttpProvider';

/**
 * 经销商发货详情列表
 * @param {*} params 
 */
const shippingDetails = (params) => {
  return baseHttpProvider.postFormApi('api/dealer/shippingDetails', { page: 1, size: 10, ...params },
    {
      total: true
    })
}

/**
 * 导出详细清单 api/dealer/exportShippingDetails
 * @param {*} params 
 */
const exportShippingDetails = (params) => {
  let result = baseHttpProvider.getReqObj('api/dealer/exportShippingDetails', params)
  if (result.url) {
    return result.url
  }
}

const exportAllShipping = (params) => {
  params = baseHttpProvider.filterAllNullKeyInParams(params)
  let result = baseHttpProvider.getReqObj('api/dealer/exportAllShipping', params)
  if (result.url) {
    window.open(result.url, '_blank');
  }
}


export {
  shippingDetails,
  exportShippingDetails,
  exportAllShipping
}