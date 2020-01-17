<template>
  <el-dialog :visible.sync="dialogVisible" class="form-dialog" :top="top" :width="width" :title="handle[dialogType] || ''"
             :before-close="closeDialog">
    <el-form :model="form" :rules="rule" ref="dialogForm" label-width="80px">
      <el-row>
        <el-col v-for="item in formData" :key="item.prop" :span="item.span || 12">
          <template v-if="item.type === 'group'">
            <el-divider content-position="left">{{item.label}}</el-divider>
            <el-row>
              <el-col v-for="child in item.children" :key="child.prop" :span="child.span || 12">
                <el-form-item :prop="child.prop" :label="child.label" :label-width="child.labelWidth">
                  <el-select v-if="child.type === 'select'" v-model="form[child.prop]">
                    <el-option v-for="{value, label} in child.options" :key="value" :value="value"
                               :label="label"></el-option>
                  </el-select>
                  <el-input v-else v-model="form[child.prop]" type="text"></el-input>
                </el-form-item>
              </el-col>
            </el-row>
          </template>
          <el-form-item v-else :prop="item.prop" :label="item.label" :label-width="item.labelWidth">
            <el-date-picker v-if="item.type === 'date'" v-model="form[item.prop]" :type="item.dateType || 'date'"
                            :placeholder="item.placeholder || '请选择'"></el-date-picker>
            <el-input v-else v-model="form[item.prop]" type="text"
                      :disabled="dialogType === 2 && item.disabled"></el-input>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <span slot="footer">
            <el-button @click="closeDialog">取 消</el-button>
            <el-button type="primary" @click="save('dialogForm')">确 定</el-button>
        </span>
  </el-dialog>
</template>

<script>
  export default {
    name: "FormDialog",
    data() {
      return {
        form: {},
        handle: {'add': '新增', 'edit': '修改'}
      }
    },
    props: {
      dialogVisible: {type: Boolean, required: true},
      dialogType: {type: String, required: true},
      formData: {type: Array, required: true},
      top: {type: String, default: '15vh'},
      width: {type: String, default: '600px'}
    },
    computed: {
      rule() {
        return this.formData.reduce((obj, { prop, rules }) => {
          if (!rules) { return obj }
          return Object.assign(obj, {[prop]: rules})
        }, {})
      }
    },
    watch: {
      dialogVisible(val) {
        if (!val) {
          this.form = {}
          return
        }
        this.form = this.formData.reduce((obj, item) => {
          if (item.type === 'group') {
            return item.children.reduce((prev, { prop, value }) => Object.assign(prev, {[prop]: value}), obj)
          }
          return Object.assign(obj, {[item.prop]: item.value})
        }, {})
      }
    },
    methods: {
      save(formName) {
        this.$refs[formName].validate(valid => {
          if (!valid) { return }
          let formData = this.formData.map(item => {
            if (item.type === 'group') {
              item.children = item.children.map(child => Object.assign(child, {value: this.form[child.prop]}))
              return item
            }
            return {
              prop: item.prop,
              label: item.label,
              value: item.type === 'date'
                ? this.$moment(this.form[item.prop]).format(this.getFormat(item.dateType))
                : this.form[item.prop]
            }
          })
          this.$emit('saveData', formData, this.dialogType)
          this.closeDialog()
        })
      },
      getFormat(type) {
        switch (type) {
          case 'year':
            return 'YYYY'
          case 'month':
            return 'YYYY-MM'
          case 'datetime':
            return 'YYYY-MM-DD HH:mm'
          default:
            return 'YYYY-MM-DD'
        }
      },
      closeDialog() {
        this.$emit('update:dialogVisible', false)
      }
    }
  }
</script>

<style>
  .form-dialog .el-dialog__footer {
    text-align: center;
  }
  .form-dialog .el-date-editor.el-input,
  .form-dialog .el-date-editor.el-input__inner {
    width: 200px;
  }
</style>