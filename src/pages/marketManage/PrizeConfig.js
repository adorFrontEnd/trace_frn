import React, { Component } from "react";
import CommonPage from '../../components/common-page';
import { Table, Form, Input, Select, Col, Row, Spin, Icon, Button, Divider, Popconfirm, Radio, Modal, Checkbox, InputNumber, Upload } from "antd";
import { pagination } from '../../utils/pagination';
import Toast from '../../utils/toast';
import { SearchForm, SubmitForm } from '../../components/common-form';
import dateUtil from '../../utils/dateUtil';
import { selectByActivityId, saveOrUpdatePrize, saveTurntablePrizeConfig, selectTurntableByActivityId } from '../../api/activity/activity';
import { NavLink, Link } from 'react-router-dom';
import { baseRoute, routerConfig } from '../../config/router.config';
import { connect } from 'react-redux';
import { changeRoute } from '../../store/actions/route-actions';
import { parseUrl } from '../../utils/urlUtils';
import SelectProduct from '../../components/selectProduct/SelectProduct';
import BigWheelConfig from './BigWheelConfig';
import { isAddProductIdIndexOfProductList, getAddProductArr, formatProductArr } from './prizeConfigUtil';

const _description = "";
const titleEnum = {
  "0": "奖品配置（满赠活动）",
  "1": "奖品配置（积分）",
  "2": "奖品配置（大转盘）"
}

class DealerList extends Component {

  state = {
    tableDataList: null,
    showPageLoading: false,
    excProductList: null,
    preProductList: null,
    type: 0,
    _title: "奖品配置",
    selectProductModalIsVisible: false,
    activityDetail: null,
    isReEdit: false,
    integralType: 0,
    winningPoints1: 0,
    winningPoints2: 0,
    convertedQuantity: null,
    turntableLoading:false
  }

 

  componentDidMount() {
    let urlParams = parseUrl(this.props.location.search);
    if (urlParams && urlParams.args && urlParams.args.type) {
      let type = urlParams.args.type;
      let _title = titleEnum[type];
      this.setState({
        type,
        _title
      })
      this.props.changeRoute({ path: 'marketManage.prizeConfig', title: _title, parentTitle: '营销工具' });
      let activityId = this.props.match.params.id;
      this.setState({
        activityId
      })
      this.getPageData(activityId, type);
    }
  }


  params = {
    page: 1
  }
  /************************************************************************************************************************** */

  // 获取页面列表
  getPageData = (activityId, type) => {
    let _this = this;
    activityId = activityId || this.state.activityId;
    type = type || this.state.type;
    this._showPageLoading();
    let fn = type == '2' ? selectTurntableByActivityId : selectByActivityId;
    fn({ activityId })
      .then(activityDetail => {
        this.revertPageData(activityDetail, type);
        this._hidePageLoading();
      })
      .catch(() => {
        this._hidePageLoading();
      })
  }

  _showPageLoading = () => {
    this.setState({
      showPageLoading: true
    })
  }

  _hidePageLoading = () => {
    this.setState({
      showPageLoading: false
    })
  }

  revertPageData = (activityDetail, type) => {
    if (type == 0) {
      this.revertType0_Data(activityDetail);
    } else if (type == 1) {
      this.revertType1_Data(activityDetail);
    } else {
      this.revertType2_Data(activityDetail);
    }
  }

  revertType0_Data = (activityDetail) => {
    let excProductList = null;
    let preProductList = null;
    let isReEdit = false;
    if (activityDetail) {
      let { excProductDtoList, preProductDtoList } = activityDetail;
      excProductList = excProductDtoList;
      preProductList = preProductDtoList;
      isReEdit = true
    }
    this.setState({
      activityDetail,
      excProductList,
      preProductList,
      isReEdit
    })
  }

  revertType1_Data = (activityDetail) => {

    let preProductList = null;
    let isReEdit = false;
    let prizePoolQuantity = null;
    let integralType = 0;
    let winningPoints1 = null;
    let winningPoints2 = null;
    let convertedQuantity = null;
    if (activityDetail) {
      let { excProductDtoList, preProductDtoList, winningPoints } = activityDetail;
      prizePoolQuantity = activityDetail.prizePoolQuantity;
      integralType = activityDetail.integralType;
      convertedQuantity = activityDetail.convertedQuantity;
      let wpArr = winningPoints.split(',');
      winningPoints1 = wpArr[0];
      winningPoints2 = wpArr[1];
      preProductList = preProductDtoList;
      isReEdit = true;
    }

    this.setState({
      prizePoolQuantity,
      activityDetail,
      preProductList,
      integralType,
      winningPoints1,
      winningPoints2,
      isReEdit,
      convertedQuantity
    })
  }

