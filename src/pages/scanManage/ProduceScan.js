import React, { Component } from "react";
import CommonPage from '../../components/common-page';
import { Table, Form, Input, Select, Tabs, Col, Row, Icon, Radio, Button, Divider, Popconfirm, Modal, Checkbox, InputNumber } from "antd";
import { pagination } from '../../utils/pagination';
import Toast from '../../utils/toast';
import { SearchForm, SubmitForm } from '../../components/common-form';
import dateUtil from '../../utils/dateUtil';
import { parseScanCode, parseScanCodeCompatBarCode } from '../../utils/qrCode';
import { scanEvent } from './scanEvent';
import { scanVerification, scanSubmit } from '../../api/scan/produceScan';
import ScanLog from './ProduceScanLog';
import OperLog from './OperLog';

import AudioPlay from '../../components/audioPlay/AudioPlay';


const { TabPane } = Tabs;
const _title = "生产扫描";
const _description = "";

class Page extends Component {

  state = {
    trayModalIsVisible: false,
    exportUrl: null,
    uniqueCodeQuantity: null,

    scanCode: null,
    scanScsCount: 0,
    scanFailCount: 0,
    scanTotalCount: 0,

    sceneType: "0",
    scanChildCodeArr: [],
    scanProductInTrayCodeArr: [],
    scanBoxInTrayCodeArr: [],
    scanParentCode: null,
    scanParentRltPrdBarCode: null,
    capacity: 0,
    scanLogs: [],
    canResubmit: false,
    submitParams: null,
    updateScanLogTime: null,
    updateOperLogTime:null,

    audioCode: null,
    audioUpdateTime: null,
    activeKey:"1"
  }

  params = {
    page: 1
  }

  /**扫码枪事件的注册、注销********************************************************************************************** */

  /**进入页面时候，注册扫码枪事件*/
  componentDidMount() {
    this.clearOneRoundResult();
    window.addEventListener('keypress', this.scanWrapper, false);
  }

  /**注销页面时候，注销扫码枪事件**** */

  componentWillUnmount() {
    window.removeEventListener('keypress', this.scanWrapper, false);
  }

  /**扫码枪事件**************** */

  scanWrapper = (e) => {

    scanEvent(e, (data) => {
      this._handleScanedCode(data)
    });
  }

  /**处理溯源码*************************************************************************************************/

  /**处理扫描的溯源码********************/
  _handleScanedCode = (data) => {

    this.addScanCount("total");
    let result = this.getScanCode(data);
    if (!result) {
      Toast("该码不存在，请扫描正确的二维码！");
      this.playAudioByCode("0011");
      this.addScanCount("fail");
      return;
    }

    if (!result.code || !result.codeType) {
      this.addScanCount("fail");
      return;
    }

    if (this.state.scanParentCode) {
      let isValid = this._childCodeIsValid(result.code, this.state.scanChildCodeArr);
      if (!isValid || this.state.scanParentCode == result.code) {
        Toast("重复扫码！");
        this.playAudioByCode("0024");
        this.addScanCount("fail");
        return;
      }
    }

    this._scanCodeVerification(result)
      .then(res => {
        if (!res) {
          this.addScanCount("fail");
          return;
        }
        let { status, log, code } = res;
        let voiceCode = res.code;

        if (status == 0) {
          Toast(log);
          this.playAudioByCode(voiceCode);
          this.addScanCount("fail");
          return;
        }

        if (res && res.code) {
          delete res.code;
        }
        this.handleScanCode({ ...result, ...res, voiceCode });
      })
      .catch(() => {
        this.addScanCount("fail");
      })

  }

  // 扫描的码进行接口数据验证
  _scanCodeVerification = (result) => {
    let { code, codeType } = result;
    let sceneType = this.state.sceneType;
    let params = { sceneType };
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
    if (this.validateBoxInTrayFirstScan(codeType)) {
      return scanVerification(params)
    }

  }

  // 根据扫描的场景进行不同的处理扫描结果
  handleScanCode = (result) => {
    this.setState({
      scanCode: result.code
    })

    let sceneType = this.state.sceneType;
    switch (sceneType) {

      // 箱装货
      case "0":
        this.productInBoxScan(result)
        break;

      // 箱装箱子
      case "1":
        this.boxInBoxScan(result)
        break;


      // 上托盘
      case "2":
        this.boxInTrayScan(result)
        break;
    }
  }


