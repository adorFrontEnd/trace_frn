import React, { Component } from "react";
import { Col, Row, Checkbox, Card, Modal, Spin, Form, Popconfirm, Radio, Switch, Icon, DatePicker, Button, Input, Table, Select, InputNumber } from 'antd';
import moment from 'moment';
import SelectProduct from '../../components/selectProduct/SelectProduct';
import Toast from '../../utils/toast';
import { isAddProductIdIndexOfProductList, getAddProductArr, formatOwnProductArr } from './prizeConfigUtil';
import UserDefinedProductModal from '../../components/selectProduct/UserDefinedProductModal';
import ColorPicker from '../../components/colorPicker/ColorPicker';


export default class Page extends Component {

  state = {
    activityPoint: null,
    expiredStatus: "1",
    expireConstantTime: null,
    expireConstantDays: 1,
    selectProductModalIsVisible: false,
    bigWheelProductArr: null,
    uploadModalVisible: false
  }

  componentWillReceiveProps(props) {
    if (props.isReEdit && !this.props.isReEdit && props.configDetail) {
      this.revertData(props.configDetail);
    }
  }

  revertData = (activityDetail) => {
    let { configList, expiredStatus, expiredTime, consumptionPoints } = activityDetail;
    let expireConstantTime = null;
    let expireConstantDays = 1;
    let bigWheelProductArr = configList ? JSON.parse(configList) : null;
    expiredTime = parseInt(expiredTime);
    if (expiredStatus == '1') {
      expireConstantTime = moment(expiredTime);
      expireConstantDays = null;
    } else {
      expireConstantTime = null;
      expireConstantDays = expiredTime
    }

    this.setState({
      activityPoint: consumptionPoints,
      expiredStatus: expiredStatus == '1' ? "1" : "2",
      expiredTime,
      expireConstantTime,
      expireConstantDays,
      bigWheelProductArr
    })
  }
  //保存
  saveClicked = () => {
    let isReEdit = this.props.isReEdit;
    let params = this.validateData(isReEdit);
    if (params) {
      this.props.saveClicked(params);
    }
  }



  validateData = (isReEdit) => {
    let { activityPoint, expiredStatus, expireConstantDays, expireConstantTime, bigWheelProductArr } = this.state;
    expireConstantTime = expireConstantTime ? Date.parse(expireConstantTime) : null;
    let expiredTime = expiredStatus == '1' ? expireConstantTime : expireConstantDays;
    if (!expiredTime) {
      Toast('请设置兑奖截止时间！')
      return;
    }

    if (isReEdit) {
      return {
        expiredStatus, expiredTime
      };
    }

    if (!activityPoint) {
      Toast('请设置参与一次活动消耗的积分！');
      return;
    }

    let configList = this.validateProductArr(bigWheelProductArr);
    if (!configList || !configList.length) {
      return;
    }

    let result = {
      configList, expiredStatus, expiredTime, consumptionPoints: activityPoint
    }
    return result;
  }

  validateProductArr = (pArr) => {
    if (!pArr || !pArr.length) {
      Toast('请设置活动奖品');
      return;
    }
    let isValid = true;
    let title = '';
    let totalOddsOfWinning = 0;
    for (let i = 0; i < pArr.length; i++) {
      let item = pArr[i];
      let { prizeLevel, prizeNumber, oddsOfWinning } = item;
      if (!prizeLevel) {
        title = "请设置奖品级别！";
        isValid = false;
        break;
      }

      if (!prizeNumber || parseInt(prizeNumber) <= 0) {
        title = "请设置奖品数量,奖品数量必须大于0！";
        isValid = false;
        break;
      }


      if (!oddsOfWinning || parseInt(oddsOfWinning) <= 0) {
        title = "请设置中奖率,中奖率必须大于0！";
        isValid = false;
        break;
      }
      totalOddsOfWinning += parseInt(oddsOfWinning);
    }

    if (totalOddsOfWinning > 100) {
      title = "奖池的总中奖率之和不能超过100%！";
      isValid = false;
    }

    if (!isValid) {
      Toast(title);
      return;
    }

    let result = pArr.map((item, index) => {
      let { _id, wonNumber, ...other } = item;
      return { ...other, orders: index + 1 };
    })
    return JSON.stringify(result);

  }

  // 参与一次活动消耗的积分
  onActivityPointQuantityChange = (activityPoint) => {
    this.setState({
      activityPoint
    })
  }

