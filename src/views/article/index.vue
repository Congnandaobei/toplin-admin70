<template>
  <div>
    <!-- 数据筛选 -->
    <el-card class="filter-card">
      <div slot="header" class="clearfix">
        <span>数据筛选</span>
        <el-button style="float: right; padding: 3px 0" type="text">操作按钮</el-button>
      </div>
      <!-- <div v-for="o in 4" :key="o" class="text item">
        {{'列表内容 ' + o }}
      </div> -->
      <el-form ref="form" :model="filterParams" label-width="80px">
        <el-form-item label="状态">
          <el-radio-group v-model="filterParams.status">
            <el-radio label="">全部</el-radio>
            <el-radio
              v-for="(item, index) in statTypes"
              :key="item.label"
              :label="index"
            >{{ item.label }}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="频道">
          <el-select v-model="filterParams.channel_id" clearable>
            <el-option
              v-for="item in channels"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="时间">
          <!-- 这里把v-model绑的数据去掉filterParams.begin_pubdate因为开始也不行结束也不行，所以下面给一个字段，让他触发 -->
          <el-date-picker
            value-format="yyyy-MM-dd"
            v-model="range_date"
            @change="handleDateChange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期">
          </el-date-picker>
        </el-form-item>
        <el-form-item>
          <el-button
          type='primary'
          @click="handleFilter"
          :loading="articleLoading"
          >查询</el-button>
        </el-form-item>
      </el-form>
    </el-card>
    <!-- 数据筛选 -->

    <!-- 文章列表 -->
    <el-card class="box-card">
      <div slot="header" class="clearfix">
        <span>一共有<strong>{{ totalCount }}</strong>条数据</span>
        <el-button style="float: right; padding: 3px 0" type="text">操作按钮</el-button>
      </div>
      <!--
        table 表格不需要我们自己去手动v-for遍历
        你只需要将数据交给table表格的data属性就可以了
        然后配置el-table-column表格列组件即可
          label 列头标题
          prop  遍历项中的数据字段
          width 列宽
        表格默认把数据当做文本去输出
        如果需要其他数据格式，则可以自定义表格列
      -->
      <el-table
        class="article-list"
        :data="articles"
        style="width: 100%"
        v-loading="articleLoading">
        <el-table-column
          label="封面"
          width="180">
          <!--
            template中的内容就是自定义表格列内容
            如果需要在template中访问遍历项数据，则需要给template配置slot-scope="scope"
              slot-scope属性名是固定的
              scope值 是自己随便起的名字
            结果就是：我们可以通过scope.row访问当前遍历项对象，就好比我们遍历中的item一样
          -->
          <template slot-scope="scope">
            <img
              width="20"
              v-for="item in scope.row.cover.images"
              :key="item"
              :src="item">
          </template>
        </el-table-column>
        <el-table-column
          prop="title"
          label="标题"
          width="180">
        </el-table-column>
        <el-table-column
          label="状态"
          width="180">
          <template slot-scope="scope">
            <el-tag :type="statTypes[scope.row.status].type">{{ statTypes[scope.row.status].label }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column
          prop="pubdate"
          label="发布时间"
          width="180">
        </el-table-column>
        <el-table-column
          label="操作">
          <template slot-scope="scope">
            <el-button size="mini" type="primary" plain>修改</el-button>
            <el-button size="mini" type="danger" plain @click="handleDelete(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 数据分页 -->
      <!--
        数据分页
        page-size配置每页大小，默认是10
        total用来配置总记录数
        分页组件会根据每页大小和总记录进行分页
        current-page 当前高亮的页码，需要和数据保持同步，否则可能会出现数据页码改变，视图页码没变的情况
      -->
      <el-pagination
        background
        :current-page="page"
        layout="prev, pager, next"
        :page-size="pageSize"
        :total="totalCount"
        :disabled="articleLoading"
        @current-change="handleCurrentChange">
      </el-pagination>
      <!-- /数据分页 -->
    </el-card>
    <!-- /文章列表 -->
  </div>
</template>

<script>
// import { getUser } from '@/utils/auth' // 按需加载，加载模块中非 export default 成员
export default {
  name: 'ArticleList',
  data() {
    return {
      articles: [],
      statTypes: [
        {
          type: 'info',
          label: '草稿'
        },
        {
          type: '',
          label: '待审核'
        },
        {
          type: 'success',
          label: '审核通过'
        },
        {
          type: 'warning',
          label: '审核失败'
        },
        {
          type: 'danger',
          label: '已删除'
        }
      ],
      pageSize: 10, // 每页大小
      totalCount: 0, // 总数据量
      page: 1, // 当前页码
      articleLoading: false, // 加载中
      filterParams: {
        status: '', // 文章状态
        channel_id: '', // 频道id
        begin_pubdate: '', // 开始时间
        end_pubdate: '' // 结束时间
      },
      range_date: '', // 时间范围绑定值，这个字段的意义是为了绑定date组件触发change事件
      channels: [] // 所有频道
    }
  },
  created() {
    this.loadArticles()
    this.loadChannels()
  },
  methods: {
    // handleDelete(shanchu) {
    //   console.log(shanchu.id.toString())
    // },
    async handleDelete(item) {
      try {
        // 删除确认提示
        await this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
          congirmButtonText: '确定',
          concelButtonText: '取消',
          type: 'warning'
        })
        // 如果手动catch了它的异常，还是会被外部的try-catch捕获到
        // 但是代码依然可以继续往后执行
        // .catch(() => {
        //   this.$message({
        //     type: 'info',
        //     message: '已取消删除'
        //   })
        // })
        // 确认：执行删除操作
        await this.$http({
          method: 'DELETE',
          url: `/articles/${item.id}`
        })
        this.$message({
          type: 'success',
          message: '删除成功'
        })
        // 删除成功重新加载数据列表
        this.loadArticles()
      } catch (err) {
        if (err === 'cancel') {
          return this.$message({
            type: 'info',
            message: '已取消删除'
          })
        }
        this.$message.error('删除失败')
      }
    },
    handleDateChange(value) {
      this.filterParams.begin_pubdate = value[0]
      this.filterParams.end_pubdate = value[1]
    },
    async loadChannels() {
      try {
        const data = await this.$http({
          method: 'GET',
          url: '/channels'
        })
        this.channels = data.channels
      } catch (err) {
        console.log(err)
        this.$message.error('获取频道数据失败')
      }
    },
    handleFilter() {
      // 点击查询按钮，根据表单中的数据查询文章列表
      this.page = 1 // 查询从第一页开始加载数据
      this.loadArticles()
    },
    async loadArticles() {
      // 请求开始，加载loading
      this.articleLoading = true
      // const token = getUser().token
      // 除了登录相关接口之后,其他接口必须在请求中通过Auturation字段提供token
      // 当我们登录成功,服务端会生成一个token令牌,放到用户信息中

      // 去除无用字段
      const filterData = {} // 这个用来保存有效字段
      for (let key in this.filterParams) {
        const item = this.filterParams[key]
        if (item !== null && item !== undefined && item !== '') {
          filterData[key] = item
        }
      // 为什么不直接判断呢，因为原因如下
      // 数据中的 0 参与布尔值运算是false,不会进来
      // if(item){
      //  filterData[key] = item
      // }
      }
      const data = await this.$http({
        method: 'GET',
        url: '/articles',
        // headers: {// 自定义请求头
        //   Authorization: `Bearer ${token}`// 后端要求将token以请求头的格式放到Auturation字段中
        // }
        params: {
          page: this.page, // 页码,接口要的
          per_page: this.pageSize, // 每页大小，接口要的
          ...filterData // 把有用的数据传过去，这个...新语法，直接把数据放到当前对象
        }
      })
      console.log(data)
      // {message: "OK", data: {…}}
      // 这res就是mian.js里面的响应拦截器返回的response
      // res.data就是response.data数据
      // main.js里面return返回什么数据这里接收的就是什么数据
      this.articles = data.results
      this.totalCount = data.total_count
      // 请求结束，停止 loading
      this.articleLoading = false
    },
    handleCurrentChange(page) {
      console.log(page) // 获取当前页码
      // 将数据中的页码修改为当前最新改变的数据页码
      this.page = page
      // 页码改变，重新加载当前文章列表
      this.loadArticles()
    }
  }
}
</script>

<style lang="less" scoped>
.filter-card {
  margin-bottom: 15px;
}
.article-list {
  margin-bottom: 30px;
}
</style>
