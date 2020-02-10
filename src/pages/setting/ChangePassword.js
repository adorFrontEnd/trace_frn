import React, { Component } from "react";
import CommonPage from '../../components/common-page';
import { Form, Input, Col, Row, Button } from "antd";

import Toast from '../../utils/toast';
import { getCacheOperId } from '../../middleware/localStorage/login';
import { updatePassword } from '../../api/account/account';


const _title = "修改密码";
const _description = "";

class Page extends Component {

  state = {
    pageData: null,
    logoPicUrl: "",
    loginImagePicUrl: "",
    id: null
  }

  saveDataClick = () => {
    this.props.form.validateFields((err, data) => {
      if (err) {
        return;
      }
      let { oldPassword, password, passwordConfirm } = data;

      if (password != passwordConfirm) {
        Toast('新密码与确认密码不一致！');
        return;
      }

      let id = getCacheOperId();
      let params = { id, oldPassword, password }
      updatePassword(params)
        .then(() => {
          Toast('修改密码成功！');
        })
    })
  }

  /**渲染**********************************************************************************************************************************/

  render() {
    const { getFieldDecorator } = this.props.form;
    return (
      <CommonPage title={_title} description={_description} >
        <div style={{ width: 600, padding: 20 }}>
          <Form className='common-form'>
            <Form.Item
              labelCol={{ span: 6 }}
              wrapperCol={{ span: 16 }}
              label='原始密码：'
              key='oldPassword'
              field='oldPassword'
            >
              {
                getFieldDecorator('oldPassword', {
                  rules: [
                    { required: true, message: '输入原始密码' }
                  ]
                })(
                  <Input allowClear placeholder="输入原始密码" />
                )
              }
            </Form.Item>

            <Form.Item
              labelCol={{ span: 6 }}
              wrapperCol={{ span: 16 }}
              label='新密码：'
              key='password'
              field='password'
            >
              {
                getFieldDecorator('password', {
                  rules: [
                    { required: true, message: '输入新密码' },
                    { min: 6, message: '请输入至少6位的新密码' },
                    { max: 12,message: '请输入最多12位的新密码'  }
                  ]
                })(
                  <Input allowClear placeholder="输入新密码" />
                )
              }
            </Form.Item>

            <Form.Item
              labelCol={{ span: 6 }}
              wrapperCol={{ span: 16 }}
              label='确认新密码：'
              key='passwordConfirm'
              field='passwordConfirm'
            >
              {
                getFieldDecorator('passwordConfirm', {
                  rules: [
                    { required: true, message: '确认新密码' },
                    { min: 6, message: '请输入至少6位的确认新密码' },
                    { max: 12,message: '请输入最多12位的确认新密码'  }
                  ]
                })(
                  <Input allowClear placeholder="确认新密码" />
                )
              }
            </Form.Item>
          </Form>

          <Row className='line-height40'>
            <Col offset={6} span={16}>
              <div className='padding10-0' style={{ width: 400 }}><Button onClick={this.saveDataClick} type='primary'>修改</Button></div>
            </Col>
          </Row>

        </div>

      </CommonPage >
    )
  }
}

export default Form.create()(Page);