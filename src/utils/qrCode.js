import { deviceQRprefix, stationQRprefix } from '../config/app.config';
import { getEnctrySign } from "./sign";
import { getServerCurrentTime } from '../api/SYS/SYS';
import { parseUrl } from "./urlUtils";
const getQRid = (id, type) => {
  let md5Key, result = '';
  if (type == "device") {
    md5Key = getEnctrySign('wxapp/adorgroup/xzs/device', { id }, 'qrcodeSign');
    result = `id=${id}&key=${md5Key}`;
    return result;
  }
}

const getQRCodeSourceUrl = (id, type) => {
  let qrprefix = "";
  let qrstr = "";
  if (type == "device") {
    qrprefix = deviceQRprefix;
    qrstr = getQRid(id, type)
    let result = qrprefix + "?" + qrstr;
    return result;
  }
  return
}

const getAsyncQRid = (id, type) => {

  return new Promise((resolve, reject) => {
    let md5Key, result = '';
    if (type == "station") {
      getServerCurrentTime()
        .then(res => {
          if (!res || !res.time) {
            reject();
          }
          let stamp = res.time;
          md5Key = getEnctrySign('wxapp/adorgroup/xzs/station', { id, stamp }, 'qrcodeSign');
          result = `id=${id}&stamp=${stamp}&key=${md5Key}`
          resolve(result);
        })
        .catch(() => { reject(); });
    }
  });
}

const getAsyncQRCodeSourceUrl = (id, type) => {
  return new Promise((resolve, reject) => {
    type = type || "station";
    let qrprefix = "";
    switch (type) {
      default:
      case "station":
        qrprefix = stationQRprefix;
        break;
    }
    getAsyncQRid(id, type)
      .then(qrstr => {
        if (!qrstr) {
          reject();
        }
        let result = qrprefix + "?" + qrstr;
        return resolve(result);
      })
      .catch(() => {
        return reject();
      })
  })
}

const parseScanCodeCompatBarCode = (res) => {

  let barcode = parseBarCode(res);
  if (barcode) {
    return barcode
  }

  let qrcode = parseScanCode(res);
  return qrcode;
}


// 解析二维码地址
const parseScanCode = (res) => {


  if (!res || res.length < 20 || !(/h5.trace.adorsmart.com/.test(res))) {
    return;
  }
  let length = res.length;
  let lastChar = res.substr(length - 1);

  if (lastChar != "@") {
    return;
  }
  res = res.substr(0, length - 1);

  let urlObj = parseUrl(res);
  let codeType = getUriCodeType(res);
  if (!urlObj || !urlObj.args || !urlObj.args.code || !urlObj.args.key || !codeType) {
    return;
  }

  let result = validateKey(urlObj.args, "code/" + codeType);
  if (!result) {
    return;
  }

  if (codeType == 'product') {
    let _productBarCode = result.code;

    if (_productBarCode.length > 19) {
      let productBarCode = _productBarCode.slice(0, -19);
      result.prdBarCode = productBarCode;
    }
  }

  if (codeType == 'box') {
    let _boxBarCode = result.code;

    if (_boxBarCode.length > 19) {
      let boxBarCode = _boxBarCode.slice(0, -19);
      result.boxBarCode = boxBarCode;
    }
  }

  return {
    ...result,
    codeType
  };
}

const parseBarCode = (res) => {
  if (!res || res.length < 18) {
    return;
  }

  let firstWord = res.substr(0, 1);
  if (firstWord == 'X') {
    return {
      codeType: "box",
      code: res
    }
  } else {
    return;
  }
}

// 验证key
const validateKey = (args, uri) => {

  let key = args.key;
  delete args["key"];
  return key == getEnctrySign(uri, args, 'qrcodeSign') ? args : null
}

const getUriCodeType = (url) => {
  if (!url) {
    return;
  }
  let startIndex = url.lastIndexOf("/");
  let stopIndex = url.lastIndexOf("?");
  if (startIndex == -1 || stopIndex == -1) {
    return;
  }

  return url.slice(startIndex + 1, stopIndex);
}
export {
  getQRCodeSourceUrl,
  getAsyncQRCodeSourceUrl,
  parseScanCode,
  parseScanCodeCompatBarCode
}