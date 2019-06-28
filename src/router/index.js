import Vue from 'vue'
import Router from 'vue-router'
import nprogress from 'nprogress'
// 引入封装的获取userInfo
import { getUser } from '@/utils/auth'
Vue.use(Router)

const router = new Router({
  routes: [
    {
      // layout显示到App根组件的路由出口,谁是/就在App根组件显示
      // name: 'layout',//使用js命名路由导航不会渲染默认子路由,所以这里没意义
      path: '/',
      // 直接用懒加载
      // 在整个项目中，模块路径中的@表示的是src目录
      // 无论你当前模块在哪里，@都可以直接定位到src
      // 加载一个目录可以默认加载它的index.js   index.vue   index.json
      // component: () => import('@/views/home')
      component: () => import('@/views/layout'),
      // 嵌套路由：https://router.vuejs.org/zh/guide/essentials/nested-routes.html
      // 所有的children路由都显示到父路由的router-view中
      children: [
        {
          name: 'home',
          path: '', // 父路由的默认内容
          component: () => import('@/views/home')
        },
        {
          name: 'publish',
          path: '/publish',
          component: () => import('@/views/publish')
        },
        {
          name: 'article',
          path: '/article',
          component: () => import('@/views/article')
        }
      ]
    },
    {
      name: 'login',
      path: '/login',
      component: () => import('@/views/login')
    }

  ]
})
/**
 * 全局前置守卫
 * 当你访问路由页面的时候，会先进入这里
 * to 要去哪里的相关数据
 * from 来自哪里的相关数据
 * next 允许通过的方法
 */
router.beforeEach((to, from, next) => {
  // 路由导航前，开启进度条
  nprogress.start()

  // const userInfo = window.localStorage.getItem('user_info')
  const userInfo = getUser()// 这个是封装的至直接调用
  if (to.path !== '/login') {
    // 非登录页面
    //   没有登录，跳转到登录页
    if (!userInfo) { // 如果你在其他页面，你没有登录，那你必须要登录一下
      // window.location.href = '/#/login'
      // window.location.reload()
      //* *************************** */
      next({ name: 'login' })
      // next('/login')
      // next({ path: '/login' })
    } else { // 如果你已经登录了，那么你可以直接访问。不用再去登录了.
      //   登录了，允许通过
      next()
    }
  } else { // 如果你在登录页面，你没有登录那么你就可以看到登录页面输入你的手机号
    // 登录页面
    // 没有登录，允许通过
    if (!userInfo) {
      next()
    } else { // 如果你在登录页面，你已经登录了，那么就不让你通过。你登录了还去登录干啥
      //   登录了，不允许通过
      // next(false) // 中断当前导航
      // next()
      // next({ name: 'home' })
      // window.location.href = '/#/'
      next({ name: 'home' })
      window.location.reload()
    }
  }
})

router.afterEach((to, from) => {
  // 路由导航完成，结束进度条
  nprogress.done()
})

export default router
