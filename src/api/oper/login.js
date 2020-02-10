import baseHttpProvider from '../base/baseHttpProvider';
import { frnId } from "../../config/app.config.js";
import { md5 } from '../../utils/signMD5.js'
import Toast from '../../utils/toast.js'

/* 获取设备价格*******************************************************************
@params
username:用户名
password:密码
*/
const userLogin = (params) => {
  if (!params || !params.username || !params.password || !params.verifyCode) {
    return Promise.reject();
  }
  params.password = md5(params.password);
  return baseHttpProvider.postFormApi('auth/verifyCodeLogin', params, { tokenless: true })
}

const getAllOper = (params) => {
  return baseHttpProvider.getApi('api/oper/getAll', params)
}

export {
  userLogin,
  getAllOper
}