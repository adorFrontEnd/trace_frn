
import baseHttpProvider from '../base/baseHttpProvider';

const searchOrganizationList = (params) => {
  return baseHttpProvider.postFormApi('api/organization/searchOrganizationList', { page: 1, size: 10, ...params },
    {
      total: true
    })
}

const deleteOrg = (params) => {
  return baseHttpProvider.getApi('api/organization/delete', params)
}

const saveOrUpdate = (params) => {
  return baseHttpProvider.postFormApi('api/organization/saveOrUpdate', params)
}

export {
  searchOrganizationList,
  deleteOrg,
  saveOrUpdate
}