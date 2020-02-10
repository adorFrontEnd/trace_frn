import React, { Component } from "react";
import CommonPage from '../../components/common-page';
import { Table, Form, Input, Select, Tabs, Spin, Col, Row, Icon, Radio, Button, Divider, Popconfirm, Modal, Checkbox, InputNumber } from "antd";
import { pagination } from '../../utils/pagination';
import Toast from '../../utils/toast';
import { SearchForm, SubmitForm } from '../../components/common-form';
import dateUtil from '../../utils/dateUtil';
import PictureWall from '../../components/upload/PictureWall';
import { getDetail, saveOrUpdate } from '../../api/setting/decoration';


const _title = "装修设置";
const _description = "";

class Page extends Component {

  state = {
    pageData: null,
    loading: false,
    logoPicUrl: "",
    loginImagePicUrl: "",
    id: null
  }
  componentDidMount() {
    this.getPageData();
  }

  getPageData = () => {
    this.setState({
      loading: true
    })
    getDetail()
      .then(pageData => {
        this.setState({
          loading: false
        })
        if (!pageData) {
          return;
        }

        let { logo, loginImage, id } = pageData;
        this.setState({
          logoPicUrl: logo,
          loginImagePicUrl: loginImage,
          id
        })
        this.props.form.setFieldsValue(pageData)
      })
      .catch(() => {
        this.setState({
          loading: false
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

  uploadLoginImgPic = (picList) => {

    let loginImagePicUrl = '';
    if (picList && picList.length) {
      loginImagePicUrl = picList[0];
    }

    this.setState({
      loginImagePicUrl
    })
  }

  saveDataClick = () => {
    this.props.form.validateFields((err, data) => {
      if (err) {
        return;
      }
      let logo = this.state.logoPicUrl;
      let loginImage = this.state.loginImagePicUrl;

      if (!logo) {
        Toast('请上传Logo图片');
        return;
      }

      if (!loginImage) {
        Toast('请上传登录背景图片');
        return;
      }

      let id = this.state.id;
      let params = { ...data, id, logo, loginImage }
      saveOrUpdate(params)
        .then(() => {
          Toast('修改成功！');
          this.getPageData();
        })
    })
  }

  /**渲染**********************************************************************************************************************************/

  render() {
    const { getFieldDecorator } = this.props.form;
    return (
      <CommonPage title={_title} description={_description} >
        <Spin spinning={this.state.loading} className='padding20'>
          <div style={{ width: 600, padding: 20 }}>
            <div className='line-height20 text-center' style={{ fontSize: 16, fontWeight: "bold", position: "relative", top: '-30px', width: 100, background: "#fff" }}>公众号登记</div>
            <Row className='line-height40'>
              <Col span={6}>
                <div className='text-right label-required'>Logo图片：</div>
              </Col>
              <Col span={16}>
                <div>
                  <PictureWall
                    folder='trace'
                    pictureList={this.state.logoPicUrl ? [this.state.logoPicUrl] : null}
                    uploadCallback={this.uploadLogoPic}
                  />
                  <span className='color-red'>推荐图片长宽比例 1：1</span>
                </div>
              </Col>
            </Row>

            <Row className='line-height40'>
              <Col span={6}>
                <div className='text-right label-required'>登录背景图片：</div>
              </Col>
              <Col span={16}>
                <div>
                  <PictureWall
                    folder='trace'
                    pictureList={this.state.loginImagePicUrl ? [this.state.loginImagePicUrl] : null}
                    uploadCallback={this.uploadLoginImgPic}
                  />
                  <span className='color-red'>推荐图片长宽比例 16：9</span>
                </div>
              </Col>
            </Row>

            <Form className='common-form'>
              <Form.Item
                labelCol={{ span: 6 }}
                wrapperCol={{ span: 16 }}
                label='系统名称：'
                key='name'
                field='name'
              >
                {
                  getFieldDecorator('name', {
                    rules: [
                      { required: true, message: '输入系统名称!' },
                      { max: 10, message: '请不要超过10个字！' }
                    ]
                  })(
                    <Input allowClear placeholder="系统名称" />
                  )
                }
              </Form.Item>
            </Form>

            <Row className='line-height40'>
              <Col offset={6} span={16}>
                <div className='padding10-0' style={{ width: 400 }}><Button onClick={this.saveDataClick} type='primary'>重新登录生效</Button></div>
              </Col>
            </Row>

          </div>
        </Spin>
      </CommonPage >
    )
  }
}

export default Form.create()(Page);