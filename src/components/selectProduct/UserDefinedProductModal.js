import { Upload, Icon, Modal,Col,Row,Input} from 'antd';
import React, { Component } from 'react';
import PictureWall from '../upload/PictureWall';


export default class Page extends Component {

  state = {
    pictureUrl: '',
    userProductName: null
  }


  uploadCallback = (pictureList) => {
    if (!pictureList || !pictureList.length) {
      return
    }
    this.setState({
      pictureUrl: pictureList[0]
    })
  }

  onOk = () => {
    let { userProductName, pictureUrl } = this.state;
    let urlValidateInfo = pictureUrl ? "" : "请上传图片";
    let productNameValidateInfo = userProductName ? "" : "请输入";
    this.setState({
      urlValidateInfo,
      productNameValidateInfo
    })
    if(urlValidateInfo || productNameValidateInfo){
      return;
    }

    this.props.onOk({
      name:userProductName,
      url:pictureUrl
    });
    this.setState({
      pictureUrl: '',
      userProductName: "",
    })
  }


  userProductNameChange = (e) => {

    let userProductName = e.target.value;
    this.setState({
      userProductName
    })
  }

  render() {
    return (
      <Modal maskClosable={false}
        title="添加奖品"
        visible={this.props.visible}
        onCancel={this.props.onCancel}
        onOk={this.onOk}
      >
        <div>
          {this.props.addbefore}
        </div>

        <Row className='line-height40'>
          <Col span={6} className='text-right'>
            <span className='label-color label-required'>上传图片：</span>
          </Col>
          <Col span={18}>
            <PictureWall
              folder={this.props.folder}
              pictureList={this.state.pictureUrl ? [this.state.pictureUrl] : null}
              uploadCallback={this.uploadCallback}
            />
            <div className="color-red">{this.state.urlValidateInfo}</div>
          </Col>
        </Row>
        <Row className='line-height40'>
          <Col span={6} className='text-right'>
            <span className='label-color label-required'>奖品名称：</span>
          </Col>
          <Col span={18}>
            <Input value={this.state.userProductName} onChange={this.userProductNameChange} />
            <div className="color-red">{this.state.productNameValidateInfo}</div>
          </Col>
        </Row>
        <div>
          {this.props.children}
        </div>
      </Modal>

    )
  }
}