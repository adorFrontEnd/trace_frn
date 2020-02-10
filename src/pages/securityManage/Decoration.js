import React, { Component } from "react";
import CommonPage from '../../components/common-page';
import { Table, Form, Input, Select, Col, Row, Icon, Button, Divider, Tabs, Popconfirm, Radio, Modal, Spin, Checkbox, InputNumber } from "antd";
import { pagination } from '../../utils/pagination';
import Toast from '../../utils/toast';
import { SearchForm, SubmitForm } from '../../components/common-form';
import dateUtil from '../../utils/dateUtil';
import PictureWall from '../../components/upload/PictureWall';
import { getDetail, saveOrUpdate } from '../../api/security/security';
import ColorPicker from '../../components/colorPicker/ColorPicker';
import './index.less';



const { TabPane } = Tabs;
const _title = "防伪装修";
const _description = "";
const Option = Select.Option;

class Page extends Component {

  state = {
    tableDataList: null,
    showDataLoading: false,
    bgOption: "图片",
    uploadModalIsVisible: false,
    bgPicUrl: "",
    bgColor: "",
    decorationData: null,

    demoBgStyle: {},
    buttonStyleType: "1",
    buttonStyleColor: "",
    buttonStyleBgColor: "",
    demoButtonStyle: {}
  
  }

  componentDidMount() {
    this.getPageData();
  }

  showUploadModal = () => {
    this.setState({
      uploadModalIsVisible: true
    })
  }

  hideUploadModal = () => {
    this.setState({
      uploadModalIsVisible: false
    })
  }

  // 获取页面列表
  getPageData = (renderType) => {
    this._showDataLoading()
    getDetail()
      .then(decorationData => {
        this.setState({
          decorationData
        })
        this.renderDecorationData(decorationData, renderType);
        this._hideDataLoading();
      })
      .catch(() => {
        this._hideDataLoading();
      })
  }

  renderDecorationData = (decorationData, type) => {

    let shouldRenderBackground = !type || "background";
    let shouldRenderButton = !type || "button";
    let { background, button } = decorationData;
    if (background && shouldRenderBackground) {
      this.renderBackground(background);
    }

    if (button && shouldRenderButton) {
      this.renderButton(button);
    }
  }

  renderBackground = (data) => {
    let background = JSON.parse(data);
    let bgOption = "图片"
    let demoBgStyle = {};
    if (background.color) {
      let bgColor = background.color;
      bgOption = "颜色";

      demoBgStyle = {
        backgroundColor: "#" + bgColor
      }
      this.setState({
        bgOption,
        bgColor,
        demoBgStyle
      })
      return
    }

    if (background.image) {
      let bgPicUrl = background.image;
      bgOption = "图片";

      demoBgStyle = {
        backgroundImage: `url(${bgPicUrl})`
      }
      this.setState({
        bgOption,
        bgPicUrl,
        demoBgStyle
      })
      return;
    }
  }
  renderButton = (data) => {
    let buttonStyle = JSON.parse(data);
    let { buttonStyleType, buttonStyleColor, buttonStyleBgColor } = buttonStyle;
    let demoButtonStyle = {};
    if (buttonStyleType) {
      this.setState({
        buttonStyleType
      })
    }

    if (buttonStyleColor) {
      demoButtonStyle.color = "#" + buttonStyleColor;
      this.setState({
        buttonStyleColor
      })
    }

    if (buttonStyleBgColor) {
      demoButtonStyle.backgroundColor = "#" + buttonStyleBgColor;
      this.setState({
        buttonStyleBgColor
      })
    }

    this.setState({
      demoButtonStyle
    })
  }
  _showDataLoading = () => {
    this.setState({
      showDataLoading: true
    })
  }

  _hideDataLoading = () => {
    this.setState({
      showDataLoading: false
    })
  }
  onBgOptionChange = (bgOption) => {

    this.setState({
      bgOption
    })
  }

  uploadPic = (picList) => {

    let bgPicUrl = '';
    if (!picList || !picList.length) {
      this.setState({
        bgPicUrl,
        demoBgStyle: { backgroundImage: `none` }
      })
      return;
    }
    bgPicUrl = picList[0];
    this.setState({
      bgPicUrl,
      demoBgStyle: { backgroundImage: `url(${bgPicUrl})` }
    })
  }

  onBgColorChange = (e) => {

    let bgColor = e.currentTarget.value;
    this.setState({
      bgColor
    });
    if (bgColor && bgColor.length == 6) {
      let backgroundColor = "#" + bgColor;
      this.setState({
        demoBgStyle: { backgroundColor }
      })
    }
  }

