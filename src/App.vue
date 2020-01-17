<template>
  <div id="app">
    <ul class="list">
      <li><router-link to="/home">首页</router-link></li>
      <li><router-link to="/tableComponent">表格</router-link></li>
      <li><router-link to="/dialogComponent">弹框</router-link></li>
    </ul>
    <div class="router">
      <router-view></router-view>
    </div>
  </div>
</template>

<script>
export default {
  name: 'app',
  data () {
    return {

    }
  }
}
</script>

<style>
  #app {
    padding: 30px 0;
    display: flex;
    height: 100%;
    box-sizing: border-box;
  }

  .list {
    flex: 0 0 200px;
    border-right: 1px solid #ccc;
    height: 100%;
  }

  .list li {
    text-align: center;
    margin: 10px 0;
  }

  .router {
    flex: auto;
    padding: 15px;
  }
</style>
