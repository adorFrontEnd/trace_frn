import React, { Component } from "react";
import CommonPage from '../../components/common-page';
import { Table, Form, Input, Select, Col, Row, Icon, DatePicker, Button, Divider, Popconfirm, Radio, Modal, Checkbox, InputNumber, Upload } from "antd";
import { pagination } from '../../utils/pagination';
import Toast from '../../utils/toast';
import { SearchForm, SubmitForm } from '../../components/common-form';
import dateUtil from '../../utils/dateUtil';
import { searchActivityList, deleteActivity, saveOrUpdate as saveOrUpdateActivity } from '../../api/activity/activity';
import { NavLink, Link } from 'react-router-dom';
import { baseRoute, routerConfig } from '../../config/router.config';
import { connect } from 'react-redux';
import { changeRoute } from '../../store/actions/route-actions';
import { getDetail, saveOrUpdate as saveOrUpdateDrainage } from '../../api/setting/drainage';

const _NOW = Date.now();
const _title = "活动列表";
const _description = "";
const activityEditPath = routerConfig["marketManage.activityEdit"].path;
const prizeConfigPath = routerConfig["marketManage.prizeConfig"].path;
const writeOffLogPath = routerConfig["marketManage.writeOffLog"].path;
const integralLogPath = routerConfig["marketManage.integralLog"].path;
const bigWheelRecordPath = routerConfig["marketManage.bigWheelRecord"].path;
const settingDrainagePath = routerConfig["setting.drainage"].path;
//

const sexEnum = {
  "1": "男", "2": "女", "0": "未知"
}

const activityTypeEnum = {
  "0": "满赠活动",
  "1": "积分活动",
  "2": "大转盘"
}
class DealerList extends Component {

  state = {
    tableDataList: null,
    showTableLoading: false,
    exportUserListUrl: null,
    openDrainageId: null,
    openDrainageSetting: null
  }

  componentDidMount() {
    this.props.changeRoute({ path: 'marketManage.activityManage', title: _title, parentTitle: '市场营销' });
    this.getDrainageSetting();
  }

  params = {
    page: 1
  }

  /******查询表单操作****************************************************************************************************************** */
  // 顶部查询表单
  //查询按钮点击事件

  searchClicked = () => {
    let params = this.props.form.getFieldsValue();

    let { time, type, inputData } = params;
    if (time && time.length) {
      let [startTime, stopTime] = time;
      let startActivityTimeStamp = startTime ? dateUtil.getDayStartStamp(Date.parse(startTime)) : null;
      let endActivityTimeStamp = stopTime ? dateUtil.getDayStopStamp(Date.parse(stopTime)) : null;
      this.params = {
        ...params,
        startActivityTimeStamp,
        endActivityTimeStamp,
        time: null
      }
    } else {
      this.params = params;
    }
    this.getPageData();
  }
  // 重置
  resetClicked = () => {
    this.props.form.resetFields();
  }

  getDrainageSetting = () => {
    getDetail()
      .then(pageData => {

        if (!pageData) {
          return;
        }

        let { openDrainageSetting, id } = pageData;

        if (openDrainageSetting == '1') {
          this.getPageData();
        }
        this.setState({
          openDrainageSetting,
          openDrainageId: id
        })

      })
  }


  openDrainageSettingClick = () => {

    let openDrainageSetting = "1";
    let id = this.state.openDrainageId;

    saveOrUpdateDrainage({ openDrainageSetting, id })
      .then(() => {
        Toast("开启引流成功!");
        this.getDrainageSetting();
      })
  }

