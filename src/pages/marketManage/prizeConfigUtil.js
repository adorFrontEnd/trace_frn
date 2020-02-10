const isAddProductIdIndexOfProductList = (addProductIds, productList) => {
  if (!productList || !productList.length || !addProductIds || !addProductIds.length) {
    return;
  }
  let prizeConfigIds = productList.map(item => item.id);

  for (let i = 0; i < addProductIds.length; i++) {

    let itemId = addProductIds[i];
    if (prizeConfigIds.indexOf(itemId) != -1) {
      return true;
    }
  }
  return;
}

const getAddProductArr = (arr) => {
  if (!arr || !arr.length) {
    return;
  }
  let result = arr.map(item => {
    let { barCode, details, name, id, image } = item
    return { barCode, details, name, id, image, quantity: 1 }
  })
  return result
}


const formatProductArr = (arr) => {
  if (!arr || !arr.length) {
    return;
  }
  let result = arr.map(item => {
    let { id, quantity } = item;
    return { id, quantity }
  })
  return result;
}

const formatOwnProductArr = (arr, activityId) => {
  if (!arr || !arr.length) {
    return;
  }
  let result = arr.map(item => {
    let { id, image, name } = item;
    let _id = Date.now() + Math.random() * 10000;
    let data = { _id, productId: id, prizeImage: image, prizeName: name, prizeLevel: null, prizeNumber: 1, oddsOfWinning: 0, wonNumber: 0, color: "FFFFF" };
    if (activityId) {
      data.activityId = activityId;
    }
    return data;
  })
  return result;
}

export {
  isAddProductIdIndexOfProductList,
  getAddProductArr,
  formatProductArr,
  formatOwnProductArr
}