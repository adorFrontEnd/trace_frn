
import baseHttpProvider from '../base/baseHttpProvider';
import { md5 } from '../../utils/signMD5.js'

/**
 * 活动列表
 * @param {*} params 
 */
const searchActivityList = (params) => {
  return baseHttpProvider.postFormApi('api/activity/searchActivityList', { page: 1, size: 10, ...params },
    {
      total: true
    })
}

const deleteActivity = (params) => {
  return baseHttpProvider.getApi('api/activity/delete', params)
}


const saveOrUpdate = (params) => {
  return baseHttpProvider.postFormApi('api/activity/saveOrUpdate', params)
}

const getDetail = (params) => {
  return baseHttpProvider.getApi('api/activity/getDetail', params)
}

const selectByActivityId = (params) => {
  return baseHttpProvider.getApi('api/prizeConfig/selectByActivityId', params)
}

const saveOrUpdatePrize = (params) => {
  return baseHttpProvider.postApi('api/prizeConfig/saveOrUpdate', params)
}

const searchWriteOffLogList = (params) => {
  return baseHttpProvider.postFormApi('api/writeOffLog/searchWriteOffLogList', { page: 1, size: 10, ...params },
    {
      total: true
    }
  )
}

const exportWriteOffLog = (params) => {
  params = baseHttpProvider.filterAllNullKeyInParams(params)
  let result = baseHttpProvider.getReqObj('api/writeOffLog/export', { page: 1, size: 10, ...params })
  if (result.url) {
    return result.url
  }
}

const searchIntegralLogList = (params) => {
  return baseHttpProvider.postFormApi('api/integralLog/searchIntegralLogList', { page: 1, size: 10, ...params },
    {
      total: true
    }
  )
}

const exportIntegralLog = (params) => {
  params = baseHttpProvider.filterAllNullKeyInParams(params)
  let result = baseHttpProvider.getReqObj('api/integralLog/export', { page: 1, size: 10, ...params })
  if (result.url) {
    return result.url
  }
}


const getAttentionDetail = (params) => {
  return baseHttpProvider.getApi('api/attention/getDetail', params)
}

const getIntegral = (params) => {
  return baseHttpProvider.getApi('api/attention/getIntegral', params, { total: true })
}

const saveTurntablePrizeConfig = (params) => {
  return baseHttpProvider.postFormApi('api/turntablePrizeConfig/saveOrUpdate', params)
}

const selectTurntableByActivityId = (params) => {
  return baseHttpProvider.getApi('api/turntablePrizeConfig/selectByActivityId', params)
}

const searchWinningLogList = (params) => {
  return baseHttpProvider.postFormApi('api/winningLog/searchWinningLogList', { page: 1, size: 10, ...params },
    {
      total: true
    }
  )
}

const exportWinningLog = (params) => {
  params = baseHttpProvider.filterAllNullKeyInParams(params)
  let result = baseHttpProvider.getReqObj('api/winningLog/export', params)
  if (result.url) {
    window.open(result.url, '_blank');
  }
}

const getWinningLogDetail = (params) => {
  return baseHttpProvider.getApi('api/winningLog/getDetail', params)
}

const shipments = (params) => {
  return baseHttpProvider.getApi('api/winningLog/shipments', params)
}

const getExpressMerchantList = (params) => {
  return baseHttpProvider.getApi('api/winningLog/getExpressMerchantList', params)
}

export {
  searchActivityList,
  deleteActivity,
  saveOrUpdate,
  getDetail,
  selectByActivityId,
  saveOrUpdatePrize,
  searchWriteOffLogList,
  exportWriteOffLog,
  searchIntegralLogList,
  exportIntegralLog,
  getAttentionDetail,
  getIntegral,
  saveTurntablePrizeConfig,
  selectTurntableByActivityId,
  searchWinningLogList,
  exportWinningLog,
  getWinningLogDetail,
  shipments,
  getExpressMerchantList
}