  // 获取页面列表
  getPageData = () => {
    let _this = this;
    this._showTableLoading();
    searchActivityList(this.params).then(res => {
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

  startUseAct = (record) => {
    let { id } = record;
    saveOrUpdateActivity({ id, status: "1" })
      .then(() => {
        Toast("启用成功！");
        this.getPageData();

      })
  }

  stopUseAct = (record) => {
    let { id } = record;
    saveOrUpdateActivity({ id, status: "0" })
      .then(() => {
        Toast("禁用成功！");
        this.getPageData();

      })

  }
  /**************************************************************************************** */
  // 表格相关列
  columns = [

    { title: "活动编号", dataIndex: "id" },
    { title: "活动名称", dataIndex: "name", render: data => data || "--" },
    { title: "活动描述", dataIndex: "description", render: data => data || "--" },
    // 0满赠活动 1积分活动 2大转盘
    { title: "活动类型", dataIndex: "type", render: data => data || data == '0' ? activityTypeEnum[data] : "--" },
    { title: "活动区域", dataIndex: "areaName", render: data => data || "--" },
    { title: "活动状态", dataIndex: "status", render: data => data == '1' ? <span className='color-blue'>启用</span> : <span className='color-gray'>禁用</span> },
    { title: "开始时间", dataIndex: "startActivityTime", render: data => dateUtil.getDate(data) || "--" },
    { title: "结束时间", dataIndex: "endActivityTime", render: data => dateUtil.getDate(data) || "--" },
    {
      title: '操作',
      render: (text, record, index) => (
        <span>
          <span><NavLink to={activityEditPath + "/" + record.id}>编辑</NavLink></span>
          <Divider type="vertical" />
          <span ><NavLink to={prizeConfigPath + "/" + record.id + `?type=${record.type}`}>奖励</NavLink></span>
          <Divider type="vertical" />
          {
            record.type == '0' ?
              <span ><NavLink to={writeOffLogPath + "/" + record.id + `?type=0`}>核销</NavLink></span>
              :
              null
          }
          {
            record.type == '1' ?
              <span ><NavLink to={integralLogPath + "/" + record.id + `?type=1`}>日志</NavLink></span>
              :
              null
          }
          {
            record.type == '2' ?
              <span ><NavLink to={bigWheelRecordPath + "/" + record.id + `?type=2`}>日志</NavLink></span>
              :
              null
          }

          {/* {
            record.endActivityTime > _NOW ?
              <span>
                <Divider type="vertical" />
                <Popconfirm
                  placement="topLeft" title='确认要删除吗？'
                  onConfirm={() => { this.deleteTableItem(record) }} >
                  <a size="small" className="color-red">删除</a>
                </Popconfirm>
              </span>
              : null
          } */}

        </span>
      )
    },
    {
      title: '启用/禁用',
      render: (text, record, index) => (
        <span>
          {
            record.status == '0' ?
              <Popconfirm
                placement="topLeft" title='确认要启用吗？'
                onConfirm={() => { this.startUseAct(record) }}
              >
                <a>启用</a>
              </Popconfirm>
              :
              <Popconfirm
                placement="topLeft" title='确认要禁用吗？'
                onConfirm={() => { this.stopUseAct(record) }}
              >
                <a>禁用</a>
              </Popconfirm>
          }
        </span>
      )
    }
  ]

  deleteTableItem = (record) => {
    let { id } = record;
    deleteActivity({ id })
      .then(() => {
        Toast('删除成功！');
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
          this.state.openDrainageSetting == '1' ?
            <div>
              <div className='flex-between align-center margin-bottom20'>
                <Form layout='inline'>
                  <Form.Item
                    labelCol={{ span: 6 }}
                    wrapperCol={{ span: 18 }}
                    label='活动时间：'
                    field='time'>
                    {
                      getFieldDecorator('time')(
                        <DatePicker.RangePicker />
                      )
                    }
                  </Form.Item>

                  <Form.Item
                    field="type"
                    label='活动类型：'
                  >
                    {
                      getFieldDecorator('type', {
                      })(
                        <Select style={{ width: 130 }} placeholder='选择活动类型'>
                          <Select.Option value="0">满赠活动</Select.Option>
                          <Select.Option value="1">积分活动</Select.Option>
                          <Select.Option value="2">大转盘</Select.Option>
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
                        <Input allowClear placeholder="活动编号/活动名称/活动描述" style={{ width: "240px" }} />
                      )
                    }
                  </Form.Item>
                </Form>
                <div style={{ minWidth: 370 }}>
                  <Button type='primary' className='normal margin0-20' onClick={() => { this.searchClicked() }}>查询</Button>
                  <Button className='normal' onClick={this.resetClicked}>重置</Button>
                  <NavLink to={activityEditPath + "/0"}>
                    <Button type='primary' icon='plus' className='margin-left20' >新增活动</Button>
                  </NavLink>
                </div>
              </div>

              <a ref="exportUserListUrl" download="设备数据" style={{ 'display': "none" }} href={this.state.exportUserListUrl} ></a>
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
            null
        }
        {
          this.state.openDrainageSetting == '0' ?
            <div className='middle-center' style={{ height: "100%" }}>
              <div className='line-height30' style={{ fontSize: 16, textAlign: "center" }}>
                <div>请先开启公众号引流</div>
                <div>再查看活动</div>
                <NavLink to={settingDrainagePath}>
                  <Button className='margin-top' type='primary'>马上开启</Button>
                </NavLink>
              </div>
            </div>
            : null
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