<template>
  <div id="editor"></div>
</template>

<script>
  export default {
    name: "RichEditor",
    methods: {
      initEditor() {
        const editor = new this.$editor('#editor')
        editor.create()
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