import React, { Component } from "react";
import CommonPage from '../../components/common-page';
import { Table, Form, Input, Select, Collapse, Col, Row, Icon, Spin, Button, Upload, Divider, Tabs, Popconfirm, Radio, Modal, Checkbox, InputNumber, DatePicker } from "antd";
import Toast from '../../utils/toast';
import { SearchForm, SubmitForm } from '../../components/common-form';
import dateUtil from '../../utils/dateUtil';
import { saveOrUpdate, updateStatus, getActivityCouponDetail, getBusinessList, searchBusinessEventVoucherList } from '../../api/activityCoupon/activityCoupon';
import PictureWall from '../../components/upload/PictureWall';
import { getUpdatePictureUrl } from '../../api/product/product';
import { parseUrl } from '../../utils/urlUtils';
import RichText from '../../components/RichText/RichText';
import { connect } from 'react-redux';
import { changeRoute } from '../../store/actions/route-actions';
import LocationMap from '../dealer/LocationAmap';
import moment from 'moment';

const _title = "创建活动券";
const _description = "";
const _updateUrl = getUpdatePictureUrl({ folder: "pdf" });

class activityCouponPage extends Component {

  state = {

    showPageLoading: false,
    selectactivityCoupon: {},

    activityCouponModalVisible: false,
    resetFormItem: null,
    mainImage: null,
    showHeaderImgValidateInfo: false,
    showBannerImgValidateInfo: false,

    editFormValue: null,
    selectActivityCouponModalData: null,
    updateLogTime: null,

    pdfFile: null,
    fileUploading: false,

    areaType: "0",
    constantAreaType: "0",
    areaDistant: null,
    areaList: [],

    expiredStatus: 1,
    userBuyLimit: false,
    purchases: 1,
    bannerList: null,
    merchantList: null,
    expireConstantTime: null,
    expireConstantDays: 1,
    disabledEdit: false
  }

  componentDidMount() {

    let id = this.props.match.params.id;
    let isEdit = id && id != 0
    let title = isEdit ? "活动券编辑" : "活动券添加";
    this.setState({
      id: isEdit ? id : null,
      isEdit,
      _title: title,
      showActivityDetailLoading: false
    })
    this.props.changeRoute({ path: 'o2oManage.activityCouponEdit', title, parentTitle: 'O2O管理' });
    this.getMerchantList();
    this.getPageData();
  }


  // 获取页面列表
  getPageData = () => {

    let id = this.getUrlAppId() || null;
    if (!id || id == "0") {
      this.revertActivityCouponCodeData();
      this.setState({
        activityCouponData: {}
      })
      return;
    }
    this.setState({
      showPageLoading: true
    })
    getActivityCouponDetail({ id })
      .then(activityCouponData => {
        this.setState({
          activityCouponData
        })
        this.revertActivityCouponCodeData(activityCouponData);
      })
      .catch(() => {
        this.setState({
          showPageLoading: false
        })
      })
  }

  getUrlAppId = () => {
    let urlParams = parseUrl(this.props.location.search);
    if (urlParams && urlParams.args && urlParams.args.id) {
      return urlParams.args.id
    }
  }

  /**新加商家*******************************************************************************************************************************/

  revertActivityCouponCodeData = (record) => {
    this.setState({
      showPageLoading: false
    })
    if (record) {
      let { expiredStatus, mainImage, carouselImage, details, expiredTime, buyStatus, purchases, saleNumber } = record
      let bannerList = carouselImage.split(",");
      let expireConstantTime = null;
      let expireConstantDays = null;
      let userBuyLimit = buyStatus == '2';
      if (expiredStatus == '2') {
        expireConstantTime = moment(expiredTime);
        expireConstantDays = null;
      }

      if (expiredStatus == '3') {
        expireConstantTime = null
        expireConstantDays = expiredTime;
      }


      this.props.form.setFieldsValue(record);
      this.setState({
        expiredStatus,
        bannerList,
        mainImage,
        carouselImage,
        expireConstantTime,
        expireConstantDays,
        details,
        userBuyLimit,
        purchases,
        saleNumber,
        showSaleNumber: true,
        disabledEdit: true,
        selectData: record
      })

    } else {

      this.setState({
        selectData: null,
        mainImage: null,
        editFormValue: null,
        saleNumber: null,
        showSaleNumber: false,
        selectActivityCouponModalData: null,
        disabledEdit: false
      })
    }
  }

