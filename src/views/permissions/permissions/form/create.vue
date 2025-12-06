<template>
  <div>
    <el-form :model="formData" label-width="85px" ref="form" v-loading="loading" class="pr-4">
      <div class="flex flex-row justify-between">
        <div class="w-1/2">
          <el-form-item label="菜单类型" prop="type">
            <el-radio-group v-model="formData.type">
              <el-radio-button
                v-for="item in [
                  { label: '目录', value: 1 },
                  { label: '菜单', value: 2 },
                  { label: '按钮', value: 3 }
                ]"
                :key="item.value"
                :value="item.value"
                name="type"
              >
                {{ item.label }}
              </el-radio-button>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="菜单名称" prop="permission_name" :rules="[{ required: true, message: '菜单名称必须填写' }]">
            <el-input v-model="formData.permission_name" name="permission_name" clearable show-word-limit maxlength="30" />
          </el-form-item>
          <el-form-item label="所属模块" prop="module" :rules="[{ required: true, message: '所属模块必须填写' }]" v-if="!isAction">
            <Select v-model="formData.module" api="modules" @clear="clearModule" allow-create />
          </el-form-item>
          <el-form-item label="前端路径" prop="route" :rules="[{ required: true, message: '前端路由Path必须填写' }]" v-if="!isAction">
            <el-input v-model="formData.route" name="route" clearable show-word-limit maxlength="30" />
            <Prompt text="前端路径是指访问该菜单的前端路由路径，例如：/user/index，对应 vue router 得 path 参数" />
          </el-form-item>
          <el-form-item label="Redirect" prop="redirect" v-if="!isAction">
            <el-input v-model="formData.redirect" name="redirect" clearable show-word-limit maxlength="50" />
            <Prompt text="Redirect 对应 vue router 的重定向 redirect 参数" />
          </el-form-item>
          <el-form-item label="排序" prop="sort">
            <el-input-number v-model="formData.sort" name="sort" :min="1" />
          </el-form-item>
        </div>
        <div class="w-1/2">
          <el-form-item label="父级菜单" prop="parent_id">
            <el-cascader
              :options="permissions"
              name="parent_id"
              v-model="formData.parent_id"
              clearable
              :props="{
                value: 'id',
                label: 'permission_name',
                checkStrictly: true
              }"
              class="w-full"
            />
          </el-form-item>
          <el-form-item label="权限标识" prop="permission_mark" :rules="[{ required: true, message: '权限标识必须填写' }]" v-if="!isTop">
            <el-input v-model="formData.permission_mark" name="permission_mark" clearable v-if="isAction" />
            <Select v-model="formData.permission_mark" allow-create placeholder="请选择" api="controllers" :query="{ module: formData.module }" v-else />
            <Prompt text="权限标识，对应模块下的控制器名称下方法名称，例如 index" v-if="isAction" />
            <Prompt text="权限标识，对应模块下的控制器名称" v-else />
          </el-form-item>
          <el-form-item label="菜单Icon" prop="icon" v-if="!isAction">
            <el-popover placement="right" :width="400" trigger="click">
              <template #reference>
                <el-input v-model="formData.icon" name="icon" clearable>
                  <template #prefix>
                    <Icon :name="formData?.icon" className="w-5 h-5" v-if="formData?.icon" />
                  </template>
                </el-input>
              </template>
              <div>
                <Icons v-model="formData.icon" />
              </div>
            </el-popover>
          </el-form-item>
          <el-form-item label="所属组件" prop="component" v-if="!isAction">
            <Select v-model="formData.component" placeholder="请选择" allow-create api="components" :query="{ module: formData.module }" />
            <Prompt text="所属组件是指前端路由需要加载得组件，对应 vue router 得 component 参数，选择得组件会被自动导入" />
          </el-form-item>

          <el-form-item label="Hidden" prop="hidden" v-if="!isAction">
            <el-radio-group v-model="formData.hidden">
              <el-radio
                v-for="item in [
                  { label: '显示', value: 1 },
                  { label: '隐藏', value: 2 }
                ]"
                :key="item.value"
                :value="item.value"
                name="hidden"
              >
                {{ item.label }}
              </el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="Keepalive" prop="keepalive" v-if="!isAction">
            <el-radio-group v-model="formData.keepalive">
              <el-radio
                v-for="item in [
                  { label: '启用', value: 1 },
                  { label: '禁用', value: 2 }
                ]"
                :key="item.value"
                :value="item.value"
                name="keepalive"
              >
                {{ item.label }}
              </el-radio>
            </el-radio-group>
            <p class="text-sm">
              keepalive 参数可以缓存页面，而无需每次重新加载页面，具体<a target="_blank" class="text-blue-600" href="https://catchadmin.com/pro/docs/front/other#%E9%A1%B5%E9%9D%A2%E7%BC%93%E5%AD%98"
                >查看文档如何使用</a
              >
            </p>
          </el-form-item>
        </div>
      </div>
      <div>
        <el-form-item label="激活菜单" prop="active_menu" v-if="isMenu">
          <div class="flex flex-row w-full">
            <el-input v-model="formData.active_menu" name="active_menu" clearable class="w-3/4" />
            <el-tooltip effect="dark" :content="activeMenuIntro" raw-content placement="top">
              <div class="flex justify-center w-1/4 ml-2 text-red-500 cursor-pointer">说明</div>
            </el-tooltip>
          </div>
        </el-form-item>
      </div>
      <div class="flex justify-end">
        <el-button type="primary" @click="submitForm(form)">{{ $t('system.confirm') }}</el-button>
      </div>
    </el-form>

    <Dialog v-model="visible" title="选择 Icon" width="1000px" destroy-on-close>
      <Icons v-model="formData.icon" @close="closeSelectIcon" />
    </Dialog>
  </div>
