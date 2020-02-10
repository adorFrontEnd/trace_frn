
import baseHttpProvider from '../base/baseHttpProvider';
import { md5 } from '../../utils/signMD5.js'

/**
 * 经销商列表
 * @param {*} params 
 */
const getDealerList = (params) => {
  return baseHttpProvider.postFormApi('api/dealer/getDealerList', { page: 1, size: 10, ...params },
    {
      total: true
    })
}

const getDealerListByOrganizationId = (params) => {
  return baseHttpProvider.getApi('api/dealer/getDealerListByOrganizationId', params)
}

/**
 * 经销商修改 增加 api/dealer/addDealerAndUpdate
 * @param {*} params 
 */
const addDealerAndUpdate = (params) => {
  if (params.password != null) {
    params.password = md5(params.password);
  }
  return baseHttpProvider.postFormApi('api/dealer/addDealerAndUpdate', params, {
    total: true
  })
}



/**
 * 删除经销商 api/dealer/deleteDealer
 * @param {*} params 
 */
const deleteDealer = (params) => {
  return baseHttpProvider.getApi('api/dealer/deleteDealer', params, {
    total: true
  })
}

/**
 * 导入经销商 api/dealer/importDealer
 * @param {*} params 
 */
const importDealer = (params) => {
  return baseHttpProvider.postFormApi('api/dealer/importDealer', params, {
    total: true
  })
}

/**
 * 下载模板 api/dealer/exportTemplate
 * @param {*} params 
 */
const exportTemplate = (params) => {
  let result = baseHttpProvider.getReqObj('api/dealer/exportTemplate', params)
  if (result.url) {
    return result.url
  }
}

const exportListOfShelves = (params) => {
  let result = baseHttpProvider.getReqObj('api/productShelf/listOfShelvesExport', params)
  if (result.url) {
    return result.url
  }
}

/**
 * 获取名字 api/dealer/getUserOrganization
 * @param {*} params 
 */
const getOrganization = (params) => {
  return baseHttpProvider.getApi('api/dealer/getOrganization', params)
}


const getDealerDetails = (params) => {
  return baseHttpProvider.getApi('api/dealer/shipDetails', params)
}


const getListOfShelves = (params) => {
  return baseHttpProvider.postFormApi('api/productShelf/listOfShelves', { page: 1, size: 10, ...params }, {
    total: true
  })
}


export {
  getDealerList,
  getDealerListByOrganizationId,
  addDealerAndUpdate,
  deleteDealer,
  importDealer,
  exportTemplate,
  getDealerDetails,
  getOrganization,
  getListOfShelves,
  exportListOfShelves
}