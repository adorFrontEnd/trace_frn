let code = '';
let lastTime,
  nextTime,
  lastCode,
  nextCode;


let scanEvent = (e, cb) => {
  e = e ? e :(window.event ? window.event : null);
  nextCode =e.keyCode || e.which || e.charCode;
  nextTime = new Date().getTime();
  if (lastCode != null && lastTime != null && nextTime - lastTime <= 30) {
    code += String.fromCharCode(lastCode);
  } else if (lastCode != null && lastTime != null && nextTime - lastTime > 100) {
    code = '';
  } 

  lastCode = nextCode;
  lastTime = nextTime;
 
  if (e.which === 13) {    
    cb(code);
    // console.log('code', code);
    code = '';
  }

  if(e.which == '47'){
    //firefox兼容性
 
    e.stopPropagation();
    e.preventDefault();
    return false;
  } 
}

export { scanEvent };