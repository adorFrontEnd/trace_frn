import React, { Component } from "react";
import CommonPage from '../../components/common-page';
import { Table, Form, Input, Select, Col, Row, Icon, Button, Divider, Popconfirm, Radio, Modal, Checkbox, InputNumber, Upload } from "antd";
import { pagination } from '../../utils/pagination';
import Toast from '../../utils/toast';
import { SearchForm, SubmitForm } from '../../components/common-form';
import dateUtil from '../../utils/dateUtil';
import { searchAttentionList, exportUserList } from '../../api/user/user';
import { NavLink, Link } from 'react-router-dom';
import { baseRoute, routerConfig } from '../../config/router.config';
import { connect } from 'react-redux';
import { changeRoute } from '../../store/actions/route-actions';
import { getDetail, saveOrUpdate as saveOrUpdateDrainage } from '../../api/setting/drainage';


const _title = "会员列表";
const _description = "";
const integralRecordPath = routerConfig["marketManage.integralRecord"].path;
const giftRecordPath = routerConfig["marketManage.giftRecord"].path;
const settingDrainagePath = routerConfig["setting.drainage"].path;

const sexEnum = {
  "1": "男", "2": "女", "0": "未知"
}
class DealerList extends Component {

  state = {
    tableDataList: null,
    showTableLoading: false,
    exportUserListUrl: null,
    openDrainageId: null,
    openDrainageSetting: null
  }

  componentDidMount() {
    this.props.changeRoute({ path: 'marketManage.userList', title: '会员列表', parentTitle: '市场营销' });
    this.getDrainageSetting();

  }

  goIntegralRecord = () => {
    let title = '积分记录';
    this.props.changeRoute({ path: 'marketManage.integralRecord', title, parentTitle: '市场营销' });
  }

  goGiftRecord = () => {
    let title = '兑奖记录';
    this.props.changeRoute({ path: 'marketManage.giftRecord', title, parentTitle: '市场营销' });
  }

  params = {
    page: 1
  }

  /******查询表单操作****************************************************************************************************************** */
  // 顶部查询表单
  formItemList = [{
    type: "SELECT",
    field: "subscribe",
    addonBefore: "关注",
    style: { width: 140 },
    defaultOption: { id: null, name: "选择是否关注" },
    placeholder: '选择是否关注',
    initialValue: null,
    optionList: [{ id: "1", name: "是" }, { id: "0", name: "否" }]
  },
  {
    type: "SELECT",
    field: "sex",
    style: { width: 140 },
    defaultOption: { id: null, name: "选择性别" },
    placeholder: '选择加盟商',
    initialValue: null,
    optionList: [{ id: "1", name: "男" }, { id: "2", name: "女" }, { id: "0", name: "未知" }]
  },
  {
    type: "INPUT",
    field: "inputData",
    style: { width: 240 },
    placeholder: "微信昵称/手机号/省份/城市"
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
  // 重置
  resetClicked = () => {
    this.props.form.resetFields();
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

  // 获取页面列表
  getPageData = () => {
    let _this = this;
    this._showTableLoading();
    searchAttentionList(this.params).then(res => {
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

  /**************************************************************************************** */
  // 表格相关列
  columns = [

    { title: "会员编号", dataIndex: "id" },
    { title: "微信昵称", dataIndex: "nickname", render: data => data || "--" },
    { title: "头像", dataIndex: "avatar", render: data => data ? (<img src={data} style={{ height: 40, width: 40 }} />) : "--" },
    { title: "注册时间", dataIndex: "createTime", render: data => dateUtil.getDateTime(data) || "--" },
    { title: "性别", dataIndex: "sex", render: data => data ? sexEnum[data] : "--" },
    { title: "省份", dataIndex: "province", render: data => data || "--" },
    { title: "城市", dataIndex: "city", render: data => data || "--" },
    { title: "手机号", dataIndex: "phone", render: data => data || "--" },
    { title: "是否关注公众号", dataIndex: "subscribe", render: data => data == '1' ? "是" : "否" },
    {
      title: '操作',
      render: (text, record, index) => (
        <span>
          <span onClick={() => { this.goIntegralRecord(record.id) }}><NavLink to={integralRecordPath + "/" + record.id}>积分记录</NavLink></span>
          <Divider type="vertical" />
          <span onClick={() => { this.goGiftRecord(record.id) }}><NavLink to={giftRecordPath + "/" + record.id}>兑奖记录</NavLink></span>
          {/* <Divider type="vertical" />
          <Popconfirm
            placement="topLeft" title='确认要删除吗？'
            onConfirm={() => { this.deleteTableItem(record) }} >
            <a size="small" className="color-red">删除</a>
          </Popconfirm> */}
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

  exportUserListData = () => {
    let exportUserListUrl = exportUserList(this.params);
    if (!exportUserListUrl) {
      Toast("导出失败！")
      return;
    }
    this.setState({
      exportUserListUrl
    })

    setTimeout(() => {
      this.refs.exportUserListUrl.click()
    }, 1000)
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
                  formItemList={this.formItemList}>
                  <Button type='primary' style={{ minWidth: 100 }} icon="upload" className="yellow-btn margin-left" onClick={() => { this.exportUserListData() }}>导出</Button>
                </SearchForm>
              </div>
              <a ref="exportUserListUrl" download="设备数据" style={{ 'display': "none" }} href={this.state.exportUserListUrl} ></a>
              <Table
                indentSize={10}
                rowKey="id"
                columns={this.columns}
                loading={this.state.showTableLoading}
                pagination={this.state.pagination}
                dataSource={this.state.tableDataList}
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
                <div>再查看会员列表</div>
                <NavLink to={settingDrainagePath}>
                  <Button className='margin-top' type='primary'>马上开启</Button>
                </NavLink>
              </div>
            </div>
            :
            null
        }

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