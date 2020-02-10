
import baseHttpProvider from '../base/baseHttpProvider';

const searchProductList = (params) => {
  return baseHttpProvider.postFormApi('api/product/searchProductList', { page: 1, size: 10, ...params },
    {
      total: true
    })
}

const exportUniqueCode = (params) => {
  params = baseHttpProvider.filterAllNullKeyInParams(params)
  let result = baseHttpProvider.postFormApi('api/product/exportUniqueCode', params)
  if (result.url) {
    return result.url
  }
}

const generateUniqueCode = (params) => {
  return baseHttpProvider.postFormApi('api/product/exportUniqueCode', params)
}

const saveOrUpdate = (params) => {
  return baseHttpProvider.postFormApi('api/product/saveOrUpdate', { ...params })
}

const getProductDetail = (params) => {
  return baseHttpProvider.getApi('api/product/getDetail', { ...params })
}


const deleteProduct = (params) => {
  return baseHttpProvider.getApi('api/product/delete', { ...params })
}

const searchProductLogList = (params) => {
  return baseHttpProvider.postFormApi('api/productLog/searchProductLogList', { page: 1, size: 10, ...params },
    {
      total: true
    })
}

const exportUniqueCodeLog = (params) => {
  params = baseHttpProvider.filterAllNullKeyInParams(params)
  let result = baseHttpProvider.getReqObj('api/productLog/exportUniqueCode', params)
  if (result.url) {
    return result.url
  }
}

const generateQrcodeImage = (params) => {
  return baseHttpProvider.getApi('api/productLog/exportUniqueCode', params)
}

const deleteProductLog = (params) => {
  return baseHttpProvider.getApi('api/productLog/delete', { ...params })
}

const submitParam = (params) => {
  return baseHttpProvider.postFormApi('api/productLog/exportUniqueCode/submitParam', params)
}

const batchExportUniqueCode = (params) => {
  params = baseHttpProvider.filterAllNullKeyInParams(params)
  let result = baseHttpProvider.getReqObj('api/productLog/batchExportUniqueCode', params)
  if (result.url) {
    return result.url
  }
}

const saveOrUpdateQrCodeConfig = (params) => {
  return baseHttpProvider.postFormApi('api/qrCodeConfig/saveOrUpdate', params)
}

const getDetailQrCodeConfig = (params) => {
  return baseHttpProvider.getApi('api/qrCodeConfig/getDetail', params)
}

const checkExportUniqueCode = (params) => {
  return baseHttpProvider.getApi('api/productLog/checkExportUniqueCode', params)
}

const stopDrawQrCode = (params) => {
  return baseHttpProvider.getApi('api/productLog/stopDrawQrCode', params)
}




export {
  searchProductList,
  exportUniqueCode,
  generateUniqueCode,
  exportUniqueCodeLog,
  saveOrUpdate,
  searchProductLogList,
  deleteProduct,
  deleteProductLog,
  submitParam,
  saveOrUpdateQrCodeConfig,
  getDetailQrCodeConfig,
  batchExportUniqueCode,
  generateQrcodeImage,
  checkExportUniqueCode,
  stopDrawQrCode,
  getProductDetail 
}