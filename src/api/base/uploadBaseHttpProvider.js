import { uploadApiUrlPrefix as apiUrlPrefix } from '../../config/http.config'
import Toast from '../../utils/toast.js'
import { getCacheToken } from '../../middleware/localStorage/login'
import { getEnctrySign } from "../../utils/sign"
import { _request } from '../../middleware/axios/axios';


/*@params 
  options:{  
    header:{},       // 请求头 
    total:false, //  resolve(res.data)还是resolve(res.data.data)

    //提示信息
    toast: {
        required:true, // 是否失败或者错误提示      
        failTitle:"请求失败!", // 失败提示     
        errorTitle:'网络错误!'// 错误提示
        }
    }
  } */

let GET = (url, params, options) =>
  _request(url, params, 'GET', options ? Object.assign({}, options) : null)

let GET_TotalData = (url, params, options) =>
  _request(url, params, 'GET', Object.assign({
    total: true
  }, options))

let POST = (url, params, options) =>
  _request(url, params, 'POST', options ? Object.assign({}, options) : null)

let POST_TotalData = (url, params, options) =>
  _request(url, params, 'POST', Object.assign({
    total: true
  }, options))

let postForm = (url, params, options) => {
  let _options = Object.assign({
    header: {
      'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8'
    }
  }, Object.assign({
    isForm: true
  }, options));
  return _request(url, params, 'POST', _options)
}

const getApi = (relativeUrl, params, options) => {
  let reqObj = getReqObj(relativeUrl, params, false, options && options.tokenless);
  return GET(reqObj.url, reqObj.params, Object.assign({
    apiReq: true
  }, options))
}

const getApi_TotalData = (relativeUrl, params, options) => getApi(relativeUrl, params, Object.assign({
  total: true,
  apiReq: true
}, options))



const postApi = (relativeUrl, params, options) => {
  let reqObj = getReqObj(relativeUrl, params, true, options && options.tokenless);
  return POST(reqObj.url, reqObj.params, Object.assign({
    apiReq: true
  }, options))
}
const postApi_TotalData = (relativeUrl, params, options) => postApi(relativeUrl, params, Object.assign({
  total: true,
  apiReq: true
}, options))

const postFormApi = (relativeUrl, params, options) => {
  let reqObj = getReqObj(relativeUrl, params, true, options && options.tokenless);
  return postForm(
    reqObj.url,
    reqObj.params,
    Object.assign({
      apiReq: true,
      isForm: true
    }, options)
  )
}

const postFormApi_TotalData = (relativeUrl, params, options) =>
  postFormApi(relativeUrl, params, Object.assign({
    total: true,
    apiReq: true,
    isForm: true
  }, options))


const json2Form = json => {
  let arr = []
  for (var k in json) {
    arr.push(encodeURIComponent(k) + '=' + encodeURIComponent(json[k]))
  }
  return arr.join('&')
}

const getReqObj = (relativeUrl, params, isPost, tokenless, signType) => {
  signType = signType || 'apiSign';
  // 过滤值为null的参数
  params = filterNullKeyInParams(params);

  let urlObj = {};
  if (!tokenless) {
    urlObj.token = getCacheToken();
  }
  if (!isPost) {
    urlObj = Object.assign(urlObj, params);
  }
  urlObj._s = Date.now();
  let sign = getEnctrySign(relativeUrl, urlObj, signType);

  urlObj = Object.assign(urlObj, {
    sign
  });
  let url = getEncodeUrl(relativeUrl, urlObj);
  if (isPost) {
    return {
      url,
      params
    }
  } else {
    return {
      url
    }
  }
}

const getEncodeUrl = (relativeUrl, urlObj) => {
  let result = apiUrlPrefix + relativeUrl + "?";
  let arr = [];
  for (let k in urlObj) {
    let str = "";
    if (k == "token") {
      str = k + '=' + urlObj[k];
    } else {
      str = k + '=' + encodeURIComponent(urlObj[k]);
    }

    arr.push(str);
  }
  result += arr.join("&");
  return result;
};

const filterNullKeyInParams = (data) => {
  if (!data) {
    return
  }
  for (let key in data) {
    if (!data[key] && data[key] !== 0 && data[key] !== "0" && data[key] !== "") {
      delete (data[key])
    }
  }

  return data;
}

const filterAllNullKeyInParams = (data) => {
  if (!data) {
    return
  }
  for (let key in data) {
    if (!data[key]) {
      delete (data[key])
    }
  }

  return data;
}
export default {
  json2Form,
  GET,
  getReqObj,
  POST,
  postForm,
  getApi,
  postApi,
  postFormApi,
  GET_TotalData,
  POST_TotalData,
  getApi_TotalData,
  postApi_TotalData,
  postFormApi_TotalData,
  filterNullKeyInParams,
  filterAllNullKeyInParams
}