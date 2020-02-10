import React, { Component } from "react";
import CommonPage from '../../components/common-page';
import { Table, Form, Input, Col, Row, Button, Divider, Popconfirm, Modal } from "antd";
import { pagination } from '../../utils/pagination';
import Toast from '../../utils/toast';
import { SearchForm } from '../../components/common-form';
import dateUtil from '../../utils/dateUtil';
import { searchUserAuthList } from '../../api/user/user';
import { NavLink, Link } from 'react-router-dom';
import { baseRoute, routerConfig } from '../../config/router.config';
import { connect } from 'react-redux';
import { changeRoute } from '../../store/actions/route-actions';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { resetSecretKey, deleteAuth } from '../../api/user/user';
import { getDetail, saveOrUpdate as saveOrUpdateDrainage } from '../../api/setting/drainage';

const _title = "授权管理";
const _description = "";
const authEditPath = routerConfig["appManage.authEdit"].path;
const settingDrainagePath = routerConfig["setting.drainage"].path;


class DealerList extends Component {

  state = {
    tableDataList: null,
    showTableLoading: false,   

    secretModalIsVisible: false,
    selectAuthData: null,
    isResetStatus: false,
    copied: false,
    secretKey: null,
    openDrainageSetting: null,
    openDrainageId: null
  }

  componentDidMount() {
    this.props.changeRoute({ path: 'appManage.authManage', title: '授权管理', parentTitle: '应用管理' });
    this.getDrainageSetting();
  }

  getDrainageSetting = () => {
    getDetail()
      .then(pageData => {

        if (!pageData) {
          return;
        }

        let { openDrainageSetting, id } = pageData;

        if (openDrainageSetting == '1') {
          this.getPageData();
        }
        this.setState({
          openDrainageSetting,
          openDrainageId: id
        })

      })
  }

  openDrainageSettingClick = () => {

    let openDrainageSetting = "1";
    let id = this.state.openDrainageId;

    saveOrUpdateDrainage({ openDrainageSetting, id })
      .then(() => {
        Toast("开启引流成功!");
        this.getDrainageSetting();
      })
  }

  params = {
    page: 1
  }

  /******查询表单操作****************************************************************************************************************** */
  // 顶部查询表单
  formItemList = [
    {
      type: "INPUT",
      field: "inputData",
      style: { width: 240 },
      placeholder: "应用名称/appId/备注"
    }]
  //查询按钮点击事件
  searchClicked = (params) => {

    let { inputData } = params;
    inputData = inputData || null;
    this.params = {
      page: 1,
      ...params,
      inputData
    }
    this.getPageData();
  }


