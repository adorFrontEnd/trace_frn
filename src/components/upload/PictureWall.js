import { Upload, Icon, Modal, Spin } from 'antd';
import React, { Component } from 'react';
import { getUpdatePictureUrl } from '../../api/product/product';
import Toast from '../../utils/toast';
let updateUrl = '';
let initUid = 1;

let fileTypeExpEnum = {
  '1': /png/i,
  '2': /(jpg|jpeg)/i
}

let fileTypeExpToastEnum = {
  '1': 'png',
  '2': 'jpg、jpeg'
}

export default class PicturesWall extends Component {

  state = {
    previewVisible: false,
    previewImage: '',
    fileList: [],
    uploadIsLoading: false
  };

  componentDidMount() {
    let folder = this.props.folder || 'product';
    updateUrl = getUpdatePictureUrl({ folder });
    this.getFileList();
  }

  componentWillReceiveProps(props) {

    if (JSON.stringify(props.pictureList) == JSON.stringify(this.props.pictureList)) {
      return;
    }

    let fileList = [];

    if (props.pictureList && props.pictureList.length) {

      let oldList = this.state.fileList && this.state.fileList.length ? this.state.fileList.map(item => item.url).join() : [];
      let newList = props.pictureList && props.pictureList.length ? props.pictureList.join() : [];

      if (JSON.stringify(oldList) == JSON.stringify(newList)) {
        return;
      }

      fileList = this.formatExistFiles(props.pictureList);
    }

    this.setState({
      fileList
    })
  }

  getFileList = () => {
    let fileList = [];
    if (this.props.pictureList && this.props.pictureList.length) {
      fileList = this.formatExistFiles(this.props.pictureList);
    }
    this.setState({
      fileList
    })

  }

  formatExistFiles = (fileList) => {
    if (!fileList || !fileList.length) {
      return []
    }
    let result = fileList.map(fileUrl => {
      return {
        uid: this.getExitsFileUid(fileUrl),
        name: this.getExitsFileName(fileUrl),
        status: 'done',
        url: fileUrl,
      }
    })
    return result;
  }

  getExitsFileName = (fileUrl) => {
    if (!fileUrl || !fileUrl.length) {
      return;
    }
    let index = fileUrl.lastIndexOf('/');
    if (index != -1) {
      let result = fileUrl.slice(index);
      return result
    }
    return;
  }

  getExitsFileUid = (fileUrl) => {
    if (!fileUrl || !fileUrl.length) {
      return;
    }
    return ++initUid;
  }


  formatUploadFileList = (fileList) => {
    return new Promise((resolve, reject) => {
      if (!fileList || !fileList.length) {
        reject();
      }
      let shouldResolve = fileList.length != this.state.fileList.length;

      for (let i = 0; i < fileList.length; i++) {
        let item = fileList[i];
        if (item && item.response && item.response.status && item.response.status == 'SUCCEED') {
          let newItem = {
            uid: item.uid,
            name: item.name,
            status: 'done',
            url: item.response.data
          }
          fileList[i] = newItem;
          shouldResolve = true;
        }
      }
      if (shouldResolve) {
        resolve(fileList)
      } else {
        reject()
      }
    })
  }

  handleCancel = () => this.setState({ previewVisible: false })

  handlePreview = (file) => {
    this.setState({
      previewImage: file.url || file.thumbUrl,
      previewVisible: true,
    });
  }

  picMoveLeft = (index) => {

    if (index == 0) {
      return;
    }
    let fileList = this.state.fileList;
    let temp = fileList[index];
    fileList[index] = fileList[index - 1];
    fileList[index - 1] = temp;
    this.setState({
      fileList
    })
    let urlList = fileList.map(item => item.url);
    this.props.uploadCallback(urlList);
  }

  picMoveRight = (index) => {
    let fileList = this.state.fileList;
    if (!fileList || !fileList.length || index == fileList.length - 1) {
      return;
    }
    let temp = fileList[index];
    fileList[index] = fileList[index + 1];
    fileList[index + 1] = temp;
    this.setState({
      fileList
    })
    let urlList = fileList.map(item => item.url);
    this.props.uploadCallback(urlList);
  }

  handleChange = (event) => {
    let { fileList, file } = event;
    let newUploadFiles = this.getNewUploadFiles(fileList);
    if (newUploadFiles && !this.isFilesTypeValid(newUploadFiles)) {
      return;
    }

    let uploadIsLoading = file && file.status == 'uploading';
    this.setState({ fileList, uploadIsLoading })

    this.formatUploadFileList(fileList)
      .then((list) => {
        let urlList = list.map(item => item.url);
        this.props.uploadCallback(urlList);
      })
      .catch(() => { })
  }

  getNewUploadFiles = (files) => {
    if (!files || !files.length) {
      return;
    }
    let arr = files.filter(item => !item.url);
    return arr && arr.length ? arr : null;
  }
  // 删除图片
  deleteImage = (index) => {
    let fileList = this.state.fileList;
    fileList.splice(index, 1);
    this.setState({
      fileList
    })
    let urlList = fileList.map(item => item.url);
    this.props.uploadCallback(urlList);
  }

