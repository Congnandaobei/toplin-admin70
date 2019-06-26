<template>
  <div id="app">

    <p>App Component999999999999999999</p>
    <router-view></router-view>
  </div>
</template>
<script>
export default {
  name: 'App',
  data() {
    return {}
  }

}
</script>
//这里用land="less"
<style lang="less" scoped>
  #app{
    height: 100%;
  }
</style>
