import React, { Component } from 'react';
import { getCacheDecoration } from '../../middleware/localStorage/login';
import './common-page.less';
import { title as _appTitle } from '../../config/app.config';

export default class CommonPage extends Component {

  componentDidMount() {
    let decorationData = getCacheDecoration();
    let title = decorationData && decorationData.name ? decorationData.name : _appTitle;
    document.title = title;
  }
  render() {
    return (
      <div className="page-body">
        <div className='page-meta'>
          <div className="page-title">{this.props.title}</div>
          <div className="page-description">{this.props.description}</div>
        </div>
        <div className="page-content">
          {this.props.children}
        </div>
      </div>
    )
  }
}