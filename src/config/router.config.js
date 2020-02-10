const baseRoute = "";
const routerSort = ["dataStatistics", "setting", "frn", "asset", "user", "order", "settlement", "auth", "showProduct"];

const routerConfigArr = [
  {
    route_name: "login",
    path: baseRoute + "/login",
  },
  {
    route_name: "dataStatistics",
    path: baseRoute + "/dataStatistics",
    loginRequired: true,
    title: "数据统计",
    icon: "line-chart",
    moduleAuth: true
  },
  {
    route_name: "codeManage",
    title: "物码管理",
    icon: "qrcode",
    moduleAuth: true
  },
  {
    route_name: "codeManage.productCode",
    path: baseRoute + "/codeManage/productCode",
    loginRequired: true,
    moduleAuth: true,
    title: "商品物码",
    icon: "shop"
  },
  {
    route_name: "codeManage.productCodeDetail",
    path: baseRoute + "/codeManage/productCodeDetail",
    loginRequired: true,
    moduleAuth: false,
    title: "新增/编辑商品"
  },
  {
    route_name: "codeManage.boxCode",
    path: baseRoute + "/codeManage/boxCode",
    loginRequired: true,
    moduleAuth: true,
    title: "箱规物码",
    icon: "inbox"
  },
  {
    route_name: "codeManage.trayCode",
    path: baseRoute + "/codeManage/trayCode",
    loginRequired: true,
    moduleAuth: true,
    title: "托盘码管理",
    icon: "shopping-cart"
  },
  {
    route_name: "scanManage",
    title: "扫描管理",
    icon: "scan",
    moduleAuth: true
  },
  {
    route_name: "scanManage.produceScan",
    path: baseRoute + "/scanManage/produceScan",
    loginRequired: true,
    moduleAuth: true,
    title: "生产扫描",
    icon: "security-scan"
  },
  {
    route_name: "scanManage.stockOutScan",
    path: baseRoute + "/scanManage/stockOutScan",
    loginRequired: true,
    moduleAuth: true,
    title: "拣货扫描",
    icon: "logout"
  },
  {
    route_name: "traceManage",
    title: "溯源管理",
    icon: "apartment",
    moduleAuth: true
  },
  {
    route_name: "traceManage.search",
    path: baseRoute + "/traceManage/search",
    loginRequired: true,
    moduleAuth: true,
    title: "溯源查询",
    icon: "search"
  },
  {
    route_name: "traceManage.decoration",
    path: baseRoute + "/traceManage/decoration",
    loginRequired: true,
    moduleAuth: true,
    title: "溯源装修",
    icon: "skin"
  },
  {
    route_name: "securityManage",
    title: "防伪管理",
    icon: "safety-certificate",
    moduleAuth: true
  },
  {
    route_name: "securityManage.search",
    path: baseRoute + "/securityManage/search",
    loginRequired: true,
    moduleAuth: true,
    title: "防伪查询",
    icon: "security-scan"
  },
  {
    route_name: "securityManage.decoration",
    path: baseRoute + "/securityManage/decoration",
    loginRequired: true,
    moduleAuth: true,
    title: "防伪装修",
    icon: "skin"
  },
  {
    route_name: "account",
    title: "账户管理",
    icon: "user",
    moduleAuth: true
  },
  {
    route_name: "account.roleAuth",
    path: baseRoute + "/account/roleAuth",
    loginRequired: true,
    moduleAuth: true,
    title: "角色权限",
    icon: "solution"
  },
  {
    route_name: "account.accountManage",
    path: baseRoute + "/account/accountManage",
    loginRequired: true,
    moduleAuth: true,
    title: "账号管理",
    icon: "team"
  },  
  {
    route_name: "account.organization",
    path: baseRoute + "/account/organization",
    loginRequired: true,
    moduleAuth: true,
    title: "组织架构",
    icon: "cluster"
  },  

  {
    route_name: "setting",
    title: "设置",
    icon: "setting",
    moduleAuth: true
  },
  {
    route_name: "setting.drainage",
    path: baseRoute + "/setting/drainage",
    loginRequired: true,
    moduleAuth: true,
    title: "引流设置",
    icon: "arrow-down"
  },
  {
    route_name: "setting.decoration",
    path: baseRoute + "/setting/decoration",
    loginRequired: true,
    moduleAuth: true,
    title: "装修系统",
    icon: "skin"
  },  
  {
    route_name: "setting.voiceManage",
    path: baseRoute + "/setting/voiceManage",
    loginRequired: true,
    moduleAuth: true,
    title: "提示音管理",
    icon: "audio"
  },  
  {
    route_name: "setting.changePassword",
    path: baseRoute + "/setting/changePassword",
    loginRequired: true,
    moduleAuth: true,
    title: "修改密码",
    icon: "key"
  },  
  {
    route_name: "setting.recharge",
    path: baseRoute + "/setting/recharge",
    loginRequired: true,
    moduleAuth: true,
    title: "充值业务",
    icon: "pay-circle"
  }, 
  {
    route_name: "setting.payManage",
    path: baseRoute + "/setting/payManage",
    loginRequired: true,
    moduleAuth: true,
    title: "支付管理",
    icon: "money-collect"
  },    
  {
    route_name: "setting.syncManage",
    path: baseRoute + "/setting/syncManage",
    loginRequired: true,
    moduleAuth: true,
    title: "同步管理",
    icon: "sync"
  },    
  {
    route_name: "dealer",
    title: "经销商管理",
    icon: "usergroup-add",
    moduleAuth: true
  },
  {
    route_name: "dealer.dealerList",
    path: baseRoute + "/dealer/dealerList",
    loginRequired: true,
    moduleAuth: true,
    title: "经销商列表",
    icon: "unordered-list"
  },
  {
    route_name: "dealer.shippingDetails",
    path: baseRoute + "/dealer/shippingDetails",
    loginRequired: true,
    moduleAuth: false,
    title: "经销商发货详情",
    icon: "profile"
  },
  {
    route_name: "dealer.dealerEdit",
    path: baseRoute + "/dealer/dealerEdit",
    loginRequired: true,
    moduleAuth: false,
    title: "经销商编辑/添加",
    icon: "profile"
  },
  {
    route_name: "dealer.productUpRecord",
    path: baseRoute + "/dealer/productUpRecord",
    loginRequired: true,
    moduleAuth: false,
    title: "上架记录",
    icon: "profile"
  },
  {
    route_name: "dealer.labelManage",
    path: baseRoute + "/dealer/labelManage",
    loginRequired: true,
    moduleAuth: true,
    title: "标签管理",
    icon: "tags"
  },  
  {
    route_name: "appManage",
    title: "应用管理",
    icon: "appstore",
    moduleAuth: true
  },
  {
    route_name: "appManage.authManage",
    path: baseRoute + "/appManage/authManage",
    loginRequired: true,
    moduleAuth: true,
    title: "授权管理",
    icon: "key"
  },
  {
    route_name: "appManage.authEdit",
    path: baseRoute + "/appManage/authEdit",
    loginRequired: true,
    moduleAuth: false,
    title: "编辑授权"
  },
  {
    route_name: "marketManage",
    title: "市场营销",
    icon: "shopping",
    moduleAuth: true
  },
  {
    route_name: "marketManage.userList",
    path: baseRoute + "/marketManage/userList",
    loginRequired: true,
    moduleAuth: true,
    title: "会员列表",
    icon: "user"
  },
  {
    route_name: "marketManage.integralRecord",
    path: baseRoute + "/marketManage/integralRecord",
    loginRequired: true,
    moduleAuth: false,
    title: "积分记录"
  },
  {
    route_name: "marketManage.giftRecord",
    path: baseRoute + "/marketManage/giftRecord",
    loginRequired: true,
    moduleAuth: false,
    title: "兑奖记录"
  },  
  {
    route_name: "marketManage.prizeConfig",
    path: baseRoute + "/marketManage/prizeConfig",
    loginRequired: true,
    moduleAuth: false,
    title: "奖品配置"  
  },
  {
    route_name: "marketManage.writeOffLog",
    path: baseRoute + "/marketManage/writeOffLog",
    loginRequired: true,
    moduleAuth: false,
    title: "核销管理"  
  },
  {
    route_name: "marketManage.integralLog",
    path: baseRoute + "/marketManage/integralLog",
    loginRequired: true,
    moduleAuth: false,
    title: "活动积分日志"  
  },  
  {
    route_name: "marketManage.activityManage",
    path: baseRoute + "/marketManage/activityManage",
    loginRequired: true,
    moduleAuth: true,
    title: "活动管理",
    icon: "crown"
  },
  {
    route_name: "marketManage.activityEdit",
    path: baseRoute + "/marketManage/activityEdit",
    loginRequired: true,
    moduleAuth: false,
    title: "活动编辑"   
  },
  {
    route_name: "marketManage.writeOffLogManage",
    path: baseRoute + "/marketManage/writeOffLogManage",
    loginRequired: true,
    moduleAuth: true,
    title: "核销记录",
    icon: "profile"
  },
  {
    route_name: "marketManage.bigWheelRecord",
    path: baseRoute + "/marketManage/bigWheelRecord",
    loginRequired: true,
    moduleAuth: false,
    title: "中奖日志"
  },  
  {
    route_name: "o2oManage",
    title: "O2O管理",
    icon: "shop",
    moduleAuth: true
  },
  {
    route_name: "o2oManage.merchantManage",
    path: baseRoute + "/o2oManage/merchantManage",
    loginRequired: true,
    moduleAuth: true,
    title: "商家管理",
    icon: "bank"
  },    
  {
    route_name: "o2oManage.merchantEdit",
    path: baseRoute + "/o2oManage/merchantEdit",
    loginRequired: true,
    moduleAuth: false,
    title: "商家编辑"
  },    
  {
    route_name: "o2oManage.activityCouponManage",
    path: baseRoute + "/o2oManage/activityCouponManage",
    loginRequired: true,
    moduleAuth: true,
    title: "活动券管理",
    icon: "gift"
  },
  {
    route_name: "o2oManage.activityCouponEdit",
    path: baseRoute + "/o2oManage/activityCouponEdit",
    loginRequired: true,
    moduleAuth: false,
    title: "活动券编辑"
  },
  {
    route_name: "o2oManage.activityCouponOrderManage",
    path: baseRoute + "/o2oManage/activityCouponOrderManage",
    loginRequired: true,
    moduleAuth: true,
    title: "活动券订单",
    icon: "unordered-list"
  }   
]

const getRouterConfig = (routerConfigArr) => {
  let config = {};
  routerConfigArr.forEach((item, i) => {
    if (item && item.route_name) {
      let k = item.route_name;
      config[k] = { ...item, sort: i };
    }
  })
  return config;
}
const routerConfig = getRouterConfig(routerConfigArr);

export {
  baseRoute,
  routerConfig
}



