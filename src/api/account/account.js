import baseHttpProvider from '../base/baseHttpProvider';
import { md5 } from '../../utils/signMD5.js'

const searchOperList = (params) => {
  return baseHttpProvider.postFormApi('api/oper/searchOperList', { page: 1, size: 10, ...params },
    {
      total: true
    })
}

const deleteOper = (params) => {
  return baseHttpProvider.getApi('api/oper/delete', params)
}

const saveOrUpdate = (params) => {
  if(params.password){
    params.password = md5(params.password);
  }
  return baseHttpProvider.postFormApi('api/oper/saveOrUpdate', params)
}

const updatePassword = (params) => {
  if(params.password){
    params.password = md5(params.password);
  }

  if(params.oldPassword){
    params.oldPassword = md5(params.oldPassword);
  }
  return baseHttpProvider.postFormApi('api/oper/updatePassword', params)
}


export {
  searchOperList,
  deleteOper,
  saveOrUpdate,
  updatePassword
}