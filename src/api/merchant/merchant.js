
import baseHttpProvider from '../base/baseHttpProvider';
import { md5 } from '../../utils/signMD5.js'

/**
 * 经销商列表
 * @param {*} params 
 */
const searchBusinessList = (params) => {
   return baseHttpProvider.postFormApi('api/business/searchBusinessList', { page: 1, size: 10, ...params },
      {
         total: true
      })
}

const saveOrUpdate = (params) => {
   return baseHttpProvider.postFormApi('api/business/saveOrUpdate', params,
      {
         total: true
      })
}

const getMerchantDetail = (params) => {
   return baseHttpProvider.getApi('api/business/getDetail', params)
}

const deleteBusinessArea = (params) => {
   return baseHttpProvider.getApi('api/businessArea/delete', params)
}

const updateBusinessStatus = (params) => {
   return baseHttpProvider.getApi('api/business/updateStatus', params)
}




export {
   searchBusinessList,
   getMerchantDetail,
   saveOrUpdate,
   deleteBusinessArea,
   updateBusinessStatus
}