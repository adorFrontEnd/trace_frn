import React, { Component } from "react";
import { showRouteChangeloading,hideRouteChangeloading} from '../../router/routeLoading';

export default function asyncComponent(importComponent) {
  class AsyncComponent extends Component {
    constructor(props) {
      super(props);
      this.state = {
        component: null
      };
    }

    async componentDidMount() {
  
      showRouteChangeloading();
      const { default: component } = await importComponent();
      this.setState({
        component: component
      });
      hideRouteChangeloading()
    }

    render() {
      const C = this.state.component;
      return C ? <C {...this.props} /> : null;
    }
  }

  return AsyncComponent;
}