  uploadActivityCouponHeadPic = (picList) => {
    let mainImage = ''
    if (!picList || !picList.length) {
      this.setState({
        mainImage
      })
      return;
    }
    mainImage = picList[0];
    this.setState({
      mainImage
    })
  }

  uploadBannerList = (bannerList) => {
    this.setState({
      bannerList
    })

    if (bannerList && bannerList.length) {
      let carouselImage = bannerList.join();
      this.setState({
        carouselImage
      })
    }
  }

  // 返回
  goEditBack = () => {
    window.history.back();
  }


  onexpiredStatusChange = (e) => {
    let expiredStatus = e.target.value;
    this.setState({
      expiredStatus
    })
  }

  onUserBuyLimitChange = (e) => {

    let userBuyLimit = e.target.checked;
    this.setState({
      userBuyLimit
    })
  }

  onPurchasesChange = (purchases) => {
    this.setState({
      purchases
    })
  }



  saveClicked = () => {
    this.props.form.validateFields((err, data) => {
      if (err) {
        return;
      }

      let { expiredStatus, stock } = data;
      if (this.state.selectData && this.state.selectData.stock) {
        let oldStock = this.state.selectData.stock;
        if (parseInt(stock) < parseInt(oldStock)) {
          Toast("库存剩余不能减少！");
          return;
        }
      }

      let { expireConstantDays, expireConstantTime, purchases, userBuyLimit, carouselImage, details } = this.state;
      let expiredTime = null;
      let buyStatus = userBuyLimit ? "2" : "1";
      if (expiredStatus == 2) {
        if (!expireConstantTime) {
          Toast('请设置截止时间！');
          return;
        }
        expiredTime = dateUtil.getDateTime(Date.parse(expireConstantTime));
      }

      if (expiredStatus == 3) {
        if (!expireConstantDays) {
          Toast('请设置固定天数！');
          return;
        }
        expiredTime = expireConstantDays;
      }

      if (!userBuyLimit) {
        purchases = null;
      }

      let mainImage = this.state.mainImage;
      if (!mainImage) {
        this.setState({
          showHeaderImgValidateInfo: true
        })
        return;
      } else {
        this.setState({
          showHeaderImgValidateInfo: false
        })
      }

      if (!carouselImage) {
        this.setState({
          showBannerImgValidateInfo: true
        })
        return;
      } else {
        this.setState({
          showBannerImgValidateInfo: false
        })
      }
      let { id } = this.state.activityCouponData;
      let params = {
        ...data,
        id,
        mainImage,
        buyStatus,
        carouselImage,
        expiredStatus,
        expiredTime,
        purchases,
        details
      }

      let toastTitle = "添加商家成功！";
      if (id) {
        toastTitle = "修改商家成功！";
      }


      saveOrUpdate(params)
        .then(() => {
          Toast(toastTitle);
          this.getPageData();
          this.goEditBack();
        })

      console.log(params)
    })
  }

  getMerchantList = () => {
    getBusinessList()
      .then(merchantList => {
        this.setState({
          merchantList
        })
      })
  }

