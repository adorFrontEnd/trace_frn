import React, { Component } from "react";
import CommonPage from '../../components/common-page';
import { Table, Form, Input, Select, Col, Row, Icon, Button, Spin, Divider, Tabs, Popconfirm, Radio, Modal, Checkbox, InputNumber } from "antd";
import Toast from '../../utils/toast';
import { SearchForm, SubmitForm } from '../../components/common-form';
import dateUtil from '../../utils/dateUtil';
import PictureWall from '../../components/upload/PictureWall';
import { getDetailQrCodeConfig } from '../../api/codeManage/productCode';
import {
  _productImageQrcodeCheckedObj, _boxImageQrcodeCheckedObj, _trayImageQrcodeCheckedObj,
  _productCodeTypeNumEnum, _boxCodeTypeNumEnum, _trayCodeTypeNumEnum, _productCodeNumTypeEnum,
  _boxCodeNumTypeEnum, _trayCodeNumTypeEnum, _exampleData
} from './imageQrcodeEnum';

let _imageQrcodeCheckedObj = null;
let _codeTypeNumEnum = null;
let _codeNumTypeEnum = null;

/**
 * 商品码导出：1验证码、2商品生产码、3商品条码、4商品编码、5自定义文字；
 * 箱规码导出：1箱规生产码、2箱规编码、3自定义文字；
 * 托盘码导出：1自定义文字
 */


class Page extends Component {

  state = {
    customText: null,
    qrcodeWidth: 0,
    imgType: '0',
    centerUploadImageUrl: "",
    centerImageUrl: "",
    hasCheckedArr: [],
    configId: null
  }

  componentWillReceiveProps(props) {
    if (!props.visible) {
      this.clearComponentState();
    } else {
      this.getConfigDetail(props.selectData);
    }

  }

  componentDidMount() {
    this.assignEnum(this.props.qrcodeType);
  }

  getConfigDetail = (selectData) => {
    if (!selectData) {
      return;
    }

    if (selectData) {
      let type = this.props.qrcodeType;
      let { securityVerificationCode } = selectData;
      let contentId = null;
      if (type == '0') {
        contentId = selectData.productId;
      }

      if (type == '1') {
        contentId = selectData.boxId;
      }

      if (type == '2') {
        contentId = selectData.trayId;
      }

      if (!contentId) {
        return;
      }

      this._getDetailQrCodeConfig({ contentId, type }, securityVerificationCode);
    }
  }


  assignEnum = (qrcodeType) => {
    switch (qrcodeType) {

      default:
      case '0':
        _imageQrcodeCheckedObj = _productImageQrcodeCheckedObj;
        _codeTypeNumEnum = _productCodeTypeNumEnum;
        _codeNumTypeEnum = _productCodeNumTypeEnum;
        break;

      case '1':
        _imageQrcodeCheckedObj = _boxImageQrcodeCheckedObj;
        _codeTypeNumEnum = _boxCodeTypeNumEnum;
        _codeNumTypeEnum = _boxCodeNumTypeEnum;
        break;

      case '2':
        _imageQrcodeCheckedObj = _trayImageQrcodeCheckedObj;
        _codeTypeNumEnum = _trayCodeTypeNumEnum;
        _codeNumTypeEnum = _trayCodeNumTypeEnum;
        break;
    }

  }

  _getDetailQrCodeConfig = (params, securityVerificationCode) => {
    getDetailQrCodeConfig(params)
      .then(data => {

        this.revertModalData({ ...data, securityVerificationCode });
      })
  }

  revertModalData = (res) => {
    if (!res) {
      return;
    }
    let { displayContent, customText, height, pictureUrl, imgType, id, securityVerificationCode } = res;
    imgType = imgType || "0";
    let qrcodeWidth = height || "3";
    let displayContentArr = displayContent && displayContent.length ? displayContent.split(',') : [];
    displayContentArr = displayContentArr.filter(item => item);
    if (securityVerificationCode == '0') {
      displayContentArr = displayContentArr.filter(item => item != '1');
    }
    let hasCheckedArr = displayContentArr.map(id => _codeNumTypeEnum[id]);
    let centerImageUrl = pictureUrl;
    let centerUploadImageUrl = imgType == '2' ? pictureUrl : "";
    let configId = id;
    let revertData = {
      customText,
      qrcodeWidth,
      imgType,
      centerUploadImageUrl,
      centerImageUrl,
      hasCheckedArr,
      configId
    }

    this.setState(revertData);

  }

  clearComponentState = () => {
    let data = {
      customText: null,
      qrcodeWidth: 3,
      imgType: '0',
      centerUploadImageUrl: "",
      centerImageUrl: "",
      hasCheckedArr: [],
      configId: null
    }
    this.setState(data);
  }


