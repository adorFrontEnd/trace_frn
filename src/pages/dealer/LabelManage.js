import React, { Component } from "react";
import CommonPage from '../../components/common-page';
import { Table, Form, Input, Select, Col, Spin, Row, Icon, Button, Divider, Popconfirm, Radio, Modal, Checkbox, InputNumber, Upload } from "antd";
import Toast from '../../utils/toast';
import { SearchForm, SubmitForm } from '../../components/common-form';
import { searchLabelList, saveOrUpdateLabel, deleteLabel, getDetail } from '../../api/dealer/label';
import dateUtil from '../../utils/dateUtil';

const _title = "标签管理";
const _description = "";

class LabelManage extends Component {

  state = {
    labelList: null,
    labelName: null,
    pageDataLoading: false,
    labelModalIsVisible: false,
    selectItem: null,
    modalLabelName: null

  }

  componentDidMount() {
    this.getPageData();
  }


  getPageData = (params) => {
    this._showPageLoading();
    searchLabelList(params)
      .then(res => {
        let { data } = res;
        this.setState({
          labelList: data      
        })
        this._hidePageLoading();
      })
      .catch(() => { this._hidePageLoading() })
  }

  _showPageLoading = () => {
    this.setState({
      pageDataLoading: true
    })
  }

  _hidePageLoading = () => {
    this.setState({
      pageDataLoading: false
    })
  }


  addLabelClicked = () => {

    let name = this.state.labelName;
    if (!name) {
      Toast('请输入标签名称！');
      return;
    }
    this._showPageLoading();
    saveOrUpdateLabel({ name })
      .then(() => {
        Toast('添加标签成功！')
        this.getPageData();
      })
      .catch(() => { this._hidePageLoading() })

  }

  inputLabelOnchange = (e) => {
    let labelName = e.currentTarget.value;
    this.setState({
      labelName
    })
  }

  deleteLabelClicked = (item) => {

    if (!item || !item.id) {
      return;
    }
    let id = item.id;
    deleteLabel({ id })
      .then(() => {
        Toast('删除完毕！')
        this.getPageData();
      })
  }

  editLabelClicked = (selectItem) => {
    this.setState({
      selectItem
    })
    this._showLabelModal();
  }

  _showLabelModal = () => {
    this.setState({
      labelModalIsVisible: true
    })
  }

  _hideLabelModal = () => {
    this.setState({
      labelModalIsVisible: false
    })
  }

  inputModalLabelOnchange = (e) => {
    let modalLabelName = e.currentTarget.value;
    this.setState({
      modalLabelName
    })
  }

  labelModalSaveClicked = () => {
    let name = this.state.modalLabelName;
    if (!name) {
      Toast('请输入标签名称！');
      return;
    }
    let { id } = this.state.selectItem;
    this._showPageLoading();
    saveOrUpdateLabel({ name, id })
      .then(() => {
        Toast('保存标签成功！')
        this.getPageData();
        this._hideLabelModal();
      })
      .catch(() => { this._hidePageLoading() })
  }

  filterInputOnChange = (e) => {
    let filterKeyword = e.currentTarget.value;
    this.setState({
      filterKeyword
    })
  }

  filterLabelClicked = () => {
    let inputData = this.state.filterKeyword;
    if (!inputData || !inputData.length) {
      return;
    } 
    this.getPageData({ inputData });
  }

  filterLabelClearClicked = () => {
    this.setState({
      filterKeyword:""
    })
    this.getPageData();
  }
  /**渲染**********************************************************************************************************************************/

  render() {

    let { labelList } = this.state;
    return (
      <CommonPage title={_title} description={_description} >
        <Spin spinning={this.state.pageDataLoading}>

          <div className='margin-bottom20'>
            <div className='flex'><Input style={{ width: 300 }} onChange={this.inputLabelOnchange} />
              <Button icon='plus' type='primary' onClick={this.addLabelClicked}>添加标签</Button>
              <div className='color-red margin-left line-height30'>请勿填写重复的标签名称</div>
            </div>
          </div>
          <div>
            <div className='padding' style={{ border: "1px solid #ccc", width: 450, borderRadius: "4px" }}>
              <Input style={{ width: 300 }} value={this.state.filterKeyword} placeholder='输入标签名称' onChange={this.filterInputOnChange} />
              <Button icon='filter' type='primary' onClick={this.filterLabelClicked} disabled={!this.state.filterKeyword}>筛选</Button>
              <a className='margin-left' onClick={this.filterLabelClearClicked} >清除</a>
            </div>
            <div style={{ width: 450 ,maxHeight: "58vh", overflowY: "auto",marginTop:10}}>
              {
                labelList && labelList.length ?
                  labelList.map(item =>
                    <div key={item.id} className='flex-between' style={{ borderBottom: "1px solid #f2f2f2", lineHeight: "30px", padding: "5px 10px" }}>
                      <span>{item.name}</span>
                      <span>
                        <a onClick={() => { this.editLabelClicked(item) }}>编辑标签</a>
                        <Popconfirm
                          placement="topLeft" title='确认要删除吗？'
                          onConfirm={() => { this.deleteLabelClicked(item) }} >
                          <a className='color-red margin-left'>删除</a>
                        </Popconfirm>
                      </span>
                    </div>
                  )
                  : null
              }
            </div>
          </div>
        </Spin>
        <Modal
          title='修改标签名称'
          visible={this.state.labelModalIsVisible}
          onCancel={this._hideLabelModal}
          onOk={this.labelModalSaveClicked}
        >
          <div className='middle-center line-height30'>
            <div>
              {
                this.state.selectItem ?
                  <div className='margin-bottom'>原标签名称：<span className='color-red'>{this.state.selectItem.name}</span></div>
                  : null
              }
              <div>填写新标签名称：</div>
              <div><Input style={{ width: 200 }} onChange={this.inputModalLabelOnchange} /></div>
              <div className='color-red' >新标签名称请勿重复</div>
            </div>
          </div>
        </Modal>
      </CommonPage >
    )
  }
}

export default LabelManage;