import React, { Component } from 'react'
import { getCityList } from '../../api/SYS/SYS';
import { Modal, Row, Col, Checkbox, Icon, Input, Button } from 'antd';
import Toast from '../../utils/toast';

export default class AreaSelectModal extends Component {

  state = {
    areaList: [],
    checkedAreaMap: {},

    selectedProviceId: null,
    selectedCityId: null,
    selectedDistrictId: null,

    allProviceChecked: false,
    allCityChecked: false,
    allDistrictChecked: false,

    hasChangedAreaMap: false
  }

  componentDidMount() {
    getCityList()
      .then(areaList => {
        let checkedAreaMap = this.getInitCheckedAreaMap(areaList);
        this.setState({
          areaList,
          checkedAreaMap
        }, () => {
          this.checkedDataRevert(this.props.checkedAreaData)
        })
      })
  }

  componentWillReceiveProps(props) {

    if (JSON.stringify(props.checkedAreaData) != JSON.stringify(this.props.checkedAreaData) || this.state.hasChangedAreaMap) {

      this.checkedDataRevert(props.checkedAreaData);
    }
  }

  checkedDataRevert = (checkedAreaData) => {
    let checkedData = this.getCheckedAreaMapByCheckedAreaList(checkedAreaData);
    if (!checkedData || !checkedData.checkedAreaMap) {
      return
    }
    let {
      checkedAreaMap,
      selectedProviceId,
      selectedCityId
    } = checkedData

    this.setState({
      checkedAreaMap,
      selectedProviceId,
      selectedCityId,
      hasChangedAreaMap: false
    })
  }

  /*根据区域列表数组初始化区域map*******************************************************************************************************/

  getInitCheckedAreaMap = (areaList) => {
    let checkedAreaMap = {};
    areaList.forEach(provice => {
      let proviceId = provice.id;
      let cityList = provice.list;
      if (!checkedAreaMap[proviceId]) {
        checkedAreaMap[proviceId] = { checked: false, name: provice.name, children: {} };
      }
      cityList.forEach(city => {
        let cityId = city.id;
        let districtList = city.list;
        if (!checkedAreaMap[proviceId]['children'][cityId]) {
          checkedAreaMap[proviceId]['children'][cityId] = { checked: false, name: city.name }
        }
      })
    })

    return checkedAreaMap
  }

  /*根据选择的区域列表回滚数据*****************************************************************************************************/

  getCheckedAreaMapByCheckedAreaList = (areaList) => {

    if (!areaList || !areaList.length) {
      return checkedAreaMap;
    }
    let checkedAreaMap = this.getInitCheckedAreaMap(this.state.areaList);
    let arealevel1_List = areaList.filter(item => item.arealevel == 1).map(item => parseInt(item.id));
    let arealevel2_List = areaList.filter(item => item.arealevel == 2).map(item => parseInt(item.id));
    if (arealevel2_List && arealevel2_List.length && (!arealevel1_List || !arealevel1_List.length)) {
      arealevel1_List = this.getParentList(arealevel2_List);
    }
    let selectedProviceId = null;
    let selectedCityId = null;

    for (let provice in checkedAreaMap) {

      if (arealevel1_List.indexOf(parseInt(provice)) != -1) {
        checkedAreaMap[provice]['checked'] = true;
        if (!selectedProviceId) {
          selectedProviceId = provice;
        }
        let proviceChildren = checkedAreaMap[provice]['children'];
        for (let city in proviceChildren) {
          if (arealevel2_List.indexOf(parseInt(city)) !== -1) {
            checkedAreaMap[provice]['children'][city]['checked'] = true;
            if (!selectedCityId) {
              selectedCityId = city;
            }

          }
        }
      }
    }

    return {
      checkedAreaMap,
      selectedProviceId,
      selectedCityId
    }
  }

  getParentList = (arealevel2_List) => {
    if (!arealevel2_List || !arealevel2_List.length) {
      return [];
    }

    let obj = {};
    arealevel2_List.forEach((item) => {
      let level1Id = item.toString().substr(0, 3) + "000";
      level1Id = parseInt(level1Id);
      obj[level1Id] = true;
    })
    let result = Object.keys(obj).map(item => parseInt(item));
    return result;
  }

  /**根据id获取地区数据*******************************************************************************************************************/

