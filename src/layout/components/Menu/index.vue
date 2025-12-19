<script lang="ts">
import { h, defineComponent, VNode, watch, ref } from 'vue'
import { usePermissionsStore } from '@/stores/modules/user/permissions'
import MenuItem from './item.vue'
import menus from './menus.vue'
import { useUserStore } from '@/stores/modules/user'
import { Menu } from '@/types/Menu'
import { useAppStore } from '@/stores/modules/app'

/**
 * 递归渲染 Menu 节点
 */
function getVNodes(menus: Menu[] | undefined, _subMenuClass: string | undefined): VNode[] {
  const vnodes: VNode[] = []
  menus?.forEach(menu => {
    if (!menu.meta?.hidden) {
      let vnode: VNode
      const len = menu.children?.length
      if (len) {
        vnode = h(
          MenuItem,
          {
            subMenuClass: _subMenuClass,
            menu
          },
          {
            default: () => getVNodes(menu.children, 'children-menu')
          }
        )
      } else {
        vnode = h(MenuItem, {
          subMenuClass: _subMenuClass,
          menu
        })
      }
      vnodes.push(vnode)
    }
  })

  return vnodes
}

/**
 * filter menus
 *
 * @param menus
 */
function filterMenus(menus: Menu[] | undefined): Menu[] {
  const newMenus: Menu[] = []

  menus?.forEach(m => {
    if (m.meta?.hidden) {
      return false
    }

    if (isHasOnlyChild(m) && m.children?.length) {
      newMenus.push(
        Object.assign({
          path: m.children[0].path,
          meta: m.children[0].meta,
          name: m.name
        })
      )
    } else {
      newMenus.push(m)
    }
  })

  return newMenus
}

/**
 * is has only child
 *
 * @param menu
 */
function isHasOnlyChild(menu: Menu): boolean {
  if (menu.children === undefined) {
    return true
  }

  if (menu.children.length > 1 || !menu.children.length) {
    return false
  }

  if (menu.children[0].children?.length) {
    return false
  }

  return true
}

export default defineComponent({
  props: {
    subMenuClass: {
      type: String,
      require: true
    },
    menuClass: {
      type: String,
      require: true
    }
  },
  setup(props, ctx) {
    const permissionsStore = usePermissionsStore()
    const userStore = useUserStore()
    const appStore = useAppStore()
    
    // 获取当前权限（响应式 getter）
    const getPermissions = () => userStore.getPermissions === undefined ? [] : userStore.getPermissions

    // 初始化菜单节点
    const vnodes = ref(getVNodes(filterMenus(permissionsStore.getMenusFrom(getPermissions(), true)), props.subMenuClass))
    
    // 监听双栏模式状态、激活菜单变化、以及权限变化
    watch(
      () => [permissionsStore.getVerticalActiveMenuName, appStore.getVertical, userStore.getPermissions],
      () => {
        // 重新获取最新权限并刷新菜单
        vnodes.value = getVNodes(filterMenus(permissionsStore.getMenusFrom(getPermissions(), true)), props.subMenuClass)
      }
    )
    /**
    watch(
      () => appStore.getVertical,
      () => {
        permissionsStore.setVerticalActiveMenuName('dashboard')
        vnodes.value = getVNodes(filterMenus(permissionsStore.getMenusFrom(permissions, true)), props.subMenuClass)
      }
    ) */
    return () => {
      return h(
        menus,
        {
          class: 'border-none side-menu ' + props.menuClass
        },
        {
          default: () => vnodes.value
        }
      )
    }
  }
})
</script>
