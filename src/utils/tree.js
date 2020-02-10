const parseTree = (treeList, isReturnArr) => {
  if (!treeList || !treeList.length) {
    return []
  }
  // id: 1, name: "ceshi1", remark: "333333", parentId: 0, sort: 1
  let treeMap = {};
  for (let i = 0; i < treeList.length; i++) {
    let item = treeList[i];

    if (!item || (!item.id && item.id != 0)) {
      continue;
    }

    if (item.parentId == 0) {
      treeMap[item.id] = { index: i, children: {}, ...item };
    } else {
      let parentId = item.parentId;
      let id = item.id;
      let parentObj = findParentItemById(parentId, treeMap);
      let parent = parentObj.result;
      let hasChildren = parentObj.hasChildren;
      let index = parent['index'];
      let length = Object.keys(parent['children']).length;
      let child = { index: length, ...item };
      parent['children'][id] = parentObj.hasChildren ? { ...child, children: {} } : child;
    }
  }
  return isReturnArr ? treeMapToArr(treeMap) : treeMap;
}

const treeMapItemToArr = (treeMap) => {
  let treeArr = Object.values(treeMap).sort((a, b) => a.index - b.index);
  return treeArr
}

const treeMapToArr = (treeMap) => {
  let arr = treeMapItemToArr(treeMap);
  arr.forEach(item => {
    if (item.children) {
      item.children = treeMapItemToArr(item.children);
      item.children.forEach(subItem => {
        if (subItem.children) {
          subItem.children = treeMapItemToArr(subItem.children);
        }
      })
    }
  })
  return arr
}

const findParentItemById = (id, treeMap) => {
  if (id == 0) {
    return
  }
  for (let item in treeMap) {
    if (item == id) {
      let result = treeMap[item];
      return {
        hasChildren: true,
        result
      };
    }

    if (treeMap[item] && treeMap[item]['children']) {
      for (let subItem in treeMap[item]['children']) {
        if (subItem == id) {
          let result = treeMap[item]['children'][subItem];
          return {
            hasChildren: false,
            result
          };
        }
      }
    }
  }
}


export {
  parseTree
}