import React, { Component } from "react";
import CommonPage from '../../components/common-page';
import { Table, Form, Input, Select, Tabs, Col, Row, Icon, Radio, Button, Divider, Popconfirm, Modal, Checkbox, InputNumber, AutoComplete } from "antd";
import { pagination } from '../../utils/pagination';
import Toast from '../../utils/toast';
import { SearchForm, SubmitForm } from '../../components/common-form';
import dateUtil from '../../utils/dateUtil';
import { parseScanCode, parseScanCodeCompatBarCode } from '../../utils/qrCode';
import { scanEvent } from './scanEvent';
import { scanStockOutVerification, scanStockOutSubmit } from '../../api/scan/stockOut';
import { getDealerListByOrganizationId } from '../../api/dealer/dealerList';
import { getCacheOrgId } from '../../middleware/localStorage/login';
import AudioPlay from '../../components/audioPlay/AudioPlay';

import StockOutScanLog from './StockOutScanLog';
import StockOperLog from './StockOperLog';
import './stockOut.less';
const { TabPane } = Tabs;
const _title = "拣货扫描";
const _description = "";

class Page extends Component {

  state = {

    exportUrl: null,
    uniqueCodeQuantity: null,

    scanCode: null,
    scanScsCount: 0,
    scanFailCount: 0,
    scanTotalCount: 0,

    trayUniqueCodeList: [],
    boxUniqueCodeList: [],
    productUniqueCodeList: [],
    scanLogs: [],

    submitParams: null,
    updateScanLogTime: null,

    expressModalIsVisible: false,
    expressValidateInfo: null,
    expressCode: null,

    dealerModalIsVisible: false,
    dealerList: null,

    selectDealerData: null,
    selectDealerId: null,
    checkFlag: false,

    audioCode: null,
    audioUpdateTime: null,
    updateOperLogTime: null,

    stockCodeValidateList: [],
    activeKey: "1"
  }

  params = {
    page: 1
  }

  componentDidMount() {
    this.clearOneRoundResult();
    window.addEventListener('keypress', this.scanWrapper, false);
  }

  componentWillUnmount() {
    window.removeEventListener('keypress', this.scanWrapper, false);
  }

  scanWrapper = (e) => {

    scanEvent(e, (data) => {

      this.addScanCount("total");
      if (data.charAt(data.length - 1) == "@" || data.charAt(0) == "X") {
        this.handleTraceCode(data);
        return;
      }

      this.handleExpressCode(data);
    });
  }

  //处理单号
  handleExpressCode = (data) => {
    this._validateExpressCode(data);
  }

  //处理溯源码
  handleTraceCode = (data) => {
    let result = this.getScanCode(data);
    if (!result) {
      Toast("该码不存在，请扫描正确的二维码！");
      this.playAudioByCode('0011');
      this.addScanCount("fail");
      return;
    }
    if (result && result.code && result.codeType) {

      // if (this.state.expressCode) {
      let isValid = this.childCodeIsValid(result.code);
      if (!isValid) {
        Toast("重复扫码！");
        this.playAudioByCode('0024');
        this.addScanCount("fail");
        return;
      }
      // }

      this._scanStockOutVerification(result)
        .then(res => {

          let { status, log, code } = res;
          this.playAudioByCode(code);
          if (status == 0) {
            Toast(log);
            this.addScanCount("fail");
            return;
          }
          if (res && res.code) {
            delete res.code
          }

          this.handleScanCode({ ...result, ...res });
        })
        .catch(() => {
          this.addScanCount("fail");
        })

    } else {

      this.addScanCount("fail");
    }
  }

  childCodeIsValid = (code) => {
    let { trayUniqueCodeList, boxUniqueCodeList, productUniqueCodeList } = this.state;
    if (!code) {
      return;
    }
    let childCodeArr = [...trayUniqueCodeList, ...boxUniqueCodeList, ...productUniqueCodeList];

    if (!childCodeArr.length) {
      return true;
    }

    let index = childCodeArr.indexOf(code);
    if (index == -1) {
      return true;
    }
    return

  }

  // 扫描的码进行接口数据验证
  _scanStockOutVerification = (result) => {
    let { code, codeType } = result;
    let checkFlag = this.state.checkFlag ? "0" : "1";
    let params = { checkFlag };
    switch (codeType) {
      // 产品码
      case "product":
        params.productUniqueCode = code;
        break;

      // 箱子码
      case "box":
        params.boxUniqueCode = code;
        break;

      // 托盘码
      case "tray":
        params.trayUniqueCode = code;
        break;
    }
    return scanStockOutVerification(params)
  }

