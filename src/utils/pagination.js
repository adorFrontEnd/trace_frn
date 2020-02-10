// 分页器
const pagination = (res, callback, sizeCallback, options) => {
  return {
    onChange: (current) => {
      callback && callback(current)
    },
    current: res.currentPage,
    pageSize: res.pageSize,
    total: res.totalNum,
    showTotal: () => `共${res.totalNum}条数据`,
    showQuickJumper: (options && options.showQuickJumper === false) ? false : true,
    showSizeChanger: (options && options.showSizeChanger === false) ? false : true,
    pageSizeOptions: (options && options.pageSizeOptions) || ['10', '20', '40', '50', '100'],
    onShowSizeChange: (current, pageSize) => {
      sizeCallback && sizeCallback(current, pageSize)
    }
  }
}

const infinitePagination = (_res, callback, sizeCallback, options) => {

  let res = formatInfiniteData(_res);
  return {
    onChange: (current) => {
      callback && callback(current)
    },
    current: res.currentPage,
    pageSize: res.pageSize,
    total: res.total,
    showTotal: () => `当前页${res.totalNum}条数据`,
    showQuickJumper: false,
    showSizeChanger: (options && options.showSizeChanger === false) ? false : true,
    pageSizeOptions: (options && options.pageSizeOptions) || ['10', '20', '40', '50', '100'],
    onShowSizeChange: (current, pageSize) => {
      sizeCallback && sizeCallback(current, pageSize)
    }
  }
}

const formatInfiniteData = (res) => {
  if (!res) {
    return {
      total: 0
    };
  }
  let { pageSize, currentPage } = res;
  let _totalNum = (!currentPage || currentPage < 1) ? 0 : parseInt(res.pageSize) * parseInt(res.currentPage - 1) + res.totalNum;
  let total = 0;
  let addNum = res.totalNum == pageSize ? 1 : 0;
  if (parseInt(currentPage) == 1) {
    total = res.totalNum + addNum
  } else if (parseInt(currentPage) > 1) {
    total = parseInt(res.pageSize) * parseInt(res.currentPage) + addNum
  }

  return {
    ...res, pageSize, currentPage, _totalNum, total
  }
}

export {
  pagination,
  infinitePagination
}