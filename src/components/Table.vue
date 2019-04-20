<template>
  <el-table class="tourist-table" :data="tableDatas" @row-dblclick="handleEdit">
    <el-table-column label="No." type="index" width="50" align="center"></el-table-column>
    <el-table-column label="operation" width="150" align="center">
      <template slot-scope="scope">
        <i v-if="scope.row.editing" class="el-icon-close" style="color: #f56c6c;"
           @click="handleCancel(scope.row, scope.$index)"></i>
        <i v-if="scope.row.editing" class="el-icon-check" style="color: #5daf34;"
           @click="handleSave(scope.row)"></i>
        <i v-if="!scope.row.editing" class="el-icon-plus" @click="handleAdd(scope.row)"></i>
        <i v-if="!scope.row.editing" class="el-icon-delete" @click="handleDelete(scope.row)"></i>
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
                    :disabled="header.readOnly"></el-input>
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
        beforeEditDatas: []
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
        row.editing = true
      },
      handleCancel(row, index) {
        this.$set(this.tableDatas, index, this.beforeEditDatas[index])
      },
      handleSave(row) {
        row.editing = false
      },
      handleAdd(row) {},
      handleDelete(row) {}
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
