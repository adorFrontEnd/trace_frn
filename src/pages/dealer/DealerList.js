import React, { Component } from "react";
import CommonPage from '../../components/common-page';
import { Table, Form, Input, Select, Col, Row, Icon, Button, Divider, Popconfirm, Radio, Modal, Checkbox, InputNumber, Upload } from "antd";
import { pagination } from '../../utils/pagination';
import Toast from '../../utils/toast';
import { SearchForm, SubmitForm } from '../../components/common-form';
import dateUtil from '../../utils/dateUtil';
import { getDealerList, addDealerAndUpdate, deleteDealer, importDealer, exportTemplate } from '../../api/dealer/dealerList';
import { NavLink, Link } from 'react-router-dom';
import { baseRoute, routerConfig } from '../../config/router.config';
import { connect } from 'react-redux';
import { changeRoute } from '../../store/actions/route-actions'


const _title = "经销商列表";
const _description = "";
const shippingDetailsPath = routerConfig["dealer.shippingDetails"].path;
const dealerEditPath = routerConfig["dealer.dealerEdit"].path;
const productUpRecordPath = routerConfig["dealer.productUpRecord"].path;
const writeOffLogManagePath = routerConfig["marketManage.writeOffLogManage"].path;

class DealerList extends Component {

  state = {
    tableDataList: null,
    showTableLoading: false,
    id: null,
    fileList: [],
    uploading: false,
    organizationName: null
  }

  componentDidMount() {
    this.getPageData()
    this.props.changeRoute({ path: 'dealer.dealerList', title: _title, parentTitle: '经销商管理' });
  }

  goDealerEdit = (id) => {
    let title = id == '0' ? '经销商添加' : "经销商编辑"
    this.props.changeRoute({ path: 'dealer.dealerEdit', title, parentTitle: '经销商列表' });
  }


  params = {
    page: 1
  }

