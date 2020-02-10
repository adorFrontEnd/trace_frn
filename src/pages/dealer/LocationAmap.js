import React, { Component } from "react";
import { Input, Col, Button } from 'antd';
import Toast from '../../utils/toast';

const Search = Input.Search;
const InputGroup = Input.Group;
const defaultLocation = { "longitude": 104.04311, "latitude": 30.64242 };

export default class Page extends Component {
  map = null;
  selectStation = null;
  marker = null;
  geocoder = null;

  state = {
    lng: null,
    lat: null,
    address: null
  }
  componentDidMount() {
    this.selectStation = this.props.selectStation;
    this.initStation();
  }

  componentWillReceiveProps(props) {

    if (!props.visible) {
      this.selectStation = null
    }

    if (props.selectStation && props.visible) {

      if (JSON.stringify(props.selectStation) == JSON.stringify(this.selectStation)) {
        return;
      }
      this.selectStation = props.selectStation;
      this.initStation();
    }
  }

  initStation = () => {
    let { lng, lat, address } = this._getPostion(this.selectStation);
    if (!lng && !lat) {
      if (address && address.length > 2) {
        this.getLnglat(address).then(lnglat => {
          let { lng, lat } = lnglat;
          this.setCenter([lng, lat]);
          this.addMarker([lng, lat]);
          this.setLocationInput({ lng, lat, address }, true);
        })
        return;
      }
      lng = defaultLocation.longitude;
      lat = defaultLocation.latitude;
    }
    this.setCenter([lng, lat]);
    this.addMarker([lng, lat]);
    this.setLocationInput({ lng, lat, address }, true);
  }

  lacationChange = (e, k) => {
    let val = e.target.value;
    let data = {};
    data[k] = val;
    this.setState(data)
  }

  render() {

    return (
      <div>
        <div className="bordered margin-bottom">
          <div className="padding0-10 line-height20">双击地图进行定位，或者输入地址、经纬度进行定位</div>
          <div className="padding">
            <InputGroup>
              <Search
                value={this.state.address}
                onChange={(e) => { this.lacationChange(e, 'address') }}
                style={{ width: 460, marginRight: 10 }}
                placeholder="输入地址进行搜索"
                enterButton="搜索"
                onSearch={this.searchAddressClick}
              />
              <Input value={this.state.lng} onChange={(e) => { this.lacationChange(e, 'lng') }} style={{ width: 120 }} placeholder="输入经度" />
              <Input value={this.state.lat} onChange={(e) => { this.lacationChange(e, 'lat') }} style={{ width: 120 }} placeholder="输入纬度" />
              <Button type="primary" onClick={this.searchLatlngClick} style={{ borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }}>搜索经纬度</Button>
              <Button type="primary" onClick={this.saveLocationClick} style={{ width: 100, marginLeft: 16 }}>保存</Button>
            </InputGroup>
          </div>
        </div>
        <div id="container" style={{ height: 600, width: "100%" }}>

        </div>
      </div>
    )
  }

  /** 地图操作****************************************************************************************************/

  // 初始化
  initMap = (position) => {
    if (!this.map) {
      this.map = new window.AMap.Map("container", {
        resizeEnable: true,
        zoom: 17, //初始地图级别
        center: position, //初始地图中心点
        showIndoorMap: true, //关闭室内地图
        doubleClickZoom: false
      });
      window.AMap.plugin(['AMap.ToolBar', 'AMap.OverView', 'AMap.Scale'], () => {//异步加载插件
        let toolbar = new window.AMap.ToolBar();
        let overView = new window.AMap.OverView();
        let scale = new window.AMap.Scale();
        this.map.addControl(toolbar);
        this.map.addControl(overView);
        this.map.addControl(scale);
      });

      this.map.on('dblclick', e => {
        let { lng, lat } = e.lnglat;
        this.setLocationInput({ lng, lat }, true);
        this.addMarker([lng, lat]);
        this.setCenter([lng, lat]);
      });
    }
  }

  // 设置地图的中心
  setCenter = (position) => {

    this.initMap();
    this.map.setCenter(position);
  }

