import baseHttpProvider from '../base/baseHttpProvider';

const getSetting = (params) => {

  return baseHttpProvider.postFormApi('api/setting/searchSetting',
    {
      ...params
    },
    {
      total: false
    })
}


const saveOrUpdate = (params) => {
  return baseHttpProvider.postFormApi('api/setting/saveOrUpdate',
    {
      ...params
    },
    {
      total: true
    })
}

const getAllPromptSound = (params) => {
  return baseHttpProvider.postFormApi('api/promptSound/getAll',
    {
      ...params
    })
}


const saveOrUpdatePromptSound = (params) => {
  return baseHttpProvider.postFormApi('api/promptSound/saveOrUpdate',
    {
      ...params
    })
}

const getAdorPayConfigDetail = (params) => {
  return baseHttpProvider.getApi('api/adorPayConfig/getDetail', params)
}

const updateStatusAdorPayConfig = (params) => {
  return baseHttpProvider.getApi('api/adorPayConfig/updateStatus', params)
}

const isAdorPayOpened = ()=>{
  return new Promise((resolve,reject)=>{
    baseHttpProvider.getApi('api/adorPayConfig/getDetail')
    .then(data=>{
      if(data && data.status == '1'){
        resolve && resolve();
      }else{
        reject&& reject();
      }
    })
    .catch(()=>{
      reject && reject()
    })
  })
  
}


const saveOrUpdateAdorPayConfig = (params) => {
  return baseHttpProvider.postFormApi('api/adorPayConfig/saveOrUpdate',
    {
      ...params
    })
}

const getOnlineShopConfigDetail = (params) => {
  return baseHttpProvider.getApi('api/onlineShopConfig/getDetail', params)
}

const updateStatusOnlineShopConfig = (params) => {
  return baseHttpProvider.getApi('api/onlineShopConfig/updateStatus', params)
}


const saveOrUpdateOnlineShopConfig = (params) => {
  return baseHttpProvider.postFormApi('api/onlineShopConfig/saveOrUpdate',
    {
      ...params
    })
}

export {
  getSetting,
  saveOrUpdate,
  getAllPromptSound,
  saveOrUpdatePromptSound,
  getAdorPayConfigDetail,
  getOnlineShopConfigDetail,
  updateStatusAdorPayConfig,
  updateStatusOnlineShopConfig,
  saveOrUpdateAdorPayConfig,
  saveOrUpdateOnlineShopConfig,
  isAdorPayOpened  
}