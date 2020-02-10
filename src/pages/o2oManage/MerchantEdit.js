import React, { Component } from "react";
import CommonPage from '../../components/common-page';
import { Table, Form, Input, Select, Collapse, Col, Row, Icon, Spin, Button, Upload, Divider, Tabs, Popconfirm, Radio, Modal, Checkbox, InputNumber } from "antd";
import Toast from '../../utils/toast';
import { SearchForm, SubmitForm } from '../../components/common-form';
import dateUtil from '../../utils/dateUtil';
import PictureWall from '../../components/upload/PictureWall';
import { getUpdatePictureUrl } from '../../api/product/product';
import { parseUrl } from '../../utils/urlUtils';
import RichText from '../../components/RichText/RichText';
import { connect } from 'react-redux';
import { changeRoute } from '../../store/actions/route-actions';
import LocationMap from '../dealer/LocationAmap';
import { getMerchantDetail, saveOrUpdate, deleteBusinessArea } from '../../api/merchant/merchant';


const _title = "商家编辑/新建";
const _description = "";
const _updateUrl = getUpdatePictureUrl({ folder: "pdf" });

class MerchantPage extends Component {

  state = {

    showPageLoading: false,
    selectmerchant: {},

    merchantModalVisible: false,
    resetFormItem: null,
    merchantHeadPicUrl: null,
    showHeaderImgValidateInfo: false,
    editFormValue: null,
    selectmerchantModalData: null,
    updateLogTime: null,

    pdfFile: null,
    fileUploading: false,



    rule: "1",
    constantRule: "1",
    areaDistant: null,
    areaList: []
  }

  componentDidMount() {

    let id = this.props.match.params.id;
    let isEdit = id && id != 0
    let title = isEdit ? "商家编辑" : "商家添加";
    this.setState({
      id: isEdit ? id : null,
      isEdit,
      _title: title,
      showActivityDetailLoading: false
    })
    this.props.changeRoute({ path: 'o2oManage.merchantEdit', title, parentTitle: 'O2O管理' });
    this.getPageData();
  }


  // 获取页面列表
  getPageData = () => {

    let id = this.getUrlAppId() || null;
    if (!id || id == 0) {
      this.revertmerchantCodeData();
      this.setState({
        merchantData: {}
      })
      return;
    }
    this.setState({
      showPageLoading: true
    })
    getMerchantDetail({ id })
      .then(merchantData => {
        this.setState({
          merchantData
        })
        this.revertmerchantCodeData(merchantData);
      })
      .catch(() => {
        this.setState({
          showPageLoading: false
        })
      })
  }

  getUrlAppId = () => {
    let urlParams = parseUrl(this.props.location.search);
    if (urlParams && urlParams.args && urlParams.args.id) {
      return urlParams.args.id
    }
  }


  /**新加商家*******************************************************************************************************************************/

  revertmerchantCodeData = (record) => {
    this.setState({
      showPageLoading: false
    })
    if (record) {
      let { id, image, name, phone, areaList, mileage, rule } = record
      let editFormValue = { phone: phone || null, name: name || null };
      let areaDistant = null;
      let constantRule = null;
      if (rule == '1') {
        areaDistant = mileage;
      } else {
        constantRule = mileage;
      }

      this.setState({
        merchantHeadPicUrl: image,
        editFormValue,
        areaList,
        areaDistant,
        constantRule,
        rule: rule ? rule.toString() : "1",
        selectmerchantModalData: record
      })
     
    } else {

      this.setState({
        merchantHeadPicUrl: null,
        editFormValue: null,
        selectmerchantModalData: null
      })
    }
  }

  newMerchantSaveClicked = (data) => {

    let image = this.state.merchantHeadPicUrl;
    if (!image) {
      this.setState({
        showHeaderImgValidateInfo: true
      })
      return;
    } else {
      this.setState({
        showHeaderImgValidateInfo: false
      })
    }

    let { rule, areaDistant, constantRule, areaList } = this.state;
    let mileage = null;
    if (rule == '1') {
      constantRule = null
      mileage = areaDistant;
      if (parseInt(areaDistant) > 10) {
        Toast('半径不能超过10公里！');
        return;
      }
    } else {
      areaDistant = null;
      mileage = constantRule;
    }


    let params = { ...data, image, rule, mileage, areaListStr: JSON.stringify(areaList) };
    let toastTitle = "添加商家成功！";
    if (this.state.selectmerchantModalData) {
      let { id } = this.state.selectmerchantModalData;
      params.id = id;
      toastTitle = "修改商家成功！";
    }

    saveOrUpdate(params)
      .then(() => {
        Toast(toastTitle);
        this.getPageData();
        this.goEditBack();

      })
  }

