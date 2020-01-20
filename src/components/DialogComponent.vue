<template>
  <div>
    <normal-table :data="data" :header="header" :stripe="true"></normal-table>
  </div>
</template>

<script>
  import normalTable from './common/NormalTable.vue'
  import projectData from '../data/tableData.json'
  import { arrayToObject } from "../util/util";

  export default {
    name: "DialogComponent",
    data() {
      return {
        data: [],
        projectHeader: [
          {prop: 'name', label: '方案名', rules: [{required: true, message: '不能为空'}]},
          {
            prop: 'left',
            label: '左屏',
            type: 'group',
            span: 24,
            children: [
              {prop: 'sourceL', label: '信号源', type: 'select', options: []},
              {prop: 'urlL', label: '页面', type: 'select', options: []},
              {prop: 'isCloseL', label: '是否关闭信号源', width: 100, type: 'select', labelWidth: 120, options: []}
            ]
          },
          {
            prop: 'middle',
            label: '中屏',
            type: 'group',
            span: 24,
            children: [
              {prop: 'sourceM', label: '信号源', type: 'select', options: []},
              {prop: 'urlM', label: '页面', type: 'select', options: []},
              {prop: 'isCloseM', label: '是否关闭信号源', width: 100, type: 'select', labelWidth: 120, options: []}
            ]
          },
          {
            prop: 'right',
            label: '右屏',
            type: 'group',
            span: 24,
            children: [
              {prop: 'sourceR', label: '信号源', type: 'select', options: []},
              {prop: 'urlR', label: '页面', type: 'select', options: []},
              {prop: 'isCloseR', label: '是否关闭信号源', width: 100, type: 'select', labelWidth: 120, options: []}
            ]
          },
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
    components: { normalTable },
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
    },
    mounted() {
      this.initTableData()
    }
  }
</script>

<style scoped>

</style>
