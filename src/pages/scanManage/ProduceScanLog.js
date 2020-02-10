import React, { Component } from "react";
import CommonPage from '../../components/common-page';
import { Table, Form, AutoComplete, Input, Select, Col, Row, Icon, Button, Divider, Popconfirm, Dropdown, Menu, Radio, DatePicker, Modal, Checkbox, InputNumber } from "antd";
import { infinitePagination as pagination } from '../../utils/pagination';
import Toast from '../../utils/toast';
import { SearchForm, SubmitForm } from '../../components/common-form';
import dateUtil from '../../utils/dateUtil';
import { searchProduceScanLogList, exportProduceScanLog } from '../../api/scan/produceScan';
import { isUserAdmin, getCacheUserInfo } from '../../middleware/localStorage/login';
import { getAllOper } from '../../api/oper/login';
import moment from 'moment';

let _cacheUserInfo = null;
let _isUserAdmin = false;

class Page extends Component {

  state = {
    tableDataList: null,
    showTableLoading: false,
    operList: null
  }

  componentDidMount() {

    this.getPageData(null, true);
    this.getAllOper();
  }

  params = {
    page: 1
  }

  componentWillReceiveProps(props) {
    if (props.updateTime != this.props.updateTime) {
      this.getPageData(props.scanLogParams);
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
  // 获取页面列表
  getPageData = (inputParams, init) => {
    let params = this.props.form.getFieldsValue();
    _cacheUserInfo = getCacheUserInfo();
    _isUserAdmin = isUserAdmin();
    let { id } = _cacheUserInfo;
    let { operId } = params;

    if (_isUserAdmin) {
      operId = operId || null;
    } else {
      operId = operId || id;
    }


    let { scanTime, packingTimeStamp } = params;
    let { startScanTimeStamp, endScanTimeStamp } = dateUtil.getTimeRangeByTimeArr(scanTime, 'startScanTimeStamp', 'endScanTimeStamp');
    packingTimeStamp = Date.parse(packingTimeStamp);

    let _this = this;
    this.params = {
      ...this.params,
      ...params,
      scanTime: null,
      operId,
      packingTimeStamp,
      startScanTimeStamp, endScanTimeStamp
    }
    if (init) {
      inputParams = this.props.scanLogParams;
    }
    let renderData = null;
    if (inputParams) {
      let inputOperId = inputParams.operId;
      let scanTime = null;
      if (inputParams.startScanTimeStamp) {
        scanTime = [moment(inputParams.startScanTimeStamp), moment(inputParams.endScanTimeStamp)];
      }

      this.params = {
        ...this.params,
        ...inputParams
      }
      renderData = {
        scanTime,
        operId: inputOperId.toString()
      };
    }

    this._showTableLoading();
    searchProduceScanLogList(this.params).then(res => {
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
      },
        () => {
          renderData && this.props.form.setFieldsValue(renderData)
        })
    }).catch(() => {
      this._hideTableLoading();
    })
  }

  // 表格相关列
  columns = [
    { title: "商品唯一码", dataIndex: "productUniqueCode", render: data => data || "--" },
    { title: "货箱唯一码", dataIndex: "boxUniqueCode", render: data => data || "--" },
    { title: "托盘唯一码", dataIndex: "trayUniqueCode", render: data => data || "--" },
    { title: "扫码时间", dataIndex: "scanTime", render: data => data ? dateUtil.getDateTime(data) : "--" },
    { title: "完成时间", dataIndex: "packingTime", render: data => data ? dateUtil.getDateTime(data) : "--" },
    { title: "是否完成", dataIndex: "packingStatus", render: data => data == '1' ? "是" : "否" },
    { title: "操作员", dataIndex: "operAccount", render: data => data || "--" },
    { title: "操作来源", dataIndex: "source", render: data => data == '0' ? 'PC端' : "移动端" },
    { title: "状态", dataIndex: "status", render: data => data == '1' ? "成功" : "失败" }
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

  exportProduceScanLog = () => {
    if (!this.params.startScanTimeStamp || !this.params.endScanTimeStamp) {
      Toast("请先选择导出的扫描时间，查询之后再导出！");
      return;
    }

    exportProduceScanLog(this.params);
  }
  /**渲染**********************************************************************************************************************************/

  render() {
    const { getFieldDecorator } = this.props.form;
    const { operList } = this.state;

    return (
      <div>
        <div className='flex-end padding10-0'>
          <Form layout='inline'>
            {
              _isUserAdmin ?
                <Form.Item
                  label='操作员'
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

            {/* <Form.Item label='扫描时间'>
              {
                getFieldDecorator('scanTimeStamp')(
                  <DatePicker
                    showTime
                    format="YYYY-MM-DD"
                    placeholder="扫描时间"
                  />
                )
              }
            </Form.Item> */}

            <Form.Item
              placeholder="扫描时间"
              label='扫描时间'
              field='scanTime'>
              {
                getFieldDecorator('scanTime')(
                  <DatePicker.RangePicker style={{ width: 220 }} />
                )
              }
            </Form.Item>
            <Form.Item label='完成时间' colon={false}>
              {
                getFieldDecorator('packingTimeStamp')(
                  <DatePicker
                    showTime
                    format="YYYY-MM-DD"
                    placeholder="完成时间"
                    style={{ width: 120 }}
                  />

                )
              }
            </Form.Item>
            <Form.Item>
              {
                getFieldDecorator('inputData')(
                  <Input allowClear style={{ width: 260 }} placeholder='商品码/货箱码/托盘码' />
                )
              }
            </Form.Item>
            <Form.Item>
              <Button type='primary' onClick={() => this.getPageData()}>查询</Button>
            </Form.Item>
            <Form.Item>
              <Button onClick={this.resetSearch}>重置</Button>
            </Form.Item>
            <Form.Item>
              <Button className='yellow-btn' onClick={this.exportProduceScanLog}>导出</Button>
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