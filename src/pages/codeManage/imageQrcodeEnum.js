
/**
 * 商品码导出：1验证码、2商品生产码、3商品条码、4商品编码、5自定义文字；
 * 箱规码导出：1箱规生产码、2箱规编码、3自定义文字；
 * 托盘码导出：1自定义文字
 */
const _productImageQrcodeCheckedObj = {
  verifyCode: "验证码",
  produceCode: "商品生产码",
  barCode: "商品条码",
  productCode: "商品编码",
  userDefined: "自定义文字"
}

const _boxImageQrcodeCheckedObj = {
  produceCode: "箱规生产码",
  boxCode: "箱规编码",
  userDefined: "自定义文字"
}

const _trayImageQrcodeCheckedObj = {
  userDefined: "自定义文字"
}


const _productCodeTypeNumEnum = {
  verifyCode: "1",
  produceCode: "2",
  barCode: "3",
  productCode: "4",
  userDefined: "5"
}

const _boxCodeTypeNumEnum = {
  produceCode: "1",
  boxCode: "2",
  userDefined: "3"
}

const _trayCodeTypeNumEnum = {
  userDefined: "1"
}

const _productCodeNumTypeEnum = {
  "1": "verifyCode",
  "2": "produceCode",
  "3": "barCode",
  "4": "productCode",
  "5": "userDefined"
}

const _boxCodeNumTypeEnum = {
  "1": "produceCode",
  "2": "boxCode",
  "3": "userDefined"
}

const _trayCodeNumTypeEnum = {
  "1": "userDefined"
}

const _exampleData = {
  barCode: "0853446007291",
  produceCode: "0004920190800030d41",
  uniqueCode: "08534460072910004920990800030d41",
  productCode: "94558874122",
  boxCode: "94558874122",
  verifyCode: "123456"
}

export {
  _productImageQrcodeCheckedObj,
  _boxImageQrcodeCheckedObj,
  _trayImageQrcodeCheckedObj,
  _productCodeTypeNumEnum,
  _boxCodeTypeNumEnum,
  _trayCodeTypeNumEnum,
  _productCodeNumTypeEnum,
  _boxCodeNumTypeEnum,
  _trayCodeNumTypeEnum,
  _exampleData
}