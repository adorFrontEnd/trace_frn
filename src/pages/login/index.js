import React, { Component } from "react";
import { message } from 'antd';
import LoginForm from './LoginForm';
import { userLogin } from '../../api/oper/login';
import { setCacheUserInfo } from '../../middleware/localStorage/login';
import { baseRoute, routerConfig } from '../../config/router.config';
import { getDecorationSetting } from '../../api/home/home';
import { getCacheDomain, setCacheDomain, setCacheDecoration, getCacheDecoration } from '../../middleware/localStorage/login';
import { title as _appTitle } from '../../config/app.config';
import { getCacheFirstEnterPage } from '../../middleware/localStorage/cacheAuth';

import './index.less';

export default class Login extends Component {

  state = {
    showBtnLoading: false,
    name: _appTitle,
    logo: "/favicon.ico",
    loginImage: "/image/bg.jpg"
  }

  componentDidMount() {

    document.title = _appTitle;
    let decorationData = getCacheDecoration();
    this.renderDecorationData(decorationData);
    this._getDecorationSetting();
  }

  _getDecorationSetting = () => {
    let domainName = this.props.match.params.domain || "ador";
    if (domainName) {
      setCacheDomain(domainName);
    }

    getDecorationSetting({ domainName })
      .then((data) => {
        if (data) {
          this.renderDecorationData(JSON.parse(data));
          setCacheDecoration(data);
        } else {
          this.renderDecorationData(null, true);
          setCacheDecoration('');
        }
      })
      .catch(() => {
        this.renderDecorationData(null, true);
      })
  }

  renderDecorationData = (data, isInit) => {
    if (isInit) {
      this.setState({
        name: _appTitle,
        logo: '/favicon.ico',
        loginImage: '/image/bg.jpg'
      })
      document.title = _appTitle;
      return;
    }
    if (data) {
      let { logo, name, loginImage } = data;
      name = name || this.state.name;
      logo = logo || this.state.logo;
      loginImage = loginImage || this.state.loginImage;
      this.setState({
        name, logo, loginImage
      })
      document.title = name;
    }
  }

  login = (data) => {
    let domainName = this.props.match.params.domain || "ador";
    let params = {
      username: data.username,
      password: data.password,
      verifyCode: data.imageCode,
      domainName,
      now: Date.now()
    }

    if (this.state.showBtnLoading) {
      return
    }

    this.setState({
      showBtnLoading: true
    })

    userLogin(params).then((res) => {

      if (res && res.token) {
        message.success("登录成功！")
        setCacheUserInfo(res);
        setTimeout(() => {
          let firstEnterPagePath = getCacheFirstEnterPage();
          this.props.history.push(routerConfig[firstEnterPagePath].path);
        }, 2000)
        return;
      }
      this.setState({
        showBtnLoading: false
      })
      message.error("登录失败！")
    })
      .catch(() => {
        this.setState({
          showBtnLoading: false
        })
      })
  }
  render() {
    return (
      <div className="login-content" style={{ backgroundImage: `url(${this.state.loginImage})` }}>
        <div className='login-form-content'>
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", borderBottom: "1px solid #D7D7D7" }}>
            <div><img src={this.state.logo} style={{ height: 40, width: 40, marginRight: 10 }} /></div>
            <div className='login-form-title'>{this.state.name}</div>
          </div>

          <LoginForm loading={this.state.showBtnLoading} login={this.login} />
        </div>
      </div>
    )
  }
}



