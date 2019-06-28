import Vue from 'vue'
import App from './App.vue'
import ElementUI from 'element-ui'
import 'nprogress/nprogress.css'
import 'element-ui/lib/theme-chalk/index.css'
import axios from 'axios'
import { getUser, removeUser } from '@/utils/auth'
// 这个公共样式引入到第三方的后面，因为这样可以覆盖里面的
import './styles/index.less'
import JSONbig from 'json-bigint'
// 先找文件，没有就找目录
// 如果找到目录,优先加载目录中的index
import router from './router/index'

// 配置axios的基础路径
// 发请求的时候就不需要每次都写http://xxxx
// 例如我要请求登录，直接axios({ url: '/authorizations'})
// 路径最后的/  多退少补
axios.defaults.baseURL = 'http://ttapi.research.itcast.cn/mp/v1_0/'
// axios.defaults.baseURL = 'http://toutiao.course.itcast.cn/mp/v1_0/'

/**
 * 如何解决后端返回数据中的数字超出安全整数范围问题?
 * axios预留的自定义处理后端返回的原始数据
 * 可以理解成一个响应拦截器，这个比较特殊
 * 这里的data是后端返回的未经处理的原始数据
 * axios默认使用JSON.parse去转换原始数据，如果其中有超出安全频繁整数范围的数据就有问题了
 * 所以我们在这里可以手动处理这个原始数据
 *  npm i json-biginit
 *  JSONbig.parse(原始json格式字符串)
 */
axios.defaults.transformResponse = [function(data) {
  console.log('transformResponse => ', data)
  // return data
  // 这里使用JSONbig.parse转换原始数据
  // 类似于JSON.parse
  // 但是它会处理其中超出安全整数范围的整数问题
  // 严谨一点，如果有data不是json格式字符串就会报错
  try {
    // 如果是json字符串，那就转换并返回给后续使用
    return JSONbig.parse(data)
  } catch (err) {
    // 报错就意味着data不是json格式字符串，这里就直接原样返回给后续使用
    return data
  }
}]

/**
 * Axios 请求拦截器：axios 发出去的请求会先经过这里
 * config 是本次请求相关的配置对象
 */
axios.interceptors.request.use(config => {
  const user = getUser()
  // console.log(user)
  // 如果有 user 数据，则往本次请求中添加用户 token
  if (user) {
    config.headers.Authorization = `Bearer ${user.token}`
    // console.log(user)
  }

  // return config 是允许请求发送的开关
  // 我们可以在这之前进行一些业务逻辑操作
  return config
}, error => {
  return Promise.reject(error)
})

/**
 * Axios 响应拦截器：axios 收到的响应会先经过这里
 */
axios.interceptors.response.use(response => { // >=200 && < 400的状态码会进入这里
  console.log('进入响应拦截器', response)
  // {data: {…}, status: 200, statusText: "OK", headers: {…}, config: {…}, …}
  // config: {url: "http://ttapi.research.itcast.cn/mp/v1_0/articles", method: "get", headers: {…}, baseURL: "http://ttapi.research.itcast.cn/mp/v1_0/", transformRequest: Array(1), …}
  // data: {message: "OK", data: {…}}
  // headers: {content-type: "application/json"}
  // request: XMLHttpRequest {onreadystatechange: ƒ, readyState: 4, timeout: 0, withCredentials: false, upload: XMLHttpRequestUpload, …}
  // status: 200
  // statusText: "OK"
  // __proto__: Object
  // 这里做个判断，如果是这种格式的话还是返回response.data.data,如果不是，那就response.data
  if (typeof response.data === 'object' && response.data.data) {
    return response.data.data
  } else {
    return response.data
  }
  // {total_count: 46241, page: 1, per_page: 10, results: Array(10)}
}, error => { // >=400的状态码会进入这里
  // 如果用户token无效，让其跳转到登录页面
  if (error.response.status === 401) {
    // 清除本地存储中的无效token的用户信息
    removeUser()
    // 跳转到用户登录页面
    router.push({
      name: 'login'
    })
  }
  return Promise.reject(error)
})

Vue.use(ElementUI)

// 所有组件都是 Vue的实例
// 我们可以把一些需要在组件中频繁使用的成员放到Vue.prototype中
// Vue.prototype.foo = 'bar'

// 给vue原型对象扩展成员的时候，最后加上$前缀，防止和组件中的发生冲突
// 几乎所有组件都要去发请求，这样配置完以后，我们在组件中发请求就可以直接this.http({method  url...})
Vue.prototype.$http = axios// $http就等于axios

Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
