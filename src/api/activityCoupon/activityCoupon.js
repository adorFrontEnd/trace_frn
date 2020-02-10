import baseHttpProvider from '../base/baseHttpProvider';

const saveOrUpdate = (params) => {
  return baseHttpProvider.postFormApi('api/businessEventVoucher/saveOrUpdate', params);
}

const updateStatus = (params) => {
  return baseHttpProvider.getApi('api/businessEventVoucher/updateStatus', params);
}

const getActivityCouponDetail = (params) => {
  return baseHttpProvider.getApi('api/businessEventVoucher/getDetail', params);
}

const searchBusinessEventVoucherList = (params) => {
  return baseHttpProvider.postFormApi('api/businessEventVoucher/searchBusinessEventVoucherList', { page: 1, size: 10, ...params },
    {
      total: true
    })
}

const getBusinessList = (params) => {
  return baseHttpProvider.getApi('api/business/businessList', params);
}

const searchBusinessOrderList = (params) => {
  return baseHttpProvider.postFormApi('api/businessOrder/searchBusinessOrderList', { page: 1, size: 10, ...params },
    {
      total: true
    })
}

const businessOrderCancel = (params) => {
  return baseHttpProvider.getApi('api/businessOrder/cancel', params);
}

const exportUniqueCode = (params) => {
  params = baseHttpProvider.filterAllNullKeyInParams(params)
  let result = baseHttpProvider.postFormApi('api/businessOrder/cancel', params)
  if (result.url) {
    return result.url
  }
}

const businessOrderExport = (params) => {
  params = baseHttpProvider.filterAllNullKeyInParams(params)
  let result = baseHttpProvider.getReqObj('api/businessOrder/export', params)
  if (result.url) {
    window.open(result.url, '_blank');
  }
}
export {
  saveOrUpdate,
  updateStatus,
  getActivityCouponDetail,
  searchBusinessEventVoucherList,
  getBusinessList,
  searchBusinessOrderList,
  businessOrderCancel,
  businessOrderExport
}