  // 处理扫描结果
  handleScanCode = (result) => {
    this.setState({
      scanCode: result.code
    })

    let isValid = this.deepValidateCode(result);

    if (!isValid) {
      Toast("重复扫码！");
      this.playAudioByCode('0024');
      this.addScanCount("fail");
      return;
    }
    this.joinTraceCode(result);
  }

  //深度检测是否重复,并添加
  deepValidateCode = (result) => {
    let { codeType, code, productUniqueCodeList } = result;
    let stockCodeValidateList = this.state.stockCodeValidateList;
    let isValid = false;
    if (codeType == 'product') {
      productUniqueCodeList = [code];
    }
    if (!stockCodeValidateList || stockCodeValidateList.length == 0) {
      isValid = true;
    } else {
      isValid = this.deepValidate(productUniqueCodeList, stockCodeValidateList);
    }

    if (isValid) {
      stockCodeValidateList = [...stockCodeValidateList, ...productUniqueCodeList];
      this.setState({
        stockCodeValidateList
      })
    }
    return isValid;
  }

  //深度检测
  deepValidate = (codeList, validateList) => {

    if (!codeList || !codeList.length || !validateList || !validateList.length) {
      return true;
    }

    for (let i = 0; i < codeList.length; i++) {
      let item = codeList[i];
      let index = validateList.indexOf(item);
      if (index != -1) {
        return false;
        break;
      }
    }
    return true;
  }

  // 扫描溯源码加入物流
  joinTraceCode = (result) => {
    let { code, codeType } = result;
    let trayUniqueCodeList = this.state.trayUniqueCodeList;
    let boxUniqueCodeList = this.state.boxUniqueCodeList;
    let productUniqueCodeList = this.state.productUniqueCodeList;

    this.addScanCount("scs");
    if (codeType == 'product') {
      this.addScanLogs(`已扫描包码【${code}】`);
      productUniqueCodeList.push(code)
    }

    if (codeType == 'box') {
      let boxSpeText = "";
      if (result.boxVo && result.boxVo.specification) {
        let spec = JSON.parse(result.boxVo.specification);
        let { relationProductName, relationProductBarCode } = result.boxVo;
        boxSpeText = this._getBoxSpeText({ ...spec, productName: relationProductName, productBarCode: relationProductBarCode });
        console.log(boxSpeText);
      }
      let boxlog = `已扫描箱码【${code}】` + (boxSpeText ? `，${boxSpeText}` : "");
      this.addScanLogs(boxlog);
      boxUniqueCodeList.push(code);
    }

    if (codeType == 'tray') {
      this.addScanLogs(`已扫描托盘码【${code}】`);
      trayUniqueCodeList.push(code)
    }

    this.setState({
      trayUniqueCodeList,
      boxUniqueCodeList,
      productUniqueCodeList
    })
  }

  // 扫描结束
  stockOutClick = () => {

    let { expressCode, selectDealerId, trayUniqueCodeList, boxUniqueCodeList, productUniqueCodeList } = this.state;
    let params = {};
    let dealerId = selectDealerId || null;
    let checkFlag = this.state.checkFlag ? "0" : "1";
    let trackingNumber = expressCode || null;
    trayUniqueCodeList = trayUniqueCodeList && trayUniqueCodeList.length ? trayUniqueCodeList : null;
    boxUniqueCodeList = boxUniqueCodeList && boxUniqueCodeList.length ? boxUniqueCodeList : null;
    productUniqueCodeList = productUniqueCodeList && productUniqueCodeList.length ? productUniqueCodeList : null;

    params = {
      trayUniqueCodeList, boxUniqueCodeList, productUniqueCodeList, dealerId, trackingNumber, checkFlag
    }

    this.submitScan(params);
  }

  // 提交扫码结果，装箱完成
  submitScan = (params) => {
    scanStockOutSubmit(params)
      .then(() => {

        Toast('出库完成！');
        this.playAudioByCode("0023");
        this.addScanLogs(`恭喜出库完成！`, true);
        this.clearOneRoundResult();
      })
      .catch(() => {
        this.playAudioByCode("0022");
      })
  }

  // 增加扫描次数
  addScanCount = (type) => {

    switch (type) {

      default:
      case "total":
        let scanTotalCount = this.state.scanTotalCount;
        this.setState({
          scanTotalCount: scanTotalCount + 1
        })
        break;

      case "scs":
        let scanScsCount = this.state.scanScsCount;
        this.setState({
          scanScsCount: scanScsCount + 1
        })
        break;

      case "fail":
        let scanFailCount = this.state.scanFailCount;
        this.setState({
          scanFailCount: scanFailCount + 1
        })
        break;
    }
  }