  revertType2_Data = (activityDetail) => {


    let isReEdit = !!activityDetail;

    this.setState({
      activityDetail,
      isReEdit
    })
  }
  /************************************************************************************************************************** */


  addPrizeProductClicked = (isAddExcProduct) => {
    this.setState({
      selectProductModalIsVisible: true,
      isAddExcProduct: !!isAddExcProduct
    })
  }

  _hideSelectProductModal = () => {
    this.setState({
      selectProductModalIsVisible: false
    })
  }

  onSelectProductConfirmClick = (selectRows, selectedRowKeys) => {

    let isAddExcProduct = this.state.isAddExcProduct;
    let excProductList = this.state.excProductList || null;
    let preProductList = this.state.preProductList || null;

    let isIndexOf = isAddProductIdIndexOfProductList(selectedRowKeys, isAddExcProduct ? excProductList : preProductList);
    if (isIndexOf) {
      Toast("添加失败，商品重复添加！");
      return;
    }
    this._hideSelectProductModal();
    let addProduct = getAddProductArr(selectRows);
    if (isAddExcProduct) {
      let newExcArr = excProductList ? [...excProductList, ...addProduct] : addProduct;
      this.setState({
        excProductList: newExcArr
      })
    } else {

      let newPreArr = preProductList ? [...preProductList, ...addProduct] : addProduct;
      this.setState({
        preProductList: newPreArr
      })
    }
  }

  onExcQuantityChange = (index, e) => {
    let excProductList = this.state.excProductList;
    let quantity = e;
    excProductList[index]['quantity'] = quantity;
    this.setState({
      excProductList
    })
  }

  onPreQuantityChange = (index, e) => {
    let preProductList = this.state.preProductList;
    let quantity = e;
    preProductList[index]['quantity'] = quantity;
    this.setState({
      preProductList
    })
  }

  // 返回
  goEditBack = () => {
    window.history.back();
  }

  saveType0_DataClicked = () => {
    let excProductList = this.state.excProductList;
    let preProductList = this.state.preProductList;
    if (!excProductList || !excProductList.length) {
      Toast("兑换商品数据为空！");
      return;
    }

    if (!preProductList || !preProductList.length) {
      Toast("前置商品数据为空！");
      return;
    }
    let activityId = this.state.activityId;
    let activityDetail = this.state.activityDetail;
    let id = activityDetail && activityDetail.id ? activityDetail.id : null;
    excProductList = formatProductArr(excProductList);
    preProductList = formatProductArr(preProductList);

    saveOrUpdatePrize({ id, type: 0, activityId, excProductList: JSON.stringify(excProductList), preProductList: JSON.stringify(preProductList) })
      .then(() => {
        Toast('保存成功！')
        this.getPageData();
      })
  }

  deleteExcProductItem = (index) => {
    let excProductList = this.state.excProductList;
    excProductList.splice(index, 1);
    this.setState({
      excProductList
    })
  }

  deletePreProductItem = (index) => {
    let preProductList = this.state.preProductList;
    preProductList.splice(index, 1);
    this.setState({
      preProductList
    })
  }

  /*积分活动****************************************************************************************************************************** */

  onIntegralTypeChange = (e) => {
    this.setState({
      integralType: e.target.value,
    });
  }

  onWinningPointsChange = (type, e) => {
    if (type == 1) {
      this.setState({
        winningPoints1: e
      })
    }

    if (type == 2) {
      this.setState({
        winningPoints2: e
      })
    }
  }

  saveType1_DataClicked = () => {

    let { preProductList, activityDetail, activityId, winningPoints1, winningPoints2, integralType, prizePoolQuantity } = this.state;
    let winningPoints = null;

    if (!prizePoolQuantity || prizePoolQuantity == 0) {
      Toast("请设置奖池数量");
      return;
    }


    if (integralType == 0) {
      if (!winningPoints1 || winningPoints1 == 0) {
        Toast("请设置固定积分中奖数量！");
        return;
      }
      winningPoints = winningPoints1;
    }

    if (integralType == 1) {
      if (!winningPoints2 || winningPoints2 == 0) {
        Toast("请设置随机积分中奖上限！");
        return;
      }

      if (winningPoints2 <= winningPoints1) {
        Toast("随机积分中奖上限必须大于下限！");
        return;
      }
      winningPoints = winningPoints1 + "," + winningPoints2;
    }

    if (!preProductList || !preProductList.length) {
      Toast("前置商品数据为空！");
      return;
    }


    let id = activityDetail && activityDetail.id ? activityDetail.id : null;
    preProductList = formatProductArr(preProductList);

    saveOrUpdatePrize({ id, type: 1, activityId, integralType, winningPoints, prizePoolQuantity, preProductList: JSON.stringify(preProductList) })
      .then(() => {
        Toast('保存成功！')
        this.getPageData();
      })
  }

