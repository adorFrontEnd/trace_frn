import baseHttpProvider from '../base/baseHttpProvider';

const searchRoleList = (params) => {
  return baseHttpProvider.postFormApi('api/role/searchRoleList', { page: 1, size: 10, ...params },
    {
      total: true
    })
}

const deleteRole = (params) => {
  return baseHttpProvider.getApi('api/role/delete', params)
}

const saveOrUpdate = (params) => {
  return baseHttpProvider.postFormApi('api/role/saveOrUpdate', params)
}

const getAllList = (params) => {
  return baseHttpProvider.getApi('api/source/getAllList', params)
}

const getAllListRoot = (params) => {
  return baseHttpProvider.getApi('api/source/getAllListRoot', params)
}

const getBaseList = (params) => {
  return baseHttpProvider.getApi('api/source/getBaseList', params)
}

export {
  searchRoleList,
  deleteRole,
  getAllList,
  getAllListRoot,
  getBaseList,
  saveOrUpdate
}