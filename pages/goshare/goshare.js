// pages/goshare/goshare.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    taokouling:'https://at.umeng.com/onelink/8byiSj'
  },
  copyTBL: function (e) {
    var self = this;
    wx.setClipboardData({
      data: self.data.taokouling,
      success: function (res) {
      }
    });
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

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
    return {
      title: '嘘～快来听听是谁在用声音发散魅力？',
      path: '/pages/index/index',
      imageUrl: '../../images/livebroad-wxshare-ymz.png'
    }
  }
})