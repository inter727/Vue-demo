<template>
  <el-table class="tourist-table" :data="tableDatas" @row-dblclick="handleEdit">
    <el-table-column label="No." type="index" width="50" align="center"></el-table-column>
    <el-table-column label="operation" width="150" align="center">
      <template slot-scope="scope">
        <i v-if="scope.row.editing" class="el-icon-close" style="color: #f56c6c;"
           @click="handleCancel(scope.row, scope.$index)"></i>
        <i v-if="scope.row.editing" class="el-icon-check" style="color: #5daf34;"
           @click="handleSave(scope.row, scope.$index)"></i>
        <i v-if="!scope.row.editing" class="el-icon-plus" @click="handleAdd(scope.row, scope.$index)"></i>
        <i v-if="!scope.row.editing" class="el-icon-delete" @click="handleDelete(scope.row, scope.$index)"></i>
      </template>
    </el-table-column>
    <el-table-column v-for="header in headers" :key="header.propertyName" :label="header.label"
                     :prop="header.propertyName" :width="header.width || ''" align="center">
      <template slot-scope="scope">
        <div v-if="scope.row.editing">
          <el-select v-if="header.type === 'select'" v-model="scope.row[header.propertyName]">
            <el-option v-for="option in header.options" :key="option.value" :label="option.label"
                       :value="option.label"></el-option>
          </el-select>
          <el-select v-else-if="header.type === 'multiSelect'" v-model="scope.row[header.propertyName]"
                     class="multiple-select" multiple>
            <el-option v-for="option in header.options" :key="option" :label="option" :value="option"></el-option>
          </el-select>
          <el-input v-else v-model="scope.row[header.propertyName]" :type="header.type"
                    :disabled="header.readOnly && !isAdding"></el-input>
        </div>
        <div v-else-if="header.tag">
          <el-tag v-for="tourist in scope.row[header.propertyName]" :key="tourist">{{tourist}}</el-tag>
        </div>
        <span v-else>{{scope.row[header.propertyName]}}</span>
      </template>
    </el-table-column>
  </el-table>
</template>
<script>
  import tableSetting from '../util/tableSetting.json'
  import tableData from '../data/tableData.json'
  export default {
    data() {
      return {
        headers: tableSetting['header']['default'],
        tableDatas: [],
        beforeEditDatas: [],
        isAdding: false,
        message: {
          edit: {type: 'info', message: '请先保存新增的数据'},
          add: {type: 'info', message: '编辑状态不能新增数据'},
          name: {type: 'info', message: '姓名不能为空'}
        }
      }
    },
    computed: {
      hasEditing() {
        return this.tableDatas.some(({ editing }) => editing)
      }
    },
    watch: {
      tableDatas: {
        handler(val) {
          if (this.hasEditing) { return }
          this.beforeEditDatas = $.extend(true, [], val)
        },
        deep: true
      }
    },
    methods: {
      initTableData() {
        this.clearData()
        let options = this.headers.find(({ propertyName }) => propertyName === 'days').options
        let daysObj = options.reduce((prev, { label, value }) => Object.assign(prev, {[value]: label}), {})
        this.tableDatas = tableData['default'].map(({ name, tourists, days, remark }) => {
          return {name, tourists: tourists.split(';'), days: daysObj[days], remark, editing: false}
        })
      },
      clearData() {
        this.tableDatas = []
      },
      handleEdit(row) {
        if (this.isAdding) {
          this.$message(this.message.edit)
          return
        }
        row.editing = true
      },
      handleCancel(row, index) {
        if (this.isAdding) {
          this.tableDatas.splice(index, 1)
          this.isAdding = false
          return
        }
        this.$set(this.tableDatas, index, this.beforeEditDatas[index])
      },
      handleSave(row, index) {
        if (this.isAdding && !row.name) {
          this.$message(this.message.name)
          return
        }
        this.isAdding = false
        row.editing = false
        this.$set(this.tableDatas, index, row)
      },
      handleAdd(row, index) {
        if (this.hasEditing) {
          this.$message(this.message.add)
          return
        }
        this.isAdding = true
        this.tableDatas.splice(index + 1, 0,
          {name: '', tourist: [], days: '一日游', remark: '', editing: true})
      },
      handleDelete(row, index) {
        this.$confirm('是否删除该行数据', '提醒', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.tableDatas.splice(index, 1)
        }).catch(() => {})
      }
    },
    mounted() {
      this.initTableData()
    }
  }
</script>
<style>
  .tourist-table th, .tourist-table td {
    padding: 4px 0;
  }

  .tourist-table .multiple-select {
    width: 100%;
  }

  .tourist-table [class ^='el-icon'] {
    font-size: 18px;
    cursor: pointer;
  }

  .tourist-table .el-tag + .el-tag {
    margin-left: 6px;
  }
</style>
