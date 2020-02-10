import { message } from 'antd';
import React from 'react';
const toast = (title, type, duration) => {
  type = type || 'info'
  duration = duration || 3;
  message[type](<span dangerouslySetInnerHTML={{ __html: title }}></span>, duration);
}
export default toast