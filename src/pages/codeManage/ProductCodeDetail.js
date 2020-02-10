import React, { Component } from "react";
import CommonPage from '../../components/common-page';
import { Form, Input, Col, Row, Icon, Spin, Button, Upload, Modal } from "antd";
import Toast from '../../utils/toast';
import { SearchForm, SubmitForm } from '../../components/common-form';
import dateUtil from '../../utils/dateUtil';
import { saveOrUpdate, getProductDetail } from '../../api/codeManage/productCode';
import PictureWall from '../../components/upload/PictureWall';
import { getUpdatePictureUrl } from '../../api/product/product';
import { parseUrl } from '../../utils/urlUtils';
import RichText from '../../components/RichText/RichText';


const _title = "商品物码详情";
const _description = "";
const _updateUrl = getUpdatePictureUrl({ folder: "pdf" });

class ProductCodePage extends Component {

  state = {

    showPageLoading: false,
    selectProduct: {},
    resetFormItem: null,
    productHeadPicUrl: null,
    showHeaderImgValidateInfo: false,
    editFormValue: null,
    selectProductModalData: null,
    updateLogTime: null,


    pdfFile: null,
    fileUploading: false

  }

  componentDidMount() {
    this.getPageData();
  }


  // 获取页面列表
  getPageData = () => {

    let id = this.getUrlAppId() || null;
    if (!id) {
      this.revertProductCodeData();
      this.setState({
        productData: {}
      })
      return;
    }
    this.setState({
      showPageLoading: true
    })
    getProductDetail({ id })
      .then(productData => {
        this.setState({
          productData
        })
        this.revertProductCodeData(productData);
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


  /**新加商品*******************************************************************************************************************************/

  revertProductCodeData = (record) => {
    this.setState({
      showPageLoading: false
    })
    if (record) {
      let { barCode, details, id, image, name, number, retailPrice, specification, manufacturer, unit, pdfName, pdfUrl } = record
      let editFormValue = { barCode, details, id, image, name, number, retailPrice, specification, manufacturer, unit };
      let pdfFile = null;
      if (pdfName && pdfUrl) {
        pdfFile = {
          url: pdfUrl,
          name: pdfName
        }
      }
      this.newProductFormList[0]['disabled'] = true;
      this.newProductFormList[1]['disabled'] = true;

      this.setState({
        productHeadPicUrl: image,
        editFormValue,
        selectProductModalData: editFormValue,
        pdfFile,
        details
      })

    } else {
      this.newProductFormList[0]['disabled'] = false;
      this.newProductFormList[1]['disabled'] = false;
      this.setState({
        productHeadPicUrl: null,
        editFormValue: null,
        selectProductModalData: null,
        details: null
      })
    }
  }

  clearProductData = () => {
    this.setState({
      productHeadPicUrl: null,
      editFormValue: null,
      selectProductModalData: null,
      pdfFile: null
    })
  }

  newProductSaveClicked = (data) => {

    let image = this.state.productHeadPicUrl;
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
    let { pdfFile, details } = this.state;
    let params = { ...data, image, details: details || "" };
    if (pdfFile) {
      params.pdfUrl = pdfFile.url;
      params.pdfName = pdfFile.name;
    } else {
      params.pdfUrl = "";
      params.pdfName = "";
    }
    let toastTitle = "添加商品成功！";
    if (this.state.selectProductModalData) {
      let { id } = this.state.selectProductModalData;
      params.id = id;
      toastTitle = "修改商品成功！";
    }
    saveOrUpdate(params)
      .then(() => {
        Toast(toastTitle);
        this.getPageData();
        this.clearProductData();
        this.goEditBack();
      })
  }

  newProductFormList = [{
    type: "INPUT",
    field: "number",
    label: "商品编码:",
    disabled: false,
    placeholder: "请输入",
    props: { maxLength: 10 },
    rules: [
      { required: true, message: '请输入!' },
    ]
  },
  {
    type: "INPUT",
    field: "barCode",
    disabled: false,
    label: "商品条码:",
    props: { maxLength: 20 },
    placeholder: "请输入",
    rules: [
      { required: true, message: '请输入!' },
      { pattern: /^[0-9]+$/, message: "商品条码只能为数字！" }
    ]
  },
  {
    type: "INPUT",
    field: "name",
    label: "商品名称:",
    placeholder: "请输入",
    rules: [
      { required: true, message: '请输入!' },
    ]
  },
  {
    type: "INPUT",
    field: "manufacturer",
    label: "生产商:",
    placeholder: "请输入",
    rules: [
      { required: true, message: '请输入!' },
    ]
  },
  {
    type: "INPUT",
    field: "specification",
    label: "商品规格:",
    placeholder: "请输入",
    rules: [
      { required: true, message: '请输入!' },
    ]
  }, {
    type: "INPUT",
    field: "unit",
    label: "商品单位:",
    placeholder: "请输入",
    rules: [
      { required: true, message: '请输入!' },
    ]
  }, {
    type: "INPUT_NUMBER",
    addonAfter: <span className='margin-left'>元</span>,
    field: "retailPrice",
    label: "建议零售价:",
    placeholder: "请输入",
    props: { min: 0, max: 9999999, precision: 2, width: 200 },
    rules: [
      { required: true, message: '请输入!' },
    ]
  }]

  uploadProductHeadPic = (picList) => {
    let productHeadPicUrl = ''
    if (!picList || !picList.length) {
      this.setState({
        productHeadPicUrl
      })
      return;
    }
    productHeadPicUrl = picList[0];
    this.setState({
      productHeadPicUrl
    })
  }

  onPdfFileChange = (info) => {

    if (info.file.status == 'uploading') {

      this.setState({
        fileUploading: true
      })
    } else {
      this.setState({
        fileUploading: false
      })
    }
    if (info.file.status === 'done') {

      if (!info.file || !info.file.response || info.file.response.status != 'SUCCEED' || !info.file.response.data) {
        return;
      }

      let pdfFile = {
        url: info.file.response.data,
        name: info.file.name
      }
      this.setState({
        pdfFile
      })

    } else if (info.file.status === 'error') {
      Toast('上传失败');
    }
  }

  deleteFile = () => {
    this.setState({
      pdfFile: null
    })
  }


  /**富文本 ********************************************************************************************************************/
  onTextChange = (details) => {
    this.setState({
      details
    })
  }

  /**返回 ********************************************************************************************************************/

  goEditBack = () => {
    window.history.back();
  }
  /**渲染**********************************************************************************************************************************/

  render() {
    const { getFieldDecorator } = this.props.form;
    const { selectProduct, pdfPageNumber, pdfNumPages, pdfFile } = this.state;
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
          <div style={{ width: 800 }}>
            <SubmitForm
              labelCol={{ span: 5 }}
              wrapperCol={{ span: 12 }}
              addonBefore={
                <Row className='line-height40 margin-top20'>
                  <Col span={5} className='text-right'>
                    <span className='label-color label-required'>商品图片：</span>
                  </Col>
                  <Col span={19}>
                    <PictureWall
                      allowType={['1', '2']}
                      folder='store'
                      pictureList={this.state.productHeadPicUrl ? [this.state.productHeadPicUrl] : null}
                      uploadCallback={this.uploadProductHeadPic}
                    />
                    <div className='color-red' style={{ lineHeight: "16px" }}>建议尺寸420px*420px，可上传非该尺寸的图片，图片格式png、jpg，大小不超过3MB</div>
                    {
                      this.state.showHeaderImgValidateInfo ?
                        <div className='line-height18 color-red' style={{ textAlign: "left" }}>请设置商品图片</div> :
                        null
                    }
                  </Col>
                </Row>
              }
              clearWhenHide={true}
              setFormValue={this.state.editFormValue}
              resetFormItem={this.state.resetFormItem}
              isForceSetValue={true}
              formItemList={this.newProductFormList}
              saveClicked={this.newProductSaveClicked}
              buttonsStyle={{ display: "flex", padding: "5px 0 5px 176px", width: "100%", lineHeight: 30 }}
              addonBeforeButton={
                <Button className='normal margin-right' onClick={this.goEditBack} >返回</Button>
              }

            >
              <>
                <Row className='line-height40'>
                  <Col span={5} className='text-right'>
                    <span className='label-color'>检测报告：</span>
                  </Col>
                  <Col span={19} >

                    {
                      !pdfFile ?
                        <Upload {...uploadProps}>
                          <Spin spinning={this.state.fileUploading}>
                            <Button>
                              <Icon type="upload" />点击上传检测报告
                            </Button>
                          </Spin>
                        </Upload>
                        : null
                    }

                    <div>
                      {
                        pdfFile && pdfFile.url && pdfFile.name ?
                          <div>
                            <a href={pdfFile.url} target='_blank'>{pdfFile.name}</a>
                            <a onClick={this.deleteFile} className='color-red margin-left'>删除</a>
                          </div>
                          : null
                      }
                    </div>

                  </Col>
                </Row>
                <Row className='line-height40 margin-top20'>
                  <Col span={5} className='text-right'>
                    <span className='label-color'>商品详细信息：</span>
                  </Col>
                  <Col span={19} >

                    <RichText
                      textValue={this.state.details}
                      onTextChange={this.onTextChange}
                    />
                  </Col>
                </Row>

              </>
            </SubmitForm>
          </div>
        </Spin>
      </CommonPage >
    )
  }
}

export default Form.create()(ProductCodePage);