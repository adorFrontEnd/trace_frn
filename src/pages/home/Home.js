import React, { Component } from "react";
import { Form, Select, Col, Row, Spin, Button, Modal, DatePicker } from "antd";
import { getSecurityCount, getSecurityStatistics, getAttentionCount, getAttentionStatistics, getScanQuantityStatistics, getAreaStatistics, getScanAreaStatistics, getScanStatistics } from '../../api/home/home';
import Toast from '../../utils/toast';
import echarts from 'echarts/lib/echarts'
import dateUtil from '../../utils/dateUtil';
import { themeWalden } from '../../components/echarts';
import { title as _appTitle } from '../../config/app.config';
import { getCacheDecoration } from '../../middleware/localStorage/login';
import { getMapOption, getScanPieOption, getTrendOption } from "./MapOption";
import moment from 'moment';
import 'echarts/lib/chart/bar'
import 'echarts/lib/component/tooltip'
import 'echarts/lib/component/title'
import 'echarts/lib/component/legend'
import 'echarts/map/js/china.js'
import ReactEcharts from 'echarts-for-react'
import './home.less';
const _title = "数据统计";
const _description = "";
const yearArr = dateUtil.getRecentYears();


export default class Home extends Component {
  state = {
    securityCount: null,
    securityLoading: false,
    timeType: "0",
    startYear: yearArr[0],
    startMonth: "",
    yearArr: yearArr,
    securityTrend: null,
    securityTrendLoading: false,
    showSecurityTrendData: false,

    attentionCount: null,
    attentionTimeType: "0",
    attentionStartYear: yearArr[0],
    attentionStartMonth: "",
    attentionTrend: null,
    attentionTrendLoading: false,
    showAttentionTrendData: false,

    scanPie: null,
    scanTimeType: "0",
    scanStartYear: yearArr[0],
    scanStartMonth: "",
    scanLoading: false,
    scanStartDayStamp: null,

    productTimeType: "0",
    productStartYear: yearArr[0],
    productStartMonth: "",
    productLoading: false,
    chinaMapData: null,
    mapLoading: false,
    bigMapModalIsVisible: false,
    quantityStamp: null,
    quantityData: null,
    quantityLoading: false
  }

  componentDidMount() {
    let decorationData = getCacheDecoration();
    let title = decorationData && decorationData.name ? decorationData.name : _appTitle;
    document.title = title;
    this._getSecurityCount();
    this._getSecurityStatistics();
    this._getAttentionCount();
    this._getAttentionStatistics();
    this._getScanQuantityStatistics();
    this._getScanAreaStatistics();
    this._getScanStatistics();
    this._getAreaStatistics();

  }

  /**中国地图 ****************************************************************************************************************************************/
  _getAreaStatistics = () => {

    this.setState({
      mapLoading: true
    });

    getAreaStatistics()
      .then(data => {

        let chinaMapData = data && data.length ? getMapOption(data) : null;
        this.setState({
          chinaMapData,
          mapLoading: false
        })
      })
      .catch(() => {
        this.setState({
          mapLoading: false
        })
      })
  }

  showBigMapModal = () => {
    this.setState({
      bigMapModalIsVisible: true
    })
  }

  hideBigMapModal = () => {
    this.setState({
      bigMapModalIsVisible: false
    })
  }

  /**统计总数****************************************************** */
  _getScanQuantityStatistics = () => {

    this.getScanQuantityStatistics(true);
  }

  getScanQuantityStatistics = (init) => {
    let startTimeStamp = null;
    let endTimeStamp = null;
    let stamp = null;

    if (init) {
      let initData = this.getDayStamp();
      startTimeStamp = initData.startTimeStamp;
      endTimeStamp = initData.endTimeStamp;
      let quantityStamp = initData.stamp;
      this.setState({
        quantityStamp: moment(quantityStamp)
      })
    } else {
      let _quantityStamp = this.state.quantityStamp;
      if (!_quantityStamp) {
        Toast("请选择时间！")
        return;
      }

      stamp = Date.parse(_quantityStamp);
      let _initData = this.getDayStamp(stamp);
      startTimeStamp = _initData.startTimeStamp;
      endTimeStamp = _initData.endTimeStamp;
    }
    this.setState({
      quantityLoading: true
    })
    getScanQuantityStatistics({ startTimeStamp, endTimeStamp })
      .then(quantityData => {
        this.setState({
          quantityData,
          quantityLoading: false
        })
      })
      .catch(() => {
        this.setState({
          quantityLoading: false
        })
      })
  }

