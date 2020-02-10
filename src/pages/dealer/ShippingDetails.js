import React, { Component } from "react";
import { Col, Row, Card, Spin, Form, Button, Input, Table } from 'antd';
import Toast from '../../utils/toast';
import CommonPage from '../../components/common-page';
import { SearchForm } from '../../components/common-form';
import dateUtil from '../../utils/dateUtil';

import { shippingDetails, exportShippingDetails, exportAllShipping } from '../../api/dealer/shippingDetails';



const _description = "";

class ShippingDetails extends Component {
  state = {
    _title: "经销商发货详情",
  }

  componentWillMount() {
    this.pageData();
  }

  params = {
    page: 1
  }

  pageData = () => {
    let _this = this;
    this._showTableLoading();
    this.params.id = this.props.match.params.id;
    if (this.params.name == "") {
      this.params.name = null;
    }
    shippingDetails(this.params).then(res => {
      this._hideTableLoading();
      this.setState({
        tableDataList: res.data
      })
    }).catch(() => {
      this._hideTableLoading();
    })
  }

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

  // 顶部查询表单
  formItemList = [
    {
      label: "时间",
      type: "DATE_YM",
      field: "time",
    },
    {
      type: "INPUT",
      field: "name",
      style: { width: 180 },
      label: "商品条码",
      placeholder: "商品条码"
    }
  ]

  //查询按钮点击事件
  searchClicked = (params) => {
    const { time } = params;
    if (!time) {
      Toast("请选择时间")
      return;
    }
    var strSpilt = dateUtil.getDate(Date.parse(time), false, "_");
    var ti = strSpilt.split("_");
    var times = ti[0] + ti[1];
    this.params = {
      page: 1,
      ...params,
      time: times
    }
    this.pageData();
  }

  // 表格相关列
  columns = [
    { title: "经销商名称", dataIndex: "dealerName" },
    { title: "商品名称", dataIndex: "name" },
    { title: "商品条码", dataIndex: "barCode" },
    { title: "月份", dataIndex: "month" },
    { title: "数量", dataIndex: "amount" },
    {
      title: '操作',
      render: (text, record, index) => (
        <span>
          <a size="small" onClick={() => { this._exportDetailsss(record) }}>导出</a>
        </span>
      )
    }
  ]

  /**
   * 导出详细
   */
  _exportDetailsss = (record) => {
    let barCode = record.barCode;
    let month = record.month;
    let id = this.props.match.params.id;
    let exportUrll = exportShippingDetails({ "barCode": barCode, "month": month, "id": id });
    if (!exportUrll) {
      Toast("导出失败！")
      return;
    }
    this.setState({
      exportUrll
    })

    setTimeout(() => {
      this.refs.exportUrll.click()
    }, 1000)
  }

  exportAllShipping = () => {
    exportAllShipping(this.params);
  }
  // 返回
  productEditBack = () => {
    window.history.back();
  }

  render() {
    const { getFieldDecorator } = this.props.form;
    return (
      <CommonPage title={this.state._title} description={_description} >
        <div className='flex-end align-center padding10-0'>
          <SearchForm
            onValueChange={this.onSearchFormChange}
            exportClicked={this.exportClicked}
            searchClicked={this.searchClicked}
            formItemList={this.formItemList}
          >
            <Button onClick={this.exportAllShipping} className='normal yellow-btn margin-left20'>导出</Button>
            <Button onClick={this.productEditBack} className='normal margin-left20'>返回</Button>

          </SearchForm>

        </div>
        <a ref="exportUrll" download="导出" style={{ 'display': "none" }} href={this.state.exportUrll} ></a>
        <Table
          indentSize={10}
          rowKey="id"
          columns={this.columns}
          loading={this.state.showTableLoading}
          pagination={this.state.pagination}
          dataSource={this.state.tableDataList}
        />
      </CommonPage>)
  }
}

export default Form.create()(ShippingDetails);