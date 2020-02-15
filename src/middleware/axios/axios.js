import axios from "axios";
import {
  apiUrlPrefix
} from "../../config/http.config.js";
import Toast from '../../utils/toast.js';
import { goLogin } from '../../router/routerJump';
import { userLogout } from '../localStorage/login';

const _request = (url, params, method, options) => {
  options = options || {};
  let resolveTotal = options.total;
  let defaultToastData = {
    required: true,
    failTitle: "请求失败!",
    errorTitle: '网络错误!',
    serverErrorTitle: "服务器错误！",
    overTokenErrorTitle: "登录已过期，请重新登录！"
  }
  let apiReq = options.apiReq;

  let headerConfig = {
    'Content-Type': 'application/json; charset=UTF-8'
  }
  let header = Object.assign(headerConfig, options.header)

  let toastData = Object.assign(defaultToastData, options.toast);

  if (method == "POST" && options.isForm) {
    params = getFormData(params);
  }

  let axiosParams = {
    // headers:header,
    method: method || "GET", //请求方式

    url: url, //请求地址,

    // `params` 是即将与请求一起发送的 URL 参数
    // 必须是一个无格式对象(plain object)或 URLSearchParams 对象
    params: params,

    // `data` 是作为请求主体被发送的数据
    // 只适用于这些请求方法 'PUT', 'POST', 和 'PATCH'
    // 在没有设置 `transformRequest` 时，必须是以下类型之一：
    // - string, plain object, ArrayBuffer, ArrayBufferView, URLSearchParams
    // - 浏览器专属：FormData, File, Blob
    // - Node 专属： Stream
    data: params
  }

  if (!method || method == 'GET') {
    axiosParams.data = null
  } else {
    axiosParams.params = null
  }
  if (method == "POST" && !options.isForm) {
    axiosParams.headers = {'Content-Type': 'application/json'};
    axiosParams.data = params
  }

  return new Promise((resolve, reject) => {
    axios(axiosParams).then((res) => {
      if (!apiReq) {
        resolve(res.data);
        return;
      }

      if (res.data.status == 'SUCCEED') {
        if (resolveTotal) {
          resolve(res.data)
        } else {
          resolve(res.data.data)
        }
        return;
      }

      if (toastData.required) {
        if(res.data.errorCode == "SYS.0003" || res.data.errorCode == "SYS.0002"){                   
          Toast(toastData.overTokenErrorTitle, 'error');
          goLogin();
          userLogout();
        }else if (res.data.errorCode == "SYS.0000") {
          Toast(toastData.serverErrorTitle, 'error')
        } else if (res.data.errorMessage) {
          Toast(res.data.errorMessage, 'warning')
        } else {
          Toast(toastData.failTitle, 'warning');
        }
      }
      reject(res.data)
    }).catch((res) => {
      reject(res.data);
      if (toastData.required) {
        Toast(toastData.errorTitle, 'error');
      }
    })
  })
}

const getFormData = (data) => {
  if (!data) {
    return;
  }
  let formdata = new FormData();
  for (let key in data) {
    formdata.append(key, data[key]);
  }
  return formdata
}

export {
  _request
}