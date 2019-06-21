import Vue from 'vue'
import App from './App.vue'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
// 这个公共样式引入到第三方的后面，因为这样可以覆盖里面的
import './styles/index.less'
// 先找文件，没有就找目录
// 如果找到目录,优先加载目录中的index
import router from './router/index'
Vue.use(ElementUI)
Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
