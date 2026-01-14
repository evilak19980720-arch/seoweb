// i18n 统一入口：通过 VITE_I18N_MODE 选择 static（本地） 或 dynamic（后端）
import { bootstrapI18n as staticBootstrap, default as staticI18n } from './static'
import { bootstrapI18n as dynamicBootstrap, default as dynamicI18n } from './dynamic'

const isDynamic = (import.meta.env.VITE_I18N_MODE ?? 'dynamic') === 'dynamic'

export const bootstrapI18n = isDynamic ? dynamicBootstrap : staticBootstrap
export default isDynamic ? dynamicI18n : staticI18n
