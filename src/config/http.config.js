let domain = '';

// domain = "http://47.103.71.160:7200";

//正式服接口
domain = "https://gw.adorsmart.com/traceUserAdmin";
let uploadDomain = "http://sys.trace.adorsmart.com:7200";

//测试服接口
// let uploadDomain = "http://47.103.71.160:7200";

//本地接口
// domain = "http://192.168.20.53:7200";
let apiUrlPrefix = domain + "/";

let uploadApiUrlPrefix = uploadDomain + "/";
let picUrlPrefix = "http://ador-babycar.oss-cn-hangzhou.aliyuncs.com";
let signKey = "94a7cbbf8511a288d22d4cf8705d61d0";
let commonSign = '561wd03kkr86615s1de3x45s1d';
let qrcodeSign = '00461do1156916w1141c56r2ggw2';

export {
  apiUrlPrefix,
  uploadApiUrlPrefix,
  picUrlPrefix,
  domain,
  signKey,
  commonSign,
  qrcodeSign
}