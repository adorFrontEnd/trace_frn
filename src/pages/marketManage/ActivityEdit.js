import React, { Component } from "react";
import { Col, Row, Checkbox, Card, Modal, Spin, Form, Switch, DatePicker, Button, Input, Table, Select, InputNumber } from 'antd';
import Toast from '../../utils/toast';
import CommonPage from '../../components/common-page';
import { SearchForm } from '../../components/common-form';
import dateUtil from '../../utils/dateUtil';
import { connect } from 'react-redux';
import { changeRoute } from '../../store/actions/route-actions'
import { searchActivityList, deleteActivity, saveOrUpdate, getDetail } from '../../api/activity/activity';
import moment from 'moment';
import ReactQuill, { Quill } from 'react-quill';
import { ImageDrop } from 'quill-image-drop-module';
import 'react-quill/dist/quill.snow.css';
import AreaSelectModal from '../../components/areaSelect/AreaSelectModal';
import PicturesWallModal from '../../components/upload/PictureWallModal';

const _description = "";
const _NOW = Date.now();
const activityTypeEnum = {
  "0": { key: "0", label: "满赠活动" },
  "1": { key: "1", label: "积分活动" },
  "2": { key: "2", label: "大转盘" }
}
class Page extends Component {
  state = {
    id: 0,
    showActivityDetailLoading: false,
    activityDetail: null,
    shipStatus: false,
    storeStatus: false,
    location: null,
    locationModalVisible: false,
    areaSelectModalVisible: false,
    selectAreaList: null,
    selectAreaNames: "",
    phoneBindingChecked: false,
    uploadModalVisible: false,
    showRichTextValidateInfo: false,
    richText: null,
    acivityIsEnd: false,
    isBigWheel: false
  }

  componentWillMount() {
    let id = this.props.match.params.id;
    let isEdit = id && id != 0
    let title = isEdit ? "活动编辑" : "活动添加";
    this.setState({
      id: isEdit ? id : null,
      isEdit,
      _title: title,
      showActivityDetailLoading: false
    })
    this.props.changeRoute({ path: 'marketManage.activityEdit', title, parentTitle: '营销工具' });

    this.getActivityDetail(id);
  }

  getActivityDetail = (id) => {
    id = id || this.state.id;
    if (!id || id == 0) {
      return;
    }

    this._showActivityDetailLoading();
    getDetail({ id })
      .then(activityDetail => {

        let { name, description, type, restrict, phoneBinding, startActivityTime, endActivityTime, areaName, areaId, detail } = activityDetail;

        let checkedAreaData = areaId ? areaId.split(',').map(item => { return { id: item, arealevel: 2 } }) : [];
        let time = [moment(startActivityTime), moment(endActivityTime)]
        let phoneBindingChecked = phoneBinding == '1';
        let typeStr = type.toString();
        type = (type || type == 0) ? activityTypeEnum[typeStr] : null
        let isBigWheel = typeStr == '2';
        this.setState({
          activityDetail,
          selectAreaNames: areaName,
          phoneBindingChecked,
          checkedAreaData,
          richText: detail,
          isBigWheel,
          acivityIsEnd: _NOW > endActivityTime
        })
        restrict = parseInt(restrict);
        this.props.form.setFieldsValue({
          name, description, type, restrict, phoneBinding, time
        });
        this._hideActivityDetailLoading();

      })
      .catch(() => {
        this._hideActivityDetailLoading();
      })
  }

  _showActivityDetailLoading = () => {
    this.setState({
      showActivityDetailLoading: true
    })
  }

  _hideActivityDetailLoading = () => {
    this.setState({
      showActivityDetailLoading: false
    })
  }


  // 返回
  goEditBack = () => {
    window.history.back();
  }

  saveDataClicked = () => {
    this.props.form.validateFields((err, params) => {
      if (err) {
        return;
      }

      let richText = this.state.richText;
      if (!richText) {
        this.setState({
          showRichTextValidateInfo: true
        })
        Toast("请编辑活动详情！");
        return;
      } else {
        this.setState({
          showRichTextValidateInfo: false
        })
      }

      params.id = this.state.id;
      let { time, type } = params;
      type = type.key;
      let phoneBinding = this.state.phoneBindingChecked ? "1" : "0";

      if (type == '2' && phoneBinding == '0') {
        Toast("大转盘活动强制要求绑定手机号!");
        return;
      }

      let [startTime, stopTime] = time;
      let startActivityTimeStamp = dateUtil.getDayStartStamp(Date.parse(startTime));
      let endActivityTimeStamp = dateUtil.getDayStopStamp(Date.parse(stopTime));

      let id = !this.state.id || this.state.id == '0' ? null : this.state.id;
      let areaId = this.state.selectAreaIds;
      let areaName = type == '2' ? '全国' : this.state.selectAreaNames;
      let data = {
        ...params,
        type,
        time: null,
        areaId,
        areaName,
        phoneBinding,
        startActivityTimeStamp,
        endActivityTimeStamp,
        detail: richText
      }
      saveOrUpdate(data)
        .then(() => {

          Toast(`${id ? "保存" : "添加"}成功!`, "success");
          this.goEditBack();

        })
    })
  }


