import React, { Component } from "react";
import { Col, Row, Checkbox, Card, Modal, Spin, Form, Icon, Popconfirm, Switch, DatePicker, Button, Input, Table, Select, InputNumber, Radio } from 'antd';
import Toast from '../../utils/toast';
import CommonPage from '../../components/common-page';
import { SearchForm } from '../../components/common-form';
import dateUtil from '../../utils/dateUtil';
import { connect } from 'react-redux';
import { changeRoute } from '../../store/actions/route-actions'

const _title = "签到配置"
const _description = "";


class Page extends Component {
  state = {
    showLoading: false,
    signConfigArr: [],
    signModeConfig:[]
  }

  componentDidMount() {
    this.initSignConfigArr();
  }


  initSignConfigArr = () => {

    this.setState({
      signConfigArr: [1, 1, 1, 1]
    })
  }

  onsignConfigChange = (action, index, value) => {
    let { signConfigArr } = this.state;
    switch (action) {
      case "edit":
        signConfigArr[index] = value;
        break;

      case "delete":
        signConfigArr.splice(index, 1);
        break;

      default:
      case 'add':
        signConfigArr.push(1);
        break;
    }

    this.setState({
      signConfigArr
    })
  }

  onsignModeChange = (signModeConfig) => {
    this.setState({ signModeConfig })
  }

  render() {
    const { getFieldDecorator } = this.props.form;
    const { selectAreaNames } = this.state;
    return (
      <CommonPage title={_title} description={_description} >
        <Spin spinning={this.state.showLoading}>
          <div>
            <Button type='primary' className='margin-right20 normal' onClick={this.saveClicked}>保存</Button>
            <Button type='primary' onClick={this.saveClicked}>查看积分记录</Button>
          </div>
          <div className='margin-top '>
            <Checkbox.Group value={this.state.signModeConfig} onChange={this.onsignModeChange}>
              <Row className='line-height40'>
                <Col span={24} >
                  <Checkbox value="start">开启签到</Checkbox>
                </Col>
                <Col span={24}>
                  <Checkbox value="infinite">循环模式</Checkbox>
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
              this.state.signConfigArr && this.state.signConfigArr.length ?
                this.state.signConfigArr.map((item, index) =>
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