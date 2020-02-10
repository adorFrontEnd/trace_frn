import React, { Component } from "react";
import { Col, Row, Card, Spin, Form, Button, Input, Table, Tree, Icon, Modal, Popconfirm } from 'antd';
import Toast from '../../utils/toast';
import CommonPage from '../../components/common-page';
import { SearchForm } from '../../components/common-form';
import dateUtil from '../../utils/dateUtil';
import { searchOrganizationList, deleteOrg, saveOrUpdate } from '../../api/account/organization';
const _title = "组织架构";

const _description = "";

class Page extends Component {

  state = {
    dataList: null,
    newItemModalVisible: false,
    parentNode: null,
    selectChildNode: null
  }

  componentWillMount() {
    this.getPageData();
  }

  getPageData = () => {
    searchOrganizationList().then(res => {
      let dataList = res.data;
      this.setState({
        dataList
      })
      let parentArr = dataList.filter(item => item.parentId == '0');
      let parentNode = parentArr && parentArr.length ? parentArr[0] : null;
      this.setState({
        parentNode
      })
    })
  }

  _hideNewItemModal = () => {
    this.setState({
      newItemModalVisible: false
    })
  }

  showOrgModal = (data) => {
    let selectChildNode = data || null;
    let childCompanyName = data && data.name ? data.name : null;
    this.setState({
      selectChildNode,
      childCompanyName,
      newItemModalVisible: true
    })
  }

  onChildCompanyNameChange = (e) => {
    let childCompanyName = e.currentTarget.value;
    this.setState({
      childCompanyName
    })
  }

  saveCompanyName = () => {
    let childCompanyName = this.state.childCompanyName;
    if (!childCompanyName) {
      Toast('请输入公司名称！');
      return;
    }

    let { id } = this.state.parentNode;
    let params = { parentId: id, name: childCompanyName };

    if (this.state.selectChildNode) {
      let { id } = this.state.selectChildNode;
      params.id = id;
      saveOrUpdate(params)
        .then(() => {
          Toast("编辑分公司成功！");
          this.getPageData();
          this._hideNewItemModal();
        })
      return;
    }

    saveOrUpdate(params)
      .then(() => {
        Toast("新增分公司成功！");
        this.getPageData();
        this._hideNewItemModal();
      })
  }

  deleteItem = (data) => {
    let { id} = data;
    deleteOrg({id})
    .then(()=>{
      Toast("删除分公司成功！");
      this.getPageData();
    })
  }

  renderTree = () => {
    if (this.state.dataList) {
      let parentArr = this.state.dataList.filter(item => item.parentId == '0');
      let childrenArr = this.state.dataList.filter(item => item.parentId != '0');
      let parentNode = parentArr && parentArr.length ? parentArr[0] : null;
      if (!parentNode) {
        return;
      }

      return (
        <Tree
          showIcon
          defaultExpandAll={true}
          onSelect={this.onSelect}
          onCheck={this.onCheck}
          className="draggable-tree"
        >
          <Tree.TreeNode icon={<Icon type="deployment-unit" />} title={parentNode.name} key="0">
            {
              childrenArr.map(item => (
                <Tree.TreeNode
                  icon={<Icon type="bank" />}
                  key={item.id}
                  title={
                    <span className='line-height24'>{item.name}
                      <a onClick={() => { this.showOrgModal(item) }} className="padding0-10">编辑</a>
                      <Popconfirm
                        placement="topLeft" title='确认要删除吗？'
                        onConfirm={() => { this.deleteItem(item) }} >
                        <span className="padding0-10 color-red">删除</span>
                      </Popconfirm>

                    </span>
                  }
                />
              ))
            }
          </Tree.TreeNode>
        </Tree>
      )
    }
  }
  render() {
    const { getFieldDecorator } = this.props.form;
    return (
      <CommonPage title={_title} description={_description} >
        <div className='padding20-0'>
          <Button style={{ width: 120, marginLeft: 30 }} onClick={this.showOrgModal} type='primary'>新增</Button>
        </div>
        {
          this.renderTree()
        }

        < Modal maskClosable={false}
          title="新增分公司"
          visible={this.state.newItemModalVisible}
          onCancel={this._hideNewItemModal}
          onOk={this.saveCompanyName}
        >

          <Form layout='inline'>
            <Form.Item label='分公司名称:'>
              <Input
                style={{ width: 300 }}
                onChange={this.onChildCompanyNameChange}
                value={this.state.childCompanyName}
                placeholder='填入分公司名称（请勿重复）'
              />

            </Form.Item>
          </Form>

        </Modal >
      </CommonPage>)


  }
}

export default Form.create()(Page);