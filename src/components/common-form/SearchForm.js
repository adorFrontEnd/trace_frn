import React, { Component } from 'react'
import { Input, Select, Form, Button, Checkbox, InputNumber, DatePicker } from 'antd'
import moment from 'moment';
import Toast from '../../utils/toast';

const FormItem = Form.Item;
const Option = Select.Option;
class SearchForm extends Component {
  hasExport = this.props.exportClicked ? true : false;
  oneRowStyle = {
    flex: "1 0 auto",
    display: "inline-flex",
    alignItems: "center"
  }
  twoRowStyle = {
    flex: "1 0 auto",
    display: "inline-flex",
    flexDirection: "column",
    justifyContent: "center"
  }
  autoCompleteList = []
  renderformItemList = () => {
    const { getFieldDecorator } = this.props.form;
    const formItemList = this.props.formItemList;
    const formItems = [];
    if (formItemList && formItemList.length > 0) {
      formItemList.forEach((item, i) => {
        let label = item.label;
        let props = item.props;
        let labelStop = item.labelStop;
        let field = item.field;
        let fieldStop = item.fieldStop;
        let optionList = item.optionList;
        let className = item.className || "";
        let initialValue = item.initialValue || '';
        let placeholder = item.placeholder;
        let placeholderStop = item.placeholderStop;
        let defaultOption = item.defaultOption;
        let dataSource = item.dataSource;
        let style = item.style || {};
        let styleStop = item.styleStop || {};
        let addonAfter = item.addonAfter;
        let addonAfterStop = item.addonAfterStop;
        let addonBefore = item.addonBefore;
        let addonBeforeStop = item.addonBeforeStop;
        let rules = item.rules;
        let colon = item.colon === false ? false : true;

        switch (item.type) {

          // 下拉选择
          default:
          case "SELECT":
            const select = <FormItem label={label} key={field} colon={colon} style={style}>
              {
                getFieldDecorator(field, {
                  initialValue: initialValue || defaultOption ? defaultOption.id : null
                })(
                  <Select
                    {...props}
                    onChange={this.onChange}
                    style={style}
                    placeholder={placeholder}
                  >
                    {
                      defaultOption ?
                        <Option title={item.title} key={defaultOption.id} value={defaultOption.id}>{defaultOption.name}</Option>
                        : null
                    }
                    {optionList ?
                      optionList.map(item => <Option title={item.title} key={item.id} value={item.id}>{item.name}</Option>)
                      : null
                    }
                  </Select>

                )
              }
            </FormItem>;
            formItems.push(select);
            break;

          case "AUTOCOMPLETE":
            const AUTOCOMPLETE = <FormItem label={label} key={field} style={style} colon={colon}>
              {
                getFieldDecorator(field)(
                  <Select
                    {...props}
                    allowClear
                    showSearch
                    style={style}
                    placeholder={placeholder}
                    optionFilterProp="children"
                    filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                  >
                    {optionList.map(item => <Option title={item.title} key={item.id} value={item.id}>{item.name}</Option>)}
                  </Select>
                )
              }
            </FormItem>
            formItems.push(AUTOCOMPLETE);
            break;

          // 多选
          case "CHECKBOX":
            const CHECKBOX = <FormItem label={label} key={field} style={style} colon={colon}>
              {
                getFieldDecorator(field, {
                  valuePropName: 'checked',
                  initialValue: initialValue
                })(
                  <Checkbox {...props} onChange={this.onChange}>
                    {label}
                  </Checkbox>
                )
              }
            </FormItem>;
            formItems.push(CHECKBOX)
            break;

          // 输入框
          case "INPUT":
            const INPUT = <FormItem label={label} key={field} colon={colon}>
              {
                getFieldDecorator(field, {
                  initialValue: ""
                })(
                  <Input
                    {...props}
                    onChange={this.onChange}
                    style={style}
                    addonAfter={addonAfter}
                    addonBefore={addonBefore}
                    placeholder={placeholder}
                  />
                )
              }
            </FormItem>
            formItems.push(INPUT)
            break;

          // 输入框
          case "INPUT_RANGE":
            const INPUT_START = <FormItem label={label} key={field} colon={colon}>
              {
                getFieldDecorator(field, {
                  initialValue: ""
                })(
                  <Input
                    {...props}
                    onChange={this.onChange}
                    style={style}
                    addonAfter={addonAfter}
                    addonBefore={addonBefore}
                    placeholder={placeholder}
                  />
                )
              }
            </FormItem>
            const INPUT_STOP = <FormItem label={labelStop || "~"} key={fieldStop} colon={false}>
              {
                getFieldDecorator(fieldStop, {
                  initialValue: ""
                })(
                  <Input
                    {...props}
                    onChange={this.onChange}
                    style={styleStop}
                    addonAfter={addonAfterStop}
                    addonBefore={addonBeforeStop}
                    placeholder={placeholderStop}
                  />
                )
              }
            </FormItem>
            const RANGE = <div key={field + fieldStop} style={{ display: "inline-block" }}>
              {INPUT_START}{INPUT_STOP}
            </div>
            formItems.push(RANGE);
            break;

          // 输入框
          case "INPUT_NUMBER_RANGE":
            const INPUT_NUMBER_START = <FormItem label={label} key={field} colon={colon}>
              {
                getFieldDecorator(field)(
                  <InputNumber
                    {...props}
                    onChange={this.onChange}
                    style={style}
                    addonAfter={addonAfter}
                    addonBefore={addonBefore}
                    placeholder={placeholder}
                  />
                )
              }
            </FormItem>
            const INPUT_NUMBER_STOP = <FormItem label={labelStop || "~"} key={fieldStop} colon={false}>
              {
                getFieldDecorator(fieldStop)(
                  <InputNumber
                    {...props}
                    onChange={this.onChange}
                    style={styleStop}
                    addonAfter={addonAfterStop}
                    addonBefore={addonBeforeStop}
                    placeholder={placeholderStop}
                  />
                )
              }
            </FormItem>
            const NUMBER_RANGE = <div key={field + fieldStop} style={{ display: "inline-block" }}>
              {INPUT_NUMBER_START}{INPUT_NUMBER_STOP}
            </div>
            formItems.push(NUMBER_RANGE);
            break;


          case "DATE":
            const startTime = <FormItem label={label || "选择时间"} key={"startTime"}>
              {
                getFieldDecorator('startTime')(
                  <DatePicker onChange={this.onChange} style={{ width: 170 }} showTime={true} placeholder={placeholder || "请选择开始时间"} format="YYYY-MM-DD HH:mm:ss" />
                )
              }
            </FormItem>;
            const endTime = <FormItem label="~" colon={false} key={"endTime"}>
              {
                getFieldDecorator('endTime')(
                  <DatePicker onChange={this.onChange} style={{ width: 170 }} showTime={true} placeholder={placeholderStop || "请选择结束时间"} format="YYYY-MM-DD HH:mm:ss" />
                )
              }
            </FormItem>;

            const DATE = <div key='dateRange' style={{ display: "inline-block" }}>
              {startTime}{endTime}
            </div>
            formItems.push(DATE);
            break;

          case "DATE_YM":
            const _time = <FormItem label={label || "选择时间"} key={"time"}>
              {
                getFieldDecorator(field, {
                  initialValue: initialValue || moment(Date.now())
                })(
                  <DatePicker.MonthPicker onChange={this.onChange} style={{ width: 150 }} showTime={true} placeholder={placeholder || "请选择时间"} format="YYYY-MM" />
                )
              }
            </FormItem>;
            const DATE_YM = <div key='dateRange' style={{ display: "inline-block" }}>
              {_time}
            </div>
            formItems.push(DATE_YM);
            break;

        }
      })
      return formItems;
    }
  }
  render() {
    const _forms =
      <Form layout="inline" style={{ flex: "1 1 auto" }}>
        {this.renderformItemList()}
      </Form>
    const _buttons = (
      <div className="flex" style={{ float: "right" }}>
        <div className='flex-middle' style={{ height: 40 }}>
          {
            this.props.searchClicked ?
              <Button type="primary" style={{ marginRight: 20, width: 100 }} onClick={this.searchClicked}>查询</Button>
              : null
          }
          {
            this.props.searchClicked ?
              <Button style={{ width: 100 }} onClick={this.resetClicked}>重置</Button>
              : null
          }
          {
            this.hasExport ?
              <Button className="yellow-btn" style={{ width: 100, marginLeft: 20 }} onClick={this.exportClicked}>导出</Button>
              : null
          }
          {
            this.props.children
          }
        </div>
      </div>
    );
    return (<div style={this.props.towRow ? { width: "100%" } : { display: "flex", width: "100%" }}>{_forms}{_buttons}</div>)
  }
  autoCompleteFilter = (inputValue, option) => {
    return option.props.children.toUpperCase().indexOf(inputValue.toUpperCase()) !== -1
  }
  exportClicked = () => {
    let params = this.getValue();
    if (!params) {
      return;
    }
    this.props.exportClicked(params);
  }
  // 查询
  searchClicked = () => {
    let params = this.getValue();
    if (!params) {
      return;
    }
    this.props.searchClicked(params);
  }

