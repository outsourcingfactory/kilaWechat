// pages/roomdetail/roomdetail.js
import wxRequest from '../../utils/wxRequest'
import wxApi from '../../utils/wxApi'
import config from '../../utils/config'
const io = require('../../utils/weapp.socket.io.js');
import getToken from '../../utils/util'
import {
  LiveRoomFactory,
  formatDate
} from '../../utils/util';
let app = getApp();
let isIphoneX = app.globalData.isIphoneX;
let socket;
const animation = wx.createAnimation({
  duration: 3000,
  timingFunction: 'linear',
})
Page({
  /**
   * 页面的初始数据
   */
  data: {
    roomid: '',
    roomDetail: {},
    showModal: false,
    shouGoList: false,
    showUserCard: false,
    showEndCard: false,
    goDownCard: false,
    showBottom: false,
    showAdd: true,
    dataList: [],
    messageData:[],
    giftDataList: [],
    getGoRoomPeople: [],
    token: '',
    gold: '',
    rankList: [],
    sendWrite: '',
    nickname: '',
    mylevel: '',
    animationData: {},
    animationDataGoInNormal: {}, //普通入场动画
    animationDataGift: {},
    showGift: true,
    avatar: '',
    chooseGiftIndex: 1,
    isForbid: false, // 没有被禁言
    giftList: '', //送礼物的列表
    mangoinList: [], //用户进入直播间列表
    isIphoneX: false,
    viewheight: '',
    isFollow: false,
    boUser: {},
    windowHeight: '',
    windowWidth: '',
    isVip: false,
    shareTitle: '',
    shareDesc: '',
    shareImage: '',
    platform: '',
    rankResultNum: '',
    bottom: 12,
    // gofoucus: false,
    searchinput: '说点什么..',
    downTips: '与主播连麦互动',
    showshare: '',
    diamond: '',  //左上角钻石
    watchNum: '',  //观看人数
    bigGift: '',
    funcType: 7, //直播间类型 7是虚拟直播间
    roomscheme: '',  //直播间schmeme
    roomNoOpen: false,
    boTime: '',
    roomMoney: false,  //付费直播间
    roomStatus: '',
    cursor:0,
    step:0,
    currentTime:0,
    canGetMessage:true   //是否可以拉取数据开关
  },
  launchAppError(e) {
    console.log(e.detail.errMsg);
    if (e.detail.errMsg == 'invalid scene') {
      wx.navigateTo({
        url: '../goshare/goshare'
      })
    }
  },
  // 跳转首页
  goList: function () {
    wx.reLaunch({
      url: '../index/index'
    })
  },
  goshare: function () {
    wx.navigateTo({
      url: '../goshare/goshare'
    })
  },
  
  // 获取主播个人信息
  getboUserFun: function () {
    var url = config.getUrl.getHongdouUser;
    var params = {
      uid: this.data.roomDetail.userInfo.id
    }
    var header = {
      'token': this.data.token
    }
    return wxRequest.postRequest(url, params, header).then(res => {
      console.log(res.data)
      if (res.data.code == 200) {
        this.setData({
          boUser: res.data.data.b
        })
      } else {
        wx.showToast({
          title: res.data.msg,
          icon: 'none',
          duration: 1500,
        })
      }
    })
  },
  // 判断是否关注
  isFollowFun: function () {
    var url = config.getUrl.isFollow;
    var params = {
      fromUid: this.data.uid,
      toUid: this.data.roomDetail.userInfo.id
    }
    var header = {
      'token': this.data.token
    }
    return wxRequest.postRequest(url, params, header).then(res => {
      console.log(res.data)
      if (res.data.code == 200) {
        this.setData({
          isFollow: res.data.data.b.isFollow
        })
        console.log(this.data.isFollow);
      } else {
        wx.showToast({
          title: res.data.msg,
          icon: 'none',
          duration: 1500,
        })
      }
    })
  },
  // 进入直播间动画结束回调
  animationend: function (e) {
    var getGoRoomPeople = this.curtail(this.data.getGoRoomPeople);
    this.setData({
      getGoRoomPeople: getGoRoomPeople
    })
  },
  // 礼物动画回调
  animationendgift: function () {
    var giftList = this.curtail(this.data.giftList);
    this.setData({
      giftList: giftList
    })
    console.log(this.data.giftList)
  },
  animationendBiggift: function () {
    this.setData({
      bigGift: ''
    })
  },
  getloadToast: function (e) {
    if (e.currentTarget.dataset.indextype == 1) {
      this.setData({
        downTips: '与主播连麦互动'
      })
    } else if (e.currentTarget.dataset.indextype == 2) {
      this.setData({
        downTips: '向主播发起提问'
      })
    } else if (e.currentTarget.dataset.indextype == 3) {
      this.setData({
        downTips: '体验更多礼物'
      })
    } else {
      this.setData({
        downTips: '体验克拉红包'
      })
    }
    this.setData({
      showModal: true,
      goDownCard: true,
    })
  },
  getloadToastNum: function (num) {
    if (num == 1) {
      this.setData({
        downTips: '与主播连麦互动'
      })
    } else if (num == 2) {
      this.setData({
        downTips: '向主播发起提问'
      })
    } else if (num == 3) {
      this.setData({
        downTips: '体验更多礼物'
      })
    } else {
      this.setData({
        downTips: '体验克拉红包'
      })
    }
    this.setData({
      showModal: true,
      goDownCard: true,
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this;
    this.setData({
      roomid: options.roomid || '1236353705616343105',
      //1237493259224219696 视频直播间
      // 1223639129246400575 虚拟直播间
      // 1237555201242562793 普通直播间
      // roomid:'1223639129246400575'
    })
    // 不存在roomid的处理逻辑
    if (!this.data.roomid) {
      this.goList()
    }
    this.setData({
      isIphoneX: isIphoneX,
      roomscheme: 'uxinlive://live?roomid=' + this.data.roomid + '&roomId=' + this.data.roomid
    })
    if (this.data.isIphoneX) {
      this.setData({
        bottom: 34
      })
    }
    let token = wx.getStorageSync('token');
    let uid = wx.getStorageSync('uid');
    let nickname = wx.getStorageSync('nickname');
    let level = wx.getStorageSync('level');
    let avatar = wx.getStorageSync('avatar');
    let wxGetSystemInfo = wxApi.wxGetSystemInfo();
    this.setData({
      token: token,
      uid: uid,
      nickname: nickname,
      mylevel: level,
      avatar: avatar
    });
    wxGetSystemInfo().then(res => {
      console.log(res)
      that.setData({
        windowHeight: res.windowHeight,
        windowWidth: res.windowWidth,
        platform: res.platform,
      })
    })
    this.getRoomDetail();
    this.getRoomMessage(parseInt(this.data.currentTime/1000)*1000);
    this.getDou();
    this.getRank();
  },

  /**
   * 获取直播间消息
   */
  getRoomMessage: function (time) {
    if (!this.data.canGetMessage){
      return
    }
    this.setData({
      canGetMessage:false
    })
    var url = 'https://hongrenshuo.com.cn/api/v11/message/readMsg';
    var params = {
      cursor: time,
      roomId:this.data.roomid,
      bizType:260,
      pageSize:2
    }
    var header = {
      
    }
    return wxRequest.getRequest(url, params, header).then(res => {
      console.log(res.data);
      if(res.data.h.code == 200){
        var messDataGet = res.data.b.data;
        for (var i = 0; i < messDataGet.length; i++) {
          messDataGet[i].content = JSON.parse(messDataGet[i].content);
        }
        this.setData({
          messageData: this.data.messageData.concat(messDataGet),
          canGetMessage:true
        })
        console.log(this.data.messageData)
      }else{
        wx.showToast({
          title: res.data.h.msg,
          icon: 'none',
          duration: 1500,
        })
      }
    })
  },
  /**
   * 直播间进度变化
   */
  bindtimeupdate:function(e){
    this.setData({
      currentTime: e.detail.currentTime * 1000
    })
    // 队列中小于10条 加载新数据
    if (this.data.messageData.length < 10) {
      this.getRoomMessage(parseInt(this.data.currentTime / 1000) * 1000);
    }
    // 弹幕消息大于400条清除一般
    if (this.data.dataList.length > 400) {
      this.data.dataList.splice(0, 200);
    }
    if (this.data.currentTime > this.data.messageData[0].relativeTime){
      console.log(this.data.messageData);
      for (var i = 0; i < this.data.messageData.length; i++) {
        // && e.detail.currentTime * 1000 < this.data.messageData[i + 1].relativeTime
        if (this.data.currentTime > this.data.messageData[i].relativeTime) {
          // 将符合时间段内的数据push进去  并删除掉队列中的数据
          var arrayObject = this.data.messageData.slice(0, i + 1);
          this.data.messageData.splice(0, i + 1);
          this.setData({
            dataList: this.data.dataList.concat(arrayObject),
            messageData: this.data.messageData,
          })
          // 踢进去礼物数据
          if (this.data.messageData[i].bizType && this.data.messageData[i].bizType == 256) {
            this.setData({
              giftList: '',
              bigGift: ''
            })
            var content = this.data.messageData[i].content;
            // 动效礼物区分
            if (content.c.id == 1026 || content.c.id == 15434 || content.c.id == 15467 || content.c.id == 1065 || content.c.id == 72 || content.c.id == 73) {
              this.setData({
                bigGift: content
              })
            } else {
              this.setData({
                giftList: content
              })
            }
          }
          console.log(this.data.dataList);
          console.log(this.data.messageData);
        }
      }
    }
  },
  bindplay:function(){

  },
  bindended:function(){
    this.setData({
      shouGoList: true,
      showEndCard: true,
      canGetMessage:false
    })
  },
  /**
   * 关闭礼物弹窗
   */
  closeGift: function () {
    this.setData({
      // gofoucus:false,
      showBottom: false,
    })
  },
  /**
   * 获取主播红豆
   */
  getDou: function () {
    var url = config.getUrl.getLoginUserGold;
    var params = {}
    var header = {
      'token': this.data.token,
    }
    return wxRequest.getRequest(url, params, header).then(res => {
      if (res.data.code == 200) {
        console.log(res.data);
        this.setData({
          gold: res.data.data.gold
        })
      } else {
        wx.showToast({
          title: res.data.msg,
          icon: 'none',
          duration: 1500,
        })
      }
    })
  },
  /**
   * 获取PK等守护榜信息
   */
  getRank: function () {
    var url = config.getUrl.getRankPkData;
    var params = {
      roomId: this.data.roomid
    }
    var header = {
      'token': this.data.token,
    }
    return wxRequest.getRequest(url, params, header).then(res => {
      if (res.data.code == 200) {
        this.setData({
          rankList: res.data.data.rankList.data,
          rankResultNum: res.data.data.rankResult.rank,
          diamond: res.data.data.rankResult.diamond,
          watchNum: res.data.data.audienceCount.watchNumber,
        })
      } else {
        wx.showToast({
          title: res.data.msg,
          icon: 'none',
          duration: 1500,
        })
      }
    })
  },
  curtail: function (arr) {
    var m = arr.slice(0);
    m.shift();
    return m;
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {    
    this.getRoomDetail();
    this.getDou();
  },
  getBigGift: function () {
    this.animation = animation
    animation.translate(0, 80).step({
      duration: 500
    })
    animation.translate(0, 40).step({
      duration: 700
    })
    animation.translate(0, 80).step({
      duration: 700
    })
    animation.translate(0, 40).step({
      duration: 700
    })
    animation.translate(0, 80).step({
      duration: 700
    })
    animation.translate(0, 700).step({
      duration: 700
    })
    this.setData({
      animationData: animation.export()
    })
  },
  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
   
  },
  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    
  },
  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },
  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    let userInfo = wx.getStorageSync('userInfo');
    return {
      title: this.data.roomDetail.title,
      path: '/pages/index/index?type=room&roomid=' + this.data.roomid,
      imageUrl: this.data.roomDetail.backPic
    }
  },
  /**
   * 展示等级卡
   */
  showHeadCard: function () {
    this.setData({
      showModal: true,
      showUserCard: true
    })
  },
  /**
   * 点击资料
   */
  getZiLiao: function () {
    this.setData({
      showBottom: false,
      showModal: true,
      showUserCard: true,
    })
  },
  /**
   * 关闭按钮
   */
  closeCard: function () {
    this.setData({
      showModal: false,
      shouGoList: false,
      showUserCard: false,
      showEndCard: false,
      goDownCard: false,
    })
  },
  /**
   * 点击关注
   */
  goAdd: function () {
    if (this.data.isFollow) {
      var url = config.getUrl.unFollow;
    } else {
      var url = config.getUrl.addFollow;
    }
    var params = {
      fromUid: this.data.uid,
      toUid: this.data.roomDetail.userInfo.id
    }
    var header = {
      'token': this.data.token
    }
    return wxRequest.postRequest(url, params, header).then(res => {
      console.log(res.data)
      if (res.data.code == 200) {
        if (res.data.data.body.h.code == 200) {
          this.setData({
            isFollow: !this.data.isFollow
          })
        }
      } else {
        wx.showToast({
          title: res.data.msg,
          icon: 'none',
          duration: 1500,
        })
      }
    })
  },
  /**
   * 跳转充值
   */
  goBottomShow: function () {
    this.setData({
      // gofoucus:false,
      showBottom: true
    })
  },
  goOrder: function () {
    wx.navigateTo({
      url: '../order/order'
    })
  },
  /**
   * 获取礼物列表
   */
  getGiftList: function () {
    var url = config.getUrl.getGoodsList;
    var params = {
      'type': 1,
      'roomId': this.data.roomid,
      'anchorId': this.data.roomDetail.userInfo.id
    }
    var header = {
      'token': this.data.token,
    }
    return wxRequest.getRequest(url, params, header).then(res => {
      if (res.data.code == 200) {
        // 重新组装礼物数据
        var list = res.data.data.body.b.list;
        // 删除数组的最后一个
        list.pop();
        // 第一个添加礼物
        list.unshift({
          'id': -1,
          'name': '攒人气',
          'pic': 'https://img.hongrenshuo.com.cn/h5/livebroad-giftone-ymz.png'
        });
        // list = this.sliceArr(list, 8);
        this.setData({
          giftDataList: list
        })
        console.log(this.data.giftDataList);
      } else {
        wx.showToast({
          title: res.data.msg,
          icon: 'none',
          duration: 1500,
        })
      }
    })
  },
  /**
   * 分割数组
   */
  sliceArr: function (array, size) {
    var result = [];
    for (var x = 0; x < Math.ceil(array.length / size); x++) {
      var start = x * size;
      var end = start + size;
      result.push(array.slice(start, end));
    }
    return result;
  },
  /**
   * 获取直播间信息
   */
  getRoomDetail: function () {
    let that = this;
    var url = config.getUrl.getRoomInfo;
    var params = {
      roomId: this.data.roomid
    }
    var header = {
      'token': this.data.token
    }
    return wxRequest.getRequest(url, params, header).then(res => {
      console.log(res.data)
      if (res.data.code == 200) {
        console.log(res.data);
        // 付费直播间
        if (this.data.roomDetail.price > 0) {
          this.setData({
            roomMoney: true
          })
          return
        }
        this.setData({
          roomDetail: res.data.data,
          funcType: res.data.data.funcType,   //虚拟直播间标识
          roomStatus: res.data.data.status // 直播间状态 1 直播前 4 直播中 10 直播正常结束  19 已删除 不在客户端显示
        })
        wx.setNavigationBarTitle({
          title: this.data.roomDetail.title
        })
        // 预告直播间
        if (this.data.roomDetail.status == 1) {
          this.setData({
            roomNoOpen: true,
            boTime: formatDate(this.data.roomDetail.liveStartTime)
          })
          return
        }
        this.getGiftList();
        // 判断是否关注
        this.isFollowFun();
        this.getboUserFun();
        // 获取view高度设置评论框高度
        var query = wx.createSelectorQuery();
        //选择id
        query.select('#mjltest').boundingClientRect(function (rect) {
          if (that.data.funcType == 7) {
            that.setData({
              viewheight: '220px'
            })
          } else {
            that.setData({
              viewheight: (rect.height - 40) + 'px'
            })
          }
        }).exec();
        // 倒计时开始
      } else {
        wx.showToast({
          title: res.data.msg,
          icon: 'none',
          duration: 1500,
        })
      }
    })
  },
  statechange(e) { },
  error(e) { }
})