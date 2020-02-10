
import baseHttpProvider from '../base/baseHttpProvider';

const getDetail = (params) => {
  return baseHttpProvider.getApi('api/drainageSetting/getDetail', params)
}

const saveOrUpdate = (params) => {
  return baseHttpProvider.postFormApi('api/drainageSetting/saveOrUpdate', params)
}

export {
  getDetail,
  saveOrUpdate
}