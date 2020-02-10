import React, { Component } from "react";
import { Col, Row, Checkbox, Card, Modal, Spin, Form, Button, Input, Table } from 'antd';
import Toast from '../../utils/toast';
import CommonPage from '../../components/common-page';
import { SearchForm } from '../../components/common-form';
import dateUtil from '../../utils/dateUtil';
import { getUserAuthDetail, resetSecretKey, saveOrUpdateAuth, deleteAuth } from '../../api/user/user';
import PictureWall from '../../components/upload/PictureWall';

const _description = "";

class Page extends Component {
  state = {
    id: 0,
    showAuthDetailLoading: false,
    authDetail: null,
    logoPicUrl: ""
  }

  componentWillMount() {
    let id = this.props.match.params.id;
    let isEdit = id != "0";
    this.setState({
      id,
      _title: isEdit ? "编辑授权" : "新增授权",
      showAuthDetailLoading: false
    })
    this.getAuthDetail(id);
  }

  getAuthDetail = (id) => {
    id = id || this.state.id;
    if (!id || id == 0) {
      return;
    }

    this._showAuthDetailLoading();
    getUserAuthDetail({ id })
      .then(authDetail => {

        let { applicationName, callbackAddress, logo, remark } = authDetail;
        this.setState({
          authDetail,
          logoPicUrl: logo
        })

        this.props.form.setFieldsValue({
          applicationName, callbackAddress, remark
        });
        this._hideAuthDetailLoading();

      })
      .catch(() => {
        this._hideAuthDetailLoading();
      })
  }

  _showAuthDetailLoading = () => {
    this.setState({
      showAuthDetailLoading: true
    })
  }

  _hideAuthDetailLoading = () => {
    this.setState({
      showAuthDetailLoading: false
    })
  }

  // 返回
  authEditBack = () => {
    window.history.back();
  }

  saveDataClicked = () => {
    this.props.form.validateFields((err, params) => {
      if (err) {
        return;
      }
      params.id = this.state.id;
      let id = !this.state.id || this.state.id == '0' ? null : this.state.id;
      let logo = this.state.logoPicUrl;
      if(!logo){
        Toast('请上传应用图标！');
        return;
      }

      saveOrUpdateAuth({ ...params,logo, id })
        .then(res => {

          Toast(`${id ? "保存" : "添加"}成功!`, "success");
          this.authEditBack();
        })
    })
  }


  uploadPic = (picList) => {

    let logoPicUrl = '';
    if (!picList || !picList.length) {
      this.setState({
        logoPicUrl
      })
      return;
    }
    logoPicUrl = picList[0];
    this.setState({
      logoPicUrl
    })
  }

  render() {
    const { getFieldDecorator } = this.props.form;
    return (
      <CommonPage title={this.state._title} description={_description} >
        <div style={{ width: 640 }}>
          <Row className='line-height40 padding10-0'>
            <Col offset={8}>
              <Button type='primary' style={{ width: 100 }} onClick={this.saveDataClicked}>保存</Button>
              <Button type='primary' className='yellow-btn margin-left' style={{ width: 100 }} onClick={this.authEditBack}>返回</Button>
            </Col>
          </Row>

          <Form className='common-form'>
            <Form.Item
              labelCol={{ span: 8 }}
              wrapperCol={{ span: 16 }}
              label='应用名称'
              field='applicationName'>
              {
                getFieldDecorator('applicationName', {
                  rules: [
                    { required: true, message: '请输入应用名称!' }
                  ]
                })(
                  <Input minLength={0} />
                )
              }
            </Form.Item>
            <Form.Item
              labelCol={{ span: 8 }}
              wrapperCol={{ span: 16 }}
              label='回调地址'
              field='callbackAddress'>
              {
                getFieldDecorator('callbackAddress', {
                  rules: [
                    { required: true, message: '请输入完整的url回调地址!' }
                  ]
                })(
                  <Input minLength={0} />
                )
              }
            </Form.Item>
            <Row className='margin-top10'>
              <Col span={8} className='text-right label-required'>
                应用Logo：
              </Col>
              <Col span={16} >
                <PictureWall
                  folder='trace'
                  pictureList={this.state.logoPicUrl ? [this.state.logoPicUrl] : null}
                  uploadCallback={this.uploadPic}
                />
                <div className='padding10-0 color-red'>图片格式jpg、png；尺寸大小：180px * 180px；图片文件3M以内</div>
              </Col>
            </Row>
            <Form.Item
              labelCol={{ span: 8 }}
              wrapperCol={{ span: 16 }}
              label='备注'
              field='remark'>
              {
                getFieldDecorator('remark')(
                  <Input minLength={0} />
                )
              }
            </Form.Item>
          </Form>
        </div>

      </CommonPage>)
  }
}

export default Form.create()(Page);