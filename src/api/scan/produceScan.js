
import baseHttpProvider from '../base/baseHttpProvider';

const scanVerification = (params) => {
  return baseHttpProvider.postFormApi('api/produceScan/scanVerification',params)
}

const scanSubmit = (params) => {
  return baseHttpProvider.postFormApi('api/produceScan/scan',params)
}


const searchProduceScanLogList = (params) => {
  return baseHttpProvider.postFormApi('api/produceScanLog/searchProduceScanLogList', { page: 1, size: 10, ...params },
    {
      total: true
    })
}

const searchProduceScanQuantityList = (params) => {
  return baseHttpProvider.postFormApi('api/produceScanQuantity/searchProduceScanQuantityList', { page: 1, size: 10, ...params },
    {
      total: true
    })
}

const exportProduceScanLog = (params) => {
  params = baseHttpProvider.filterAllNullKeyInParams(params)
  let result = baseHttpProvider.getReqObj('api/produceScanLog/export', params)
  if (result.url) {
    window.open(result.url, '_blank');
  }
}

const exportProduceScanQuantity = (params) => {
  params = baseHttpProvider.filterAllNullKeyInParams(params)
  let result = baseHttpProvider.getReqObj('api/produceScanQuantity/export', params)
  if (result.url) {
    window.open(result.url, '_blank');
  }
}


export {
  scanVerification,
  scanSubmit,
  searchProduceScanLogList,
  searchProduceScanQuantityList,
  exportProduceScanLog,
  exportProduceScanQuantity
}