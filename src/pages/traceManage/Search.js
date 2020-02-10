import React, { Component } from "react";
import CommonPage from '../../components/common-page';
import { Table, Form, Input, Select, Tabs, Col, Row, Icon, Radio, Button, Divider, Popconfirm, Modal, Checkbox, InputNumber } from "antd";
import { pagination } from '../../utils/pagination';
import Toast from '../../utils/toast';
import { SearchForm, SubmitForm } from '../../components/common-form';
import { searchTraceSourceList, queryTrace } from '../../api/trace/trace';
import dateUtil from '../../utils/dateUtil';
import SearchLog from './SearchLog';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import './search.less';
const { TabPane } = Tabs;
const _title = "溯源查询";
const _description = "";

class Page extends Component {

  state = {
    trayModalIsVisible: false,
    traceInfo: null,
    priceCheck: null,
    priceModalIsVisible: false,
    price: null,
    copied: false
  }



  onTabsChange = (e) => {
    if (e == "2") {
      this.setState({
        updateSearchLogTime: Date.now()
      })
    }
  }

  traceSearchClicked = () => {
    this.props.form.validateFields((err, data) => {
      if (err) {
        return;
      }
      if (data.uniqueCode.length < 21) {
        Toast("请输入至少21位唯一码")
        return;
      }
      queryTrace(data)
        .then(res => {
          if (res && res.priceCheck == '1') {
            let { uniqueCode } = data;
            this.setState({
              priceCheck: 1,
              priceModalIsVisible: true,
              uniqueCode
            })
          } else {
            this.setState({
              traceInfo: res
            })
          }

        })
    })
  }

  priceModalConfirmClicked = () => {
    let price = this.state.price;
    if (!price) {
      Toast("请输入价格！");
      return;
    }
    this._hidePriceModal();
    let { uniqueCode, priceCheck } = this.state;
    if (priceCheck == 1) {
      let params = {
        uniqueCode,
        price
      }
      queryTrace(params)
        .then(res => {
          this.setState({
            traceInfo: res,
            price: null
          })
        })
    }
  }

  showPriceModal = () => {
    this.setState({
      priceModalIsVisible: true
    })
  }

  _hidePriceModal = () => {
    this.setState({
      priceModalIsVisible: false
    })
  }

  onPriceChange = (price) => {

    this.setState({
      price
    })
  }

  onCopiedClicked = () => {
    this.setState({ copied: true });
    Toast("复制成功！")
  }
  /**渲染**********************************************************************************************************************************/

  render() {
    const { getFieldDecorator } = this.props.form;
    return (
      <CommonPage title={_title} description={_description} >
        <Tabs type="card" onChange={this.onTabsChange}>
          <TabPane tab="溯源查询" key="1">
            <div style={{ width: 500, paddingLeft: "20px" }}>
              <Form layout='inline'>
                <Form.Item
                  key='uniqueCode'
                  field='uniqueCode'>
                  {
                    getFieldDecorator('uniqueCode', {
                      rules: [
                        { required: true, message: '请输入需要查询的唯一码!' }
                      ]
                    })(
                      <Input allowClear style={{ width: "300px" }} placeholder='请输入需要查询的唯一码' min={0} max={99999999} />
                    )
                  }

                </Form.Item>
                <Form.Item>
                  <Button onClick={this.traceSearchClicked} type='primary' style={{ width: 100 }}>查询</Button>
                </Form.Item>
              </Form>
              {
                this.state.traceInfo ?
                  <div className='line-height30 margin-top20 padding20' style={{ minWidth: 360, backgroundColor: "#f2f2f2", borderRadius: "4px" }}>
                    <div className='font-bold font-18'>溯源信息</div>

                    <div className='flex-between'><span>价格信息:</span><span className='font-bold'>{this.state.traceInfo.priceData || '--'}</span></div>

                    <div className='font-bold font-16 margin-bottom'>经销商</div>

                    <div className='padding-left'>
                      {
                        this.state.traceInfo.schedule.map((item, index) => (
                          <div key={item.name}>
                            <div className='flex-between align-center line-height20'>
                              <div className='flex'>
                                <div style={{ height: 20, width: 20, borderRadius: "50%", backgroundColor: "#0099FF" }}></div>
                                <div className='padding-left font-bold'>{item.name} </div>
                              </div>
                              <div className='flex'>
                                {
                                  item.trackingDetail ?
                                    <div className='flex'>
                                      <div className='padding-left margin-right'>{item.trackingDetail} </div>
                                      <CopyToClipboard text={item.trackingDetail}
                                        onCopy={() => { this.onCopiedClicked() }}>
                                        <span className='color-gray' style={{ cursor: "pointer" }}>复制单号</span>
                                      </CopyToClipboard>
                                    </div> : null
                                }
                              </div>
                            </div>
                            <pre className={index == this.state.traceInfo.schedule.length - 1 ? "pre-detail last" : "pre-detail"}> {item.detail} </pre>
                          </div>
                        ))
                      }
                    </div>
                  </div>
                  : null
              }

            </div>
            <div className='color-red margin-top padding-left20' style={{ width: 500 }}>

              使用说明：<br />

              1、查询中如果需要输入价格区间，请根据您够得商品的真实情况如实填写；<br />

              2、如果价格不在合理区间内，请谨防供应链、经销商中出现乱价行为。<br />
            </div>
          </TabPane>
          <TabPane tab="查询记录" key="2">
            <SearchLog updateTime={this.state.updateSearchLogTime}></SearchLog>
          </TabPane>
        </Tabs>

        <a ref="exportUrl" download="工单数据" style={{ 'display': "none" }} href={this.state.exportUrl} ></a>
        <Modal maskClosable={false}
          title="输入价格"
          visible={this.state.priceModalIsVisible}
          onCancel={this._hidePriceModal}
          onOk={this.priceModalConfirmClicked}
        >
          <Form>
            <Form.Item
              key='price'
              field='price'>
              <InputNumber value={this.state.price} onChange={this.onPriceChange} style={{ width: "100%" }} placeholder='请输入价格（可不填）' precision={2} min={0} max={99999999} />
            </Form.Item>
          </Form>

        </Modal>
      </CommonPage >
    )
  }
}

export default Form.create()(Page);