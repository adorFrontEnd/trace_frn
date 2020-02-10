import React, { Component } from "react";
import { Col, Row, Card, Spin, Form, Button, Input, Table } from 'antd';
import Toast from '../../utils/toast';
import { pagination } from '../../utils/pagination';
import CommonPage from '../../components/common-page';
import { SearchForm } from '../../components/common-form';
import dateUtil from '../../utils/dateUtil';
import { changeRoute } from '../../store/actions/route-actions'
import { connect } from 'react-redux';
import { shippingDetails, exportShippingDetails } from '../../api/dealer/shippingDetails';
import { getListOfShelves, exportListOfShelves } from '../../api/dealer/dealerList';




const _description = "";

class Page extends Component {
  state = {
    _title: "上架记录",
    exportListOfShelvesUrl: ""
  }

  componentDidMount() {
    this.props.changeRoute({ path: 'dealer.productUpRecord', title: '上架记录', parentTitle: '经销商列表' });
    this.getPageData();
  }

  params = {
    page: 1
  }

  // 获取页面列表
  getPageData = () => {
    let _this = this;
    this._showTableLoading();
    this.params.dealerId = this.props.match.params.id;

    if (this.params.code == "") {
      this.params.code = null;
    }
    if (!this.params.month) {
      this.params.month = this.getMonth();
    }

    getListOfShelves(this.params).then(res => {
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
      field: "month"

    },
    {
      type: "SELECT",
      field: "type",
      style: { width: 180 },
      placeholder: "选择类型",
      defaultOption: { id: null, name: "选择类型" },
      optionList: [{ id: "0", name: "下架" }, { id: "1", name: "上架" }]
    },
    {
      type: "INPUT",
      field: "code",
      style: { width: 300 },
      placeholder: "商品名称/编号/条码/唯一码"
    }
  ]

  //查询按钮点击事件
  searchClicked = (params) => {
    const { month } = params;
    if (!month) {
      Toast("请选择时间")
      return;
    }

    let _month = this.getMonth(month);
    this.params = {
      page: 1,
      ...params,
      month: _month
    }
    this.getPageData();
  }

  getMonth = (stamp, label) => {
    stamp = stamp || Date.now();
    let strSpilt = dateUtil.getDate(Date.parse(stamp), false, "_");
    let ti = strSpilt.split("_");
    let times = ti[0] + (label ? label : "") + ti[1];
    return times;
  }

  // 表格相关列
  columns = [
    { title: "门店（经销商）", dataIndex: "dealerName" },
    { title: "商品", dataIndex: "productName" },
    { title: "商品编号", dataIndex: "number" },
    { title: "商品条码", dataIndex: "barCode" },
    { title: "唯一码", dataIndex: "productUniqueCode" },
    { title: "月份", dataIndex: "time", render: data => this.getMonth(data, '-') },
    { title: "类型", dataIndex: "type", render: data => data == '0' ? "下架" : "上架" }
  ]

  /**
   * 导出详细
   */
  exportListOfShelves = () => {

    let exportListOfShelvesUrl = exportListOfShelves(this.params);
    if (!exportListOfShelvesUrl) {
      Toast("导出失败！")
      return;
    }
    this.setState({
      exportListOfShelvesUrl
    })

    setTimeout(() => {
      this.refs.exportListOfShelvesUrl.click()
    }, 1000)
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
            <Button onClick={this.productEditBack} className='normal yellow-btn margin-left20'>返回</Button>
            <Button onClick={this.exportListOfShelves} className='normal yellow-btn margin-left20'>导出</Button>

          </SearchForm>

        </div>
        <a ref="exportUrll" download="导出" style={{ 'display': "none" }} href={this.state.exportUrll} ></a>
        <a ref="exportListOfShelvesUrl" download="导出" style={{ 'display': "none" }} href={this.state.exportListOfShelvesUrl} ></a>
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

const mapStateToProps = state => state;
const mapDispatchToProps = (dispatch) => {
  return {
    changeRoute: data => dispatch(changeRoute(data))
  }
}
export default connect(mapStateToProps, mapDispatchToProps)(Form.create()(Page));

