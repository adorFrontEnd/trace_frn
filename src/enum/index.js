const deviceStatusEnum = [
  {
    id: "0", name: "可使用"
  },
  {
    id: "1", name: "使用中"
  },
  {
    id: "2", name: "维修中"
  },
  {
    id: "3", name: "已锁定"
  },
  {
    id: "4", name: "已出售"
  }
]

const workOrderStatusEnum ={
  '-1':"作废",
  '0':"未确认（客服）",
  '1':"未确认（运维）",
  '2':"未指派",
  '3':"进行中（正常）",
  '4':"进行中（将超时）",
  '5':"进行中（已超时）",
  '6':"已完成"
}

export {
  deviceStatusEnum,
  workOrderStatusEnum
}