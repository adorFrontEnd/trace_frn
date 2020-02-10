import { md5, signMD5 } from "./signMD5.js";
import { signKey, commonSign,qrcodeSign } from "../config/http.config.js";

//爱朵的签名方式
const getEnctrySign = (uri, params, signType) => {
  let str = getSignStr(uri, params,null, signType);
  let encodeStr = encodeURIComponent(str);
  let result = signMD5(encodeStr);
  return result;
}

const getSignStr = (uri, params, sep, signType) => {
  let arr = uri ? [uri] : [];
  sep = sep || "_";
  if (params.token) {
    params.token = encodeURIComponent(params.token);
  }
  if (params) {
    let keyArr = Object.keys(params).sort();
    keyArr.forEach(k => {
      let s = k + "=" + params[k];
      arr.push(s);
    });
  }
  let _signKey = '';
  switch (signType){
    default:
    case 'apiSign':
    _signKey = signKey;
    break;

    case 'qrcodeSign':
    _signKey = qrcodeSign;
    break;
  }
  
  arr.push(_signKey);
  return arr.join(sep);
}

export {
  getEnctrySign
}