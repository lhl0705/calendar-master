//morningf@foxmail.com
const STORAGE_KEY = 'PLUG-ADD-MYAPP-KEY';
var ccFile = require('../../utils/calendar-converter.js')
var calendarConverter = new ccFile.CalendarConverter();
var app = getApp();

//月份天数表
var DAY_OF_MONTH = [
    [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31],
    [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
];

//判断当前年是否闰年
var isLeapYear = function(year){
    if (year % 400 == 0 || (year % 4 == 0 && year % 100 != 0))
        return 1
    else
        return 0
};

//获取当月有多少天
var getDayCount = function(year, month){
    return DAY_OF_MONTH[isLeapYear(year)][month];
};

//获取当前索引下是几号
var getDay = function(index) {
    return index - curDayOffset;
};

//获取两个时间戳之间间隔的天数
var getOffDays = function(startDate, endDate) {  
    //得到时间戳相减 得到以毫秒为单位的差  
    var mmSec = (endDate.getTime() - startDate.getTime());
    //单位转换为天并返回 
    return (mmSec / 3600000 / 24); 
};  

var pageData = {
    dateData: {
        date: "",                //当前日期字符串
        arrIsShow: [],           //是否显示此日期
        arrDays: [],             //关于几号的信息
        arrInfoEx: [],           //农历节假日等扩展信息
        arrInfoExShow: [],       //处理后用于显示的扩展信息
    },

    //选择一天时显示的信息
    detailData: {
        curDay: "",         //detail中显示的日信息
        curInfo1: "",
        curInfo2: "",
        curInfo3: "",
    },
    
    isWorkTurn: app.globalData.workTurnType.length != 0,
    workTurnTypeName: app.globalData.workTurnTypeName,
    workTurnType: app.globalData.workTurnType,
    workTurnData: {
        startWorkDate: {},
        startWorkDateString: "",
        arrWorkTurn: [],    //倒休信息
    },
  SHOW_TOP: false,
  text:'点击「添加小程序」，下次访问更便捷 >',
  index:''
}

//获取此月第一天相对视图显示的偏移
var getOffset = function()
{
    var offset = new Date(curYear, curMonth, 1).getDay();
    offset = offset == 0 ? 6 : offset - 1; //注意这个转换，Date对象的getDay函数返回返回值是 0（周日） 到 6（周六） 
    return offset;
}

//设置当前详细信息的索引，前台的详细信息会被更新
var lastRefreshDetailDataIndex = 0;
var refreshDetailData = function(index){
    if (index == null)
    {
        index = lastRefreshDetailDataIndex
    }
    else
    {
        lastRefreshDetailDataIndex = index;
    }
    var curEx = pageData.dateData.arrInfoEx[index];
    if (!curEx)
        return;
    curDay = curEx.sDay;
    pageData.detailData.curDay = curEx.sDay;
    pageData.detailData.curInfo1 = "农历" + curEx.lunarMonth + "月" + curEx.lunarDay + " " + curEx.lunarFestival;
    pageData.detailData.curInfo2 = curEx.cYear+curEx.lunarYear + "年 " + curEx.cMonth + "月 " + curEx.cDay + "日";
    pageData.detailData.curInfo3 = pageData.workTurnData.arrWorkTurn[index];
    pageData.index=index;
}

var getWorkTurnDayInfo = function(d){
    var sd = pageData.workTurnData.startWorkDate;
    var days = getOffDays(sd, d);
    if (days < 0)
        return "";
    
    var index = days % pageData.workTurnType.length;

  console.log(index)
    return pageData.workTurnType[index];
}

//刷新倒班视图
var refreshWorkTurnData = function(){
    if(app.globalData.workTurnType.length === 0)
        return;
    
    var offset = getOffset();
    var offset2 = getDayCount(curYear, curMonth) + offset;
    for (var i = 0; i < 42; ++i)
    {
        if (i < offset || i >= offset2)
            continue;
        var d = new Date(curYear, curMonth, i - offset + 1);
        pageData.workTurnData.arrWorkTurn[i] = getWorkTurnDayInfo(d);
    }
}

//刷新全部数据
var refreshPageData = function(year, month, day){
    curMonth = month;
    curYear = year;
    curDay = day;

    pageData.dateData.date = curYear + '年'+ (curMonth + 1) + '月';

    var offset = getOffset();
    var offset2 = getDayCount(curYear, curMonth) + offset;
    for (var i = 0; i < 42; ++i)
    {
        pageData.dateData.arrIsShow[i] = i < offset || i >= offset2 ? false : true;
        if (!pageData.dateData.arrIsShow[i])
            continue;
        pageData.dateData.arrDays[i] = i - offset + 1;
        var d = new Date(year, month, i - offset + 1);
        var dEx = calendarConverter.solar2lunar(d);
        pageData.dateData.arrInfoEx[i] = dEx;
        if ("" != dEx.lunarFestival)
        {
            pageData.dateData.arrInfoExShow[i] = dEx.lunarFestival;
        }
        else if ("初一" === dEx.lunarDay)
        {
            pageData.dateData.arrInfoExShow[i] = dEx.lunarMonth + "月";
        }
        else
        {
            pageData.dateData.arrInfoExShow[i] = dEx.lunarDay;
        }
    }
    refreshWorkTurnData();  
    refreshDetailData(offset + day - 1);
};

var refreshStartWorkDateString = function(){
    var d = pageData.workTurnData.startWorkDate;
    var month = d.getMonth();
    var year = d.getFullYear();
    var day = d.getDate();
    pageData.workTurnData.startWorkDateString = year + "-" + (month + 1) + "-" + day;
}

var curDate = new Date();
var curMonth = curDate.getMonth();
var curYear = curDate.getFullYear();
var curDay = curDate.getDate();
pageData.workTurnData.startWorkDate = app.globalData.startWorkDate;
refreshStartWorkDateString();
refreshPageData(curYear, curMonth, curDay);

Page({
    data: pageData,
    onLoad: function() {

            //页面录入
            wx.cloud.callFunction({
              name: 'submitPages',
              data: {
                "path": this.route,
                "query": 'name=倒班' 
              },
              success: function (res) {
                console.log(res)
      
              },
              fail: function (err) {
                console.log(err)
              }
            })
    // 判断是否已经显示过
    let cache = wx.getStorageSync(STORAGE_KEY);
      console.log('cache',cache)
    if (cache) return;
    // 没显示过，则进行展示
    this.setData({
      SHOW_TOP: true
    });
    // 关闭时间
    setTimeout(() => {
      this.setData({
        SHOW_TOP: false
      })
    }, 5 * 1000);



    },
  /**
* 组件的方法列表
*/
    // 显示全屏添加说明
    showModal: function () {
      this.setData({
        SHOW_TOP: false
      });
      wx.setStorage({
        key: STORAGE_KEY,
        data: +new Date,
      });
    },
    onShow: function() {
        pageData.isWorkTurn = app.globalData.workTurnType.length != 0;
        pageData.workTurnTypeName = app.globalData.workTurnTypeName;
        pageData.workTurnType = app.globalData.workTurnType;
        refreshWorkTurnData();
        refreshDetailData();
      console.log(pageData.workTurnType)
        this.setData({
            isWorkTurn: pageData.isWorkTurn,
            workTurnTypeName : pageData.workTurnTypeName,
            workTurnType : pageData.workTurnType,
            workTurnData: pageData.workTurnData,
            detailData: pageData.detailData,
            select:pageData.index
        })
    },
    onShareAppMessage: function () {
        return {
            title: '倒班大师',
            desc: '快速计算倒休情况，上班休假一目了然',
            path: '/pages/calendar/calendar'
        }
    },

    goToday: function(e){
        curDate = new Date();
        curMonth = curDate.getMonth();
        curYear = curDate.getFullYear();
        curDay = curDate.getDate();
        refreshPageData(curYear, curMonth, curDay);

        this.setData({
            dateData: pageData.dateData,
            detailData: pageData.detailData,
            workTurnData: pageData.workTurnData,
            select: pageData.index
        })
    },

    goLastMonth: function(e){
        if (0 == curMonth)
        {
            curMonth = 11;
            --curYear
        }
        else
        {
            --curMonth;
        }
        refreshPageData(curYear, curMonth, 1);
        this.setData({
            dateData: pageData.dateData,
            detailData: pageData.detailData,
            workTurnData: pageData.workTurnData,
          select: pageData.index
        })
    },

    goNextMonth: function(e){
        if (11 == curMonth)
        {
            curMonth = 0;
            ++curYear
        }
        else
        {
            ++curMonth;
        }
        refreshPageData(curYear, curMonth, 1);
        this.setData({
            dateData: pageData.dateData,
            detailData: pageData.detailData,
            workTurnData: pageData.workTurnData,
          select: pageData.index
        })
    },

    selectDay: function(e){
        refreshDetailData(e.currentTarget.dataset.dayIndex);
        this.setData({
            detailData: pageData.detailData,
           select: pageData.index
        })
    },

    bindDateChange: function(e){
        var arr = e.detail.value.split("-");
        refreshPageData(+arr[0], arr[1]-1, +arr[2]);
        this.setData({
            dateData: pageData.dateData,
            detailData: pageData.detailData,
            workTurnData: pageData.workTurnData,
        })
    },

    bindWorkTurnTypeTap: function(e){
        wx.navigateTo({
             url: '../setting/setting'
        });
    },

    bindWorkTurnDatePickerChange: function(e){
        pageData.workTurnData.startWorkDateString = e.detail.value;
        var arr = e.detail.value.split("-");
        pageData.workTurnData.startWorkDate = new Date(+arr[0], arr[1]-1, +arr[2]);
        //将开始上班日期信息存储起来
        wx.setStorageSync("startWorkDate", pageData.workTurnData.startWorkDate);
        refreshWorkTurnData();
        refreshDetailData();
        this.setData({
            workTurnData: pageData.workTurnData,
            detailData: pageData.detailData,
        })
    },

  /**
* 组件的属性列表
*/
  properties: {
    // 提示文字
    text: {
      type: String,
      value: '点击「添加小程序」，下次访问更便捷 >'
    },
    // 多少秒后关闭
    duration: {
      type: Number,
      value: 5
    }
  },


   /**
   * 日历滑动的特效处理函数
   */
  touchStart(e) {
    this.setData({
      startX: e.changedTouches[0].pageX
    })
  },
  touchEnd(e) {
    if (!this.data.slideFlag) {
      this.setData({
        slideFlag: true,
        endX: e.changedTouches[0].pageX
      })
      let disX = e.changedTouches[0].pageX - this.data.startX;
      if (disX < -60) {
        console.log("左滑")
        this.setData({
          slideOne: "animated fadeOutLeft",
          slideTwo: "animated fadeInRight"
        })
        setTimeout(() => {
          this.tapNext();
        }, 300);
        setTimeout(() => {
          this.setData({
            slideFlag: false,
            slideOne: "",
            slideTwo: ""
          })
        }, 800);
      } else if (disX > 60) {
        console.log("右滑")
        this.setData({
          slideOne: "animated fadeOutRight",
          slideTwo: "animated fadeInLeft"
        })
        setTimeout(() => {
          this.tapPrev();
        }, 300);
        setTimeout(() => {
          this.setData({
            slideFlag: false,
            slideOne: "",
            slideTwo: ""
          })
        }, 800);
      } else {
        this.setData({
          slideFlag: false
        })
      }
    }
  },
  /**
   * 左右滑动调用的函数
   */
  tapPrev() {
    this.goLastMonth()
    
  },
  tapNext() {
    
    this.goNextMonth()
  }

});