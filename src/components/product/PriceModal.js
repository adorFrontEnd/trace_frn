import { Upload, Radio, InputNumber, Form, Col, Input, Row, Modal, Select } from 'antd';
import React, { Component } from 'react';
import Toast from '../../utils/toast';
const FormItem = Form.Item;
const Option = Select.Option;
const RadioGroup = Radio.Group;

const priceUnitArr = [
  {
    id: "0",
    name: "分钟"
  },
  {
    id: "1",
    name: "小时"
  },
  {
    id: "2",
    name: "天"
  }
]

class PriceModal extends Component {

  state = {
    mainPriceType: 0,
    selectUnitPriceType: priceUnitArr[0],
    unitPrice: 0.01,
    priceInterval: 1,
    minPrice: 0,
    stepPriceArr: [{ k: 0, price: 0, unit: 0 }, { k: -1, price: 0, unit: 0 }],
    priceRuleValidInfo: "",
    stepPriceCount: 0,
    expressionRemark: ""
  }

  componentDidMount() {
    let priceModalData = this.props.priceModalData;
    if (!priceModalData || !Object.keys(priceModalData).length) {
      return;
    }
  }

  componentWillReceiveProps(props) {
    if (JSON.stringify(props.priceModalData) != JSON.stringify(this.props.priceModalData)) {
      this.setPriceModalData(props.priceModalData);
    }
  }

  setPriceModalData = (priceModalData) => {

    if (!priceModalData || !Object.keys(priceModalData).length) {
      return;
    }
    let { minimumTerm, expression, unitPrice, unitPriceType, expressionRemark } = priceModalData;
    let mainPriceType = expression ? 1 : 0;

    unitPrice = expression ? 0 : unitPrice;
    let priceInterval = 1;
    let priceUnit = this.getPriceUnitById(unitPriceType);
    unitPriceType = { key: unitPriceType, label: priceUnit.name };
    let data = { minimumTerm };
    this.props.form.setFieldsValue(data);
    this.setState({
      mainPriceType,
      unitPrice,
      unitPriceType,
      priceInterval,
      expressionRemark
    })
  }

  getPriceUnitById = (id) => {
    let arr = priceUnitArr.filter(item => item.id == id);
    return arr[0];
  }

  onPriceTypeChange = (e) => {
    this.setState({
      mainPriceType: e.target.value,
    });
  }

  onPriceUnitChange = (data) => {
    let { key, label } = data;
    let selectUnitPriceType = { id: key, name: label };
    this.setState({
      selectUnitPriceType
    })
  }

  onCancel = () => {
    this.props.onCancel();
  }

  onOk = () => {
    this._priceValidate()
      .then(params => {
        this.props.saveClicked(params);
      })
  }

  onValidate = () => {
    this._priceValidate()
      .then(params => {
        let { expressionRemark } = params;
        this.setState({
          expressionRemark
        })
      })
  }

  _priceValidate = () => {
    return new Promise((resolve) => {
      this.props.form.validateFields((err, data) => {
        if (err) {
          return;
        }
        let mainPriceType = this.state.mainPriceType;
        let ruleIsValid = mainPriceType == 1 ? this.validatePriceRule() : false;

        if (ruleIsValid) {
          return;
        }

        let unitPriceType = data.unitPriceType.key;
        let expression = mainPriceType == 1 ? this.getPriceRuleExpression(this.state.stepPriceArr) : '';
        let unitPrice = mainPriceType == 0 ? this.state.unitPrice : 0;
        let unitName = this.state.selectUnitPriceType['name'];
        let priceInterval = 1;
        let minPrice = mainPriceType == 0 ? Math.ceil(unitPrice * 100 / priceInterval) / 100 : this.getPriceRuleMinPrice(this.state.stepPriceArr);
        let expressionRemark = mainPriceType == 1 ? this.getPriceRuleExpressionRemark(this.state.stepPriceArr) : `${unitPrice}元/${unitName}`;
        let params = {
          ...data,
          unitPriceType,
          unitPrice,
          priceInterval,
          minPrice,
          expression,
          expressionRemark
        }
        resolve(params);
      })
    })
  }