  //保存时
  onOkClicked = () => {

    let { productId, boxId, trayId } = this.props.selectData;
    let contentId = null;
    let { hasCheckedArr, customText, qrcodeWidth, centerImageUrl, imgType } = this.state;
    let displayContent = "";
    if (hasCheckedArr && hasCheckedArr.length) {
      displayContent = hasCheckedArr.map(item => _codeTypeNumEnum[item]).filter(item => item).join();
    }

    if (!qrcodeWidth || Number(qrcodeWidth) < 3) {
      Toast('宽度不能低于3.00厘米！');
      return;
    }
    let id = this.state.configId;
    let type = this.props.qrcodeType;
    if (type == '0') {
      contentId = productId;
    }

    if (type == '1') {
      contentId = boxId;
    }

    if (type == '2') {
      contentId = trayId;
    }
    if (!contentId) {
      Toast('缺少contentId！');
      return;
    }
    let params = {
      contentId,
      type: this.props.qrcodeType || "0",
      displayContent,
      customText,
      width: qrcodeWidth,
      height: qrcodeWidth,
      pictureUrl: centerImageUrl,
      id,
      imgType
    };

    this.props.onOk(params)
      .then(() => {
        this.props.onCancel();
      })
  }

  getFiltedCheckedObj = () => {
    if (!this.props.selectData) {
      return []
    }
    let { securityVerificationCode } = this.props.selectData;
    let arr = Object.keys(_imageQrcodeCheckedObj);
    let result = securityVerificationCode == '1' ? arr : arr.filter(item => item != 'verifyCode');
    return result
  }

  onCheckedGroupChange = (hasCheckedArr) => {
    this.setState({
      hasCheckedArr
    })

  }

  onCheckedChange = (e, type) => {

    let isChecked = e.target.checked;
  }

  moveCheckedText = (index, type) => {
    let hasCheckedArr = this.state.hasCheckedArr;
    if (type == 'up') {
      let temp = hasCheckedArr[index];
      hasCheckedArr[index] = hasCheckedArr[index - 1];
      hasCheckedArr[index - 1] = temp
    }

    if (type == 'down') {
      let temp = hasCheckedArr[index];
      hasCheckedArr[index] = hasCheckedArr[index + 1];
      hasCheckedArr[index + 1] = temp
    }

    this.setState({
      hasCheckedArr
    })
  }


  onUserDefinedChange = (e) => {
    let customText = e.currentTarget.value;
    this.setState({
      customText
    })
  }

  // 更改二维码的宽度
  onQrcodeWidthChange = (qrcodeWidth) => {
    this.setState({
      qrcodeWidth
    })
  }

  // 更改二维码的图片展示方式
  onRadioGroupChange = (e) => {
    let imgType = e.target.value;
    let centerImageUrl = '';

    if (imgType == '0') {
      centerImageUrl = "";
    } else if (imgType == '1') {
      centerImageUrl = this.props.selectData ? this.props.selectData.image : "";
    } else if (imgType == '2') {
      centerImageUrl = this.state.centerUploadImageUrl || "";
    }

    this.setState({
      imgType,
      centerImageUrl
    })
  }

  //上传图片
  uploadCenterUploadImageUrl = (picList) => {
    let centerUploadImageUrl = '';
    if (!picList || !picList.length) {
      this.setState({
        centerUploadImageUrl,
        centerImageUrl: centerUploadImageUrl
      })
      return;
    }
    centerUploadImageUrl = picList[0];
    this.setState({
      centerImageUrl: centerUploadImageUrl,
      centerUploadImageUrl
    })
  }

  /**渲染**********************************************************************************************************************************/

