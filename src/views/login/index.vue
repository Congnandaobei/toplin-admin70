<template>
  <div class="login-wrap">
    <!-- 给组件加 class，会把这个 class 作用到组件的根元素上 -->
    <div class="form-wrap">
      <div class="form-head">
        <img src="./logo_index.png" alt="黑马头条号">
      </div>
      <el-form class="form-content" ref="form" :model="form" :rules="rules">
        <el-form-item prop="mobile">
          <!--
            配置校验规则
            rules规则对象配置到el-form上,rules 中配置的校验字段必须和表单数据对象保持一致
            prop 校验字段配置到el-form-item上
            JavaScript触发验证
            给 el-form 添加ref
            调用this.$ref['ref名字'].validate(vaild => {})触发验证
          -->
          <el-input v-model="form.mobile" placeholder="手机号"></el-input>
        </el-form-item>
        <el-form-item prop="code">
          <!-- el-col 栅格布局，一共 24 列，:span 用来指定占用的大小，:offset 用来指定偏移量 -->
          <el-col :span="14">
            <el-input v-model="form.code" placeholder="验证码"></el-input>
          </el-col>
          <el-col :offset="1" :span="9">
            <!--  :disabled="!!codeTimer"人家必须让是布尔值，所以快速把这个改为布尔值就是!! -->
            <el-button
            @click="handleSendCode"
            :disabled="!!codeTimer"
            :loading="codeLoading"
            >{{ codeTimer ? `剩余${codeTimeSeconds}秒` : '获取验证码'}}</el-button>
          </el-col>
        </el-form-item>
        <el-form-item prop="agree">
          <el-checkbox class="agree-checkbox" v-model="form.agree"></el-checkbox>
          <span class="agree-text">我已阅读并同意<a href="#">用户协议</a>和<a href="#">隐私条款</a></span>
        </el-form-item>
        <el-form-item>
          <el-button
          class='btn-login'
          type='primary'
          @click="handleLogin"
          :loading="loginLoading">登录</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>
