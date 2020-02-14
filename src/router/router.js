import React from 'react';
import asyncComponent from "../components/asyncComponent/asyncComponent";
import { BrowserRouter as Router, Route, Link, Switch, Redirect } from 'react-router-dom';
import { baseRoute, routerConfig } from '../config/router.config';
import { isUserLogin } from '../middleware/localStorage/login';
import { getCacheDomain } from '../middleware/localStorage/login';
import { getCacheFirstEnterPage } from '../middleware/localStorage/cacheAuth';
import Login from '../pages/login';

const Admin = asyncComponent(() => import("../pages/admin"));
const Home = asyncComponent(() => import("../pages/home/Home"));
const ProductCode = asyncComponent(() => import("../pages/codeManage/ProductCode"));
const ProductCodeDetail = asyncComponent(() => import("../pages/codeManage/ProductCodeDetail"));
const BoxCode = asyncComponent(() => import("../pages/codeManage/BoxCode"));
const TrayCode = asyncComponent(() => import("../pages/codeManage/TrayCode"));

const ProduceScan = asyncComponent(() => import("../pages/scanManage/ProduceScan"));
const StockOutScan = asyncComponent(() => import("../pages/scanManage/StockOutScan"));

const TraceDecoration = asyncComponent(() => import("../pages/traceManage/Decoration"));
const TraceSearch = asyncComponent(() => import("../pages/traceManage/Search"));

const SecurityDecoration = asyncComponent(() => import("../pages/securityManage/Decoration"));
const SecuritySearch = asyncComponent(() => import("../pages/securityManage/Search"));

const RoleAuth = asyncComponent(() => import("../pages/account/RoleAuth"));
const AccountManage = asyncComponent(() => import("../pages/account/AccountManage"));
const Organization = asyncComponent(() => import("../pages/account/Organization"));

const DealerList = asyncComponent(() => import("../pages/dealer/DealerList"));
const ShippingDetails = asyncComponent(() => import("../pages/dealer/ShippingDetails"));

const DealerEdit = asyncComponent(() => import("../pages/dealer/DealerEdit"));
const ProductUpRecord = asyncComponent(() => import("../pages/dealer/ProductUpRecord"));
const LabelManage = asyncComponent(() => import("../pages/dealer/LabelManage"));

const Drainage = asyncComponent(() => import("../pages/setting/Drainage"));
const Decoration = asyncComponent(() => import("../pages/setting/Decoration"));
const VoiceManage = asyncComponent(() => import("../pages/setting/VoiceManage"));
const ChangePassword = asyncComponent(() => import("../pages/setting/ChangePassword"));
const Recharge = asyncComponent(() => import("../pages/setting/recharge"));
const PayManage = asyncComponent(() => import("../pages/setting/PayManage"));
const SyncManage = asyncComponent(() => import("../pages/setting/SyncManage"));

const AppAuthManage = asyncComponent(() => import("../pages/appManage/AppAuthManage"));
const AuthEdit = asyncComponent(() => import("../pages/appManage/AuthEdit"));

const UserList = asyncComponent(() => import("../pages/marketManage/UserList"));
const IntegralRecord = asyncComponent(() => import("../pages/marketManage/IntegralRecord"));
const PrizeConfig = asyncComponent(() => import("../pages/marketManage/PrizeConfig"));
const ActivityManage = asyncComponent(() => import("../pages/marketManage/ActivityManage"));
const ActivityEdit = asyncComponent(() => import("../pages/marketManage/ActivityEdit"));
const WriteOffLog = asyncComponent(() => import("../pages/marketManage/WriteOffLog"));
const IntegralLog = asyncComponent(() => import("../pages/marketManage/IntegralLog"));
const GiftRecord = asyncComponent(() => import("../pages/marketManage/GiftRecord"));
const WriteOffLogManage = asyncComponent(() => import("../pages/marketManage/WriteOffLogManage"));
const BigWheelRecord = asyncComponent(() => import("../pages/marketManage/BigWheelRecord"));
const SignConfig = asyncComponent(() => import("../pages/marketManage/SignConfig"));
const MainIntegralRecord = asyncComponent(() => import("../pages/marketManage/MainIntegralRecord"));

const MerchantManage = asyncComponent(() => import("../pages/o2oManage/MerchantManage"));
const MerchantEdit = asyncComponent(() => import("../pages/o2oManage/MerchantEdit"));
const ActivityCouponManage = asyncComponent(() => import("../pages/o2oManage/ActivityCouponManage"));
const ActivityCouponEdit = asyncComponent(() => import("../pages/o2oManage/ActivityCouponEdit"));
const ActivityCouponOrderManage = asyncComponent(() => import("../pages/o2oManage/ActivityCouponOrderManage"));

export default class GlobalRouter extends React.Component {

