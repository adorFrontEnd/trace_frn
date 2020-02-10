import React, { Component } from "react";
import { Col, Row, Checkbox, Card, Modal, Spin, Form, Button, Input, Table } from 'antd';
import Toast from '../../utils/toast';
import CommonPage from '../../components/common-page';
import { SearchForm } from '../../components/common-form';
import dateUtil from '../../utils/dateUtil';
import LocationMap from './LocationAmap';
import { getCacheOrgName } from '../../middleware/localStorage/login';
import { searchLabelList } from '../../api/dealer/label';
import { getDealerDetails, getOrganization, addDealerAndUpdate } from '../../api/dealer/dealerList';

const _description = "";

class Page extends Component {
  state = {
    id: 0,
    showDealerDetailLoading: false,
    dealerDetail: null,
    shipStatus: false,
    storeStatus: false,
    location: null,
    locationModalVisible: false,
    labelList: null,
    labelListMap: null,
    labelLoading: false,
    hasCheckedLableIds: null,
    hasCheckedLableNames: null
  }

  componentWillMount() {
    let id = this.props.match.params.id;
    let isEdit = !!id;
    this.setState({
      id,
      _title: isEdit ? "经销商编辑" : "经销商添加",
      showDealerDetailLoading: false
    })
    this.getDealerDetail(id);
    this._getOrganization(id);

  }

  revertAuth = (shipStatus, storeStatus) => {
    shipStatus = shipStatus == '0';
    storeStatus = storeStatus == '0';

    let auth = [];
    if (storeStatus) {
      auth.push('storeStatus')
    }

    if (shipStatus) {
      auth.push('shipStatus')
    }

    this.setState({
      shipStatus, storeStatus, auth
    })
  }

  getDealerDetail = (id) => {
    id = id || this.state.id;
    if (!id || id == 0) {
      return;
    }

    this._showDealerDetailLoading();
    getDealerDetails({ id })
      .then(dealerDetail => {

        let { dealerName, name, phone, tencentLng, tencentLat, address, shipStatus, storeStatus } = dealerDetail;
        let location = { address, tencentLng, tencentLat };
        this.setState({
          dealerDetail,
          location
        })
        this.revertAuth(shipStatus, storeStatus);
        this.props.form.setFieldsValue({
          dealerName,
          name,
          phone
        });
        this._hideDealerDetailLoading();

      })
      .catch(() => {
        this._hideDealerDetailLoading();
      })
  }

  _showDealerDetailLoading = () => {
    this.setState({
      showDealerDetailLoading: true
    })
  }

  _hideDealerDetailLoading = () => {
    this.setState({
      showDealerDetailLoading: false
    })
  }

  _getOrganization = (id) => {
    if (!id || id == 0) {
      let organizationName = getCacheOrgName();
      this.setState({
        organizationName
      })
      return
    }

    getOrganization({ id }).then(res => {
      this.setState({
        organizationName: res.organizationName
      })
    }).catch(() => {

    })
  }

  // 返回
  dealerEditBack = () => {
    window.history.back();
  }

  saveDataClicked = () => {
    this.props.form.validateFields((err, params) => {
      if (err) {
        return;
      }
      params.id = this.state.id;
      if (params.id == 0) {
        if (!params.password) {
          Toast("密码必填!", "");
          return;
        }
      }
      let auth = this.state.auth;
      if (!auth || !auth.length) {
        Toast("请至少选择一种权限！");
        return;
      }

      let authObj = this.getAuthStatus(this.state.auth);
      let { storeStatus } = authObj;
      let station = this.state.location;
      if (storeStatus == '1') {
        station = null;
      }
      let id = !this.state.id || this.state.id == '0' ? null : this.state.id;
      let { labelId } = this.state.dealerDetail || {};

      addDealerAndUpdate({ ...params, ...authObj, ...station, id, labelId })
        .then(res => {
          if (res.status == "SUCCEED") {
            Toast(`${id ? "保存" : "添加"}成功!`, "success");
            this.dealerEditBack();
          }
        })
    })
  }