  // 获取页面列表
  getPageData = () => {
    let _this = this;
    this._showTableLoading();
    searchUserAuthList(this.params).then(res => {
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

  goAuthEdit = (id) => {
    let title = id == '0' ? '新增授权' : "编辑授权"
    this.props.changeRoute({ path: 'dealer.dealerEdit', title, parentTitle: '应用管理' });
  }

  deleteAuthClicked = (id) => {
    deleteAuth({ id })
      .then(() => {
        Toast("删除完毕！");
        this.getPageData();
      })
  }
  /**************************************************************************************** */
  // 表格相关列
  columns = [

    { title: "应用名称", dataIndex: "applicationName" },
    { title: "应用图标", dataIndex: "logo", render: data => data ? (<img src={data} style={{ height: 40, width: 40 }} />) : "--" },
    { title: "回调地址", dataIndex: "callbackAddress", render: data => data || "--" },
    { title: "AppID", dataIndex: "appId", render: data => data || "--" },
    { title: "备注", dataIndex: "remark", render: data => data || "--" },
    { title: "上次重置KEY时间", dataIndex: "resetSecretKeyTime", render: data => dateUtil.getDateTime(data) || "--" },
    {
      title: '操作',
      render: (text, record, index) => (
        <span>
          <a onClick={() => { this.showSecret(record) }}>查看Secret</a>
          <Divider type="vertical" />
          <span onClick={() => { this.goAuthEdit(record.id) }}>
            <NavLink to={authEditPath + "/" + record.id}>编辑</NavLink>
          </span>
          <Divider type="vertical" />
          <Popconfirm
            placement="topLeft" title='确认要删除吗？'
            onConfirm={() => { this.deleteAuthClicked(record.id) }} >
            <a size="small" className="color-red">删除</a>
          </Popconfirm>
        </span>
      )
    }
  ]

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

  showSecret = (selectAuthData) => {
    this.setState({
      secretModalIsVisible: true,
      selectAuthData
    })
  }

  _hideSecretModal = () => {
    this.setState({
      secretModalIsVisible: false,
      isResetStatus: false,
      secretKey: null,
      selectAuthData: null
    })
  }

  resetSecretClicked = () => {
    let { id } = this.state.selectAuthData;

    resetSecretKey({ id })
      .then(secretKey => {

        this.setState({
          secretKey,
          isResetStatus: true
        })
      })

  }

  onCopiedClicked = () => {
    this.setState({ copied: true });
    Toast("复制成功！")
  }
  getAuthAddress = (record) => {
    if (!record) {
      return;
    }
    let url = `http://h5.trace.adorsmart.com/openApi/ADAuth?userId=${record.userId}&appId=${record.appId}`;
    return url
  }

  /**渲染**********************************************************************************************************************************/

  render() {
    const { getFieldDecorator } = this.props.form;

    return (
      <CommonPage title={_title} description={_description} >
        {
          this.state.openDrainageSetting == '1' ?
            <div>
              <div className="flex-middle margin-bottom20">
                <SearchForm
                  towRow={false}
                  searchClicked={this.searchClicked}
                  formItemList={this.formItemList}
                >
                  <NavLink to={authEditPath + "/0"} className='margin-left20'>
                    <Button type='primary' icon='plus' className='margin-right20' onClick={() => { this.goAuthEdit(0) }}>添加授权</Button>
                  </NavLink>
                </SearchForm>
              </div>
              <Table
                indentSize={10}
                rowKey="id"
                columns={this.columns}
                loading={this.state.showTableLoading}
                pagination={this.state.pagination}
                dataSource={this.state.tableDataList}
                expandedRowRender={record =>
                  <p style={{ margin: 0 }}>
                    授权访问地址：
                    <a href={this.getAuthAddress(record)} target='_blank'>
                      {this.getAuthAddress(record)}
                    </a>
                    <CopyToClipboard text={this.getAuthAddress(record)}
                      onCopy={() => { this.onCopiedClicked() }}>
                      <span className='color-red margin-left' style={{ cursor: "pointer" }}>复制链接地址</span>
                    </CopyToClipboard>
                  </p>
                }
              />
            </div>
            :
            null
        }
        {
          this.state.openDrainageSetting == '0' ?
            <div className='middle-center' style={{ height: "100%" }}>
              <div className='line-height30' style={{ fontSize: 16, textAlign: "center" }}>
                <div>请先开启公众号引流</div>
                <div>再查看授权管理</div>
                <NavLink to={settingDrainagePath}>
                  <Button className='margin-top' type='primary'>马上开启</Button>
                </NavLink>
              </div>
            </div>
            : null
        }

        <Modal maskClosable={false}
          width={700}
          visible={this.state.secretModalIsVisible}
          titile='查看key'
          onCancel={this._hideSecretModal}
          footer={null}
        >
          <div className='middle-center padding20'>
            {
              this.state.selectAuthData ?
                <div className='line-height30' style={{ width: "100%" }}>
                  <Row className='line-height30 margin-bottom20'>
                    <Col span={6} className='text-right label'>
                      AppID：
              </Col>
                    <Col span={18}>
                      {this.state.selectAuthData.appId}
                    </Col>
                  </Row>
                  <Row className='line-height30 margin-bottom20'>
                    <Col span={6} className='text-right label'>
                      AppSecret：
                    </Col>
                    <Col span={18}>
                      {
                        this.state.isResetStatus && this.state.secretKey ?
                          <div>
                            <div className='flex'>
                              <div className='padding-left margin-right'>{this.state.secretKey} </div>
                              <CopyToClipboard text={this.state.secretKey}
                                onCopy={() => { this.onCopiedClicked() }}>
                                <a style={{ cursor: "pointer" }}>复制</a>
                              </CopyToClipboard>
                            </div>
                            <div className='line-height20 color-red'>为保障帐号安全，溯源系统将不再储存AppSecret；如果遗忘，请重置</div>
                          </div>
                          :
                          <Popconfirm
                            placement="bottomLeft" title='您确定要重置吗？重置后原Secret将失效'
                            onConfirm={() => { this.resetSecretClicked() }} >
                            <Button type='primary' >
                              重置Secret
                     </Button>
                          </Popconfirm>
                      }

                    </Col>
                  </Row>

                </div> : null
            }
          </div>
          <div className='text-right margin-top20'>
            <Button type='primary' onClick={this._hideSecretModal}>关闭</Button>
          </div>
        </Modal >
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