<script>
import '@/vendor/gt' // 引入极验 javascript SDK文件,里面就是一些方法,通过window.initGeetest使用
import { saveUser } from '@/utils/auth'// 按需加载，加载模块中非 export default 成员
import initGeetest from '@/utils/init-geetest'
const initCodeTimeSeconds = 10
export default {
  name: 'AppLogin',
  data() {
    return {
      form: { // 表单数据对象
        mobile: '', // 这个数据是后台接口提供的，所以上面v-model也应该对象
        code: '', // 这个数据是后台接口提供的，所以上面v-model也应该对象
        agree: ''
      },
      rules: {
        // 验证规则对象
        mobile: [
          { required: true, message: '请输入手机号', trigger: 'blur' },
          // {
          //   pattern: /\d{11}/,
          //   message: '请输入有效的手机号码',
          //   trigger: "blur"
          // },
          { len: 11, message: '长度必须为11位', trigger: 'blur' }
        ],
        code: [
          { required: true, message: '请输入验证码', trigger: 'blur' },
          { len: 6, message: '长度必须为6位', trigger: 'blur' },
          { pattern: /\d{6}/, message: '请输入有效的验证码', trigger: 'blur' }
        ],
        agree: [
          // 这个是第一次验证是否有对勾，没有就提示，选上就消失提示信息
          { required: true, message: '请同意用户协议888' },
          // 这个是验证再一次的点击，如果打上有不选了，就提示这个
          { pattern: /true/, message: '请同意用户协议999' }
        ]
      },
      codeTimer: null,
      // 倒计时事件
      codeTimeSeconds: initCodeTimeSeconds, // 倒计时时间
      loginLoading: false, // 登录中 loading
      codeLoading: false
    }
  },
  methods: {
    handleLogin() {
      console.log(this)
      // 使用form组件的validate方法触发校验,获取校验的结果状态
      this.$refs['form'].validate(valid => {
        if (!valid) {
          return
        }
        // 表单验证通过，提交登录请求
        this.submitLogin()
      })
    },
    async submitLogin() {
      this.loginLoading = true
      try {
        const userInfo = await this.$http({
          method: 'POST',
          url: '/authorizations',
          data: this.form
        })
        // window.localStorage.setItem('user_info',JSON.stringify(userInfo))
        saveUser(userInfo)
        this.$message({
          message: '恭喜你，这是一条成功消息',
          type: 'success'
        })
        this.$router.push({
          name: 'home'
        })
      } catch (err) {
        this.$message.error('登录失败,手机号或验证码错误')
      }
      this.loginLoading = false
    },
    handleSendCode() {
      // 验证手机号是否有效
      this.$refs['form'].validateField('mobile', errorMessage => {
        if (errorMessage.trim().length > 0) { // 这个是验证手机号码，如果错误会返回‘请输入手机号’，这是组件给的。
        // 所以这个如果错误大于0那么就直接跳出来,这个防止那些顽固分子一直获取，这里必须符合才可以,如果是对的就返回空字符
          return
        }
        // 验证通过，初始化显示验证码
        this.showGeetest()
      })
    },
    async showGeetest() {
      try {
        this.codeLoading = true
        // 任何函数中的 function 函数内部的 this 指向 window
        // 这里用对象解构赋值
        const { mobile } = this.form
        // 1.点击获取验证码，发送请求 获取人机验证码（极验 API1），获取用来初始化验证码的参数
        const data = await this.$http({
        // 请求方式也是APL里面的给的
          method: 'GET',
          // 这个是（极验API里面的在线地址）
          url: `/captchas/${mobile}`
        })
        // console.log(res.data)
        // const { data } = res.data
        // const data = res.data.data
        // console.log(data)
        const captchaObj = await initGeetest({
        // 以下配置参数来自服务器 SDK也就是第一次的那些数据
          gt: data.gt,
          challenge: data.challenge,
          offline: !data.success,
          new_captcha: data.new_captcha,
          product: 'bind' // 隐藏，直接弹出式
        })
        // console.log(captchaObj)
        captchaObj.onReady(() => {
          this.cadeLoading = false
          captchaObj.verify() // 弹出验证码的内容框
        // 验证码raedy之后才能调用verify方法显示验证码
        }).onSuccess(async() => {
        // 如果成功了
        // 调用一个方法
        // console.log(captchaObj.getValidate())// 得到以下数据，是下一个接口要的
        // {geetest_challenge: "f2d6949ec81f108a56c30db7e30ddfa69h", geetest_validate: "a7e74c7e68cfabd0346c1a51621dea46", geetest_seccode: "a7e74c7e68cfabd0346c1a51621dea46|jordan"}
        // geetest_challenge: "f2d6949ec81f108a56c30db7e30ddfa69h"
        // geetest_seccode: "a7e74c7e68cfabd0346c1a51621dea46|jordan"
        // geetest_validate: "a7e74c7e68cfabd0346c1a51621dea46"
        // __proto__: Object
        // your code
        // 这个下面是得到数据然后给后端
        // 这个是解构赋值,因为后端要的是challenge validate seccode所以我们把数据改名
          try {
            const {
              geetest_challenge: challenge,
              geetest_seccode: seccode,
              geetest_validate: validate } =
            captchaObj.getValidate()
            // 发送短信
            await this.$http({ // 另一个页面起的名字就是$.http
              method: 'GET',
              url: ` /sms/codes/${mobile}`,
              params: {
                challenge,
                validate,
                seccode
              }
            })
            // 发送短信成功，开始倒计时
            this.codeCountDown()
          } catch (err) {
            this.$message.error('获取验证码失败')
            this.codeLoading = false
          }
        })
      } catch (err) {
        this.$message.error('获取验证码失败')
        this.codeLoading = false
      }
    },
    // 在这里注册：“发送验证码” 按钮的点击事件，然后验证用户是否输入手机号以及手机号是否正确
    // 如果没有问题 cptchObj.verify
    // console.log(res.data)// 输入一个手机号，可以得到以下数据,这些数据给极验用的
    // {message: "OK",…}
    // data: {success: 1, gt: "f00de9ed073bd781c94509932a309159", challenge: "92825d1ceba6748cb7fcbf66c78fe4c1",…}
    // challenge: "92825d1ceba6748cb7fcbf66c78fe4c1"
    // gt: "f00de9ed073bd781c94509932a309159"
    // new_captcha: true
    // success: 1
    // message: "OK"
    /**
     * 验证码倒计时
     */
    codeCountDown() {
      this.codeTimer = window.setInterval(() => { // codeTimer是一个代号,清除定时器，但是代号不会被清除
        this.codeTimeSeconds--
        if (this.codeTimeSeconds <= 0) {
          // 清除定时器
          window.clearInterval(this.codeTimer)
          // 让倒计时的时间回归初始状态
          this.codeTimeSeconds = initCodeTimeSeconds
          // 将存储定时器引用的变量重新赋值为 null
          this.codeTimer = null// codeTimer是一个代号,清除定时器，但是代号不会被清除
        }
      }, 1000)
    }
  }
}
</script>

<style lang="less" scoped>
.login-wrap {
  height: 100%;
  background-color: #2b3e4a;
  display: flex;
  justify-content: center;
  align-items: center;
  .form-head {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-bottom: 10px;
    img {
      width: 200px;
    }
  }
  .form-wrap {
    width: 400px;
    background-color: #fff;
    padding: 20px;
    border-radius: 10px;
    .agree-checkbox {
      margin-right: 10px;
    }
    .agree-text {
      font-size: 16px;
      color: #999;
    }
    .btn-login {
      width: 100%;
    }
  }
}
</style>
