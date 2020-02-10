import React, { Component } from "react";
import CommonPage from '../../components/common-page';
import { Table, Form, Input, Select, Col, Row, Icon, DatePicker, Button, Divider, Popconfirm, Radio, Modal, Checkbox, InputNumber, Upload } from "antd";
import { pagination } from '../../utils/pagination';
import Toast from '../../utils/toast';
import { SearchForm, SubmitForm } from '../../components/common-form';
import dateUtil from '../../utils/dateUtil';
import { searchBusinessList, getMerchantDetail, saveOrUpdate,updateBusinessStatus } from '../../api/merchant/merchant';
import { isAdorPayOpened } from '../../api/setting/setting';
import { NavLink, Link } from 'react-router-dom';
import { baseRoute, routerConfig } from '../../config/router.config';
import { connect } from 'react-redux';
import { changeRoute } from '../../store/actions/route-actions';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { parseUrl } from '../../utils/urlUtils';



const _NOW = Date.now();
const _title = "商家管理";
const _description = "";
const merchantEditPath = routerConfig["o2oManage.merchantEdit"].path;
const couponListPath = routerConfig["o2oManage.activityCouponManage"].path;


class DealerList extends Component {

  state = {
    tableDataList: null,
    showTableLoading: false,
    exportUserListUrl: null,
    openDrainageId: null,
    openDrainageSetting: null,
    copied: false,
    hasO2OAuth: false
  }

  componentDidMount() {
    this.props.changeRoute({ path: 'marketManage.activityManage', title: _title, parentTitle: 'O2O管理' });
    this.getO2OAuth();
    this.getUrlId();

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

  getUrlId = () => {
    let urlParams = parseUrl(this.props.location.search);
    if (urlParams && urlParams.args && urlParams.args.id) {
      let id = urlParams.args.id;
      this.params = {
        ...this.params,
        id
      }
    }
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


  // 获取页面列表
  getPageData = () => {
    let _this = this;
    this._showTableLoading();
    searchBusinessList(this.params).then(res => {
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
    updateBusinessStatus({ id, status: "1" })
      .then(() => {
        Toast("启用成功！");
        this.getPageData();

      })
  }

  stopUseAct = (record) => {
    let { id } = record;
    updateBusinessStatus({ id, status: "0" })
      .then(() => {
        Toast("禁用成功！");
        this.getPageData();

      })
  }

  onCopiedClicked = () => {
    this.setState({ copied: true });
    Toast("复制成功！")
  }
  /**************************************************************************************** */
  // 表格相关列
  columns = [

    { title: "商家编号", dataIndex: "number" },
    { title: "商家名称", dataIndex: "name", render: data => data || "--" },
    { title: "联系电话", dataIndex: "phone", render: data => data || "--" },
    { title: "商家状态", dataIndex: "status", render: data => data == '1' ? <span className='color-blue'>启用</span> : <span className='color-gray'>禁用</span> },
    { title: "创建时间", dataIndex: "createTime", render: data => dateUtil.getDate(data) || "--" },
    {
      title: '操作',
      render: (text, record, index) => (
        <span>
          <span><NavLink to={merchantEditPath + "?id=" + record.id}>编辑</NavLink></span>
          <Divider type="vertical" />
          <span><NavLink to={couponListPath + "?businessId=" + record.id}>活动券管理</NavLink></span>
          <Divider type="vertical" />
          <CopyToClipboard text={`http://h5.trace.adorsmart.com/frontEnd/inquireIndex?id=${record.id}`}
            onCopy={() => { this.onCopiedClicked() }}>
            <span className='color-blue margin-left' style={{ cursor: "pointer" }}>复制核实链接</span>
          </CopyToClipboard>
          {
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
          }

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
    // deleteActivity({ id })
    //   .then(() => {
    //     Toast('删除成功！');
    //     this.getPageData();
    //   })
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
              <div className='flex-between align-center margin-bottom20'>
                <NavLink to={merchantEditPath}>
                  <Button type='primary' icon='plus' className='margin-left20' >创建商家</Button>
                </NavLink>
                <Form layout='inline'>
                  <Form.Item
                    field="inputData"

                  >
                    {
                      getFieldDecorator('inputData', {
                      })(
                        <Input allowClear placeholder="券商名称/券商编号/联系电话/服务区域" style={{ width: "300px" }} />
                      )
                    }
                  </Form.Item>
                  <Form.Item>
                    <Button type='primary' className='normal margin0-20' onClick={() => { this.searchClicked() }}>查询</Button>
                    <Button className='normal' onClick={this.resetClicked}>重置</Button>
                  </Form.Item>
                </Form>
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