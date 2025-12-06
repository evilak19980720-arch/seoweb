<template>
  <div class="w-full h-[20rem]" v-loading="loading">
    <div class="w-7/12 mx-auto h-[18rem]">
      <iframe sandbox="allow-scripts allow-top-navigation" id="wechat" scrolling="no" width="300" height="400" frameBorder="0" allowTransparency="true" :src="webkitURL"></iframe>
    </div>
    <div class="flex justify-center w-full pl-5 text-base">
      <div class="flex">
        <span>打开微信</span>
        <svg xmlns="http://www.w3.org/2000/svg" enable-background="new 0 0 24 24" viewBox="0 0 24 24" id="wechat" class="w-10 h-10 pb-2">
          <g fill="#4caf50">
            <path
              d="m20.449 9.588c-6.388-3.248-13.648 2.715-10.328 8.186 1.541 2.57 5.099 4.193 9.309 2.975.842.327 1.592.857 2.408 1.251-.211-.71-.436-1.412-.676-2.111 4.35-3.099 3.398-8.213-.713-10.301zm-5.099 3.688c-.209.655-1.156.851-1.615.353-.506-.461-.309-1.424.355-1.63.734-.31 1.582.541 1.26 1.277zm4.78.094h.014c-.257.587-1.141.725-1.575.27-.209-.192-.27-.481-.344-.733.104-.46.42-.937.93-.959.705-.098 1.336.776.975 1.422z"
            ></path>
            <path
              d="m17.414 8.248c-.436-2.144-1.936-3.955-3.824-5h.027v-.001c-6.7-3.786-15.042 1.495-13.43 7.723.433 1.848 1.711 3.397 3.262 4.431-.3.853-.585 1.706-.855 2.565.975-.512 1.95-1.047 2.926-1.567 1.17.377 2.415.561 3.66.52-1.538-4.412 2.407-9.086 8.234-8.671zm-6.077-2.561c.785-.316 1.713.345 1.651 1.19l.002.012c.008.965-1.275 1.567-1.995.913-.747-.538-.535-1.845.342-2.115zm-4.405 1.447c-.172.838-1.291 1.243-1.946.68-.759-.537-.546-1.868.345-2.139.873-.338 1.865.552 1.601 1.459z"
            ></path>
          </g>
        </svg>
        <span>扫一扫登陆</span>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue'
import http from '@/support/http'
import { randomString } from '@/support/helper'
import Cache from '@/support/cache'
import { onBeforeRouteUpdate, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/modules/user'
const getState = (): string => {
  let code = Cache.get('wechat_state')
  if (code) {
    return code
  }
  code = randomString(6)
  Cache.set('wechat_state', code)
  return code
}

const delState = (): void => {
  Cache.del('wechat_state')
}
const appId = ref<string>()
const redirectUrl = ref<string>()
const webkitURL = ref<string>()
// 获取微信二维码
const getWechatQr = () => {
  http.get('auth/wechat').then(r => {
    appId.value = r.data.data.app_id
    redirectUrl.value = r.data.data.callback
    webkitURL.value =
      'https://open.weixin.qq.com/connect/qrconnect?appid=' +
      appId.value +
      '&scope=snsapi_login' +
      '&state=' +
      getState() +
      '&redirect_uri=' +
      redirectUrl.value +
      '&self_redirect=false' +
      '&href=data:text/css;base64,LmltcG93ZXJCb3ggLnFyY29kZSB7d2lkdGg6IDI1MHB4O2JvcmRlci1yYWRpdXM6MTVweH0NCi5pbXBvd2VyQm94IC50aXRsZSB7ZGlzcGxheTogbm9uZTt9DQouaW1wb3dlckJveCAuaW5mbyB7d2lkdGg6IDIwMHB4O30NCi5zdGF0dXNfaWNvbiB7ZGlzcGxheTogbm9uZX0NCi5pbXBvd2VyQm94IC5zdGF0dXMge3RleHQtYWxpZ246IGNlbnRlcjt9DQouaW5mb3tkaXNwbGF5Om5vbmV9'
  })
}
// 判断 Query 是否为空
const isEmptyQuery = (query: object) => {
  return Object.keys(query).length === 0
}

const loading = ref<boolean>(false)
// 如果 Query 是空
const login = (to: any) => {
  const router = useRouter()
  const query = to.query
  console.log(query)
  // console.log(isEmptyQuery())
  if (isEmptyQuery(query)) {
    getWechatQr()
  } else {
    const state = getState()
    delState()
    console.log(state)
    if (query.state !== state) {
      router.push('/login')
    } else {
      loading.value = true
      const store = useUserStore()
      store
        .login({ wx_code: query.code } as any)
        .then(async () => {
          await router.push({ path: '/' })
          loading.value = false
        })
        .catch(e => {
          loading.value = false
        })
    }
  }
}
getWechatQr()
onBeforeRouteUpdate((to, from) => {
  login(to)
})
</script>
