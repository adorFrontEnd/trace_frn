import React, { Component } from "react";
import CommonPage from '../../components/common-page';
import { Table, Form, Input, Select, Tabs, Col, Switch, Row, Icon, Button, Divider, Popconfirm, Modal, Spin, Checkbox, InputNumber, DatePicker, Radio } from "antd";
import { getOnlineShopConfigDetail, updateStatusOnlineShopConfig, saveOrUpdateOnlineShopConfig } from "../../api/setting/setting";

import Toast from '../../utils/toast';
const _title = "同步配置";

class Page extends Component {

  state = {
    status: false,
    pageData: null,
    showLoading: false
  }

  componentDidMount() {
    this.getPageData()
  }

  getPageData = () => {
    this.setState({
      showLoading: true
    })
    getOnlineShopConfigDetail()
      .then(pageData => {
        this.setState({
          pageData,
          showLoading: false
        })
        if (!pageData || !pageData.id) {
          this.props.form.setFieldsValue({ appId: "", secret: "", accessToken: "" });
          this.setState({
            status: false
          })
          return;
        }
        let { appId, secret, status, accessToken } = pageData;
        this.setState({
          status: status == '1'
        })
        this.props.form.setFieldsValue({ appId, secret, accessToken });
      })
      .catch(() => {
        this.setState({
          showLoading: false
        })
      })
  }

  onSyncStatusChange = (status) => {

    let title = status ? "开启" : "关闭";
    let id = null;
    let pageData = this.state.pageData;
    if (pageData && pageData.id) {
      id = pageData.id
    } else {
      Toast("请先设置appId与secret并保存！");
      return;
    }

    this.setState({
      status
    })
    updateStatusOnlineShopConfig({ id, status: status ? "1" : "0" })
      .then(() => {
        Toast(`${title}同步网店管家成功！`);
      })
  }

  saveConfirmClicked = () => {

    this.props.form.validateFields((err, params) => {
      if (err) {
        return;
      }

      let pageData = this.state.pageData;
      let id = null;
      if (pageData && pageData.id) {
        id = pageData.id
      }
      let { appId, secret, accessToken } = params;
      let status = this.state.status == '1' ? "1" : "0";
      
      saveOrUpdateOnlineShopConfig({ id, appId, secret, accessToken,status })
        .then(() => {
          Toast('保存成功');
          this.getPageData();
        })
    })


  }

  render() {

    const { getFieldDecorator } = this.props.form;

    return (
      <CommonPage title={_title} >
        <>
          <Spin spinning={this.state.showLoading}>
            <div className='font-20 line-height40 font-bold'>网店管家</div>
            <div className='line-height40'>
              <span className='margin-right20'>网店管家同步</span>
              <Switch checked={this.state.status} onChange={this.onSyncStatusChange} />
            </div>
            <div style={{ marginLeft: 110, marginBottom: 20 }} className='color-red'>开启爱朵钱包后才能使用O2O管理相关功能</div>
            <Form style={{ width: 500 }} className='common-form'>
              <Form.Item
                field="appId"
                label="appId"
                labelCol={{ span: 6 }}
                wrapperCol={{ span: 16 }}
              >
                {
                  getFieldDecorator('appId', {
                    rules: [
                      { required: true, message: '请设置appId!' }
                    ],
                    initialValue: null
                  })(
                    <Input autoComplete="false" placeholder='请设置appId' />
                  )
                }
              </Form.Item>
              <Form.Item
                field="secret"
                label="secret"
                labelCol={{ span: 6 }}
                wrapperCol={{ span: 16 }}
              >
                {
                  getFieldDecorator('secret', {
                    rules: [
                      { required: true, message: '请设置secret!' }
                    ],
                    initialValue: null
                  })(
                    <Input.Password autoComplete="false" visibilityToggle={false} placeholder='请设置secret' />
                  )
                }
              </Form.Item>
              <Form.Item
                field="accessToken"
                label="accessToken"
                labelCol={{ span: 6 }}
                wrapperCol={{ span: 16 }}
              >
                {
                  getFieldDecorator('accessToken', {
                    rules: [
                      { required: true, message: '请设置accessToken!' }
                    ],
                    initialValue: null
                  })(
                    <Input autoComplete="false" placeholder='请设置accessToken' />
                  )
                }
              </Form.Item>

              <Row className='line-height40'>
                <Col offset={6}>
                  <Button onClick={this.saveConfirmClicked} type='primary' className='normal'>保存</Button>
                </Col>

              </Row>
            </Form>
          </Spin>

        </>
      </CommonPage>
    )
  }

}

export default Form.create()(Page);