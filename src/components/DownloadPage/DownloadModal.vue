<script setup>
let swalPromise
let questionsPromise

const QUESTION_OPTIONS = ['A', 'B', 'C', 'D']

const props = defineProps({
  items: { type: Array, default: () => [] },
  questions: { type: Array, default: () => [] },
  questionLoader: { type: Function, default: null },
})

const openLink = (url) => url && window.open(url, '_blank')

const getSwal = async () => {
  if (!swalPromise) {
    swalPromise = import('sweetalert2').then((module) => module.default)
  }
  return swalPromise
}

const getQuestions = async () => {
  if (props.questions.length) return props.questions
  if (props.questionLoader) return (await props.questionLoader()) || []

  if (!questionsPromise) {
    questionsPromise = fetch('/downloadQuestions.json')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load questions')
        return res.json()
      })
      .catch((err) => {
        console.error(err)
        return []
      })
  }

  return questionsPromise
}

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

const setupButtonCountdown = (Swal, seconds = 3) => {
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

function buildQuestionHtml(q) {
  return `
    <div class="modal-content-container">
      ${q.content}<br>${q.imageUrl ? `<img loading="lazy" src="${q.imageUrl}" style="max-width:100%;height:auto;margin-top:10px;border-radius:8px;"/>` : ''}
      <div style="margin-top: 15px; display: flex; flex-wrap: wrap; justify-content: center;">
        ${
          q.isInput
            ? `<input type="text" id="swal-input" class="swal2-input" style="width: 80%; color: var(--vp-c-text-1); background: var(--vp-c-bg-soft);" placeholder="请输入答案">`
            : QUESTION_OPTIONS.map(
                (opt) =>
                  `<button class="btn btn-lanzou q-btn" style="margin:5px;" data-value="${opt}">${opt}</button>`,
              ).join('')
        }
      </div>
    </div>`
}

async function showQuestionModal(item) {
  const [Swal, questions] = await Promise.all([getSwal(), getQuestions()])
  if (!questions.length) {
    await Swal.fire({
      icon: 'error',
      title: '题目加载失败',
      customClass: { popup: 'vm-swal-popup' },
      text: '暂时无法获取题目，请稍后再试。',
    })
    return
  }

  const q = questions[Math.floor(Math.random() * questions.length)]
  let tempInput = ''

  Swal.fire({
    title: q.title,
    customClass: {
      popup: 'vm-swal-popup',
      confirmButton: 'btn btn-quark',
    },
    html: buildQuestionHtml(q),
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

async function validateAnswer(input, correct, item) {
  const Swal = await getSwal()

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

const showProtocolModal = async (item, hasInstallGuide = true) => {
  const Swal = await getSwal()

  Swal.fire({
    title: '请您先阅读并接受',
    icon: 'info',
    html: `<a href="/agreement/" target="_blank" style="color: blue; text-decoration: underline;">VM汉化组用户服务协议</a>${hasInstallGuide ? `，并仔细阅读 <a href="/modpacks/" target="_blank" style="color: blue; text-decoration: underline;">汉化补丁安装说明</a>` : ''}。`,
    showCancelButton: true,
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    reverseButtons: true,
    didOpen: () => setupButtonCountdown(Swal, 3),
  }).then((res) => res.isConfirmed && openLink(item.link))
}

const showMultiDriveModal = async (item, hasInstallGuide = true) => {
  const Swal = await getSwal()

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
      setupButtonCountdown(Swal, 3)
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
  <div class="flex">
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
      <img v-else v-lazy="item.icon" />
      <span class="text-sm">{{ item.name }}</span>
      <span class="text-xs">{{ item.secondary }}</span>
    </div>
  </div>
</template>

<style>
@import '@/styles/DownloadModal.css';
</style>
