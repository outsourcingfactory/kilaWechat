//const apiUrl = 'https://h5api.hongdoulive.com';
const apiUrl = 'https://h5api.hongdoulive.com';
let getUrl = {
  login: `${apiUrl}/user/login`,   //登录接口 
  listRoom: `${apiUrl}/live_Room/listRoom`, //获取首页热门数据
  getRoomInfo: `${apiUrl}/live_Room/getRoomInfo`, //获取直播间数据
  getGoodsList: `${apiUrl}/live_Room/getGoodsList`, //充值列表
  createOrder: `${apiUrl}/live_Room/createOrder`, //创建订单
  getLoginUserGold: `${apiUrl}/live_Room/getLoginUserGold`, //获取当前用户红豆
  getRankPkData: `${apiUrl}/live_Room/getRankPkData`, //获取PK等守护榜信息
  checkUser: `${apiUrl}/live_Room/checkUser`,    //检查用户是否被禁言
  isFollow: `${apiUrl}/live_Room/isFollow`,    //检查是否关注
  addFollow: `${apiUrl}/live_Room/addFollow`,    //去关注
  unFollow: `${apiUrl}/live_Room/unFollow`,    //取消关注
  getHongdouUser: `${apiUrl}/live_Room/getHongdouUser`,    //获取个人信息
  rechargeMoney: `${apiUrl}/live_Room/rechargeMoney`,    //充值
}
module.exports = {
  getUrl: getUrl
}