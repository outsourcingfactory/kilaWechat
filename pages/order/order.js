// pages/order/order.js
import wxRequest from '../../utils/wxRequest'
import config from '../../utils/config'

Page({

  /**
   * 页面的初始数据
   */
  data: {
    goodList:[],
    chooseIndex:0,
    nickname:'',
    avatar:'',
    token:'',
    boUser: {}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let nickname = wx.getStorageSync('nickname');
    let avatar = wx.getStorageSync('avatar');
    let token = wx.getStorageSync('token');
    let uid = wx.getStorageSync('uid');
    this.setData({
      nickname: nickname,
      avatar: avatar,
      token: token,
      uid: uid
    })
    this.getGoodlist();
    this.getboUserFun();
  },
  // 获取主播个人信息
  getboUserFun: function () {
    var url = config.getUrl.getHongdouUser;
    var params = {
      uid: this.data.uid
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
        console.log(this.data.boUser);
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
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

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

  },
  /**
   * 切换
   */
  getChoose:function(e){
    let index = e.currentTarget.dataset.index;
    this.setData({
      chooseIndex:index
    })
  },
  /**
   * 提交订单
   */
  goOrder:function(){

  },
  /**
   * 获取充值列表
   */
  getGoodlist: function () {
    var url = config.getUrl.getGoodsList;
    var params = {}
    var header = {
      'token': this.data.token
    }
    return wxRequest.getRequest(url, params, header).then(res => {
      if (res.data.code == 200) {
        console.log(res.data);
        this.setData({
          goodList: res.data.data.body.b.list
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
  goOrder:function(){
    var url = config.getUrl.rechargeMoney;
    var params = {
      orderType:1,
      goodsId: this.data.goodList[this.data.chooseIndex].id,
    }
    var header = {
      'token': this.data.token
    }
    return wxRequest.postRequest(url, params, header).then(res => {
      console.log(res.data)
      if (res.data.code == 200) {
        wx.requestPayment({
          timeStamp: res.data.data.payParams.timeStamp,
          nonceStr: res.data.data.payParams.nonceStr,
          package: res.data.data.payParams.package,
          signType: res.data.data.payParams.signType,
          paySign: res.data.data.payParams.paySign,
          success(res1) {
            console.log(res1);
            // 支付成功
            if (res1.errMsg == "requestPayment:ok"){
              wx.showToast({
                title: '充值成功',
                icon: 'none',
                duration: 2000,
                success(res){
                  wx.navigateBack({
                    delta: 1
                  })
                }
              })
            } else{
              wx.showToast({
                title: '您取消了订单，充值失败',
                icon: 'none',
                duration: 1500,
              })
            }
            // else if(res1.errMsg == "requestPayment:fail cancel"){}
          },
          fail(res1){
            console.log(res1)
          }
        })
      } else {
        wx.showToast({
          title: res.data.msg,
          icon: 'none',
          duration: 1500,
        })
      }
    })
  }
})