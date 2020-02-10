import React, { Component } from "react";
import CommonPage from '../../components/common-page';
import { Table, Form, Input, Select, Col, Row, Spin, Icon, Button, DatePicker, Divider, Popconfirm, Radio, Modal, Checkbox, InputNumber, Upload } from "antd";
import { pagination } from '../../utils/pagination';
import Toast from '../../utils/toast';
import { SearchForm, SubmitForm } from '../../components/common-form';
import dateUtil from '../../utils/dateUtil';
import { searchWinningLogList, exportWinningLog, getWinningLogDetail, shipments, getExpressMerchantList } from '../../api/activity/activity';
import { NavLink, Link } from 'react-router-dom';
import { baseRoute, routerConfig } from '../../config/router.config';
import { connect } from 'react-redux';
import { changeRoute } from '../../store/actions/route-actions';
import { parseUrl } from '../../utils/urlUtils';
import { CopyToClipboard } from 'react-copy-to-clipboard';

const _description = "";
const _title = "中奖日志";
const StatusEnum = {
  '0': "未兑奖",
  '1': "未寄出",
  '2': "已寄出",
  '3': "已过期"
}

class Page extends Component {

  state = {
    tableDataList: null,
    showPageLoading: false,
    isReEdit: false,
    exportUrl: "",
    shipmentModalIsVisible: false,
    shipDetail: null,
    shipLoading: false,
    expressList: null,
    expressMerchantId: null
  }

  componentDidMount() {
    let urlParams = parseUrl(this.props.location.search);
    if (urlParams && urlParams.args && urlParams.args.type) {
      this.props.changeRoute({ path: 'marketManage.bigWheelRecord', title: _title, parentTitle: '营销工具' });
      let activityId = this.props.match.params.id;
      this.setState({
        activityId
      })
      this.getPageData(activityId);
      this.getExpressMerchantList();
    }
  }

  /************************************************************************************************************************** */
  params = {
    page: 1
  }

