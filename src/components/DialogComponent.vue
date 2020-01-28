<template>
  <div>
    <normal-table :data="data" :header="header" :border="true" :stripe="true" :toolbars="toolbars"
                  @handleAdd="handleAdd" @edit="handleEdit" @delete="handleDelete"></normal-table>
    <form-dialog :form-data="formData" :dialog-visible.sync="visible" :dialog-type="dialogType"
                 top="50px" width="800px" @saveData="handleSave"></form-dialog>
  </div>
</template>

<script>
  import normalTable from './common/NormalTable'
  import formDialog from './common/FormDialog'
  import projectData from '../data/tableData.json'
  import { arrayToObject } from "../util/util";

  export default {
    name: "DialogComponent",
    data() {
      return {
        data: [],
        projectHeader: [
          {prop: 'name', label: '方案名', readOnly: true, fixed: true, rules: [{required: true, message: '不能为空'}]},
          {prop: 'date', label: '日期', type: 'date', width: 120, dateType: 'datetime'},
          {
            prop: 'left',
            label: '左屏',
            type: 'group',
            span: 24,
            children: [
              {prop: 'sourceL', label: '信号源', type: 'select', width: 100, span: 8, options: []},
              {prop: 'urlL', label: '页面', type: 'select', span: 8, options: []},
              {prop: 'isCloseL', label: '是否关闭信号源', type: 'select', span: 8,
                labelWidth: '120px', options: []}
            ]
          },
          {
            prop: 'middle',
            label: '中屏',
            type: 'group',
            span: 24,
            children: [
              {prop: 'sourceM', label: '信号源', type: 'select', width: 100, span: 8, options: []},
              {prop: 'urlM', label: '页面', type: 'select', span: 8, options: []},
              {prop: 'isCloseM', label: '是否关闭信号源', type: 'select', span: 8,
                labelWidth: '120px', options: []}
            ]
          },
          {
            prop: 'right',
            label: '右屏',
            type: 'group',
            span: 24,
            children: [
              {prop: 'sourceR', label: '信号源', type: 'select', width: 100, span: 8, options: []},
              {prop: 'urlR', label: '页面', type: 'select', span: 8, options: []},
              {prop: 'isCloseR', label: '是否关闭信号源', type: 'select', span: 8,
                labelWidth: '120px', options: []}
            ]
          },
          {
            type: 'operation',
            label: '操作',
            width: 100,
            fixed: 'right',
            operation: {default: {type: 'text', handles: ['edit', 'delete']}}
          }
        ],
        sourceOptions: [
          {value: '1', label: '1号显示器'},
          {value: '2', label: '2号显示器'},
          {value: '3', label: '3号显示器'},
        ],
        urlOptions: [
          {value: '1', label: '整体介绍'}, {value: '2', label: '流域介绍'}, {value: '3', label: '产业介绍'},
          {value: '4', label: '电站总览'}, {value: '5', label: '雨情总览'}, {value: '6', label: '供水总览'},
        ],
        isCloseOptions: [
          {value: 'true', label: '是'},
          {value: 'false', label: '否'},
        ],
        types: ['source', 'url', 'isClose'],
        visible: false,
        dialogType: '',
        formData: [],
        currentIndex: 0,
        toolbars: ['add']
      }
    },
    computed: {
      header() {
        return this.projectHeader.map(item => {
          if (!('type' in item) || item.type !== 'group') { return item }
          item.children.forEach(child => {
            if (child.type !== 'select') { return }
            let type = child.prop.substring(0, child.prop.length - 1)
            child.options = this[`${type}Options`]
          })
          return item
        })
      },
      sourceMap() {
        return arrayToObject(this.sourceOptions, 'value', 'label')
      },
      urlMap() {
        return arrayToObject(this.urlOptions, 'value', 'label')
      },
      isCloseMap() {
        return arrayToObject(this.isCloseOptions, 'value', 'label')
      }
    },
    components: { normalTable, formDialog },
    methods: {
      initTableData() {
        this.clearData()
        this.data = projectData['project'].map(item => {
          return Object.entries(item).reduce((obj, [key, value]) => {
            let type = key.substring(0, key.length - 1)
            return this.types.includes(type)
              ? Object.assign(obj, {[key]: this[`${type}Map`][value]})
              : Object.assign(obj, {[key]: value})
          }, {})
        })
      },
      clearData() {
        this.data = []
      },
      handleAdd() {
        this.visible = true
        this.dialogType = 'add'
        this.formData = this.projectHeader.filter(({ type }) => type !== 'operation')
      },
      handleEdit({ row, index }) {
        this.visible = true
        this.dialogType = 'edit'
        this.currentIndex = index
        this.formData = this.projectHeader.reduce((arr, item) => {
          if (!(item.prop in row) && item.type !== 'group') { return arr }
          if (item.type === 'group') {
            let children = item.children.map(c => {
              let type = c.prop.substring(0, c.prop.length - 1)
              let target = this[`${type}Options`].find(({ label }) => label === row[c.prop])
              return Object.assign({}, c, {'value': target ? target.value : ''})
            })
            arr.push(Object.assign({}, item, { children }))
          } else {
            arr.push(Object.assign({}, item, {'value': row[item.prop]}))
          }
          return arr
        }, [])
      },
      handleDelete({ row, index }) {
        this.$confirm('是否删除该行数据', '提醒', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.data.splice(index, 1)
        }).catch(() => {})
      },
      handleSave(formData, type) {
        let data = formData.reduce((obj, item) => {
          if (item.type !== 'group') {
            return Object.assign(obj, {[item.prop]: item.value})
          }
          return item.children.reduce((prev, { prop, value }) => {
            let type = prop.substring(0, prop.length - 1)
            return Object.assign(prev, {[prop]: this[`${type}Map`][value]})
          }, obj)
        }, {})
        type === 'add'
          ? this.data.push(data)
          : this.$set(this.data, this.currentIndex, data)
      }
    },
    mounted() {
      this.initTableData()
    }
  }
</script>

<style scoped>

</style>