  /** * 箱装货**********************************************************************************************/
  productInBoxScan = (result) => {

    let { code, codeType, voiceCode, prdBarCode } = result;

    let scanParentCode = this.state.scanParentCode;
    let scanChildCodeArr = this.state.scanChildCodeArr;

    if (!scanParentCode) {
      if (codeType != 'box') {
        Toast("请扫描箱码！");
        this.playAudioByCode("0025");
        this.addScanCount("fail");
        return;
      }
      let { capacity, scanData, productName, productBarCode } = result;

      capacity = parseInt(capacity);
      scanData = scanData ? JSON.parse(scanData) : null;
      let boxSpeText = this._getBoxSpeText({ ...scanData, productName, productBarCode });
      this.setState({
        scanParentCode: code,
        scanParentRltPrdBarCode: productBarCode || "",
        capacity
      })
      this.addScanCount("scs");
      this._addScanLogsAndPlayVoice(`已扫描货箱【${code}】，${boxSpeText}，接下来请扫描【${capacity}】个包装条码！`, voiceCode)

    } else {

      if (codeType != 'product') {
        Toast("请扫描商品码！");
        this.playAudioByCode('0027');
        this.addScanCount("fail");
        return;
      }

      let arrLength = scanChildCodeArr.length;

      if (arrLength >= this.state.capacity) {
        Toast("箱子容量已满！");
        return;
      }

      if (arrLength > 0) {
        if (!this.productFrontCodeIsEqual(scanChildCodeArr[0], code)) {
          Toast("不同商品，请扫描条码相同的货品！");
          this.playAudioByCode("0028");
          this.addScanCount("fail");
          return
        }
      }

      let scanParentRltPrdBarCode = this.state.scanParentRltPrdBarCode;
      console.log('scanParentRltPrdBarCode:' + scanParentRltPrdBarCode)
      console.log('prdBarCode:' + prdBarCode)
      if (scanParentRltPrdBarCode && prdBarCode != scanParentRltPrdBarCode) {
        Toast("商品不匹配，请扫描与箱码匹配的货品！");
        this.playAudioByCode("0029");
        this.addScanCount("fail");
        return;
      }

      if (arrLength == parseInt(this.state.capacity) - 1) {
        this._pushChildScanCode(code);
        this._addScanLogsAndPlayVoice(`已扫描包码【${code}】`, voiceCode)
        this.scanEnd('productInBox', result);
      } else {
        this._pushChildScanCode(code);
        this._addScanLogsAndPlayVoice(`已扫描包码【${code}】`, voiceCode)
      }
    }
  }

  //获取货品码的编号（0-负19位字符）
  getFrontCode = (str) => {
    str = str.toString();
    if (!str || !str.length || str.length < 19) {
      return;
    }
    let length = str.length;
    let code = str.substr(0, length - 19);
    return code;
  }

  // 比较两个货品码的编号
  productFrontCodeIsEqual = (str1, str2) => {
    let str1Code = this.getFrontCode(str1);
    let str2Code = this.getFrontCode(str2);
    return str1Code == str2Code
  }

  // 箱装箱
  boxInBoxScan = (result) => {
    let { code, codeType, voiceCode } = result;

    if (codeType != 'box') {
      Toast("请扫描箱码！");
      this.addScanCount("fail");
      return;
    }

    let scanParentCode = this.state.scanParentCode;
    let scanChildCodeArr = this.state.scanChildCodeArr;

    if (!scanParentCode) {
      let { capacity, scanData } = result;
      capacity = parseInt(capacity);
      scanData = scanData ? JSON.parse(scanData) : null;
      let boxSpeText = this._getBoxSpeText(scanData);
      this.setState({
        scanParentCode: code,
        capacity
      })
      this.addScanCount("scs");
      this._addScanLogsAndPlayVoice(`已扫描货箱【${code}】，${boxSpeText}，接下来请扫描【${capacity}】个箱装条码！`, voiceCode)

    } else {

      let arrLength = scanChildCodeArr.length;

      if (arrLength >= this.state.capacity) {
        Toast("箱子容量已满！");
        return;
      }

      if (arrLength == parseInt(this.state.capacity) - 1) {
        this._pushChildScanCode(code);
        this._addScanLogsAndPlayVoice(`已扫描箱码【${code}】`, voiceCode)
        this.scanEnd('boxInBox', result);
      } else {
        this._pushChildScanCode(code);
        this._addScanLogsAndPlayVoice(`已扫描箱码【${code}】`, voiceCode)
      }
    }
  }