  /**更改活动券商家 **********************************************************************************/
  onSelectMerchantChange = (selectMerchantId) => {
    let merchantList = this.state.merchantList;
    if (!selectMerchantId || !merchantList || merchantList.length == 0) {
      this.props.form.setFieldsValue({
        serviceAddress: ""
      })
      return;
    }

    let selectMerchantList = merchantList.filter(item => item && (item.id == selectMerchantId));
    let selectMerchant = selectMerchantList[0];
    if (selectMerchant && selectMerchant.areaList && selectMerchant.areaList.length && selectMerchant.areaList[0].address) {
      let selectMerchantAreaAddress = selectMerchant.areaList[0].address;
      this.props.form.setFieldsValue({
        serviceAddress: selectMerchantAreaAddress
      })
    }
  }

  //过期时间
  onExpireTimeChange = (e, k) => {
    if (k == 'time') {
      let expireConstantTime = e ? moment(Date.parse(e)) : null;
      this.setState({
        expireConstantTime
      })
    }

    if (k == 'days') {
      let expireConstantDays = e;
      this.setState({
        expireConstantDays
      })
    }

  }
  /**富文本 ******************************************************************************************************************************/

  onTextChange = (details) => {
    this.setState({
      details
    })
  }
  /**渲染**********************************************************************************************************************************/

