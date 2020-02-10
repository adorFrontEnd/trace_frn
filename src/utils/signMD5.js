import md5 from "js-md5";
const signMD5 = (s) => {
  let hexDigits = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f'];
  let inputBytes = str2u8arr(s);
  let md = md5.array(inputBytes);
  let j = md.length;
  let str = new Array(j * 2);
  let k = 0;
  for (let i = 0; i < j; ++i) {
    let byte0 = md[i];
    str[k++] = hexDigits[byte0 >>> 4 & 15];
    str[k++] = hexDigits[byte0 & 15];
  }
  return str.join("");
}

const str2u8arr = (str) => {
  let len = str.length;
  let arr = [];
  for (let i = 0; i < len; i++) {
    arr.push(str.charCodeAt(i));
  }
  return new Uint8Array(arr);
};

export{
  md5,
  signMD5
};