  getAuthStatus = (auth) => {
    if (!auth || !auth.length) {
      // 无权限为1，有权限为0
      return {
        shipStatus: "1",
        storeStatus: "1"
      }
    }

    let str = auth.join();
    let shipStatus = '1';
    let storeStatus = '1';
    if (str.indexOf('shipStatus') != -1) {
      shipStatus = '0';
    }

    if (str.indexOf('storeStatus') != -1) {
      storeStatus = '0';
    }

    return {
      shipStatus,
      storeStatus
    }
  }


  onStatusChange = (e, type) => {
    if (type == 'shipStatus') {
      let storeStatus = this.state.storeStatus;
      let shipStatus = e.target.checked;
      let auth = [];
      if (storeStatus) {
        auth.push('storeStatus')
      }

      if (shipStatus) {
        auth.push('shipStatus')
      }

      this.setState({
        shipStatus, auth
      })
      console.log(auth)
    }

    if (type == 'storeStatus') {
      let shipStatus = this.state.shipStatus;
      let storeStatus = e.target.checked;
      let auth = [];

      if (storeStatus) {
        auth.push('storeStatus')
      }

      if (shipStatus) {
        auth.push('shipStatus')
      }

      this.setState({
        storeStatus, auth
      })

    }
  }


  selectShopLocationClicked = () => {
    this.showLocationModal()
  }

  showLocationModal = () => {
    this.setState({
      locationModalVisible: true
    })
  }

  _hideLocationModal = () => {
    this.setState({
      locationModalVisible: false
    })
  }

  updateStationPosition = (params) => {

    let id = this.state.id;
    let { tencentLng, tencentLat, address } = params;
    let location = { tencentLng, tencentLat, address };

    this.setState({
      location
    });

    if (!id || id == '0') {
      this._hideLocationModal();
      return;
    }

    let { phone } = this.state.dealerDetail;

    if (id && id != '0' && phone) {
      addDealerAndUpdate({ ...location, id, phone })
        .then(() => {
          Toast('保存地址成功！');
          this._hideLocationModal();
          this.getDealerDetail();
        })
    }
  }




  /****标签编辑************************************************************************************************ */

  editDealerLabelClick = () => {
    this._showLabelModal();
  }

  // 保存选择的标签
  saveLabelClicked = () => {
    let labelId = this.state.hasCheckedLableIds;
    let labelNames = this.state.hasCheckedLableNames;
    let id = this.state.id;
    let params = { labelId, labelNames };
    this.updateLabelId(params)
  }

  updateLabelId = (params) => {

    let id = this.state.id;
    let { labelId, labelNames } = params;
    let { phone } = this.state.dealerDetail || {};
    if (!id || id == '0' || !phone) {
      let dealerDetail = { ...this.state.dealerDetail, labelId, labelNames };
      this.setState({
        dealerDetail
      })
      this._hideLabelModal();
      return;
    }

    addDealerAndUpdate({ id, labelId, phone })
      .then(() => {
        Toast('保存标签成功！');
        this._hideLabelModal();
        this.getDealerDetail();
      })

  }

  _hideLabelModal = () => {
    this.setState({
      labelModalVisible: false
    })
  }

  _showLabelModal = () => {
    this.setState({
      labelModalVisible: true
    })
    this.getLabelList();
  }

  getLabelList = (params) => {

    if (this.state.labelList && !params) {
      return;
    }

    this._showLabelLoading();
    searchLabelList(params)
      .then(res => {
        let { data } = res;
        let labelList = data;
        let labelListMap = this.getLabelListMap(labelList);

        this.setState({
          labelList
        })

        if (!this.state.labelListMap) {
          this.setState({
            labelListMap
          })
        }

        this._hideLabelLoading();
      })
      .catch(() => { this._hideLabelLoading() })
  }

