<template>
  <div>
    <div v-if="tools.length" class="table-toolbar">
      <span v-for="tool in tools" :key="tool.label" @click="handleToolFunc(tool.handle)">
        <i :class="tool.class"></i>{{tool.label}}
      </span>
    </div>
    <el-table class="normal-table" :data="data" v-bind="$attrs" v-on="$listeners" @selection-change="handleSelectionChange">
      <el-table-column v-for="(item, index) in header" :key="index" :type="item.type" :prop="item.prop" :label="item.label"
                       :width="item.width" align="center" :fixed="item.fixed" :filters="item.filters"
                       :filter-method="filterHandle[item.prop]">
        <template v-if="item.children">
          <el-table-column v-for="(c, i) in item.children" :key="i" :prop="c.prop" :label="c.label" :width="c.width"
                           align="center"></el-table-column>
        </template>
        <template v-if="item.prop || item.type === 'operation'" v-slot="scope">
          <template v-if="scope.row.editing">
            <template v-if="item.type === 'operation'">
              <template v-for="handle in operation.editing.handles">
                <i v-if="operation.editing.type === 'icon'" :class="operaConfig.icon[handle].class"
                   :style="operaConfig.icon[handle].style" @click="handleFunc(handle, scope.row, scope.$index)"></i>
                <el-button v-else :type="operaConfig[operation.editing.type][handle].type" :key="handle" size="mini"
                           @click="handleFunc(handle, scope.row, scope.$index)">{{operaConfig.button[handle].label}}</el-button>
              </template>
            </template>
            <el-date-picker v-else-if="item.type === 'date'" v-model="scope.row[item.prop]" :type="item.dateType || 'date'"
                            :format="getFormat(item.dateType)" :value-format="getFormat(item.dateType)"
                            :placeholder="item.placeholder || '请选择'"></el-date-picker>
            <el-select v-else-if="item.type === 'select'" v-model="scope.row[item.prop]" :multiple="item.multiple" clearable>
              <el-option v-for="option in item.options" :key="option.value || option" :label="option.label || option"
                         :value="option.label || option"></el-option>
            </el-select>
            <el-input v-else v-model="scope.row[item.prop]" :type="item.type || 'text'"
                      :disabled="item.readOnly && !isAdding"></el-input>
          </template>
          <template v-else-if="item.type === 'operation'">
            <template v-for="handle in operation.default.handles">
              <i v-if="operation.default.type === 'icon'" :class="operaConfig.icon[handle].class"
                 :style="operaConfig.icon[handle].style" @click="handleFunc(handle, scope.row, scope.$index)"></i>
              <el-button v-else :type="operaConfig[operation.default.type][handle].type" :key="handle" size="mini"
                         @click="handleFunc(handle, scope.row, scope.$index)">{{operaConfig.button[handle].label}}</el-button>
            </template>
          </template>
          <el-tag v-else-if="item.tag" v-for="tag in scope.row[item.prop]" :key="tag">{{tag}}</el-tag>
          <template v-else>{{scope.row[item.prop]}}</template>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>
<script>
  export default {
    data() {
      return {
        handle: {
          default: ['up', 'down', 'add', 'delete', 'edit'],
          editing: ['cancel', 'save']
        },
        operaConfig: {
          icon: {
            add: {class: {'el-icon-plus': true}},
            cancel: {class: {'el-icon-close': true}, style: {color: '#f56c6c'}},
            delete: {class: {'el-icon-delete': true}},
            down: {class: {'el-icon-sort-down': true}},
            edit: {class: {'el-icon-edit': true}},
            save: {class: {'el-icon-check': true}, style: {color: '#5daf34'}},
            up: {class: {'el-icon-sort-up': true}}
          },
          text: {
            add: {type: 'text', label: '新增'},
            cancel: {type: 'text', label: '取消'},
            delete: {type: 'text', label: '删除'},
            down: {type: 'text', label: '下移'},
            edit: {type: 'text', label: '编辑'},
            save: {type: 'text', label: '保存'},
            up: {type: 'text', label: '上移'}
          },
          button: {
            add: {type: 'primary', label: '新增'},
            cancel: {type: 'default', label: '取消'},
            delete: {type: 'danger', label: '删除'},
            down: {type: 'default', label: '下移'},
            edit: {type: 'success', label: '编辑'},
            save: {type: 'success', label: '保存'},
            up: {type: 'default', label: '上移'}
          }
        },
        tool: {
          add: {class: {'el-icon-circle-plus': true}, label: '新增', handle: 'handleAdd'},
          delete: {class: {'el-icon-delete-solid': true}, label: '删除', handle: 'handleDelete'},
          export: {class: {'el-icon-download': true}, label: '导出', handle: 'handleExport'},
          save: {class: {'el-icon-success': true}, label: '保存', handle: 'handleSave'}
        },
        multipleSelection: []
      }
    },
    props: {
      data: {type: Array, required: true},
      header: {type: Array, default: () => []},
      isAdding: {type: Boolean, default: false},    //是否是新增状态
      filterHandle: {type: Object, default: () => ({})},    //过滤函数
      toolbars: {type: Array, default: () => []}    //表格上方工具栏
    },
    computed: {
      operation() {
        let operation = this.header.find(({ type }) => type === 'operation').operation
        return Object.entries(operation).reduce((obj, [key, value]) => {
          let tmObj = typeof value === 'object' ? value : {type: value, handles: this.handle[key]}
          return Object.assign(obj, {[key]: tmObj})
        }, {})
      },
      tools() {
        if (!this.toolbars.length) { return [] }
        return this.toolbars.map(tool => this.tool[tool])
      }
    },
    methods: {
      handleFunc(handle, row, index) {
        this.$emit(handle, { row, index })
      },
      handleToolFunc(handle) {
        if (handle === 'handleSave' || handle === 'handleDelete') {
          this.$emit(handle, this.multipleSelection)
          return
        }
        this.$emit(handle)
      },
      handleSelectionChange(val) {
        this.multipleSelection = val
      },
      getFormat(type) {
        switch (type) {
          case 'year':
            return 'yyyy'
          case 'month':
            return 'yyyy-MM'
          case 'datetime':
            return 'yyyy-MM-dd HH'
          default:
            return 'yyyy-MM-dd'
        }
      },
    }
  }

</script>
<style>
  .table-toolbar {
    padding: 0 0 2px 10px;
    margin-bottom: 6px;
    border-bottom: 1px solid #EBEEF5;
  }

  .table-toolbar span {
    cursor: pointer;
    margin-right: 4px;
    color: #909399;
    font-weight: 600;
  }

  .table-toolbar span [class ^='el-icon'] {
    font-size: 18px;
    margin-right: 4px;
  }
  
  .normal-table th, .normal-table td {
    padding: 4px 0;
  }

  .normal-table [class ^='el-icon'] {
    font-size: 18px;
    cursor: pointer;
    margin-right: 4px;
  }
  
  .normal-table .el-input .el-input__inner {
    height: 30px;
  }

  .normal-table .el-date-editor.el-input {
    width: 160px !important;
  }

  .normal-table .el-date-editor .el-input__icon {
    line-height: 30px;
  }

  .normal-table .el-input__suffix .el-select__caret {
     height: 30px;
   }

  .normal-table .el-select__caret .el-input__icon {
    line-height: 30px;
  }

  .normal-table .multiple-select {
    width: 100%;
  }

  .normal-table .el-tag + .el-tag {
    margin-left: 6px;
  }
</style>