  render() {

    const _filtedCheckedArr = this.getFiltedCheckedObj();
    const { hasCheckedArr, imgType } = this.state;
    return (
      <Modal
        title='图片导出样式'
        visible={this.props.visible}
        onCancel={this.props.onCancel}
        onOk={this.onOkClicked}
        width={1000}
      >
        <div className='flex-center'>
          <div className='flex-between' style={{ width: "100%" }}>
            <div>
              <div className='line-height30 font-bold font-18'>样式图</div>
              <div style={{ background: "#f2f2f2", padding: 20 }}>
                <div style={{ background: "#fff" }} className='padding'>
                  <div style={{ position: "relative" }}>
                    {
                      this.state.centerImageUrl ?
                        <img src={this.state.centerImageUrl}
                          style={{ height: 40, width: 40, position: "absolute", left: "80px", top: "80px", background: "#FFF", border: "2px solid #FFF" }} />
                        :
                        null
                    }
                    <img src='/image/qrcodeImageDemo.png' style={{ height: 200, width: 200, display: "block" }} />
                  </div>

                  <div className='margin-top'>
                    {
                      hasCheckedArr && hasCheckedArr.length ?
                        hasCheckedArr.map((item, index) =>
                          <div key={item} className='line-height30 flex-between'>
                            <span className='font-18'>{_imageQrcodeCheckedObj[item]}</span>
                            {
                              hasCheckedArr.length == 1 ?
                                null :
                                <span>
                                  {
                                    index == 0 ?
                                      <span style={{ cursor: "not-allowed" }}><Icon type='up-circle' style={{ fontSize: 30 }} className='margin0-10 color-gray'></Icon></span>
                                      :
                                      <span onClick={() => { this.moveCheckedText(index, 'up') }} style={{ cursor: "pointer" }}><Icon type='up-circle' style={{ fontSize: 30 }} className='margin0-10'></Icon></span>
                                  }
                                  {
                                    index == hasCheckedArr.length - 1 ?
                                      <span style={{ cursor: "not-allowed" }}><Icon type='down-circle' style={{ fontSize: 30 }} className='color-gray'></Icon></span>
                                      :
                                      <span onClick={() => { this.moveCheckedText(index, 'down') }} style={{ cursor: "pointer" }}><Icon type='down-circle' style={{ fontSize: 30 }}></Icon></span>
                                  }
                                </span>
                            }
                          </div>
                        ) : null
                    }
                  </div>
                </div>
              </div>
            </div>
            <div style={{ maxWidth: 432, width: 432, padding: 8 }}>
              <div className='line-height30'>展示内容:</div>
              <Checkbox.Group value={hasCheckedArr} onChange={this.onCheckedGroupChange}>
                {
                  _filtedCheckedArr.map((item, index) =>

                    <Checkbox style={index == 0 ? { marginLeft: 8, marginBottom: 10 } : { marginBottom: 10 }} key={item} value={item} onChange={(e) => { this.onCheckedChange(e, item) }}>
                      {_imageQrcodeCheckedObj[item]}
                    </Checkbox>
                  )
                }
              </Checkbox.Group>
              <div className='line-height30 margin-bottom'>
                <div style={{ width: "100px", textAlign: "right", display: "inline-block" }}>自定义文字：</div>
                <Input value={this.state.customText} onChange={this.onUserDefinedChange} allowClear style={{ width: 270 }} placeholder='自定义文字,不超过15个字' maxLength={15} />
              </div>
              <div className='line-height30'>
                <div style={{ width: "100px", textAlign: "right", display: "inline-block" }}>宽度：</div>
                <InputNumber
                  value={this.state.qrcodeWidth}
                  onChange={this.onQrcodeWidthChange}
                  allowClear
                  style={{ width: 160, marginRight: "8px" }}
                  placeholder='设置二维码的宽度'
                  precision={2}
                  min={3}
                />厘米
              </div>
              <div className='line-height30 color-red' style={{ paddingLeft: "100px" }}>最小宽度为3厘米，建议设置4厘米</div>
              {
                this.props.qrcodeType == '0' ?

                  <div className='line-height30'>
                    <div style={{ width: "100px", textAlign: "right", display: "inline-block" }}>展示图片：</div>
                    <div style={{ marginLeft: 20 }} >
                      <Radio.Group value={imgType.toString()} onChange={this.onRadioGroupChange}>
                        <Radio value='0'>不展示图片</Radio>
                        <Radio value='1'>展示商品图</Radio>
                        <Radio value='2'>自定义展示图片</Radio>
                      </Radio.Group>
                      {
                        imgType == "1" && this.props.selectData && this.props.selectData.image ?
                          <div className='flex-center margin-top20'>
                            <img src={this.props.selectData.image} style={{ height: 100, width: 100 }} />
                          </div>
                          :
                          null
                      }
                      {
                        imgType == "2" ?
                          <div>
                            <div className='flex-center margin-top20'>
                              <PictureWall
                                allowType={['1', '2']}

                                folder='store'
                                pictureList={this.state.centerUploadImageUrl ? [this.state.centerUploadImageUrl] : null}
                                uploadCallback={this.uploadCenterUploadImageUrl}
                              />
                            </div>
                            <div className='color-red' style={{ lineHeight: "16px" }}>建议尺寸420px*420px，可上传非该尺寸的图片，图片格式png、jpg，大小不超过3MB</div>
                          </div>
                          :
                          null
                      }
                    </div>
                  </div>
                  :
                  null
              }
            </div>

            <div>
              <div className='line-height30 font-bold font-18'>效果图</div>
              <div style={{ background: "#f2f2f2", padding: 20 }}>
                <div style={{ background: "#fff" }} className='padding'>
                  <div style={{ position: "relative" }}>
                    {
                      this.state.centerImageUrl ?
                        <img src={this.state.centerImageUrl}
                          style={{ height: 40, width: 40, position: "absolute", left: "80px", top: "80px", background: "#FFF", border: "2px solid #FFF" }} />
                        :
                        null
                    }
                    <img src='/image/qrcodeImageDemo.png' style={{ height: 200, width: 200, display: "block" }} />
                  </div>
                  <div className='margin-top'>
                    {
                      hasCheckedArr && hasCheckedArr.length ?
                        hasCheckedArr.map((item) =>
                          <div key={item} className='line-height20 font-bold font-18 text-center'>
                            {
                              item == 'userDefined' ?
                                <span className='font-12'>{this.state.customText}</span>
                                :
                                <span>{_exampleData[item]}</span>
                            }
                          </div>
                        )
                        : null
                    }
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Modal >
    )
  }
}

export default Form.create()(Page);