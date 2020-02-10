
import baseHttpProvider from '../base/baseHttpProvider';

const getDetail = (params) => {
  return baseHttpProvider.getApi('api/decorationSetting/getDetail', params)
}

const saveOrUpdate = (params) => {
  return baseHttpProvider.postFormApi('api/decorationSetting/saveOrUpdate', params)
}

export {
  getDetail,
  saveOrUpdate
}