  getAreaDataById = (id, list) => {
    if (!list || !list.length) {
      return;
    }
    let filterList = list.filter(item => item.id == id);
    let result = filterList[0];
    return id ? result : list[0];
  }

  getChildAreaDataById = (id, cityList) => {

    let data = this.getAreaDataById(id, cityList);
    if (data && data.list) {
      return data.list;
    }
  }

  /**通过父节点获取第一个子节点*******************************************************************************************************************/

  getFirstChildIdByParentId = (proviceId, cityId) => {
    if (!proviceId) {
      return;
    }
    let checkedAreaMap = this.state.checkedAreaMap;
    if (!Object.keys(checkedAreaMap).length) {
      return;
    }

    let result = null;
    if (!cityId) {
      let cityList = checkedAreaMap[proviceId]['children'];
      let cityListArr = Object.keys(cityList);
      result = cityListArr[0];
      return result;
    }

    return result;
  }

  /**地区选择的单个checkbox点击*******************************************************************************************************************/

  areaItemCheckBoxClicked = (areaLevel, e, selectId) => {
    let checked = e.target.checked;
    let isChecked = !!checked;

    switch (areaLevel) {

      case 1:
        this.setState({
          selectedProviceId: selectId
        }, () => {
          this.allAreaSelectedByLevel(2, isChecked);
        })

        break;

      case 2:
        if (!selectId) {
          return;
        }
        let selectedProviceId = selectId.toString().substr(0, 3) + "000";
        this.setState({
          selectedCityId: selectId
        })
        if (checked) {
          this.selectProviceById(selectedProviceId, true);
        } else {
          let checkedCityList = this.getCheckedCityList();
          if (!checkedCityList || !checkedCityList.length || checkedCityList.length <= 1) {
            this.selectProviceById(selectedProviceId, false);
          }
        }

        break;
    }
  }

  selectProviceById = (id, checked) => {
    if (!id) {
      return;
    }
    let checkedAreaMap = this.state.checkedAreaMap;
    let spId = parseInt(id);
    checkedAreaMap[spId]['checked'] = checked;

    this.setState({
      checkedAreaMap,
      selectedProviceId: spId
    })

  }

  /**地区选择的checkbox组的值改变*******************************************************************************************************************/

  checkedGroupOnchange = (areaLevel, checkedList) => {
    let checkedAreaMap = this.state.checkedAreaMap;

    switch (areaLevel) {
      case 1:
        Object.keys(checkedAreaMap).forEach(item => {
          item = parseInt(item);
          checkedAreaMap[item].checked = checkedList.indexOf(item) != -1
        })
        this.setState({
          selectedCityId: null
        })
        break;

      case 2:
        let id = this.state.selectedProviceId;
        let cityList = checkedAreaMap[id]['children'];
        Object.keys(cityList).forEach(item => {
          item = parseInt(item);
          cityList[item].checked = checkedList.indexOf(item) != -1
        })
        break;
    }

    this.setState({
      checkedAreaMap,
      hasChangedAreaMap: true
    })
  }

  getCheckedProviceList = () => {
    let list = Object.keys(this.state.checkedAreaMap);
    let checkedList = list.filter(item => this.state.checkedAreaMap[item].checked);
    return checkedList.map(item => parseInt(item));
  }

  getShowCityList = () => {
    let areaList = this.state.areaList;
    let selectId = this.state.selectedProviceId;
    let result = areaList && areaList.length ? this.getChildAreaDataById(selectId, areaList) : [];
    return result;
  }


  getAreaMapDataByLevel = (areaLevel) => {
    let checkedAreaMap = this.state.checkedAreaMap;
    let selectedProviceId = this.state.selectedProviceId;
    let selectedCityId = this.state.selectedCityId;


    if (areaLevel == '1') {
      if (!selectedProviceId) {
        return
      }
      return checkedAreaMap[selectedProviceId];
    }

    if (areaLevel == '2') {
      if (!selectedProviceId) {
        return
      }
      if (!selectedCityId) {
        selectedCityId = this.getFirstChildIdByParentId(selectedProviceId);
      }
      let cityList = checkedAreaMap[selectedProviceId]['children'];
      return cityList[selectedCityId];
    }
  }

  getCheckedCityList = () => {

    let proviceData = this.getAreaMapDataByLevel(1);
    if (!proviceData) {
      return;
    }
    let list = proviceData.children;
    let checkedList = Object.keys(list).filter(item => proviceData.children[item].checked);
    return checkedList.map(item => parseInt(item));
  }

