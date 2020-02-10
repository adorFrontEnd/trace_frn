
import React, { Component } from "react";
import { Row, Col, Avatar, Menu, Dropdown, Icon, message, Breadcrumb, Modal } from "antd";
import { connect } from 'react-redux'
import { Link, NavLink } from 'react-router-dom';
import { baseRoute, routerConfig } from '../../../config/router.config';

import TabsNav from './TabsNav';
import { withRouter } from 'react-router-dom';
import { userLogout, getCacheUserInfo, getCacheDomain } from '../../../middleware/localStorage/login';
import '../../../assets/css/common.less'
import './index.less';

class Header extends Component {
  componentWillMount() {
    let userInfo = getCacheUserInfo();
    

    this.setState({
      userName: userInfo.nickname || userInfo.phoneNumber,
      roleName: userInfo.roleName,
      organizationName: userInfo.organizationName || ""
    })
    
  }
  logout = () => {
    Modal.confirm({
      title: '退出登录',
      content: "确认要退出登录吗？",
      onOk: () => {
        userLogout();
        this.props.history.replace(routerConfig['login'].path);
        message.success("你已退出登录！")
      }
    })
  }

  goSetting = () => {
    this.props.history.replace(routerConfig['setting.basicManage'].path + "/" + getCacheDomain());
  }

  render() {
    const DropMenu = (
      <Menu theme="dark">
        {/* <Menu.Item key="1">资料</Menu.Item> */}
        {/* <Menu.Item onClick={this.goSetting.bind(this)} key="2">设置</Menu.Item> */}
        <Menu.Item onClick={this.logout.bind(this)} key="3">注销</Menu.Item>
      </Menu>
    )
    return (
      <div className="header">
        <Row className="header-top">
          <Col span={24} className="flex-between align-center" style={{ height: 60 }}>
            <div>
              {/* <TabsNav /> */}
              <Icon
                style={{ fontSize: "24px", marginLeft: 10 }}
                type={this.props.collapsed ? 'menu-unfold' : 'menu-fold'}
                onClick={this.props.toggle}
              />
            </div>
            <div className="user-login">
            <div className='margin-right20 font-20'>{this.state.organizationName}</div>
              <Dropdown overlay={DropMenu} trigger={['hover', 'click']}>
                <div className="user-menu text-center flex">
                  <Avatar size="large" icon="user" className="avatar margin-right" />
                  <div className='line-height20'>
                    <div className="padding-right text-left ellipsis" style={{ maxWidth: 140 }}>{this.state.userName}</div>
                    <div className="padding-right font-12 ellipsis" style={{ maxWidth: 140 }}>{this.state.roleName}</div>
                  </div>
                </div>
              </Dropdown>
            </div>
          </Col>
        </Row>

        <Row className="breadcrumb">
          <div className="bread-nav">
            <Breadcrumb >
              <Breadcrumb.Item>
                <a>
                  <Icon type="home" />
                </a>
              </Breadcrumb.Item>
              {
                this.props.routeInfo.parentTitle ?
                  <Breadcrumb.Item>
                    <span>{this.props.routeInfo.parentTitle}</span>
                  </Breadcrumb.Item>
                  : null
              }
              <Breadcrumb.Item>
                <a>
                  {this.props.routeInfo.title}
                </a>
              </Breadcrumb.Item>
            </Breadcrumb>
          </div>

        </Row>
      </div>
    )
  }
}

const mapStateToProps = (state, own) => {
  return {
    routeInfo: state.storeRoute.routeInfo
  }
}

export default withRouter(connect(mapStateToProps)(Header))