  getExpressMerchantList = () => {
    getExpressMerchantList()
      .then(expressList => {
        this.setState({
          expressList
        })
      })
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
  getPageData = (activityId) => {
    let _this = this;
    this.params.activityId = activityId || this.state.activityId;

    this._showTableLoading();
    searchWinningLogList(this.params).then(res => {
      this._hideTableLoading();

      let _pagination = pagination(res, (current) => {
        this.params.page = current
        _this.getPageData();
      }, (cur, pageSize) => {
        this.params.page = 1;
        this.params.size = pageSize;
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
    exportWinningLog(this.params)
  }

 

  /*****************************************************************************************************************************************/
  // 表格相关列
  columns = [
    { title: "活动编号", dataIndex: "activityId", render: data => data || "--" },
    { title: "活动名称", dataIndex: "activityName", render: data => data || "--" },
    { title: "中奖时间", dataIndex: "createTime", render: data => data ? dateUtil.getDateTime(data) : "--" },
    { title: "兑奖信息填写截止日期", dataIndex: "expiredTime", render: data => data ? dateUtil.getDateTime(data) : "--" },
    { title: "奖品级别", dataIndex: "prizeLevel", render: data => data || "--" },
    { title: "奖品名称", dataIndex: "prizeName", render: data => data || "--" },
    { title: "中奖会员", dataIndex: "attentionName", render: data => data || "--" },
    { title: "收货区域", dataIndex: "receiptArea", render: data => data || "--" },
    { title: "收货地址", dataIndex: "receiptAddress", render: data => data || "--" },
    { title: "收货人", dataIndex: "receiptMan", render: data => data || "--" },
    { title: "联系电话", dataIndex: "phone", render: data => data || "--" },
    {
      title: "状态", dataIndex: "status",
      render: data => (
        <span>
          {data == '0' ? <span className='color-red'>未兑奖</span> : null}
          {data == '1' ? <span className='color-yellow'>未寄出</span> : null}
          {data == '2' ? <span className='color-green'>已寄出</span> : null}
          {data == '3' ? <span className='color-gray'>已过期</span> : null}
        </span>
      )
    },
    {
      title: "操作", render: (text, record, index) => (
        <span>
          {record.status == '0' ? <span className='color-gray'>发货</span> : null}
          {record.status == '1' ? <a onClick={() => this.showShipmentModal(record, true)}>发货</a> : null}
          {record.status == '2' ? <a onClick={() => this.showShipmentModal(record, false)}>详情</a> : null}
          {record.status == '3' ? '--' : null}
        </span>
      )
    }
  ]

  goEditBack = () => {
    window.history.back();
  }

  saveDataClicked = () => {
    let params = this.props.form.getFieldsValue();

    let { time, inputData } = params;
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

  /**发货详情modal**************************************************************************************************************************/

  showShipmentModal = (record, shouldShipAction) => {

    let { id } = record;
    this.getDetail(id);
    this.setState({
      shipmentModalIsVisible: true,
      selectId: id
    })
  }

  _hideShipmentModal = () => {
    this.setState({
      shipmentModalIsVisible: false
    })
  }

  getDetail = (id) => {

    this.setState({
      shipLoading: true
    })

    getWinningLogDetail({ id })
      .then(shipDetail => {
        let expressMerchantId = null;
        let shipmentNumber = null;

        if (shipDetail && shipDetail.status == '2') {
          expressMerchantId = shipDetail.expressMerchantId;
          shipmentNumber = shipDetail.shipmentNumber;

        }
        this.setState({
          shipLoading: false,
          shipDetail,
          expressMerchantId,
          shipmentNumber
        })
      })
      .catch(() => {
        this.setState({
          shipLoading: false
        })
      })
  }

  onCopiedClicked = () => {
    this.setState({ copied: true });
    Toast("复制成功！")
  }

  onExpressMerchantIdChange = (expressMerchantId) => {
    this.setState({
      expressMerchantId
    })
  }

  onShipmentNumberChange = (e) => {
    let shipmentNumber = e.target.value;
    this.setState({
      shipmentNumber
    })
  }

  //发货
  shipmentsClicked = () => {
    let { expressMerchantId, shipmentNumber } = this.state;
    let id = null;
    if (this.state.shipDetail && this.state.shipDetail.id) {
      id = this.state.shipDetail.id;
    } else {
      return;
    }

    if (!expressMerchantId) {
      Toast("请选择物流公司！");
      return;
    }

    if (!shipmentNumber) {
      Toast("请输入物流单号！");
      return;
    }

    shipments({ id, expressMerchantId, shipmentNumber })
      .then(() => {
        Toast("发货成功！");
        this.setState({
          shipmentModalIsVisible: false,
          expressMerchantId: null,
          shipmentNumber: null
        });
        this.getPageData();
      })
  }

  /**渲染**********************************************************************************************************************************/

  render() {
    const { getFieldDecorator } = this.props.form;

    return (
      <CommonPage title={_title} description={_description} >
        <div>
          <div className='flex-between align-center margin-bottom'>
            <Button type='primary' style={{ width: 100 }} className='margin-right20 yellow-btn' onClick={this.goEditBack}>返回</Button>
            <div className='flex align-center'>
              <Form layout='inline'>
                <Form.Item
                  labelCol={{ span: 6 }}
                  wrapperCol={{ span: 18 }}
                  label='中奖时间：'
                  field='time'>
                  {
                    getFieldDecorator('time')(
                      <DatePicker.RangePicker />
                    )
                  }
                </Form.Item>
                <Form.Item
                  labelCol={{ span: 6 }}
                  wrapperCol={{ span: 18 }}
                  field='status'>
                  {
                    getFieldDecorator('status', {
                      initialValue: null
                    })(
                      <Select style={{ width: "100px" }}>
                        <Select.Option value={null}>全部</Select.Option>
                        <Select.Option value={'0'}>未兑奖</Select.Option>
                        <Select.Option value={'1'}>未寄出</Select.Option>
                        <Select.Option value={'2'}>已寄出</Select.Option>
                        <Select.Option value={'3'}>已过期</Select.Option>
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
                      <Input allowClear placeholder="收货人/收获区域/奖品" style={{ width: "200px" }} />
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

        <Modal
          maskClosable={false}
          title='填写物流单'
          visible={this.state.shipmentModalIsVisible}
          footer={null}
          onCancel={this._hideShipmentModal}
          width={600}
        >
          <Spin spinning={this.state.shipLoading}>
            {
              this.state.shipDetail ?
                <>
                  <div className='flex-middle'>
                    <div style={{ padding: "4px", border: "1px solid #ccc", borderRadius: "4px", marginRight: "20px" }}>
                      <img style={{ height: 60, width: 60 }} src={this.state.shipDetail.image} />
                    </div>
                    <div>
                      <div className='font-16 font-bold'>{this.state.shipDetail.prizeName}</div>
                      <div>中奖时间：{this.state.shipDetail.createTime ? dateUtil.getDateTime(this.state.shipDetail.createTime) : "--"}</div>
                      <div>兑奖时间：{this.state.shipDetail.updateTime ? dateUtil.getDateTime(this.state.shipDetail.updateTime) : "--"}</div>
                    </div>
                  </div>
                  <div className='line-height30 margin-top margin-left'>
                    <div className='font-14 font-bold'>收货信息</div>
                    <div>
                      <span className='margin-right'>{this.state.shipDetail.receiptArea}</span><span>{this.state.shipDetail.receiptAddress}</span>
                      <CopyToClipboard text={`${this.state.shipDetail.receiptArea}-${this.state.shipDetail.receiptAddress} `}
                        onCopy={() => { this.onCopiedClicked() }}>
                        <span className='color-red margin-left' style={{ cursor: "pointer" }}>复制</span>
                      </CopyToClipboard>
                    </div>
                    <div>
                      <span className='margin-right'>{this.state.shipDetail.receiptMan}</span><span>{this.state.shipDetail.phone}</span>
                      <CopyToClipboard text={`${this.state.shipDetail.receiptMan}-${this.state.shipDetail.phone}`}
                        onCopy={() => { this.onCopiedClicked() }}>
                        <span className='color-red margin-left' style={{ cursor: "pointer" }}>复制</span>
                      </CopyToClipboard>
                    </div>
                  </div>

                  <div className='line-height30 margin-top20 margin-left'>
                    <div className='font-14 font-bold'>发货信息</div>
                    <div className='flex-middle'>
                      <Select style={{ width: "160px" }} disabled={this.state.shipDetail.status == '2'} value={this.state.expressMerchantId} onChange={this.onExpressMerchantIdChange}>
                        <Select.Option value={null}>请选择</Select.Option>
                        {
                          this.state.expressList && this.state.expressList.length ?
                            this.state.expressList.map(item => (
                              <Select.Option key={item.id} value={item.id}>{item.name}</Select.Option>
                            ))
                            :
                            null
                        }
                      </Select>
                      <div className='margin-left'>
                        <Input disabled={this.state.shipDetail.status == '2'} placeholder='填写物流单号' value={this.state.shipmentNumber} onChange={this.onShipmentNumberChange} style={{ width: 240 }} />
                      </div>
                      {
                        this.state.shipDetail.status == '2' && this.state.shipmentNumber ?
                          <a
                            href={`https://m.kuaidi100.com/result.jsp?nu=${this.state.shipmentNumber}`}
                            className='margin-left'
                            target='_blank'
                          >
                            查看物流
                          </a>
                          :
                          null
                      }
                    </div>
                  </div>

                  <div className='flex-end padding-top20'>
                    {
                      this.state.shipDetail.status == '1' ? <Button type='primary' onClick={this.shipmentsClicked}>发货</Button> : null
                    }
                  </div>
                </>
                :
                null
            }
          </Spin>
        </Modal>
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