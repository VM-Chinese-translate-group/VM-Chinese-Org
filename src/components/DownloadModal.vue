<script setup>
import Swal from 'sweetalert2'

const props = defineProps({
  items: { type: Array, default: () => [] },
})

const QUESTIONS = [
  {
    title: '语文题',
    content: '2023北京中考语文2、3。请用连续不加空格的字母作答，忽略大小写。比如AB。',
    correctAnswer: 'DB',
    imageUrl: 'imgs/questions/chinese.png',
    isInput: true,
  },
  {
    title: '数学题',
    content: '2023北京中考数学8',
    correctAnswer: 'D',
    imageUrl: 'imgs/questions/math.jpg',
  },
  {
    title: '物理题',
    content:
      '小瑶同学在一次实验中将定值电阻R两端的电压从2V增加到3V，她观察到和R串联的电流表的示数变化了0.1A。下列判断正确的是<br><br>A. 电阻R的阻值为20Ω<br>B. 电阻R的阻值从20Ω变为30Ω<br>C. 电阻R消耗的电功率增加了0.5W<br>D. 电阻R消耗的电功率从0.2W变为0.3W<br>（2023北京通州物理一模11 区得分率50.71%）',
    correctAnswer: 'C',
  },
  {
    title: 'MC科技模组题',
    content: '以下哪个能量单位没有被科技模组使用过？<br><br>A. LU<br>B. EU<br>C. RF<br>D. PT',
    correctAnswer: 'D',
  },
  {
    title: 'MC原版译名题',
    content:
      '____（Warden）是一种高大而危险的敌对生物，会根据振动和气息判断生物的位置。下列选项为其现行标准译名的一项是<br><br>A. 循声守卫<br>B. 寻声守卫<br>C. 坚守者<br>D. 监守者',
    correctAnswer: 'D',
  },
  {
    title: 'MC原版译名题',
    content:
      '____（Hay Bale）方块能减少80%的摔落伤害，下列选项为其现行标准译名的一项是<br><br>A. 干草捆<br>B. 干草块<br>C. 干草堆<br>D. 干草垛',
    correctAnswer: 'A',
  },
  {
    title: 'MC原版题',
    content: '合成末地烛需要用到什么<br>A. 烈焰棒<br>B. 紫颂果<br>C. 烈焰粉<br>D. 紫珀块',
    correctAnswer: 'A',
  },
  {
    title: '历史物理题',
    content:
      '漂附在液体中的物体,在自身重力不变的情况下，外来的压力加重力小于浮力时，就会上浮，反之则会下沉。下面与图二的外力有关的史实是<br><br>',
    correctAnswer: 'A',
    imageUrl: 'https://vmct-cn.top/imgs/questions/history.jpg',
  },
  {
    title: 'MC原版题',
    content:
      'Minecraft 中，玩家在高度差最小为__时（整数）摔落会直接死亡<br>A. 22<br>B. 23<br>C. 24<br>D. 25',
    correctAnswer: 'C',
  },
  {
    title: 'MC原版题',
    content:
      '蜜蜂农场往往将蜂巢和花放在农田两侧，可能的原因是什么？<br>A. 只是为了好看<br>B. 为了促进蜜蜂产蜜<br>C. 农田里的植物需要蜜蜂传播花粉才能生长<br>D. 蜜蜂采蜜后，回蜂巢途中掉落的花粉相当于骨粉，促进植物生长',
    correctAnswer: 'D',
  },
  {
    title: 'MC原版题',
    content:
      '对于海洋神殿，下列说法不正确的是<br>A. 海洋神殿的宝藏为8个金块<br>B. 正常情况下，一个海洋神殿中的远古守卫者至少有 6 个，并会给玩家挖掘疲劳效果<br>C. 海洋神殿中的房间生成随机，且有着不同数量、至少6个的房间<br>D. 击杀守卫者是获得大量海晶砂砾、海晶碎片以及经验的较好来源',
    correctAnswer: 'B',
  },
  {
    title: 'MC原版和电学题',
    content:
      '红石中继器和荧石在红石电路中的的部分作用相当于真实电路中的<br>A. 变压器<br>B. 电阻<br>C. 线圈<br>D. 二极管',
    correctAnswer: 'D',
  },
]

