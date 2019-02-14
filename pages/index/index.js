//index.js
//获取应用实例
const app = getApp()
import getToken from '../../utils/util'
import wxRequest from '../../utils/wxRequest'
import config from '../../utils/config'
let isIphoneX = app.globalData.isIphoneX;
var token
Page({
  data: {
    hotType: 0, //热门标签 0
    newType: 107, //萌新标签 107
    pageNo: 1,
    genderType: 0, //性别 1-男，2-女，0-全部
    roomList: [],
    canList: true,
    token: '',
    showBottomLogo: false,
    jiArray: false,//数组是奇数
    showModalXuni:false,   //虚拟弹唱
    oneMan: false,  //是一个人
    isIphoneX: false,
    showModalFufei:false
  },
  closeCard:function(){
    this.setData({
      showModalXuni: false,
      oneMan:false,
      showModalFufei:false
    })
  },
  onLoad: function(options) {
    if (options.token) {
      token = options.token;
    } else {
      token = wx.getStorageSync('token');
    }
    if (!token) {
      getToken.getToken('index');
    } else {
      wx.showToast({
        title: '加载中',
        icon: 'loading',
        duration: 10000
      });
      this.getDataList();
    }
    let uid = wx.getStorageSync('uid');
    this.setData({
      uid: uid,
      isIphoneX: isIphoneX
    });
  },
  goshare:function(){
    wx.navigateTo({
      url: '../goshare/goshare'
    })
  },
  onShow: function() {

  },
  onPullDownRefresh: function() {
    this.setData({
      pageNo:1,
      showBottomLogo:false,
      jiArray:false
    })
    this.getDataListPull();
  },
  // 跳转直播间
  goDetail: function(e) {
    var functype = e.currentTarget.dataset.functype;
    var uid = e.currentTarget.dataset.id;
    var price = e.currentTarget.dataset.price;
    // if (functype == 7){
    //   this.setData({
    //     showModalXuni: true,
    //   })
    //   return
    // }
    if (price > 0) {
      this.setData({
        showModalFufei: true,
      })
      return
    }
    if (uid == this.data.uid) {
      this.setData({
        oneMan: true,
      })
      return
    }
    wx.navigateTo({
      url: '../roomdetail/roomdetail?roomid=' + e.currentTarget.dataset.roomid
    })
  },
  getTagColor: function(tagid) {
    return tagid.charAt(tagid.length - 1);
  },
  // 获取列表数据
  getDataListPull: function () {
    this.setData({
      roomList: [],
    })
    var url = config.getUrl.listRoom;
    var params = {
      tag: 0,
      type: this.data.hotType,
      pageNo: 1,
      pageSize: 20,
    }
    var header = {
      'token': token
    }
    return wxRequest.getRequest(url, params, header).then(res => {
      console.log(res.data);
      if (res.data.code == 200) {
        this.setData({
          roomList: res.data.data.data
        })
        console.log(this.data.roomList);
      } else {
        wx.showToast({
          title: res.data.msg,
          icon: 'none',
          duration: 1500,
        })
      }
    })
    .finally(function (res) {
      // 隐藏导航栏加载框
      wx.hideNavigationBarLoading();
      // 停止下拉动作
      wx.stopPullDownRefresh();
    })
  },
  // 获取列表数据
  getDataList: function() {
    var url = config.getUrl.listRoom;
    var params = {
      tag: 0,
      type: this.data.hotType,
      pageNo: this.data.pageNo,
      pageSize: 20,
    }
    var header = {
      'token': token
    }
    return wxRequest.getRequest(url, params, header).then(res => {
        console.log(res.data)
        if(res.data.code == 1006){
          getToken.getToken('index');
        }else if (res.data.code == 200) {
          if (res.data.data.length != 0) {
            this.setData({
              roomList: this.data.roomList.concat(res.data.data.data),
            })
          } else {
            this.setData({
              canList: false,
              showBottomLogo: true
            })
            if (this.data.roomList.length % 2 == 0) {
              this.setData({
                jiArray: false
              })
            }else{
              this.setData({
                jiArray: true
              })
            }
            console.log(this.data.showBottomLogo)
            console.log(this.data.jiArray)
          }
          console.log(this.data.roomList);
        } else {
          wx.showToast({
            title: res.data.msg,
            icon: 'none',
            duration: 1500,
          })
        }
      })
      .finally(function(res) {
        wx.hideToast();
      })
  },
  // 到达底部加载
  onReachBottom: function() {
    if (this.data.canList) {
      this.setData({
        pageNo: this.data.pageNo + 1
      })
      this.getDataList();
    }
  },
  onShareAppMessage: function () {
    return {
      title: '嘘～快来听听是谁在用声音发散魅力？',
      path: '/pages/index/index',
      imageUrl: '../../images/livebroad-wxshare-ymz.png'
    }
  }
})