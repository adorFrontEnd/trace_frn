import React, { Component } from "react";
import CommonPage from '../../components/common-page';
import { Form, Icon, Button, Modal, } from "antd";


import Toast from '../../utils/toast';
import { getCacheOperId } from '../../middleware/localStorage/login';
import { updatePassword } from '../../api/account/account';
import { getSurplusExportQuantity, rechargeBusiness } from '../../api/setting/recharge'

import './recharge.less';

const _title = "充值业务";
const _description = "";

class Page extends Component {
  state = {
    pageData: null,
    isShowModal: false,
    appId: '',
    codeNum: null,
    refresh: false,
    code: null
  }
  componentDidMount() {
    this.getPageData();
  }
  clickCode = (e) => {
    let id = e.currentTarget.getAttribute('data-id');
    this.setState({ isShowModal: true });
    let code = rechargeBusiness({ id });
    this.setState({ code });
  }
  getPageData = () => {
    getSurplusExportQuantity()
      .then(data => {
        this.setState({ codeNum: data });
      })
  }
  // 点击刷新
  clickRefresh = () => {
    this.setState({ refresh: true }, () => {
      setTimeout(() => { this.setState({ refresh: false }) }, 500);
    });
    this.getPageData();
  }
  handleCancel = () => {
    this.setState({ isShowModal: false });
  }
  handleOk=()=>{
    this.getPageData();
    this.setState({ isShowModal: false });
  }
  /**渲染**********************************************************************************************************************************/

  render() {

    return (
      <CommonPage title={_title} description={_description} >
        <div style={{ height: '70vh' }}>
          <div className='top'>
            {this.state.codeNum == -1 ?
              <div style={{ marginRight: '30px' }}>剩余可用码数：不限</div>
              : <div style={{ marginRight: '30px' }}>剩余可用码数：{this.state.codeNum}</div>
            }
            {
              this.state.refresh ?
                <div style={{ color: '#66C2FF', fontSize: '16px' }} onClick={this.clickRefresh}>
                  <Icon type='sync' spin={true} /> 刷新
                </div>
                : <div style={{ color: '#66C2FF', fontSize: '16px' }} onClick={this.clickRefresh}>
                  <Icon type='sync' /> 刷新
                </div>
            }
          </div>
          <div style={{ display: 'flex' }}>
            <div className='codebox' data-id='1' onClick={this.clickCode}>
              <div className='code'>新增10000000个码</div>
              <div className='codemoney'>￥120.00</div>
            </div>
            <div className='codebox' data-id='2' onClick={this.clickCode}>
              <div className='code'>新增100000000个码</div>
              <div className='codemoney'>￥1000.00</div>
            </div>
            <div className='codebox' data-id='3' onClick={this.clickCode}>
              <div className='code'>买断</div>
              <div className='codemoney'>￥100000.00</div>
            </div>
          </div>
        </div>
        <Modal
          visible={this.state.isShowModal}
          title="微信/支付宝扫码支付"
          onOk={this.handleOk}
          onCancel={this.handleCancel}
          footer={[
            <Button key="back" onClick={this.handleCancel}>
              取消
            </Button>,
            <Button key="submit" type="primary" onClick={this.handleOk}>
              支付完成
            </Button>
          ]}
          width='800px'
        >
          <div style={{ width: '162px', height: '162px', border: '1px solid #ccc' }}>
            <img src={this.state.code} style={{ width: '100%', height: '100%' }} ref="code" />
          </div>
        </Modal>
      </CommonPage >
    )
  }
}

export default Form.create()(Page);