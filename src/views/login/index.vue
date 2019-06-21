<template>
  <div class="login-wrap">
    <!-- 给组件加 class，会把这个 class 作用到组件的根元素上 -->
    <div class="form-wrap">
      <div class="form-head">
        <img src="./logo_index.png" alt="黑马头条号">
      </div>
      <el-form class="form-content" ref="form" :model="form">
        <el-form-item>
          <el-input v-model="form.mobile" placeholder="手机号"></el-input>
        </el-form-item>
        <el-form-item>
          <!-- el-col 栅格布局，一共 24 列，:span 用来指定占用的大小，:offset 用来指定偏移量 -->
          <el-col :span="14">
            <el-input v-model="form.code" placeholder="验证码"></el-input>
          </el-col>
          <el-col :offset="1" :span="9">
            <el-button @click="handleSendCode">获取验证码</el-button>
          </el-col>
        </el-form-item>
        <el-form-item>
          <el-button class="btn-login" type="primary">登录</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
// 引入axios
import axios from 'axios'
export default {
  name: 'AppLogin',
  data() {
    return {
      form: {
        mobile: '', // 这个数据是后台接口提供的，所以上面v-model也应该对象
        code: ''// 这个数据是后台接口提供的，所以上面v-model也应该对象

      }
    }
  },
  methods: {
    onSubmit() {
      console.log('submit!')
    },
    handleSendCode() {
      // 这里用对象解构赋值
      const { mobile } = this.form
      // 1.点击获取验证码，发送请求 获取人机验证码（极验 API1），获取用来初始化验证码的参数
      axios({
        // 请求方式也是APL里面的给的
        method: 'GET',
        // 这个是（极验API里面的在线地址）
        url: `http://ttapi.research.itcast.cn/mp/v1_0/captchas/${mobile}`
      }).then(res => {
        console.log(res.data)// 输入一个手机号，可以得到以下数据,这些数据给极验用的
        // {message: "OK",…}
        // data: {success: 1, gt: "f00de9ed073bd781c94509932a309159", challenge: "92825d1ceba6748cb7fcbf66c78fe4c1",…}
        // challenge: "92825d1ceba6748cb7fcbf66c78fe4c1"
        // gt: "f00de9ed073bd781c94509932a309159"
        // new_captcha: true
        // success: 1
        // message: "OK"
      })
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
    .btn-login {
      width: 100%;
    }
  }
}
</style>
