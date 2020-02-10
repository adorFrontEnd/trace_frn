import React, { Component } from "react";
import CommonPage from '../../components/common-page';
import { Table, Form, AutoComplete, Input, Select, Col, Row, Icon, Button, Divider, Popconfirm, Dropdown, Menu, Radio, DatePicker, Modal, Checkbox, InputNumber } from "antd";
import { pagination } from '../../utils/pagination';
import Toast from '../../utils/toast';
import { SearchForm, SubmitForm } from '../../components/common-form';
import dateUtil from '../../utils/dateUtil';
import { searchOutboundScanQuantityList, exportOutboundScanQuantity,exportOutboundScanQuantityRecord } from '../../api/scan/stockOut';
import { isUserAdmin, getCacheUserInfo } from '../../middleware/localStorage/login';
import { getAllOper } from '../../api/oper/login';
import { NavLink, Link } from 'react-router-dom';
import { baseRoute, routerConfig } from '../../config/router.config';

let _cacheUserInfo = null;
let _isUserAdmin = false;


class OperLog extends Component {

  state = {
    tableDataList: null,
    showTableLoading: false,
    operList: null
  }

  componentDidMount() {

    this.getPageData();
    this.getAllOper();
  }

  params = {
    page: 1
  }

  componentWillReceiveProps(props) {
    if (props.updateTime != this.props.updateTime) {
      this.getPageData();
    }
  }

  getAllOper = () => {
    getAllOper()
      .then(operList => {
        this.setState({
          operList
        })
      })
  }

  getPageData = (params) => {
    _cacheUserInfo = getCacheUserInfo();
    _isUserAdmin = isUserAdmin();
    let { id } = _cacheUserInfo;
    let operId = null;
    if (params) {
      operId = params.operId;
    }

    if (_isUserAdmin) {
      operId = operId || null;
    } else {
      operId = operId || id;
    }

    let _this = this;
    this.params = {
      ...this.params,
      operId
    }
    this._showTableLoading();
    searchOutboundScanQuantityList(this.params).then(res => {
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

  // 搜索
  searchClicked = () => {
    let params = this.props.form.getFieldsValue();
    let { time } = params;
    if (time && time.length) {
      let [startTime, stopTime] = time;
      let startCreateTimeStamp = startTime ? dateUtil.getDayStartStamp(Date.parse(startTime)) : null;
      let endCreateTimeStamp = stopTime ? dateUtil.getDayStopStamp(Date.parse(stopTime)) : null;
      this.params = {
        ...params,
        startCreateTimeStamp,
        endCreateTimeStamp,
        time: null
      }
    } else {
      this.params = {
        ...params,
        time: null
      }
    }
    this.params.page = 1;
    this.getPageData(params);

  }

  // 表格相关列
  columns = [
    { title: "操作员账号", dataIndex: "username", render: data => data || "--" },
    { title: "操作员名称", dataIndex: "operName", render: data => data || "--" },
    { title: "统计日期", dataIndex: "createTime", render: data => data ? dateUtil.getDate(data) : "--" },
    { title: "应发包数", dataIndex: "contractQuantity", render: data => data || data == 0 ? <span className={data == 0 ? "color-gray" : "font-bold font-16 color-red"}>{data}</span> : "--" },
    { title: "拣货包数", dataIndex: "pickingQuantity", render: data => data || data == 0 ? <span className={data == 0 ? "color-gray" : "font-bold font-16 color-red"}>{data}</span> : "--" },
    { title: "拣箱", dataIndex: "boxQuantity", render: data => data || data == 0 ? <span className={data == 0 ? "color-gray" : "font-bold font-16 color-red"}>{data}</span> : "--" },
    { title: "拣单包", dataIndex: "productQuantity", render: data => data || data == 0 ? <span className={data == 0 ? "color-gray" : "font-bold font-16 color-red"}>{data}</span> : "--" },
    {
      title: "操作", dataIndex: "status", render: (text, record) =>
        <span>
          <a onClick={() => { this.goDetail(record) }}>查看详情</a>
          <Divider type='vertical' />
          <a onClick={() => exportOutboundScanQuantity({ id: record.id })}> 数据导出</a>
        </span>


    }
  ]


  goDetail = (record) => {
    let { operId } = record;
    let { startCreateTimeStamp, endCreateTimeStamp } = this.params;
    this.props.goDetail({
      operId,
      startCreateTimeStamp,
      endCreateTimeStamp
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

  /******************************************************************************************************************* */

  resetSearch = () => {
    this.props.form.resetFields()
  }

  autoCompleteFilter = (inputValue, option) => {
    return option.props.filtertext.toUpperCase().indexOf(inputValue.toUpperCase()) !== -1
  }

  getDealerTotalOption = (item) => {
    let { nickname, username, roleName } = item;
    let str = `${nickname}(${username}-${roleName})`
    return str
  }

  exportOutboundScanQuantityRecord = () => {
    if (!this.params.startCreateTimeStamp || !this.params.endCreateTimeStamp) {
      Toast("请先选择导出的查询时间，查询之后再导出！");
      return;
    }

    exportOutboundScanQuantityRecord(this.params);
  }
  /**渲染**********************************************************************************************************************************/

  render() {
    const { getFieldDecorator } = this.props.form;
    const { operList } = this.state;

    return (
      <div>
        <div className='flex-between padding10-0 align-center'>
          <div className='line-height40 color-red padding-left' style={{width:230}}>当日拣货扫描记录会在第二日显示</div>
          <Form layout='inline'>
            <Form.Item label='商品'>
              {
                getFieldDecorator('numberParam')(
                  <Input allowClear style={{ width: 160 }} placeholder='填写商品编码' />
                )
              }
            </Form.Item>
            {
              _isUserAdmin ?
                <Form.Item
                  label='操作账号'
                >
                  {
                    getFieldDecorator('operId')(
                      <AutoComplete
                        allowClear
                        style={{ width: "240px" }}
                        dataSource={operList}
                        children={
                          operList ? operList.map(item =>
                            <AutoComplete.Option title={item.nickname} key={item.id} value={item.id.toString()} filtertext={`${item.nickname}(${item.username}-${item.roleName})`}>
                              {this.getDealerTotalOption(item)}
                            </AutoComplete.Option>
                          ) : null
                        }
                        placeholder='选择操作员'
                        filterOption={this.autoCompleteFilter}
                      />

                    )
                  }
                </Form.Item>
                : null
            }

            <Form.Item
              labelCol={{ span: 6 }}
              wrapperCol={{ span: 18 }}
              label='统计日期'
              field='time'>
              {
                getFieldDecorator('time')(
                  <DatePicker.RangePicker style={{ width: 240 }} />
                )
              }
            </Form.Item>

            <Form.Item>
              <Button type='primary' onClick={this.searchClicked}>查询</Button>
            </Form.Item>
            <Form.Item>
              <Button onClick={this.resetSearch}>重置</Button>
            </Form.Item>
            <Form.Item>
              <Button className='yellow-btn' onClick={this.exportOutboundScanQuantityRecord}>导出</Button>
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

export default Form.create()(OperLog);