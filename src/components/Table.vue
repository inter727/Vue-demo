<template>
  <el-table class="tourist-table" :data="tableDatas">
    <el-table-column label="No." type="index" width="50" align="center"></el-table-column>
    <el-table-column label="operation" width="150" align="center"></el-table-column>
    <el-table-column v-for="header in headers" :label="header.label" :prop="header.propertyName"
                     :width="header.width || ''" align="center">
      <template slot-scope="scope">
        <div v-if="scope.row.editing">
          <el-select v-if="header.type === 'select'" v-model="scope.row[header.propertyName]">
            <el-option v-for="option in header.options" :key="option.value" :label="option.label"
                       :value="option.value"></el-option>
          </el-select>
          <el-select v-else-if="header.type === 'multiSelect'" v-model="scope.row[header.propertyName]" multiple>
            <el-option v-for="option in header.options" :key="option" :label="option" :value="option"></el-option>
          </el-select>
          <el-input v-else v-model="scope.row[header.propertyName]" :type="header.type"
                    :disabled="header.readOnly"></el-input>
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
        tableDatas: tableData['default']
      }
    }
  }
</script>
<style>
  .tourist-table th, .tourist-table td {
    padding: 4px 0;
  }
</style>