  getPriceResult = (priceArr, index) => {
    let result = '';
    let unitNum = 0;
    let id = this.state.selectUnitPriceType['id'];
    switch (id) {
      case "0":
        unitNum = 60 * 1000;
        break;

      case "1":
        unitNum = 60 * 60 * 1000;
        break;

      case "2":
        unitNum = 24 * 60 * 60 * 1000;
        break;
    }
    let tempArr = priceArr.slice(0, index + 1);
    if (index == 0) {
      let price = priceArr[0].price;
      // return `_time*${price}*${unitNum}`
      return `_time*${price}`
    } else {
      let arr = tempArr.map((item, i) => {
        let price = item["price"];
        if (i == 0) {
          // return `${item["unit"]}*${price}*${unitNum}`
          return `${item["unit"]}*${price}`
        } else if (i == tempArr.length - 1) {
          let lastUnit = tempArr[i - 1].unit2 || tempArr[i - 1].unit;
          // return `(_time-${lastUnit})*${price}*${unitNum}`
          return `(_time-${lastUnit})*${price}`
        } else {
          let lastUnit = item.unit2 ? parseInt(item.unit2) - parseInt(item.unit) : parseInt(item.unit);
          // return `${lastUnit}*${price}*${unitNum}`
          return `${lastUnit}*${price}`
        }
      })
      return arr.join('+');
    }
  }

  getPriceRuleExpression = (priceArr) => {
    let exp = '';
    priceArr.forEach((item, index) => {

      let result = '';
      if (index == 0) {
        result = this.getPriceResult(priceArr, index);
        exp += `if(_time<=${item.unit}){result=${result}}`;
      } else if (index != priceArr.length - 1) {
        result = this.getPriceResult(priceArr, index);
        exp += `else if(_time>${item.unit}&&_time<=${item.unit2}){result=${result};}`;
      } else {
        result = this.getPriceResult(priceArr, index);
        exp += `else {result=${result};}`;
      }
    });
    return exp;
  }

  getPriceRuleMinPrice = (priceArr) => {
    let arr = priceArr.map(item => item.price).sort((a, b) => parseFloat(a) - parseFloat(b));
    let minPrice = arr[0];
    return minPrice;
  }

  getPriceRuleExpressionRemark = (priceArr) => {
    let exp = '';
    let unitName = this.state.selectUnitPriceType['name'];
    let priceUnitName = `元/${unitName}`;
    priceArr.forEach((item, index) => {

      let result = '';

      if (index == 0) {
        exp += `${item.unit}${unitName}(含)以内：${item.price}${priceUnitName}，`;
      } else if (index != priceArr.length - 1) {
        exp += `${item.unit}~${item.unit2}${unitName}：${item.price}${priceUnitName}，`;
      } else {
        exp += `${item.unit}${unitName}以上(不含)：${item.price}${priceUnitName}`;
      }
    });
    return exp
  }

  onUnitPriceChange = (unitPrice) => {
    this.setState({
      unitPrice
    },()=>{
      this.onValidate();
    });
    
  }

  onPriceIntervalChange = (priceInterval) => {
    this.setState({
      priceInterval
    },()=>{
      this.onValidate();
    });
  
  }

  onStepPriceChange = (index, num, k) => {
    let stepPriceArr = this.state.stepPriceArr;
    stepPriceArr[index][k] = num;
    if (index < stepPriceArr.length - 1) {
      if (index == 0 && k == 'unit') {
        stepPriceArr[index + 1]['unit'] = num
      }
      if (index > 0 && k == 'unit2') {
        stepPriceArr[index + 1]['unit'] = num
      }
    }
    this.setState({
      stepPriceArr
      // priceRuleValidInfo: null
    })
    this.onValidate();
  }

  addPriceRule = () => {
    if (this.state.stepPriceCount == 3) {
      return;
    }

    let stepPriceArr = this.state.stepPriceArr;
    let index = stepPriceArr.length - 1;
    let k = Date.now();
    stepPriceArr.splice(index, 0, { k, price: 0, unit: 0, unit2: 0 });
    let stepPriceCount = this.state.stepPriceCount + 1;
    this.setState({
      stepPriceArr,
      priceRuleValidInfo: null,
      stepPriceCount
    })
  }