  onQuantityTimeChange = (quantityStamp) => {
    this.setState({
      quantityStamp
    })
  }

  searchQulality = () => {
    this.getScanQuantityStatistics();
  }

  getDayStamp = (stamp) => {
    let now = Date.now();
    let yesterday = now - 24 * 3600000;
    stamp = stamp || yesterday;
    let startTimeStamp = dateUtil.getDayStartStamp(stamp);
    let endTimeStamp = dateUtil.getDayStopStamp(stamp);
    return {
      startTimeStamp,
      endTimeStamp,
      stamp
    }
  }

  _getScanStatistics = () => {
    this.getScanStatistics(true);
  }

  _getAttentionCount = () => {
    getAttentionCount()
      .then(attentionCount => {
        this.setState({
          attentionCount
        })
      })
  }


  _getAttentionStatistics = () => {
    this.searchAttentionData(true)
  }


  _getSecurityCount = () => {
    getSecurityCount()
      .then(securityCount => {
        this.setState({
          securityCount: securityCount || 0
        })

      })
  }

  _getSecurityStatistics = () => {
    this.searchData(true);
  }

  disabledDate(current) {
    // Can not select days before today and today
    return current && current > moment().startOf('day');
  }

  /**防伪******************************************************************************************************************** */
  timeTypeOnChange = (timeType) => {
    this.setState({
      timeType
    })
    if (this.state.timeType == "0") {
      this.setState({
        startYear: yearArr[0]
      })
      return;
    }
  }

  startYearOnChange = (startYear) => {
    this.setState({
      startYear
    })
  }


  startMonthOnChange = (startMonth) => {
    let startTimeStamp = Date.parse(startMonth);
    this.setState({
      startTimeStamp
    })

  }

  searchData = (init) => {
    let params = {};
    if (init) {
      params = {
        timeType: "0",
        startYear: yearArr[0]
      }
      this.setState({
        timeType: "0",
        startYear: yearArr[0]
      })
    }
    let timeType = this.state.timeType || params.timeType;
    let startYear = this.state.startYear || params.startYear;
    let startTimeStamp = null;
    if (timeType == 0) {
      startTimeStamp = this.getYearStartStamp(startYear);
    } else {
      startTimeStamp = this.state.startTimeStamp;
    }


    let data = {
      timeType,
      startTimeStamp
    }
    this.setState({
      securityTrendLoading: true
    })
    getSecurityStatistics(data)
      .then(res => {
        let trendData = JSON.parse(res);
        let keys = Object.keys(trendData);
        let values = Object.values(trendData);
        let result = {
          keys, values
        }

        let securityTrend = getTrendOption(result);
        this.setState({
          showSecurityTrendData: true,
          securityTrend,
          securityTrendLoading: false
        })
      })
      .catch(() => {
        this.setState({
          securityTrendLoading: false
        })
      })
  }

  getYearStartStamp = (year) => {
    let result = Date.parse(year + "-01-01 00:00:00");
    return result;
  }

  /**关注******************************************************************************************************************** */

  attentionTimeTypeOnChange = (attentionTimeType) => {
    this.setState({
      attentionTimeType
    })
    if (this.state.attentionTimeType == "0") {
      this.setState({
        attentionStartYear: yearArr[0]
      })
      return;
    }
  }

  attentionStartYearOnChange = (attentionStartYear) => {
    this.setState({
      attentionStartYear
    })
  }


  attentionStartMonthOnChange = (attentionStartMonth) => {
    let attentionStartTimeStamp = Date.parse(attentionStartMonth);
    this.setState({
      attentionStartTimeStamp
    })
  }

  searchAttentionData = (init) => {
    let params = {};
    if (init) {
      params = {
        attentionTimeType: "0",
        attentionStartYear: yearArr[0]
      }
      this.setState({
        attentionTimeType: "0",
        attentionStartYear: yearArr[0]
      })
    }
    let timeType = this.state.attentionTimeType || params.attentionTimeType;
    let attentionStartYear = this.state.attentionStartYear || params.attentionStartYear;
    let startTimeStamp = null;
    if (timeType == 0) {
      startTimeStamp = this.getYearStartStamp(attentionStartYear);
    } else {
      startTimeStamp = this.state.attentionStartTimeStamp;
    }


    let data = {
      timeType,
      startCreateTimeStamp: startTimeStamp
    }
    this.setState({
      attentionTrendLoading: true
    })
    getAttentionStatistics(data)
      .then(res => {
        let trendData = JSON.parse(res);
        let keys = Object.keys(trendData);
        let values = Object.values(trendData);
        let result = {
          keys, values
        }

        let attentionTrend = getTrendOption(result, 'attention');
        this.setState({
          showAttentionTrendData: true,
          attentionTrend,
          attentionTrendLoading: false
        })
      })
      .catch(() => {
        this.setState({
          attentionTrendLoading: false
        })
      })
  }

