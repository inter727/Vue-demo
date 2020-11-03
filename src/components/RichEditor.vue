<template>
  <div class="main">
    <div id="editor"></div>
    <el-button type="primary" @click="append">追加内容</el-button>
    <el-button type="success" @click="getText">获取文本</el-button>
    <div>{{ text }}</div>
  </div>
</template>

<script>
  export default {
    name: "RichEditor",
    data() {
      return {
        editor: null,
        text: '',
        menus: ['fontName', 'fontSize', 'head', 'bold', 'italic', 'underline', 'strikeThrough', 'foreColor', 'justify',
          'indent', 'lineHeight', 'list', 'splitLine', 'table', 'image', 'undo', 'redo']
      }
    },
    methods: {
      initEditor() {
        this.editor = new this.$editor('#editor')
        this.editor.config.height = 400
        this.editor.config.placeholder = ''
        this.editor.config.menus = this.menus
        this.editor.create()
        // const safeHtml = this.$xss(`<h2 style="text-align: center; "><font size="5" style="" face="微软雅黑">湖北省水资源红头文件</font></h2><div style="text-align: center; "><font style="" face="微软雅黑" size="4">【2020】3号</font></div><div style="text-align: right;"><font style="" face="微软雅黑" size="4">签发人：</font></div><hr>`)
        const safeHtml = `<h2 style="text-align: center; color: #ff0000">湖北省水资源红头文件</h2><div style="text-align: center; ">【2020】3号</div><div style="text-align: right;">签发人：</div><hr style="height: 2px; border: none; background-color: #ff0000"><br>`
        this.editor.txt.html(safeHtml)
      },
      append() {
        this.editor.txt.append('<p>追加的内容</p>')
      },
      getText() {
        this.text = this.editor.txt.text()
        console.log(this.editor.txt.html());
      }
    },
    mounted() {
      this.initEditor()
    }
  }
</script>

<style scoped>
  #editor {
    width: 800px;
    height: 500px;
  }
</style>