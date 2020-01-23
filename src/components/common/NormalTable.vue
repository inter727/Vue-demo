<template>
  <div>
    <el-table class="normal-table" :data="data" v-bind="$attrs" v-on="$listeners">
      <el-table-column v-for="(item, index) in header" :key="index" :type="item.type" :prop="item.prop"
                       :label="item.label" :width="item.width" align="center" :fixed="item.fixed"
                       :filters="item.filters" :filter-method="filterHandle[item.prop]">
        <template v-if="item.children">
          <el-table-column v-for="(c, i) in item.children" :key="i" :prop="c.prop" :label="c.label"
                           :min-width="c.width" align="center"></el-table-column>
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
            <el-select v-else-if="item.type === 'select'" v-model="scope.row[item.prop]" :multiple="item.multiple">
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
        }
      }
    },
    props: {
      data: {type: Array, required: true},
      header: {type: Array, default: () => []},
      isAdding: {type: Boolean, default: false},
      filterHandle: {type: Object, default: () => ({})}
    },
    computed: {
      operation() {
        let operation = this.header.find(({ type }) => type === 'operation').operation
        return Object.keys(operation).reduce((obj, key) => {
          let tmObj = typeof operation[key] === 'object'
            ?  operation[key]
            : {type: operation[key], handles: this.handle[key]}
          return Object.assign(obj, {[key]: tmObj})
        }, {})
      }
    },
    methods: {
      handleFunc(handle, row, index) {
        this.$emit(handle, { row, index })
      }
    }
  }

</script>
<style>
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

  .normal-table .el-input__suffix .el-select__caret {
    height: 30px;
  }

  .normal-table .multiple-select {
    width: 100%;
  }

  .normal-table .el-tag + .el-tag {
    margin-left: 6px;
  }
</style>
