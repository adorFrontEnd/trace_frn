import React, { Component } from "react";
import CommonPage from '../../components/common-page';
import { Table, Form, Input, Select, Tabs, Switch, Col, Row, Icon, Radio, Button, Divider, Popconfirm, Modal, Checkbox, InputNumber } from "antd";
import { pagination } from '../../utils/pagination';
import Toast from '../../utils/toast';
import { SearchForm, SubmitForm } from '../../components/common-form';
import dateUtil from '../../utils/dateUtil';
import PictureWall from '../../components/upload/PictureWall';
import { getDetail, saveOrUpdate } from '../../api/setting/drainage';


const _title = "引流设置";
const _description = "";

class Page extends Component {

  state = {
    pageData: null,
    logoPicUrl: "",
    qrcodePicUrl: "",
    id: null,
    drainageChecked: false,
    shouldShowEdit: false
  }
  componentDidMount() {
    this.getPageData();
  }

  getPageData = () => {
    getDetail()
      .then(pageData => {

        if (!pageData) {
          return;
        }

        let { logo, qrCode, id, openDrainageSetting } = pageData;
        this.setState({
          logoPicUrl: logo,
          qrcodePicUrl: qrCode,
          id,
          drainageChecked: openDrainageSetting == '1',
          pageData,
          shouldShowEdit: true
        }, () => {
          this.props.form.setFieldsValue(pageData)
        })

      })
  }

  uploadLogoPic = (picList) => {

    let logoPicUrl = '';
    if (picList && picList.length) {
      logoPicUrl = picList[0];
    }

    this.setState({
      logoPicUrl
    })
  }

  uploadQrcodePic = (picList) => {

    let qrcodePicUrl = '';
    if (picList && picList.length) {
      qrcodePicUrl = picList[0];
    }

    this.setState({
      qrcodePicUrl
    })
  }

  saveDataClick = () => {
    this.props.form.validateFields((err, data) => {
      if (err) {
        return;
      }
      let logo = this.state.logoPicUrl;
      let qrCode = this.state.qrcodePicUrl;

      if (!logo) {
        Toast('请上传公众号Logo图片');
        return;
      }

      if (!qrCode) {
        Toast('请上传公众号二维码图片');
        return;
      }

      let id = this.state.id;
      let params = { ...data, id, logo, qrCode }
      saveOrUpdate(params)
        .then(() => {
          Toast('修改成功！');
          this.getPageData();
        })
    })
  }

  onCheckedChange = (drainageChecked) => {

    if (!this.state.pageData) {
      this.setState({
        drainageChecked: false
      })
      Toast("请配置完公众号信息后再开启！")
      return;
    }
    this.setState({
      drainageChecked
    })
    this.switchDrainageSettingSubmit(drainageChecked);
  }


  switchDrainageSettingSubmit = (openDrainageSetting) => {
    openDrainageSetting = openDrainageSetting ? "1" : "0";
    let { id } = this.state.pageData;
    saveOrUpdate({ openDrainageSetting, id })
      .then(() => {
        let title = `${openDrainageSetting == '1' ? "开启" : "关闭"}引流成功`;
        Toast(title);
        this.getPageData();
      })
  }

  cancelDataClick = () => {
    this.getPageData();
  }

  showEdit = () => {
    this.setState({
      shouldShowEdit: true
    })
  }
  /**渲染**********************************************************************************************************************************/

