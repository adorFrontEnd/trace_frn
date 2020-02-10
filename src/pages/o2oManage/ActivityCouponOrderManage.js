import React, { Component } from "react";
import CommonPage from '../../components/common-page';
import { Table, Form, Input, Select, Col, Row, Icon, DatePicker, Button, Divider, Popconfirm, Radio, Modal, Checkbox, InputNumber, Upload } from "antd";
import { pagination } from '../../utils/pagination';
import Toast from '../../utils/toast';
import { SearchForm, SubmitForm } from '../../components/common-form';
import dateUtil from '../../utils/dateUtil';
import { searchBusinessOrderList, businessOrderCancel, businessOrderExport } from '../../api/activityCoupon/activityCoupon';
import numberFilter from '../../utils/filter/number';
import { isAdorPayOpened } from '../../api/setting/setting';
import { NavLink, Link } from 'react-router-dom';
import { baseRoute, routerConfig } from '../../config/router.config';
import { connect } from 'react-redux';
import { changeRoute } from '../../store/actions/route-actions';
import { parseUrl } from '../../utils/urlUtils';


const _NOW = Date.now();
const _title = "活动券订单";
const _description = "";
const activityCouponEditPath = routerConfig["o2oManage.activityCouponEdit"].path;
const merchantManagePath = routerConfig["o2oManage.merchantManage"].path;

class DealerList extends Component {

  state = {
    tableDataList: null,
    showTableLoading: false,
    openDrainageId: null,
    openDrainageSetting: null,
    hasO2OAuth: false
  }

  componentDidMount() {
    this.props.changeRoute({ path: 'marketManage.activityManage', title: _title, parentTitle: 'O2O管理' });
    this.getUrlData();
    this.getO2OAuth();
  }

  params = {
    page: 1
  }

  getO2OAuth = () => {
    isAdorPayOpened()
      .then(() => {
        this.setState({
          hasO2OAuth: true
        })
        this.getPageData();
      })
  }


  /******查询表单操作****************************************************************************************************************** */
  // 顶部查询表单
  //查询按钮点击事件

  searchClicked = () => {
    let params = this.props.form.getFieldsValue();

    let { startTime, finishTime, expireTime, serviceTime, ...paramsData } = params;
    let { startCreateTimeStamp, endCreateTimeStamp } = dateUtil.getTimeRangeByOneStamp(startTime, 'startCreateTimeStamp', 'endCreateTimeStamp');
    let { startFinishTimeStamp, endFinishTimeStamp } = dateUtil.getTimeRangeByOneStamp(finishTime, 'startFinishTimeStamp', 'endFinishTimeStamp');
    let { startExpireDateStamp, endExpireDateStamp } = dateUtil.getTimeRangeByOneStamp(expireTime, 'startExpireDateStamp', 'endExpireDateStamp');
    let { startServiceTimeStamp, endServiceTimeStamp } = dateUtil.getTimeRangeByOneStamp(serviceTime, 'startServiceTimeStamp', 'endServiceTimeStamp');

    this.params = {
      ...paramsData,
      startCreateTimeStamp, endCreateTimeStamp,
      startFinishTimeStamp, endFinishTimeStamp,
      startExpireDateStamp, endExpireDateStamp,
      startServiceTimeStamp, endServiceTimeStamp,
      page: 1
    }
    this.getPageData();
  }
  // 重置
  resetClicked = () => {
    this.props.form.resetFields();
  }

  getUrlData = () => {
    let urlParams = parseUrl(this.props.location.search);
    if (urlParams && urlParams.args && urlParams.args.number) {
      let number = urlParams.args.number;
      this.params.number = number;
    } else {
      this.params.number = null;
    }
  }