</template>

<script lang="ts" setup>
// @ts-nocheck
import { useCreate } from '@/composables/curd/useCreate'
import { useShow } from '@/composables/curd/useShow'
import { useOpen } from '@/composables/curd/useOpen'
import { inject, onMounted, ref, watch } from 'vue'
import http from '@/support/http'
import { MenuType } from '@/enum/app'

const props = defineProps({
  primary: [String, Number],
  api: String
})

const activeMenuIntro =
  '<div>如果是访问内页的菜单路由，例如创建文章 create/post, 虽然它隶属于文章列表，但实际上并不会嵌套在文章列表路由里</div><div>而是单独的一个路由，并且是不显示在左侧菜单的。所以在访问它的时候，需要左侧菜单高亮，则需要设置该参数</div>'

const { formData, form, loading, submitForm, close, beforeCreate, beforeUpdate } = useCreate(props.api, props.primary)

// 选择 icon
const { visible } = useOpen()
// 关闭选择 icon
const closeSelectIcon = () => {
  visible.value = false
}

// 默认值
const defaultSort = 1
const defaultKeepalive = 1
const defaultHidden = 1

// 初始化
formData.value.sort = defaultSort
formData.value.keepalive = defaultKeepalive
formData.value.type = MenuType.TOP_TYPE
formData.value.hidden = defaultHidden

// 默认目录
const isTop = ref<boolean>(true)
const isMenu = ref<boolean>(false)
const isAction = ref<boolean>(false)

// 回显示表单
if (props.primary) {
  const { afterShow } = useShow(props.api, props.primary, formData)

  afterShow.value = (formData: any) => {
    if (formData.value.permission_mark.indexOf('@') !== -1) {
      formData.value.permission_mark = formData.value.permission_mark.split('@')[1]
    }
  }
}

const permissions = ref()
const closeDialog = inject('closeDialog')
onMounted(() => {
  http.get(props.api).then(r => {
    permissions.value = r.data.data
  })
  close(() => closeDialog())
  // 监听 form data
  watch(
    formData,
    () => {
      const type: number = formData.value.type
      if (type === MenuType.TOP_TYPE) {
        isTop.value = true
        isMenu.value = isAction.value = false
      } else if (type === MenuType.PAGE_TYPE) {
        isMenu.value = true
        isTop.value = isAction.value = false
      } else {
        isAction.value = true
        isTop.value = isMenu.value = false
      }
    },
    { deep: true }
  )
})

// 菜单是菜单类型的时，清除模块，那么权限标识&组件也需要清除
const clearModule = () => {
  if (formData.value.type === MenuType.TOP_TYPE || formData.value.type === MenuType.PAGE_TYPE) {
    formData.value.component = null
  }
  if (formData.value.type === MenuType.PAGE_TYPE) {
    formData.value.permission_mark = null
  }
}

// 创建前的钩子
beforeCreate.value = () => {
  formData.value.parent_id = getParent(formData.value.parent_id)
}

// 更新前的钩子
beforeUpdate.value = () => {
  formData.value.parent_id = getParent(formData.value.parent_id)
}

const getParent = (parentId: any) => {
  if (typeof parentId === 'number') {
    return parentId
  }

  return typeof parentId === 'undefined' ? 0 : parentId[parentId.length - 1]
}
</script>