  /**验证第一次上托盘时的码是否为托盘码 */
  validateBoxInTrayFirstScan = (codeType) => {
    let sceneType = this.state.sceneType;
    if (sceneType != '2') {
      return true
    }

    let scanParentCode = this.state.scanParentCode;
    if (!scanParentCode && codeType != 'tray') {
      Toast("请扫描托盘！");
      this.playAudioByCode("0026");
      this.addScanCount("fail");
      return;
    }
    return true
  }

  //箱或者货品上托盘
  boxInTrayScan = (result) => {
    let { code, codeType, voiceCode } = result;

    let scanParentCode = this.state.scanParentCode;
    let scanProductInTrayCodeArr = this.state.scanProductInTrayCodeArr;
    let scanBoxInTrayCodeArr = this.state.scanBoxInTrayCodeArr;

    if (!scanParentCode) {
      if (codeType != 'tray') {
        Toast("请扫描托盘！");
        this.playAudioByCode("0026");
        this.addScanCount("fail");
        return;
      }

      this.setState({
        scanParentCode: code
      })
      this.addScanCount("scs");
      this._addScanLogsAndPlayVoice(`已扫描托盘【${code}】，接下来请扫描箱码或者商品码！`, voiceCode)

    } else {

      if (codeType != 'box' && codeType != 'product') {
        Toast("请扫描箱码或商品码！");
        this.addScanCount("fail");
        return;
      }


      let isvalid = this._pushChildScanCodeToTray(code, codeType);
      if (!isvalid) {
        return;
      }

      if (codeType == 'box') {
        this._addScanLogsAndPlayVoice(`已扫描箱码【${code}】`, voiceCode);
      }

      if (codeType == 'product') {
        this._addScanLogsAndPlayVoice(`已扫描商品码【${code}】`, voiceCode)
      }

    }
  }

  // 添加子码到托盘
  _pushChildScanCodeToTray = (code, type) => {
    let scanProductInTrayCodeArr = this.state.scanProductInTrayCodeArr;
    let scanBoxInTrayCodeArr = this.state.scanBoxInTrayCodeArr;

    let isValid = this._childCodeIsValid(code, scanProductInTrayCodeArr);
    let _isValid = this._childCodeIsValid(code, scanBoxInTrayCodeArr);
    if (!isValid || !_isValid) {
      Toast("重复扫码！");
      this.playAudioByCode("0024");
      this.addScanCount("fail");
      return;
    }

    if (type == 'product') {
      scanProductInTrayCodeArr.push(code);
      this.setState({
        scanProductInTrayCodeArr
      })

    } else if (type == 'box') {
      scanBoxInTrayCodeArr.push(code);
      this.setState({
        scanBoxInTrayCodeArr
      })
    } else {
      return;
    }

    this.addScanCount("scs");
    return true;
  }

  // 扫描结束
  scanEnd = (type, result) => {
    console.log("scanEnd");
    let sceneType = this.state.sceneType;
    let params = {
      sceneType
    }
    let { scanParentCode, scanChildCodeArr, scanProductInTrayCodeArr, scanBoxInTrayCodeArr } = this.state;

    if (type == "productInBox") {
      params.boxUniqueCode = scanParentCode;
      params.productUniqueCodeList = scanChildCodeArr;
    }

    if (type == "boxInBox") {
      params.boxUniqueCode = scanParentCode;
      params.boxUniqueCodeList = scanChildCodeArr;
    }

    if (type == "boxInTray") {
      params.trayUniqueCode = scanParentCode;
      params.boxUniqueCodeList = scanBoxInTrayCodeArr;
      params.productUniqueCodeList = scanProductInTrayCodeArr;
      if (!params.trayUniqueCode) {
        Toast('请扫描托盘码！');
        this.playAudioByCode("0026");
        return;
      }

      if (!params.boxUniqueCodeList || !params.productUniqueCodeList) {

        Toast('请扫描商品码或箱码！');
        return;
      }

    }
    this.submitScan(params);
  }