  deletePriceRule = (index) => {
    let stepPriceCount = this.state.stepPriceCount - 1;
    let stepPriceArr = this.state.stepPriceArr;
    stepPriceArr.splice(index, 1);
    this.setState({
      stepPriceArr,
      stepPriceCount
    })
  }

  validatePriceRule = () => {
    let stepPriceArr = this.state.stepPriceArr;
    let priceRuleValidInfo = null;
    for (let i = 0; i < stepPriceArr.length; i++) {
      let item = stepPriceArr[i];
      let thisUnit = stepPriceArr[i].unit;
      let price = parseFloat(stepPriceArr[i].price);

      if (price <= 0) {
        priceRuleValidInfo = `第${i + 1}段价格不能为0`;
        break;
      }

      if (thisUnit === 0) {
        priceRuleValidInfo = `第${i + 1}段开始时间不能为0`;
        break;
      } else if (i === 0) {
        continue;
      }

      let lastUnit = stepPriceArr[i - 1].unit2 || stepPriceArr[i - 1].unit;
      let thisUnit2 = stepPriceArr[i].unit2;
      if (thisUnit2 === 0) {
        priceRuleValidInfo = `第${i + 1}段结束时间不能为0`;
        break;
      }

      if (lastUnit != thisUnit) {
        priceRuleValidInfo = `第${i + 1}段开始时间与第${i}段结束时间不符合`;
        break;
      }

      if (thisUnit2 && thisUnit2 <= thisUnit) {
        priceRuleValidInfo = `第${i + 1}段结束时间必须大于第${i}段开始时间`;
        break;
      }
    }
    this.setState({
      priceRuleValidInfo
    })
    return !!priceRuleValidInfo
  }

  renderStepPrice = (stepPriceArr) => {
    let length = stepPriceArr.length;
    return stepPriceArr.map((item, index) => {

      if (index == 0) {
        return (
          <Row key={item.k} className='line-height40'>
            <Col span={6} className='text-right'>
              <span className='label-color label-required'>租赁价格：</span>
            </Col>
            <Col span={18}>
              <div>
                <span><InputNumber onChange={(num) => { this.onStepPriceChange(index, num, 'unit') }} value={item.unit} precision={0} style={{ width: 80 }} min={1} max={999999} /></span>
                <span style={{ marginLeft: "5px" }}>{this.state.selectUnitPriceType.name}(含)以内</span>，
              <span>
                  <InputNumber onChange={(num) => { this.onStepPriceChange(index, num, 'price') }} value={item.price} precision={2} style={{ width: 80, marginRight: "5px" }} min={0} max={999999} />元/{this.state.selectUnitPriceType.name}，
              </span>
                <span style={{ marginLeft: "5px" }} onClick={this.addPriceRule} className='edit-span' >{this.state.stepPriceCount == 1 ? "" : "添加租赁价格规则"}</span>
              </div>
            </Col>
          </Row>
        )
      } else if (index == length - 1) {
        return (
          <Row key={item.k} className='line-height40'>
            <Col span={18} offset={6}>
              <div>
                <span><InputNumber onChange={(num) => { this.onStepPriceChange(index, num, 'unit') }} value={item.unit} precision={0} style={{ width: 80 }} min={0} max={999999} /></span>
                <span style={{ marginLeft: "5px" }}>{this.state.selectUnitPriceType.name}以上</span>，
                <span>
                  <InputNumber onChange={(num) => { this.onStepPriceChange(index, num, 'price') }} value={item.price} precision={2} style={{ width: 80, marginRight: "5px" }} min={0} max={999999} />元/{this.state.selectUnitPriceType.name}
                </span>
              </div>
            </Col>
          </Row>
        )
      } else {
        return (
          <Row key={item.k} className='line-height40'>
            <Col offset={6} span={18}>
              <div>
                <span><InputNumber onChange={(num) => { this.onStepPriceChange(index, num, 'unit') }} value={item.unit} precision={0} style={{ width: 80 }} min={0} max={999999} /></span>
                <span style={{ marginLeft: "5px" }}>~</span>
                <span><InputNumber onChange={(num) => { this.onStepPriceChange(index, num, 'unit2') }} value={item.unit2} precision={0} style={{ width: 80 }} min={0} max={999999} /></span>
                <span style={{ marginLeft: "5px" }}>{this.state.selectUnitPriceType.name}</span>，
                <span>
                  <InputNumber onChange={(num) => { this.onStepPriceChange(index, num, 'price') }} value={item.price} precision={2} style={{ width: 80, marginRight: "5px" }} min={0} max={999999} />元/{this.state.selectUnitPriceType.name}
                </span>
                <span style={{ marginLeft: "8px" }} onClick={() => { this.deletePriceRule(index) }} className='delete-span'>删除</span>
              </div>
            </Col>
          </Row>
        )
      }
    })
  }

