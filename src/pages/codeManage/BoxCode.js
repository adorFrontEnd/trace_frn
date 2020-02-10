import React, { Component } from "react";
import CommonPage from '../../components/common-page';
import { Table, Form, Input, Select, Col, Row, Icon, Button, Spin, Divider, Tabs, Popconfirm, Radio, Modal, Checkbox, InputNumber } from "antd";
import { pagination } from '../../utils/pagination';
import Toast from '../../utils/toast';
import { SearchForm, SubmitForm } from '../../components/common-form';
import dateUtil from '../../utils/dateUtil';
import { searchBoxList, exportUniqueCode, generateUniqueCode, exportUniqueCodeLog, saveOrUpdate, searchBoxLogList, deleteBox, deleteBoxLog } from '../../api/codeManage/boxCode';
import { getSurplusExportQuantity } from "../../api/user/user";
import PictureWall from '../../components/upload/PictureWall';
import BoxCodeLog from './BoxCodeLog';
import SelectProduct from '../../components/selectProduct/SelectProduct';

const { TabPane } = Tabs;
const _title = "箱规物码";
const _description = "";

class Page extends Component {

  state = {
    tableDataList: null,
    showTableLoading: false,
    exportQuantity: null,
    selectBox: {},
    exportLoading: false,

    securityVerificationCode: false,
    verificationPrice: false,
    startVerificationPrice: 0,
    endVerificationPrice: 0,

    boxModalVisible: false,
    resetFormItem: null,
    boxHeadPicUrl: null,
    showHeaderImgValidateInfo: false,
    editFormValue: null,
    selectBoxModalData: null,

    selectBoxType: 0,
    specification: {},
    updateLogTime: null,
    selectProductModalIsVisible: false,

    relationProduct: null,
    generateRule: "0"
  }