  /** 全选************************************************************************************************************************/

  arealAllCheckBoxClicked = (areaLevel, e) => {
    let checked = e.target.checked;
    this._arealAllSelected(areaLevel, checked);
  }

  _arealAllSelected = (areaLevel, checked) => {

    let isChecked = !!checked;

    switch (areaLevel) {

      case 1:
        this.setState({
          allProviceChecked: isChecked
        })
        this.allAreaSelectedByLevel(1, isChecked)
        break;

      case 2:
        this.setState({
          allCityChecked: isChecked
        })
        this.allAreaSelectedByLevel(2, isChecked)
        break;
    }
  }

  // 地区全选
  allAreaSelectedByLevel = (areaLevel, isChecked) => {

    let checkedAreaMap = this.state.checkedAreaMap;
    let selectedProviceId = null;
    let selectedCityId = null;

    let proviceId = null;
    let cityId = null;
    let cityList = null;


    switch (areaLevel) {

      case 1:
        for (let proviceId in checkedAreaMap) {
          checkedAreaMap[proviceId]['checked'] = isChecked;
          if (!selectedProviceId) {
            selectedProviceId = proviceId;
          }
          cityList = checkedAreaMap[proviceId]['children'];
          for (let cityId in cityList) {
            if (!selectedCityId) {
              selectedCityId = cityId;
            }
            checkedAreaMap[proviceId]['children'][cityId]['checked'] = isChecked;
          }
        }
        this.setState({
          allProviceChecked: isChecked,
          allCityChecked: isChecked
        })
        break;

      case 2:
        selectedProviceId = this.state.selectedProviceId;
        proviceId = selectedProviceId;
        cityList = checkedAreaMap[proviceId]['children'];
        for (let cityId in cityList) {
          if (!selectedCityId) {
            selectedCityId = cityId;
          }
          checkedAreaMap[proviceId]['children'][cityId]['checked'] = isChecked;
        }
        checkedAreaMap[proviceId]['checked'] = isChecked;
        this.setState({
          allCityChecked: isChecked
        })

        break;
    }


    this.setState({
      selectedProviceId,
      selectedCityId,
      checkedAreaMap
    })
  }

  saveAreaDataClick = () => {

    let checkedAreaMap = this.state.checkedAreaMap;
    if (!this.checkedCityDataIsValid(checkedAreaMap)) {
      return;
    }

    let checkedAreaList = this.getCheckedAreaData(checkedAreaMap);
    this.props.onSaveClick(checkedAreaList);
    this.props.hide();
  }

  // 检查数据的完整性
  checkedCityDataIsValid = (checkedAreaMap) => {

    let checkedArr = Object.values(checkedAreaMap).filter(item => item.checked);
    if (!checkedArr || !checkedArr.length) {
      Toast("请选择省级（直辖市）地区！")
      return;
    }

    for (let i = 0; i < checkedArr.length; i++) {
      let item = checkedArr[i];
      let name = item.name;
      let hasCheckedChild = Object.values(item.children).filter(item => item.checked).length > 0;
      if (!hasCheckedChild) {
        Toast(`${name}未选择市级地区！`)
        return;
      }
    }
    return true;
  }

  getCheckedAreaData = (checkedAreaMap) => {
    let result = [];
    for (let provice in checkedAreaMap) {

      if (checkedAreaMap[provice]['checked']) {

        result.push({
          id: parseInt(provice),
          arealevel: 1,
          name: checkedAreaMap[provice]['name']
        })
        let proviceChildren = checkedAreaMap[provice]['children'];
        for (let city in proviceChildren) {
          if (checkedAreaMap[provice]['children'][city]['checked']) {
            result.push({
              id: parseInt(city),
              arealevel: 2,
              name: checkedAreaMap[provice]['children'][city]['name']
            })
          }
        }
      }
    }
    return result;
  }

  getCheckedMapText = (checkedAreaMap) => {
    if (!checkedAreaMap) {
      return [];
    }
    let values = Object.values(checkedAreaMap);
    if (!values || !values.length) {
      return [];
    }
    let result = values.filter(item => item.checked);
    return result
  }