  newMerchantFormList = [{
    type: "INPUT",
    field: "name",
    label: "商家名称:",
    disabled: false,
    placeholder: "请输入",
    props: { maxLength: 20 },
    rules: [
      { required: true, message: '请输入!' },
    ]
  },
  {
    type: "INPUT",
    field: "phone",
    disabled: false,
    label: "联系电话:",
    props: { maxLength: 20 },
    placeholder: "请输入",
    rules: [
      { required: true, message: '请输入!' },
      { pattern: /^[0-9]+$/, message: "请输入正确的联系电话！" }
    ]
  }]

  uploadMerchantHeadPic = (picList) => {
    let merchantHeadPicUrl = ''
    if (!picList || !picList.length) {
      this.setState({
        merchantHeadPicUrl
      })
      return;
    }
    merchantHeadPicUrl = picList[0];
    this.setState({
      merchantHeadPicUrl
    })
  }


  /**地图****************************************************************************************************************************************************/

  selectShopLocationClicked = (item, index) => {

    this.showLocationModal(item, index)
  }

  showLocationModal = (item, locationIndex) => {
    let location = null;

    if (item) {
      let { lng, lat, address, id } = item;
      location = { tencentLng: lng, tencentLat: lat, address, id };
    }

    this.setState({
      locationModalVisible: true,
      location,
      locationIndex
    })
  }

  _hideLocationModal = () => {
    this.setState({
      locationModalVisible: false
    })
  }

  updateStationPosition = (params) => {


    let { tencentLng, tencentLat, address, areaNameObj } = params;
    let areaName = '';
    if (areaNameObj) {
      let { province, district, city } = areaNameObj;
      areaName = this.getAreaName(areaNameObj);
    }
    let location = { tencentLng, tencentLat, address, areaName };
    let locationData = { lng: tencentLng, lat: tencentLat, areaName, address };
    let areaList = this.state.areaList;
    let locationIndex = this.state.locationIndex;
    if (locationIndex || locationIndex == 0) {
      let { id } = areaList[locationIndex];
      areaList[locationIndex] = { ...locationData, id };
    } else {
      let len = areaList.length;
      areaList[len] = locationData;
    }

    this.setState({
      location,
      areaList
    });
    this._hideLocationModal();
  }

  // 填充没有市的情况
  getAreaName = (areaNameObj) => {
    let { province, district, city } = areaNameObj;

    if (city || /市/.test(province)) {

      city = city ? city : province;
      return `${province}-${city}-${district}`
    }
    return `${province}-${district}`
  }

  deleteLocation = (index) => {
    let areaList = this.state.areaList;
    let data = areaList[index];
    if (data.id) {
      deleteBusinessArea({ id: data.id })
        .then(() => {
          Toast('删除成功！');
          this.getPageData();
          return;
        })
    } else {
      areaList.splice(index, 1);
      this.setState({
        areaList
      })
    }

  }

  onruleChange = (rule) => {

    let constantRule = this.state.constantRule;
    if (rule == '2') {
      constantRule = '1';
    }
    this.setState({
      rule,
      constantRule
    })

  }

  onconstantRuleChange = (constantRule) => {
    this.setState({
      constantRule
    })
  }

  // 返回
  goEditBack = () => {
    window.history.back();
  }

  onDistantChange = (areaDistant) => {
    this.setState({
      areaDistant
    })
  }

  getNow = () => {
    return Date.now() + Math.random() * 10000;
  }
  /**渲染**********************************************************************************************************************************/