  componentDidMount() {
    this.getPageData();
    this._getSurplusExportQuantity()
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
    searchBoxList(this.params).then(res => {
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

  boxInputDataChange = (e) => {
    let inputData = e.currentTarget.value;
    this.params = {
      ...this.params,
      inputData
    }
  }
  // 表格相关列
  columns = [
    { title: "箱规名称", dataIndex: "name" },
    { title: "箱规编码", dataIndex: "number" },
    { title: "装箱类别", dataIndex: "type", render: data => data == '1' ? "装箱" : "装货" },
    { title: "生成规则", dataIndex: "generateRule", render: data => data == '0' ? "十进制" : "十六进制" },
    { title: "规格", dataIndex: "specification", render: data => this.renderSpecification(data) },
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
                <a size="small" onClick={() => { this.showAddBoxModal(record) }}>编辑</a>
                <Divider type="vertical" />
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

  renderSpecification = (data) => {
    let { boxLength, boxWidth, boxHeight, boxCapacity } = JSON.parse(data);
    return (
      <span>{boxLength}cm*{boxWidth}cm*{boxHeight}cm 容量：{boxCapacity}个</span>
    )

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
  deleteTableItem = (record) => {
    let { id } = record;
    deleteBox({ id })
      .then(() => {
        Toast('删除成功！');
        this.getPageData();
      })
  }

  /**生成码的modal***************************************************************************************************************** */

  _showExportModal = (record) => {
    this.setState({
      exportModalIsVisible: true,
      selectBox: record
    })
  }

  _hideExportModal = () => {
    this.setState({
      exportModalIsVisible: false,
      selectBox: {}
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


      let { id } = this.state.selectBox;

      let { remark } = data;
      remark = remark || null;
      let params = {
        ...data,
        id,
        remark
      }

      this.setState({
        exportLoading: true
      })
      // this._exportUniqueCode(params);
      generateUniqueCode(params)
        .then(() => {

          this.setState({
            exportLoading: false
          })
          Toast('生成唯一码成功！');
          this.props.form.resetFields();
          this._hideExportModal();
          this.getPageData();
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
      Toast("生成失败！")
      return;
    }
    this.setState({
      exportUrl
    })

    setTimeout(() => {
      this.refs.exportUrl.click()
    }, 1000)
  }


  /**新加箱规*******************************************************************************************************************************/

  showAddBoxModal = (record) => {
    if (record) {
      let { name, number, id, specification, type, relationProductName, relationProductId, uniqueCodeQuantity, generateRule } = record;
      let editFormValue = { id, name, number };
      generateRule = generateRule == '0' ? "0" : "1";
      this.newBoxFormList[0].disabled = true;
      specification = JSON.parse(specification);
      let selectBoxModalData = { ...editFormValue, relationProductName, relationProductId, uniqueCodeQuantity };
      let relationProduct = null;

      if (relationProductId) {
        relationProduct = {
          id: relationProductId,
          name: relationProductName
        }
      }

      this.setState({
        specification,
        generateRule,
        selectBoxType: type,
        editFormValue,
        selectBoxModalData,
        relationProduct
      })

    } else {
      this.newBoxFormList[0].disabled = false;
      this.setState({
        generateRule: "0",
        selectBoxType: 0,
        editFormValue: null,
        selectBoxModalData: null,
        relationProduct: null
      })
    }

    this.setState({
      boxModalVisible: true
    })
  }

  _hideBoxModal = () => {
    this.setState({
      boxModalVisible: false,
      boxHeadPicUrl: null,
      editFormValue: null,
      selectBoxModalData: null
    })
  }


  newBoxFormList = [{
    type: "INPUT",
    field: "number",
    label: "箱规编码:",
    disabled: false,
    placeholder: "请输入箱规编码",
    rules: [
      { required: true, message: '请输入箱规编码!' },
    ]
  },
  {
    type: "INPUT",
    field: "name",
    disabled: false,
    label: "箱规名称:",
    placeholder: "请输入箱规名称",
    rules: [
      { required: true, message: '请输入箱规名称!' },
    ]
  }]

  uploadBoxHeadPic = (picList) => {
    let boxHeadPicUrl = ''
    if (!picList || !picList.length) {
      this.setState({
        boxHeadPicUrl
      })
      return;
    }
    boxHeadPicUrl = picList[0];
    this.setState({
      boxHeadPicUrl
    })
  }

  onBoxTypeChange = (e) => {
    let selectBoxType = e.target.value;
    this.setState({
      selectBoxType
    })
  }


  onGenerateRuleChange = (e) => {
    let generateRule = e.target.value;
    this.setState({
      generateRule
    })
  }

  newBoxSaveClicked = (data) => {
    let specification = this.state.specification;
    if (!specification || !specification.boxLength || !specification.boxWidth || !specification.boxHeight || !specification.boxCapacity) {
      Toast("请设置完整的规格数据！")
      return;
    }
    let capacity = specification.boxCapacity;
    specification = JSON.stringify(specification);
    let type = this.state.selectBoxType;
    let generateRule = this.state.generateRule;
    let toastTitle = "添加商品成功！";
    let params = { ...data, specification, type, capacity, generateRule };
    if (this.state.selectBoxModalData) {
      let { id } = this.state.selectBoxModalData;
      params.id = id;
      toastTitle = "修改商品成功！";
    }

    if (this.state.relationProduct) {
      let { id } = this.state.relationProduct;
      params.relationProductId = id;
    } else {
      params.relationProductId = "";
    }

    saveOrUpdate(params)
      .then(() => {
        Toast(toastTitle);
        this.getPageData();
        this._hideBoxModal();
      })
  }

  onSpeChange = (e, key) => {
    let specification = this.state.specification;
    specification[key] = e;
    this.setState({
      specification
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

  /**新增箱规选择商品***************************************************************************************************** */
  showProductModal = () => {
    this.setState({
      selectProductModalIsVisible: true
    })
  }

  _hideSelectProductModal = () => {
    this.setState({
      selectProductModalIsVisible: false
    })
  }

  onSelectProductConfirmClick = (productArr) => {
    if (!productArr || !productArr.length) {
      return;
    }

    let relationProduct = productArr[0];

    this.setState({
      relationProduct,
      selectProductModalIsVisible: false
    })
  }

  clearSelectProduct = () => {
    this.setState({
      relationProduct: null
    })
  }
  /**渲染**********************************************************************************************************************************/

  render() {
    const { getFieldDecorator } = this.props.form;
    return (
      <CommonPage title={_title} description={_description} >
        <Tabs type="card" onChange={this.onTabsChange}>
          <TabPane tab="物码列表" key="1"   >
            <div className='flex-between padding10-0'>
              <Button type='primary' onClick={() => { this.showAddBoxModal() }}>新增箱规</Button>
              <Form layout='inline'>
                <span style={{ lineHeight: "40px", marginRight: "20px" }}>剩余可导出数量：<span className='color-red'>{this.state.exportQuantity}</span></span>
                <Form.Item>
                  <Input placeholder='输入箱规编码/条码/名称' onChange={this.boxInputDataChange} />
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
              title='添加箱规'
              width={700}
              visible={this.state.boxModalVisible}
              onCancel={this._hideBoxModal}
              onOk={this.newBoxSaveClicked}
              footer={null}
            >
              <SubmitForm
                clearWhenHide={true}
                setFormValue={this.state.editFormValue}
                resetFormItem={this.state.resetFormItem}
                showForm={this.state.boxModalVisible}
                formItemList={this.newBoxFormList}
                saveClicked={this.newBoxSaveClicked}
                cancelClicked={this._hideBoxModal}
              >
                <Row className='line-height40'>
                  <Col span={8}>
                    <div className='text-right label-required'>规格：</div>
                  </Col>
                  <Col span={16}>
                    <div style={{ paddingTop: 40 }}>
                      <div>
                        <span className='margin-right'>长度</span>
                        <InputNumber min={0.01} max={9999999999} value={this.state.specification.boxLength} precision={2} onChange={(e) => { this.onSpeChange(e, 'boxLength') }} />
                        <span className='margin-left'>cm</span>
                      </div>
                      <div>
                        <span className='margin-right'>宽度</span>
                        <InputNumber min={0.01} max={9999999999} value={this.state.specification.boxWidth} precision={2} onChange={(e) => { this.onSpeChange(e, 'boxWidth') }} />
                        <span className='margin-left'>cm</span>
                      </div>
                      <div>
                        <span className='margin-right'>高度</span>
                        <InputNumber min={0.01} max={9999999999} value={this.state.specification.boxHeight} precision={2} onChange={(e) => { this.onSpeChange(e, 'boxHeight') }} />
                        <span className='margin-left'>cm</span>
                      </div>
                      <div>
                        <span className='margin-right'>容量</span>
                        <InputNumber disabled={!!this.state.selectBoxModalData} min={0} max={9999999999} value={this.state.specification.boxCapacity} precision={0} onChange={(e) => { this.onSpeChange(e, 'boxCapacity') }} />
                        <span className='margin-left'>个</span>
                      </div>
                    </div>
                  </Col>
                </Row>
                <Row className='line-height40 margin-top'>
                  <Col span={8}>
                    <div className='text-right'>关联商品：</div>
                  </Col>
                  <Col span={16}>
                    {
                      this.state.selectBoxModalData && this.state.selectBoxModalData.uniqueCodeQuantity ?
                        <div>
                          {
                            this.state.selectBoxModalData.relationProductName || '--'
                          }
                        </div>
                        :
                        <div>
                          <div><Button onClick={this.showProductModal} type='primary'>选择商品</Button><span className='color-red margin-left'>如果生成过码，则编辑时不可修改此项</span></div>
                          {
                            this.state.relationProduct ?
                              <div className='line-height30'>
                                {this.state.relationProduct.name}
                                <Popconfirm
                                  placement="topLeft" title='确认要删除吗？'
                                  onConfirm={() => { this.clearSelectProduct() }} >
                                  <span className='color-red margin-left' style={{ cursor: "pointer" }} >删除</span>

                                </Popconfirm>
                              </div>
                              :
                              <div>暂未选择关联商品</div>
                          }
                        </div>
                    }
                  </Col>
                </Row>
                <Row className='line-height40'>
                  <Col span={8}>
                    <div className='text-right label-required'>装箱类别：</div>
                  </Col>
                  <Col span={16}>
                    <Radio.Group onChange={this.onBoxTypeChange} value={this.state.selectBoxType}>
                      <Radio value={0}>装货</Radio>
                      {/* <Radio value={1}>装箱</Radio> */}
                    </Radio.Group>
                  </Col>
                </Row>
                <Row className='line-height40'>
                  <Col span={8}>
                    <div className='text-right label-required'>生成规则：</div>
                  </Col>
                  <Col span={16}>
                    <Radio.Group disabled={!!this.state.selectBoxModalData} onChange={this.onGenerateRuleChange} value={this.state.generateRule}>
                      <Radio value={"0"}>十进制</Radio>
                      <Radio value={"1"}>十六进制</Radio>
                    </Radio.Group>
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
                          { required: true, message: '请输入生成数量!' }
                        ]
                      })(
                        <InputNumber style={{ width: 120 }} precision={0} min={0} max={1000000} />
                      )
                    }
                    <span className='color-red'>一次性生成数量不可超过100万</span>

                  </Form.Item>

                  {/* <Form.Item labelCol={{ span: 8 }} wrapperCol={{ span: 16 }} label='生成类型：' key='exportType' field='exportType'>
                    {
                      getFieldDecorator('exportType', {
                        rules: null,
                        initialValue: "0"
                      })(
                        <Radio.Group>
                          <Radio value={"0"}>文本</Radio>
                          <Radio value={"1"}>Excel</Radio>
                          <Radio value={"2"}>图片压缩包</Radio>
                        </Radio.Group>
                      )
                    }
                  </Form.Item> */}

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

            <SelectProduct
              isSingleSelection={true}
              visible={this.state.selectProductModalIsVisible}
              hide={this._hideSelectProductModal}
              onOk={this.onSelectProductConfirmClick}
            />
          </TabPane>
          <TabPane tab="操作日志" key="2">
            <BoxCodeLog updateTime={this.state.updateLogTime}>
            </BoxCodeLog >
          </TabPane>
        </Tabs>
      </CommonPage >
    )
  }
}

export default Form.create()(Page);