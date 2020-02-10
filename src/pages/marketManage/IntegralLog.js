import React, { Component } from "react";
import CommonPage from '../../components/common-page';
import { Table, Form, Input, Select, Col, Row, Spin, Icon, Button, DatePicker, Divider, Popconfirm, Radio, Modal, Checkbox, InputNumber, Upload } from "antd";
import { pagination } from '../../utils/pagination';
import Toast from '../../utils/toast';
import { SearchForm, SubmitForm } from '../../components/common-form';
import dateUtil from '../../utils/dateUtil';
import { searchIntegralLogList, exportIntegralLog } from '../../api/activity/activity';
import { NavLink, Link } from 'react-router-dom';
import { baseRoute, routerConfig } from '../../config/router.config';
import { connect } from 'react-redux';
import { changeRoute } from '../../store/actions/route-actions';
import { parseUrl } from '../../utils/urlUtils';

const _description = "";

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
      let _title = "活动积分日志";
      this.setState({
        type,
        _title
      })
      this.props.changeRoute({ path: 'marketManage.integralLog', title: _title, parentTitle: '营销工具' });
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
    searchIntegralLogList(this.params).then(res => {
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
    let exportUrl = exportIntegralLog(params);
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

    { title: "获取途径", dataIndex: "access", render: data => data || "--" },
    { title: "备注", dataIndex: "remark", render: data => data || "--" },
    { title: "获得积分", dataIndex: "integral", render: data => `+${data}` },
    { title: "获得时间", dataIndex: "createTime", render: data => dateUtil.getDateTime(data) || "--" },
    { title: "参与用户ID", dataIndex: "attentionId", render: data => data || "--" },
    { title: "用户昵称", dataIndex: "attentionName", render: data => data || "--" },
    { title: "用户手机号", dataIndex: "attentionPhone", render: data => data || "--" }
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
        endCreateTimeStamp,
        time: null
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
                  label='获得时间：'
                  field='time'>
                  {
                    getFieldDecorator('time')(
                      <DatePicker.RangePicker />
                    )
                  }
                </Form.Item>               

                <Form.Item
                  field="inputData"
                >
                  {
                    getFieldDecorator('inputData', {
                    })(
                      <Input allowClear placeholder="获取途径/参与用户id" style={{ width: "200px" }} />
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