import React, { Component } from "react";
import CommonPage from '../../components/common-page';
import { Table, Form, Input, Select, Col, Row, Icon, Button, DatePicker, Divider, Popconfirm, Radio, Modal, Checkbox, InputNumber, Upload } from "antd";
import { pagination } from '../../utils/pagination';
import Toast from '../../utils/toast';
import { SearchForm, SubmitForm } from '../../components/common-form';
import dateUtil from '../../utils/dateUtil';
import { searchIntegralLogList, getAttentionDetail, exportIntegralLog, getIntegral } from '../../api/activity/activity';
import { NavLink, Link } from 'react-router-dom';
import { baseRoute, routerConfig } from '../../config/router.config';
import { connect } from 'react-redux';
import { changeRoute } from '../../store/actions/route-actions';

const _title = "积分记录";
const _description = "";

class DealerList extends Component {

  state = {
    tableDataList: null,
    showTableLoading: false,
    attentionDetail: null,
    exportUrl: null
  }

  componentDidMount() {
    this.props.changeRoute({ path: 'marketManage.integralRecord', title: _title, parentTitle: '营销工具' });
    let attentionId = this.props.match.params.id;
    this.setState({
      attentionId
    })
    this.getPageData(attentionId);
    this._getAttentionDetail(attentionId);
    this._getIntegral(attentionId);
  }

  params = {
    page: 1
  }

  // 获取页面列表
  getPageData = (attentionId) => {
    attentionId = attentionId || this.state.attentionId;
    let _this = this;
    this._showTableLoading();
    this.params = { ...this.params, attentionId };
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

  // 表格相关列
  columns = [

    { title: "变更途径", dataIndex: "access", render: data => data || "--" },
    { title: "变更备注", dataIndex: "remark", render: data => data || "--" },
    { title: "积分变更", dataIndex: "integral", render: (data,record) => `${record.type=='0'?"-":"+"}${data}` },
    { title: "变更时间", dataIndex: "createTime", render: data => dateUtil.getDateTime(data) || "--" }
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

  _getAttentionDetail = (attentionId) => {
    attentionId = attentionId || this.state.attentionId;
    getAttentionDetail({ id: attentionId })
      .then((attentionDetail) => {
        this.setState({
          attentionDetail
        })
      })

  }

  _getIntegral = (attentionId) => {
    attentionId = attentionId || this.state.attentionId;
    getIntegral({ attentionId })
      .then((data) => {
        if (data && data.integral) {
          this.setState({
            integral: data.integral
          })
        } else {
          this.setState({
            integral: 0
          })
        }
      })
  }

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


  exportUrlClick = () => {
    this._export(this.params);
  }


  _export = (params) => {
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
  /**渲染**********************************************************************************************************************************/

  render() {
    const { getFieldDecorator } = this.props.form;

    return (
      <CommonPage title={_title} description={_description} >
        <div>
          <div>
            {
              this.state.attentionDetail ?
                <div className='flex align-center margin-bottom'>
                  {
                    this.state.attentionDetail.avatar ?
                      <img style={{ width: 50, height: 50 }} src={this.state.attentionDetail.avatar} />
                      : null
                  }
                  <div className='margin0-10'>{this.state.attentionDetail.nickname}</div>
                  <div>（会员编号：{this.state.attentionDetail.id}）<span>积分：{this.state.integral}</span></div>
                </div>
                : null
            }
          </div>
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
                      <Input allowClear placeholder="变更途径/参与用户id" style={{ width: "200px" }} />
                    )
                  }
                </Form.Item>
              </Form>
              <Button type='primary' className='normal margin0-20' onClick={() => { this.saveDataClicked() }}>查询</Button>
              <Button className='normal' onClick={this.resetClicked}>重置</Button>
              <Button type='primary' style={{ width: 100 }} className='margin-left20 yellow-btn' onClick={this.exportUrlClick}>导出</Button>
              <a ref="exportUrl" download="设备数据" style={{ 'display': "none" }} href={this.state.exportUrl} ></a>

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