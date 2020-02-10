import { baseRoute, routerConfig } from '../config/router.config';

const getRouter = (data, total) => {

  if (!data) {
    return;
  }
  data = total ? getTotalRouterData(data) : routeLevel2Filter(data);
  let routeParent = {};
  let router = [];
  for (let i = 0; i < data.length; i++) {
    let item = data[i];
    if (!item || !routerConfig[item] || !routerConfig[item]["moduleAuth"]) {
      continue;
    }
    let routeInfo = routerConfig[item];
    if (item.indexOf(".") == -1) {
      routeParent[item] = router.length;
      router.push({ "key": item, ...routeInfo })
    } else {
      let arr = item.split(".");
      let parent = arr[0];
      if (!routerConfig[parent]["moduleAuth"]) {
        continue;
      }
      let parentInfo = routerConfig[parent];
      if (!routeParent.hasOwnProperty(parent)) {
        routeParent[parent] = router.length;
        router.push({ "key": parent, children: [], ...parentInfo })
      }
      let index = routeParent[parent];
      if (router[index]["children"]) {
        router[index]["children"].push({ "key": item, ...routeInfo })
      }

    }
  }
  return sortRouter(router)
}

const getAllRouter = (data) => {
  if (!data) {
    return;
  }
  let routeParent = {};
  let router = [];
  for (let i = 0; i < data.length; i++) {
    let item = data[i];
    if (!item || !routerConfig[item]) {
      continue;
    }
    let routeInfo = routerConfig[item];
    if (item.indexOf(".") == -1) {
      routeParent[item] = router.length;
      router.push({ "key": item, "children": [], ...routeInfo })
    } else {
      let arr = item.split(".");
      let parent = arr[0];
      let parentInfo = routerConfig[parent];
      if (!routeParent.hasOwnProperty(parent)) {
        routeParent[parent] = router.length;
        router.push({ "key": parent, "children": [], ...parentInfo })
      }
      let index = routeParent[parent];
      if (router[index]["children"]) {
        router[index]["children"].push({ "key": item, ...routeInfo })
      }
    }
  }
  return sortRouter(router)
}

const getTotalRouterData = (data) => {
  let configkeysArr = Object.keys(routerConfig);
  let resultArr = [];
  data.forEach(item => {
    let route = item + '.';
    let routeArr = configkeysArr.filter(i => i.indexOf(route) != -1);
    if (item == 'dataStatistics') {
      routeArr = ['dataStatistics'];
    }
    resultArr = resultArr.concat(routeArr);
  })
  let result = resultArr.filter(i => i.indexOf('.') != -1 || i == 'dataStatistics');
  return result
}

const routeLevel2Filter = (data) => {
  let result = data.filter(item => item.indexOf('.') != -1 || item == 'dataStatistics');
  return result;
}

const sortRouter = (data) => {
  let arr = data.map(item => {
    if (item && item.children) {
      return {
        ...item,
        children: item.children.sort((a, b) => parseInt(a.sort) - parseInt(b.sort))
      }
    } else {
      return item
    }
  })
  return arr.sort((a, b) => parseInt(a.sort) - parseInt(b.sort))
}
export { getRouter, getAllRouter };



