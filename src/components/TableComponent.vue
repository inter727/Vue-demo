<template>
  <normal-table :data="tableData" :header="headers" :stripe="true" :isAdding="isAdding" :filterHandle="filterHandle"
                @row-dblclick="handleEdit" @save="handleSave" @cancel="handleCancel" @add="handleAdd" @delete="handleDelete">
  </normal-table>
</template>
<script>
  import normalTable from './common/NormalTable.vue'
  import tableSetting from '../util/tableHeader.json'
  import tableData from '../data/tableData.json'
  export default {
    data() {
      return {
        headers: tableSetting['header']['default'],
        tableData: [],
        beforeEditData: [],
        isAdding: false,
        filterHandle: {
          days: this.filterDay
        },
        message: {
          edit: {type: 'info', message: '请先保存新增的数据'},
          add: {type: 'info', message: '编辑状态不能新增数据'},
          name: {type: 'info', message: '姓名不能为空'}
        }
      }
    },
    computed: {
      hasEditing() {
        return this.tableData.some(({ editing }) => editing)
      }
    },
    watch: {
      tableData: {
        handler(val) {
          if (this.hasEditing) { return }
          this.beforeEditData = $.extend(true, [], val)
        },
        deep: true
      }
    },
    components: { normalTable },
    methods: {
      initTableData() {
        this.clearData()
        let options = this.headers.find(({ prop }) => prop === 'days').options
        let daysObj = options.reduce((prev, { label, value }) => Object.assign(prev, {[value]: label}), {})
        this.tableData = tableData['default'].map(({ name, tourists, days, remark }) => {
          return {name, tourists: tourists.split(';'), days: daysObj[days], remark, editing: false}
        })
      },
      clearData() {
        this.tableData = []
      },
      handleEdit(row) {
        if (this.isAdding) {
          this.$message(this.message.edit)
          return
        }
        row.editing = true
      },
      handleCancel({ row, index }) {
        if (this.isAdding) {
          this.tableData.splice(index, 1)
          this.isAdding = false
          return
        }
        this.$set(this.tableData, index, this.beforeEditData[index])
      },
      handleSave({ row, index }) {
        if (this.isAdding && !row.name) {
          this.$message(this.message.name)
          return
        }
        this.isAdding = false
        row.editing = false
        this.$set(this.tableData, index, row)
      },
      handleAdd({ row, index }) {
        if (this.hasEditing) {
          this.$message(this.message.add)
          return
        }
        this.isAdding = true
        this.tableData.splice(index + 1, 0,
          {name: '', tourist: [], days: '一日游', remark: '', editing: true})
      },
      handleDelete({ row, index }) {
        this.$confirm('是否删除该行数据', '提醒', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.tableData.splice(index, 1)
        }).catch(() => {})
      },
      filterDay(value, row, column) {
        return row[column.property] === value
      }
    },
    mounted() {
      this.initTableData()
    }
  }
</script>
<style>

</style>