  selectAreaClicked = () => {
    this.showAreaSelectModal();
  }

  showAreaSelectModal = () => {
    this.setState({
      areaSelectModalVisible: true
    })
  }

  hideAreaSelectModal = () => {
    this.setState({
      areaSelectModalVisible: false
    })
  }

  onSaveClick = (selectAreaList) => {
    let selectAreaIds = this.getSelectAreaListLevel2Ids(selectAreaList);
    let selectAreaNames = this.getSelectAreaListName(selectAreaList)
    this.setState({
      selectAreaList,
      selectAreaIds,
      selectAreaNames
    })
  }


  getSelectAreaListName = (selectAreaList) => {
    if (!selectAreaList || !selectAreaList.length) {
      return "";
    }
    let arr = selectAreaList.filter(item => item.arealevel == '1').map(item => item.name);
    let result = arr && arr.length ? arr.join('、') : "";
    return result;

  }

  getSelectAreaListLevel2Ids = (selectAreaList) => {
    if (!selectAreaList || !selectAreaList.length) {
      return '';
    }
    let arr = selectAreaList.filter(item => item.arealevel == '2').map(item => item.id);
    let result = arr && arr.length ? arr.join() : '';
    return result
  }


  onPhoneBindingChange = (phoneBindingChecked) => {
    this.setState({
      phoneBindingChecked
    })
  }

  onActivityChange = (e) => {
    let type = e.key;
    let isBigWheel = type == '2';
    this.setState({
      isBigWheel
    })
  }

  /**富文本 ********************************************************************************************************************/
  onRichTextChange = (richText) => {
    this.setState({ richText })
  }

  modules = {
    toolbar: {
      container: [['image']],
      handlers: {
        image: this.imageHandler.bind(this)
      }
    },
    clipboard: {
      // toggle to add extra line breaks when pasting HTML:
      matchVisual: false,
    }
  }

  imageHandler() {

    this.setState({
      uploadModalVisible: true
    })
  }

  hideUploadModal = () => {
    this.setState({
      uploadModalVisible: false
    })
  }

  onUploadModalOk = (pictureUrl) => {

    this.hideUploadModal()
    let quill = this.refs.reactQuillRef.getEditor();//获取到编辑器本身
    const cursorPosition = quill.selection.savedRange.index;//获取当前光标位置
    quill.insertEmbed(cursorPosition, "image", pictureUrl, Quill.sources.USER);//插入图片
    quill.setSelection(cursorPosition + 1);//光标位置加1s
  }

  formats = [
    'header', 'font', 'size',
    'bold', 'italic', 'underline', 'strike', 'blockquote',
    'list', 'bullet', 'indent',
    'link', 'image', 'video'
  ]

