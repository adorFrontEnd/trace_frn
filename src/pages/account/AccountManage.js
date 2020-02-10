import React, { Component } from "react";
import { Form, Button, Table, Popconfirm, Divider, Modal } from 'antd';
import Toast from '../../utils/toast';
import CommonPage from '../../components/common-page';
import { SubmitForm } from '../../components/common-form';
import dateUtil from '../../utils/dateUtil';
import { searchOperList, deleteOper, saveOrUpdate } from '../../api/account/account';
import { searchRoleList } from '../../api/account/role';
import { searchOrganizationList } from '../../api/account/organization';
import { isRootOrgUser, getCacheOrgId } from '../../middleware/localStorage/login';
import { pagination } from '../../utils/pagination';

const _title = "账号管理";
const _description = "";

class Page extends Component {

  state = {
    isRootUser: false,
    tableDataList: null,
    showTableLoading: false,
    roleList: [],
    orgList: [],
    editFormValue: null,
    newItemModalVisible: false,
    selectOper: null,
    orgData: {}
  }

  componentWillMount() {
    let isRootUser = !!isRootOrgUser();

    this.setState({
      isRootUser
    })

    this.getPageData();
    this.getRoleList();
    this.getOrganizationList();
  }

  params = {
    page: 1
  }

  getPageData = () => {

    let _this = this;
    this._showTableLoading();

    searchOperList(this.params).then(res => {
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

  /**获取角色列表 ********************************************************************************************************************************************/
  getRoleList = () => {
    searchRoleList({ page: 1, size: 100 })
      .then(res => {
        if (res && res.data && res.data.length) {
          let roleList = res.data.filter(item => item.name != '超级管理员');
          this.setState({
            roleList
          })
          this.newItemFormList[0].optionList = roleList;
        }
      })
  }

  /**获取组织列表 ********************************************************************************************************************************************/
  getOrganizationList = () => {
    searchOrganizationList({ page: 1, size: 100 })
      .then(res => {
        if (res && res.data && res.data.length) {
          let orgList = res.data;
          this.setState({
            orgList
          })
          let organizationId = getCacheOrgId();
          let arr = orgList.filter(item => item.id == organizationId);
          let orgData = arr[0];
          this.setState({
            orgData
          })
          this.newItemFormList[6].optionList = orgList;
        }
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
  // 表格相关列 
  columns = [
    { title: "账号", dataIndex: "username" },
    { title: "角色", dataIndex: "roleName", render: data => data || '--' },
    { title: "状态", dataIndex: "status", render: data => data == '1' ? "可用" : "禁用" },
    { title: "名称", dataIndex: "nickname" },
    { title: "所属组织架构", dataIndex: "organizationName", render: data => data || '--' },
    {
      title: '操作',
      render: (text, record, index) => (
        <span>
          {
            record.roleName != '超级管理员' ?
              <span>
                <a onClick={() => { this.showAcountModal(record) }}>编辑</a>
                <Divider type="vertical" />
                {
                  record.status == '1' ?
                    <a onClick={() => { this.deactiveOper(record) }}>禁用</a> : <a onClick={() => { this.activeOper(record) }}>激活</a>
                }
                <Divider type="vertical" />
                <Popconfirm
                  placement="topLeft" title='确认要删除吗？'
                  onConfirm={() => { this.deleteOper(record) }} >
                  <a size="small" className='color-red'>删除</a>
                </Popconfirm>
              </span> : '--'
          }
        </span>
      )
    }
  ]

  /* Modal操作*******************************************************************************************************************************************/
  newItemFormList = [
    {
      type: "SELECT",
      field: "roleId",
      label: "请选择角色:",
      placeholder: "请选择角色名称",
      optionList: [],
      rules: [
        { required: true, message: '请选择角色名称!' }
      ]
    },
    {
      type: "SELECT",
      field: "status",
      label: "设置状态:",
      placeholder: "请选择状态",
      optionList: [{ id: "1", name: "可用" }, { id: "0", name: "不可用" }],
      rules: [
        { required: true, message: '请选择状态!' }
      ]
    },
    {
      type: "INPUT",
      field: "username",
      label: "账户:",
      placeholder: "请输入账户（手机号码）",
      rules: [
        { required: true, message: '请输入账户!' }
      ]
    },
    {
      type: "INPUT",
      field: "nickname",
      label: "昵称:",
      placeholder: "请输入昵称",
      rules: [
        { required: true, message: '请输入昵称!' }
      ]
    },
    {
      type: "INPUT",
      field: "password",
      label: "密码:",
      placeholder: "请输入密码",
      rules: [
        { required: true, message: '请输入密码!' }
      ]
    },
    {
      type: "INPUT",
      field: "remark",
      label: "备注:",
      placeholder: "请输入备注"
    },
    {
      type: "SELECT",
      field: "organizationId",
      label: "所属组织架构:",
      placeholder: "请选择组织架构",
      optionList: [],
      rules: [
        { required: true, message: '请选择组织架构!' }
      ]
    }
  ]

  // 打开modal
  showAcountModal = (data) => {
    this.setState({
      newItemModalVisible: true
    })

    let isRootUser = this.state.isRootUser;
    this.newItemFormList[4].rules = data ? null : [{ required: true, message: '请输入密码!' }];
    this.newItemFormList[2].disabled = !!data;
    this.newItemFormList[6].disabled = !isRootUser;

    let selectOper = data || null;
    let orgData = this.state.orgData;
    let editFormValue = {};
    if (data) {
      let { roleId, roleName, status, username, nickname, remark, organizationId, organizationName } = data;
      roleId = { key: roleId, label: roleName };
      status = { key: status, label: status == '1' ? "可用" : "不可用" };
      organizationId = { key: organizationId, label: organizationName };
      editFormValue = { roleId, status, username, nickname, remark, organizationId, _s: Date.now() };
    }

    if (!data && !this.state.isRootUser) {
      let organizationId = { key: orgData.id, label: orgData.name };
      editFormValue = { ...editFormValue, organizationId, _s: Date.now() }
    }

    this.setState({
      editFormValue,
      selectOper
    })
  }

  // 关闭modal
  _hideNewItemModal = () => {
    this.setState({
      newItemModalVisible: false
    })
  }

  /**保存modal数据 *****************************/
  newItemModalSaveClicked = (data) => {

    let { organizationId, roleId, status, password } = data;
    organizationId = organizationId.key;
    roleId = roleId.key;
    status = status.key;
    password = password || null;
    let params = { ...data, organizationId, roleId, status, password }
    let title = '添加账户成功！';
    if (this.state.selectOper) {
      let { id } = this.state.selectOper;
      params.id = id;
      title = '修改账户成功！'
    }
    saveOrUpdate(params)
      .then(() => {
        Toast(title);
        this.getPageData();
        this._hideNewItemModal();
      })
  }

  // 删除角色
  deleteOper = (record) => {
    let { id } = record;
    deleteOper({ id })
      .then(() => {
        Toast("删除账号成功！");
        this.getPageData();
      })
  }

  // 禁用角色
  deactiveOper = (record) => {
    let { id } = record;
    let status = '0';
    saveOrUpdate({ id, status })
      .then(() => {
        Toast("禁用账户成功！");
        this.getPageData();
      })
  }

  // 激活角色
  activeOper = (record) => {
    let { id } = record;
    let status = '1';
    saveOrUpdate({ id, status })
      .then(() => {
        Toast("启用账户成功！");
        this.getPageData();
      })
  }

  // 渲染页面
  render() {
    const { getFieldDecorator } = this.props.form;
    return (
      <CommonPage title={_title} description={_description} >
        <div className='padding10-0'>
          <Button onClick={() => { this.showAcountModal() }} style={{ width: 100 }} type='primary'>新建</Button>
        </div>
        <Table
          indentSize={10}
          rowKey="id"
          columns={this.columns}
          loading={this.state.showTableLoading}
          pagination={this.state.pagination}
          dataSource={this.state.tableDataList}
        />

        <Modal maskClosable={false}
          title="添加/修改账号"
          visible={this.state.newItemModalVisible}
          footer={null}
          onCancel={this._hideNewItemModal}
          className='noPadding'
        >
          <SubmitForm
            clearWhenHide={true}
            showForm={this.state.newItemModalVisible}
            setFormValue={this.state.editFormValue}
            formItemList={this.newItemFormList}
            saveClicked={this.newItemModalSaveClicked}
            cancelClicked={this._hideNewItemModal}
          >
          </SubmitForm>
        </Modal>

      </CommonPage >)
  }
}

export default Form.create()(Page);