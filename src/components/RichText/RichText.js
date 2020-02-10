import { Upload, Radio, InputNumber, Form, Col, Input, Row, Modal, Select } from 'antd';
import React, { Component } from 'react';
import Toast from '../../utils/toast';
import ReactQuill, { Quill } from 'react-quill';
import { ImageDrop } from 'quill-image-drop-module';
import 'react-quill/dist/quill.snow.css';
import PicturesWallModal from '../../components/upload/PictureWallModal';


export default class RichText extends Component {

  state = {

  }
  /**富文本 ********************************************************************************************************************/
  onRichTextChange = (richText) => {
    this.props.onTextChange(richText)
  }

  modules = {
    toolbar: {
      container: [['image']],
      handlers: {
        image: this.imageHandler.bind(this)
      }
    },
    clipboard: {
      // toggle to add extra line breaks when pasting HTML:
      matchVisual: false,
    }
  }

  imageHandler() {

    this.setState({
      uploadModalVisible: true
    })
  }

  hideUploadModal = () => {
    this.setState({
      uploadModalVisible: false
    })
  }

  onUploadModalOk = (pictureUrl) => {

    this.hideUploadModal()
    let quill = this.refs.reactQuillRef.getEditor();//获取到编辑器本身
    const cursorPosition = quill.selection.savedRange.index;//获取当前光标位置
    quill.insertEmbed(cursorPosition, "image", pictureUrl, Quill.sources.USER);//插入图片
    quill.setSelection(cursorPosition + 1);//光标位置加1s
  }

  formats = [
    'header', 'font', 'size',
    'bold', 'italic', 'underline', 'strike', 'blockquote',
    'list', 'bullet', 'indent',
    'link', 'image', 'video'
  ]

  render() {
    return (
      <div>
        <div>{this.props.addonBefore}</div>
        <ReactQuill
          ref='reactQuillRef'
          theme={'snow'}
          onChange={this.onRichTextChange}
          value={this.props.textValue || ''}
          modules={this.modules}
          formats={this.formats}
          placeholder='编辑详情(图片)...'
        />
        <div className='line-height18 color-red' style={{ textAlign: "left" }}>长度不能超过16000px</div>
        <div>{this.props.children}</div>
        <PicturesWallModal visible={this.state.uploadModalVisible} onCancel={this.hideUploadModal} onOk={this.onUploadModalOk}></PicturesWallModal>
      </div>
    )
  }
}