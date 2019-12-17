// pages/user/index.js
const db = wx.cloud.database()
var Consts = require('../../utils/consts.js');
var version = Consts.version
Page({

  /**
   * 页面的初始数据
   */
  data: {
    openid: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const that = this;
    db.collection('version')
      .get()
      .then(res => {
        if (version == res.data[0].version) {
          that.setData({
            isShowAtatus: true
          });
        } else {
          isShowAtatus: false
        }
      })
      .catch(err => {
        console.error(err)
      })


    const openid = wx.getStorageSync('openid')
    this.setData({ openid })
    //页面录入
    wx.cloud.callFunction({
      name: 'submitPages',
      data: {
        "path": this.route,
        "query": 'openid=' + openid
      },
      success: function (res) {
        console.log(res)
      },
      fail: function (err) {
        console.log(err)
      }
    })

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },
  onShareAppMessage: function () {
    return {
      title: '倒班日历',
      desc: '快速计算倒休情况，上班休假一目了然',
      path: '/pages/calendar/calendar'
    }
  },
  goToCollection () {
    wx.navigateTo({ url: '/pages/collection/index'})
  },
  goToAboutUs () {
    wx.navigateTo({ url: '/pages/aboutUs/index'})
  },
  goToOptions () {
    wx.navigateTo({ url: '/pages/options/index'})
  },
  goToMore() {
    wx.navigateTo({ url: '/pages/more/index' })
  },
  exit () {
    console.log('退出登录')
  },
  previewImage: function () {
    wx.previewImage({
      urls: ['cloud://test-c0und.7465-test-c0und-1300520492/image/pay.jpg'],
    });
  },
  bgimg: function () {
    //相册中获取
    wx.chooseImage({
      count: 1,
      success: function (res) {
        console.log(res);
        wx.previewImage({
          urls: ['cloud://test-c0und.7465-test-c0und-1300520492/image/pay.jpg'],
        })
      },
    })
  }
})