  onPrizePoolQuantityChange = (prizePoolQuantity) => {
    this.setState({
      prizePoolQuantity
    })
  }

  /**大转盘*****************************************************************************************************************************/
  saveType2_DataClicked = (params) => {
    params.activityId = this.state.activityId;
    this.setState({
      turntableLoading:true
    })
    saveTurntablePrizeConfig(params)
      .then(() => {
        this.setState({
          turntableLoading:false
        })
        Toast("保存成功！");
        this.goEditBack();
      })
      .catch(()=>{
        this.setState({
          turntableLoading:false
        })
      })
  }

  /**渲染**********************************************************************************************************************************/

  render() {
    const { getFieldDecorator } = this.props.form;

    return (
      <CommonPage title={this.state._title} description={_description} >
        <Spin spinning={this.state.showPageLoading}>
          {
            this.state.type == '0' ?
              <div>
                <Row className='line-height40 padding10-0'>
                  <Col offset={1}>
                    <Button type='primary' style={{ width: 100 }} onClick={this.saveType0_DataClicked}>保存</Button>
                    <Button type='primary' className='yellow-btn margin-left20' style={{ width: 100 }} onClick={this.goEditBack}>返回</Button>
                  </Col>
                </Row>
                <div>
                  {
                    this.state.excProductList && this.state.excProductList.length ?
                      this.state.excProductList.map((item, index) => (
                        <div key={item.id} className='margin-bottom'>
                          <div className='flex padding align-center'>
                            <img src={item.image} style={{ height: 40, width: 40 }} />
                            <div className='margin0-10'>
                              <div style={{ width: 260 }} className='ellipsis'>商品名称：{item.name}</div>
                              <div style={{ width: 260 }} className='ellipsis'>商品条码：{item.barCode}</div>
                            </div>
                            <InputNumber onChange={(e) => { this.onExcQuantityChange(index, e) }} value={item.quantity} style={{ width: 120 }} precision={0} min={1} max={99999999} />

                            {
                              this.state.isReEdit ?
                                <div className='margin-left'>该奖品已核销数量：{item.convertedQuantity}</div>
                                :
                                <Popconfirm
                                  placement="topLeft" title='确认要删除吗？'
                                  onConfirm={() => { this.deleteExcProductItem(index) }} >
                                  <Icon type='delete' className='margin-left' style={{ fontSize: 20 }} />
                                </Popconfirm>
                            }

                          </div>
                        </div>
                      ))
                      : null
                  }
                  {
                    this.state.isReEdit ?
                      null :
                      <div onClick={() => { this.addPrizeProductClicked(true) }}
                        className='middle-center'
                        style={{ width: "450px", border: '1px dashed #ccc', cursor: "pointer" }}>
                        <div style={{ padding: "10px 50px" }}>
                          <Icon type='plus' className='margin-right' />添加兑换商品
                        </div>
                      </div>
                  }

                </div>
                <div className='margin20-0'>前置扫码条件（保存后无法修改）</div>
                <div>
                  {
                    this.state.preProductList && this.state.preProductList.length ?
                      this.state.preProductList.map((item, index) => (
                        <div key={item.id} className='margin-bottom'>
                          <div className='flex padding align-center'>
                            <img src={item.image} style={{ height: 40, width: 40 }} />
                            <div className='margin0-10'>
                              <div style={{ width: 260 }} className='ellipsis'>商品名称：{item.name}</div>
                              <div style={{ width: 260 }} className='ellipsis'>商品条码：{item.barCode}</div>
                            </div>
                            <InputNumber
                              onChange={(e) => { this.onPreQuantityChange(index, e) }}
                              value={item.quantity}
                              style={{ width: 120 }}
                              precision={0} min={1} max={99999999}
                              disabled={this.state.isReEdit}
                            />

                            {
                              this.state.isReEdit ?
                                null
                                :
                                <Popconfirm
                                  placement="topLeft" title='确认要删除吗？'
                                  onConfirm={() => { this.deletePreProductItem(index) }} >
                                  <Icon type='delete' className='margin-left' style={{ fontSize: 20 }} />
                                </Popconfirm>
                            }

                          </div>
                        </div>
                      ))
                      : null
                  }

                  {
                    this.state.isReEdit ?
                      null :
                      <div onClick={() => { this.addPrizeProductClicked() }}
                        className='middle-center'
                        style={{ width: "450px", border: '1px dashed #ccc', cursor: "pointer" }}>
                        <div style={{ padding: "10px 50px" }}>
                          <Icon type='plus' className='margin-right' />添加前置条件商品
                      </div>
                      </div>
                  }

                </div>
              </div>
              :
              null
          }
          {
            this.state.type == '1' ?
              //积分
              <div style={{ width: 600 }}>
                <Row className='line-height40 padding10-0'>
                  <Col offset={1}>
                    <Button type='primary' style={{ width: 100 }} onClick={this.saveType1_DataClicked}>保存</Button>
                    <Button type='primary' className='yellow-btn margin-left20' style={{ width: 100 }} onClick={this.goEditBack}>返回</Button>
                  </Col>
                </Row>
                <div>
                  <Row className='line-height40'>
                    <Col span={6} className='text-right'>
                      <span className='label-color label-required'>活动奖池：</span>
                    </Col>
                    <Col span={18}>
                      <InputNumber
                        value={this.state.prizePoolQuantity}
                        onChange={(e) => { this.onPrizePoolQuantityChange(e) }}
                        style={{ width: 160 }} disabled={this.state.isEdit} min={0} max={99999999} placeholder='请填写活动奖池数量'
                      />
                      {
                        this.state.isReEdit ?
                          <span className='margin-left'>该奖池已使用数： {this.state.convertedQuantity || 0}</span>
                          :
                          null
                      }
                    </Col>
                  </Row>
                  <Row className='line-height40'>
                    <Col span={6} className='text-right'>
                      <span className='label-color label-required'>积分类型：</span>
                    </Col>
                    <Col span={18}>
                      <Radio.Group disabled={this.state.isReEdit} onChange={this.onIntegralTypeChange} value={this.state.integralType}>
                        <Radio value={0}>固定积分</Radio>
                        <Radio value={1}>随机积分</Radio>
                      </Radio.Group>
                    </Col>
                  </Row>

                  <Row className='line-height40'>
                    <Col span={6} className='text-right'>
                      <span className='label-color label-required'>中奖积分：</span>
                    </Col>
                    <Col span={18}>
                      <InputNumber
                        disabled={this.state.isReEdit}
                        value={this.state.winningPoints1}
                        onChange={(e) => { this.onWinningPointsChange(1, e) }}
                        style={{ width: 160 }}
                        min={0} max={99999999}
                      />
                      {
                        this.state.integralType == '1' ?
                          <span>
                            <span className='margin0-10'>~</span>
                            <InputNumber
                              disabled={this.state.isReEdit}
                              value={this.state.winningPoints2}
                              onChange={(e) => { this.onWinningPointsChange(2, e) }}
                              style={{ width: 160 }}
                              min={0} max={9999999}
                            />
                          </span>
                          : null
                      }
                    </Col>
                  </Row>
                  <div className='margin20-0'>前置扫码条件（保存后无法修改）</div>
                  <div>
                    {
                      this.state.preProductList && this.state.preProductList.length ?
                        this.state.preProductList.map((item, index) => (
                          <div key={item.id} className='margin-bottom'>
                            <div className='flex padding align-center'>
                              <img src={item.image} style={{ height: 40, width: 40 }} />
                              <div className='margin0-10'>
                                <div style={{ width: 260 }} className='ellipsis'>商品名称：{item.name}</div>
                                <div style={{ width: 260 }} className='ellipsis'>商品条码：{item.barCode}</div>
                              </div>
                              <InputNumber
                                disabled={this.state.isReEdit}
                                onChange={(e) => { this.onPreQuantityChange(index, e) }}
                                value={item.quantity} style={{ width: 120 }} precision={0} min={1} max={99999999}
                              />

                              {
                                this.state.isReEdit ?
                                  null
                                  :
                                  <Popconfirm
                                    placement="topLeft" title='确认要删除吗？'
                                    onConfirm={() => { this.deletePreProductItem(index) }} >
                                    <Icon type='delete' className='margin-left' style={{ fontSize: 20 }} />
                                  </Popconfirm>
                              }

                            </div>
                          </div>
                        ))
                        : null
                    }

                    {
                      this.state.isReEdit ?
                        null :
                        <div onClick={() => { this.addPrizeProductClicked() }}
                          className='middle-center'
                          style={{ width: "450px", border: '1px dashed #ccc', cursor: "pointer" }}>
                          <div style={{ padding: "10px 50px" }}>
                            <Icon type='plus' className='margin-right' />添加前置条件商品
                          </div>
                        </div>
                    }

                  </div>
                </div>
              </div>
              : null
          }


          {
            this.state.type == '2' ?
              //大转盘
              
              <BigWheelConfig
                spinning ={this.state.turntableLoading}
                isReEdit={this.state.isReEdit}
                configDetail={this.state.activityDetail}
                saveClicked={this.saveType2_DataClicked}
                goEditBack={this.goEditBack}
                saveConfirm={this.bigWheelConfim}
                activityId={this.state.activityId}
              />

              : null
          }


          <SelectProduct
            visible={this.state.selectProductModalIsVisible}
            hide={this._hideSelectProductModal}
            onOk={this.onSelectProductConfirmClick}

          />
        </Spin>
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
export default connect(mapStateToProps, mapDispatchToProps)(Form.create()(DealerList));