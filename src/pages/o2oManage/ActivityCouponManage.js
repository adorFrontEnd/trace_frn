import React, { Component } from "react";
import CommonPage from '../../components/common-page';
import { Table, Form, Input, Select, Col, Row, Icon, DatePicker, Button, Divider, Popconfirm, Radio, Modal, Checkbox, InputNumber, Upload } from "antd";
import { pagination } from '../../utils/pagination';
import Toast from '../../utils/toast';
import { SearchForm, SubmitForm } from '../../components/common-form';
import dateUtil from '../../utils/dateUtil';
import { searchBusinessEventVoucherList, updateStatus } from '../../api/activityCoupon/activityCoupon';
import { NavLink, Link } from 'react-router-dom';
import { baseRoute, routerConfig } from '../../config/router.config';
import { connect } from 'react-redux';
import { changeRoute } from '../../store/actions/route-actions';
import numberFilter from '../../utils/filter/number';
import { parseUrl } from '../../utils/urlUtils';
import { isAdorPayOpened } from '../../api/setting/setting';

const _NOW = Date.now();
const _title = "活动券管理";
const _description = "";
const activityCouponEditPath = routerConfig["o2oManage.activityCouponEdit"].path;
const activityCouponOrderPath = routerConfig["o2oManage.activityCouponOrderManage"].path;
const merchantManagePath = routerConfig["o2oManage.merchantManage"].path;


class DealerList extends Component {

  state = {
    tableDataList: null,
    showTableLoading: false,
    exportUserListUrl: null,
    openDrainageId: null,
    openDrainageSetting: null,
    hasO2OAuth: false

  }

  componentDidMount() {
    this.props.changeRoute({ path: 'marketManage.activityManage', title: _title, parentTitle: 'O2O管理' });
    this.getBusinessId();
    this.getO2OAuth();
  }

  params = {
    page: 1
  }

  getBusinessId = () => {
    let urlParams = parseUrl(this.props.location.search);
    if (urlParams && urlParams.args && urlParams.args.businessId) {
      let businessId = urlParams.args.businessId;
      this.params = {
        ...this.params,
        businessId
      }
    }
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
    searchBusinessEventVoucherList(this.params).then(res => {
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
    updateStatus({ id, status: "1" })
      .then(() => {
        Toast("上架成功！");
        this.getPageData();
      })
  }

  stopUseAct = (record) => {
    let { id } = record;
    updateStatus({ id, status: "0" })
      .then(() => {
        Toast("下架成功！");
        this.getPageData();
      })
  }

  getShowBuyNumber = (record) => {
    let { saleNumber, salesBase } = record;
    return saleNumber ? parseInt(salesBase) + parseInt(saleNumber) : parseInt(salesBase);
  }
  /**************************************************************************************** */
  // 表格相关列
  columns = [

    { title: "活动券编号", dataIndex: "number" },
    { title: "主图", dataIndex: "mainImage", render: data => data ? <img src={data} style={{ width: 40, height: 40 }} /> : "--" },
    { title: "活动券名称", dataIndex: "name", render: data => data || "--" },
    { title: "商家", render: (text, record, index) => record.businessName ? <span><NavLink to={merchantManagePath + "?id=" + record.businessId}>{record.businessName}</NavLink></span> : "--" },
    { title: "活动券价格", dataIndex: "price", render: data => (data || data == 0) ? numberFilter(data) : "--" },
    { title: "库存", dataIndex: "stock", render: data => (data || data == 0) ? data : "--" },
    { title: "活动券实际购买人数", dataIndex: "saleNumber", render: data => (data || data == 0) ? data : "--" },
    { title: "活动券展示购买基数", dataIndex: "salesBase", render: data => (data || data == 0) ? data : "--" },
    { title: "活动券展示购买数", render: (text, record, index) => this.getShowBuyNumber(record) },
    { title: "创建时间", dataIndex: "createTime", render: data => dateUtil.getDateTime(data) || "--" },
    {
      title: '操作',
      render: (text, record, index) => (
        <span>
          <span><NavLink to={activityCouponEditPath + "?id=" + record.id}>编辑</NavLink></span>
          <Divider type="vertical" />
          <span ><NavLink to={activityCouponOrderPath + "?number=" + record.number}>订单管理</NavLink></span>
        </span>
      )
    },
    {
      title: "状态", dataIndex: "status", render: data => data == '0' ?
        <span className='color-red'>已下架</span>
        :
        <span>
          {
            data == '1' ?
              <span className='color-green'>已上架</span>
              :
              <span className='color-red'>缺货</span>
          }
        </span>
    },


    {
      title: '上架/下架',
      render: (text, record, index) => (
        <span>
          {
            record.status == '0' ?
              <Popconfirm
                placement="topLeft" title='确认要上架吗？'
                onConfirm={() => { this.startUseAct(record) }}
              >
                <a>上架</a>
              </Popconfirm>
              :
              <Popconfirm
                placement="topLeft" title='确认要下架吗？'
                onConfirm={() => { this.stopUseAct(record) }}
              >
                <a>下架</a>
              </Popconfirm>
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


  /**渲染**********************************************************************************************************************************/

  render() {
    const { getFieldDecorator } = this.props.form;

    return (
      <CommonPage title={_title} description={_description} >
        {
          this.state.hasO2OAuth ?
            <div>
              <div className='flex-between align-center margin-bottom20'>
                <NavLink to={activityCouponEditPath}>
                  <Button type='primary' icon='plus' className='margin-left20' >创建活动券</Button>
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