// 格式化数字，00
const formatNumber = n => {
  n = n.toString();
  return n[1] ? n : '0' + n
}

// 格式化时间间隔为json，返回json，calDay为真时计算天（如1天1小时），calDay为假时计算包含天的小时数（如25时）
const formatDateTimeDurationJson = (timeStamp, calDay) => {
  const day = Math.floor(timeStamp / (3600 * 24));
  const d = timeStamp % (3600 * 24);
  const hour = calDay ? Math.floor(d / 3600) : Math.floor(timeStamp / 3600);
  const m = timeStamp % 3600;
  const minute = Math.floor(m / 60);
  const second = m % 60;
  let result = {
    hour,
    minute,
    second
  }
  if (calDay) {
    result.day = day;
  }
  return result;
}

// 格式化时间间隔
const _formatDurationTime = (timeStamp, calDay, noSecond) => {
  let data = formatDateTimeDurationJson(timeStamp, calDay);
  let day = data.day;
  let hour = data.hour;
  let minute = data.minute;
  let second = data.second;
  let arr = calDay ? [day, hour, minute, second] : [hour, minute, second];
  if (noSecond) {
    arr.pop();
  }
  return arr
}

//结果   1:01:01:01  或者 25:01:01
const formatDuration = (timeStamp, calDay, noSecond) => _formatDurationTime(timeStamp, calDay, noSecond).map(formatNumber).join(':');

// 格式化时间间隔（如耗时1天1小时1分，耗时1小时，耗时1分钟等）不显示高位为0的情况（如0天）
const formatDuration_hanzi = (timeStamp, calDay, calSecond) => {
  let data = formatDateTimeDurationJson(timeStamp, calDay);
  let day = data.day;
  let hour = data.hour;
  let minute = calSecond ? data.minute : parseInt(data.minute) + 1;
  let second = data.second;
  let timeArr = [hour, minute];
  let charArr = ['小时', '分钟'];
  if (calDay) {
    timeArr.unshift(day);
    charArr.unshift("天");
  }

  if (calSecond) {
    timeArr.push(second);
    charArr.push("秒");
  }
  let validTimeArr = _getValidTimeArr(timeArr);
  let len = validTimeArr.length;
  let validCharArr = charArr.slice(charArr.length - len);
  if (len == 1 && validTimeArr[0] == 0) {
    return calSecond ? "1秒" : "1分钟"
  }
  validTimeArr.map(formatNumber);
  let resultStr = '';
  for (let i = 0; i < len; i++) {
    resultStr += validTimeArr[i] + validCharArr[i]
  }
  return resultStr;
}

const _getValidTimeArr = (arr) => {
  if (!arr || arr.length == 0) {
    return arr;
  }
  let index = -1;
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] != 0) {
      index = i;
      break;
    }
  }
  return arr.slice(index);
}

const _getDateStamp = (stamp, isStamp10) => {
  if (!stamp) {
    return;
  }
  let stampInt = parseInt(stamp);
  return isStamp10 ? stampInt * 1000 : stampInt;
}

const getDate = (stamp, ishanzi, label, isStamp10, noYear) => {
  label = label || label === '' ? label : "-";
  let date = stamp ? (new Date(_getDateStamp(stamp, isStamp10))) : (new Date())
  const year = date.getFullYear().toString();
  const month = date.getMonth() + 1
  const day = date.getDate();
  let arrTemp = noYear ? [month, day] : [year, month, day]
  let arr = arrTemp.map(formatNumber);
  let hanziResult = noYear ? arr[0] + "月" + arr[1] + "日" : arr[0] + "年" + arr[1] + "月" + arr[2] + "日";
  return ishanzi ? hanziResult : arr.join(label);
}
const getDate_stamp10 = (stamp, ishanzi, label, noYear) => getDate(stamp, ishanzi, label, true, noYear);

const getTime = (stamp, noSecond, isStamp10) => {
  let date = stamp ? (new Date(_getDateStamp(stamp, isStamp10))) : (new Date())
  const hour = date.getHours();
  const minute = date.getMinutes();
  const second = date.getSeconds();
  let arr = [hour, minute];
  if (!noSecond) {
    arr.push(second);
  }
  return arr.map(formatNumber).join(":");
}

const getTime_stamp10 = (stamp, noSecond) => getTime(stamp, noSecond, true);

const getDateTime = (stamp, ishanzi, label, noSecond, isStamp10) => {
  return getDate(stamp, ishanzi, label, isStamp10) + " " + getTime(stamp, noSecond, isStamp10);
}

const getDateTime_stamp10 = (stamp, ishanzi, label, noSecond) => getDateTime(stamp, ishanzi, label, noSecond, true)

const getNowDate = (ishanzi, label) => getDate(null, ishanzi, label);
const getNowTime = () => getTime();
const getNowDateTime = (ishanzi, label) => {
  return getNowDate(ishanzi, label) + " " + getNowTime()
}

const getRecentDay = (stamp, num) => {
  // num为负数
  num = parseInt(num) || 0;
  stamp = stamp || Date.now();
  let dayStamp = stamp + num * 3600 * 1000 * 24;
  return getDate(dayStamp, false, '');
}

const getRecentDays = (stamp, num) => {
  // num为负数
  num = parseInt(num) || -1;
  let dayArr = [];
  for (let i = num; i < 0; i++) {
    let day = getRecentDay(stamp, i);
    dayArr.push(day)
  }
  return dayArr;
}

const getRecentYears = (stamp, num) => {
  stamp = stamp || Date.now();
  num = parseInt(num) || 3;
  let year = (new Date(stamp)).getFullYear();
  let yearInt = parseInt(year);
  let arr = [];
  for (let i = 0; i < num; i++) {
    arr.push(yearInt - i);
  }
  return arr;
}


const getDayStartStamp = (stamp) => {
  let dateTime = getDateTime(stamp);
  let dayStr = dateTime.substr(0, 10);
  let result = Date.parse(dayStr + " 00:00:00");
  return result;
}

const getDayStopStamp = (stamp) => {
  let dateTime = getDateTime(stamp);
  let dayStr = dateTime.substr(0, 10);
  let result = Date.parse(dayStr + " 23:59:59.999");
  return result;
}

const getTimeRangeByOneStamp = (time, startKey, stopKey) => {
  if (time) {
    let stamp = Date.parse(time);
    let startTimeStamp = getDayStartStamp(stamp);
    let endTimeStamp = getDayStopStamp(stamp);
    let data = {};
    data[startKey] = startTimeStamp;
    data[stopKey] = endTimeStamp;
    return data
  }
  return {}
}

const getTimeRangeByTimeArr = (time, startKey, stopKey) => {
  if (time && time.length) {
    let [startTime, stopTime] = time;
    let startTimeStamp = startTime ? getDayStartStamp(Date.parse(startTime)) : null;
    let endTimeStamp = stopTime ? getDayStopStamp(Date.parse(stopTime)) : null;
    let data = {};
    data[startKey] = startTimeStamp;
    data[stopKey] = endTimeStamp;
    return data
  }
  return {}
}


export default {
  formatDuration,
  formatDuration_hanzi,
  getDate,
  getDate_stamp10,
  getTime,
  getTime_stamp10,
  getDateTime,
  getDateTime_stamp10,
  getNowDate,
  getNowTime,
  getNowDateTime,
  getRecentDay,
  getRecentDays,
  getRecentYears,
  getDayStartStamp,
  getDayStopStamp,
  getTimeRangeByOneStamp,
  getTimeRangeByTimeArr
}