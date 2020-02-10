


import baseHttpProvider from '../base/baseHttpProvider';

/**
 * 标签列表
 * @param {*} params 
 */
const searchLabelList = (params) => {
  return baseHttpProvider.postFormApi('api/label/searchLabelList', { page: 1, size: 100, ...params },
    {
      total: true
    })
}

const saveOrUpdateLabel = (params) => {
  return baseHttpProvider.postFormApi('api/label/saveOrUpdate',params)
}

/**
 * 删除标签 api/dealer/deleteDealer
 * @param {*} params 
 */
const deleteLabel = (params) => {
  return baseHttpProvider.getApi('api/label/delete', params)
}


const getDetail = (params) => {
  return baseHttpProvider.getApi('api/label/getDetail', params)
}


export {
  searchLabelList,
  saveOrUpdateLabel,
  deleteLabel,
  getDetail
}