const openLink = (url) => url && window.open(url, '_blank')

const getDownloadModalHtml = (showInstallLink = true) => {
  const installLink = showInstallLink
    ? `，并仔细查阅<a href="/modpacks/" target="_blank">汉化补丁安装说明</a>`
    : '。'
  return `
    <div class="modal-content-container">
      <p class="intro-text">请选择您偏好的下载方式（文件内容一致）：</p>
      <ul class="download-options-list">
        <li class="option-item recommended"><div class="option-title"><strong>📂 夸克网盘</strong></div><div class="option-desc">转存即可<strong>自动获取后续更新</strong>。您的支持是我们持续用爱发电的动力 ❤️</div></li>
        <li class="option-item lanzou"><div class="option-title"><strong>🚀 蓝奏云</strong></div><div class="option-desc">无需客户端，点击链接直接下载，轻量快捷。</div></li>
      </ul>
      <p class="important-notice"><strong>重要提示：</strong>下载前请务必阅读并接受<a href="/agreement/" target="_blank">VM汉化组用户服务协议</a>${installLink}</p>
    </div>`
}

const setupButtonCountdown = (seconds = 3) => {
  const confirmBtn = Swal.getConfirmButton()
  const denyBtn = Swal.getDenyButton()
  if (!confirmBtn) return

  const originalConfirm = confirmBtn.innerText
  const originalDeny = denyBtn?.innerText

  let remaining = seconds
  const update = () => {
    confirmBtn.disabled = true
    if (denyBtn) denyBtn.disabled = true
    confirmBtn.innerText = `${originalConfirm} (${remaining})`
    if (denyBtn) denyBtn.innerText = `${originalDeny} (${remaining})`
  }

  update()
  const timer = setInterval(() => {
    remaining--
    if (remaining <= 0) {
      clearInterval(timer)
      confirmBtn.disabled = false
      if (denyBtn) denyBtn.disabled = false
      confirmBtn.innerText = originalConfirm
      if (denyBtn) denyBtn.innerText = originalDeny
    } else {
      update()
    }
  }, 1000)
}

function showQuestionModal(item) {
  const q = QUESTIONS[Math.floor(Math.random() * QUESTIONS.length)]
  let tempInput = ''

  Swal.fire({
    title: q.title,
    customClass: {
      popup: 'vm-swal-popup',
      confirmButton: 'btn btn-quark',
    },
    html: `
      <div class="modal-content-container">
        ${q.content}<br>${q.imageUrl ? `<img src="${q.imageUrl}" style="max-width:100%;height:auto;margin-top:10px;border-radius:8px;"/>` : ''}
        <div style="margin-top: 15px; display: flex; flex-wrap: wrap; justify-content: center;">
          ${
            q.isInput
              ? `<input type="text" id="swal-input" class="swal2-input" style="width: 80%; color: var(--vp-c-text-1); background: var(--vp-c-bg-soft);" placeholder="请输入答案">`
              : ['A', 'B', 'C', 'D']
                  .map(
                    (opt) =>
                      `<button class="btn btn-lanzou q-btn" style="margin:5px;" data-value="${opt}">${opt}</button>`,
                  )
                  .join('')
          }
        </div>
      </div>`,
    showConfirmButton: !!q.isInput,
    confirmButtonText: '提交',
    showCancelButton: false,
    didOpen: () => {
      const container = Swal.getHtmlContainer()
      container.querySelectorAll('.q-btn').forEach((btn) => {
        btn.onclick = () => {
          Swal.close()
          validateAnswer(btn.getAttribute('data-value'), q.correctAnswer, item)
        }
      })
      const input = document.getElementById('swal-input')
      if (input)
        input.oninput = (e) => {
          tempInput = e.target.value.trim().toUpperCase()
        }
    },
    preConfirm: () => (q.isInput ? tempInput : null),
  }).then((res) => {
    if (res.isConfirmed && q.isInput) validateAnswer(tempInput, q.correctAnswer, item)
  })
}