  // 保存背景
  saveBgClick = () => {
    let bgOption = this.state.bgOption;
    let id = null;
    if (this.state.decorationData) {
      id = this.state.decorationData.id;
    }
    let background = null;
    if (bgOption == '颜色') {
      let bgColor = this.state.bgColor;
      background = { color: bgColor };
    }

    if (bgOption == '图片') {
      let bgPicUrl = this.state.bgPicUrl;
      background = { image: bgPicUrl };
    }

    if (!background) {
      return;
    }

    let params = {
      id,
      background: JSON.stringify(background)
    }
    saveOrUpdate(params)
      .then(() => {
        Toast("保存背景成功！");
      })
  }

  //重置背景
  resetBgClick = () => {
    this.getPageData('background');
  }

  //清空背景
  clearBgClick = () => {
    this.setState({
      bgPicUrl: "",
      bgColor: "",
      demoBgStyle: {}
    })
  }

  onButtonStyleTypeChange = (e) => {

    let buttonStyleType = e.target.value;
    this.setState({
      buttonStyleType
    })
  }


  onButtonStyleBgColorChange = (e) => {

    let buttonStyleBgColor = e.target.value;
    this.setState({
      buttonStyleBgColor
    })

    if (buttonStyleBgColor && buttonStyleBgColor.length == 6) {
      let demoButtonStyle = this.state.demoButtonStyle || {};

      demoButtonStyle.backgroundColor = "#" + buttonStyleBgColor;
      this.setState({
        demoButtonStyle
      })
    }
  }

  onButtonStyleColorChange = (e) => {

    let buttonStyleColor = e.target.value;
    this.setState({
      buttonStyleColor
    })

    if (buttonStyleColor && buttonStyleColor.length == 6) {
      let demoButtonStyle = this.state.demoButtonStyle || {};

      demoButtonStyle.color = "#" + buttonStyleColor;
      this.setState({
        demoButtonStyle
      })
    }
  }

  saveButtonClick = () => {
    let { id } = this.state.decorationData;
    let { buttonStyleType, buttonStyleColor, buttonStyleBgColor } = this.state;
    let button = { buttonStyleType, buttonStyleColor, buttonStyleBgColor };
    let params = {
      id,
      button: JSON.stringify(button)
    }
    saveOrUpdate(params)
      .then(() => {
        Toast("保存按钮成功！");
      })

  }

  resetButtonClick = () => {
    this.getPageData('button');
  }

  colorPickerChange = (color, type) => {
    let { hex } = color;
    let colorHex = hex.slice(1);
    switch (type) {
      case "bgColor":
        this.setState({
          bgColor: colorHex
        })
        let backgroundColor = hex;
        this.setState({
          demoBgStyle: { backgroundColor }
        })
        break;

      case "buttonStyleBgColor":

        let demoButtonStyle = this.state.demoButtonStyle || {};
        let buttonStyleBgColor = colorHex;
        demoButtonStyle.backgroundColor = "#" + colorHex;
        this.setState({
          buttonStyleBgColor,
          demoButtonStyle
        })

        break;

      case "buttonStyleColor":

        let _demoButtonStyle = this.state.demoButtonStyle || {};
        let buttonStyleColor = colorHex;
        _demoButtonStyle.color = "#" + colorHex;
        this.setState({
          buttonStyleColor,
          demoButtonStyle:_demoButtonStyle
        })
        break;

    }

  }
  /**渲染**********************************************************************************************************************************/

