import React, { Component } from "react";
import { Form, Icon, Input, Button, Checkbox } from 'antd';
import { apiUrlPrefix } from '../../config/http.config';
import Toast from '../../utils/toast';
import './login.less'

const FormItem = Form.Item;

class NormalLoginForm extends Component {
  state = {
    imageUrl: "",
    username: "",
    password: "",
    imageCode: ""
  }
  componentDidMount() {
    this.imageChange();
  }
  // 登录
  handleSubmit = (e) => {
    e.preventDefault();
    e.stopPropagation();
    this.props.form.validateFields((err, userInfo) => {
      if (err) {
        return;
      }
      
      let username = userInfo.username;
      let password = userInfo.password;
      let imageCode = userInfo.imageCode;
      this.props.login({ username, password,imageCode });
    });
  }

  imageChange = () => {
    this.setState({
      now: Date.now()
    })
  }

  usernameOnBlur = (e) => {
    let newusername = e.target.value;
    if (this.state.username != newusername) {
      this.setState({
        username: newusername
      })
      this.imageChange();
    }
  }
  forgotPassword = (e) => {
    e.preventDefault();
    Toast('请联系管理员找回密码！')
  }

  onLoginChange = (e, key) => {
    let data = {};
    data[key] = e.currentTarget.value
    this.props.form.setFieldsValue(data);
    this.setState(data)
  }
  render() {
    const { getFieldDecorator } = this.props.form;
    return (
      <Form theme='dark' onSubmit={this.handleSubmit} className="login-form">

        {/* 用户名 */}
        <FormItem className="radius-input">
          {getFieldDecorator('username', {
            rules: [{ required: true, message: '请输入账号!' }],
          })(
            <Input
              onBlur={this.usernameOnBlur}
              onChange={(e) => { this.onLoginChange(e, 'username') }}
              prefix={<Icon type="user" style={{ color: "#999999" }} />}
              placeholder="输入账号"
            />
          )}
        </FormItem>

        {/* 密码 */}
        <FormItem className="radius-input">
          {
            getFieldDecorator('password', {
              rules: [
                { required: true, message: '请输入密码!' }
              ],
            })(
              <Input

                onChange={(e) => { this.onLoginChange(e, 'password') }}
                prefix={<Icon type="lock" theme="filled" style={{ color: "#999999" }} />}
                type="password" placeholder="输入密码"
              />
            )
          }
        </FormItem>

        {/* 验证码 */}
        <div className="image-code">
          <FormItem className='qrcode-input'>
            {getFieldDecorator('imageCode', {
              rules: [
                { required: true, message: '请输入验证码!' },
                {
                  pattern: new RegExp('^[0-9a-zA-Z]{4}$', 'g'),
                  message: '请输入正确的验证码'
                }
              ],
            })(
              <Input

                onChange={(e) => { this.onLoginChange(e, 'imageCode') }}
                prefix={<Icon type="safety-certificate" theme="filled" style={{ color: "#999999" }} />}
                maxLength={4} type="text" placeholder="验证码"
              />
            )}
          </FormItem>
          <div className='img-wraper'>
            <img
              style={{ "cursor": "pointer" }}
              onClick={this.imageChange}
              src={apiUrlPrefix + "imageCaptcha?username=" + this.state.username + "&stamp=" + this.state.now}
            />
          </div>
        </div>



        {/* 记住密码 */}
        <FormItem>
          {/* {getFieldDecorator('remember', {
            valuePropName: 'checked',
            initialValue: true,
          })(
            <Checkbox><span className='login-color'>记住密码</span></Checkbox>
          )} */}


          {/* 登录按钮 */}
          <Button
            disabled={!this.state.username || !this.state.password || !this.state.imageCode}
            shape="round"           
            loading={this.props.loading}
            type="primary"
            htmlType="submit"
            className="login-form-button">
            登录
          </Button>
          {/* <a className='register' href=""><span className='login-color'>现在注册</span></a> */}
          <a onClick={this.forgotPassword} className="login-form-forgot" href=""><span className='login-color'>忘记密码</span></a>
        </FormItem>
      </Form>
    );
  }
}

const WrappedNormalLoginForm = Form.create()(NormalLoginForm);
export default WrappedNormalLoginForm