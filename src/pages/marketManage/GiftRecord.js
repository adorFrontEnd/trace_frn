import React, { Component } from "react";
import CommonPage from '../../components/common-page';
import { Table, Form, Input, Select, Col, Row, Icon, Button, DatePicker, Divider, Popconfirm, Radio, Modal, Checkbox, InputNumber, Upload } from "antd";
import { pagination } from '../../utils/pagination';
import Toast from '../../utils/toast';
import { SearchForm, SubmitForm } from '../../components/common-form';
import dateUtil from '../../utils/dateUtil';
import { searchWriteOffLogList, getAttentionDetail, exportWriteOffLog } from '../../api/activity/activity';
import { NavLink, Link } from 'react-router-dom';
import { baseRoute, routerConfig } from '../../config/router.config';
import { connect } from 'react-redux';
import { changeRoute } from '../../store/actions/route-actions';

const _title = "兑奖记录";
const _description = "";

class DealerList extends Component {

  state = {
    tableDataList: null,
    showTableLoading: false,
    attentionDetail: null,
    exportUrl: null,
    integral:null
  }

  componentDidMount() {
    this.props.changeRoute({ path: 'marketManage.integralRecord', title: _title, parentTitle: '营销工具' });
    let attentionId = this.props.match.params.id;
    this.setState({
      attentionId
    })
    this.getPageData(attentionId);
    this._getAttentionDetail(attentionId); 
  }

  params = {
    page: 1,
    type: 1
  }

  // 获取页面列表
  getPageData = (attentionId) => {
    attentionId = attentionId || this.state.attentionId;
    let _this = this;
    this._showTableLoading();
    this.params = { ...this.params, attentionId };
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

  // 表格相关列
  columns = [

    { title: "参与活动", dataIndex: "activityName", render: data => data || "--" },
    { title: "核销码", dataIndex: "writeOffCode", render: data => data || "--" },
    { title: "兑换门店（经销商）", dataIndex: "storeName", render: data => data || "--" },
    { title: "兑换门店ID（经销商）", dataIndex: "storeId", render: data => data || "--" },
    { title: "兑换商品", dataIndex: "exchangeProductName", render: data => data || "--" },
    { title: "商品条码", dataIndex: "exchangeProductBarCode", render: data => data || "--" },
    { title: "兑换时间", dataIndex: "writeOffCodeCreateTime", render: data => dateUtil.getDateTime(data) || "--" }
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

  goEditBack = () => {
    window.history.back();
  }

  saveDataClicked = () => {
    let params = this.props.form.getFieldsValue();

    let { time, inputData } = params;
    if (time && time.length) {
      let [startTime, stopTime] = time;
      let startWriteOffCodeCreateTimeStamp = dateUtil.getDayStartStamp(Date.parse(startTime));
      let endWriteOffCodeCreateTimeStamp = dateUtil.getDayStopStamp(Date.parse(stopTime));
      this.params = {
        ...this.params,
        ...params,
        type: 1,
        startWriteOffCodeCreateTimeStamp,
        endWriteOffCodeCreateTimeStamp,
        time: null
      }
    } else {
      this.params = {
        ...this.params,
        ...params
      }
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
                  <div>（会员编号：{this.state.attentionDetail.id}）</div>
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
                      <Input allowClear placeholder="兑换码/门店ID/门店名称/兑换商品/商品条码" style={{ width: "200px" }} />
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