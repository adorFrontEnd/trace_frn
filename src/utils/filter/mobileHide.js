const mobileHide =(mobile)=>{
  if (mobile && mobile.toString().length == 11){
    let str = mobile.toString();
    return str.slice(0, 3) + "****" + str.slice(-4);
  }
}

module.exports = mobileHide;