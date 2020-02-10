import React, { Component } from "react";
import CommonPage from '../../components/common-page';
import { Table, Form, Input, Select, Col, Row, Icon, Spin, Button, Upload, Divider, Tabs, Popconfirm, Radio, Modal, Checkbox, InputNumber } from "antd";
import { pagination } from '../../utils/pagination';
import Toast from '../../utils/toast';
import { SearchForm, SubmitForm } from '../../components/common-form';
import dateUtil from '../../utils/dateUtil';
import { searchProductList, exportUniqueCode, generateUniqueCode, saveOrUpdate, deleteProduct } from '../../api/codeManage/productCode';
import { getSurplusExportQuantity } from "../../api/user/user";
import PictureWall from '../../components/upload/PictureWall';
import { getUpdatePictureUrl } from '../../api/product/product';
import { baseRoute, routerConfig } from '../../config/router.config';


import ProductCodeLog from './ProductCodeLog';
const { TabPane } = Tabs;
const _title = "商品物码";
const _description = "";
const _updateUrl = getUpdatePictureUrl({ folder: "pdf" });
const productCodeDetailPath = routerConfig["codeManage.productCodeDetail"].path;

class ProductCodePage extends Component {

  state = {
    tableDataList: null,
    showTableLoading: false,
    exportQuantity: null,
    exportLoading: false,
    selectProduct: {},

    securityVerificationCode: false,
    verificationPrice: false,
    startVerificationPrice: 0,
    endVerificationPrice: 0,

    productModalVisible: false,
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
    this._getSurplusExportQuantity();
  }

  params = {
    page: 1
  }

  _getSurplusExportQuantity = () => {
    getSurplusExportQuantity()
      .then(exportQuantity => {
        this.setState({
          exportQuantity: exportQuantity == -1 ? "无限制" : exportQuantity
        })

      })
  }

