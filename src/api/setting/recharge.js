import baseHttpProvider from '../base/baseHttpProvider';


// 获取剩余码数
const getSurplusExportQuantity = (params) => {
  return baseHttpProvider.getApi('api/user/getSurplusExportQuantity', params)
}
// 付款二维码
const rechargeBusiness = (params) => {
  // return baseHttpProvider.getApi('api/recharge/rechargeBusiness', params)
  let result = baseHttpProvider.getReqObj('api/recharge/rechargeBusiness', params);
  if (result) {
    return result.url;
  }
}
export {
  rechargeBusiness,
  getSurplusExportQuantity
}