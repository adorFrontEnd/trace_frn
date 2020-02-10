import { Upload, Icon, Modal } from 'antd';
import React, { Component } from 'react';
import PictureWall from './PictureWall';


export default class PicturesWallModal extends Component {

  state = {
    pictureUrl: ''
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
    this.props.onOk(this.state.pictureUrl);
    this.setState({
      pictureUrl: ''
    })
  }
  render() {
    return (
      <Modal maskClosable={false}
        title="上传图片"
        visible={this.props.visible}
        onCancel={this.props.onCancel}
        onOk={this.onOk}
      >
        <div>
          {this.props.addbefore}
        </div>
        <PictureWall
          folder = {this.props.folder}
          pictureList={this.state.pictureUrl ? [this.state.pictureUrl] : null}
          uploadCallback={this.uploadCallback}
        />
        <div>
          {this.props.children}
        </div>
      </Modal>

    )
  }
}