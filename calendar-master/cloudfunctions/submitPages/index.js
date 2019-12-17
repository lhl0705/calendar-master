// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init({
  env: 'test-c0und'
})
exports.main = async (event, img) => {
  console.log('event.path', event.path)
  console.log('event.path', event.query)
  var timestamp = Date.parse(new Date());
  try {
    const result = await cloud.openapi.search.submitPages({
      pages: [
        {
          "path": event.path,
          "query": event.query+"&tim="+timestamp
        }
      ]
    })
    console.log(result)
    return result
  } catch (err) {
    console.log(err)
    throw err
  }
}