  // 提交扫码结果，装箱完成
  submitScan = (params) => {
    scanSubmit(params)
      .then(() => {

        setTimeout(() => {
          if (params.sceneType == '2') {
            Toast('上托盘完成！');

            this._addScanLogsAndPlayVoice(`恭喜上托盘完成！`, '0010', true);
          } else {
            Toast('装箱完成！');
            // document.getElementById("clickedHiddenLabel").click();
            this._addScanLogsAndPlayVoice(`恭喜装箱完成！`, '0009', true);
          }
          this.clearOneRoundResult();
        }, 1000)

      })
      .catch(() => {
        if (this.state.sceneType != '2') {
          this.setState({
            submitParams: params,
            canResubmit: true
          })
        }
      })
  }

  // 重新提交生产扫描的结果
  resubmitClick = () => {
    if (this.state.canResubmit && this.state.submitParams) {
      this.submitScan(this.state.submitParams);
    }
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



  // 手动结束扫描（上托盘）
  handleEndScanClick = () => {
    this.scanEnd('boxInTray');
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

  /**手动输入溯源码*********************************************************** */


  onTraceModalCodeChange = (e) => {
    let traceModalCode = e.target.value;
    this.setState({
      traceModalCode
    })
  }

  _hideTraceModal = () => {
    this.setState({
      traceModalIsVisible: false,
      traceModalCode: null
    })
  }

  showTraceModal = () => {
    this.setState({
      traceModalIsVisible: true
    })
  }


  /*处理手动输入的溯源码*************************/

  async handleInputCode(data) {

    let result = this.parseInputCode(data);

    if (!result || !result.code || !result.codeType) {

      Toast("请输入正确的二维码！");
      this.playAudioByCode("0011");
      return;
    }

    if (this.state.scanParentCode) {
      let isValid = this._childCodeIsValid(result.code, this.state.scanChildCodeArr);
      if (!isValid || this.state.scanParentCode == result.code) {
        Toast("溯源码重复！");
        this.playAudioByCode("0024")
        return;
      }
    }

    let res = await this._scanCodeVerification(result);
    if (!res) {
      this.addScanCount("fail");
      return;
    }
    let { status, log, code } = res;
    let voiceCode = res.code;

    if (status == 0) {
      this.playAudioByCode(voiceCode);
      Toast(log);
      return;
    }

    if (res && res.code) {
      delete res.code;
    }
    let _params = { ...result, ...res, voiceCode };

    if (_params.codeType == 'product' && result.code && result.code.length > 19) {
      _params.prdBarCode = result.code.slice(0, -19);
    }

    this.handleScanCode(_params);
    return true
  }

  // 解析手动输入的溯源码
  parseInputCode = (code) => {
    if (!code || code.length < 13) {
      return;
    }

    let firstLetter = code.slice(0, 1).toUpperCase();
    let codeType = null;

    if (firstLetter == 'T') {
      codeType = 'tray'
    } else if (firstLetter == 'X') {
      codeType = 'box'
    } else if (/[0-9]/.test(firstLetter)) {
      codeType = 'product'
    }
    let result = {
      code,
      codeType
    }

    return result
  }

  /**验证及拼接************************************************************************************************************/
  // 添加子码到数组
  _pushChildScanCode = (code) => {
    let scanChildCodeArr = this.state.scanChildCodeArr;
    scanChildCodeArr.push(code);
    this.addScanCount("scs");
    this.setState({
      scanChildCodeArr
    })
  }

  // 增加扫描日志
  _addScanLogsAndPlayVoice = (log, voiceCode, isRoundEnd) => {
    let scanLogs = this.state.scanLogs;
    let now = Date.now();
    let time = dateUtil.getDateTime(now);
    let title = log;
    if (voiceCode) {
      this.playAudioByCode(voiceCode);
    }

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
      capacity: 0,
      scanChildCodeArr: [],
      scanParentCode: null,
      canResubmit: false,
      submitParams: null,
      scanProductInTrayCodeArr: [],
      scanBoxInTrayCodeArr: []
    })
  }

  // 验证子码为有效，不重复
  _childCodeIsValid = (code, childCodeArr) => {

    if (!code) {
      return;
    }

    if (!childCodeArr.length) {
      return true;
    }

    let index = childCodeArr.indexOf(code);
    if (index == -1) {
      return true;
    }
    return
  }