  /**扫描 **************************************************************************************************************************/
  _getScanAreaStatistics = () => {

    this.searchScanData(true);
  }

  scanTimeTypeOnChange = (scanTimeType) => {
    this.setState({
      scanTimeType
    })
    if (this.state.scanTimeType == "0") {
      this.setState({
        scanStartYear: yearArr[0]
      })
      return;
    }
  }

  scanStartYearOnChange = (scanStartYear) => {
    this.setState({
      scanStartYear
    })
  }


  scanStartMonthOnChange = (startMonth) => {
    let scanStartTimeStamp = Date.parse(startMonth);
    this.setState({
      scanStartTimeStamp
    })
  }

  scanStartDayOnChange = (startDay) => {

    let scanStartDayStamp = Date.parse(startDay);
    this.setState({
      scanStartDayStamp
    })
  }


  searchScanData = (init) => {
    let params = {};
    if (init) {

      params = {
        scanTimeType: "0",
        scanStartYear: yearArr[0]
      }
    }
    let timeType = this.state.scanTimeType || params.scanTimeType;
    let scanStartYear = this.state.scanStartYear || params.scanStartYear;
    let scanStartDayStamp = this.state.scanStartDayStamp;
    let startTimeStamp = null;
    if (timeType == 0) {
      startTimeStamp = this.getYearStartStamp(scanStartYear);
    } else if (timeType == 1) {
      startTimeStamp = this.state.scanStartTimeStamp;
    } else {
      if (!scanStartDayStamp) {
        Toast("请设置日期！");
        return;
      }
      startTimeStamp = dateUtil.getDayStartStamp(scanStartDayStamp);
    }

    let data = {
      timeType,
      startTimeStamp
    }

    this.setState({
      scanLoading: true
    })
    getScanAreaStatistics(data)
      .then(res => {

        let resData = Object.keys(res);
        this.setState({
          scanLoading: false
        })
        if (!resData || !resData.length) {
          this.setState({
            scanPie: null
          })
          return;
        }
        let optionData = resData.map(item => {
          return {
            name: item,
            value: res[item]
          }
        })
        let scanPie = getScanPieOption(optionData);
        this.setState({
          scanPie
        })
      })
      .catch(() => {
        this.setState({
          scanLoading: false
        })
      })
  }


  /****防伪商品统计 *****************************************************************************************************************************************/
  getScanStatistics = (init) => {

    let params = {};

    if (init) {
      params = {
        productTimeType: "0",
        productStartYear: yearArr[0]
      }
      this.setState(params);
    }

    let timeType = this.state.productTimeType || params.productTimeType;
    let scanStartYear = this.state.productStartYear || params.productStartYear;
    let productStartDayStamp = this.state.productStartDayStamp;
    let startTimeStamp = null;
    if (timeType == 0) {
      startTimeStamp = this.getYearStartStamp(scanStartYear);
    } else {
      startTimeStamp = this.state.productStartTimeStamp;
    }

    let data = {
      timeType,
      startTimeStamp
    }

    this.setState({
      productLoading: true
    })
    getScanStatistics(data)
      .then(productList => {
        this.setState({
          productList,
          productLoading: false
        })
      })
      .catch(() => {
        this.setState({
          productLoading: false
        })
      })
  }

  productTimeTypeOnChange = (productTimeType) => {
    this.setState({
      productTimeType
    })
    if (this.state.productTimeType == "0") {
      this.setState({
        productStartYear: yearArr[0]
      })
      return;
    }
  }

  productStartYearOnChange = (productStartYear) => {
    this.setState({
      productStartYear
    })
  }


  productStartMonthOnChange = (startMonth) => {
    let productStartTimeStamp = Date.parse(startMonth);
    this.setState({
      productStartTimeStamp
    })
  }


  /****渲染 *****************************************************************************************************************************************/

