
import baseHttpProvider from '../base/baseHttpProvider';

const searchBoxList = (params) => {
  return baseHttpProvider.postFormApi('api/box/searchBoxList', { page: 1, size: 10, ...params },
    {
      total: true
    })
}

const exportUniqueCode = (params) => {
  params = baseHttpProvider.filterAllNullKeyInParams(params)
  let result = baseHttpProvider.postFormApi('api/box/exportUniqueCode', params)
  if (result.url) {
    return result.url
  }
}

const generateUniqueCode = (params) => {
  return baseHttpProvider.postFormApi('api/box/exportUniqueCode', params)
}

const saveOrUpdate = (params) => {
  return baseHttpProvider.postFormApi('api/box/saveOrUpdate', { ...params })
}

const deleteBox = (params) => {
  return baseHttpProvider.getApi('api/box/delete', { ...params })
}

const searchBoxLogList = (params) => {
  return baseHttpProvider.postFormApi('api/boxLog/searchBoxLogList', { page: 1, size: 10, ...params },
    {
      total: true
    })
}

const exportUniqueCodeLog = (params) => {
  params = baseHttpProvider.filterAllNullKeyInParams(params)
  let result = baseHttpProvider.getReqObj('api/boxLog/exportUniqueCode', params)
  if (result.url) {
    return result.url
  }
}
const generateQrcodeImage = (params) => {
  return baseHttpProvider.getApi('api/boxLog/exportUniqueCode', params)
}

const deleteBoxLog = (params) => {
  return baseHttpProvider.getApi('api/boxLog/delete', { ...params })
}

const submitParam = (params) => {
  return baseHttpProvider.postFormApi('api/boxLog/exportUniqueCode/submitParam', params)
}

const batchExportUniqueCode = (params) => {
  params = baseHttpProvider.filterAllNullKeyInParams(params)
  let result = baseHttpProvider.getReqObj('api/boxLog/batchExportUniqueCode', params)
  if (result.url) {
    return result.url
  }
}

const checkExportUniqueCode = (params) => {
  return baseHttpProvider.getApi('api/boxLog/checkExportUniqueCode', params)
}


const stopDrawQrCode = (params) => {
  return baseHttpProvider.getApi('api/boxLog/stopDrawQrCode', params)
}

export {
  searchBoxList,
  exportUniqueCode,
  exportUniqueCodeLog,
  saveOrUpdate,
  searchBoxLogList,
  generateUniqueCode,
  batchExportUniqueCode,
  deleteBox,
  deleteBoxLog,
  submitParam,
  generateQrcodeImage,
  checkExportUniqueCode,
  stopDrawQrCode
}