  // 获取页面列表
  getPageData = () => {
    let _this = this;
    this.props.form.validateFields((err, params) => {
      this._showTableLoading();
      this.params.search = params.search || null;
      this.params.labelName = params.labelName ||null;
      getDealerList(this.params).then(res => {
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
    })
  }

  _getUserOrganization = () => {
    // getUserOrganization().then(res => {
    //   this.setState({
    //     organizationName: res.data.organizationName
    //   })
    // }).catch(() => {
    // })
  }

  // 表格相关列
  columns = [

    { title: "经销商id", dataIndex: "id" },
    { title: "经销商名称", dataIndex: "dealerName" },
    { title: "联系人", dataIndex: "name" },
    { title: "手机号", dataIndex: "phone" },
    { title: "所属组织架构", dataIndex: "organizationName" },
    { title: "最后操作日期", dataIndex: "updateTime", render: data => data ? dateUtil.getDateTime(data) : "--" },
    { title: "发货权限", dataIndex: "shipStatus", render: data => data == '0' ? "√" : "×" },
    { title: "门店权限", dataIndex: "storeStatus", render: data => data == '0' ? "√" : "×" },
    { title: "标签", dataIndex: "labelNames", width: 200, render: data => data && data.length ? data.join('、') : "--" },
    {
      title: '操作',
      render: (text, record, index) => (
        <span>
          {
            record.type == 1 ?
              <span className='color-gray' style={{ cursor: "not-allowed" }}>编辑</span>
              :
              <span onClick={() => { this.goDealerEdit(record.id) }}><NavLink to={dealerEditPath + "/" + record.id}>编辑</NavLink></span>
          }
          <Divider type="vertical" />
          <NavLink to={shippingDetailsPath + "/" + record.id}>发货查询</NavLink>
          <Divider type="vertical" />
          <NavLink to={productUpRecordPath + "/" + record.id}>上架记录</NavLink>
          <Divider type="vertical" />
          <NavLink to={writeOffLogManagePath + "?dealerId=" + record.id}>核销记录</NavLink>
          <Divider type="vertical" />

          {
            record.type == 1 ?
              <span className='color-gray' style={{ cursor: "not-allowed" }}>删除</span>
              :
              <Popconfirm
                placement="topLeft" title='确认要删除吗？'
                onConfirm={() => { this.deleteTableItem(record) }} >
                <a size="small" className="color-red">删除</a>
              </Popconfirm>
          }
        </span>
      )
    }
  ]

  _showTableLoading = () => {
    let organizationName = this.state.organizationName;
    if (!organizationName) {
      // this._getUserOrganization();
    }
    this.setState({
      showTableLoading: true
    })
  }

  _hideTableLoading = () => {
    this.setState({
      showTableLoading: false
    })
  }

  /**经销商的modal***************************************************************************************************************** */

  // 重置
  resetClicked = () => {
    this.props.form.resetFields();
  }


  deleteTableItem = (record) => {
    if (record.type == 1) {
      Toast("不能删除!", "");
      return;
    }
    deleteDealer({ "id": record.id }).then(res => {
      if (res.status == "SUCCEED") {
        Toast("删除成功!", "success");
        this.getPageData();
      }
    })
  }

  importDealer = () => {
    this._importShowDealerModal();
  }

  _importShowDealerModal = () => {
    this.setState({
      importIsVisible: true
    })
  }
  _importHimeDealerModal = () => {
    this.setState({
      importIsVisible: false
    })
  }


  //上传
  handleUpload = (params) => {
    const { fileList } = this.state;
    const formData = new FormData();
    params.file = fileList[0];
    this.setState({
      uploading: true,
    });
    importDealer(params)
      .then(res => {
        this.setState({
          uploading: false,
        });
        if (res.status == "SUCCEED") {
          Toast("保存成功!", "success");
          this._importHimeDealerModal();
          this.getPageData();
          this.resetClicked();
        }
      })
      .catch(() => {
        this.setState({
          uploading: false,
        });
      })
  }

  /**
   * 下载模板
   */
  _exportTemplate = (params) => {
    this.exportData();
  }

  exportData = () => {
    let exportUrl = exportTemplate();
    this.setState({
      exportUrl
    })
    if (!exportUrl) {
      Toast("导出失败！")
      return;
    }
    this.setState({
      exportUrl
    })

    setTimeout(() => {
      this.refs.exportUrl.click()
    }, 1000)
  }


  /**渲染**********************************************************************************************************************************/

  render() {
    const { getFieldDecorator } = this.props.form;
    const { uploading, fileList } = this.state;
    const uploadProps = {
      onRemove: (file) => {
        this.setState((state) => {
          const index = state.fileList.indexOf(file);
          const newFileList = state.fileList.slice();
          newFileList.splice(index, 1);
          return {
            fileList: newFileList,
          };
        });
      },
      beforeUpload: (file) => {

        this.setState(state => ({
          fileList: [file],
        }));
        return false;
      },
      fileList,
      directory: false
    };
    return (
      <CommonPage title={_title} description={_description} >
        <div className='flex-end align-center padding10-0'>
          <NavLink to={dealerEditPath + "/0"}>
            <Button type='primary' className='margin-right20' onClick={() => { this.goDealerEdit(0) }}>新增经销商</Button>
          </NavLink>

          <Button type='primary' className='margin-right20 yellow-btn' onClick={this.importDealer}>批量导入经销商</Button>
          <Form layout='inline'>
            <Form.Item
              field="search"
            >
              {
                getFieldDecorator('search', {
                })(
                  <Input placeholder="经销商名称/联系人/ID/手机号" style={{ width: "232px" }} />
                )
              }
            </Form.Item>

            <Form.Item
              field="labelName"
            >
              {
                getFieldDecorator('labelName', {
                })(
                  <Input placeholder="标签" style={{ width: "120px" }} />
                )
              }
            </Form.Item>
          </Form>
          <Button type='primary' className='normal' onClick={this.getPageData}>查询</Button>
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
          title="导入经销商"
          visible={this.state.importIsVisible}
          onCancel={this._importHimeDealerModal}
          onOk={this._importHimeDealerModal}
        >
          <div className='flex'>
            <div >
              <Upload {...uploadProps}>
                <Button type="primary"><Icon type="upload" />导入设备文件</Button>
              </Upload>
              {
                fileList.length === 1 ?
                  <Button
                    type="primary"
                    onClick={this.handleUpload}
                    loading={uploading}
                    style={{ marginTop: 16 }}
                  >
                    {uploading ? '导入中...' : '开始导入'}
                  </Button>
                  : null
              }
            </div>
            <div className='margin-left20' style={{ lineHeight: "32px" }}>
              <Button type="primary" onClick={() => { this._exportTemplate() }} icon="upload" className="yellow-btn" ref='exportDeviceUrl'>下载模板</Button>
            </div>
          </div>
          <a ref="exportUrl" download="下载模板" style={{ 'display': "none" }} href={this.state.exportUrl} ></a>
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
export default connect(mapStateToProps, mapDispatchToProps)(Form.create()(DealerList));