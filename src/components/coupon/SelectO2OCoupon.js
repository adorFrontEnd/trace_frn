import React, { Component } from "react";
import { Table, Form, Input, Select, Col, Row, Icon, Spin, Button, Divider, Tabs, Popconfirm, Radio, Modal, Checkbox, InputNumber } from "antd";
import { pagination } from '../../utils/pagination';
import Toast from '../../utils/toast';
import { SearchForm } from '../common-form';
import { searchBusinessEventVoucherList } from '../../api/activityCoupon/activityCoupon';

export default class Page extends Component {

  state = {
    tableDataList: null,
    showTableLoading: false,
    selectedRowKeys: [],
    scope: null
  }

  params = {
    page: 1
  }

  componentDidMount() {
    this.getPageData();
  }

  componentWillReceiveProps(props) {
    if (!props.visible && this.props.visible) {
      this.clearSelection();
    }
  }

  // 获取页面列表
  getPageData = () => {
    let _this = this;
    this._showTableLoading();
    searchBusinessEventVoucherList(this.params).then(res => {
      this._hideTableLoading();
      let _pagination = pagination(res, (current) => {
        this.params.page = current
        _this.getPageData();
      }, (cur, pageSize) => {
        this.params.page = 1;
        this.params.size = pageSize
        _this.getPageData();
      })

      this.setState({
        tableDataList: res.data,
        pagination: _pagination
      })
    }).catch(() => {
      this._hideTableLoading();
    })
  }

  productInputDataChange = (e) => {
    let inputData = e.currentTarget.value;
    this.params = {
      ...this.params,
      inputData
    }
  }

  // 表格相关列
  columns = [
    { title: "活动券名称", dataIndex: "name" },
    { title: "活动券编号", dataIndex: "number" },
    { title: "活动券价格", dataIndex: "price" },
    { title: "活动券图", dataIndex: "mainImage", render: data => <span><img style={{ height: 30, width: 30 }} src={data} /></span> },
  ]

  _showTableLoading = () => {
    this.setState({
      showTableLoading: true
    })
  }

  _hideTableLoading = () => {
    this.setState({
      showTableLoading: false
    })
  }

  onOk = () => {

    let scope = this.state.scope;
    let selectedRowKeys = this.state.selectedRowKeys;
    if (!selectedRowKeys || !selectedRowKeys.length) {
      Toast("请选择商品！");
      return;
    }

    if (!scope) {
      Toast("请配置发现范围的距离！");
      return;
    }

    let selectedRows = this.state.selectedRows;
    let submitData = selectedRows.map(item => {
      let { mainImage, id } = item;
      return {
        ...item,
        scope,
        image:mainImage,
        voucherId:id        
      }
    })
    this.props.onOk(submitData, selectedRowKeys,scope);
  }

  // 顶部查询表单
  formItemList = [

    {
      type: "INPUT_NUMBER_RANGE",
      field: "startPrice",
      fieldStop: "endPrice",

      placeholder: "最低价格",
      placeholderStop: "最高价格",
      props: {
        precision: 2,
        min: 0
      }
    },
    {
      type: "INPUT",
      field: "inputData",
      style: { width: 240 },
      placeholder: "券名称/编号"
    }]


  //查询按钮点击事件
  searchClicked = (params) => {


    let { inputData } = params;
    inputData = inputData || null;
    this.params = {
      page: 1,
      ...params,
      inputData
    }

    this.getPageData();
  }

  onRowChange = (selectedRowKeys, selectedRows) => {


    this.setState({
      selectedRowKeys,
      selectedRows
    })
  }

  clearSelection = () => {
    this.setState({
      selectedRowKeys: null,
      selectedRows: null
    })
  }

  onscopeChange = (scope) => {
    this.setState({
      scope
    })
  }

  resetClicked = () => {
    this.setState({
      scope: null
    })
  }

  render() {

    return (
      <Modal maskClosable={false}
        zIndex={1004}
        className='noPadding'
        title='选择O2O券'
        visible={this.props.visible}
        onCancel={this.props.hide}
        width={900}
        onOk={this.onOk}
      >
        <div className='padding'>
          <Row className='line-height40 margin-top margin-bottom'>
            <Col span={4} className='text-right'>
              <span className='label-color label-required'>配置发现范围：</span>
            </Col>
            <Col span={19} >
              <InputNumber precision={2} value={this.state.scope} min={0} onChange={this.onscopeChange} />公里范围内
            </Col>
          </Row>
          <div className='flex-between padding align-center' >
            <Button className='margin-left' type='primary' onClick={this.clearSelection}>清除选择</Button>
            <div style={{ textAlign: "right", width: 780 }}>
              <SearchForm
                towRow={false}
                searchClicked={this.searchClicked}
                formItemList={this.formItemList}
                resetClicked={this.resetClicked}
              />
            </div>
          </div>

          <Table
            rowSelection={{
              onChange: this.onRowChange,
              selectedRowKeys: this.state.selectedRowKeys,
              type: this.props.isSingleSelection ? "radio" : "checkbox"
            }}
            indentSize={10}
            rowKey="id"
            columns={this.columns}
            loading={this.state.showTableLoading}
            pagination={this.state.pagination}
            dataSource={this.state.tableDataList}
          />
        </div>
      </Modal>
    )
  }
}