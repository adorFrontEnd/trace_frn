import React, { Component } from "react";
import CommonPage from '../../components/common-page';
import { Table, Form, Input, Select, Tabs, Col, Switch, Row, Icon, Button, Divider, Popconfirm, Modal, Spin, Checkbox, InputNumber, DatePicker, Radio } from "antd";
import { getAdorPayConfigDetail, getOnlineShopConfigDetail, updateStatusAdorPayConfig, updateStatusOnlineShopConfig, saveOrUpdateAdorPayConfig, saveOrUpdateOnlineShopConfig } from "../../api/setting/setting";

import Toast from '../../utils/toast';
const _title = "支付配置";

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
    getAdorPayConfigDetail()
      .then(pageData => {
        this.setState({
          pageData,
          showLoading: false
        })
        if (!pageData || !pageData.id) {
          return;
        }
        let { appId, secret, status } = pageData;
        this.setState({
          status: status == '1'
        })
        this.props.form.setFieldsValue({ appId, secret });
      })
      .catch(() => {
        this.setState({
          showLoading: false
        })
      })
  }

  onAdorPayChange = (status) => {
    this.setState({
      status
    })
    let title = status ? "开启" : "关闭";
    let id = null;
    let pageData = this.state.pageData;
    if (pageData && pageData.id) {
      id = pageData.id
    } else {
      Toast("请先设置appId与secret并保存！");
      return;
    }
    updateStatusAdorPayConfig({ id, status: status ? "1" : "0" })
      .then(() => {
        Toast(`${title}爱朵支付成功！`);
      })
  }

  saveConfirmClicked = () => {

    this.props.form.validateFields((err, params) => {
      if (err) {
        return;
      }
      let id = null;
      let pageData = this.state.pageData;
      if (pageData && pageData.id) {
        id = pageData.id;
      }

      let { appId, secret } = params;
      saveOrUpdateAdorPayConfig({ id, appId, secret })
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
        <Spin spinning={this.state.showLoading}>
          <Tabs tabPosition='left' onChange={this.onMainTabsChange} type="card">
            <Tabs.TabPane tab="支付通道" key="1">
              <div className='line-height40'>
                <span className='margin-right20'>开启爱朵钱包</span>
                <Switch checked={this.state.status} onChange={this.onAdorPayChange} />
              </div>
              <div style={{ marginLeft: 110, marginBottom: 20 }} className='color-red'>开启爱朵钱包后才能使用O2O管理相关功能</div>
              <Form style={{ width: 500 }} className='common-form'>
                <Form.Item
                  field="appId"
                  label="appId"
                  labelCol={{ span: 4 }}
                  wrapperCol={{ span: 16 }}
                >
                  {
                    getFieldDecorator('appId', {
                      rules: [
                        { required: true, message: '请设置appId!' }
                      ],
                      initialValue: null
                    })(
                      <Input placeholder='请设置appId' />
                    )
                  }
                </Form.Item>
                <Form.Item
                  field="secret"
                  label="secret"
                  labelCol={{ span: 4 }}
                  wrapperCol={{ span: 16 }}
                >
                  {
                    getFieldDecorator('secret', {
                      rules: [
                        { required: true, message: '请设置secret!' }
                      ],
                      initialValue: null
                    })(
                      <Input.Password visibilityToggle={false} placeholder='请设置secret' />
                    )
                  }
                </Form.Item>
                <Row className='line-height40'>
                  <Col offset={4}>
                    <Button onClick={this.saveConfirmClicked} type='primary' className='normal'>保存</Button>
                  </Col>

                </Row>
              </Form>
            </Tabs.TabPane>
          </Tabs>
        </Spin>
      </CommonPage>
    )
  }

}

export default Form.create()(Page);