import React, { Component } from "react";
import CommonPage from '../../components/common-page';
import { Table, Form, Input, Select, Col, Row, Icon, Spin, Button, Divider, Tabs, Popconfirm, Radio, Modal, Checkbox, InputNumber, Switch } from "antd";
import { pagination } from '../../utils/pagination';
import Toast from '../../utils/toast';
import { getAllPromptSound, saveOrUpdatePromptSound } from '../../api/setting/setting';

const { TabPane } = Tabs;
const _title = "提示音管理";
const _description = "";

class Page extends Component {

  state = {
    showTableLoading: false,
    showTableLoading2: false,
    tableDataList: null,
    tableDataList2: null
  }

  componentDidMount() {
    this.getPageData()
  }
  // 表格相关列
  columns = [
    { title: "提示音", dataIndex: "name" },
    { title: "描述", dataIndex: "description" },
    { title: "试听", dataIndex: "url", render: data => <audio src={data} controls style={{ height: 30 }}> 您的浏览器不支持 audio 标签。</audio> },
    { title: "开关", dataIndex: "status", render: (data, record) => <Switch onChange={(e) => this.onCheckedChange(e, record.id)} checked={data == '1'} /> }

  ]

  columns2 = [
    { title: "提示音", dataIndex: "name" },
    { title: "描述", dataIndex: "description" },
    { title: "试听", dataIndex: "url", render: data => <audio src={data} controls style={{ height: 30 }}> 您的浏览器不支持 audio 标签。</audio> },
    { title: "开关", dataIndex: "status", render: (data, record) => <Switch onChange={(e) => this.onCheckedChange(e, record.id)} checked={data == '1'} /> }
  ]

  onCheckedChange = (e, id) => {

    let status = e ? "1" : "0";
    saveOrUpdatePromptSound({ status, id })
      .then(() => {
        this.getPageData();
        Toast("更改成功！");

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

  onTabsChange = (e) => {
    this.getPageData();
  }

  getPageData = () => {
    this._showTableLoading()
    getAllPromptSound()
      .then(data => {

        this._hideTableLoading()
        if (!data || !data.length) {
          return;
        }

        let tableDataList = data.filter(item => item.type == 0);
        let tableDataList2 = data.filter(item => item.type == 1);

        this.setState({
          tableDataList,
          tableDataList2
        })
      })
      .catch(() => { this._hideTableLoading() })

  }

  render() {
    const { getFieldDecorator } = this.props.form;
    return (
      <CommonPage title={_title} description={_description} >
        <Tabs type="card" onChange={this.onTabsChange}>
          <TabPane tab="生产扫描提示音" key="0">
            <Table
              indentSize={10}
              rowKey="id"
              columns={this.columns}
              loading={this.state.showTableLoading}
              pagination={false}
              dataSource={this.state.tableDataList}
            />
          </TabPane>
          <TabPane tab="出库扫描提示音" key="1">
            <Table
              indentSize={10}
              rowKey="id"
              pagination={false}
              columns={this.columns2}
              loading={this.state.showTableLoading2}

              dataSource={this.state.tableDataList2}
            />
          </TabPane>
        </Tabs>
      </CommonPage>
    )
  }
}

export default Form.create()(Page);
