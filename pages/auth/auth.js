// pages/auth/auth.js
var app = getApp();
import { getToken } from '../../utils/util'
Page({
  /**
   * 页面的初始数据
   */
  data: {
    code:'',
    fromPage:'index',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      fromPage: options.fromPage ? options.fromPage:'',
      uid: options.uid ? options.uid : '',
      jsonObj: options.jsonObj ? options.jsonObj : '',
    })
  },
  // 获取用户信息
  getUser:function(e){
    console.log(e);
    wx.setStorageSync("userInfo", e.detail.userInfo)
    if (e.detail.errMsg == 'getUserInfo:fail auth deny'){
      wx.showToast({
        title: '拒绝授权将无法体验完整功能，建议打开用户信息授权',
        icon: 'none',
        duration: 2000
      })
    }else{
      getToken(this.data.fromPage, this.data.jsonObj);
    }
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
  
  }
})