  // 增加扫描日志
  addScanLogs = (log, isRoundEnd) => {
    // let scanLogs = this.state.scanLogs;
    // scanLogs += (log + (inLine ? "" : '\n'));
    // this.setState({
    //   scanLogs
    // })

    let scanLogs = this.state.scanLogs;
    let now = Date.now();
    let time = dateUtil.getDateTime(now);
    let title = log;

    scanLogs.unshift({
      title,
      time,
      k: now.toString() + Math.random() * 100,
      isRoundEnd: !!isRoundEnd
    })

    if (isRoundEnd) {
      scanLogs = this.checkLogAndDelete(scanLogs);
    }

    this.setState({
      scanLogs
    })
  }

  checkLogAndDelete = (scanLogs) => {
    if (!scanLogs || !scanLogs.length || scanLogs.length < 100) {
      return scanLogs;
    }
    let result = scanLogs.slice(0, 20);
    return result;
  }

  //清除单次扫描结果
  clearOneRoundResult = () => {
    this.setState({
      scanCode: null,
      scanScsCount: 0,
      scanFailCount: 0,
      scanTotalCount: 0,

      trayUniqueCodeList: [],
      boxUniqueCodeList: [],
      productUniqueCodeList: [],

      expressCode: null,
      stockCodeValidateList: []
    })
  }

  // 扫描场景更改
  onSceneTypeChange = (e) => {
    let sceneType = e.target.value;
    this.setState({
      sceneType
    })
  }

  // 解析扫码
  getScanCode = (code) => {
    if (!code) {
      return;
    }

    let result = parseScanCodeCompatBarCode(code);
    return result;
  }

  // 清除日志
  clearLogs = () => {
    this.setState({
      scanLogs: []
    })
  }

  onTabsChange = (activeKey) => {
    if (activeKey == "2") {
      this.setState({
        updateScanLogTime: Date.now(),
        scanLogParams: null
      })
    }


    if (activeKey == "3") {
      this.setState({
        updateOperLogTime: Date.now()
      })
    }

    this.setState({
      activeKey
    })
  }

  _hideExpressModal = () => {
    this.setState({
      expressModalIsVisible: false
    })
  }

  showExpressModal = () => {
    this.setState({
      expressModalIsVisible: true
    })
  }

  validateExpressCode = () => {
    let expressModalCode = this.state.expressModalCode;
    this._validateExpressCode(expressModalCode, true);
  }

  _validateExpressCode = (expressModalCode, isModal) => {
    if (!/^[A-Za-z0-9]+$/.test(expressModalCode)) {
      if (isModal) {
        this.setState({
          expressValidateInfo: "请输入正确的单号！"
        })
      } else {
        Toast("请输入正确的单号！")
        this.addScanCount("fail");
      }
      this.playAudioByCode("0018")
      return;
    }

    let params = { trackingNumber: expressModalCode };
    scanStockOutVerification(params)
      .then(data => {
        let { status, log, code } = data;
        this.playAudioByCode(code);
        if (status == '0') {
          if (!isModal) {
            Toast(log);
            this.addScanCount("fail");
          } else {
            this.setState({
              expressValidateInfo: log
            })
          }

          return;
        }

        this.setState({
          expressValidateInfo: null,
          expressCode: expressModalCode
        })

        if (!isModal) {
          this.addScanCount("scs");
          this.addScanLogs(`扫描单号【${expressModalCode}】`)
        } else {
          this.addScanLogs(`手动添加单号【${expressModalCode}】`)
        }

        Toast("单号验证成功！");
        this._hideExpressModal();
      })
  }

  onExpressModalCodeChange = (e) => {
    let expressModalCode = e.target.value;
    this.setState({
      expressModalCode
    })
  }

  /**经销商选择modal******************************************************************************************************** */

  showDealerModal = () => {
    this.setState({
      dealerModalIsVisible: true
    })
    if (!this.state.dealerList) {
      let organizationId = getCacheOrgId();
      if (!organizationId) {
        return;
      }
      getDealerListByOrganizationId({ organizationId })
        .then(dealerList => {
          this.setState({
            dealerList
          })
        })
    }
  }

  _hideDealerModal = () => {
    this.setState({
      dealerModalIsVisible: false,
      dealerValidateInfo: null
    })
  }

  onDealerChange = (selectDealerId) => {

    this.setState({
      selectDealerId
    })
  }

  getDealerDataById = (id) => {
    let dealerList = this.state.dealerList;
    if (!id || !dealerList || !dealerList.length) {
      return;
    }
    let arr = dealerList.filter(i => i.id == id)
    let result = arr[0];
    return result;
  }

