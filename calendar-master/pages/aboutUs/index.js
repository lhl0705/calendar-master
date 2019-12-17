// miniprogram/pages/aboutUs/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },
  onShareAppMessage: function () {
    return {
      title: '倒班日历',
      desc: '快速计算倒休情况，上班休假一目了然',
      path: '/pages/calendar/calendar'
    }
  }
})