import React, { Component } from "react";
import CommonPage from '../../components/common-page';
import { Table, Form, Input, Select, Tabs, Col, Row, Icon, Radio, Button, Divider, Popconfirm, Modal, Checkbox, InputNumber } from "antd";
import { pagination } from '../../utils/pagination';
import Toast from '../../utils/toast';
import { SearchForm, SubmitForm } from '../../components/common-form';
import dateUtil from '../../utils/dateUtil';
import { getSurplusExportQuantity } from "../../api/user/user";
import { searchTrayList, exportUniqueCode, exportUniqueCodeLog, saveOrUpdate, searchTrayLogList, deleteTray, deleteTrayLog } from '../../api/codeManage/trayCode';
import TrayCodeLog from './TrayCodeLog';
const { TabPane } = Tabs;
const _title = "托盘码管理";
const _description = "";

class Page extends Component {

  state = {
    trayModalIsVisible: false,
    exportUrl: null,
    uniqueCodeQuantity: null,
    selectId: null,
    updateLogTime: null
  }

  params = {
    page: 1
  }

  componentDidMount() {
    this.getPageData();
    this._getSurplusExportQuantity();
  }

  getPageData = () => {

    searchTrayList(this.params)
      .then(res => {
        this.setState({
          tableDataList: res.data
        })
        let arr = res.data;
        if (arr && arr.length && arr[0]) {
          if (arr[0].uniqueCodeQuantity) {
            let uniqueCodeQuantity = arr[0].uniqueCodeQuantity;
            this.setState({
              uniqueCodeQuantity
            })
          }

          if (arr[0].id) {
            let selectId = arr[0].id;
            this.setState({
              selectId
            })
          }
        }
      })
      .catch(() => {
        // this._hideTableLoading();
      })
  }

  _getSurplusExportQuantity = () => {
    getSurplusExportQuantity()
      .then(exportQuantity => {
        this.setState({
          exportQuantity: exportQuantity == -1 ? "无限制" : exportQuantity
        })

      })
  }

  showTrayExportModal = () => {
    this.setState({
      trayModalIsVisible: true
    })
  }

  _hideTrayExportModal = () => {
    this.setState({
      trayModalIsVisible: false
    })
  }

  saveExportModalClicked = (data) => {
    // 
    this.props.form.validateFields((err, data) => {
      if (err) {
        return;
      }

      let { exportQuantity } = data;

      if (parseInt(exportQuantity) > 1000000) {
        Toast("一次性生成数量不超过100万！");
        return;
      }
      this._exportUniqueCode(data);
    })

  }

  _exportUniqueCode = (params) => {
    let id = this.state.selectId;
    let { remark } = params;
    remark = remark || null;
    if (!id) {
      return;
    }
    exportUniqueCode({ ...params, id, remark })
      .then(() => {
        Toast("生成成功！")
        this._hideTrayExportModal();
        this.props.form.resetFields();
      })
    // if (!exportUrl) {
    //   Toast("导出失败！")
    //   return;
    // }

    // this.setState({
    //   exportUrl
    // })


    // setTimeout(() => {
    //   this.refs.exportUrl.click();     
    // }, 1000)
  }

  onTabsChange = (e) => {
    if (e == "2") {
      this.setState({
        updateLogTime: Date.now()
      })
    } else {
      this.getPageData();
      this._getSurplusExportQuantity();
    }
  }

  /**渲染**********************************************************************************************************************************/

  render() {
    const { getFieldDecorator } = this.props.form;
    return (
      <CommonPage title={_title} description={_description} >
        <Tabs type="card" onChange={this.onTabsChange}>
          <TabPane tab="生成托盘码" key="1">
            <div>
              <div>
                <Button type='primary' onClick={this.showTrayExportModal}>生成托盘码</Button>
              </div>

              <div style={{ lineHeight: "40px", marginRight: "20px" }}>已导出托盘码数量：{this.state.uniqueCodeQuantity || 0}</div>


              <div style={{ lineHeight: "40px", marginRight: "20px" }}>剩余可导出数量：<span className='color-red'>{this.state.exportQuantity}</span></div>
            </div>
          </TabPane>
          <TabPane tab="操作日志" key="2">
            <TrayCodeLog updateTime={this.state.updateLogTime}></TrayCodeLog>
          </TabPane>
        </Tabs>
        <Modal maskClosable={false}
          visible={this.state.trayModalIsVisible}
          title='生成托盘码'
          onCancel={this._hideTrayExportModal}
          onOk={this.saveExportModalClicked}
        >
          <Form>
            <Form.Item
              labelCol={{ span: 8 }}
              wrapperCol={{ span: 16 }}
              label='导出数量：'
              key='exportQuantity'
              field='exportQuantity'>
              {
                getFieldDecorator('exportQuantity', {
                  rules: [
                    { required: true, message: '请输入导出数量!' }
                  ]
                })(
                  <InputNumber style={{ width: 120 }} precision={0} min={0} max={99999999} />
                )
              }
              <span className='color-red'>一次性生成数量不可超过100万</span>

            </Form.Item>

            <Form.Item labelCol={{ span: 8 }} wrapperCol={{ span: 16 }} label='导出类型：' key='exportType' field='exportType'>
              {
                getFieldDecorator('exportType', {
                  rules: null,
                  initialValue: "0"
                })(
                  <Radio.Group>
                    <Radio value={"0"}>文本</Radio>
                    <Radio value={"1"}>Excel</Radio>
                    <Radio value={"2"}>图片压缩包</Radio>
                  </Radio.Group>
                )
              }
            </Form.Item>

            <Form.Item labelCol={{ span: 8 }} wrapperCol={{ span: 16 }} label='备注：' key='remark' field='remark'>
              {
                getFieldDecorator('remark', {
                  rules: null,
                  initialValue: ""
                })(
                  <Input.TextArea />
                )
              }
            </Form.Item>
          </Form>

        </Modal>

        <a ref="exportUrl" download="工单数据" style={{ 'display': "none" }} href={this.state.exportUrl} ></a>

      </CommonPage >
    )
  }
}

export default Form.create()(Page);