  validateDealer = () => {
    if (!this.state.selectDealerId) {
      this.setState({
        dealerValidateInfo: "请选择经销商！"
      })
      return;
    } else {
      let selectDealerData = this.getDealerDataById(this.state.selectDealerId);
      this.setState({
        dealerValidateInfo: null,
        selectDealerData
      })
      this._hideDealerModal();
    }
  }

  clearSelectDealer = () => {
    this.setState({
      selectDealerData: null,
      selectDealerId: null
    })
  }
  onCheckFlagChange = (e) => {
    let checkFlag = e.target.checked;
    this.setState({
      checkFlag
    })
  }

  autoCompleteFilter = (inputValue, option) => {
    return option.props.filtertext.toUpperCase().indexOf(inputValue.toUpperCase()) !== -1
  }

  getMobileHide = (mobile) => {
    if (!mobile) {
      return;
    }
    let newStr = mobile.substr(0, 3) + "****" + mobile.substr(7, 11);
    return newStr
  }

  getDealerTotalOption = (name, mobile) => {
    let mobileHide = this.getMobileHide(mobile);
    let str = name + (mobileHide ? "（" + mobileHide + "）" : "");
    return str
  }

  /**语音提示**********************************************************************************************************************************/

  playAudioByCode = (audioCode) => {
    if (!audioCode) {
      return;
    }

    let audioUpdateTime = Date.now();
    this.setState({
      audioCode,
      audioUpdateTime
    })
  }


  /*拼接箱子的规格，应用于日志中*************************************************************************************************************/
  _getBoxSpeText = (data) => {
    if (!data) {
      return ""
    }
    let { boxLength, boxWidth, boxHeight, boxCapacity, productName, productBarCode } = data;
    let resultStr = `箱规格为【${boxLength}cm*${boxWidth}cm*${boxHeight}cm，容量：${boxCapacity}个】`;
    resultStr += productName ? `，关联商品【${productName}-${productBarCode}】` : "";

    return resultStr;
  }

  /**跳转 ********************************************************************************************************************************/
  goDetail = (inputParams) => {

    let { endCreateTimeStamp, startCreateTimeStamp, operId } = inputParams;
    let scanLogParams = {
      operId,
      startOutboundTimeStamp: startCreateTimeStamp || null,
      endOutboundTimeStamp: endCreateTimeStamp || null
    };

    this.setState({
      activeKey: "2",
      scanLogParams
    }, this.setState({
      updateScanLogTime: Date.now()
    }))
  }
  /**渲染**********************************************************************************************************************************/

