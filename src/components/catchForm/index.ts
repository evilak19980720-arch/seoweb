import type { App } from 'vue'
import formCreate from '@form-create/element-ui'
import UploadImage from '@/components/admin/upload/UploadImage.vue'
import UploadFile from '@/components/admin/upload/UploadFile.vue'
import UploadFiles from '@/components/admin/upload/UploadFiles.vue'
import AttachUpload from '@/components/admin/upload/AttachUpload.vue'
import OssUpload from '@/components/admin/upload/OssUpload.vue'
import CosUpload from '@/components/admin/upload/CosUpload.vue'
import IconSelect from '@/components/admin/icons/IconSelect.vue'
import RichText from '@/components/editor/RichText.vue'
import SelectOptions from '@/components/admin/select/SelectOptions.vue'
import RemoteCascader from '@/components/admin/remote/RemoteCascader.vue'
import RemoteSelect from '@/components/admin/remote/RemoteSelect.vue'
import RemoteTree from '@/components/admin/remote/RemoteTree.vue'
import RemoteTreeSelect from '@/components/admin/remote/RemoteTreeSelect.vue'
import RemoteApiSelect from '@/components/admin/remote/RemoteApiSelect.vue'
import UploadChunk from '@/components/admin/upload/ChunkUpload.vue'

import { ElTransfer, ElTreeSelect } from 'element-plus'

export function bootstrapFormCreate(app: App): void {
  formCreate.component('upload_image', UploadImage)
  formCreate.component('upload_file', UploadFile)
  formCreate.component('upload_files', UploadFiles)
  formCreate.component('upload_attach', AttachUpload)
  formCreate.component('upload_oss', OssUpload)
  formCreate.component('upload_cos', CosUpload)
  formCreate.component('icon_select', IconSelect)
  formCreate.component('rich_text', RichText)
  formCreate.component('select_options', SelectOptions)
  formCreate.component('transfer', ElTransfer)
  formCreate.component('tree_select', ElTreeSelect)
  formCreate.component('remote_cascader', RemoteCascader)
  formCreate.component('remote_select', RemoteSelect)
  formCreate.component('remote_tree', RemoteTree)
  formCreate.component('remote_tree_select', RemoteTreeSelect)
  formCreate.component('remote_api_select', RemoteApiSelect)
  formCreate.component('upload_chunk', UploadChunk)

  app.use(formCreate)
}