  render() {
    return (
      <div className='line-height20' >
        <div className='line-height40 font-bold font-20 padding-left margin-bottom'>数据统计</div>
        <Row className='charts-text-color' style={{ display: "flex", alignItems: "stretch" }} type='flex'>
          <Col span={8} style={{ borderRight: "10px solid #f2f2f2", background: "#fff" }} >
            <Spin spinning={this.state.mapLoading}>
              <div className='flex-between line-height40 padding font-14'>
                <span>&emsp;&emsp;&emsp;</span>
                <span className='font-20 charts-text-color font-bold'>会员地理分布统计</span>
                {
                  this.state.chinaMapData ?
                    <a onClick={this.showBigMapModal}>查看大图</a>
                    :
                    <span>&emsp;&emsp;&emsp;</span>
                }
              </div>
              {
                this.state.chinaMapData ?
                  <ReactEcharts theme='themeWalden' option={this.state.chinaMapData} style={{ minHeight: 600 }} />
                  :
                  <div style={{ textAlign: "center", lineHeight: "40px" }}>暂无数据</div>
              }
            </Spin>
          </Col>
          <Col span={16} >
            <div className='padding10-20' style={{ width: "100%", background: "#fff" }}>
              <DatePicker
                disabledDate={this.disabledDate}
                onChange={this.onQuantityTimeChange}
                value={this.state.quantityStamp}
              />
              <Button type='primary' className='normal margin-left20' onClick={this.searchQulality}>查询</Button>
            </div>
            <Spin spinning={this.state.quantityLoading}>
              {
                this.state.quantityData ?
                  <Row className='margin-bottom'>
                    <Col span={8} className='text-center' style={{ backgroundColor: "transparent" }}>
                      <div className='line-height40' style={{ backgroundColor: "#fff" }}>
                        <div className='font-24'>{this.state.quantityData.produceScan || 0}件</div>
                        <div>完成关联</div>
                      </div>
                    </Col>
                    <Col span={8} className='text-center' style={{ backgroundColor: "#transparent" }}>
                      <div className='line-height40' style={{ backgroundColor: "#fff" }}>
                        <div className='font-24'>{this.state.quantityData.outboundScan || 0}件</div>
                        <div>完成拣货</div>
                      </div>
                    </Col>
                    <Col span={8} className='text-center' style={{ backgroundColor: "#transparent" }}>
                      <div className='line-height40' style={{ backgroundColor: "#fff" }}>
                        <div className='font-24'>{this.state.quantityData.housekeeperOutboundScan || 0}件</div>
                        <div>完成出库</div>
                      </div>
                    </Col>
                  </Row>
                  :
                  <div style={{ textAlign: "center", lineHeight: "40px" }}>暂无数据</div>
              }
            </Spin>

            <Row gutter={8}>
              <Col span={8} style={{ backgroundColor: "transparent" }}>
                <div style={{ backgroundColor: "#fff" }}>
                  <div className='padding'>
                    <div className='font-bold'>防伪扫描地区前四占比</div>
                  </div>
                  <div >
                    <div className='padding'>
                      <Form layout='inline'>
                        <Form.Item label="时间粒度" key="timeType">
                          <Select value={this.state.scanTimeType} onChange={this.scanTimeTypeOnChange} style={{ width: 60 }}>
                            <Select.Option value='0'>年</Select.Option>
                            <Select.Option value='1'>月</Select.Option>
                            <Select.Option value='2'>日</Select.Option>
                          </Select>
                        </Form.Item>
                        <Form.Item label="日期" >
                          {
                            this.state.scanTimeType == '0' ?
                              <Select value={this.state.scanStartYear} placeholder='选择时间' onChange={this.scanStartYearOnChange} style={{ width: 80 }}>
                                {
                                  this.state.yearArr.map(item => (
                                    <Select.Option key={item} value={item}>{item}</Select.Option>
                                  ))
                                }
                              </Select>
                              :
                              <>
                                {
                                  this.state.scanTimeType == '1' ?
                                    <DatePicker.MonthPicker
                                      onChange={this.scanStartMonthOnChange}
                                      showTime
                                      style={{ width: 140 }}
                                      format="YYYY-MM"
                                      placeholder="选择时间"
                                    />
                                    :
                                    <DatePicker
                                      onChange={this.scanStartDayOnChange}
                                      showTime
                                      style={{ width: 140 }}
                                      format="YYYY-MM-DD"
                                      placeholder="选择时间"
                                    />
                                }
                              </>
                          }
                        </Form.Item>
                      </Form>
                      <div className='flex-end'><Button onClick={() => { this.searchScanData() }} type='primary'>查询</Button></div>
                    </div>
                    <div className='padding'>
                      <div className='chats-title'>扫描次数（百分比）</div>
                    </div>
                    <Spin spinning={this.state.scanLoading}>
                      <div className='padding10-0'>
                        {
                          this.state.scanPie ?
                            <ReactEcharts theme='themeWalden' option={this.state.scanPie} style={{ height: 200 }} />
                            :
                            <div style={{ textAlign: "center", lineHeight: "40px",height: 200 }}>暂无数据</div>
                        }
                      </div>
                    </Spin>

                  </div>
                </div>
              </Col>
              <Col span={8} style={{ backgroundColor: "transparent" }}>
                <div style={{ backgroundColor: "#fff" }}>
                  <div className='padding'>
                    <div className='flex-between'>
                      <span className='font-bold'>防伪统计</span>
                      <span>
                        <span>总查询次数：</span>
                        <span className='font-bold font-16'>{this.state.securityCount}次</span>
                      </span>
                    </div>
                  </div>

                  <div className='padding'>
                    <div>
                      <Form layout='inline'>
                        <Form.Item label="时间粒度" key="timeType">
                          <Select value={this.state.timeType} onChange={this.timeTypeOnChange} style={{ width: 60 }}>
                            <Select.Option value='0'>年</Select.Option>
                            <Select.Option value='1'>月</Select.Option>
                          </Select>
                        </Form.Item>
                        <Form.Item label="日期" >
                          {
                            this.state.timeType == '1' ?
                              <DatePicker.MonthPicker
                                onChange={this.startMonthOnChange}
                                showTime
                                style={{ width: 140 }}
                                format="YYYY-MM"
                                placeholder="选择时间"
                              />
                              :
                              <Select value={this.state.startYear} placeholder='选择时间' onChange={this.startYearOnChange} style={{ width: 80 }}>
                                {
                                  this.state.yearArr.map(item => (
                                    <Select.Option key={item} value={item}>{item}</Select.Option>
                                  ))
                                }
                              </Select>
                          }
                        </Form.Item>
                      </Form>
                      <div className='flex-end'><Button onClick={() => { this.searchData() }} type='primary'>查询</Button></div>
                    </div>

                  </div>
                  <div className='bgcolorFFF padding'>

                    <div>
                      <div className='chats-title'>查询次数</div>
                      <Spin spinning={this.state.securityTrendLoading} style={{ width: "100%" }}>
                        {this.state.showSecurityTrendData ?

                          <div className='padding'>
                            {
                              this.state.securityTrend ?
                                <ReactEcharts theme='themeWalden' option={this.state.securityTrend} style={{ height: 200 }} />
                                : null
                            }
                          </div>
                          :
                          <div style={{ textAlign: "center", lineHeight: "40px", width: "100%",height: 200 }}>暂无数据</div>
                        }
                      </Spin>
                    </div>
                  </div>
                </div>
              </Col>
              <Col span={8} style={{ backgroundColor: "transparent" }}>
                <div style={{ backgroundColor: "#fff" }}>
                  <div className='padding'>
                    <div className='flex-between'>
                      <span className='font-bold margin-right20'>关注公众号统计</span>
                      <span>
                        <span>总关注数：</span>
                        <span className='font-bold font-16'>{this.state.attentionCount}次</span>
                      </span>
                    </div>
                  </div>

                  <div className='padding'>
                    <div>
                      <Form layout='inline'>
                        <Form.Item label="时间粒度" key="attentionTimeType">
                          <Select value={this.state.attentionTimeType} onChange={this.attentionTimeTypeOnChange} style={{ width: 60 }}>
                            <Select.Option value='0'>年</Select.Option>
                            <Select.Option value='1'>月</Select.Option>
                          </Select>
                        </Form.Item>

                        <Form.Item label="日期" >
                          {
                            this.state.attentionTimeType == '1' ?
                              <DatePicker.MonthPicker
                                onChange={this.attentionStartMonthOnChange}
                                showTime
                                style={{ width: 140 }}
                                format="YYYY-MM"
                                placeholder="选择时间"
                              />
                              :
                              <Select value={this.state.attentionStartYear} placeholder='选择时间' onChange={this.attentionStartYearOnChange} style={{ width: 80 }}>
                                {
                                  this.state.yearArr.map(item => (
                                    <Select.Option key={item} value={item}>{item}</Select.Option>
                                  ))
                                }
                              </Select>
                          }

                        </Form.Item>
                      </Form>
                      <div className='flex-end'><Button onClick={() => { this.searchAttentionData() }} type='primary'>查询</Button></div>
                    </div>
                  </div>
                  <div>
                    <Spin spinning={this.state.attentionTrendLoading}>
                      {
                        this.state.showAttentionTrendData ?
                          <div className='bgcolorFFF padding'>

                            <div className='chats-title'>关注人数</div>
                            <div className='padding'>
                              {
                                this.state.attentionTrend ?
                                  <ReactEcharts theme='themeWalden' option={this.state.attentionTrend} style={{ height: 200 }} />
                                  : null
                              }
                            </div>

                          </div>
                          :
                          <div style={{ textAlign: "center", lineHeight: "40px", width: "100%",height: 200 }}>暂无数据</div>
                      }
                    </Spin>
                  </div>
                </div>
              </Col>

            </Row>
            <div className='margin-top10'>
              <div span={8} style={{ backgroundColor: "transparent" }}>
                <div style={{ backgroundColor: "#fff" }}>
                  <div className='padding'>
                    <div className='font-bold'>防伪商品统计</div>
                  </div>
                  <div >
                    <div className='padding'>
                      <Form layout='inline'>
                        <Form.Item>
                          <span className='charts-text-color'>扫码防伪商品排名</span>
                        </Form.Item>
                        <Form.Item label="时间粒度" key="timeType">
                          <Select value={this.state.productTimeType} onChange={this.productTimeTypeOnChange} style={{ width: 60 }}>
                            <Select.Option value='0'>年</Select.Option>
                            <Select.Option value='1'>月</Select.Option>
                          </Select>
                        </Form.Item>
                        <Form.Item label="日期" >
                          {
                            this.state.productTimeType == '0' ?
                              <Select value={this.state.productStartYear} placeholder='选择时间' onChange={this.productStartYearOnChange} style={{ width: 80 }}>
                                {
                                  this.state.yearArr.map(item => (
                                    <Select.Option key={item} value={item}>{item}</Select.Option>
                                  ))
                                }
                              </Select>
                              :
                              <DatePicker.MonthPicker
                                onChange={this.productStartMonthOnChange}
                                showTime
                                style={{ width: 140 }}
                                format="YYYY-MM"
                                placeholder="选择时间"
                              />
                          }
                        </Form.Item>
                        <Form.Item>
                          <Button onClick={() => { this.getScanStatistics() }} type='primary'>查询</Button>
                        </Form.Item>
                      </Form>
                    </div>
                    <Spin spinning={this.state.productLoading}>
                      <div className='padding10-0 flex' >
                        {
                          this.state.productList && this.state.productList.length ?
                            this.state.productList.map(item => (
                              <div key={item.name + item.amount} style={{ width: "20%", padding: "5px 10px", display: "flex", flexDirection: "column", justifyContent: "space-between", alignItems: "center" }}>
                                <div style={{ flex: "1 0 auto", border: "1px solid #cdcdcd", padding: "8px", borderRadius: "4px" }}>
                                  <img src={item.image + '?x-oss-process=image/resize,m_pad,h_200,w_200,color_FFFFFF'} style={{ maxWidth: "100%" }} />
                                </div>
                                <div>
                                  <div className='margin-top' style={{ color: "#000", height: "40px", lineHeight: "18px", textAlign: "center" }}>
                                    {item.name}
                                  </div>
                                  <div className='text-center line-height20 charts-text-color font-20'>
                                    {item.amount}次
                                  </div>
                                </div>
                              </div>
                            ))
                            :
                            <div style={{ textAlign: "center", lineHeight: "40px", width: "100%" }}>暂无数据</div>
                        }
                      </div>
                    </Spin>
                  </div>
                </div>
              </div>
            </div>
          </Col>
        </Row>
        <Modal
          maskClosable={false}
          title={null}
          visible={this.state.bigMapModalIsVisible}
          onCancel={this.hideBigMapModal}
          footer={null}
          width={1200}
        >
          {
            this.state.chinaMapData && this.state.bigMapModalIsVisible ?
              <div>
                <div className='charts-text-color font-bold padding font-20 text-center'>
                  会员地理分布统计
                </div>
                <ReactEcharts theme='themeWalden' option={this.state.chinaMapData} style={{ minHeight: 720 }} />
              </div>
              :
              null
          }
        </Modal>
      </div >
    )
  }
}