  // 获取页面列表
  getPageData = () => {
    let _this = this;
    this._showTableLoading();
    searchProductList(this.params).then(res => {
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

  productInputDataChange = (e) => {
    let inputData = e.currentTarget.value;
    this.params = {
      ...this.params,
      inputData
    }
  }
  // 表格相关列
  columns = [

    { title: "商品名称", dataIndex: "name" },
    { title: "商品编码", dataIndex: "number" },
    { title: "商品条码", dataIndex: "barCode" },
    { title: "商品图", dataIndex: "image", render: data => <span><img style={{ height: 40, width: 40 }} src={data} /></span> },
    { title: "商品规格", dataIndex: "specification" },
    { title: "已生成唯一码数量", dataIndex: "uniqueCodeQuantity", render: data => data || 0 },
    { title: "最后操作日期", dataIndex: "updateTime", render: data => data ? dateUtil.getDateTime(data) : "--" },
    {
      title: '操作',
      render: (text, record, index) => (
        <span>
          {
            record.generateUniqueCode == '1' ?
              <a>生成中...<Icon type='loading' spin={true} /></a>
              :
              <span>
                <a size="small" onClick={() => { this._showExportModal(record) }}>生成唯一码</a>
                <Divider type="vertical" />
                <a size="small" href={`${productCodeDetailPath}?id=${record.id}`}>编辑</a>
                <Divider type="vertical" />
                {
                  record.pdfUrl ?
                    <span>
                      <a size="small" href={record.pdfUrl} target="_blank">查看检测报告</a>
                      <Divider type="vertical" />
                    </span>
                    : null
                }
                <Popconfirm
                  placement="topLeft" title='确认要删除吗？'
                  onConfirm={() => { this.deleteTableItem(record) }} >
                  <a size="small" className="color-red">删除</a>
                </Popconfirm>
              </span>
          }
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

  deleteTableItem = (record) => {
    let { id } = record;
    deleteProduct({ id })
      .then(() => {
        Toast('删除成功！');
        this.getPageData();
      })
  }
  /**导出码的modal***************************************************************************************************************** */

  _showExportModal = (record) => {
    this.setState({
      exportModalIsVisible: true,
      selectProduct: record
    })
  }

  _hideExportModal = () => {
    this.setState({
      exportModalIsVisible: false,
      selectProduct: {}
    })
    this._clearExportModalData();
  }

  _clearExportModalData = () => {
    this.props.form.resetFields();
    this.setState({
      securityVerificationCode: false,
      verificationPrice: false,
      startVerificationPrice: 0,
      endVerificationPrice: 0
    })
  }

  modalDatachage = (e, key) => {
    switch (key) {
      case "securityVerificationCode":
        this.setState({
          securityVerificationCode: !!e.target.checked
        })
        break;

      case "verificationPrice":
        this.setState({
          verificationPrice: !!e.target.checked
        })
        break;

      case "startVerificationPrice":
        this.setState({
          startVerificationPrice: e
        })
        break;

      case "endVerificationPrice":
        this.setState({
          endVerificationPrice: e
        })
        break;
    }
  }

  saveExportModalClicked = () => {
    this.props.form.validateFields((err, data) => {
      if (err) {
        return;
      }
      let { exportQuantity } = data;

      if (parseInt(exportQuantity) > 1000000) {
        Toast("一次性生成数量不超过100万！");
        return;
      }

      let { id } = this.state.selectProduct;
      let { securityVerificationCode, verificationPrice, startVerificationPrice, endVerificationPrice } = this.state;
      if (verificationPrice) {
        if ((!startVerificationPrice && startVerificationPrice != 0) || !endVerificationPrice || Number(startVerificationPrice) < 0 || Number(endVerificationPrice) <= 0 || Number(startVerificationPrice) > Number(endVerificationPrice)) {
          Toast("请设置正确的价格区间！")
          return;
        }

        if (Number(startVerificationPrice) > this.state.selectProduct.retailPrice) {
          Toast("开始价格必须小于等于参考价！")
          return;
        }

        if (Number(endVerificationPrice) < this.state.selectProduct.retailPrice) {
          Toast("结束价格必须大于等于参考价！")
          return;
        }
      }

      securityVerificationCode = securityVerificationCode ? 1 : 0;
      if (!verificationPrice) {
        startVerificationPrice = null;
        endVerificationPrice = null;
      } else {
        startVerificationPrice = startVerificationPrice == 0 ? "0" : startVerificationPrice;
      }
      verificationPrice = verificationPrice ? 1 : 0;
      let { remark } = data;
      remark = remark || null;
      let params = {
        ...data,
        id,
        remark,
        securityVerificationCode, verificationPrice, startVerificationPrice, endVerificationPrice
      }

      this.setState({
        exportLoading: true
      })

      generateUniqueCode(params)
        .then(() => {

          this.setState({
            exportLoading: false
          })
          Toast('生成唯一码成功！');
          this._hideExportModal();
          this.getPageData();
          this._getSurplusExportQuantity()
        })
        .catch(() => {
          this.setState({
            exportLoading: false
          })
        })

    })
  }


  _exportUniqueCode = (params) => {

    let exportUrl = exportUniqueCode(params);
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


  /**新加商品*******************************************************************************************************************************/

  goAddProductCode = () => {
    this.props.history.push(productCodeDetailPath)
  }

  showAddProductModal = (record) => {
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
        pdfFile
      })

    } else {
      this.newProductFormList[0]['disabled'] = false;
      this.newProductFormList[1]['disabled'] = false;
      this.setState({
        productHeadPicUrl: null,
        editFormValue: null,
        selectProductModalData: null
      })
    }

    this.setState({
      productModalVisible: true
    })
  }

  _hideProductModal = () => {
    this.setState({
      productModalVisible: false,
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
    let pdfFile = this.state.pdfFile;
    let params = { ...data, image };
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
        this._hideProductModal();
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
    field: "details",
    label: "商品详情:",
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

  onTabsChange = (e) => {
    if (e == "2") {
      this.setState({
        updateLogTime: Date.now()
      })
    } else {
      this.getPageData();
      this._getSurplusExportQuantity()

    }
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
        <Tabs type="card" onChange={this.onTabsChange}>
          <TabPane tab="物码列表" key="1">
            <div className='flex-between padding10-0'>
              <Button type='primary' onClick={() => { this.goAddProductCode() }}>新增商品</Button>
              <Form layout='inline'>
                <span style={{ lineHeight: "40px", marginRight: "20px" }}>剩余可导出数量：<span className='color-red'>{this.state.exportQuantity}</span></span>
                <Form.Item>
                  <Input placeholder='输入商品名称/编号/条码' onChange={this.productInputDataChange} />
                </Form.Item>
                <Form.Item>
                  <Button type='primary' onClick={this.getPageData}>查询</Button>
                </Form.Item>
              </Form>
            </div>
            <Table
              indentSize={10}
              rowKey="id"
              columns={this.columns}
              loading={this.state.showTableLoading}
              pagination={this.state.pagination}
              dataSource={this.state.tableDataList}
            />
            <a ref="exportUrl" download="工单数据" style={{ 'display': "none" }} href={this.state.exportUrl} ></a>

            <Modal maskClosable={false}
              className='noPadding'
              title='添加商品'
              visible={this.state.productModalVisible}
              onCancel={this._hideProductModal}
              onOk={this.newProductSaveClicked}
              footer={null}
            >
              <SubmitForm
                addonBefore={
                  <Row className='line-height40 margin-top20'>
                    <Col span={8} className='text-right'>
                      <span className='label-color label-required'>商品图片：</span>
                    </Col>
                    <Col span={16}>
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
                showForm={this.state.productModalVisible}
                formItemList={this.newProductFormList}
                saveClicked={this.newProductSaveClicked}
                cancelClicked={this._hideProductModal}
              >
                <Row className='line-height40'>
                  <Col span={8} className='text-right'>
                    <span className='label-color'>检测报告：</span>
                  </Col>
                  <Col span={16} >

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
              </SubmitForm>
            </Modal>
            <Modal maskClosable={false}
              title='生成唯一码'
              visible={this.state.exportModalIsVisible}
              onCancel={this._hideExportModal}
              onOk={this.saveExportModalClicked}
            >
              <Spin spinning={this.state.exportLoading}>
                <div className='flex align-center padding' style={{ marginLeft: "8%", background: "#f2f2f2", opacity: "0.8", borderRadius: "4px" }}>
                  <div><img src={selectProduct.image} style={{ width: 80, height: 80, borderRadius: "4px" }} /></div>

                  <div className='flex-column margin-left20'>
                    <div className='font-bold '>{selectProduct.name}(规格信息)</div>
                    <div>商品条码：{selectProduct.barCode}</div>
                    <div>商品编码：{selectProduct.number}</div>
                    <div>已生成数：{selectProduct.uniqueCodeQuantity}</div>
                  </div>
                </div>
                <Form>
                  <Form.Item
                    labelCol={{ span: 8 }}
                    wrapperCol={{ span: 16 }}
                    label='生成数量：'
                    key='exportQuantity'
                    field='exportQuantity'>
                    {
                      getFieldDecorator('exportQuantity', {
                        rules: [
                          { required: true, message: '请输入生成数量!' },
                        ]
                      })(
                        <InputNumber style={{ width: 120 }} precision={0} min={0} max={1000000} />

                      )
                    }
                    <span className='color-red'>一次性生成数量不可超过100万</span>
                  </Form.Item>

                  <Row className='line-height40'>
                    <Col span={8}>
                      <div className='text-right label'>防伪验证码：</div>
                    </Col>
                    <Col span={16}>
                      <div>
                        <Checkbox checked={this.state.securityVerificationCode} onChange={(e) => { this.modalDatachage(e, 'securityVerificationCode') }} />
                        <span className='color-red margin-left'>开启后防伪查询前需输入防伪验证码</span>
                      </div>
                    </Col>
                  </Row>

                  <Row className='line-height40'>
                    <Col span={8}>
                      <div className='text-right label'>价格验证：</div>
                    </Col>
                    <Col span={16}>
                      <div>
                        <Checkbox checked={this.state.verificationPrice} onChange={(e) => { this.modalDatachage(e, 'verificationPrice') }} />
                        <span className='color-red margin-left'>开启后溯源查询前需输入价格</span>
                      </div>
                    </Col>
                  </Row>

                  {
                    this.state.verificationPrice ?
                      <Row className='line-height40'>
                        <Col offset={8} span={16}>
                          <div>参考零售价：{this.state.selectProduct.retailPrice}</div>
                          <div>
                            <InputNumber min={0} max={99999999} value={this.state.startVerificationPrice} onChange={(e) => { this.modalDatachage(e, 'startVerificationPrice') }} precision={2} />
                            <span className='padding0-10'>~</span>
                            <InputNumber min={0} max={99999999} value={this.state.endVerificationPrice} onChange={(e) => { this.modalDatachage(e, 'endVerificationPrice') }} precision={2} />
                          </div>
                        </Col>
                      </Row> : null
                  }               

                  <Form.Item labelCol={{ span: 8 }} wrapperCol={{ span: 16 }} label='备注：' key='remark' field='remark'>
                    {
                      getFieldDecorator('remark', {
                        rules: null,
                        initialValue: ""
                      })(
                        <Input.TextArea />
                      )
                    }
                  </Form.Item>
                </Form>
              </Spin>
            </Modal>
          </TabPane>
          <TabPane tab="操作日志" key="2">
            <ProductCodeLog updateTime={this.state.updateLogTime}>
            </ProductCodeLog>
          </TabPane>
        </Tabs>
      </CommonPage >
    )
  }
}

export default Form.create()(ProductCodePage);