  render() {
    const { getFieldDecorator } = this.props.form;
    const { selectmerchant, pdfPageNumber, pdfNumPages, pdfFile } = this.state;
    const uploadProps = {
      name: 'files',
      action: _updateUrl,
      accept: ".pdf",
      disabled: !!pdfFile,
      showUploadList: false,
      onChange: this.onPdfFileChange
    };

    return (
      <CommonPage title={_title} description={_description} >
        <Spin spinning={this.state.showPageLoading}>
          <div style={{ width: 900 }}>
            <SubmitForm
              labelCol={{ span: 5 }}
              wrapperCol={{ span: 12 }}
              addonBefore={
                <Row className='line-height40 margin-top20'>
                  <Col span={5} className='text-right'>
                    <span className='label-color label-required'>商家图：</span>
                  </Col>
                  <Col span={19}>
                    <PictureWall
                      allowType={['1', '2']}
                      folder='store'
                      pictureList={this.state.merchantHeadPicUrl ? [this.state.merchantHeadPicUrl] : null}
                      uploadCallback={this.uploadMerchantHeadPic}
                    />
                    <div className='color-red' style={{ lineHeight: "16px" }}>建议尺寸420px*420px，可上传非该尺寸的图片，图片格式png、jpg，大小不超过3MB</div>
                    {
                      this.state.showHeaderImgValidateInfo ?
                        <div className='line-height18 color-red' style={{ textAlign: "left" }}>请设置商家图片</div> :
                        null
                    }
                  </Col>
                </Row>
              }
              clearWhenHide={true}
              setFormValue={this.state.editFormValue}
              resetFormItem={this.state.resetFormItem}
              isForceSetValue={true}
              formItemList={this.newMerchantFormList}
              saveClicked={this.newMerchantSaveClicked}
              buttonsStyle={{ display: "flex", padding: "5px 0 5px 176px", width: "100%", lineHeight: 30, marginTop: 20 }}
              addonBeforeButton={
                <Button className='margin-right normal' onClick={this.goEditBack}>返回</Button>
              }

            >
              <>
                <Row className='line-height40'>
                  <Col span={5} className='text-right'>
                    <span className='label-color label-required'>服务区域：</span>

                  </Col>
                  <Col span={16} >
                    <div className='color-red'>服务区域为服务的具体地点，如果某服务区域有单独发券的可能，建议单独创建一个商家</div>
                    {
                      this.state.areaList && this.state.areaList.length ?
                        this.state.areaList.map((item, index) =>
                          <div key={item.id || this.getNow()} className='flex align-center margin-bottom' style={{ width: 600 }}>
                            <span className='color-green' >区域{index + 1}：</span>
                            <div style={{ width: 460, lineHeight: "16px" }}>
                              <a
                                onClick={() => { this.selectShopLocationClicked(item, index) }}
                              >
                                {`${item.areaName}-${item.address}`}
                              </a>
                            </div>
                            <Popconfirm
                              placement="topLeft" title='确认要删除该地址吗？'
                              onConfirm={() => { this.deleteLocation(index) }} >
                              <span><Icon type="delete" className='color-red' style={{ fontSize: 24, cursor: "pointer" }} /></span>
                            </Popconfirm>
                          </div>
                        )
                        : null
                    }
                    <a
                      onClick={() => { this.selectShopLocationClicked() }}
                      style={{ marginTop: "10px", display: "Block", width: 400, height: 40, textAlign: "center", border: "1px dashed #CCC", borderRadius: "4px" }}>
                      + 添加区域
                    </a>
                  </Col>
                </Row>

                <Row className='line-height40 margin-top20'>
                  <Col span={5} className='text-right'>
                    <span className='label-color label-required'>券商活动券发现规则：</span>
                  </Col>
                  <Col span={16} >
                    <div className='color-red' style={{ lineHeight: "20px", padding: "10px 0" }}>
                      券商活动券发放规则是以服务区域作为基准点,固定区域为服务区域所在的区、市；半径区域是以服务区域作为圆心覆盖一定半径的区域
                    </div>
                    <Select value={this.state.rule} onChange={this.onruleChange} style={{ width: 120, marginRight: "20px" }}>
                      <Select.Option value={'1'}>半径距离</Select.Option>
                      <Select.Option value={'2'}>固定区域</Select.Option>
                    </Select>
                    {
                      this.state.rule == '1' ?
                        <span><InputNumber value={this.state.areaDistant} onChange={this.onDistantChange} precision={2} min={0} max={10} /> 公里</span>
                        :
                        null

                    }
                    {
                      this.state.rule == '2' ?
                        <span>
                          <Select value={this.state.constantRule} onChange={this.onconstantRuleChange} style={{ width: 120 }}>
                            <Select.Option value={'1'}>同区</Select.Option>
                            <Select.Option value={'2'}>同市</Select.Option>
                          </Select>
                        </span>
                        :
                        null
                    }
                  </Col>
                </Row>

              </>
            </SubmitForm>
          </div>
        </Spin>


        <Modal maskClosable={false}
          title="区域定位"
          visible={this.state.locationModalVisible}
          footer={null}
          onCancel={this._hideLocationModal}
          width={1000}
        >
          <LocationMap
            refreshPageData={this.getPageData}
            visible={this.state.locationModalVisible}
            selectStation={this.state.location}
            showAreaName={true}
            updateStationPosition={this.updateStationPosition}
          />
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
export default connect(mapStateToProps, mapDispatchToProps)(Form.create()(MerchantPage));