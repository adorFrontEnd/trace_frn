import React, { Component } from "react";
import CommonPage from '../../components/common-page';
import { Table, Form, Input, Select, Col, Row, Spin, Icon, Button, DatePicker, Divider, Popconfirm, Radio, Modal, Checkbox, InputNumber, Upload } from "antd";
import { pagination } from '../../utils/pagination';
import Toast from '../../utils/toast';
import { SearchForm, SubmitForm } from '../../components/common-form';
import dateUtil from '../../utils/dateUtil';
import { searchWriteOffLogList, exportWriteOffLog } from '../../api/activity/activity';
import { NavLink, Link } from 'react-router-dom';
import { baseRoute, routerConfig } from '../../config/router.config';
import { connect } from 'react-redux';
import { changeRoute } from '../../store/actions/route-actions';
import { parseUrl } from '../../utils/urlUtils';

const _description = "";
const typeEnum = {
  "0": "未核销",
  "1": "已核销",
  "2": "未完成全部扫码",
  "3": "已完成全部扫码"
}
const typeEnumStr = {
  "0": <font color="red">未核销</font>,
  "1": <font color="green">已核销</font>,
  "2": "未完成全部扫码",
  "3": "已完成全部扫码"
}

class Page extends Component {

  state = {
    tableDataList: null,
    showPageLoading: false,
    type: 0,
    _title: "核销管理",
    isReEdit: false,
    exportUrl: ""
  }

  componentDidMount() {
    let urlParams = parseUrl(this.props.location.search);
    if (urlParams && urlParams.args && urlParams.args.type) {
      let type = urlParams.args.type;
      let _title = "核销管理";
      this.setState({
        type,
        _title
      })
      this.props.changeRoute({ path: 'marketManage.writeOffLog', title: _title, parentTitle: '营销工具' });
      let activityId = this.props.match.params.id;
      this.setState({
        activityId
      })
      this.getPageData(activityId, type);
    }
  }
  /************************************************************************************************************************** */
  params = {
    page: 1
  }

  /******查询表单操作****************************************************************************************************************** */
  // 顶部查询表单
  formItemList = [
    {
      type: "INPUT",
      field: "inputData",
      style: { width: 240 },
      placeholder: "经销商名称/联系人/ID/手机号"
    },
    {
      type: "SELECT",
      field: "type",
      style: { width: 240 },
      placeholder: "经销商名称/联系人/ID/手机号"
    }
  ]
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
  // 重置
  resetClicked = () => {
    this.props.form.resetFields();
  }
  // 获取页面列表
  getPageData = (activityId, type) => {
    let _this = this;
    this.params.activityId = activityId || this.state.activityId;

    this._showTableLoading();
    searchWriteOffLogList(this.params).then(res => {
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

  exportUrlClick = () => {
    this._exportUniqueCode(this.params);
  }

  _exportUniqueCode = (params) => {

    if (params.time) {
      params.time = null
    }
    let exportUrl = exportWriteOffLog(params);
    if (!exportUrl) {
      Toast("生成失败！")
      return;
    }
    this.setState({
      exportUrl
    })

    setTimeout(() => {
      this.refs.exportUrl.click()
    }, 1000)
  }


  /**************************************************************************************** */
  // 表格相关列
  columns = [

    { title: "活动编号", dataIndex: "activityId" },
    { title: "活动名称", dataIndex: "activityName", render: data => data || "--" },
    { title: "核销码（兑换码ID）", dataIndex: "writeOffCode", render: data => data || "--" },
    // 0满赠活动 1积分活动

    { title: "核销码生成时间", dataIndex: "writeOffCodeCreateTime", render: data => data ? dateUtil.getDate(data) : "--" },
    { title: "状态", dataIndex: "type", render: data => typeEnumStr[data] },
    { title: "核销时间", dataIndex: "writeOffCodeUseTime", render: data => data ? dateUtil.getDate(data) : "--" },
    { title: "核销门店（经销商）", dataIndex: "storeName", render: data => data || "--" },
    { title: "门店ID（经销商）", dataIndex: "storeId", render: data => data || "--" },
    { title: "兑换商品名称", dataIndex: "exchangeProductName", render: data => data || "--" },
    { title: "兑换商品条码", dataIndex: "exchangeProductBarCode", render: data => data || "--" },
    { title: "会员ID", dataIndex: "attentionId", render: data => data || "--" },
    { title: "会员昵称", dataIndex: "attentionName", render: data => data || "--" },
    { title: "会员手机号", dataIndex: "attentionPhone", render: data => data || "--" }
  ]

  goEditBack = () => {
    window.history.back();
  }

  saveDataClicked = () => {
    let params = this.props.form.getFieldsValue();

    let { time, type, inputData } = params;
    if (time && time.length) {
      let [startTime, stopTime] = time;
      let startCreateTimeStamp = dateUtil.getDayStartStamp(Date.parse(startTime));
      let endCreateTimeStamp = dateUtil.getDayStopStamp(Date.parse(stopTime));
      this.params = {
        ...params,
        startCreateTimeStamp,
        endCreateTimeStamp
      }
    } else {
      this.params = params;
    }
    this.getPageData();
  }

  resetClicked = () => {
    this.props.form.resetFields();
  }
  /**渲染**********************************************************************************************************************************/

  render() {
    const { getFieldDecorator } = this.props.form;

    return (
      <CommonPage title={this.state._title} description={_description} >

        <div>
          <div className='flex-between align-center margin-bottom'>
            <Button type='primary' style={{ width: 100 }} className='margin-right20 yellow-btn' onClick={this.goEditBack}>返回</Button>
            <div className='flex align-center'>
              <Form layout='inline'>
                <Form.Item
                  labelCol={{ span: 6 }}
                  wrapperCol={{ span: 18 }}
                  label='核销码生成时间：'
                  field='time'>
                  {
                    getFieldDecorator('time')(
                      <DatePicker.RangePicker />
                    )
                  }
                </Form.Item>

                <Form.Item
                  field="type"
                  labelCol={{ span: 7 }}
                  wrapperCol={{ span: 17 }}
                >

                  {
                    getFieldDecorator('type', {
                    })(
                      <Select allowClear style={{ width: "210px" }} placeholder='选择核销码状态'>
                        {
                          Object.keys(typeEnum).map(item => (
                            <Select.Option key={item} value={item}>{typeEnum[item]}</Select.Option>
                          ))
                        }
                      </Select>
                    )
                  }
                </Form.Item>

                <Form.Item
                  field="inputData"
                >
                  {
                    getFieldDecorator('inputData', {
                    })(
                      <Input allowClear placeholder="核销码ID/门店/商品名称/条码/用户/标签" style={{ width: "300px" }} />
                    )
                  }
                </Form.Item>
              </Form>
              <Button type='primary' className='normal margin0-20' onClick={() => { this.saveDataClicked() }}>查询</Button>
              <Button className='normal' onClick={this.resetClicked}>重置</Button>
              <Button type='primary' style={{ width: 100 }} className='margin-left20 yellow-btn' onClick={this.exportUrlClick}>导出</Button>

            </div>
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

        <a ref="exportUrl" download="设备数据" style={{ 'display': "none" }} href={this.state.exportUrl} ></a>

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
export default connect(mapStateToProps, mapDispatchToProps)(Form.create()(Page));