  render() {
    const { getFieldDecorator } = this.props.form;

    return (
      <CommonPage title={_title} description={_description} >
        <Spin spinning={this.state.showDataLoading}>


          <div className='flex line-height20'>
            <div>
              <div className='line-height40'>展示效果</div>
              <div className='demo-bg' style={this.state.demoBgStyle}>
                <div style={{ width: "100%", padding: 10, minHeight: "500px" }}>

                  <div style={{ backgroundColor: "#fff", padding: "10px" }} className='margin-bottom padding'>
                    <div className='margin-bottom'>商品信息</div>
                    <div className='flex'>
                      <div className='middle-center margin-right'>
                        <img style={{ width: 80, height: 80 }} />
                      </div>
                      <div>
                        <div>商品名称：纸尿裤</div>
                        <div>公司名称：beaba</div>
                        <div>规格：XXL</div>
                        <div>生产日期：2019-06-02</div>
                      </div>
                    </div>
                  </div>

                  <div style={{ backgroundColor: "#fff" }} className='margin-bottom padding'>
                    <div className='margin-bottom'>真伪信息</div>
                   
                  </div>
                </div>
              </div>
            </div>

            <div style={{marginBottom:280}}>
              <div className='line-height40'>装修设置</div>
              <div className='line-height30' style={{ width: "400px", border: "1px dashed #ccc", padding: "10px", marginRight: "10px" }}>
                <div style={{ width: "100%", minHeight: "500px" }}>

                  <div style={{ backgroundColor: "#f2f2f2", padding: "10px" }}>
                    <div className='font-bold'>背景面板</div>
                    <div className="flex">
                      <div style={{ width: 80, textAlign: "right" }}>背景类型：</div>
                      <Select value={this.state.bgOption} onChange={this.onBgOptionChange} style={{ width: 200 }}>
                        <Option key="图片" value={"图片"}>图片</Option>
                        <Option key="颜色" value={"颜色"}>颜色</Option>
                      </Select>
                    </div>
                    <div className='padding10-0' style={{ minHeight: 130 }}>
                      {
                        this.state.bgOption == '图片' ?
                          <div className="flex">
                            <div style={{ width: 80, textAlign: "right" }}>上传图片：</div>
                            <PictureWall
                              folder='trace'
                              pictureList={this.state.bgPicUrl ? [this.state.bgPicUrl] : null}
                              uploadCallback={this.uploadPic}
                            />
                          </div>
                          :
                          <div className="flex">
                            <div style={{ width: 80, textAlign: "right" }}>RGB颜色：</div>
                            <div className='flex align-center'>
                              <Input
                                value={this.state.bgColor}
                                onChange={this.onBgColorChange}
                                addonBefore="#"
                                style={{ width: 200 }}
                                minLength={6} maxLength={6}
                              />
                              <div style={{ height: 30 }}>
                                <ColorPicker color={{ hex: `#${this.state.bgColor}` }} onChange={(e) => { this.colorPickerChange(e, 'bgColor') }} />
                              </div>
                            </div>
                          </div>
                      }

                    </div>
                    <div style={{ paddingLeft: "80px" }}>
                      <Button onClick={this.saveBgClick} style={{ width: 80 }} className='margin-right' type='primary'>保存</Button>
                      <Button onClick={this.resetBgClick} style={{ width: 80 }} className='yellow-btn margin-right'>还原</Button>
                      <Button onClick={this.clearBgClick} style={{ width: 80 }}>清空</Button>
                    </div>
                  </div>


                  {/* 按钮 */}
                  <div className='margin-top10' style={{ backgroundColor: "#f2f2f2", padding: "10px" }}>
                    <div className='font-bold'>价格查询按钮样式</div>
                    <div className='padding0-20 margin-top20'>
                      <Radio.Group value={this.state.buttonStyleType} onChange={this.onButtonStyleTypeChange}>
                        <Radio value="1">样式一</Radio>
                        <Radio value="2">样式二</Radio>
                      </Radio.Group>
                    </div>

                    <div className='padding20'>
                      <div>示例</div>
                      {
                        this.state.buttonStyleType == '1' ?
                          <div className='flex'>
                            <Input style={{ width: 200 }} />
                            <Button style={{ width: 100, ...this.state.demoButtonStyle }}>查询</Button>
                          </div>
                          :
                          <div className='text-center'>
                            <Input style={{ width: 200 }} />
                            <Button style={{ width: 200, ...this.state.demoButtonStyle }}>查询</Button>
                          </div>
                      }
                      <div className='padding-top'>
                        <div className='flex'>
                          <span>按钮背景颜色:</span>
                          <div className='flex align-center'>
                            <Input
                              minLength={6} maxLength={6}
                              addonBefore="#"
                              value={this.state.buttonStyleBgColor}
                              style={{ width: 160, marginLeft: 10 }}
                              onChange={this.onButtonStyleBgColorChange}
                            />
                            <div style={{ height: 30 }}>
                              <ColorPicker color={{ hex: `#${this.state.buttonStyleBgColor}` }} onChange={(e) => { this.colorPickerChange(e, 'buttonStyleBgColor') }} />
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className='padding-top'>
                        <div className='flex'>
                          <span>按钮文字颜色:</span>
                          <div className='flex align-center'>
                            <Input
                              minLength={6} maxLength={6}
                              addonBefore="#"
                              value={this.state.buttonStyleColor}
                              style={{ width: 160, marginLeft: 10 }}
                              onChange={this.onButtonStyleColorChange}
                            />
                            <div style={{ height: 30 }}>
                              <ColorPicker color={{ hex: `#${this.state.buttonStyleColor}` }} onChange={(e) => { this.colorPickerChange(e, 'buttonStyleColor') }} />
                            </div>
                          </div>

                        </div>
                      </div>

                      <div style={{ paddingLeft: "60px", paddingTop: 10 }}>
                        <Button onClick={this.saveButtonClick} style={{ width: 80 }} className='margin-right' type='primary'>保存</Button>
                        <Button onClick={this.resetButtonClick} style={{ width: 80 }} className='yellow-btn margin-right'>还原</Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Spin>
      </CommonPage>
    )
  }
}

export default Form.create()(Page);