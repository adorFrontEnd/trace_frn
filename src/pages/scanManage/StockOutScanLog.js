import React, { Component } from "react";
import CommonPage from '../../components/common-page';
import { Table, Form, Input, AutoComplete, Select, Col, Row, Icon, Button, Divider, Popconfirm, Dropdown, Menu, Radio, DatePicker, Modal, Checkbox, InputNumber } from "antd";
import { infinitePagination as pagination } from '../../utils/pagination';
import Toast from '../../utils/toast';
import { SearchForm, SubmitForm } from '../../components/common-form';
import dateUtil from '../../utils/dateUtil';
import { searchOutboundScanLogList, getExpressList, exportOutboundScanLog} from '../../api/scan/stockOut';
import { isUserAdmin, getCacheUserInfo } from '../../middleware/localStorage/login';
import { getAllOper } from '../../api/oper/login';
import moment from 'moment';


let _cacheUserInfo = null;
let _isUserAdmin = false;

class Page extends Component {

  state = {
    tableDataList: null,
    showTableLoading: false,
    expressList: null,
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


    if (params) {
      let { outboundTime } = params;
      let { startOutboundTimeStamp, endOutboundTimeStamp } = dateUtil.getTimeRangeByTimeArr(outboundTime, 'startOutboundTimeStamp', 'endOutboundTimeStamp');

      params = {
        ...params,
        startOutboundTimeStamp, endOutboundTimeStamp,
        outboundTime: null
      }
    }


    let _this = this;
    this.params = {
      ...this.params,
      ...params,
      operId
    }
    if (init) {
      inputParams = this.props.scanLogParams;
    }
    let renderData = null;
    if (inputParams) {
      let inputOperId = inputParams.operId;
      let outboundTime = null;
      if (inputParams.startOutboundTimeStamp) {
        outboundTime = [moment(inputParams.startOutboundTimeStamp), moment(inputParams.endOutboundTimeStamp)];
      }

      this.params = {
        ...this.params,
        ...inputParams
      }
      renderData = {
        outboundTime,
        operId: inputOperId.toString()
      };
    }



    this._showTableLoading();
    searchOutboundScanLogList(this.params).then(res => {
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
      }, () => {
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
    { title: "单号（物流或订单）", dataIndex: "trackingNumber", render: data => data || "--" },
    { title: "经销商", dataIndex: "dealerName", render: data => data || "--" },
    { title: "操作员", dataIndex: "operAccount", render: data => data || "--" },
    { title: "操作来源", dataIndex: "source", render: data => data == '0' ? 'PC端' : "移动端" },
    { title: "拣货时间", dataIndex: "outboundTime", render: data => data ? dateUtil.getDateTime(data) : "--" }
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

  exportOutboundScanLog = () => {
    if (!this.params.startOutboundTimeStamp || !this.params.endOutboundTimeStamp) {
      Toast("请先选择导出的扫描时间，查询之后再导出！");
      return;
    }

    exportOutboundScanLog(this.params);
  }
  /**渲染**********************************************************************************************************************************/

  render() {
    const { getFieldDecorator } = this.props.form;
    const { operList } = this.state;

    return (
      <div>
        <div className='flex-end padding10-0'>
          <Form layout='inline' >
            {
              _isUserAdmin ?
                <Form.Item
                  label='操作员'
                  field="operId"
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
              placeholder="拣货时间"
              label='拣货时间'
              field='outboundTime'>
              {
                getFieldDecorator('outboundTime')(
                  <DatePicker.RangePicker style={{ width: 220 }} />
                )
              }
            </Form.Item>
            {/* {
              this.state.expressList ?
                <Form.Item label='快递公司' colon={false}>
                  {
                    getFieldDecorator('expressDeliveryId')(
                      <Select style={{width:220}} placeholder='选择快递公司'>
                        {
                          this.state.expressList.map(item => (
                            <Select.Option  key={item.id} value={item.id}>
                              {item.name}
                            </Select.Option>
                          ))
                        }

                      </Select>
                    )
                  }
                </Form.Item>
                : null
            } */}

            <Form.Item>
              {
                getFieldDecorator('inputData')(
                  <Input allowClear style={{ width: 260 }} placeholder='商品码/货箱码/托盘码/快递单号' />
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
              <Button className='yellow-btn' onClick={this.exportOutboundScanLog}>导出</Button>
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