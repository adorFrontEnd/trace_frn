import React, { Component } from "react";
import { searchProductList } from '../../api/codeManage/productCode';
import { Table, Form, Input, Select, Col, Row, Icon, Spin, Button, Divider, Tabs, Popconfirm, Radio, Modal, Checkbox, InputNumber } from "antd";
import { pagination } from '../../utils/pagination';
import Toast from '../../utils/toast';
import { SearchForm, SubmitForm } from '../../components/common-form';

export default class Page extends Component {

  state = {
    tableDataList: null,
    showTableLoading: false,
    selectedRowKeys: []
  }

  params = {
    page:1
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
    searchProductList(this.params).then(res => {
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
    { title: "商品名称", dataIndex: "name" },
    { title: "商品编码", dataIndex: "number" },
    { title: "商品条码", dataIndex: "barCode" },
    { title: "商品图", dataIndex: "image", render: data => <span><img style={{ height: 20, width: 20 }} src={data} /></span> },
    { title: "商品规格", dataIndex: "specification" }
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
    let selectedRowKeys = this.state.selectedRowKeys;
    if (!selectedRowKeys || !selectedRowKeys.length) {
      Toast("请选择商品！");
      return;
    }
    let selectedRows = this.state.selectedRows;
    this.props.onOk(selectedRows, selectedRowKeys);
  }

  // 顶部查询表单
  formItemList = [
    {
      type: "INPUT",
      field: "inputData",
      style: { width: 240 },
      placeholder: "商品名称/编号/条码"
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

  render() {

    return (
      <Modal maskClosable={false}
        zIndex={1004}
        className='noPadding'
        title='选择商品'
        visible={this.props.visible}
        onCancel={this.props.hide}
        width={800}
        onOk={this.onOk}
      >
        <div className='padding'>
          <div className='flex-between padding align-center'>
            <Button type='primary' onClick={this.clearSelection}>清除选择</Button>
            <div style={{ width: 500, textAlign: "right" }}>
              <SearchForm
                towRow={false}
                searchClicked={this.searchClicked}
                formItemList={this.formItemList}
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