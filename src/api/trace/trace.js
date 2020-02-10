
import baseHttpProvider from '../base/baseHttpProvider';

const getDetail = (params) => {
  return baseHttpProvider.getApi('api/traceSourceTemplate/getDetail',params)
}

const saveOrUpdate = (params) => {
  return baseHttpProvider.postFormApi('api/traceSourceTemplate/saveOrUpdate',params)
}


const searchTraceSourceList = (params) => {
  return baseHttpProvider.postFormApi('api/traceSource/searchTraceSourceList',{page:1,size:10,...params},{total:true})
}

const queryTrace = (params) => {
  return baseHttpProvider.getApi('api/traceSource/query',params)
}


export {
  getDetail,
  saveOrUpdate,
  searchTraceSourceList,
  queryTrace
}