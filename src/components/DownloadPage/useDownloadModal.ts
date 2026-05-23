import type { Ref } from 'vue'
import { downloadQuestions } from '@/data/downloadQuestions'
import type { DownloadQuestion } from '@/types/downloadQuestion'
import { convertInlineText } from '@/utils/zhconv'

type Translate = (key: string, params?: Record<string, unknown>) => string

interface UseDownloadModalOptions {
  locale: Ref<string>
  questionLoader?: (() => Promise<DownloadQuestion[]>) | null
  questions?: DownloadQuestion[] | null
  t: Translate
}

const QUESTION_OPTIONS = ['A', 'B', 'C', 'D']
let swalPromise: Promise<any> | undefined

const getQuestionKey = (question: DownloadQuestion) =>
  [question.title, question.content, question.correctAnswer].join('\n')

const getSwal = async () => {
  if (!swalPromise) {
    swalPromise = import('sweetalert2').then((module) => module.default)
  }
  return swalPromise
}

const openLink = (url?: string) => url && window.open(url, '_blank')

const getDownloadType = (item: any) => (item.id === 'lazy' ? 'lazy' : 'normal')

export function useDownloadModal(options: UseDownloadModalOptions) {
  const { locale, questionLoader, questions, t } = options
  const usedQuestionKeys = new Set<string>()

  const trackDownloadChoice = (stage: string, item: any, extra: Record<string, unknown> = {}) => {
    window.gtag?.(`event`, `download_choice_${stage}`, {
      download_type: getDownloadType(item),
      download_method_id: item.id,
      download_method_name: item.name,
      ...extra,
    })
  }

  const openTrackedLink = (item: any, url = item.link, extra: Record<string, unknown> = {}) => {
    trackDownloadChoice('open', item, extra)
    openLink(url)
  }

  const getQuestions = async () => {
    if (questions?.length) return questions
    if (questionLoader) return (await questionLoader()) || []

    return downloadQuestions
  }

  const getRandomQuestion = (allQuestions: DownloadQuestion[]) => {
    const availableQuestions = allQuestions.filter((question) => {
      return !usedQuestionKeys.has(getQuestionKey(question))
    })
    const questionPool = availableQuestions.length ? availableQuestions : allQuestions

    if (!availableQuestions.length) usedQuestionKeys.clear()

    const question = questionPool[Math.floor(Math.random() * questionPool.length)]
    usedQuestionKeys.add(getQuestionKey(question))

    return question
  }

  const setupButtonCountdown = (Swal: any, seconds = 3) => {
    const confirmBtn = Swal.getConfirmButton()
    const denyBtn = Swal.getDenyButton()
    if (!confirmBtn) return

    const originalConfirm = confirmBtn.innerText
    const originalDeny = denyBtn?.innerText

    let remaining = seconds
    const update = () => {
      confirmBtn.disabled = true
      if (denyBtn) denyBtn.disabled = true
      confirmBtn.innerText = t('downloadModal.countdown', {
        label: originalConfirm,
        seconds: remaining,
      })
      if (denyBtn) {
        denyBtn.innerText = t('downloadModal.countdown', {
          label: originalDeny,
          seconds: remaining,
        })
      }
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

  const agreementLink = () =>
    `<a href="/agreement/" target="_blank" class="modal-link">${t('downloadModal.agreement')}</a>`

  const installGuideLink = () =>
    `<a href="/modpacks/" target="_blank" class="modal-link">${t('downloadModal.installGuide')}</a>`

  const installGuideNotice = (hasInstallGuide = true) =>
    hasInstallGuide
      ? t('downloadModal.installGuideJoiner', { installGuide: installGuideLink() })
      : t('downloadModal.noticeEnd')

  const getDownloadModalHtml = (showInstallLink = true) => `
    <div class="modal-content-container">
      <p class="intro-text">${t('downloadModal.driveIntro')}</p>
      <ul class="download-options-list">
        <li class="option-item recommended">
          <div class="option-title"><strong>${t('downloadModal.quarkTitle')}</strong></div>
          <div class="option-desc">${t('downloadModal.quarkDesc')}</div>
        </li>
        <li class="option-item lanzou">
          <div class="option-title"><strong>${t('downloadModal.lanzouTitle')}</strong></div>
          <div class="option-desc">${t('downloadModal.lanzouDesc')}</div>
        </li>
      </ul>
      <p class="important-notice">
        <strong>${t('downloadModal.noticeTitle')}</strong>${t('downloadModal.noticeRead', {
          agreement: agreementLink(),
        })}${installGuideNotice(showInstallLink)}
      </p>
    </div>`

  const buildQuestionHtml = (question: DownloadQuestion, content: string) => `
    <div class="modal-content-container">
      <div class="question-content">
        ${content}
      </div>
      ${
        question.imageUrl
          ? `<img loading="lazy" src="${question.imageUrl}" class="question-image" alt=""/>`
          : ''
      }
      <div class="question-actions">
        ${
          question.isInput
            ? `<input type="text" id="swal-input" class="swal2-input question-input" placeholder="${t('downloadModal.answerPlaceholder')}">`
            : QUESTION_OPTIONS.map(
                (option) =>
                  `<button class="btn btn-lanzou q-btn" data-value="${option}">${option}</button>`,
              ).join('')
        }
      </div>
    </div>`

  const validateAnswer = async (input: string, correct: string, item: any) => {
    const Swal = await getSwal()

    if (input.trim().toUpperCase() === correct.toUpperCase()) {
      Swal.fire({
        title: t('downloadModal.correctTitle'),
        icon: 'success',
        customClass: {
          popup: 'vm-swal-popup',
          htmlContainer: 'vm-swal-html-container',
          confirmButton: 'btn btn-lanzou',
        },
        html: `
          <div class="modal-content-container">
            ${t('downloadModal.correctBody', {
              agreement: agreementLink(),
              installGuide: installGuideLink(),
            })}
          </div>`,
        showCancelButton: false,
        confirmButtonText: t('downloadModal.ok'),
      }).then((res: any) => res.isConfirmed && openTrackedLink(item))
    } else {
      Swal.fire({
        icon: 'error',
        title: t('downloadModal.wrongTitle'),
        customClass: { popup: 'vm-swal-popup' },
        text: t('downloadModal.wrongText'),
      })
    }
  }

  const showQuestionModal = async (item: any) => {
    const [Swal, allQuestions] = await Promise.all([getSwal(), getQuestions()])
    if (!allQuestions.length) {
      await Swal.fire({
        icon: 'error',
        title: t('downloadModal.questionLoadErrorTitle'),
        customClass: { popup: 'vm-swal-popup' },
        text: t('downloadModal.questionLoadErrorText'),
      })
      return
    }

    const question = getRandomQuestion(allQuestions)
    const [title, content] = await Promise.all([
      convertInlineText(question.title, locale.value),
      convertInlineText(question.content, locale.value),
    ])
    let tempInput = ''

    Swal.fire({
      title,
      customClass: {
        popup: 'vm-swal-popup',
        htmlContainer: 'vm-swal-html-container',
        confirmButton: 'btn btn-quark',
      },
      html: buildQuestionHtml(question, content),
      showConfirmButton: !!question.isInput,
      confirmButtonText: t('downloadModal.submit'),
      showCancelButton: false,
      didOpen: () => {
        const container = Swal.getHtmlContainer()
        container.querySelectorAll('.q-btn').forEach((btn: HTMLButtonElement) => {
          btn.onclick = () => {
            Swal.close()
            validateAnswer(btn.getAttribute('data-value') || '', question.correctAnswer, item)
          }
        })
        const input = document.getElementById('swal-input') as HTMLInputElement | null
        if (input) {
          input.oninput = (event) => {
            tempInput = (event.target as HTMLInputElement).value
          }
        }
      },
      preConfirm: () => (question.isInput ? tempInput : null),
    }).then((res: any) => {
      if (res.isConfirmed && question.isInput) {
        validateAnswer(tempInput, question.correctAnswer, item)
      }
    })
  }

  const showProtocolModal = async (item: any, hasInstallGuide = true) => {
    const Swal = await getSwal()

    Swal.fire({
      title: t('downloadModal.protocolTitle'),
      icon: 'info',
      html: `${t('downloadModal.noticeRead', {
        agreement: agreementLink(),
      })}${installGuideNotice(hasInstallGuide)}`,
      showCancelButton: true,
      confirmButtonText: t('downloadModal.ok'),
      cancelButtonText: t('downloadModal.cancel'),
      reverseButtons: true,
      customClass: {
        popup: 'vm-swal-popup',
        confirmButton: 'btn btn-lanzou',
        cancelButton: 'btn btn-cancel',
      },
      didOpen: () => setupButtonCountdown(Swal, 3),
    }).then((res: any) => res.isConfirmed && openTrackedLink(item))
  }

  const showMultiDriveModal = async (item: any, hasInstallGuide = true) => {
    const Swal = await getSwal()

    Swal.fire({
      title: t('downloadModal.driveTitle'),
      html: getDownloadModalHtml(hasInstallGuide),
      showDenyButton: true,
      showCancelButton: true,
      confirmButtonText: t('downloadModal.quarkButton'),
      denyButtonText: t('downloadModal.lanzouButton'),
      cancelButtonText: t('downloadModal.cancel'),
      customClass: {
        popup: 'vm-swal-popup',
        htmlContainer: 'vm-swal-html-container',
        confirmButton: 'btn btn-quark',
        denyButton: 'btn btn-lanzou',
        cancelButton: 'btn btn-cancel',
      },
      didOpen: (modal: HTMLElement) => {
        const icon = modal.querySelector('.swal2-icon')
        if (icon) icon.setAttribute('hidden', 'true')
        setupButtonCountdown(Swal, 3)
      },
    }).then((res: any) => {
      if (res.isConfirmed) openTrackedLink(item, item.quarkLink, { drive: 'quark' })
      else if (res.isDenied) openTrackedLink(item, item.lanzouLink, { drive: 'lanzou' })
    })
  }

  const modalConfig: Record<string, (item: any) => void> = {
    lanzou: (item) => showProtocolModal(item, true),
    mapdl: (item) => showProtocolModal(item, false),
    lazy: (item) => showQuestionModal(item),
    'quark-lanzou': (item) => showMultiDriveModal(item, true),
    'lanzou-quark-mapdl': (item) => showMultiDriveModal(item, false),
  }

  const handleDownloadMethod = (item: any) => {
    trackDownloadChoice('select', item)

    const handler = modalConfig[item.id]
    if (handler) handler(item)
    else if (item.link) openTrackedLink(item)
  }

  return { handleDownloadMethod }
}