  searchCity = (value) => {

  }
  render() {
    if (!this.state.areaList || !this.state.areaList.length) {
      return (<div></div>);
    }
    const checkedProviceList = this.getCheckedProviceList();
    const checkedAreaMap = this.state.checkedAreaMap;

    const cityList = this.getShowCityList();
    const checkedCityList = this.getCheckedCityList();

    const districtList = cityList && cityList.length ? this.getChildAreaDataById(this.state.selectedCityId, cityList) : [];
    const checkedMapText = this.getCheckedMapText(checkedAreaMap);
    return (

      <Modal maskClosable={false}
        zIndex={1004}
        className='noPadding'
        title={
          (
            <div className='flex-between padding padding-top20'>
              <Input.Search
                style={{ width: 400 }}
                addonBefore='关键字搜索：'
                placeholder="请输入关键字"
                enterButton="搜索"
                onSearch={value => this.searchCity(value)}
                allowClear
              />
              <Button disabled={this.props.shouldNotSave} onClick={this.saveAreaDataClick} type='primary' style={{ width: 100 }}>确认</Button>
            </div>
          )
        }
        footer={null}
        visible={this.props.visible}
        onCancel={this.props.hide}
        width={1000}
      >
        {
          this.state.areaList ?
            <Row>
              <Col span={7} className='padding-left'>
                <div className='padding flex border-bottom border-right '>
                  <Checkbox disabled={this.props.shouldNotSave} checked={this.state.allProviceChecked} onChange={(e) => { this.arealAllCheckBoxClicked(1, e) }}><span className='font-bold'>全选</span></Checkbox>
                </div>
                <div className='border-right' >
                  <div style={{ height: 600, overflowY: "auto" }}>
                    <Checkbox.Group disabled={this.props.shouldNotSave} value={checkedProviceList} style={{ width: '100%' }} onChange={(e) => { this.checkedGroupOnchange(1, e) }}>
                      {
                        this.state.areaList && this.state.areaList.map(
                          item => (
                            <div className='border-bottom flex-between align-center padding' key={item.id}>

                              <Checkbox onChange={(e) => { this.areaItemCheckBoxClicked(1, e, item.id) }} value={item.id}>{item.name}</Checkbox>
                              <div className='padding0-10' style={{ cursor: 'pointer' }}><Icon type="double-right" /> </div>
                            </div>
                          )
                        )
                      }
                    </Checkbox.Group>
                  </div>
                </div>
              </Col>
              <Col span={7} className='padding-left'>
                <div className='padding flex border-bottom border-right '>
                  <Checkbox disabled={this.props.shouldNotSave} checked={this.state.allCityChecked} onChange={(e) => { this.arealAllCheckBoxClicked(2, e) }}><span className='font-bold'>全选</span></Checkbox>
                </div>
                <div className='border-right' >
                  <div style={{ height: 600, overflowY: "auto" }}>
                    <Checkbox.Group disabled={this.props.shouldNotSave} value={checkedCityList} style={{ width: '100%' }} onChange={(e) => { this.checkedGroupOnchange(2, e) }}>
                      {
                        cityList && cityList.length ?
                          cityList.map(
                            item => (
                              <div className='border-bottom flex-between align-center padding' key={item.id}>

                                <Checkbox onChange={(e) => { this.areaItemCheckBoxClicked(2, e, item.id) }} value={item.id}>{item.name}</Checkbox>
                                <div className='padding0-10' style={{ cursor: 'pointer' }}><Icon type="double-right" /> </div>
                              </div>
                            )
                          ) : null
                      }
                    </Checkbox.Group>
                  </div>
                </div>
              </Col>
              <Col span={10}>
                <div style={{ height: 640, overflowY: "auto" }}>
                  <div className='padding flex border-bottom border-right '>
                    已选择区域
                  </div>
                  <div className='padding-left padding'>
                    {
                      checkedMapText && checkedMapText.length ?
                        checkedMapText.map(item =>
                          <div key={item.name} style={{ borderBottom: "1px solid #ccc", paddingBottom: "5px" }}>
                            <div className='line-height30 font-bold font-16'>{item.name}</div>
                            <div className='flex' style={{ flexWrap: "wrap", paddingLeft: "10px" }}>
                              {
                                this.getCheckedMapText(item.children).map(subItem =>
                                  <div key={subItem.name} style={{ marginRight: "6px" }}>{subItem.name} </div>
                                )
                              }
                            </div>
                          </div>
                        )
                        :
                        <div>暂未选择任何区域</div>
                    }
                  </div>
                </div>
              </Col>
            </Row>
            : null
        }
      </Modal>
    )
  }
}