function validateAnswer(input, correct, item) {
  if (input === correct) {
    Swal.fire({
      title: '回答正确！',
      icon: 'success',
      customClass: {
        popup: 'vm-swal-popup',
        confirmButton: 'btn btn-lanzou',
      },
      html: `
        <div class="modal-content-container">
          您可以下载汉化了！懒汉下载和普通下载的链接一样，只是为了增加娱乐用途。<br><br>
          不过在此之前，请您先阅读并接受<a href="/agreement/" target="_blank" style="color: var(--vp-c-info-1);">VM汉化组用户服务协议</a>，并仔细阅读 <a href="/modpacks/" target="_blank" style="color: var(--vp-c-info-1);">汉化补丁安装说明</a>。
        </div>`,
      showCancelButton: false,
      confirmButtonText: '确定',
    }).then((res) => res.isConfirmed && openLink(item.link))
  } else {
    Swal.fire({
      icon: 'error',
      title: '回答错误',
      customClass: { popup: 'vm-swal-popup' },
      text: '看起来不太对哦，愿意的话你可以再试一次！',
    })
  }
}

const showProtocolModal = (item, hasInstallGuide = true) => {
  Swal.fire({
    title: '请您先阅读并接受',
    icon: 'info',
    html: `<a href="/agreement/" target="_blank" style="color: blue; text-decoration: underline;">VM汉化组用户服务协议</a>${hasInstallGuide ? `，并仔细阅读 <a href="/modpacks/" target="_blank" style="color: blue; text-decoration: underline;">汉化补丁安装说明</a>` : ''}。`,
    showCancelButton: true,
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    reverseButtons: true,
    didOpen: () => setupButtonCountdown(3),
  }).then((res) => res.isConfirmed && openLink(item.link))
}

const showMultiDriveModal = (item, hasInstallGuide = true) => {
  Swal.fire({
    title: '网盘选择',
    html: getDownloadModalHtml(hasInstallGuide),
    showDenyButton: true,
    showCancelButton: true,
    confirmButtonText: '夸克网盘',
    denyButtonText: '蓝奏云',
    cancelButtonText: '取消',
    customClass: {
      popup: 'vm-swal-popup',
      confirmButton: 'btn btn-quark',
      denyButton: 'btn btn-lanzou',
      cancelButton: 'btn btn-cancel',
    },
    didOpen: (modal) => {
      const icon = modal.querySelector('.swal2-icon')
      if (icon) icon.style.display = 'none'
      setupButtonCountdown(3)
    },
  }).then((res) => {
    if (res.isConfirmed) openLink(item.quarkLink)
    else if (res.isDenied) openLink(item.lanzouLink)
  })
}

const MODAL_CONFIG = {
  lanzou: (item) => showProtocolModal(item, true),
  mapdl: (item) => showProtocolModal(item, false),
  lazy: (item) => showQuestionModal(item),
  'quark-lanzou': (item) => showMultiDriveModal(item, true),
  'lanzou-quark-mapdl': (item) => showMultiDriveModal(item, false),
}

function handleClick(item) {
  const handler = MODAL_CONFIG[item.id]
  if (handler) handler(item)
  else if (item.link) openLink(item.link)
}
</script>

<template>
  <div class="flex flex-wrap gap-4 slide-enter">
    <div
      v-for="item in items"
      :key="item.name"
      :class="['Link', { 'lazy-text': item.id === 'lazy' }]"
      @click="handleClick(item)"
    >
      <div
        v-if="item.icon && typeof item.icon === 'string' && item.icon.startsWith('i')"
        :class="item.icon"
      />
      <img v-else :src="item.icon" />
      <span class="text-sm">{{ item.name }}</span>
      <span class="text-xs opacity-50">{{ item.secondary }}</span>
    </div>
  </div>
</template>

<style>
@import '@/styles/DownloadModal.css';
</style>