  getLabelListMap = (labelList) => {

    let labelListMap = {};

    if (!labelList || !labelList.length) {
      return labelListMap;
    }

    labelList.forEach(item => {
      let id = item.id;
      if (!labelListMap[id]) {
        labelListMap[id] = item.name
      }
    })
    return labelListMap
  }

  _showLabelLoading = () => {
    this.setState({
      labelLoading: true
    })
  }

  _hideLabelLoading = () => {
    this.setState({
      labelLoading: false
    })
  }

  onCheckedGroupChange = (hasCheckedLableIds) => {

    let hasCheckedLableNames = this.getHasCheckedText(hasCheckedLableIds);

    this.setState({
      hasCheckedLableIds,
      hasCheckedLableNames
    })
  }

  getHasCheckedText = (hasCheckedLableIds) => {

    if (!hasCheckedLableIds || !hasCheckedLableIds.length) {
      return;
    }

    let labelListMap = this.state.labelListMap;
    let result = hasCheckedLableIds.map(id => labelListMap[id]).filter(item => !!item);
    return result;
  }


  filterInputOnChange = (e) => {
    let filterKeyword = e.currentTarget.value;
    this.setState({
      filterKeyword
    })
  }

  filterLabelClicked = () => {
    let inputData = this.state.filterKeyword;
    if (!inputData || !inputData.length) {
      return;
    }
    this.getLabelList({ inputData });
  }

  filterLabelClearClicked = () => {
    this.setState({
      filterKeyword: ""
    })
    this.getLabelList({ inputData: null });
  }

  clearCheckedLabels = () => {
    this.setState({
      hasCheckedLableIds: null,
      hasCheckedLableNames: null
    })
  }

  /***渲染*************************************************************************************************** */