  render() {
    const { getFieldDecorator } = this.props.form;
    const { selectactivityCoupon, pdfPageNumber, pdfNumPages, pdfFile } = this.state;

    return (
      <CommonPage title={_title} description={_description} >
        <Spin spinning={this.state.showPageLoading}>
          <Form className='common-form' style={{ width: 800 }}>
            <Row className='line-height40 margin-bottom20' >
              <Col offset={6} span={18} >
                <Button className='normal margin-right' onClick={this.goEditBack} >返回</Button>
                <Button className='normal' type='primary' onClick={this.saveClicked}>保存</Button>
              </Col>
            </Row>
            <Form.Item
              labelCol={{ span: 6 }}
              wrapperCol={{ span: 18 }}
              label='商家：'
              field='businessId'>
              {
                getFieldDecorator('businessId', {
                  initialValue: null,
                  rules: [
                    { required: true, message: '请选择商家!' }
                  ]
                })(
                  <Select disabled={this.state.disabledEdit} style={{ width: "200px" }} onChange={this.onSelectMerchantChange}>
                    <Select.Option value={null}>请选择</Select.Option>
                    {
                      this.state.merchantList && this.state.merchantList.length ?
                        this.state.merchantList.map(item => (
                          <Select.Option key={item.id} value={item.id}>{item.name}</Select.Option>
                        ))
                        : null
                    }

                  </Select>
                )
              }
            </Form.Item>
            <Form.Item
              labelCol={{ span: 6 }}
              wrapperCol={{ span: 18 }}
              label='过期时间：'
              field='expiredStatus'>
              {
                getFieldDecorator('expiredStatus', {
                  initialValue: 1,
                  rules: [
                    { required: true, message: '请选择过期时间!' }
                  ]
                })(
                  <Radio.Group disabled={this.state.disabledEdit} onChange={this.onexpiredStatusChange}>
                    <Radio value={1}>无过期时间</Radio>
                    <Radio value={2}>固定时间</Radio>
                    <Radio value={3}>购买后</Radio>
                  </Radio.Group>
                )
              }
              {
                this.state.expiredStatus != 1 ?
                  <span>
                    {
                      this.state.expiredStatus == 2 ?
                        <span>
                          <DatePicker
                            disabled={this.state.disabledEdit}
                            value={this.state.expireConstantTime}
                            onChange={(e) => { this.onExpireTimeChange(e, 'time') }}
                            showTime
                            format="YYYY-MM-DD HH:mm:ss"
                            placeholder="截止时间"
                          />
                        </span>
                        :
                        <span>
                          <InputNumber disabled={this.state.disabledEdit} value={this.state.expireConstantDays} onChange={(e) => { this.onExpireTimeChange(e, 'days') }} precision={0} min={0} /><span className='margin-left'>天</span>
                        </span>

                    }
                  </span>
                  :
                  null
              }
            </Form.Item>

            <Form.Item
              labelCol={{ span: 6 }}
              wrapperCol={{ span: 18 }}
              label='活动券名称：'
              field='name'>
              {
                getFieldDecorator('name', {
                  rules: [
                    { required: true, message: '请填写活动券名称!' },
                    { max: 20, message: '长度不超过20个字!' }
                  ]
                })(
                  <Input maxLength={20} placeholder='长度不超过20个字' style={{ width: "340px" }} />
                )
              }
            </Form.Item>

            <Row className='line-height40'>
              <Col span={6} className='text-right'>
                <span className='label-color'>购买限制：</span>
              </Col>
              <Col span={18}>
                <div className='flex align-center'>
                  <Checkbox defaultChecked disabled>不可退换</Checkbox>
                  <Checkbox disabled={this.state.disabledEdit} checked={this.state.userBuyLimit} onChange={this.onUserBuyLimitChange}>购买次数限制</Checkbox>
                  {
                    this.state.userBuyLimit ?
                      <div>
                        <Select disabled={this.state.disabledEdit} defaultValue={1} value={this.state.purchases} style={{ width: "140px" }} onChange={this.onPurchasesChange}>
                          <Select.Option value={1}>首次</Select.Option>
                          <Select.Option value={2}>2</Select.Option>
                          <Select.Option value={3}>3</Select.Option>
                          <Select.Option value={4}>4</Select.Option>
                        </Select>
                      </div>
                      :
                      null
                  }
                </div>
              </Col>
            </Row>

            <Form.Item
              labelCol={{ span: 6 }}
              wrapperCol={{ span: 18 }}
              label='购买价格：'
              field='price'>
              {
                getFieldDecorator('price', {
                  rules: [
                    { required: true, message: '请填写购买价格!' }
                  ]
                })(
                  <InputNumber
                    style={{ width: "140px" }} precision={2} min={0} maxLength={24} placeholder='填写价格' />

                )
              }
              <span className='margin-left'>元</span>
            </Form.Item>

            <Form.Item
              labelCol={{ span: 6 }}
              wrapperCol={{ span: 18 }}
              label='原始价格：'
              field='originalPrice'>
              {
                getFieldDecorator('originalPrice', {
                  rules: [
                    { required: true, message: '请填写原始价格!' }
                  ]
                })(
                  <InputNumber
                    style={{ width: "140px" }} precision={2} min={0} maxLength={24} placeholder='填写原始价格' />

                )
              }
              <span className='margin-left'>元</span>
            </Form.Item>

            <Form.Item
              labelCol={{ span: 6 }}
              wrapperCol={{ span: 18 }}
              label='服务地址：'
              field='serviceAddress'>
              <div className='color-red'>服务地址请填写具体服务的具体地点</div>
              {
                getFieldDecorator('serviceAddress', {
                  rules: [
                    { required: true, message: '请填写服务地址!' }
                  ]
                })(
                  <Input.TextArea
                    style={{ minHeight: "100px", width: "340px" }}
                    placeholder='请输入'
                  />

                )
              }



            </Form.Item>

            <Form.Item
              labelCol={{ span: 6 }}
              wrapperCol={{ span: 18 }}
              label='服务方式：'
              field='serviceMethod'>
              <div className='color-red'>服务方式请阐述提供的服务方式，如提供什么服务，如何进行兑换</div>
              {
                getFieldDecorator('serviceMethod', {
                  rules: [
                    { required: true, message: '请填写服务方式!' }
                  ]
                })(
                  <Input.TextArea
                    style={{ minHeight: "100px", width: "340px" }}
                    placeholder='请输入'
                  />

                )
              }

            </Form.Item>

            <Form.Item
              labelCol={{ span: 6 }}
              wrapperCol={{ span: 18 }}
              label='展示销量基数：'
              field='salesBase'>
              {
                getFieldDecorator('salesBase', {
                  rules: [
                    { required: true, message: '请填写展示销量基数!' }
                  ]
                })(
                  <InputNumber
                    style={{ width: "140px" }} precision={0} min={0} maxLength={24} placeholder='展示销量基数' />
                )
              }
               <span className='color-red margin-left'>前端展示销量为展示销量加上真实销量</span>
            </Form.Item>

            <Form.Item
              labelCol={{ span: 6 }}
              wrapperCol={{ span: 18 }}
              label='库存剩余：'
              field='stock'>
              {
                getFieldDecorator('stock', {
                  rules: [
                    { required: true, message: '请填写库存剩余!' }
                  ]
                })(
                  <InputNumber
                    style={{ width: "140px" }} precision={0} min={0} maxLength={24} placeholder='请填写库存剩余' />
                )
              }
              {
                this.state.showSaleNumber ?
                  <span className='margin-left'>实际已售<span className='color-red margin0-10'>{this.state.saleNumber || 0}</span></span>
                  :
                  null
              }

            </Form.Item>
            <Row className='line-height40 margin-top20'>
              <Col span={6} className='text-right'>
                <span className='label-color label-required'>主图：</span>
              </Col>
              <Col span={18}>
                <PictureWall
                  allowType={['1', '2']}
                  folder='trace'
                  pictureList={this.state.mainImage ? [this.state.mainImage] : null}
                  uploadCallback={this.uploadActivityCouponHeadPic}
                />
                <div className='color-red' style={{ lineHeight: "16px" }}>建议尺寸420px*420px，图片格式png、jpg，大小不超过3MB</div>
                {
                  this.state.showHeaderImgValidateInfo ?
                    <div className='line-height18 color-red' style={{ textAlign: "left" }}>请设置主图</div> :
                    null
                }
              </Col>
            </Row>

            <Row className='line-height40 margin-top20'>
              <Col span={6} className='text-right'>
                <span className='label-color label-required'>轮播：</span>
              </Col>
              <Col span={18}>
                <PictureWall
                  allowType={['1', '2']}
                  limitFileLength={4}
                  folder='trace'
                  pictureList={this.state.bannerList}
                  uploadCallback={this.uploadBannerList}
                />
                <div className='color-red' style={{ lineHeight: "16px" }}>建议尺寸比例16：9，最多可上传4张图片，图片格式png、jpg，大小不超过3MB</div>
                {
                  this.state.showBannerImgValidateInfo ?
                    <div className='line-height18 color-red' style={{ textAlign: "left" }}>请设置轮播图片</div> :
                    null
                }
              </Col>
            </Row>

            <Row className='line-height40 margin-top20'>
              <Col span={6} className='text-right'>
                <span className='label-color'>详细信息：</span>
              </Col>
              <Col span={18} >

                <RichText
                  textValue={this.state.details}
                  onTextChange={this.onTextChange}
                />
              </Col>
            </Row>

            <Row className='line-height40 margin-top20'>
              <Col offset={6} span={18} >
                <Button className='normal margin-right' onClick={this.goEditBack} >返回</Button>
                <Button className='normal' type='primary' onClick={this.saveClicked}>保存</Button>
              </Col>
            </Row>
          </Form>

        </Spin>


        <Modal maskClosable={false}
          title="区域定位"
          visible={this.state.locationModalVisible}
          footer={null}
          onCancel={this._hideLocationModal}
          width={1000}
        >
          <LocationMap
            refreshPageData={this.getPageData}
            visible={this.state.locationModalVisible}
            selectStation={this.state.location}
            updateStationPosition={this.updateStationPosition}
          />
        </Modal>

      </CommonPage >
    )
  }
}
const mapStateToProps = state => state;
const mapDispatchToProps = (dispatch) => {
  return {
    changeRoute: data => dispatch(changeRoute(data))
  }
}
export default connect(mapStateToProps, mapDispatchToProps)(Form.create()(activityCouponPage));