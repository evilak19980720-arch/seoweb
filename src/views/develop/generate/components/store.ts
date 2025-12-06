import http from '@/support/http'
import { defineStore } from 'pinia'

/**
 * 表结构信息
 */
export interface Structure {
  field: string
  label: string
  form_component: string
  list: boolean
  form: boolean
  export: boolean
  import: boolean
  search: boolean
  search_op: string
  validates: string[]
  options?: any[] // options 信息
  dictionary?: number
  remote_data_params?: Object
}

/**
 * CodeGen
 */
export interface CodeGen {
  module: string
  controller: string
  model: string
  paginate: boolean
  schema: string
  form: boolean
  menu: string
  dymaic: boolean
  dialogForm: boolean
  operations?: Array<string> // 表格其他操作
  relations?: Array<any> // 模型关联关系
}

/**
 * generate
 */
interface generate {
  schemaId: number
  structures: Structure[]
  codeGen: CodeGen
}

/**
 * useGenerateStore
 */
export const useGenerateStore = defineStore('generateStore', {
  state(): generate {
    return {
      // schema id
      schemaId: 0,
      // structures
      structures: [] as Structure[],
      // codeGen
      codeGen: Object.assign({
        module: '',
        controller: '',
        model: '',
        paginate: true,
        schema: '',
        form: true,
        menu: '',
        dymaic: false,
        dialogForm: true,
        operations: [],
        relations: []
      })
    }
  },

  // store getters
  getters: {
    getSchemaId(): any {
      return this.schemaId
    },

    getStructures(): Structure[] {
      return this.structures
    },

    getCodeGen(): CodeGen {
      return this.codeGen
    }
  },

  // store actions
  actions: {
    async getSchemaData(schemaId: number) {
      await http.get('schema/' + schemaId).then(r => {
        if (r.data.data.generate_params) {
          this.setState(r.data.data.generate_params)
        } else {
          this.schemaId = schemaId
          this.codeGen.module = r.data.data.module
          this.codeGen.schema = r.data.data.name

          this.codeGen.model = r.data.data.name.replace(/\_(\w)/g, (value: any, letter: any) => {
            return letter.toUpperCase()
          })

          this.codeGen.model = this.codeGen.model[0].toUpperCase() + this.codeGen.model.slice(1)
          this.codeGen.controller = this.codeGen.model
          this.codeGen.operations = []
          this.codeGen.relations = []
          this.resetStructures()
          this.initStructures(r.data.data.columns)
        }
      })
    },
    updateSchemaData(schemaId: number) {
      if (!this.getSchemaId) {
        this.schemaId = schemaId
        this.getSchemaData(schemaId)
      }
      if (schemaId !== this.getSchemaId) {
        this.schemaId = schemaId
        this.structures = []
        this.getSchemaData(schemaId)
      }
    },
    // set schema
    setSchemaId(schemaId: any): void {
      this.schemaId = schemaId
    },
    // reset
    resetStructures(): void {
      this.structures = []
    },
    // filter structures
    filterStructures(field: string) {
      this.structures = this.structures.filter((s: Structure) => {
        return !(s.field === field)
      })
    },

    setStructures(structures: Structure[]): void {
      this.structures = structures
    },

    // init structure
    initStructures(fields: Array<any>): void {
      const unSupportFields = ['deleted_at', 'creator_id']

      fields.forEach(field => {
        if (!unSupportFields.includes(field.name)) {
          this.structures.push(
            Object.assign({
              field: field.name,
              label: field.label,
              form_component: field.component,
              list: true,
              import: false,
              export: false,
              form: field.form,
              search: false,
              search_op: '',
              validates: [],
              options: field.options,
              dictionary: null,
              remote_data_params: null
            })
          )
        }
      })
    },

    resetFormComponents(): void {
      this.structures.forEach((s: Structure) => {
        s.form_component = ''
      })
    },

    setState(state: any): void {
      this.setSchemaId = state.schemaId
      this.structures = state.structures
      this.codeGen = state.codeGen
    }
  }
})