  render() {
    const { getFieldDecorator } = this.props.form;
    let { labelList } = this.state;

    return (
      <CommonPage title={this.state._title} description={_description} >
        <div style={{ width: 600 }}>

          <Row className='line-height40 padding10-0'>
            <Col offset={8}>
              <Button type='primary' style={{ width: 100 }} onClick={this.saveDataClicked}>保存</Button>
              <Button type='primary' className='yellow-btn margin-left' style={{ width: 100 }} onClick={this.dealerEditBack}>返回</Button>
            </Col>
          </Row>

          <Form className='common-form'>
            <Form.Item
              labelCol={{ span: 8 }}
              wrapperCol={{ span: 16 }}
              label='经销商名称'
              field='dealerName'>
              {
                getFieldDecorator('dealerName', {
                  rules: [
                    { required: true, message: '请输入经销商名称!' }
                  ]
                })(
                  <Input minLength={0} maxLength={20} />
                )
              }
            </Form.Item>
            <Form.Item
              labelCol={{ span: 8 }}
              wrapperCol={{ span: 16 }}
              label='联系人'
              field='name'>
              {
                getFieldDecorator('name', {
                  rules: [
                    { required: true, message: '请输入联系人!' }
                  ]
                })(
                  <Input minLength={0} maxLength={5} />
                )
              }
            </Form.Item>
            <Form.Item
              labelCol={{ span: 8 }}
              wrapperCol={{ span: 16 }}
              label='手机号'
              field='phone'>
              {
                getFieldDecorator('phone', {
                  rules: [
                    { required: true, message: '请输入手机号!' }
                  ]
                })(
                  <Input minLength={0} maxLength={11} />
                )
              }
            </Form.Item>
            <Form.Item
              labelCol={{ span: 8 }}
              wrapperCol={{ span: 16 }}
              label='密码'
              field='password'>
              {
                getFieldDecorator('password', {
                  rules: [
                    { required: false, message: '请输入密码!' }
                  ]
                })(
                  <Input />
                )
              }
            </Form.Item>
            <Row className='line-height40'>
              <Col span={8} className='label text-right'> 所属公司架构：</Col>
              <Col>{this.state.organizationName}</Col>
            </Row>
            <Row className='line-height40'>
              <Col span={8} className='label text-right'> 标签：</Col>
              <Col span={16}>
                <div> <Button type='primary' onClick={this.editDealerLabelClick}>点击编辑标签</Button></div>
                <div>
                  {this.state.dealerDetail && this.state.dealerDetail.labelNames && this.state.dealerDetail.labelNames.join("、") || "暂无标签"}
                </div>
              </Col>
            </Row>

            <Form.Item
              labelCol={{ span: 8 }}
              wrapperCol={{ span: 16 }}
              label='权限'
              field='auth'>

              <Checkbox.Group value={this.state.auth}>
                <Checkbox value="shipStatus" onChange={(e) => { this.onStatusChange(e, "shipStatus") }}>发货权限</Checkbox>
                <Checkbox value="storeStatus" onChange={(e) => { this.onStatusChange(e, "storeStatus") }}>门店权限</Checkbox>
              </Checkbox.Group>
            </Form.Item>
            {
              this.state.storeStatus ?
                <div>
                  <Row className='line-height40'>
                    <Col offset={8}><Button type='primary' style={{ width: 120 }} onClick={this.selectShopLocationClicked}>选择门店位置</Button></Col>
                  </Row>
                  {
                    this.state.location ?
                      <Row className='line-height40'>
                        <Col offset={8} className='line-height20'>{this.state.location.address}</Col>
                      </Row>
                      : null
                  }

                </div>
                : null
            }

          </Form>
        </div>

        <Modal maskClosable={false}
          title="站点定位"
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


        <Modal maskClosable={false}
          title="标签选择"
          visible={this.state.labelModalVisible}
          onOk={this.saveLabelClicked}
          onCancel={this._hideLabelModal}
          width={720}
        >
          <Spin spinning={this.state.labelLoading}>
            <div className='flex-between'>
              <div>
                <div className='padding' style={{ border: "1px solid #ccc", width: 350, borderRadius: "4px" }}>
                  <Input style={{ width: 200 }} value={this.state.filterKeyword} placeholder='输入标签名称' onChange={this.filterInputOnChange} />
                  <Button icon='filter' type='primary' onClick={this.filterLabelClicked} disabled={!this.state.filterKeyword}>筛选</Button>
                  <a className='margin-left' onClick={this.filterLabelClearClicked} >清除</a>
                </div>
                <div style={{ width: 350, borderRadius: "0 0 4px 4px", border: "1px solid #ccc", paddingLeft: "10px", maxHeight: "58vh", overflowY: "auto", marginTop: "-1px" }}>
                  {
                    labelList && labelList.length ?
                      <Checkbox.Group value={this.state.hasCheckedLableIds} onChange={this.onCheckedGroupChange}>
                        <Row >
                          {
                            labelList.map(item =>
                              <Col span={24} key={item.id} style={{ borderBottom: "1px solid #f2f2f2" }}>
                                <Checkbox value={item.id}>
                                  <span style={{ lineHeight: "30px", padding: "5px 10px" }}>
                                    {item.name}
                                  </span>
                                </Checkbox>
                              </Col>
                            )
                          }
                        </Row>
                      </Checkbox.Group>
                      : null
                  }
                </div>
              </div>
              <div style={{ width: 300 }}>
                <div className='line-height30 font-bold margin-bottom flex-between'>
                  <span>
                    已选标签：
                  </span>
                  {
                    this.state.hasCheckedLableIds && this.state.hasCheckedLableIds.length ?
                      <Button onClick={this.clearCheckedLabels} type='primary'>清除全部标签</Button>
                      : null
                  }
                </div>
                <div>
                  {this.state.hasCheckedLableNames && this.state.hasCheckedLableNames.length && this.state.hasCheckedLableNames.join("、") || "暂无标签"}
                </div>
              </div>
            </div>
          </Spin>

        </Modal>

      </CommonPage >)
  }
}

export default Form.create()(Page);