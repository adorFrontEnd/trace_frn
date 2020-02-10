
import baseHttpProvider from '../base/baseHttpProvider';

const searchTrayList = (params) => {
  return baseHttpProvider.postFormApi('api/tray/searchTrayList', { page: 1, size: 10, ...params },
    {
      total: true
    })
}

const exportUniqueCode = (params) => {
  return baseHttpProvider.getApi('api/tray/exportUniqueCode', params)
 
}


const saveOrUpdate = (params) => {
  return baseHttpProvider.postFormApi('api/tray/saveOrUpdate', { ...params })
}

const deleteTray = (params) => {
  return baseHttpProvider.getApi('api/tray/delete', { ...params })
}

const searchTrayLogList = (params) => {
  return baseHttpProvider.postFormApi('api/trayLog/searchTrayLogList', { page: 1, size: 10, ...params },
    {
      total: true
    })
}

const generateUniqueCode = (params) => {
  return baseHttpProvider.postFormApi('api/box/exportUniqueCode', params)
}

const exportUniqueCodeLog = (params) => {
  params = baseHttpProvider.filterAllNullKeyInParams(params)
  let result = baseHttpProvider.getReqObj('api/trayLog/exportUniqueCode', params)
  if (result.url) {
    return result.url
  }
}

const generateQrcodeImage = (params) => {
  return baseHttpProvider.getApi('api/trayLog/exportUniqueCode', params)
}

const deleteTrayLog = (params) => {
  return baseHttpProvider.getApi('api/trayLog/delete', { ...params })
}

const submitParam = (params) => {
  return baseHttpProvider.postFormApi('api/trayLog/exportUniqueCode/submitParam', params)
}

const batchExportUniqueCode = (params) => {
  params = baseHttpProvider.filterAllNullKeyInParams(params)
  let result = baseHttpProvider.getReqObj('api/trayLog/batchExportUniqueCode', params)
  if (result.url) {
    return result.url
  }
}

const checkExportUniqueCode = (params) => {
  return baseHttpProvider.getApi('api/trayLog/checkExportUniqueCode', params)
}


export {
  searchTrayList,
  exportUniqueCode,
  exportUniqueCodeLog,
  saveOrUpdate,
  searchTrayLogList,
  deleteTray,
  deleteTrayLog,
  submitParam,
  batchExportUniqueCode,
  generateQrcodeImage,
  checkExportUniqueCode
}

