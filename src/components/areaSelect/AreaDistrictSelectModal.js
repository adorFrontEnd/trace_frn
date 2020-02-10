import React, { Component } from 'react'
import { getCityList } from '../../api/SYS/SYS';
import { Modal, Row, Col, Checkbox, Icon, Input, Button } from 'antd';

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
        })
      })
  }

  componentWillReceiveProps(props) {

    if (JSON.stringify(props.checkedAreaData) != JSON.stringify(this.props.checkedAreaData) || this.state.hasChangedAreaMap) {

      let checkedData = this.getCheckedAreaMapByCheckedAreaList(props.checkedAreaData);
      if (!checkedData || !checkedData.checkedAreaMap) {
        return
      }
      let {
        checkedAreaMap,
        selectedProviceId,
        selectedCityId,
        selectedDistrictId
      } = checkedData
      this.setState({
        checkedAreaMap,
        selectedProviceId,
        selectedCityId,
        selectedDistrictId,
        hasChangedAreaMap: false
      })
    }
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
          checkedAreaMap[proviceId]['children'][cityId] = { checked: false, name: city.name, children: {} }
        }
        districtList.forEach(district => {
          let districtId = district.id;
          if (!checkedAreaMap[proviceId]['children'][cityId]['children'][districtId]) {
            checkedAreaMap[proviceId]['children'][cityId]['children'][districtId] = { checked: false, name: district.name, }
          }
        });
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
    let arealevel1_List = areaList.filter(item => item.arealevel == 1).map(item => item.id);
    let arealevel2_List = areaList.filter(item => item.arealevel == 2).map(item => item.id);
    let arealevel3_List = areaList.filter(item => item.arealevel == 3).map(item => item.id);
    let selectedProviceId = null;
    let selectedCityId = null;
    let selectedDistrictId = null;


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
            let cityChildren = checkedAreaMap[provice]['children'][city]['children'];
            for (let district in cityChildren) {
              if (arealevel3_List.indexOf(parseInt(district)) !== -1) {
                checkedAreaMap[provice]['children'][city]['children'][district]['checked'] = true;
                if (!selectedDistrictId) {
                  selectedDistrictId = district;
                }
              }
            }
          }
        }
      }
    }

    return {
      checkedAreaMap,
      selectedProviceId,
      selectedCityId,
      selectedDistrictId
    }
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
    let districtList = checkedAreaMap[proviceId]['children'][cityId]['children'];
    let districtArr = Object.keys(districtList);
    result = districtArr[0];
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
          this.allAreaSelectedByLevel(3, isChecked);
        })

        break;

      case 2:
        this.setState({
          selectedCityId: selectId
        }, () => {
          this.allAreaSelectedByLevel(3, isChecked);
        })
        break;

      case 3:
        this.setState({
          selectedDistrictId: selectId
        })
        break;
    }
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
          selectedCityId: null,
          selectedDistrictId: null
        })
        break;

      case 2:
        let id = this.state.selectedProviceId;
        let cityList = checkedAreaMap[id]['children'];
        Object.keys(cityList).forEach(item => {
          item = parseInt(item);
          cityList[item].checked = checkedList.indexOf(item) != -1
        })
        this.setState({
          selectedDistrictId: null
        })
        break;

      case 3:
        let proviceId = this.state.selectedProviceId;
        let cityId = this.state.selectedCityId;
        let districtList = checkedAreaMap[proviceId]['children'][cityId]['children'];

        Object.keys(districtList).forEach(item => {
          item = parseInt(item);
          districtList[item].checked = checkedList.indexOf(item) != -1
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
    let selectedDistrictId = this.state.selectedDistrictId;

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

  getCheckedDistrictList = () => {
    let cityData = this.getAreaMapDataByLevel(2);
    if (!cityData) {
      return;
    }
    let list = Object.keys(cityData['children']);
    let checkedList = list.filter(item => cityData['children'][item].checked);
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

      case 3:
        this.setState({
          allDistrictChecked: isChecked
        })
        this.allAreaSelectedByLevel(3, isChecked)
        break;
    }
  }

  allAreaSelectedByLevel = (areaLevel, isChecked) => {

    let checkedAreaMap = this.state.checkedAreaMap;
    let selectedProviceId = null;
    let selectedCityId = null;
    let selectedDistrictId = null;
    let proviceId = null;
    let cityId = null;
    let cityList = null;
    let districtList = null;

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
            let districtList = checkedAreaMap[proviceId]['children'][cityId]['children'];
            for (let districtId in districtList) {
              checkedAreaMap[proviceId]['children'][cityId]['children'][districtId]['checked'] = isChecked;
            }
          }
        }
        this.setState({
          allProviceChecked: isChecked,
          allCityChecked: isChecked,
          allDistrictChecked: isChecked
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
          let districtList = checkedAreaMap[proviceId]['children'][cityId]['children'];
          for (let districtId in districtList) {
            checkedAreaMap[proviceId]['children'][cityId]['children'][districtId]['checked'] = isChecked;
          }
        }
        this.setState({
          allCityChecked: isChecked,
          allDistrictChecked: isChecked
        })

        break;

      case 3:
        selectedProviceId = this.state.selectedProviceId;
        proviceId = selectedProviceId;
        selectedCityId = this.state.selectedCityId;
        cityId = selectedCityId || this.getFirstChildIdByParentId(proviceId);
        districtList = checkedAreaMap[proviceId]['children'][cityId]['children'];
        for (let districtId in districtList) {
          checkedAreaMap[proviceId]['children'][cityId]['children'][districtId]['checked'] = isChecked;
        }

        this.setState({

          allDistrictChecked: isChecked
        })
        break;
    }
    this.setState({
      selectedProviceId,
      selectedCityId,
      selectedDistrictId,
      checkedAreaMap
    })
  }

  saveAreaDataClick = () => {
    let checkedAreaMap = this.state.checkedAreaMap;
    let checkedAreaList = this.getCheckedAreaData(checkedAreaMap);
    this.props.onSaveClick(checkedAreaList);
    this.props.hide();
    console.log(checkedAreaList);
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
            let cityChildren = checkedAreaMap[provice]['children'][city]['children'];
            for (let district in cityChildren) {
              if (checkedAreaMap[provice]['children'][city]['children'][district]['checked']) {
                result.push({
                  id: parseInt(district),
                  arealevel: 3,
                  name: checkedAreaMap[provice]['children'][city]['children'][district]['name']
                })
              }
            }
          }
        }
      }
    }
    return result;
  }

  render() {
    if (!this.state.areaList || !this.state.areaList.length) {
      return (<div></div>);
    }
    const checkedProviceList = this.getCheckedProviceList();

    const cityList = this.getShowCityList();
    const checkedCityList = this.getCheckedCityList();

    const districtList = cityList && cityList.length ? this.getChildAreaDataById(this.state.selectedCityId, cityList) : [];
    const checkedDistrictList = this.getCheckedDistrictList();
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
              <Button onClick={this.saveAreaDataClick} type='primary' style={{ width: 100 }}>确认</Button>
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
              <Col span={8} className='padding-left'>
                <div className='padding flex border-bottom border-right '>
                  <Checkbox checked={this.state.allProviceChecked} onChange={(e) => { this.arealAllCheckBoxClicked(1, e) }}><span className='font-bold'>全选</span></Checkbox>
                </div>
                <div className='border-right' >
                  <div style={{ height: 600, overflowY: "auto" }}>
                    <Checkbox.Group value={checkedProviceList} style={{ width: '100%' }} onChange={(e) => { this.checkedGroupOnchange(1, e) }}>
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
              <Col span={8} className='padding-left'>
                <div className='padding flex border-bottom border-right '>
                  <Checkbox checked={this.state.allCityChecked} onChange={(e) => { this.arealAllCheckBoxClicked(2, e) }}><span className='font-bold'>全选</span></Checkbox>
                </div>
                <div className='border-right' >
                  <div style={{ height: 600, overflowY: "auto" }}>
                    <Checkbox.Group value={checkedCityList} style={{ width: '100%' }} onChange={(e) => { this.checkedGroupOnchange(2, e) }}>
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
              <Col span={8} className='padding-left'>
                <div className='padding flex border-bottom border-right '>
                  <Checkbox checked={this.state.allDistrictChecked} onChange={(e) => { this.arealAllCheckBoxClicked(3, e) }}><span className='font-bold'>全选</span></Checkbox>
                </div>
                <div className='border-right'>
                  <div style={{ height: 600, overflowY: "auto" }}>
                    <Checkbox.Group value={checkedDistrictList} style={{ width: '100%' }} onChange={(e) => { this.checkedGroupOnchange(3, e) }}>
                      {
                        districtList && districtList.length ?
                          districtList.map(
                            item => (
                              <div className='border-bottom flex-between align-center padding' key={item.id}>
                                <Checkbox onChange={(e) => { this.areaItemCheckBoxClicked(3, e, item.id) }} value={item.id}>{item.name}</Checkbox>
                              </div>
                            )
                          )
                          : null
                      }
                    </Checkbox.Group>
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