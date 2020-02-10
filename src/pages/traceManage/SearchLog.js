import React, { Component } from "react";
import CommonPage from '../../components/common-page';
import { Table, Form, Input, Select, Col, Row, Icon, Button, Divider, Popconfirm, Dropdown, Menu, Radio, DatePicker, Modal, Checkbox, InputNumber } from "antd";
import { infinitePagination as pagination } from '../../utils/pagination';
import Toast from '../../utils/toast';
import { SearchForm, SubmitForm } from '../../components/common-form';
import dateUtil from '../../utils/dateUtil';
import { searchTraceSourceList } from '../../api/trace/trace';
import CheckboxGroup from "antd/lib/checkbox/Group";
import moment from "moment";




class Page extends Component {

  state = {
    tableDataList: null,
    showTableLoading: false,
    selectType: "0"
  }

  componentDidMount() {

    this.pageInit();
  }

  params = {
    page: 1
  }


  pageInit = () => {
    let createTimeStamp = Date.now();
    this.props.form.setFieldsValue({
      createTimeStamp: moment(createTimeStamp)
    })
  }
  // 获取页面列表
  getPageData = (isPageOne) => {

    if (isPageOne) {
      this.params.page = 1;
    }

    let params = this.props.form.getFieldsValue();
    if (params) {
      let { createTimeStamp, endCreateTimeStamp, uniqueCode } = params;

      params.createTimeStamp = createTimeStamp ? dateUtil.getDayStartStamp(Date.parse(createTimeStamp)) : null;
      let selectType = this.state.selectType;

      if (selectType == '1') {
        if (!uniqueCode) {
          Toast("请输入唯一码！");
          return;
        }
        params = {
          selectType,
          uniqueCode
        }
      } else {
        if (!params.createTimeStamp) {

          Toast("请选择日期！");
          return;

        }
        params.selectType = selectType;
      }
      console.log(params)
    }
    let _this = this;

    let reqData = {
      ...this.params,
      ...params
    }
    this._showTableLoading();
    searchTraceSourceList(reqData).then(res => {

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
  // 表格相关列
  columns = [
    { title: "唯一码", dataIndex: "uniqueCode", render: data => data || "--" },
    { title: "商品编码", dataIndex: "productNumber", render: data => data || "--" },
    { title: "商品名称", dataIndex: "productName", render: data => data || "--" },
    { title: "首次查询时间", dataIndex: "firstQueryTimeSource", render: data => data ? dateUtil.getDateTime(data) : "--" },
    { title: "总查询次数", dataIndex: "queryCountSource", render: data => data || "--" }
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

  onSelectTypeChange = (e) => {

    let selectType = e.target.value;
    this.setState({
      selectType
    })

  }
  /**导出日志操作***************************************************************************************************************** */

  resetSearch = () => {
    this.props.form.resetFields()
  }
  /**渲染**********************************************************************************************************************************/

  render() {
    const { getFieldDecorator } = this.props.form;
    const { selectType } = this.state;
    return (
      <div>
        <div className="flex align-center">
          <span className="margin-right">查询类型：</span>
          <Radio.Group onChange={this.onSelectTypeChange} value={this.state.selectType} >
            <Radio value={'0'}>按月查询</Radio>
            <Radio value={'1'}>按唯一码查询</Radio>
          </Radio.Group>
        </div>
        <div className='flex padding10-0 align-center'>
          <span className="margin-right">查询条件：</span>
          <Form layout='inline'>
            {
              selectType == '0' ?
                <Form.Item>
                  {
                    getFieldDecorator('createTimeStamp')(
                      <DatePicker.MonthPicker
                        showTime
                        format="YYYY-MM"
                        placeholder="查询日期"
                      />
                    )
                  }
                </Form.Item>
                : null
            }
            {
              selectType == '0' ?
                <Form.Item>
                  {
                    getFieldDecorator('uniqueCode')(
                      <Input allowClear style={{ width: 260 }} placeholder='唯一码' />
                    )
                  }
                </Form.Item>
                : null
            }
            {
              selectType == '0' ?
                <Form.Item>
                  {
                    getFieldDecorator('productNumber')(
                      <Input allowClear style={{ width: 200 }} placeholder='商品编码' />
                    )
                  }
                </Form.Item>
                : null
            }

            {
              selectType == '0' ?
                <Form.Item>
                  {
                    getFieldDecorator('productName')(
                      <Input allowClear style={{ width: 200 }} placeholder='商品名称' />
                    )
                  }
                </Form.Item>
                : null
            }

            {
              selectType == '1' ?
                <Form.Item>
                  {
                    getFieldDecorator('uniqueCode')(
                      <Input allowClear style={{ width: 260 }} placeholder='唯一码' />
                    )
                  }
                </Form.Item>
                : null
            }

            <Form.Item>
              <Button type='primary' onClick={() => { this.getPageData(true) }}>查询</Button>
            </Form.Item>
            <Form.Item>
              <Button onClick={this.resetSearch}>重置</Button>
            </Form.Item>
          </Form>
        </div>
        <Table
          indentSize={10}
          rowKey="id"
          columns={this.columns}
          loading={this.state.showTableLoading}
          pagination={this.state.pagination}
          dataSource={this.state.tableDataList}
        />
      </div>
    )
  }
}

export default Form.create()(Page);