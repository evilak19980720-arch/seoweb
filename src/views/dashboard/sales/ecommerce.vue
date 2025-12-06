<template>
  <div class="grid grid-cols-1 gap-y-2 md:gap-y-0 md:grid-cols-4 gap-x-4">
    <el-card class="rounded-md" shadow="hover">
      <div class="flex justify-between text-sm font-semibold">
        订单总量
        <div class="text-green-500">+12%</div>
      </div>
      <div class="flex flex-row justify-between py-4">
        <div class="relative self-center text-center text-pink-500 bg-pink-100 rounded-full w-14 h-14 dark:bg-pink-900 dark:bg-opacity-40">
          <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" class="absolute w-8 h-8 transform -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2 bi bi-cart3" viewBox="0 0 16 16">
            <path
              d="M0 1.5A.5.5 0 0 1 .5 1H2a.5.5 0 0 1 .485.379L2.89 3H14.5a.5.5 0 0 1 .49.598l-1 5a.5.5 0 0 1-.465.401l-9.397.472L4.415 11H13a.5.5 0 0 1 0 1H4a.5.5 0 0 1-.491-.408L2.01 3.607 1.61 2H.5a.5.5 0 0 1-.5-.5zM3.102 4l.84 4.479 9.144-.459L13.89 4H3.102zM5 12a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm7 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm-7 1a1 1 0 1 1 0 2 1 1 0 0 1 0-2zm7 0a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"
            ></path>
          </svg>
        </div>
        <h2 class="self-center text-3xl">421</h2>
      </div>
      <div class="flex justify-end w-full">
        <a class="text-sm hover:text-indigo-500" href="#">查看更多</a>
      </div>
    </el-card>

    <el-card class="rounded-md" shadow="hover">
      <div class="flex justify-between text-sm font-semibold">
        总销售额
        <div class="text-green-500 ltr:float-right rtl:float-left">+15%</div>
      </div>
      <div class="flex flex-row justify-between py-4">
        <div class="relative self-center text-center text-yellow-500 bg-yellow-100 rounded-full w-14 h-14 dark:bg-yellow-900 dark:bg-opacity-40">
          <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" class="absolute w-8 h-8 transform -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2 bi bi-credit-card" viewBox="0 0 16 16">
            <path d="M0 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V4zm2-1a1 1 0 0 0-1 1v1h14V4a1 1 0 0 0-1-1H2zm13 4H1v5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V7z"></path>
            <path d="M2 10a1 1 0 0 1 1-1h1a1 1 0 0 1 1 1v1a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1v-1z"></path>
          </svg>
        </div>
        <h2 class="self-center text-3xl"><span>￥</span>31K</h2>
      </div>
      <div class="flex justify-end w-full">
        <a class="text-sm hover:text-indigo-500" href="#">查看更多</a>
      </div>
    </el-card>
    <el-card class="rounded-md" shadow="hover">
      <div class="flex justify-between text-sm font-semibold">
        新用户
        <div class="text-pink-500 ltr:float-right rtl:float-left">-5%</div>
      </div>
      <div class="flex flex-row justify-between py-4">
        <div class="relative self-center text-center text-green-500 bg-green-100 rounded-full w-14 h-14 dark:bg-green-900 dark:bg-opacity-40">
          <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" class="absolute w-8 h-8 transform -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2 bi bi-person" viewBox="0 0 16 16">
            <path
              d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4zm-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10c-2.29 0-3.516.68-4.168 1.332-.678.678-.83 1.418-.832 1.664h10z"
            ></path>
          </svg>
        </div>
        <h2 class="self-center text-3xl">1.2K</h2>
      </div>
      <div class="flex justify-end w-full">
        <a class="text-sm hover:text-indigo-500" href="#">查看更多</a>
      </div>
    </el-card>
    <el-card class="rounded-md" shadow="hover">
      <div class="flex justify-between text-sm font-semibold">在线用户 <span class="w-2 h-2 mt-1 bg-green-500 rounded-full ltr:float-right rtl:float-left animate-pulse"></span></div>
      <div class="flex flex-row justify-between py-4">
        <div class="relative self-center text-center text-indigo-500 bg-indigo-100 rounded-full w-14 h-14 dark:bg-indigo-900 dark:bg-opacity-40">
          <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" class="absolute w-8 h-8 transform -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2 bi bi-people" viewBox="0 0 16 16">
            <path
              d="M15 14s1 0 1-1-1-4-5-4-5 3-5 4 1 1 1 1h8zm-7.978-1A.261.261 0 0 1 7 12.996c.001-.264.167-1.03.76-1.72C8.312 10.629 9.282 10 11 10c1.717 0 2.687.63 3.24 1.276.593.69.758 1.457.76 1.72l-.008.002a.274.274 0 0 1-.014.002H7.022zM11 7a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm3-2a3 3 0 1 1-6 0 3 3 0 0 1 6 0zM6.936 9.28a5.88 5.88 0 0 0-1.23-.247A7.35 7.35 0 0 0 5 9c-4 0-5 3-5 4 0 .667.333 1 1 1h4.216A2.238 2.238 0 0 1 5 13c0-1.01.377-2.042 1.09-2.904.243-.294.526-.569.846-.816zM4.92 10A5.493 5.493 0 0 0 4 13H1c0-.26.164-1.03.76-1.724.545-.636 1.492-1.256 3.16-1.275zM1.5 5.5a3 3 0 1 1 6 0 3 3 0 0 1-6 0zm3-2a2 2 0 1 0 0 4 2 2 0 0 0 0-4z"
            ></path>
          </svg>
        </div>
        <h2 class="self-center text-3xl">602</h2>
      </div>
      <div class="flex justify-end w-full">
        <a class="text-sm hover:text-indigo-500" href="#">查看更多</a>
      </div>
    </el-card>
  </div>
</template>