  render() {
    const { getFieldDecorator } = this.props.form;
    const { selectAreaNames } = this.state;
    return (
      <CommonPage title={this.state._title} description={_description} >
        <Spin spinning={this.state.showActivityDetailLoading}>
          <div style={{ width: 600 }}>
            <Row className='line-height40 padding10-0'>
              <Col offset={5}>
                <Button type='primary' style={{ width: 100 }} onClick={this.saveDataClicked}>保存</Button>
                <Button type='primary' className='yellow-btn margin-left' style={{ width: 100 }} onClick={this.goEditBack}>返回</Button>
              </Col>
            </Row>

            <Form className='common-form'>
              <Form.Item
                labelCol={{ span: 5 }}
                wrapperCol={{ span: 19 }}
                label='活动名称：'
                field='name'>
                {
                  getFieldDecorator('name', {
                    rules: [
                      { required: true, message: '请填写活动名称!' }
                    ]
                  })(
                    <Input disabled={this.state.isEdit && this.state.acivityIsEnd} minLength={0} maxLength={20} placeholder='请填写活动名称' />
                  )
                }
              </Form.Item>

              <Form.Item
                labelCol={{ span: 5 }}
                wrapperCol={{ span: 19 }}
                label='活动描述：'
                field='description'>
                {
                  getFieldDecorator('description', {
                    rules: [
                      { required: true, message: '请填写活动描述!' }
                    ]
                  })(
                    <Input disabled={this.state.isEdit && this.state.acivityIsEnd} minLength={0} maxLength={20} placeholder='请填写活动描述' />
                  )
                }
              </Form.Item>

              <Form.Item
                labelCol={{ span: 5 }}
                wrapperCol={{ span: 19 }}
                label='活动类型：'
                field='type'>
                {
                  getFieldDecorator('type', {
                    rules: [
                      { required: true, message: '请选择活动类型!' }
                    ]
                  })(
                    <Select disabled={this.state.isEdit} placeholder='请选择活动类型' labelInValue onChange={this.onActivityChange}>
                      <Select.Option value="0">满赠活动</Select.Option>
                      <Select.Option value="1">积分活动</Select.Option>
                      <Select.Option value="2">大转盘</Select.Option>
                    </Select>
                  )
                }
              </Form.Item>

              <Form.Item
                labelCol={{ span: 5 }}
                wrapperCol={{ span: 19 }}
                label='参与限制：'
                field='restrict'>
                {
                  getFieldDecorator('restrict', {
                    rules: [
                      { required: true, message: '请填写限制次数!' }
                    ]
                  })(
                    <InputNumber disabled={this.state.isEdit} min={0} precision={0} minLength={0} maxLength={20} placeholder='请填写限制次数' style={{ width: 200 }} />
                  )
                }
                <span className='color-red padding-left'>一个普通用户最多能参与多少次活动</span>
              </Form.Item>

              <Row className='line-height40 margin-top'>
                <Col span={5} className='text-right'>
                  <span className='label-color'>绑定手机号：</span>
                </Col>
                <Col span={19}>
                  <Switch disabled={this.state.isEdit} checked={this.state.phoneBindingChecked} onChange={this.onPhoneBindingChange} />
                  {
                    this.state.isBigWheel ?
                      <span className='color-red margin-left'>大转盘活动强制要求绑定手机号</span>
                      :
                      null
                  }

                </Col>
              </Row>

              <Form.Item
                labelCol={{ span: 5 }}
                wrapperCol={{ span: 19 }}
                label='活动时间：'
                field='time'>
                {
                  getFieldDecorator('time', {
                    rules: [
                      { required: true, message: '请填写活动时间!' }
                    ]
                  })(
                    <DatePicker.RangePicker disabled={this.state.isEdit} />
                  )
                }
              </Form.Item>

              <Row className='line-height40 margin-top'>
                <Col span={5} className='text-right'>
                  <span className='label-color label-required'>活动区域：</span>
                </Col>
                <Col span={19}>
                  <div>
                    <Button type='primary' disabled={this.state.isBigWheel} onClick={this.selectAreaClicked}>选择活动区域</Button>
                    {
                      this.state.isBigWheel ?
                        <span className='color-red margin-left'>大转盘活动为全国性活动，不可修改区域范围</span>
                        :
                        null
                    }
                  </div>
                  <div>
                    {
                      this.state.isBigWheel ?
                        "全国" :
                        selectAreaNames
                    }
                  </div>

                </Col>
              </Row>
              <Row className='line-height40 margin-top'>
                <Col span={5} className='text-right'>
                  <span className='label-color label-required'>活动详情：</span>
                </Col>
                <Col span={19}>
                  {
                    this.state.acivityIsEnd ?
                      <div dangerouslySetInnerHTML={{ __html: this.state.richText }}></div>
                      :
                      <div>
                        <ReactQuill
                          ref='reactQuillRef'
                          theme={'snow'}
                          onChange={this.onRichTextChange}
                          value={this.state.richText || ''}
                          modules={this.modules}
                          formats={this.formats}
                          placeholder='编辑活动详情(图片)...'
                        />
                        <div className='line-height18 color-red' style={{ textAlign: "left" }}>长度不能超过16000px</div>
                        {
                          this.state.showRichTextValidateInfo ?
                            <div className='line-height18 color-red'>请编辑活动详情</div> :
                            null
                        }
                      </div>
                  }

                </Col>
              </Row>
            </Form>
          </div>
        </Spin>
        <AreaSelectModal
          shouldNotSave={this.state.isEdit}
          checkedAreaData={this.state.checkedAreaData}
          hide={this.hideAreaSelectModal}
          visible={this.state.areaSelectModalVisible}
          onSaveClick={this.onSaveClick}
        />
        <PicturesWallModal
          visible={this.state.uploadModalVisible}
          onCancel={this.hideUploadModal}
          onOk={this.onUploadModalOk}
        />



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