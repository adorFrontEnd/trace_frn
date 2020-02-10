const numberFilter = (num, numType) => {
  const arrNum = num.toString().split(".");
  if (numType == 'int') {
    return arrNum[0] ? arrNum[0] : "0";
  }
  if (arrNum.length == 1) {
    return (arrNum[0] ? arrNum[0] : "0") + ".00";
  }

  if (arrNum[1].length >= 2) {
    return (arrNum[0] ? arrNum[0] : "0") + "." + arrNum[1].substr(0, 2);
  }
  return (arrNum[0] ? arrNum[0] : "0") + "." + arrNum[1].substr(0, 1) + "0";
}

module.exports = numberFilter;