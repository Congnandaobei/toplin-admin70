import Vue from 'vue'
import App from './App.vue'
import ElementUI from 'element-ui'
import 'nprogress/nprogress.css'
import 'element-ui/lib/theme-chalk/index.css'
import axios from 'axios'
// 这个公共样式引入到第三方的后面，因为这样可以覆盖里面的
import './styles/index.less'

// 先找文件，没有就找目录
// 如果找到目录,优先加载目录中的index
import router from './router/index'

// 配置axios的基础路径
// 发请求的时候就不需要每次都写http://xxxx
// 例如我要请求登录，直接axios({ url: '/authorizations'})
// 路径最后的/  多退少补
// axios.defaults.baseURL = 'http://ttapi.research.itcast.cn/mp/v1_0/';
axios.defaults.baseURL = 'http://toutiao.course.itcast.cn/mp/v1_0/'
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