  // 增加标注点
  addMarker = (position) => {

    this.map.clearMap();
    let marker = new window.AMap.Marker({
      icon: new window.AMap.Icon({
        image: "https://webapi.amap.com/theme/v1.3/markers/n/mark_bs.png",
        imageSize: new window.AMap.Size(22, 40),
        size: new window.AMap.Size(22, 40)
      })
    });
    marker.setPosition(position);
    this.map.add(marker);
  }

  // 转化地图
  _getPostion = (selectStation) => {

    if (!selectStation) {
      return {};
    }
    let { tencentLng, tencentLat, address } = selectStation;
    let position = {
      lng: tencentLng,
      lat: tencentLat,
      address: address
    }
    return position
  }
  /** 顶部搜索框操作****************************************************************************************************/


  // 点击搜索地址
  searchAddressClick = (address) => {

    this.getLnglat(address).then(lnglat => {
      let { lng, lat } = lnglat;
      this.setLocationInput({ lng, lat });
      this.setCenter([lng, lat]);
      this.addMarker([lng, lat]);
    })
  }

  // 点击搜索经纬度
  searchLatlngClick = () => {

    let lng = this.state.lng;
    let lat = this.state.lat;
    this.getAddress([lng, lat]).then(addressData => {
      let { address, areaName } = addressData;
      this.setState({
        address,
        areaName
      })
    })
  }
  // 保存位置信息，提交接口
  saveLocationClick = () => {
    let id = null;
    if (this.selectStation) {
      id = this.selectStation.id;
    }
    let { lng, lat, address } = this.getLocationInputValue();
    let params = {
      id,
      address,
      tencentLng: lng,
      tencentLat: lat,
      insertFlag: 0
    }
    let areaName = null;

    if (this.props.showAreaName) {

      this.getAddress([lng, lat]).then(addressData => {

        this.setState({
          areaName: addressData.areaName
        })
        params.areaNameObj = addressData.areaName;
        this.props.updateStationPosition(params);
        return;
      })
    } else {
      this.props.updateStationPosition(params)
    }

  }

  // 设置顶部搜索框
  setLocationInput = (params, setAddress) => {
    this.setState({
      lng: params.lng,
      lat: params.lat
    })

    if (!setAddress) {
      return;
    }
    if (params.address) {
      this.setState({
        address: params.address
      })
      return;
    }
    this.getAddress([params.lng, params.lat]).then(addressData => {
      let { address, areaName } = addressData;
      this.setState({
        address,
        areaName
      })
    })
  }

  // 清空顶部搜索框
  resetLocationInput = () => {
    this.setState({
      lng: null,
      lat: null,
      address: null
    })
  }

  getLocationInputValue = () => {

    return {
      lng: this.state.lng,
      lat: this.state.lat,
      address: this.state.address,
      areaName: this.state.areaName
    }
  }

  /** 逆地址解析****************************************************************************************************/
  initGeocoder = () => {
    if (!this.geocoder) {
      this.geocoder = new window.AMap.Geocoder({
        // city: "010", //城市设为北京，默认：“全国”
        // radius: 1000 //范围，默认：500
      });
    }
  }
  // 逆地址解析获取地址
  getAddress = (lnglat) => {

    if (lnglat.length != 2 || !lnglat[0] || !lnglat[1]) {
      Toast("请输入正确的经纬度！")
      return Promise.reject();
    }
    this.initGeocoder();
    let _this = this;
    return new Promise((resolve, reject) => {
      this.geocoder.getAddress(lnglat, function (status, result) {
        if (status === 'complete' && result.regeocode) {
          let address = result.regeocode.formattedAddress;
          let areaName = {};
          if (result.regeocode.addressComponent) {
            let { province, district, city, citycode } = result.regeocode.addressComponent;
            areaName = { province, district, city, citycode };

          }
          resolve({
            address,
            areaName
          })
        } else {
          reject();
        }
      });
    })
  }
  // 逆地址解析获取经纬度
  getLnglat = (address) => {

    if (!address || address.length < 2) {
      Toast("请输入至少两个字符！")
      return Promise.reject();
    }
    this.initGeocoder();
    return new Promise((resolve, reject) => {
      this.geocoder.getLocation(address, function (status, result) {
        if (status === 'complete' && result.info === 'OK') {
          if (result && result.geocodes && result.geocodes.length) {
            resolve(result.geocodes[0].location);
          } else {
            resolve();
          }
        } else {
          reject();
        }
      });
    })
  }


}