  beforeUpload = (file, fileList) => {

    let isFilesTypeValid = this.isFilesTypeValid(fileList);

    if (!isFilesTypeValid) {
      let toastTitle = '文件格式不正确';
      let allowTypeTitle = "";
      if (this.props.allowType && this.props.allowType.length) {
        allowTypeTitle = this.props.allowType.filter(item => item).map(item => fileTypeExpToastEnum[item]).filter(item => item).join("、");
      }
      toastTitle += allowTypeTitle ? `，请上传${allowTypeTitle}格式的文件！` : "！";
      Toast(toastTitle);
      return false
    }
    return true
  }

  isFileTypeValid = (file) => {
    if (!file || !file.type) {
      return
    }
    let fileType = file.type;
    if (!/image/.test(fileType)) {
      return
    }

    if (!this.isAllowFileType(fileType)) {
      return;
    }
    return true
  }

  isAllowFileType = (fileType) => {
    if (!this.props.allowType || !this.props.allowType.length) {
      return true
    }

    let arr = this.props.allowType;
    let isValid = false;
    for (let i = 0; i < arr.length; i++) {
      let item = arr[i];
      let regExpression = fileTypeExpEnum[item];
      if (regExpression.test(fileType)) {
        isValid = true;
        break;
      }
    }

    return isValid;

  }

  isFilesTypeValid = (files) => {
    if (!files || !files.length) {
      return
    }
    for (let i = 0; i < files.length; i++) {
      if (!this.isFileTypeValid(files[i])) {
        return;
      }
    }
    return true
  }

  render() {
    const { previewVisible, previewImage, fileList } = this.state;
    const limitFileLength = this.props.limitFileLength || 1;
    const uploadButton = (
      <div className='ant-upload ant-upload-select ant-upload-select-picture-card' >
        <div className='flex-column flex-around padding20'>
          <Icon type="plus" style={{ fontSize: 32, color: "#999" }} />
          <div className="ant-upload-text">上传图片</div>
        </div>
      </div>
    );
    return (
      <div>
        <div className="clearfix">
          <Upload
            accept="image/*"
            beforeUpload={this.beforeUpload}
            action={updateUrl}
            showUploadList={false}
            fileList={fileList}
            name='files'
            onChange={this.handleChange}
          >

            {fileList.length >= limitFileLength ? null : uploadButton}
          </Upload>
          {
            <div className='clearfix'>
              <span>
                <div className='ant-upload-list ant-upload-list-picture-card flex'>
                  {
                    fileList && fileList.length ?
                      fileList.map((item, index) =>
                        <div key={item.uid}>
                          {
                            index == fileList.length - 1 && index >= 0 ?
                              <Spin spinning={this.state.uploadIsLoading} style={{ height: 80, width: 80 }}>
                                <div style={{ cursor: "pointer" }} className='ant-upload-list-item ant-upload-list-item-done'>
                                  <div className='ant-upload-list-item-info'>
                                    <img src={item.url + "?x-oss-process=image/resize,l_100"} style={{ height: "100%", width: "100%" }} />
                                  </div>
                                  <span className='ant-upload-list-item-actions'>
                                    <div className='margin-bottom'>
                                      <Icon onClick={() => { this.handlePreview(item) }} title='预览' type="eye" style={{ fontSize: '18px', color: "#fff", marginRight: "6px" }} />
                                      <Icon onClick={() => { this.deleteImage(index) }} title='删除' type="delete" style={{ fontSize: '18px', color: "#fff" }} />
                                    </div>
                                    {
                                      limitFileLength > 1 ?
                                        <div>
                                          <Icon onClick={() => { this.picMoveLeft(index) }} title='左移' type="arrow-left" style={{ fontSize: '18px', color: "#fff", marginRight: "10px" }} />
                                          <Icon onClick={() => { this.picMoveRight(index) }} title='右移' type="arrow-right" style={{ fontSize: '18px', color: "#fff" }} />
                                        </div> : null
                                    }
                                  </span>
                                </div>
                              </Spin>
                              :
                              <div>
                                <div style={{ cursor: "pointer" }} className='ant-upload-list-item ant-upload-list-item-done'>
                                  <div className='ant-upload-list-item-info'>
                                    <img src={item.url + "?x-oss-process=image/resize,l_100"} style={{ height: "100%", width: "100%" }} />
                                  </div>
                                  <span className='ant-upload-list-item-actions'>
                                    <div className='margin-bottom'>
                                      <Icon onClick={() => { this.handlePreview(item) }} title='预览' type="eye" style={{ fontSize: '18px', color: "#fff", marginRight: "6px" }} />
                                      <Icon onClick={() => { this.deleteImage(index) }} title='删除' type="delete" style={{ fontSize: '18px', color: "#fff" }} />
                                    </div>
                                    {
                                      limitFileLength > 1 ?
                                        <div>
                                          <Icon onClick={() => { this.picMoveLeft(index) }} title='左移' type="arrow-left" style={{ fontSize: '18px', color: "#fff", marginRight: "10px" }} />
                                          <Icon onClick={() => { this.picMoveRight(index) }} title='右移' type="arrow-right" style={{ fontSize: '18px', color: "#fff" }} />
                                        </div> : null
                                    }
                                  </span>
                                </div>
                              </div>
                          }
                        </div>
                      ) : null
                  }
                </div>
              </span>
            </div>
          }
        </div>
        <Modal maskClosable={false} zIndex={3000} visible={previewVisible} footer={null} onCancel={this.handleCancel}>
          <div className='padding20'>
            <img alt="example" style={{ width: '100%' }} src={previewImage} />
          </div>
        </Modal>
      </div>
    );
  }
}

