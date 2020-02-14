import baseHttpProvider from '../base/baseHttpProvider';

const searchLogRecordList = (params) => {
  return baseHttpProvider.postFormApi('api/integralLogRecord/searchLogRecordList', { page: 1, size: 10, ...params },
    {
      total: true
    })
}

const exportIntegralLogRecord = (params) => {
  params = baseHttpProvider.filterAllNullKeyInParams(params)
  let result = baseHttpProvider.getReqObj('api/integralLogRecord/export', params)
  if (result.url) {
    window.open(result.url, '_blank');
  }
}



export {
  searchLogRecordList,
  exportIntegralLogRecord
}