  //拼接箱子的规格，应用于日志中
  _getBoxSpeText = (data) => {
    if (!data) {
      return ""
    }
    let { boxLength, boxWidth, boxHeight, boxCapacity, productName, productBarCode } = data;
    let resultStr = `箱规格为【${boxLength}cm*${boxWidth}cm*${boxHeight}cm，容量：${boxCapacity}个】`;
    resultStr += productName ? `，关联商品【${productName}-${productBarCode}】` : "";

    return resultStr;
  }


  // 验证手动收入的验证码
  validateInputTraceCode = () => {
    let traceModalCode = this.state.traceModalCode;
    this.handleInputCode(traceModalCode)
      .then(data => {

        data && this._hideTraceModal();
      })
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

  /**跳转 ********************************************************************************************************************************/
  goDetail = (inputParams) => {

    let { endCreateTimeStamp, startCreateTimeStamp, operId } = inputParams;
    let scanLogParams = {
      operId,
      startScanTimeStamp: startCreateTimeStamp || null,
      endScanTimeStamp: endCreateTimeStamp || null
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
    return (
      <CommonPage title={_title} description={_description} >
        <Tabs activeKey={this.state.activeKey} type="card" onChange={this.onTabsChange}>
          <TabPane tab="生产扫描" key="1">
            <div className='line-height40'>

              <Row >
                <Col style={{ width: 120 }} className='text-right margin-right' span={3}>
                  场景：
                </Col>
                <Col span={20}>
                  <div className='flex'>
                    <Radio.Group value={this.state.sceneType} onChange={this.onSceneTypeChange}>
                      <Radio value={"0"}>箱装货</Radio>
                      {/* <Radio value={"1"}>箱装箱</Radio> */}
                      <Radio value={"2"}>上托盘</Radio>
                    </Radio.Group>
                    <div className='margin-left20 flex-between' style={{ width: 300 }}>
                      <span>扫描次数：{this.state.scanTotalCount || 0} </span>
                      <span>失败次数：{this.state.scanFailCount || 0} </span>
                      <span>成功次数：{this.state.scanScsCount || 0} </span>
                    </div>
                  </div>
                </Col>
              </Row>

              <Row>
                <Col style={{ width: 120 }} className='text-right  margin-right' span={3}>
                  条码扫描：
                </Col>
                <Col span={20} className='flex'>
                  <div onClick={this.showTraceModal} style={{ width: 300, border: "1px solid #ccc", cursor: "pointer", backgroundColor: "#f1f1f1", color: "#aaa", borderRadius: "4px", lineHeight: "30px", paddingLeft: "10px" }}>
                    {this.state.scanCode || "点击输入溯源码"}
                  </div>
                  <Button onClick={this.clearOneRoundResult} type='primary' className='margin-left'>清除这轮扫描</Button>
                  {
                    this.state.sceneType == '2' && (this.state.scanProductInTrayCodeArr.length || this.state.scanBoxInTrayCodeArr.length) ?
                      <Button onClick={this.handleEndScanClick} type='primary' className='margin-left'>结束这轮扫描</Button>
                      : null
                  }
                  <Button onClick={this.clearLogs} className='margin-left'>清除日志</Button>
                  {
                    this.state.canResubmit ?
                      <Button onClick={this.resubmitClick} className='yellow-btn margin-left'>重新提交扫描结果</Button>
                      : null
                  }

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
          <TabPane tab="扫描记录" key="2">
            <ScanLog updateTime={this.state.updateScanLogTime} scanLogParams={this.state.scanLogParams}></ScanLog>
          </TabPane>
          <TabPane tab="人员记录" key="3">
            <OperLog updateTime={this.state.updateOperLogTime} goDetail={this.goDetail}></OperLog>
          </TabPane>
        </Tabs>

        <a ref="exportUrl" download="工单数据" style={{ 'display': "none" }} href={this.state.exportUrl} ></a>
        <Modal maskClosable={false}
          title='输入唯一码'
          visible={this.state.traceModalIsVisible}
          onCancel={this._hideTraceModal}
          onOk={this.validateInputTraceCode}
        >
          <div className='middle-center'>
            <Input value={this.state.traceModalCode} onChange={this.onTraceModalCodeChange} placeholder='输入唯一码' />
          </div>
          <div className='color-red line-height30 padding-left'>
            {this.state.traceValidateInfo}
          </div>
        </Modal>
        {/* <a id='clickedHiddenLabel'>结束装箱测试标签</a> */}
      </CommonPage >
    )
  }
}

export default Form.create()(Page);