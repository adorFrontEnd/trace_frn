import React, { Component } from 'react';
import Router from './router/router'
import zhCN from 'antd/lib/locale-provider/zh_CN';
import { withRouter } from 'react-router-dom';
import moment from 'moment';
import 'moment/locale/zh-cn';
import { LocaleProvider } from 'antd';

moment.locale('zh-cn');

class App extends Component {
  render() {
    return (
      <LocaleProvider locale={zhCN}>
        <Router />
      </LocaleProvider>
    );
  }
}

export default App;

