let regeneratorRuntime = require("../../utils/regenerator-runtime/runtime")

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
    //页面录入
    wx.cloud.callFunction({
      name: 'submitPages',
      data: {
        "path": this.route,
        "query": 'index=1'
      },
      success: function (res) {
        console.log(res)
      },
      fail: function (err) {
        console.log(err)
      }
    })
  },
  async bindFormSubmit (e) {
    const { options } = e.detail.value
    if (options === '' || options === null || options === undefined) {
      wx.showToast({
        title: '请输入反馈内容',
        icon: 'none',
        duration: 1500
      })
      return false
    }
//content: escape(options),
    const params = {
      content: options,
      createAt: new Date(),
      updateAt: new Date(),
      status: 0, // 0未处理，1已处理
      feedback: ''
    }
    const db = wx.cloud.database()
    const res = await db.collection('suggests').add({
      data: {...params}
    })
    wx.showToast({
      title: '反馈成功，感谢您的支持',
      icon: 'none',
      duration: 2000
    })
    let timmer = setTimeout(() => {
      clearTimeout(timmer)
      timmer = null
      wx.navigateBack({ delta: 1 })
    }, 2000)
  }
})