import wxRequest from './wxRequest'
import wxApi from './wxApi'
import config from './config'

function time_To_hhmmss(seconds) {
  var hh;
  var mm;
  var ss;
  if (seconds == null || seconds <= 0) {
    return "00:00:00";
  }
  hh = seconds / 3600 | 0;
  seconds = parseInt(seconds) - hh * 3600;
  if (parseInt(hh) < 10) {
    hh = "0" + hh;
  }
  mm = seconds / 60 | 0;
  ss = parseInt(seconds) - mm * 60;
  if (parseInt(mm) < 10) {
    mm = "0" + mm;
  }
  if (ss < 10) {
    ss = "0" + ss;
  }
  return hh + ":" + mm + ":" + ss;
}
function formatDate(value) {
  let date = new Date(value);
  let y = date.getFullYear();
  let MM = date.getMonth() + 1;
  MM = MM < 10 ? ('0' + MM) : MM;
  let d = date.getDate();
  d = d < 10 ? ('0' + d) : d;
  let h = date.getHours();
  h = h < 10 ? ('0' + h) : h;
  let m = date.getMinutes();
  m = m < 10 ? ('0' + m) : m;
  let s = date.getSeconds();
  s = s < 10 ? ('0' + s) : s;
  return y + '-' + MM + '-' + d + ' ' + h + ':' + m + ':' + s;
}
function getToken(page, jsonObj) {
  let that = this;
  var wxGetSetting = wxApi.wxGetSetting()
  var wxGetUserInfo = wxApi.wxGetUserInfo()
  var wxLogin = wxApi.wxLogin()
  var token = wx.getStorageSync('token');
  //设置token 过期时间
  var timestamp = Date.parse(new Date()) / 1000;
  var expiration = wx.getStorageSync('index_data_expiration');
  var isAuto = wx.getStorageSync('isAuto');
  if (!token || expiration < timestamp || !isAuto) {
    var code;
    return wxLogin().then(res => {
      // 发送 res.code 到后台换取 openId, sessionKey, unionId
      code = res.code
      return wxGetSetting()
    }).then(res => {
      // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
      if (res.authSetting['scope.userInfo']) {
        wxGetUserInfo().then(res => {
          wx.setStorageSync("userInfo", res.userInfo)
          var url = config.getUrl.login;
          var params = {
            "code": code,
            "type": 6,
            "rawData": JSON.stringify(res.userInfo),
            "encryptedData": res.encryptedData,
            "iv": res.iv
          }
          return wxRequest.postRequest(url, params)
        }).then(res => {
          var timestamp = Date.parse(new Date()) / 1000;
          var expiration = timestamp + 777600; //过期时间 9天
          wx.setStorageSync("index_data_expiration", expiration)
          wx.setStorageSync("token", res.header.token)
          wx.setStorageSync("uid", res.data.data.id)
          wx.setStorageSync("isAuto", false);
          wx.setStorageSync("selfImToken", res.data.data.selfImToken);
          wx.setStorageSync("nickname", res.data.data.nickname);
          wx.setStorageSync("level", res.data.data.level);
          wx.setStorageSync("avatar", res.data.data.headPortraitUrl);
          if (page == 'index') {
            console.log(jsonObj)
            wx.redirectTo({
              url: '../index/index?jsonObj=' + jsonObj
            })
          } else if(page == 'room'){
            wx.redirectTo({
              url: '../roomdetail/roomdetail?jsonObj=' + jsonObj
            })
          }
        })
      } else {
        wx.redirectTo({
          url: '../auth/auth?fromPage=' + page + '&jsonObj=' + jsonObj
        })
      }
    })
  } else {
    wx.redirectTo({
      url: '../auth/auth?fromPage=' + page + '&jsonObj=' + jsonObj
    })
  }
}
let LiveRoomFactory = {
  MESSAGE_TYPE: {

    //直播间广播消息
    /**
     * 进入直播间通知
     */
    'TP_ADD': 101,
    /**
     * 退出直播间通知
     */
    "TP_OUT": 102,
    /**
     * 直播主动结束通知
     */
    "TP_HOST_CLOSE_ROOM": 103, //这个消息类型了没用了,不由主播发结束IM，由sdk的systemMsg收。为避免以后不用腾讯云改用其他sdk或自己实现，这里先留着不删除
    /**
     * 直播异常结束通知
     */
    "TP_HOST_EXCEPTION_CLOSE_ROOM": 104,
    /**
     * 开始直播
     */
    "TP_LIVE_START": 105,

    // 群聊消息200开头
    /**
     * 聊天纯文本
     */
    "TP_TXT": 200,
    /**
     * 普通点赞
     */
    "TP_PRAISE": 210,

    /**
     * 首次点赞
     */
    "TP_FIRST_LIKE": 211,

    /**
     * 礼物
     */
    "TP_GIFT": 220,


    /**
     * 直播内关注
     */
    "TP_FOLLOW": 230,

    /**
     * 主播发图
     */
    "TP_IMG": 300,

    /**
     * 无图消息     主播删除空了背景图或删除了当前显示的背景图告诉观众GONE掉背景图显示头像
     */
    "TP_IMG_NONE": 301,

    /************************************  连麦相关消息定义 500开头 start  **************************************/
    //观众发的连麦消息  510 和 520字段
    /**
     * 观众首次进入房间，问主播要当前请求连麦人数
     */
    "TP_VIEWER_REQUEST_MIC_COUNT": 510,
    /**
     * 观众申请连麦
     */
    "TP_VIEWER_REQUEST_MIC": 511,
    /**
     * 观众取消连麦
     */
    "TP_VIEWER_CANCEL_MIC": 512,

    /**
     * 观众连麦成功
     */
    "TP_VIEWER_CONNECT_MIC_SUCCESS": 513,
    /**
     * 观众静音
     */
    "TP_VIEWER_MUTE": 514,
    /**
     * 观众挂断
     */
    "TP_VIEWER_HANG_UP": 515,

    //主播发的连麦消息  530 和 540字段
    /**
     * 主播同意连麦
     */
    "TP_HOST_CONFIRM_MIC": 530,
    /**
     * 主播取消连麦,踢人
     */
    "TP_HOST_HANGUP_MIC": 531,

    /**
     * 主播主动推 当前请求连麦人数
     */
    "TP_HOST_PUSH_REQUEST_COUNT": 533,

    /**
     * 正在说话
     */
    "TP_SPEEKING": 550,

    /**
     * 连麦异常
     */
    "TP_CONNECT_MIC_EXCEPTION": 580,

    /**
     * 提问成功
     */
    "TP_QUESTION_PAY_SUCCESS": 241
  },

  /**
   * 聊天纯文本
   */
  getSendMsgDataJson: function(uid, nickName, content, mylevel) {
    var msg = {};
    msg.t = LiveRoomFactory.MESSAGE_TYPE.TP_TXT;
    msg.u = uid;
    msg.c = content;
    msg.n = nickName;
    msg.l = mylevel;
    return msg;
  },

  /**
   * 点赞推送
   *
   * @param i
   * @return
   */
  getSendPraiseDataJson: function(uid, nickName, isFirst) {
    var msg = {};
    msg.t = LiveRoomFactory.MESSAGE_TYPE.TP_PRAISE;
    if (isFirst) {
      msg.t = LiveRoomFactory.MESSAGE_TYPE.TP_FIRST_LIKE;
    }
    msg.u = uid;
    msg.n = nickName;
    return msg;
  },

  /**
   * 进房间消息
   *
   * @param i
   * @return
   */
  getAddRoomDataJson: function (uid, nickName, mylevel) {
    var msg = {};
    msg.t = LiveRoomFactory.MESSAGE_TYPE.TP_ADD;
    msg.u = uid;
    msg.n = nickName;
    msg.l = mylevel;
    return msg;
  },

  /**
   * 发送礼物
   *
   * @param i
   * @return
   */
  getSendGiftDataJson: function(uid, nickName, avatar, giftName, giftPic, giftPrice, mylevel,id) {
    var msg = {};
    msg.t = LiveRoomFactory.MESSAGE_TYPE.TP_GIFT;
    msg.u = uid;
    msg.a = avatar;
    msg.n = nickName;
    msg.l = mylevel;
    var goods = {};
    goods.name = giftName;
    goods.pic = giftPic;
    goods.price = giftPrice;
    goods.doubleCount = 1; //送礼物数量
    goods.id = id; //送礼物数量
    msg.c = goods;
    return msg;
  },

  /**
   * 竞价提问
   * @param uid
   * @param nickName
   * @param price
   * @returns {{}}
   */
  getQuestionSuccessDataJson: function(uid, nickName, price) {
    var msg = {};
    msg.t = LiveRoomFactory.MESSAGE_TYPE.TP_QUESTION_PAY_SUCCESS;
    msg.u = uid;
    msg.c = price;
    msg.n = nickName;
    return msg;
  }
}
module.exports = {
  getToken: getToken,
  LiveRoomFactory: LiveRoomFactory,
  time_To_hhmmss: time_To_hhmmss,
  formatDate: formatDate
}