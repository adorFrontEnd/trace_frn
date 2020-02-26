import React, { Component } from "react";
import { Col, Row, Checkbox, Card, Modal, Spin, Form, Icon, Popconfirm, Switch, DatePicker, Button, Input, Table, Select, InputNumber, Radio } from 'antd';
import Toast from '../../utils/toast';
import CommonPage from '../../components/common-page';
import { SearchForm } from '../../components/common-form';
import dateUtil from '../../utils/dateUtil';
import { connect } from 'react-redux';
import { changeRoute } from '../../store/actions/route-actions'
import { getSignInConfigDetail, saveOrUpdateSignInConfig } from "../../api/signConfig/signConfig";
import { NavLink, Link } from 'react-router-dom';
import { baseRoute, routerConfig } from '../../config/router.config';

const _title = "签到配置"
const _description = "";
const mainIntegralRecord = routerConfig["marketManage.mainIntegralRecord"].path;

class Page extends Component {
  state = {
    showLoading: false,
    signDayConfigArr: [],
    signModeConfigArr: [],
    signConfigData: null,
    remark:null
  }

  componentDidMount() {
    this.initsignDayConfigArr();
    this.props.changeRoute({ path: 'marketManage.signConfig', title: _title, parentTitle: '营销工具' });
  }


  initsignDayConfigArr = () => {

    this.setState({
      showLoading: true
    })
    getSignInConfigDetail()
      .then(signConfigData => {
        this.setState({
          showLoading: false
        })
        if (!signConfigData) {
          this.setState({
            signDayConfigArr: [1, 1, 1, 1]
          })
          return;
        }
        let { status, loop, continuous, integralValue,remark } = signConfigData;
        let signModeConfigArr = [];

        if (status == '1') {
          signModeConfigArr.push('status');
        }
        if (loop == '1') {
          signModeConfigArr.push('loop');
        }
        if (continuous == '1') {
          signModeConfigArr.push('continuous');
        }

        let signDayConfigArr = integralValue ? integralValue.split(',') : [1, 1, 1, 1];

        this.setState({
          signConfigData,
          signModeConfigArr,
          signDayConfigArr,
          remark
        })
      })
      .catch(() => {
        this.setState({
          signDayConfigArr: [1, 1, 1, 1],
          showLoading: false
        })
      })
  }

  onsignConfigChange = (action, index, value) => {
    let { signDayConfigArr } = this.state;
    switch (action) {
      case "edit":
        signDayConfigArr[index] = value;
        break;

      case "delete":
        signDayConfigArr.splice(index, 1);
        break;

      default:
      case 'add':
        signDayConfigArr.push(1);
        break;
    }

    this.setState({
      signDayConfigArr
    })
  }

  onsignModeChange = (signModeConfigArr) => {
    this.setState({ signModeConfigArr })
  }

  saveClicked = () => {
    let { signModeConfigArr, signDayConfigArr, signConfigData,remark } = this.state;
    let isValidsignDayConfigArr = signDayConfigArr.filter(item => !item || parseInt(item) <= 0).length <= 0;
    if (!isValidsignDayConfigArr) {
      Toast('请设置大于0的积分！');
      return;
    }

    if(!remark){
      Toast('请编写活动说明！');
      return;
    }

    let status = signModeConfigArr.indexOf('status') != -1 ? '1' : "0";
    let loop = signModeConfigArr.indexOf('loop') != -1 ? '1' : "0";
    let continuous = signModeConfigArr.indexOf('continuous') != -1 ? '1' : "0";
    let integralValue = signDayConfigArr.join();
    let id = signConfigData ? signConfigData.id : null;
    let params = { id, status, loop, continuous, integralValue,remark};
    this.setState({
      showLoading: true
    })
    saveOrUpdateSignInConfig(params)
      .then(() => {
        Toast('保存成功！');
        this.setState({
          showLoading: false
        })
      })
      .catch(() => {
        this.setState({
          showLoading: false
        })
      })
  }

  goMainIntegralRecord = () => {

  }

  remarkChange = (e)=>{
    let remark = e.currentTarget.value;
    this.setState({
      remark
    })
  }

  render() {
    const { getFieldDecorator } = this.props.form;
    const { selectAreaNames } = this.state;
    return (
      <CommonPage title={_title} description={_description} >
        <Spin spinning={this.state.showLoading}>
          <div>
            <Button type='primary' className='margin-right20 normal' onClick={this.saveClicked}>保存</Button>
            <NavLink to={mainIntegralRecord}>
              <Button type='primary'>查看积分记录</Button>
            </NavLink>
          </div>
          <div className='margin-top '>
            <Checkbox.Group value={this.state.signModeConfigArr} onChange={this.onsignModeChange}>
              <Row className='line-height40'>
                <Col span={24} >
                  <Checkbox value="status">开启签到</Checkbox>
                </Col>
                <Col span={24}>
                  <Checkbox value="loop">循环模式</Checkbox>
                  <span className='color-red margin-left'>开启循环模式后，最后一天签到结束，下一天按照第一天重启一个循环；如未开启，则最后一天签到后继续签到，按最后一天的奖励进行计算</span>
                </Col>
                <Col span={24} >
                  <Checkbox value="continuous">连续模式</Checkbox>
                  <span className='color-red margin-left'>开启连续模式后，签到一旦中断，则直接重新进行计算</span>
                </Col>
              </Row>
            </Checkbox.Group>
          </div>
          <div className='flex-wrap' style={{ maxWidth: 1000 }}>
            {
              this.state.signDayConfigArr && this.state.signDayConfigArr.length ?
                this.state.signDayConfigArr.map((item, index) =>
                  <div key={index} className='flex-middle margin-right margin-bottom20'>
                    <div className='padding bgcolorF2F2F2 border-radius'>
                      <span style={{ display: "inline-block", width: 44 }}>第{index + 1}天</span>
                      <InputNumber value={item} style={{ margin: "0 10px" }} onChange={(e) => this.onsignConfigChange("edit", index, e)} precision={0} min={0} />积分
                    </div>
                    <div style={{ width: 30 }}>
                      <a>
                        {
                          index >= 3 ?
                            <Popconfirm
                              placement="topLeft" title='确认要删除吗？'
                              onConfirm={() => this.onsignConfigChange("delete", index)} >
                              <Icon title='删除' type='delete' className='color-red margin-left font-20' />
                            </Popconfirm>
                            :
                            null
                        }
                      </a>
                    </div>
                  </div>
                )
                :
                null
            }
          </div>
          <div className='margin-top'>
            <Button type='primary' className='normal' onClick={() => this.onsignConfigChange('add')}>新增天数</Button>
          </div>

          <Row className='margin-top20' style={{width:600}}>
            <Col span={5} className='text-right'>
              <span className='label-color label-required'>编写活动说明：</span>
            </Col>
            <Col span={18}>
             <Input.TextArea placeholder='编写活动说明' style={{minHeight:140}} value={this.state.remark} onChange={this.remarkChange}  />
            </Col>
          </Row>

        </Spin>
      </CommonPage>)
  }
}

const mapStateToProps = state => state;
const mapDispatchToProps = (dispatch) => {
  return {
    changeRoute: data => dispatch(changeRoute(data))
  }
}
export default connect(mapStateToProps, mapDispatchToProps)(Form.create()(Page));