  //兑奖截止日期选择方式
  onexpiredStatusChange = (e) => {
    let expiredStatus = e;
    this.setState({
      expiredStatus
    })
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

  addPrizeProductClicked = (isUserDefined) => {
    if (isUserDefined) {
      this.showUploadModal();
    } else {
      this.setState({
        selectProductModalIsVisible: true
      })
    }
  }

  _hideSelectProductModal = () => {
    this.setState({
      selectProductModalIsVisible: false
    })
  }

  onSelectProductConfirmClick = (selectRows) => {
    let bigWheelProductArr = this.state.bigWheelProductArr || [];
    let activityId = this.props.activityId;
    let newArr = formatOwnProductArr(selectRows, activityId);
    this.setState({
      bigWheelProductArr: [...bigWheelProductArr, ...newArr]
    })
    this._hideSelectProductModal();

  }

  onPrizeNumberChange = (index, prizeNumber) => {
    let bigWheelProductArr = this.state.bigWheelProductArr;
    bigWheelProductArr[index]['prizeNumber'] = prizeNumber;
    this.setState({
      bigWheelProductArr
    })
  }

  onPrizeLevelChange = (index, e) => {
    let bigWheelProductArr = this.state.bigWheelProductArr;
    let prizeLevel = e.target.value;
    bigWheelProductArr[index]['prizeLevel'] = prizeLevel;
    this.setState({
      bigWheelProductArr
    })
  }

  onOddsOfWinningChange = (index, oddsOfWinning) => {
    let bigWheelProductArr = this.state.bigWheelProductArr;
    bigWheelProductArr[index]['oddsOfWinning'] = oddsOfWinning;
    this.setState({
      bigWheelProductArr
    })
  }


  deletePreProductItem = (index) => {
    let bigWheelProductArr = this.state.bigWheelProductArr;
    bigWheelProductArr.splice(index, 1);
    this.setState({
      bigWheelProductArr
    })
  }

  moveProductItem = (index, action) => {

    let arr = this.state.bigWheelProductArr;
    let temp = arr[index];
    let changeIndex = action == "up" ? (index - 1) : (index + 1);
    arr[index] = arr[changeIndex];
    arr[changeIndex] = temp;
    this.setState({
      bigWheelProductArr: arr
    })
  }

  showUploadModal = () => {
    this.setState({
      uploadModalVisible: true
    })
  }

  hideUploadModal = () => {
    this.setState({
      uploadModalVisible: false
    })
  }

  onUserDefinedProductlOk = (product) => {
    let { url, name } = product;
    let productData = { image: url, name };
    let bigWheelProductArr = this.state.bigWheelProductArr || [];
    let activityId = this.props.activityId;
    let newArr = formatOwnProductArr([productData], activityId);
    this.setState({
      bigWheelProductArr: [...bigWheelProductArr, ...newArr]
    })
    this.hideUploadModal();
  }

  colorPickerChange = (color, index) => {
    let { hex } = color;
    let colorHex = hex.slice(1);
    let bigWheelProductArr = this.state.bigWheelProductArr;
    bigWheelProductArr[index]['color'] = colorHex;
    this.setState({
      bigWheelProductArr
    })
  }

  render() {
    return (
      <div >
        <Spin spinning={this.props.spinning}>
          <Row className='line-height40 padding10-0'>
            <Col offset={1}>
              <Button type='primary' style={{ width: 100 }} onClick={this.saveClicked}>保存</Button>
              <Button type='primary' className='yellow-btn margin-left20' style={{ width: 100 }} onClick={this.props.goEditBack}>返回</Button>
            </Col>
          </Row>
          <div>
            <div className='line-height40 flex-middle'>
              <span >参与一次活动消耗的积分：</span>
              <InputNumber
                disabled={this.props.isReEdit}
                value={this.state.activityPoint}
                onChange={(e) => { this.onActivityPointQuantityChange(e) }}
                style={{ width: 120 }}
                min={0} max={99999999}
                placeholder='请填写积分'
              />
              <span className='color-red margin-left'>保存后不可修改</span>
              <span className='margin-left20'>兑奖截止：</span>
              <Select value={this.state.expiredStatus} style={{ width: 120, marginRight: "10px" }} onChange={this.onexpiredStatusChange}>
                <Select.Option value={"1"}>固定时间</Select.Option>
                <Select.Option value={"2"}>中奖后</Select.Option>
              </Select>
              <span>
                {
                  this.state.expiredStatus == 1 ?
                    <DatePicker
                      value={this.state.expireConstantTime}
                      onChange={(e) => { this.onExpireTimeChange(e, 'time') }}
                      showTime
                      format="YYYY-MM-DD HH:mm:ss"
                      placeholder="截止时间"
                    />
                    :
                    <span>
                      <InputNumber value={this.state.expireConstantDays} onChange={(e) => { this.onExpireTimeChange(e, 'days') }} precision={0} min={0} /> <span className='margin-left'>天</span>
                    </span>
                }
              </span>
            </div>
            <div className='line-height40 font-16'>奖池（保存后无法修改）</div>
            <div className='color-red' style={{ lineHeight: "20px", marginBottom: "20px" }}>
              <div >奖池说明：</div>
              <div>1、中奖率为每次抽中该奖品的中奖品的概率，假如该奖品中奖率为10%且仍有奖品未被抽完，则真实中奖概率为10%；</div>
              <div>2、如果奖品已被抽走完了，则真实中奖概率为0%；</div>
              <div>3、奖池的总中奖率之和不能超过100%；</div>
              <div>4、该奖品顺序在抽奖页面奖品中以同样的顺序按表格方式呈现。</div>
            </div>
            <div style={{ paddingBottom: "300px" }}>
              {
                this.state.bigWheelProductArr && this.state.bigWheelProductArr.length ?
                  this.state.bigWheelProductArr.map((item, index) => (
                    <div key={item.id || item._id} className='margin-bottom'>
                      <div className='flex padding align-center'>
                        <img src={item.prizeImage} style={{ height: 40, width: 40 }} />
                        <div className='margin0-10'>
                          <div style={{ width: 260 }} className='ellipsis'>商品名称：{item.prizeName}</div>
                        </div>
                        <div className='margin0-10'>
                          <span>奖品级别：</span>
                          <Input
                            disabled={this.props.isReEdit}
                            onChange={(e) => { this.onPrizeLevelChange(index, e) }}
                            value={item.prizeLevel}
                            style={{ width: 120 }}
                          />
                        </div>
                        <div className='margin0-10'>
                          <span>奖品数量：</span>
                          <InputNumber
                            disabled={this.props.isReEdit}
                            onChange={(e) => { this.onPrizeNumberChange(index, e) }}
                            value={item.prizeNumber} style={{ width: 100 }} precision={0} min={0} max={99999999}
                          />
                        </div>
                        <div className='margin0-10'>
                          <span>中奖率：</span>
                          <InputNumber
                            disabled={this.props.isReEdit}
                            onChange={(e) => { this.onOddsOfWinningChange(index, e) }}
                            value={item.oddsOfWinning} style={{ width: 100 }} precision={0} min={0} max={100}
                          />
                          %
                      </div>
                        <div className='margin0-10'>
                          <span>已中奖：</span>
                          <span className='color-red font-16'>{item.wonNumber}</span>
                        </div>
                        <div className="flex-middle margin0-10">
                          <span>大转盘背景颜色：</span>
                          {
                            this.props.isReEdit ?
                              <div style={{ height: 30, width: 30, border: "1px solid #ccc", borderRadius: "3px", backgroundColor: `#${item.color}`, display: 'inline-block' }}></div>
                              :
                              <div style={{ height: 30, display: 'inline-block' }}>
                                <ColorPicker color={{ hex: `#${item.color}` }} onChange={(e) => { this.colorPickerChange(e, index) }} />
                              </div>
                          }

                        </div>

                        {
                          this.props.isReEdit ?
                            null
                            :
                            <div>
                              {
                                this.state.bigWheelProductArr.length > 1 && index > 0 ?
                                  <Icon type='up-circle' title='上移' onClick={() => { this.moveProductItem(index, 'up') }} className='margin-left calm' style={{ fontSize: 20, cursor: "pointer" }} />
                                  :
                                  <Icon type='up-circle' title='上移' className='margin-left color-gray' style={{ fontSize: 20, cursor: "not-allowed" }} />
                              }
                              {
                                this.state.bigWheelProductArr.length > 1 && (index < this.state.bigWheelProductArr.length - 1) ?
                                  <Icon type='down-circle' title='下移' onClick={() => { this.moveProductItem(index, 'down') }} className='margin-left calm' style={{ fontSize: 20, cursor: "pointer" }} />
                                  :
                                  <Icon type='down-circle' title='下移' className='margin-left color-gray' style={{ fontSize: 20, cursor: "not-allowed" }} />
                              }

                              <Popconfirm
                                placement="topLeft" title='确认要删除吗？'
                                onConfirm={() => { this.deletePreProductItem(index) }} >
                                <Icon type='delete' title='删除' className='margin-left color-red' style={{ fontSize: 20, cursor: "pointer" }} />
                              </Popconfirm>
                            </div>

                        }

                      </div>
                    </div>
                  ))
                  :
                  null
              }
              {
                this.props.isReEdit ?
                  null :
                  <div className="flex">
                    <div onClick={() => { this.addPrizeProductClicked() }}
                      className='middle-center margin-right'
                      style={{ width: "450px", border: '1px dashed #ccc', cursor: "pointer" }}>
                      <div style={{ padding: "10px 50px" }}>
                        <Icon type='plus' className='margin-right' />添加自营奖品
                    </div>
                    </div>
                    <div onClick={() => { this.addPrizeProductClicked(true) }}
                      className='middle-center'
                      style={{ width: "450px", border: '1px dashed #ccc', cursor: "pointer" }}>
                      <div style={{ padding: "10px 50px" }}>
                        <Icon type='plus' className='margin-right' />添加非自营奖品
                    </div>
                    </div>
                  </div>
              }
            </div>
          </div>
        </Spin>
        <SelectProduct
          visible={this.state.selectProductModalIsVisible}
          hide={this._hideSelectProductModal}
          onOk={this.onSelectProductConfirmClick}
        />

        <UserDefinedProductModal
          visible={this.state.uploadModalVisible}
          onCancel={this.hideUploadModal}
          onOk={this.onUserDefinedProductlOk}
        />
      </div>
    )
  }
}