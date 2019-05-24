// pages/roomdetail/roomdetail.js
import wxRequest from '../../utils/wxRequest'
import wxApi from '../../utils/wxApi'
import config from '../../utils/config'
const io = require('../../utils/weapp.socket.io.js');
import getToken from '../../utils/util'
import {
  LiveRoomFactory,
  time_To_hhmmss,
  formatDate
} from '../../utils/util';
let app = getApp();
let isIphoneX = app.globalData.isIphoneX;
let Timer;
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
    liveWidth: 662,
    liveHeight: 374,
    showAdd: true,
    dataList: [],
    giftDataList: [],
    getGoRoomPeople: [],
    token: '',
    selfImToken: '',
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
    chaTime: '00:00:00',
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
    showshare:'',
    diamond:'',  //左上角钻石
    watchNum:'',  //观看人数
    oneMan:false,  //是一个人
    inputFocus:false,
    bigGift:'',
    funcType:'', //直播间类型 7是虚拟直播间
    roomscheme:'',  //直播间schmeme
    roomNoOpen:false,
    boTime:'',
    roomMoney:false,  //付费直播间
    roomStatus:''
  },
  launchAppError(e) {
    console.log(e.detail.errMsg);
    if (e.detail.errMsg == 'invalid scene'){
      wx.navigateTo({
        url: '../goshare/goshare'
      })
    }
  },
  // 跳转首页
  goList: function() {
    wx.reLaunch({
      url: '../index/index'
    })
  },
  goshare: function() {
    wx.navigateTo({
      url: '../goshare/goshare'
    })
  },
  foucus: function(e) {
    var that = this;
    that.setData({
      bottom: e.detail.height,
      // gofoucus: true
    })
  },
  /**
     * 将焦点给到 input（在真机上不能获取input焦点）
     */
  tapInput:function(){
    if(this.data.inputFocus){
      return
    }
    this.setData({
      //在真机上将焦点给input
      inputFocus: true,
      //初始占位清空
      searchinput: ''
    });
  },
  //失去聚焦
  blur: function(e) {
    var that = this;
    if (this.data.isIphoneX) {
      that.setData({
        bottom: 34,
        // gofoucus: false,
        inputFocus:false,
        searchinput: e.detail.value || '说点什么..'
      })
    } else {
      that.setData({
        bottom: 12,
        // gofoucus: false,
        inputFocus: false,
        searchinput: e.detail.value || '说点什么..'
      })
    }
  },
  // 获取主播个人信息
  getboUserFun: function() {
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
  isFollowFun: function() {
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
  chooseGift: function(e) {
    // this.setData({
    //   gofoucus:false
    // })
    if (e.currentTarget.dataset.index == 0){
      this.getloadToastNum(4);
    }else{
      this.setData({
        chooseGiftIndex: e.currentTarget.dataset.index
      })
    }
  },
  // 进入直播间动画结束回调
  animationend: function(e) {
    var getGoRoomPeople = this.curtail(this.data.getGoRoomPeople);
    this.setData({
      getGoRoomPeople: getGoRoomPeople
    })
  },
  // 礼物动画回调
  animationendgift: function() {
    var giftList = this.curtail(this.data.giftList);
    this.setData({
      giftList: giftList
    })
    console.log(this.data.giftList)
  },
  animationendBiggift:function(){
    this.setData({
      bigGift: ''
    })
  },
  /**
   * 点击发送礼物
   */
  goSendGift: function() {
    let that = this;
    if (this.data.isForbid) {
      wx.showToast({
        title: '你已被拉黑，无法送礼物',
        icon: 'none',
        duration: 1500
      })
      return
    }
    // 红豆不够不能创建
    if (this.data.giftDataList[this.data.chooseGiftIndex].price > this.data.gold){
      wx.showModal({
        title: '提示',
        content: '红豆不足，是否去充值',
        success(res) {
          if (res.confirm) {
            that.goOrder();
          } else if (res.cancel) {
            console.log('用户点击取消')
          }
        }
      })
      return
    }
    //先创建订单
    var url = config.getUrl.createOrder;
    var params = {
      receiveId: this.data.roomDetail.userInfo.id,
      orderType: 2,
      goodsId: this.data.giftDataList[this.data.chooseGiftIndex].id,
      roomId: this.data.roomid
    }
    var header = {
      'token': this.data.token
    }
    return wxRequest.postRequest(url, params, header).then(res => {
      console.log(res.data)
      if (res.data.code == 200) {
        // 发送im消息
        let gift = this.data.giftDataList[this.data.chooseGiftIndex];
        let name = gift.name;
        let pic = gift.pic;
        let price = gift.price;
        let txtMsg = LiveRoomFactory.getSendGiftDataJson(this.data.uid, this.data.nickname, this.data.avatar, name, pic, price, this.data.mylevel, this.data.giftDataList[this.data.chooseGiftIndex].id);
        txtMsg = JSON.stringify(txtMsg);
        var userMessage = this.buildGiftMessage(txtMsg);
        this.postSyncMessage(userMessage);
        this.setData({
          showBottom: false
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
  // 检查是否禁言
  checkUser: function() {
    var url = config.getUrl.checkUser;
    var params = {
      uid: this.data.uid,
      roomId: this.data.roomid
    }
    var header = {
      'token': this.data.token,
    }
    return wxRequest.getRequest(url, params, header).then(res => {
      if (res.data.code == 200) {
        this.setData({
          isForbid: res.data.data.isForbid
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
  getloadToast: function(e) {
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
  getloadToastNum:function(num){
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
  // watch: {
  //   getGoRoomPeople: function (newValue) {
  //     console.log(newValue.length); // name改变时，调用该方法输出新值
  //     // console.log(this.data.dataList);
  //   }
  // },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    let that = this;
    if (options.token) {
      token = options.token;
    } else {
      token = wx.getStorageSync('token');
    }
    // 传的参数到验证页面之后再传回来
    var jsonObj = {
      roomid: options.roomid,
      showshare: options.showshare || ''
    }
    jsonObj = JSON.stringify(jsonObj);
    if (!token) {
      getToken.getToken('room', jsonObj);
      return;
    }
    // 从验证页面跳过来带参数
    if (options.jsonObj){
      var jsonObj = JSON.parse(options.jsonObj);
      this.setData({
        showshare: jsonObj.showshare,
        roomid: jsonObj.roomid
      })
    }else{
      this.setData({
        roomid: options.roomid || '1240803085576568924',
        showshare: options.showshare || '',
        // roomid:'1236353705616343105'
      })
    }
    // 不存在roomid的处理逻辑
    if(!this.data.roomid){
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

    let selfImToken = wx.getStorageSync('selfImToken');
    let token = wx.getStorageSync('token');
    let uid = wx.getStorageSync('uid');
    let nickname = wx.getStorageSync('nickname');
    let level = wx.getStorageSync('level');
    let avatar = wx.getStorageSync('avatar');
    let wxGetSystemInfo = wxApi.wxGetSystemInfo();
    this.setData({
      token: token,
      selfImToken: selfImToken,
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
    this.getRoomDetail(jsonObj);
    this.getDou();
    this.getRank();
    this.checkUser();
    // 拉取直播间之前的30条信息
    this.getLastMessage();
    // socket = io('ws://47.94.56.91:12585/live_chat_room?access_token=' + this.data.selfImToken + '&roomId=' + that.data.roomid, {
    socket = io('wss://wim.hongdoufm.com/live_chat_room?access_token=' + this.data.selfImToken + '&roomId=' + that.data.roomid, {
      'rememberUpgrade': true,
      'transports': ['websocket', 'polling']
    });
    socket.on('connect', function(data) {
      // 链接上之后发送推送 自己进入直播间
      // 进入直播间发送推送
    });
    socket.on('text_message', function(data) {
      let datamm = JSON.parse(data);
      // 下发直播间关闭
      if (datamm.body.response.msg_type == 11 && datamm.body.response.room_info.status == 2) {
        // 直播间关闭
        that.getRoomDetail();
        that.setData({
          shouGoList: true,
          showEndCard: true
        })
        clearInterval(Timer);
        return
      }
      that.inputmessage(datamm.body.response);
    });
    socket.on('connect_error', function(data) {
      let datamm = JSON.parse(data);
      console.log(datamm);
      // 进来发现关闭了直播间
      if (datamm.code == 9111) {
        // that.setData({
        //   shouGoList: true,
        //   showEndCard: true
        // })
        clearInterval(Timer);
      }
    });
    socket.on('disconnect', function(data) {
      socket.disconnect();
    });
  
  },
  // 进来获取前30条聊天数据
  getLastMessage:function(){
    let that = this;
    var url = 'https://hongrenshuo.com.cn/api/v11/message/latest/batch/get';
    var params = {
      roomId: this.data.roomid,
      bizType: 4,
      pageSize: 30,
      pageNo:1
    }
    var header = {

    }
    return wxRequest.getRequest(url, params, header).then(res => {
      console.log(res.data);
      if (res.data.h.code == 200) {
        if (res.data.b.data.length == 0){
          return
        }
        var messDataGet = res.data.b.data;
        var messDataArray = [];
        for (var i = 0; i < messDataGet.length-1; i++) {
          messDataGet[i].content = JSON.parse(messDataGet[i].content);
          messDataArray.push(messDataGet[i].content);
        }
        this.setData({
          dataList: messDataArray
        })
        
        var setNum = setTimeout(function(){
          var dataArray = that.data.dataList;
          dataArray.push(JSON.parse(messDataGet[messDataGet.length - 1].content))
          that.setData({
            dataList: dataArray
          })
          console.log(that.data.dataList);
        },600)
        this.setData({
          dataList: messDataArray
        })
        console.log(this.data.dataList)
      } else {
        wx.showToast({
          title: res.data.h.msg,
          icon: 'none',
          duration: 1500,
        })
      }
    })
  },
  /**
   * 关闭礼物弹窗
   */
  closeGift: function() {
    this.setData({
      // gofoucus:false,
      showBottom: false,
    })
  },
  getinputValue:function(e){
    this.setData({
      searchinput: e.detail.value
    })
  },
  // 点击发送消息
  bindconfirmFun: function(e) {
    console.log(e.detail.value);
    if (e.detail.value == ''){
      wx.showToast({
        title: '输入为空',
        icon: 'none',
        duration: 1500,
      })
      return
    }
    if (this.data.isForbid) {
      wx.showToast({
        title: '你已被拉黑，无法评论',
        icon: 'none',
        duration: 1500,
      })
      this.setData({
        searchinput: ''
      })
      return
    }
    this.setData({
      searchinput: e.detail.value
    })
    let txtMsg = LiveRoomFactory.getSendMsgDataJson(this.data.uid, this.data.nickname, e.detail.value, this.data.mylevel);
    txtMsg = JSON.stringify(txtMsg);
    var userMessage = this.buildUserMessage(txtMsg);
    this.postSyncMessage(userMessage,true);
  },
  buildUserMessage: function(content) {
    var syncMessage = this.buildSyncMessage(9, 4, this.data.roomid, 1, content);
    syncMessage["body"]["operation_type"] = 100; //业务类型 100 为用户自定义消息
    syncMessage["body"]["priority"] = 2; //优先级 1=最高(红包礼物消息)，2=中级(评论/点赞等),3=最低(点赞等) 不传服务端默认是3
    //  syncMessage["body"]["uid_list"] = ["2222058000386"]; //单推/P2P／单聊
    return syncMessage;
  },
  buildGiftMessage: function(content) {
    var syncMessage = this.buildSyncMessage(9, 4, this.data.roomid, 1, content);
    syncMessage["body"]["operation_type"] = 100; //业务类型 100 为用户自定义消息
    syncMessage["body"]["priority"] = 1; //优先级 1=最高(红包礼物消息)，2=中级(评论/点赞等),3=最低(点赞等) 不传服务端默认是3
    return syncMessage;
  },
  // 构造sync协议的消息体
  buildSyncMessage: function(type, proto, roomid, operationType, content) {
    var syncMessage = {
      'header': {
        'access_token': this.data.selfImToken,
        'auxiliaries': {
          'wm': '5091_0008',
          'v_p': 30,
          'from': '1064291010',
          'lang': 0,
          'platform': 1,
          'user_agent': 'Wechat',
          'accept': [0]
        },
        'proto': proto,
        'gdid': '22fc4887d01fa05cff10',
        'type': type,
        'tid': 1234567
      },
      'body': {
        'room_id': roomid,
        'operation_type': operationType,
        'content': content,
        'offset': 0,
        'type': 1
      }
    };
    console.log(syncMessage);
    return syncMessage;
  },
  postSyncMessage: function(message,input) {
    let that = this;
    wx.request({
      url: 'https://uim.hongdoufm.com/wesync',
      // url: 'http://47.94.56.91:38585/wesync',
      data: {
        'data': JSON.stringify(message)
      },
      dataType: "json",
      method: "POST",
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      success(res) {
        console.log(res)
        if(input){
          that.setData({
            searchinput: '说点什么..'
          })
        }
       
        // 刷新红豆
        that.getDou();
      },
      fail(res) {
        console.log(res)
      }
    })
  },
  /**
   * 获取主播红豆
   */
  getDou: function() {
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
  getRank: function() {
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
  /**
   * 页面展示用户发的信息
   */
  inputmessage: function(data) {
    if (data.content) {
      var content = JSON.parse(data.content);
      if (data.content != '') {
        // 普通评论
        if (content.t && content.t == 200) {
          // console.log(content)
          var dataArray = this.data.dataList;
          dataArray.push(content)
          this.setData({
            dataList: dataArray
          })
        }
        // 首次点赞
        if (content.t && content.t == 211) {
          var dataArray = this.data.dataList;
          dataArray.push(content)
          this.setData({
            dataList: dataArray
          })
        }
        // 被拉黑了
        if (content.t && content.t == 600) {
          this.checkUser();
        }
        // 排行榜变化
        if (content.t && content.t == 635) {
          console.log('排行榜发声变化')
          this.getRank();
        }
        // 人数 钻石发生变化
        if (content.t && content.t == 637) {
          this.getRank();
        }
        // 守护榜发声了变化
        if (content.t && content.t == 635) {
          this.getRank();
        }
        //直播内关注
        if (content.t && content.t == 230) {
          var dataArray = this.data.dataList;
          dataArray.push(content)
          this.setData({
            dataList: dataArray
          })
        }
        // 礼物
        if (content.t && content.t == 220) {
          // 大礼物
          //逃之夭夭：1026
          //告白气球：15434
          //梦の契约：15467
          //月华灼灼：1065
          //天空之城：72
          //恶魔之眼：73
          // if (content.c.id == 73 || content.c.id == 72 || content.c.id == 1026 || content.c.id == 1065){
          if (content.c.id == 1026 || content.c.id == 15434 || content.c.id == 15467 || content.c.id == 1065 || content.c.id == 72 || content.c.id == 73) {
            this.setData({
              bigGift: ''
            })
            var bigGift = this.data.bigGift;
            this.setData({
              bigGift: content
            })
            console.log(content);
            // 放到队列
            var dataArray = this.data.dataList;
            dataArray.push(content)
            this.setData({
              dataList: dataArray
            })
          }else{
            // var giftArray = this.data.giftList;
            // 堆积过多先展示第一个
            // if (giftArray.length > 2) {
            //   giftArray.unshift(content);
            // } else {
            //   giftArray.push(content)
            // } 
            this.setData({
              giftList: ''
            })
            this.setData({
              // giftList: giftArray
              giftList: content
            })
            console.log(this.data.giftList);
            if (content.c.isDoubleHit && content.c.doubleCount != 1) {
              return
            }
            var dataArray = this.data.dataList;
            dataArray.push(content)
            this.setData({
              dataList: dataArray
            })
          }
          
        }
        // 进入直播间  101 普通用户  603特权用户
        if (content.t && content.t == 101 || content.t == 603) {
          var dataArray = this.data.getGoRoomPeople;
          // 堆积过多先展示第一个
          if (dataArray.length > 2) {
            dataArray.unshift(content);
          } else {
            dataArray.push(content)
          }
          this.setData({
            getGoRoomPeople: dataArray
          })
        }
        if (content.t && content.t == 220 || content.t == 230 || content.t == 200 || content.t == 211){
          // wx.createSelectorQuery().select('#messageList').boundingClientRect(function (rect) {
          //   console.log(rect.height * 2 + 10000)
          //   // 使页面滚动到底部
          //   wx.pageScrollTo({
          //     scrollTop: rect.height*2+10000,
          //     duration: 500
          //   })
          // }).exec()

          // 删除掉一半的数据
          var dataSplice = this.data.dataList;
          if (this.data.funcType == 7) {
            if (dataSplice.length > 10) {
              dataSplice.splice(0, 6)
            }
          } else {
            if (dataSplice.length > 400) {
              dataSplice.splice(0, 200)
            }
          }
          this.setData({
            dataList: dataSplice
          })
        }
      }
    }
  },
  /**
   * 消费礼物队列
   */
  littGift: function() {
    if (this.data.giftList == 0) {
      return
    }
    //动画效果
    const animation = wx.createAnimation({
      duration: 2000,
      timingFunction: 'linear',
    })
    this.animation = animation
    animation.opacity(0).step({
      duration: 1000
    })
    animation.opacity(1).step({
      duration: 1000
    })
    this.setData({
      animationDataGift: animation.export()
    })
    // 删除数组的第一个元素
    var giftList = this.curtail(this.data.giftList);
    this.setData({
      giftList: giftList
    })
  },
  curtail: function(arr) {
    var m = arr.slice(0);
    m.shift();
    return m;
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    //动画效果
    let that =this;
    socket.on('connect', function (data) {
      // 链接上之后发送推送 自己进入直播间
      // 进入直播间发送推送
      let txtMsg = LiveRoomFactory.getAddRoomDataJson(that.data.uid, that.data.nickname, that.data.mylevel);
      txtMsg = JSON.stringify(txtMsg);
      var userMessage = that.buildUserMessage(txtMsg);
      that.postSyncMessage(userMessage);
    });
    this.getRoomDetail();
    this.getDou();
    // this.getBigGift();
  },
  getBigGift: function() {
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
  onHide: function() {
    clearInterval(Timer);
  },
  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {
    clearInterval(Timer);
    socket.disconnect();
  },
  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },
  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {
    let userInfo = wx.getStorageSync('userInfo');
    return {
      title: this.data.roomDetail.title,
      path: '/pages/index/index?type=room&roomid='+this.data.roomid,
      imageUrl: this.data.roomDetail.backPic
    }
  },
  /**
   * 展示等级卡
   */
  showHeadCard: function() {
    this.setData({
      showModal: true,
      showUserCard: true
    })
  },
  /**
   * 点击资料
   */
  getZiLiao: function() {
    this.setData({
      showBottom: false,
      showModal: true,
      showUserCard: true,
    })
  },
  /**
   * 关闭按钮
   */
  closeCard: function() {
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
  goAdd: function() {
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
  goBottomShow: function() {
    this.setData({
      // gofoucus:false,
      showBottom: true
    })
  },
  goOrder: function() {
    wx.navigateTo({
      url: '../order/order'
    })
  },
  /**
   * 获取礼物列表
   */
  getGiftList: function() {
    
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
  sliceArr: function(array, size) {
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
  getRoomDetail: function (jsonObj) {
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
      if (res.data.code == 1006) {
        getToken.getToken('room', jsonObj);
      }else if (res.data.code == 200) {
        console.log(res.data);
        if (res.data.data.userInfo.id == this.data.uid){
          this.setData({
            oneMan: true,
          })
        }
        // 付费直播间
        if (this.data.roomDetail.price > 0) {
          this.setData({
            roomMoney: true
          })
          return
        }
        // 预告直播间
        if (this.data.roomDetail.status == 1) {
          this.setData({
            roomNoOpen: true,
            boTime: formatDate(this.data.roomDetail.liveStartTime)
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
        this.getGiftList();
        // 判断是否关注
        this.isFollowFun();
        this.getboUserFun();
        // 获取view高度设置评论框高度
        var query = wx.createSelectorQuery();
        //选择id
        query.select('#mjltest').boundingClientRect(function(rect) {
          if (that.data.funcType == 7){
            that.setData({
              viewheight: '220px'
            })
          }else{
            that.setData({
              viewheight: (rect.height - 40) + 'px'
            })
          }
        }).exec();
        // 回放直播间
        if (this.data.roomDetail.status == 10) {
          console.log(this.data.roomStatus);
          this.setData({
            shouGoList: true,
            showEndCard: true
          })
          return
        }
        // 根据时间戳算时间
        var timestamp = Date.parse(new Date());
        var chaTime = timestamp - this.data.roomDetail.createTime;
        chaTime = parseInt(chaTime / 1000)
        this.setData({
          chaTime: time_To_hhmmss(chaTime)
        })
        Timer = setInterval(function () {
          chaTime += 1;
          that.setData({
            chaTime: time_To_hhmmss(chaTime)
          })
        }, 1000)
      } else {
        wx.showToast({
          title: res.data.msg,
          icon: 'none',
          duration: 1500,
        })
      }
    })
  },
  statechange(e) {},
  error(e) {}
})