  getValue = () => {
    let params = this.props.form.getFieldsValue();
    // params = this.getAutoCompleteIds(params);

    if (params && params.startTime) {
      params.startTime = Date.parse(params.startTime)
    }
    if (params && params.endTime) {
      params.endTime = Date.parse(params.endTime)
    }
    if (params && params.endTime && params.startTime) {
      if (parseInt(params.startTime) > parseInt(params.endTime)) {
        Toast("开始时间大于结束时间", 'info')
        return;
      }
    }
    return params;
  }

  getAutoCompleteIds = (params) => {
    this.autoCompleteList = this.props.formItemList.filter((item) => item.type == 'AUTOCOMPLETE')

    if (!this.autoCompleteList || !this.autoCompleteList.length) {
      return params;
    }

    this.autoCompleteList.forEach(item => {
      let k = item.field;
      if (params.hasOwnProperty(k) && params[k]) {
        let optionList = item.optionList;
        let val = params[k];
        let filtArr = optionList.filter(option => option.name == val);
        if (filtArr && filtArr.length) {
          params[k] = filtArr[0].id;
        } else {
          params[k] = null;
        }

      }
    })
    return params;
  }

  // 重置
  resetClicked = () => {
    this.props.form.resetFields();
    this.props.resetClicked();
  }

  onChange = () => {
    if (!this.props.onValueChange) {
      return;
    }
    let params = this.props.form.getFieldsValue();
    this.props.onValueChange(params);
  }

}
export default Form.create()(SearchForm);