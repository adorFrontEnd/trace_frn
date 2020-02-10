import React, { Component } from "react";
import CommonPage from '../../components/common-page';
import { Table, Form, Input, Spin, AutoComplete, Checkbox, Select, Col, Row, Icon, Button, Divider, Popconfirm, Dropdown, Menu, Radio, DatePicker, Modal, Checktray, InputNumber } from "antd";
import { pagination } from '../../utils/pagination';
import Toast from '../../utils/toast';
import { SearchForm, SubmitForm } from '../../components/common-form';
import dateUtil from '../../utils/dateUtil';
import { searchTrayList, exportUniqueCode, generateQrcodeImage, checkExportUniqueCode, exportUniqueCodeLog, batchExportUniqueCode, submitParam, saveOrUpdate, searchTrayLogList, deleteTray, deleteTrayLog } from '../../api/codeManage/trayCode';
import { saveOrUpdateQrCodeConfig, getDetailQrCodeConfig } from '../../api/codeManage/productCode';
import { getSurplusExportQuantity } from "../../api/user/user";
import { getCursorPos } from './getCursor';
import QrcodeImageModal from './QrcodeImageModal';
import { getAllOper } from '../../api/oper/login';

const _checkedObj = {
  traceCode: "全码",
  uniqueCode: "唯一码"
}

const _exampleData = {
  traceCode: "http://h5.trace.adorsmart.com/code/product?code=11111120190800003acdeaf&key=999d7fa2d3e6a678b697baa403094afa@",
  uniqueCode: "11111120190800003acdeaf"
}

const _regArr = {
  traceCode: /\[全码\]/g,
  uniqueCode: /\[唯一码\]/g
}

class Page extends Component {

  state = {
    tableDataList: null,
    showTableLoading: false,
    exportQuantity: null,
    selectTray: {},

    exportModalIsVisible: false,
    editText: '',
    generateText: "",
    selectData: null,
    exportType: null,
    exportUrl: null,
    hasCheckedArr: [],
    exportLoading: false,

    selectedRowKeys: null,
    selectedRows: null,
    rowsMap: {},
    batchExport: false,
    exportUrlArr: [],
    qrcodeImageModalIsVisible: false,
    operList: null
  }

  componentDidMount() {
    this.getPageData();
    this.getAllOper();
  }