  render() {
    let firstEnterPagePath = getCacheFirstEnterPage();
    return (
      <Router>
        <Switch>
          <Route exact={true} path="/" render={() => (
            isUserLogin() ?
              <Redirect to={routerConfig[firstEnterPagePath].path} />
              :
              <Redirect to={{ pathname: routerConfig["login"].path + '/' + getCacheDomain() }} />
          )} />
          <Route exact={true} path={routerConfig["login"].path + '/:domain'} component={Login} />
          <Route path={baseRoute} render={() => (
            isUserLogin() ?
              <Admin>
                <Switch>
                  <PrivateRoute path={routerConfig["dataStatistics"].path} component={Home} />
                  <PrivateRoute path={routerConfig["codeManage.productCode"].path} component={ProductCode} />
                  <PrivateRoute path={routerConfig["codeManage.boxCode"].path} component={BoxCode} />
                  <PrivateRoute path={routerConfig["codeManage.trayCode"].path} component={TrayCode} />
                  <PrivateRoute path={routerConfig["codeManage.productCodeDetail"].path} component={ProductCodeDetail} />

                  <PrivateRoute path={routerConfig["scanManage.produceScan"].path} component={ProduceScan} />
                  <PrivateRoute path={routerConfig["scanManage.stockOutScan"].path} component={StockOutScan} />

                  <PrivateRoute path={routerConfig["traceManage.decoration"].path} component={TraceDecoration} />
                  <PrivateRoute path={routerConfig["traceManage.search"].path} component={TraceSearch} />

                  <PrivateRoute path={routerConfig["securityManage.decoration"].path} component={SecurityDecoration} />
                  <PrivateRoute path={routerConfig["securityManage.search"].path} component={SecuritySearch} />

                  <PrivateRoute path={routerConfig["account.roleAuth"].path} component={RoleAuth} />
                  <PrivateRoute path={routerConfig["account.accountManage"].path} component={AccountManage} />
                  <PrivateRoute path={routerConfig["account.organization"].path} component={Organization} />

                  <PrivateRoute path={routerConfig["dealer.dealerList"].path} component={DealerList} />
                  <PrivateRoute path={routerConfig["dealer.shippingDetails"].path + '/:id'} component={ShippingDetails} />
                  <PrivateRoute path={routerConfig["dealer.dealerEdit"].path + '/:id'} component={DealerEdit} />
                  <PrivateRoute path={routerConfig["dealer.productUpRecord"].path + '/:id'} component={ProductUpRecord} />
                  <PrivateRoute path={routerConfig["dealer.labelManage"].path} component={LabelManage} />

                  <PrivateRoute path={routerConfig["setting.drainage"].path} component={Drainage} />
                  <PrivateRoute path={routerConfig["setting.decoration"].path} component={Decoration} />
                  <PrivateRoute path={routerConfig["setting.changePassword"].path} component={ChangePassword} />
                  <PrivateRoute path={routerConfig["setting.voiceManage"].path} component={VoiceManage} />
                  <PrivateRoute path={routerConfig["setting.recharge"].path} component={Recharge} />
                  <PrivateRoute path={routerConfig["setting.payManage"].path} component={PayManage} />
                  <PrivateRoute path={routerConfig["setting.syncManage"].path} component={SyncManage} />

                  <PrivateRoute path={routerConfig["appManage.authManage"].path} component={AppAuthManage} />
                  <PrivateRoute path={routerConfig["appManage.authEdit"].path + '/:id'} component={AuthEdit} />

                  <PrivateRoute path={routerConfig["marketManage.activityManage"].path} component={ActivityManage} />
                  <PrivateRoute path={routerConfig["marketManage.activityEdit"].path + '/:id'} component={ActivityEdit} />
                  <PrivateRoute path={routerConfig["marketManage.prizeConfig"].path + '/:id'} component={PrizeConfig} />
                  <PrivateRoute path={routerConfig["marketManage.writeOffLog"].path + '/:id'} component={WriteOffLog} />
                  <PrivateRoute path={routerConfig["marketManage.integralLog"].path + '/:id'} component={IntegralLog} />
                  <PrivateRoute path={routerConfig["marketManage.bigWheelRecord"].path + '/:id'} component={BigWheelRecord} />
                  <PrivateRoute path={routerConfig["marketManage.signConfig"].path} component={SignConfig} />
                  <PrivateRoute path={routerConfig["marketManage.mainIntegralRecord"].path} component={MainIntegralRecord} />
                  
                  <PrivateRoute path={routerConfig["marketManage.userList"].path} component={UserList} />
                  <PrivateRoute path={routerConfig["marketManage.integralRecord"].path + '/:id'} component={IntegralRecord} />
                  <PrivateRoute path={routerConfig["marketManage.giftRecord"].path + '/:id'} component={GiftRecord} />
                  <PrivateRoute path={routerConfig["marketManage.writeOffLogManage"].path} component={WriteOffLogManage} />

                  <PrivateRoute path={routerConfig["o2oManage.merchantManage"].path} component={MerchantManage} />
                  <PrivateRoute path={routerConfig["o2oManage.merchantEdit"].path} component={MerchantEdit} />
                  <PrivateRoute path={routerConfig["o2oManage.activityCouponManage"].path} component={ActivityCouponManage} />
                  <PrivateRoute path={routerConfig["o2oManage.activityCouponEdit"].path} component={ActivityCouponEdit} />
                  <PrivateRoute path={routerConfig["o2oManage.activityCouponOrderManage"].path} component={ActivityCouponOrderManage} />

                </Switch>
              </Admin>
              : <Redirect to={{ pathname: routerConfig["login"].path + '/' + getCacheDomain() }} />
          )} />
        </Switch>
      </Router >
    )
  }
}

function PrivateRoute({ component: Component, ...rest }) {
  return (
    <Route
      {...rest}
      render={
        props =>
          isUserLogin() ?
            <Component {...props} />
            : <Redirect to={{ pathname: routerConfig["login"].path + '/' + getCacheDomain(), state: { from: props.location } }} />
      }
    />
  )
}
