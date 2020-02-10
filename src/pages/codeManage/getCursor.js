function getCursorPos(pTextArea, text) {
  var cursurPosition = -1;
  if (pTextArea.selectionStart) {//非IE浏览器
    cursurPosition = pTextArea.selectionStart;
  } else {//IE
    if (document.selection) {
      var range = document.selection.createRange();
      range.moveStart("character", -pTextArea.value.length);
      cursurPosition = range.text.length;
    } else {
      cursurPosition = text ? text.length : cursurPosition;
    }
  } 
  return cursurPosition;
}

export {
  getCursorPos
}