  render() {
    const { getFieldDecorator } = this.props.form;
    const { dealerList } = this.state;
    return (
      <CommonPage title={_title} description={_description} >
        <Tabs activeKey={this.state.activeKey} type="card" onChange={this.onTabsChange}>
          <TabPane tab="扫码出库" key="1">
            <Row>
              <Col style={{ width: 120 }} className='text-right margin-right' span={3}>
                出库引导：
              </Col>
              <Col span={20} className='color-red'>
                1、出库时不能经销商与单号同时为空；<br />
                2、出库时商品最多只能绑定一个单号；
              </Col>
            </Row>
            <Row className='margin-top'>
              <Col style={{ width: 120 }} className='text-right margin-right' span={3}>
                <div className='line-height40'>经销商：</div>
                <div className='line-height40'>单号：</div>
                {/* <div className='line-height40'>出库关联检查：</div> */}
              </Col>
              <Col span={20}>
                <div className='flex'>
                  <div>
                    <div className='flex margin-bottom'>
                      <div
                        onClick={this.showDealerModal}
                        style={{ minWidth: "300px", cursor: "pointer", backgroundColor: "#f1f1f1", padding: '5px 10px', color: "#aaa" }}
                      >
                        {
                          this.state.selectDealerData && this.state.selectDealerData.dealerName ?
                            this.state.selectDealerData.dealerName :
                            "点击选择所在组织架构下的经销商"
                        }

                      </div>
                      <Button onClick={this.clearSelectDealer} type='primary'>清空</Button>
                    </div>
                    <div className='flex'>
                      <div
                        onClick={this.showExpressModal}
                        style={{ minWidth: "300px", width: "100%", cursor: "pointer", backgroundColor: "#f1f1f1", padding: '5px 10px', color: "#aaa" }}>{this.state.expressCode || "点击输入单号"}</div>
                    </div>
                  </div>
                  <div>
                    <Button onClick={this.stockOutClick} type='primary' className='margin-left20 scan-btn'>出库</Button>
                  </div>
                  <div>
                    <Button onClick={this.clearOneRoundResult} className='yellow-btn margin-left scan-btn'>重新开始</Button>
                  </div>
                </div>
                {/* <div className='line-height40 margin-top'>
                  <Checkbox checked={this.state.checkFlag} onChange={this.onCheckFlagChange}>不检查</Checkbox><span className='color-red'>（当选中时，适用于特殊情况：1.出库发货后退货到仓库重新发货。2.出库发货后特殊原因（遗漏，破损等）仓库重新发货）</span>
                </div> */}
              </Col>
              <Col span={20} offset={3}>
                <div className='flex-between line-height30 margin-top20' style={{ width: 300 }}>
                  <span>扫描次数：{this.state.scanTotalCount || 0} </span>
                  <span>失败次数：{this.state.scanFailCount || 0} </span>
                  <span>成功次数：{this.state.scanScsCount || 0} </span>
                </div>
              </Col>
            </Row>
            <div className='line-height40 margin-top20'>
              <Row>
                <Col style={{ width: 120 }} className='text-right  margin-right' span={3}>
                  条码扫描：
                </Col>
                <Col span={20} className='flex line-height40 align-center'>
                  <div style={{ width: 320, border: "1px solid #ccc", borderRadius: "4px", lineHeight: "30px", height: 30, paddingLeft: "10px" }}>{this.state.scanCode}</div>
                  <Button onClick={this.clearLogs} className='margin-left'>清除日志</Button>

                </Col>
              </Row>
              <Row>
                <Col style={{ width: 120 }} className='text-right  margin-right' span={3}>
                  扫描日志：
                </Col>
                <Col span={20}>
                  <div style={{ minWidth: 600, padding: "10px", maxWidth: 800, marginTop: 10, minHeight: 300, maxHeight: 500, overflowY: "auto", border: "1px solid #ccc", borderRadius: "4px" }}>
                    {
                      this.state.scanLogs && this.state.scanLogs.length ?
                        this.state.scanLogs.map(item =>
                          <div key={item.k} className='flex' style={{ marginBottom: "6px" }} >
                            <div style={{ width: 146, flex: "0 0 auto", lineHeight: "18px", color: "#1890ff" }}>{item.time}</div>
                            <div className={item.isRoundEnd ? "color-green" : ""} style={{ wordWrap: "break-word", wordBreak: "break-all", lineHeight: "18px" }}>{item.title}</div>
                          </div>
                        )
                        :
                        null
                    }
                  </div>
                </Col>
              </Row>
            </div>
            <AudioPlay audioCode={this.state.audioCode} updateTime={this.state.audioUpdateTime}></AudioPlay>
          </TabPane>
          <TabPane tab="拣货记录" key="2">
            <StockOutScanLog updateTime={this.state.updateScanLogTime} scanLogParams={this.state.scanLogParams}></StockOutScanLog>
          </TabPane>
          <TabPane tab="人员记录" key="3">
            <StockOperLog updateTime={this.state.updateOperLogTime} goDetail={this.goDetail}></StockOperLog>
          </TabPane>
        </Tabs>

        <a ref="exportUrl" download="工单数据" style={{ 'display': "none" }} href={this.state.exportUrl} ></a>
        <Modal maskClosable={false}
          title='单号'
          visible={this.state.expressModalIsVisible}
          onCancel={this._hideExpressModal}
          onOk={this.validateExpressCode}
        >
          <div className='middle-center'>
            <Input value={this.state.expressModalCode} onChange={this.onExpressModalCodeChange} placeholder='输入物流单号或者订单号' />
          </div>
          <div className='color-red line-height30 padding-left'>
            {this.state.expressValidateInfo}
          </div>
        </Modal>

        <Modal maskClosable={false}
          title='选择经销商'
          visible={this.state.dealerModalIsVisible}
          onCancel={this._hideDealerModal}
          onOk={this.validateDealer}
        >

          <AutoComplete
            allowClear
            style={{ width: "100%" }}
            dataSource={dealerList}
            onChange={this.onDealerChange}
            children={
              dealerList ? dealerList.map(item =>
                <AutoComplete.Option title={item.name} key={item.id} value={item.id.toString()} filtertext={item.dealerName + "（" + item.phone + "）"}>
                  {this.getDealerTotalOption(item.dealerName, item.phone)}
                </AutoComplete.Option>
              ) : null
            }
            placeholder='请选择经销商'
            filterOption={this.autoCompleteFilter}
          />
          <div className='color-red line-height30 padding-left'>
            {this.state.dealerValidateInfo}
          </div>

        </Modal>
      </CommonPage >
    )
  }
}

export default Form.create()(Page);