  render() {
    const { getFieldDecorator } = this.props.form;
    return (
      <CommonPage title={_title} description={_description} >
        <div className='padding-bottom20 flex align-center' >
          <span>防伪开启公众号引流：</span>
          <Switch checked={this.state.drainageChecked} onChange={this.onCheckedChange} />
          <span className='color-red margin-left'>须配置完公众号信息后才能开启,开启后可进行公众号关注统计、使用市场营销功能</span>
        </div>
        {
          this.state.pageData || this.state.shouldShowEdit ?
            <div style={{ width: 440, border: "1px solid #ccc", borderRadius: "6px", padding: 20 }}>
              <div className='line-height20 text-center' style={{ fontSize: 16, fontWeight: "bold", position: "relative", top: '-30px', width: 100, background: "#fff" }}>公众号登记</div>
              <Form className='common-form'>
                <Form.Item
                  labelCol={{ span: 6 }}
                  wrapperCol={{ span: 16 }}
                  label='公众号名称：'
                  key='name'
                  field='name'
                >
                  {
                    getFieldDecorator('name', {
                      rules: [
                        { required: true, message: '输入公众号名称!' }
                      ]
                    })(
                      <Input placeholder="公众号名称" />
                    )
                  }
                </Form.Item>

                <Form.Item
                  labelCol={{ span: 6 }}
                  wrapperCol={{ span: 16 }}
                  label='微信号'
                  key='wechatNum'
                  field='wechatNum'
                >
                  {
                    getFieldDecorator('wechatNum', {
                      rules: [
                        { required: true, message: '输入微信号!' }
                      ]
                    })(
                      <Input placeholder="微信号" />
                    )
                  }
                </Form.Item>

                <Form.Item
                  labelCol={{ span: 6 }}
                  wrapperCol={{ span: 16 }}
                  label='APPID：'
                  key='appId'
                  field='appId'
                >
                  {
                    getFieldDecorator('appId', {
                      rules: [
                        { required: true, message: '输入公众号appId!' }
                      ]
                    })(
                      <Input placeholder="公众号appId" />
                    )
                  }
                </Form.Item>

                <Form.Item
                  labelCol={{ span: 6 }}
                  wrapperCol={{ span: 16 }}
                  label='SECRET：'
                  key='secret'
                  field='secret'
                >
                  {
                    getFieldDecorator('secret', {
                      rules: [
                        { required: true, message: '输入公众号secret!' }
                      ]
                    })(
                      <Input placeholder="输入公众号secret" />
                    )
                  }
                </Form.Item>
              </Form>
              <div style={{ width: 400, borderRadius: "4px", border: "1px solid #ccc", padding: 10, marginTop: 20 }}>
                <div
                  className='line-height20 text-center'
                  style={{ fontSize: 16, fontWeight: "bold", position: "relative", top: '-20px', width: 100, background: "#fff" }}
                >
                  上传logo
            </div>
                <div className='line-height20 padding-bottom'>仅支持JPG、GIF、PNG图片文件，且文件小于3M</div>
                <div className="flex">
                  <PictureWall
                    folder='trace'
                    pictureList={this.state.logoPicUrl ? [this.state.logoPicUrl] : null}
                    uploadCallback={this.uploadLogoPic}
                  />
                </div>
              </div>

              <div style={{ width: 400, borderRadius: "4px", border: "1px solid #ccc", padding: 10, marginTop: 20 }}>
                <div
                  className='line-height20 text-center'
                  style={{ fontSize: 16, fontWeight: "bold", position: "relative", top: '-20px', width: 100, background: "#fff" }}
                >
                  上传二维码
            </div>
                <div className='line-height20 padding-bottom'>仅支持JPG、GIF、PNG图片文件，且文件小于3M</div>
                <div className="flex">
                  <PictureWall
                    folder='trace'
                    pictureList={this.state.qrcodePicUrl ? [this.state.qrcodePicUrl] : null}
                    uploadCallback={this.uploadQrcodePic}
                  />
                </div>
              </div>
              <div className='padding10-0' style={{ width: 400, textAlign: "right" }}>
                <Button onClick={this.saveDataClick} className='margin-right' type='primary'>保存</Button>
                <Button onClick={this.cancelDataClick} >取消</Button>
              </div>
            </div> :
            <div>
              <div>暂未绑定公众号信息</div>
              <Button onClick={this.showEdit} className='margin-right' type='primary'>编辑绑定</Button>
            </div>
        }
      </CommonPage >
    )
  }
}

export default Form.create()(Page);