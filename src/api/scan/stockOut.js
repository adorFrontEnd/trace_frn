
import baseHttpProvider from '../base/baseHttpProvider';

const scanStockOutVerification = (params) => {
  return baseHttpProvider.postFormApi('api/outboundScan/scanVerification',params)
}

const scanStockOutSubmit = (params) => {
  return baseHttpProvider.postFormApi('api/outboundScan/scan',params)
}


const searchOutboundScanLogList = (params) => {
  return baseHttpProvider.postFormApi('api/outboundScanLog/searchOutboundScanLogList', { page: 1, size: 10, ...params },
    {
      total: true
    })
}

const getExpressList = (params) => {
  return baseHttpProvider.getApi('api/expressDelivery/getList',params)
}

const searchOutboundScanQuantityList = (params) => {
  return baseHttpProvider.postFormApi('api/outboundScanQuantity/searchOutboundScanQuantityList', { page: 1, size: 10, ...params },
    {
      total: true
    })
}

const exportOutboundScanQuantity = (params) => {
  params = baseHttpProvider.filterAllNullKeyInParams(params)
  let result = baseHttpProvider.getReqObj('api/outboundScanQuantity/export', params)
  if (result.url) {
    window.open(result.url, '_blank');
  }
}

const exportOutboundScanLog = (params) => {
  params = baseHttpProvider.filterAllNullKeyInParams(params)
  let result = baseHttpProvider.getReqObj('api/outboundScanLog/export', params)
  if (result.url) {
    window.open(result.url, '_blank');
  }
}

const exportOutboundScanQuantityRecord = (params) => {
  params = baseHttpProvider.filterAllNullKeyInParams(params)
  let result = baseHttpProvider.getReqObj('api/outboundScanQuantity/exportRecord', params)
  if (result.url) {
    window.open(result.url, '_blank');
  }
}


export {
  scanStockOutVerification,
  scanStockOutSubmit,
  searchOutboundScanLogList,
  getExpressList,
  searchOutboundScanQuantityList,
  exportOutboundScanQuantity,
  exportOutboundScanLog,
  exportOutboundScanQuantityRecord
}