  componentWillReceiveProps(props) {
    if (props.updateTime != this.props.updateTime) {
      this.getPageData();
    }
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
  getPageData = (isInit) => {
    let params = this.props.form.getFieldsValue();
    if (params) {
      let { startCreateTimeStamp, endCreateTimeStamp } = params;
      params.startCreateTimeStamp = startCreateTimeStamp ? Date.parse(startCreateTimeStamp) : null;
      params.endCreateTimeStamp = endCreateTimeStamp ? Date.parse(endCreateTimeStamp) : null;
    }
    let _this = this;
    this.params = {
      ...this.params,
      ...params
    }
    this._showTableLoading();
    searchTrayLogList(this.params).then(res => {
      this._hideTableLoading();
      let _pagination = pagination(res, (current) => {
        this.params.page = current
        _this.getPageData();
      }, (cur, pageSize) => {
        this.params.page = 1;
        this.params.size = pageSize
        _this.getPageData();
      })

      let tableDataList = res.data;
      let _rowsMap = isInit ? {} : this.state.rowsMap;
      let rowsMap = this.joinKeyMap(tableDataList, _rowsMap);
      this.setState({
        tableDataList,
        pagination: _pagination,
        rowsMap
      })
    }).catch(() => {
      this._hideTableLoading();
    })
  }

  resetSearch = () => {
    this.props.form.resetFields()
  }

  joinKeyMap = (arr, map) => {
    map = map || {};
    if (!arr || !arr.length) {
      return map
    }
    let resultArr = [];
    arr.forEach((item) => {
      let id = item.id;
      if (!map[id]) {
        map[id] = item;
      }
    })
    return map;
  }

  trayInputDataChange = (e) => {
    let inputData = e.currentTarget.value;
    this.params = {
      ...this.params,
      inputData
    }
  }


  // 表格相关列
  columns = [

    { title: "导出数量", dataIndex: "exportQuantity" },
    { title: "生成日期", dataIndex: "createTime", render: data => data ? dateUtil.getDateTime(data) : "--" },
    { title: "最近导出时间", dataIndex: "exportTime", render: data => data ? dateUtil.getDateTime(data) : "--" },
    { title: "备注", dataIndex: "remark", render: data => data || "--" },
    { title: "操作员", dataIndex: "operAccount", render: data => data || "--" },
    {
      title: "图片二维码生成状态", dataIndex: "qrCodeStatus", render: (data, record, index) =>
        <span>
          {
            data == '0' ?
              <a>生成中...<Icon type='loading' spin={true} /></a>
              :
              data == '1' ?
                <span>
                  <span className='color-green'>已生成</span>
                  <Divider type="vertical" />
                  <a size="small" onClick={() => { this.exportSingleCodeClicked(record, "2", true) }}>点击重新生成</a>
                </span>
                :
                <a size="small" onClick={() => { this.exportSingleCodeClicked(record, "2", true) }}>点击生成图片</a>
          }
        </span>
    },
    {
      title: '操作',
      render: (text, record, index) => (
        <Dropdown
          overlay={
            <Menu>
              <Menu.Item key="0" onClick={() => { this.exportSingleCodeClicked(record, "0") }}>
                <span className="theme-color line-height20" >导出TXT</span>
              </Menu.Item>
              <Menu.Divider />
              <Menu.Item key="1" onClick={() => { this.exportSingleCodeClicked(record, "1") }} >
                <span className="theme-color line-height20" >导出EXCEL</span>
              </Menu.Item>
              {
                record.qrCodeStatus == '1' ?
                  <Menu.Divider />
                  :
                  null
              }
              {
                record.qrCodeStatus == '1' ?
                  <Menu.Item key="2" onClick={() => { this.exportSingleCodeClicked(record, "2") }}>
                    <span className="theme-color line-height20" >导出图片压缩包</span>
                  </Menu.Item>
                  :
                  null
              }

            </Menu>
          }
          trigger={['click']}
        >
          <a className="ant-dropdown-link" href="#">
            操作 <Icon type="down" />
          </a>
        </Dropdown>
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
    deleteTrayLog({ id })
      .then(() => {
        Toast('删除成功！');
        this.getPageData();
      })
  }

  /**导码操作***************************************************************************************************************** */

  // 单独导码操作
  exportSingleCodeClicked = (record, exportType, isGenerate) => {
    this.setState({
      selectData: record,
      exportType,
      batchExport: false
    })

    if (exportType == '2') {

      let { id } = record;
      if (isGenerate) {
        this._showImageQrcodeModal();
      } else {
        checkExportUniqueCode()
          .then(() => {
            let exportUrl = exportUniqueCodeLog({ id, exportType, download: "1" });
            this._exportUrlTriger(exportUrl);
          })
      }

      return;
    }
    this.showTxtExcelExportModal();
  }


  // 显示导出Txt或者excel的modal
  showTxtExcelExportModal = () => {
    this.setState({
      exportModalIsVisible: true
    })
  }

  // 隐藏导出Txt或者excel的modal

  _hideExportModal = () => {
    this.setState({
      exportModalIsVisible: false,
      editText: '',
      generateText: "",
      selectData: null,
      exportType: null,
      exportUrl: null,
      hasCheckedArr: []
    })
  }

  // txt或者excel的modal确认
  txtExcelModalConfirm = () => {
    let exportFormat = this.state.editText;
    if (!exportFormat) {
      Toast("请输入规则！");
      return;
    }
    this._txtExcelExport(exportFormat);
  }

  // 导出触发
  _txtExcelExport = (exportFormat) => {
    checkExportUniqueCode()
      .then(() => {
        let { id } = this.state.selectData;
        let exportType = this.state.exportType;
        this.setState({
          exportLoading: true
        })

        if (!this.state.batchExport) {
          this._submitParam(exportFormat, id, exportType)
          return;
        } else {
          let ids = this.state.selectedRowKeys;
          if (!ids || !ids.length) {
            return;
          }
          ids = ids.join();
          this._batchSubmitParam(exportFormat, ids, exportType);
        }
      })
  }

  // 单个导出
  async _submitParam(exportFormat, id, exportType) {

    let exportUrl = exportUniqueCodeLog({ id, exportType, exportFormat });
    this._exportUrlTriger(exportUrl);
  }

  // 批量导出
  async _batchSubmitParam(exportFormat, ids, exportType) {
    let exportUrl = batchExportUniqueCode({ ids, exportType, exportFormat });
    this._exportUrlTriger(exportUrl);
  }

  _exportUrlTriger = (exportUrl) => {
    if (!exportUrl) {
      return;
    }

    this.setState({
      exportUrl
    }, () => {
      this.refs.exportUrl.click();
      this._hideExportModal();
      this.setState({
        exportLoading: false
      })
      return;
    })
  }

  onCheckedChange = (e, type) => {

    let isChecked = e.target.checked;
    let editText = this.state.editText;
    let position = editText ? getCursorPos(this.refs.editTextArea.textAreaRef, editText) : -1;

    let addText = _checkedObj[type];
    let newText = '';
    if (isChecked) {
      newText = editText.slice(0, position) + `[${addText}]` + editText.slice(position);
    } else {
      newText = editText.replace(_regArr[type], "");
    }

    this.setState({
      editText: newText
    }, () => {
      this.getGenerateText()
    })
  }

  onCheckedGroupChange = (hasCheckedArr) => {
    this.setState({
      hasCheckedArr
    })
  }

  textAreaOnChange = (e) => {

    let editText = e.target.value;

    if (editText == '') {
      this.setState({
        editText: "",
        generateText: ""
      })
      return;
    }

    if (!this.editTextValidate(editText)) {
      return;
    }
    this.setState({
      editText
    }, () => {
      this.getGenerateText()
    })
  }

  getGenerateText = () => {

    let editText = this.state.editText;
    let generateText = editText ? this.replaceAllItem(editText) : "";
    this.setState({
      generateText
    })
  }

  replaceAllItem = (rawStr) => {

    if (!rawStr) {
      return ""
    }

    Object.keys(_regArr).forEach((item) => {
      rawStr = rawStr.replace(_regArr[item], _exampleData[item]);
    })

    return rawStr;
  }

  // 字符验证
  editTextValidate = (editText) => {

    if (!editText) {
      return;
    }

    if (/!|\@|\$|\%|\^|\&|\*|\.|\?/.test(editText)) {
      Toast('请不要输入特殊字符!@#$%^&*.?');
      return;
    }
    return true
  }


  clearAllText = () => {
    this.setState({
      editText: '',
      generateText: "",
      exportUrl: null,
      hasCheckedArr: []
    })
  }

  /**表格选择,批量导出 **************************************************************************************************************************/

  onRowSelection = (selectedRowKeys) => {

    let rowsMap = this.state.rowsMap;
    let selectedRows = selectedRowKeys.map(item => rowsMap[item]);
    this.setState({
      selectedRowKeys,
      selectedRows
    })
  }


  validateSelectedRows = () => {
    let selectedRows = this.state.selectedRows;
    if (!selectedRows || !selectedRows.length) {
      Toast('请选择要导出溯源码的托盘！')
      return;
    }

    let hasCodeArr = selectedRows.filter(item => item.securityVerificationCode == 1);
    let length = selectedRows.length;
    if (hasCodeArr.length == 0 || hasCodeArr.length == length) {
      return 1;
    }
    return 0;
  }

  validateImageSelectedRows = () => {

    let selectedRows = this.state.selectedRows;
    if (!selectedRows || !selectedRows.length) {
      Toast('请选择要导出溯源码的商品！')
      return;
    }

    let hasCodeArr = selectedRows.filter(item => item.qrCodeStatus == 1);
    let length = selectedRows.length;
    if (hasCodeArr.length == 0) {
      Toast('导出图片需要首先生成图片！')
      return;
    }

    if (hasCodeArr.length == length) {
      return 1;
    }
    return 0;
  }

  exportBatchClicked = (type) => {
    let isValidate = this.validateSelectedRows();
    let exportType = null;
    if (isValidate == 0) {
      Toast("批量导出时须保证全有验证码或全无验证码！");
      return;
    }

    if (isValidate == 1) {

      if (type == 'txt') {
        exportType = "0"
      }

      if (type == 'excel') {
        exportType = "1"
      }

      if (type == 'image') {
        exportType = "2"
      }

      let selectedRows = this.state.selectedRows;
      this.setState({
        selectData: selectedRows[0],
        exportType,
        batchExport: true
      })

      if (type == 'image') {
        this._showImageQrcodeModal();
        return;
      }

      this.showTxtExcelExportModal();

    }
  }

  exportBatchImageClicked = () => {
    let isValidate = this.validateImageSelectedRows();
    let exportType = "2";
    if (isValidate == 0) {
      Toast("批量导出时须保证全部已生成！");
      return;
    }
    if (isValidate == 1) {
      checkExportUniqueCode()
        .then(() => {
          let selectedRowKeys = this.state.selectedRowKeys;
          this.imageQrcodeBatchExport(selectedRowKeys);
        })
    }

  }

  /************************************二维码图片导出Modal溯源码******************************************************************************/
  _showImageQrcodeModal = () => {
    this.setState({
      qrcodeImageModalIsVisible: true
    })
  }

  _hideImageQrcodeModal = () => {
    this.setState({
      qrcodeImageModalIsVisible: false
    })
  }

  async qrcodeImageModalSaveClicked(params) {

    let { id } = this.state.selectData;
    let data = await saveOrUpdateQrCodeConfig(params);
    this._generateQrcodeImage(id)
  }

  //单个生成图片二维码
  _generateQrcodeImage = (id) => {
    let params = {
      id,
      exportType: "2",
      download: "0"
    }
    generateQrcodeImage(params)
      .then(() => {
        Toast("生成成功！");
        this.getPageData();
      })
  }

  // 批量导出
  imageQrcodeBatchExport = (ids) => {

    let batchHrefUrl = ids.map(id => exportUniqueCodeLog({ id, exportType: "2", download: "1" }));
    this._exportBatchUrlTriger(batchHrefUrl);
  }

  _exportBatchUrlTriger = (batchHrefUrl) => {

    if (!batchHrefUrl || !batchHrefUrl.length) {
      return;
    }
    batchHrefUrl.forEach((item, i) => {
      setTimeout(() => {
        window.open(item, '_blank');
      }, i * 1000);
    })
  }

  autoCompleteFilter = (inputValue, option) => {
    return option.props.filtertext.toUpperCase().indexOf(inputValue.toUpperCase()) !== -1
  }

  getDealerTotalOption = (item) => {
    let { nickname, username, roleName } = item;
    let str = `${nickname}(${username}-${roleName})`
    return str
  }

  getAllOper = () => {
    getAllOper()
      .then(operList => {
        this.setState({
          operList
        })
      })
  }


  /**渲染**********************************************************************************************************************************/

  render() {
    const { getFieldDecorator } = this.props.form;
    const { operList } = this.state;
    const rowSelection = {
      onChange: this.onRowSelection,
      selectedRowKeys: this.state.selectedRowKeys
    }
    return (
      <div>
        <div className='flex-between align-center margin10-0' style={{ flexWrap: "wrap" }}>
          <div style={{ minWidth: 360, marginBottom: 20 }}>
            <Button type='primary' onClick={() => { this.exportBatchClicked('txt') }} className='margin-right'>批量导出txt</Button>
            <Button type='primary' onClick={() => { this.exportBatchClicked('excel') }} className='margin-right'>批量导出excel</Button>
            <Button type='primary' onClick={() => { this.exportBatchImageClicked() }}>批量导出图片</Button>
          </div>
          <div className='flex-end' style={{ minWidth: 862, flex: "1 0 auto", marginBottom: 20 }} >
            <Form layout='inline'>
              <Form.Item
                label='操作员'
              >
                {
                  getFieldDecorator('operId')(
                    <AutoComplete
                      allowClear
                      style={{ width: "240px" }}
                      dataSource={operList}
                      children={
                        operList ? operList.map(item =>
                          <AutoComplete.Option title={item.nickname} key={item.id} value={item.id.toString()} filtertext={`${item.nickname}(${item.username}-${item.roleName})`}>
                            {this.getDealerTotalOption(item)}
                          </AutoComplete.Option>
                        ) : null
                      }
                      placeholder='选择操作员'
                      filterOption={this.autoCompleteFilter}
                    />

                  )
                }
              </Form.Item>

              <Form.Item label='生成日期'>
                {
                  getFieldDecorator('startCreateTimeStamp')(
                    <DatePicker
                      showTime
                      format="YYYY-MM-DD HH:mm:ss"
                      placeholder="开始时间"
                    />

                  )
                }
              </Form.Item>
              <Form.Item label='~' colon={false}>
                {
                  getFieldDecorator('endCreateTimeStamp')(
                    <DatePicker
                      showTime
                      format="YYYY-MM-DD HH:mm:ss"
                      placeholder="结束时间"
                    />

                  )
                }
              </Form.Item>
              <Form.Item>
                {
                  getFieldDecorator('inputData')(
                    <Input placeholder='备注' />
                  )
                }

              </Form.Item>
              <Form.Item>
                <Button type='primary' onClick={this.getPageData}>查询</Button>
              </Form.Item>
              <Form.Item>
                <Button onClick={this.resetSearch}>重置</Button>
              </Form.Item>
            </Form>
          </div>
        </div>
        <Table
          indentSize={10}
          rowKey="id"
          columns={this.columns}
          loading={this.state.showTableLoading}
          pagination={this.state.pagination}
          dataSource={this.state.tableDataList}
          rowSelection={rowSelection}
        />

        <Modal maskClosable={false}
          width={700}
          title='导出格式'
          visible={this.state.exportModalIsVisible}
          onCancel={this._hideExportModal}
          onOk={this.txtExcelModalConfirm}
        >
          <Spin spinning={this.state.exportLoading}>

            <Checkbox.Group value={this.state.hasCheckedArr} onChange={this.onCheckedGroupChange}>
              {
                Object.keys(_checkedObj).map(item =>
                  <Checkbox key={item} value={_checkedObj[item]} onChange={(e) => { this.onCheckedChange(e, item) }}>
                    {_checkedObj[item]}
                  </Checkbox>
                )
              }
            </Checkbox.Group>
            <Button type='primary' onClick={this.clearAllText}>清空所有</Button>

            <div className='margin-top20 margin-bottom20' >
              <Input.TextArea ref="editTextArea" value={this.state.editText} onChange={this.textAreaOnChange} />
            </div>
            <div>请不要输入以下特殊字符:</div>
            <div className="color-red">{"!@#$%^&*.?"}</div>
            <div className='font-bold margin-top'>示例：</div>

            <div>如唯一码为：<span className='font-bold'>{_exampleData.uniqueCode}</span></div>
            <div style={{ wordBreak: "break-all" }}>全码为：<span className='font-bold'>{_exampleData.traceCode}</span></div>
            <div className='margin-top'>根据编辑的规则生成的最终文本为:</div>
            <div style={{ wordBreak: "break-all", minHeight: 60 }} className='color-red'>{this.state.generateText}</div>
          </Spin>
        </Modal>

        <a ref="exportUrl" download="工单数据" style={{ 'display': "none" }} href={this.state.exportUrl} ></a>

        <QrcodeImageModal
          qrcodeType='2'
          onOk={(d) => { return this.qrcodeImageModalSaveClicked(d) }}
          selectData={this.state.selectData}
          visible={this.state.qrcodeImageModalIsVisible}
          onCancel={this._hideImageQrcodeModal}
        />
      </div>
    )
  }
}

export default Form.create()(Page);