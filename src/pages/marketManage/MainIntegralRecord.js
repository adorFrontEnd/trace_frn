import React, { Component } from "react";
import CommonPage from '../../components/common-page';
import { Table, Form, Input, Select, Col, Row, Icon, Button, DatePicker, Divider, Popconfirm, Radio, Modal, Checkbox, InputNumber, Upload } from "antd";
import { pagination } from '../../utils/pagination';
import Toast from '../../utils/toast';
import { SearchForm, SubmitForm } from '../../components/common-form';
import dateUtil from '../../utils/dateUtil';
import { searchLogRecordList, exportIntegralLogRecord } from '../../api/mainIntegralRecord/mainIntegralRecord';
import { NavLink, Link } from 'react-router-dom';
import { baseRoute, routerConfig } from '../../config/router.config';
import { connect } from 'react-redux';
import { changeRoute } from '../../store/actions/route-actions';

const _title = "积分记录";
const _description = "";
const _typeEnum = {
  "0": "积分活动",
  "1": "签到",
  "2": "抽奖消耗",
  "3": "系统修改"
}
const integralRecordPath = routerConfig["marketManage.integralRecord"].path;
const activityEditPath = routerConfig["marketManage.activityEdit"].path;
const signConfigPath = routerConfig["marketManage.signConfig"].path;

class DealerList extends Component {

  state = {
    tableDataList: null,
    showTableLoading: false,
    attentionDetail: null,
    exportUrl: null,
    recordType: null
  }

  componentDidMount() {
    this.props.changeRoute({ path: 'marketManage.mainIntegralRecord', title: _title, parentTitle: '营销工具' });
    this.getPageData();
  }


  params = {
    page: 1,
    size: 10
  }

  // 获取页面列表
  getPageData = () => {

    let _this = this;
    this._showTableLoading();
    searchLogRecordList(this.params).then(res => {
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

    { title: "用户", dataIndex: "nickname", render: data => data || "--" },
    { title: "变更前", dataIndex: "beforeValue", render: data => (data || data == 0) ? data : "--" },
    { title: "变更后", dataIndex: "afterValue", render: data => (data || data == 0) ? data : "--" },
    { title: "变更日期", dataIndex: "updateTime", render: data => data ? dateUtil.getDateTime(data) : "--" },
    { title: "变更类型", dataIndex: "typeStr", render: data => data || "--" },
    {
      title: '操作',
      render: (text, record, index) => (
        <span>
          <span><NavLink to={integralRecordPath + "/" + record.attentionId}>查看会员详情</NavLink></span>

          <Divider type="vertical" />
          {
            record.type == '0' || record.type == '2' ?

              <span><NavLink to={activityEditPath + "/" + record.activityId}>查看活动详情</NavLink></span>
              :
              null
          }
          {
            record.type == '1' ?

              <span><NavLink to={signConfigPath}>查看活动详情</NavLink></span>
              :
              null
          }
          {
            record.type == '3' ?
              <span className='color-gray' style={{cursor:"not-allowed"}}>查看活动详情</span>
              :
              null
          }

        </span>
      )
    }
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

  goEditBack = () => {
    window.history.back();
  }

  resetClicked = () => {
    this.props.form.resetFields();
  }

  exportUrlClick = () => {
    exportIntegralLogRecord(this.params);
  }

  onRecordTypeChange = (recordType) => {
    this.setState({
      recordType
    })
    this.params = { ...this.params, type: recordType };
    this.getPageData();
  }

  /**渲染**********************************************************************************************************************************/

  render() {
    const { getFieldDecorator } = this.props.form;

    return (
      <CommonPage title={_title} description={_description} >
        <div>

          <div className='flex align-center margin-bottom'>
            <Select value={this.state.recordType} onChange={this.onRecordTypeChange} style={{ width: 100 }}>
              <Select.Option value={null}>所有</Select.Option>
              {
                Object.keys(_typeEnum).map(item =>
                  <Select.Option key={item} value={item}>{_typeEnum[item]}</Select.Option>
                )
              }
            </Select>
            <Button type='primary' style={{ width: 100 }} className='margin-left20 yellow-btn' onClick={this.exportUrlClick}>导出</Button>
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
export default connect(mapStateToProps, mapDispatchToProps)(Form.create()(DealerList));