var Promise = require('../plugins/es6-promise.js')

function wxPromisify(fn) {
  return function (obj = {}) {
    return new Promise((resolve, reject) => {
      obj.success = function (res) {
        //成功
        resolve(res)
      }
      obj.fail = function (res) {
        //失败
        reject(res)
      }
      fn(obj)
    })
  }
}
//无论promise对象最后状态如何都会执行
Promise.prototype.finally = function (callback) {
  let P = this.constructor;
  return this.then(
    value => P.resolve(callback()).then(() => value),
    reason => P.resolve(callback()).then(() => { throw reason })
  );
};
/**
 * 微信用户登录,获取code
 */
function wxLogin() {
  return wxPromisify(wx.login)
}
/**
 * 获取微信用户信息
 * 注意:须在登录之后调用
 */
function wxGetUserInfo() {
  return wxPromisify(wx.getUserInfo)
}
/**
 * 获取系统信息
 */
function wxGetSystemInfo() {
  return wxPromisify(wx.getSystemInfo)
}
/**
 * 获取图片信息
 */
function wxGetImageInfo(url){
  return wxPromisify(wx.getImageInfo({
    src:url
  }))
}
/**
 * 获取权限信息 getSetting
 */
function wxGetSetting() {
  return wxPromisify(wx.getSetting)
}
module.exports = {
  wxPromisify: wxPromisify,
  wxLogin: wxLogin,
  wxGetUserInfo: wxGetUserInfo,
  wxGetSystemInfo: wxGetSystemInfo,
  wxGetSetting: wxGetSetting,
  wxGetImageInfo: wxGetImageInfo
}