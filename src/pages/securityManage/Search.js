import React, { Component } from "react";
import CommonPage from '../../components/common-page';
import { Table, Form, Input, Select, Tabs, Col, Row, Icon, Radio, Button, Divider, Popconfirm, Modal, Checkbox, InputNumber } from "antd";
import { pagination } from '../../utils/pagination';
import Toast from '../../utils/toast';
import { SearchForm, SubmitForm } from '../../components/common-form';
import { searchTraceSourceList, querySecurity } from '../../api/security/security';
import dateUtil from '../../utils/dateUtil';
import SearchLog from './SearchLog';
const { TabPane } = Tabs;
const _title = "防伪查询";
const _description = "";

class Page extends Component {

  state = {
    trayModalIsVisible: false,
    resultData: null,
    securityCodeCheck: null,
    securityVerificationCodeNumber: null,
    pageData: null
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


      let { securityVerificationCodeNumber, uniqueCode } = data;
      if (uniqueCode && uniqueCode.toString().length < 20) {
        Toast('请输入至少20位防伪码！');
        return;
      }

      querySecurity(data)
        .then(pageData => {

          if (pageData && pageData.securityCodeCheck && pageData.securityCodeCheck == '1') {
            this.setState({
              securityCodeCheck: "1",
              securityCodeModalIsVisible: true,
              uniqueCode
            })


          } else {
            this.setState({
              securityCodeCheck: "0",
              pageData
            })
          }
        })
    })
  }


  showSecurityCodeModal = () => {
    this.setState({
      securityCodeModalIsVisible: true
    })
  }

  _hideSecurityCodeModal = () => {
    this.setState({
      securityCodeModalIsVisible: false
    })
  }

  onSecCodeChange = (e) => {
    let securityVerificationCodeNumber = e.currentTarget.value;

    this.setState({
      securityVerificationCodeNumber
    })
  }


  secCodeModalConfirmClicked = () => {
    let securityVerificationCodeNumber = this.state.securityVerificationCodeNumber;
    if (securityVerificationCodeNumber && securityVerificationCodeNumber.toString().length != 6) {
      Toast('请输入6位验证码！');
      return;
    }

    this._hideSecurityCodeModal();
    let { uniqueCode, securityCodeCheck } = this.state;
    if (securityCodeCheck == "1") {
      let params = {
        uniqueCode,
        securityVerificationCodeNumber
      }
      querySecurity(params)
        .then(res => {
          this.setState({
            pageData: res,
            securityVerificationCodeNumber: null
          })
        })
    }
  }

  /**渲染**********************************************************************************************************************************/

  render() {
    const { getFieldDecorator } = this.props.form;
    return (
      <CommonPage title={_title} description={_description} >
        <Tabs type="card" onChange={this.onTabsChange}>
          <TabPane tab="防伪查询" key="1">
            <div style={{ width: 500, paddingLeft: "20px" }}>
              <Form layout='inline'>
                <Form.Item
                  key='uniqueCode'
                  field='uniqueCode'>
                  {
                    getFieldDecorator('uniqueCode', {
                      rules: [
                        { required: true, message: '请输入唯一码!' }
                      ]
                    })(
                      <Input style={{ width: "300px" }} placeholder='请输入唯一码' min={0} max={99999999} />
                    )
                  }
                </Form.Item>
                <Form.Item> <Button onClick={this.traceSearchClicked} type='primary' style={{ width: 100 }}>查询</Button></Form.Item>

              </Form>

            </div>
            {
              this.state.pageData ?
                <div className='line-height30 margin-top20 padding20' style={{ width: 400, backgroundColor: "#f2f2f2", borderRadius: "4px" }}>
                  <div className='font-bold font-18 margin-bottom'>防伪结果</div>
                  <div className='line-height20 margin-bottom'>商品真伪：<span className='color-blue margin-left20'>{this.state.pageData.genuine}</span></div>
                  <div className='line-height20 color-blue margin-bottom'>{this.state.pageData.resultData}</div>
                  {
                    this.state.pageData.productVo ?
                      <div className='flex line-height20 margin-bottom20'>
                        <div className='margin-right'>
                          <img src={this.state.pageData.productVo.image} style={{ height: "100px", width: "100px" }} />
                        </div>
                        <div className='flex-column flex-between'>
                          <div>
                            <div className='font-bold'>商品名称：{this.state.pageData.productVo.name}</div>
                            <div className='font-bold'>&emsp;&emsp;规格：{this.state.pageData.productVo.specification}</div>
                          </div>
                          <div>
                            <div className='font-bold'>&emsp;生产商：{this.state.pageData.productVo.manufacturer}</div>
                            <div className='font-bold'>生产日期：{dateUtil.getDateTime(this.state.pageData.productVo.creatTime)}</div>
                          </div>
                        </div>
                      </div> : null
                  }
                </div>
                : null
            }
            <div className='color-red margin-top padding-left20' style={{ width: 500 }}>

              使用说明：<br />

              1、查询中如果需要输入验证码，请刮开二维码下的涂层输入正确的验证码；<br />

              2、如果该码为错误码，请立即联系渠道供应商、零售商或当地消协，该商品为假冒伪劣商品，非本公司正规渠道生产；<br />

              3、如果发现该码存疑，不排除有不法商家盗用本公司的防伪码多次使用，请立即告知本公司相关人员，本公司将防止假冒伪劣产品在市场上流通。<br />
            </div>
          </TabPane>
          <TabPane tab="查询记录" key="2">
            <SearchLog updateTime={this.state.updateSearchLogTime}></SearchLog>
          </TabPane>
        </Tabs>

        <a ref="exportUrl" download="工单数据" style={{ 'display': "none" }} href={this.state.exportUrl} ></a>


        <Modal maskClosable={false}
          title="输入验证码"
          visible={this.state.securityCodeModalIsVisible}
          onCancel={this._hideSecurityCodeModal}
          onOk={this.secCodeModalConfirmClicked}
        >
          <Form>
            <Form.Item
              key='securityVerificationCodeNumber'
              field='securityVerificationCodeNumber'>
              <Input value={this.state.securityVerificationCodeNumber} onChange={this.onSecCodeChange} style={{ width: "100%" }} maxLength={6} placeholder='请输入验证码' />
            </Form.Item>
          </Form>

        </Modal>
      </CommonPage >
    )
  }
}

export default Form.create()(Page);