  render() {
    const { getFieldDecorator } = this.props.form;
    const formItemLayout = {
      labelCol: {
        xs: { span: 6 }, //<576px
        sm: { span: 6 }, //≥576px
      },
      wrapperCol: {
        xs: { span: 18 },
        sm: { span: 18 }
      },
    };
    return (
      <Modal maskClosable={false}
        zIndex={1001}
        width={640}
        title="编辑产品价格"
        visible={this.props.visible}
        onCancel={this.onCancel}
        onOk={this.onOk}
      >
        <Row className='line-height40'>
          <Col span={6} className='text-right'>
            <span className='label-color label-required'>租赁价格类型：</span>
          </Col>
          <Col span={18}>
            <RadioGroup onChange={this.onPriceTypeChange} value={this.state.mainPriceType}>
              <Radio value={0}>统一</Radio>
              <Radio value={1}>阶梯</Radio>
            </RadioGroup>
          </Col>
        </Row>
        <FormItem label="计价单位：" {...formItemLayout}>
          {getFieldDecorator('unitPriceType', {
            initialValue: { value: priceUnitArr[0].name, key: priceUnitArr[0].id },
            rules: [
              { required: true, message: '请选择计价单位!' }
            ],
          })(
            <Select onChange={this.onPriceUnitChange} labelInValue style={{ width: 80 }} placeholder="选择计价单位">
              {priceUnitArr.map(item => <Option key={item.id} value={item.id}>{item.name}</Option>)}
            </Select>
          )}
        </FormItem>

        <FormItem label="最短租赁时间:" {...formItemLayout}>
          {getFieldDecorator('minimumTerm', {
            initialValue: 1,
            rules: [
              { required: true, message: '请输入最短租赁时间!' }
            ],
          })(
            <InputNumber precision={0} style={{ width: 80 }} min={1} max={999999} />
          )}
          <span style={{ margin: "0 5px" }}>{this.state.selectUnitPriceType.name}</span>
        </FormItem>
        {this.state.mainPriceType == 0 ?
          // 固定价格
          <div>
            <Row className='line-height40'>
              <Col span={6} className='text-right'>
                <span className='label-color label-required'>租赁价格：</span>
              </Col>
              <Col span={18}>
                <InputNumber onChange={this.onUnitPriceChange} value={this.state.unitPrice} precision={2} style={{ width: 80, marginRight: 5 }} min={0.01} max={999999} />
                元/
                {/* <InputNumber onChange={this.onPriceIntervalChange} value={this.state.priceInterval} precision={0} style={{ width: 80, marginRight: 5, marginLeft: 5 }} min={1} max={999999} /> */}
                {this.state.selectUnitPriceType.name}
              </Col>
            </Row>
            <Row className='line-height40'>
              <Col span={6} className='text-right'>
                <span className='label-color label-required'>租赁价格备注：</span>
              </Col>
              <Col span={18}>
                {this.state.expressionRemark}
              </Col>
            </Row>
          </div>
          :
          // 阶梯价格
          <div>
            {
              this.renderStepPrice(this.state.stepPriceArr)
            }
            {
              this.state.priceRuleValidInfo ?
                <Row className='delete-span line-height40'>
                  <Col span={18} offset={6}>
                    {this.state.priceRuleValidInfo}
                  </Col>
                </Row> : null
            }
            {
              <Row className='line-height40'>
                <Col span={6} className='text-right'>
                  <span className='label-color label-required'>租赁价格备注：</span>
                </Col>
                <Col span={18} className='flex align-center' style={{minHeight: 40}}>
                  <div className='line-height20'>{this.state.expressionRemark}</div>                 
                </Col>
              </Row>
            }

          </div>
        }



      </Modal>
    )
  }
}
export default Form.create()(PriceModal)