import React, { Component } from "react";
import { Icon } from 'antd';
import { NavLink } from 'react-router-dom';
import { connect } from 'react-redux';
import { deleteRoute } from '../../../store/actions/route-actions';

class TabsNav extends Component {
  state = {
    selectedTab: null
  }

  selectTabClick = (selectedTab) => {
    this.setState({
      selectedTab
    })
  }

  closeClick(path, e) {
    this.props.deleteRoute({
      path
    })
    e.stopPropagation();
  }

  render() {
    return (
      <div className="tabs-nav-container">
        {/* <div className="tabs-nav">
          <div className="tabs-before">
            <div className="tabs-before-top"></div>
          </div>
          {
            this.props.routeArray.map(item =>
              <div
                key={item.path}
                onClick={() => { this.selectTabClick(item.path) }}
                className={this.state.selectedTab === item.path ? 'tabs-nav-item active' : 'tabs-nav-item'}>
                <Icon type="large" type="reload" />
                <NavLink to={item.path}><div className="item-text">{item.title}</div></NavLink>
                <Icon type="large" onClick={this.closeClick.bind(this, item.path)} type="close" />
              </div>
            )
          }
        </div> */}
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    routeArray: state.storeRoute.routeArray
  }
}
const mapDispatchToProps = (dispatch) => {
  return {
    deleteRoute: data => dispatch(deleteRoute(data))
  }
}
export default connect(mapStateToProps,mapDispatchToProps)(TabsNav)
