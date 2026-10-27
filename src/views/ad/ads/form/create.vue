<template>
  <el-form :model="formData" label-width="100px" ref="form" v-loading="loading" class="pr-4">
    <el-form-item label="广告名称" prop="name" :rules="[{ required: true, message: '广告名称必须填写' }]">
      <el-input v-model="formData.name" maxlength="100" />
    </el-form-item>
    <el-form-item label="广告位" prop="position" :rules="[{ required: true, message: '请选择广告位' }]">
      <el-select v-model="formData.position" class="w-full">
        <el-option v-for="item in positions" :key="item.value" :label="item.label" :value="item.value" />
      </el-select>
      <Prompt text="每个广告位每页只显示一个广告，多个广告按权重随机；文章不足 600 词时不显示正文上方广告" />
    </el-form-item>
    <el-form-item label="类型" prop="type">
      <el-radio-group v-model="formData.type">
        <el-radio :value="1">图片 + 链接</el-radio>
        <el-radio :value="2">自定义代码</el-radio>
      </el-radio-group>
    </el-form-item>
    <template v-if="formData.type === 1">
      <el-form-item label="图片" prop="image" :rules="[{ required: true, message: '请上传图片' }]">
        <UploadImage v-model="formData.image" />
      </el-form-item>
      <el-form-item label="图片尺寸">
        <el-input-number v-model="formData.width" :min="0" :max="4000" controls-position="right" />
        <span class="mx-2">×</span>
        <el-input-number v-model="formData.height" :min="0" :max="4000" controls-position="right" />
        <Prompt text="填写图片实际宽高，避免页面加载时跳动" />
      </el-form-item>
      <el-form-item label="跳转地址" prop="link" :rules="[{ required: true, message: '跳转地址必须填写' }]">
        <el-input v-model="formData.link" maxlength="500" placeholder="https://" />
      </el-form-item>
      <el-form-item label="图片说明" prop="alt">
        <el-input v-model="formData.alt" maxlength="191" placeholder="葡萄牙语，例如 Jogue Turbo Race grátis" />
      </el-form-item>
    </template>
    <el-form-item v-else label="广告代码" prop="html" :rules="[{ required: true, message: '广告代码必须填写' }]">
      <el-input v-model="formData.html" type="textarea" :rows="8" />
      <Prompt text="代码原样输出到页面，外链请加 rel=&quot;sponsored&quot;" />
    </el-form-item>
    <el-form-item label="投放站点" prop="site_ids">
      <RemoteApiSelect v-model="formData.site_ids" api="site/sites" search-field="keywords" label="name" value="id" multiple class="w-full" placeholder="不选则投放全部站点" />
    </el-form-item>
    <el-form-item label="投放时间">
      <el-date-picker v-model="startAt" type="datetime" value-format="X" placeholder="立即开始" />
      <span class="mx-2">~</span>
      <el-date-picker v-model="endAt" type="datetime" value-format="X" placeholder="不限" />
    </el-form-item>
    <el-form-item label="权重" prop="weight">
      <el-input-number v-model="formData.weight" :min="1" :max="100" />
    </el-form-item>
    <el-form-item label="状态" prop="status">
      <el-radio-group v-model="formData.status">
        <el-radio :value="1">启用</el-radio>
        <el-radio :value="2">禁用</el-radio>
      </el-radio-group>
    </el-form-item>
    <div class="flex justify-end">
      <el-button type="primary" @click="submitForm(form)">{{ $t('system.confirm') }}</el-button>
    </div>
  </el-form>
</template>

<script lang="ts" setup>
// @ts-nocheck
import { useCreate } from '@/composables/curd/useCreate'
import { useShow } from '@/composables/curd/useShow'
import RemoteApiSelect from '@/components/admin/remote/RemoteApiSelect.vue'
import { computed, inject, onMounted } from 'vue'

const props = defineProps({
  primary: [String, Number],
  api: String,
  positions: Array
})

const { formData, form, loading, submitForm, close } = useCreate(props.api, props.primary)

Object.assign(formData.value, { type: 1, weight: 1, status: 1, width: 0, height: 0, site_ids: [] })

if (props.primary) {
  useShow(props.api, props.primary, formData)
}

// 后端用 0 表示不限，选择器用空值表示
const timeField = (key: string) =>
  computed({
    get: () => (formData.value[key] ? String(formData.value[key]) : null),
    set: (value: string | null) => {
      formData.value[key] = value ? Number(value) : 0
    }
  })
const startAt = timeField('start_at')
const endAt = timeField('end_at')

const closeDialog = inject('closeDialog')
onMounted(() => {
  close(() => closeDialog())
})
</script>
