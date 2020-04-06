/***********************************************************

*FileName:     FormDialog.vue
*Description:  表单弹窗组件
*Version:      1.0.0
*Author:       张斌尧
*CreateDate:   2020/4/5
*Detail:       在ElementUI的弹框组件基础上进行二次封装，弹框组件自带的属性和事件，本组件均支持
               弹框中表单支持文本输入框、文本域、单/多选下拉选择框、日期时间选择器这些控件
               可自定义控件布局方式，还可将几个控件归为一组
               表单还支持控件不可编辑，自定义提交验证规则
*需改进地方：    加入插槽，可在弹框中显示开发者插入的第三方组件

***********************************************************/

<template>
  <el-dialog
    :visible.sync="dialogVisible"
    class="form-dialog"
    v-bind="$attrs"
    v-on="$listeners"
    :title="handle[dialogType] || ''"
    :before-close="closeDialog"
  >
    <el-form :model="form" ref="dialogForm" :rules="rule" label-width="80px">
      <el-row>
        <el-col v-for="item in formData" :key="item.prop" :span="item.span || 12">
          <template v-if="item.type === 'group'">
            <el-divider content-position="left">{{ item.label }}</el-divider>
            <el-row>
              <el-col v-for="child in item.children" :key="child.prop" :span="child.span || 12">
                <el-form-item :prop="child.prop" :label="child.label" :label-width="child.labelWidth">
                  <el-date-picker
                    v-if="child.type === 'date'"
                    v-model="form[child.prop]"
                    :type="child.dateType || 'date'"
                    :format="getFormat(child.dateType)"
                    :value-format="getFormat(child.dateType)"
                    :placeholder="child.placeholder || '请选择'"
                    :disabled="dialogType === 'edit' && child.readOnly"
                  ></el-date-picker>
                  <el-select v-else-if="child.type === 'select'" v-model="form[child.prop]" :multiple="child.multiple" 
                             :disabled="dialogType === 'edit' && child.readOnly" clearable>
                    <el-option
                      v-for="option in child.options"
                      :key="option.value || option"
                      :value="option.value || option"
                      :label="option.label || option"
                    ></el-option>
                  </el-select>
                  <el-input
                    v-else
                    v-model="form[child.prop]"
                    :type="child.type"
                    :disabled="dialogType === 'edit' && child.readOnly"
                  ></el-input>
                </el-form-item>
              </el-col>
            </el-row>
          </template>
          <slot v-else-if="item.type === 'slot'" :name="item.prop"></slot>
          <el-form-item v-else :prop="item.prop" :label="item.label" :label-width="item.labelWidth">
            <el-date-picker
              v-if="item.type === 'date'"
              v-model="form[item.prop]"
              :type="item.dateType || 'date'"
              :format="getFormat(item.dateType)"
              :value-format="getFormat(item.dateType)"
              :placeholder="item.placeholder || '请选择'"
              :disabled="dialogType === 'edit' && item.readOnly"
            ></el-date-picker>
            <el-select v-else-if="item.type === 'select'" v-model="form[item.prop]" :multiple="item.multiple"
                       :disabled="dialogType === 'edit' && item.readOnly" clearable>
              <el-option
                v-for="option in item.options"
                :key="option.value || option"
                :value="option.value || option"
                :label="option.label || option"
              ></el-option>
            </el-select>
            <el-input
              v-else
              v-model="form[item.prop]"
              :type="item.type"
              :disabled="dialogType === 'edit' && item.readOnly"
            ></el-input>
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
    name: 'FormDialog',
    data() {
      return {
        form: {},
        handle: { 'add': '新增', 'edit': '修改' }
      }
    },
    props: {
      dialogVisible: { type: Boolean, required: true },
      dialogType: { type: String, required: true }, // 弹框类型（'add', 'edit'）
      formData: { type: Array, required: true }
    },
    computed: {
      rule() {
        return this.formData.reduce((obj, { prop, rules }) => {
          if (!rules) { return obj }
          return Object.assign(obj, { [prop]: rules })
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
            return item.children.reduce((prev, { prop, value }) => Object.assign(prev, { [prop]: value }), obj)
          }
          return Object.assign(obj, { [item.prop]: item.value })
        }, {})
      }
    },
    methods: {
      save(formName) {
        this.$refs[formName].validate(valid => {
          if (!valid) { return }
          const formData = this.formData.map(item => {
            if (item.type === 'group') {
              item.children = item.children.map(child => Object.assign(child, { value: this.form[child.prop] }))
              return item
            }
            return { prop: item.prop, label: item.label, value: this.form[item.prop] }
          })
          this.$emit('saveData', formData, this.dialogType)
          this.closeDialog()
        })
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
      closeDialog() {
        this.$emit('update:dialogVisible', false)
      }
    }
  }
</script>

<style>
  .form-dialog .el-dialog {
    height: calc(100vh - 100px);
    min-height: 400px;
    overflow-y: auto;
  }

  .form-dialog .el-dialog__footer {
    text-align: center;
  }

  .form-dialog .el-input .el-input__inner {
    height: 30px;
  }

  .form-dialog .el-date-editor.el-input,
  .form-dialog .el-date-editor.el-input__inner {
    width: 100%;
  }
</style>