  // 获取页面列表
  getPageData = () => {

    let _this = this;
    this._showTableLoading();
    searchBusinessOrderList(this.params).then(res => {
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

  exportClicked = () => {
    businessOrderExport(this.params);
  }
  /**************************************************************************************** */
  // 表格相关列
  columns = [

    { title: "订单编号", dataIndex: "orderNo" },
    { title: "活动券主图", dataIndex: "mainImage", render: data => data ? <img src={data} style={{ width: 40, height: 40 }} /> : "--" },
    { title: "活动券名称", dataIndex: "couponName", render: data => data || "--" },
    { title: "活动券编号", dataIndex: "businessEventVoucherId", render: data => data || "--" },
    { title: "商家", render: (text, record, index) => record.businessName ? <span><NavLink to={merchantManagePath + "?id=" + record.businessId}>{record.businessName}</NavLink></span> : "--" },
    { title: "价格", dataIndex: "amount", render: data => (data || data == 0) ? numberFilter(data) : "--" },
    { title: "下单时间", dataIndex: "createTime", render: data => data ? dateUtil.getDate(data) : "--" },
    { title: "付款时间", dataIndex: "finishTime", render: data => data ? dateUtil.getDate(data) : "--" },
    { title: "服务时间", dataIndex: "serviceTime", render: data => data ? dateUtil.getDate(data) : "--" },
    { title: "过期时间", dataIndex: "expireDate", render: data => data ? dateUtil.getDate(data) : "--" },
    { title: "订单状态", dataIndex: "serviceStatusStr", render: data => data || "--" },
    { title: "会员信息", dataIndex: "nickname", render: data => data || "--" },

    {
      title: '操作',
      render: (text, record, index) => (
        <span>
          {
            record.serviceStatus == '1' ?
              <Popconfirm
                placement="topLeft" title='确认要取消订单吗？'
                onConfirm={() => { this.cancelOrderClick(record) }} >
                <a size="small" className="color-red">取消订单</a>
              </Popconfirm>
              :
              '--'
          }
        </span>
      )
    }
  ]

  cancelOrderClick = (record) => {
    let { id } = record;
    businessOrderCancel({ id })
      .then(() => {
        Toast("取消订单完毕！");
        this.getPageData();
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


  /**渲染**********************************************************************************************************************************/

  render() {
    const { getFieldDecorator } = this.props.form;

    return (
      <CommonPage title={_title} description={_description} >
        {
          this.state.hasO2OAuth ?
            <div>
              <div className='flex align-center margin-bottom20'>
                <Form layout='inline' >
                  <Row className='margin-bottom'>
                    <Col span={8} >
                      <Form.Item
                        field="startTime"
                        label='下单时间'
                        labelCol={{ span: 6 }}
                        wrapperCol={{ span: 18 }}
                      >
                        {
                          getFieldDecorator('startTime', {
                          })(
                            <DatePicker allowClear placeholder="下单时间" style={{ width: "200px" }} />
                          )
                        }
                      </Form.Item>
                    </Col>

                    <Col span={8}>
                      <Form.Item
                        field="finishTime"
                        label='付款时间'
                        labelCol={{ span: 6 }}
                        wrapperCol={{ span: 18 }}
                      >
                        {
                          getFieldDecorator('finishTime', {
                          })(
                            <DatePicker allowClear placeholder="付款时间" style={{ width: "200px" }} />
                          )
                        }
                      </Form.Item>
                    </Col>

                    <Col span={8}>
                      <Form.Item
                        field="serviceTime"
                        label='服务时间'
                        labelCol={{ span: 6 }}
                        wrapperCol={{ span: 18 }}
                      >
                        {
                          getFieldDecorator('serviceTime', {
                          })(
                            <DatePicker allowClear placeholder="服务时间" style={{ width: "200px" }} />
                          )
                        }
                      </Form.Item>
                    </Col>
                  </Row>

                  <Row className='margin-bottom'>
                    <Col span={8}>
                      <Form.Item
                        field="expireTime"
                        label='过期时间'
                        labelCol={{ span: 6 }}
                        wrapperCol={{ span: 18 }}
                      >
                        {
                          getFieldDecorator('expireTime', {
                          })(
                            <DatePicker allowClear placeholder="过期时间" style={{ width: "200px" }} />
                          )
                        }
                      </Form.Item>
                    </Col>

                    <Col span={8}>
                      <Form.Item
                        field="serviceStatus"
                        label='订单：'
                        labelCol={{ span: 6 }}
                        wrapperCol={{ span: 18 }}
                      >
                        {
                          getFieldDecorator('serviceStatus', {
                            initialValue: null
                          })(
                            <Select style={{ width: 200 }}>
                              <Select.Option value={null}>全部订单</Select.Option>
                              <Select.Option value={1}>待付款</Select.Option>
                              <Select.Option value={2}>待服务(已付款)</Select.Option>
                              <Select.Option value={3}> 已完成</Select.Option>
                              <Select.Option value={4}>已取消</Select.Option>
                              <Select.Option value={5}>已过期</Select.Option>
                            </Select>
                          )
                        }
                      </Form.Item>
                    </Col>

                    <Col span={8}>
                      <Form.Item
                        field="inputData"

                        labelCol={{ span: 6 }}
                        wrapperCol={{ span: 18 }}
                      >
                        {
                          getFieldDecorator('inputData', {
                          })(
                            <Input placeholder='券商名称/券商编号/订单号' allowClear style={{ width: 240 }} />
                          )
                        }
                      </Form.Item>
                    </Col>
                  </Row>

                  <Form.Item>
                    <Button type='primary' className='normal margin0-20' onClick={() => { this.searchClicked() }}>查询</Button>
                    <Button className='normal' onClick={this.resetClicked}>重置</Button>
                    <Button className='normal yellow-btn margin-left20' onClick={this.exportClicked}>导出</Button>
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
            :
            <div className='line-height40 padding text-center font-20'>
              暂无O2O管理权限，请开启爱朵钱包
            </div>
        }
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