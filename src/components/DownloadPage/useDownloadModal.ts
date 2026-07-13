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

  const getDownloadTypeModalHtml = () => `
    <div class="modal-content-container">
      <p class="intro-text">${t('downloadModal.downloadTypeIntro')}</p>
      <div class="download-type-select-wrapper">
        <div class="fluent-select" id="download-drive-select">
          <div class="fluent-select-trigger" tabindex="0">
            <span class="select-value placeholder">${t('downloadModal.selectDrive')}</span>
            <span class="select-arrow"><svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg></span>
          </div>
          <div class="fluent-select-dropdown">
            <div class="fluent-select-option" data-value="quark">
              <span class="option-name">${t('downloadModal.quarkTitle')}</span>
              <span class="option-desc">${t('downloadModal.quarkDesc')}</span>
            </div>
            <div class="fluent-select-option" data-value="lanzou">
              <span class="option-name">${t('downloadModal.lanzouTitle')}</span>
              <span class="option-desc">${t('downloadModal.lanzouDesc')}</span>
            </div>
          </div>
        </div>
        <button type="button" id="normal-download-btn" class="btn btn-quark download-type-btn">
          ${t('downloadModal.normalDownload')}
        </button>
      </div>
      <div class="download-type-divider">
        <span>${t('downloadModal.or')}</span>
      </div>
      <ul class="download-options-list">
        <li class="option-item lazy-option" data-type="lazy" role="button" tabindex="0">
          <div class="option-content">
            <div class="option-title">
              <span class="option-title-content">
                <strong>${t('downloadModal.lazyDownload')}</strong>
                <span class="option-desc-inline">${t('downloadModal.lazyDownloadDesc')}</span>
              </span>
            </div>
          </div>
        </li>
      </ul>
      <p class="important-notice">
        <strong>${t('downloadModal.noticeTitle')}</strong>${t('downloadModal.noticeRead', {
          agreement: agreementLink(),
        })}${installGuideNotice(true)}
      </p>
    </div>`

  const getDownloadModalHtml = (item: any, showInstallLink = true) => `
    <div class="modal-content-container">
      <p class="intro-text">${t('downloadModal.driveIntro')}</p>
      <ul class="download-options-list">
        <li class="option-item recommended" data-drive="quark" role="button" tabindex="0">
          <div class="option-content">
            <div class="option-title">
              <span class="option-title-content">
                <strong>${t('downloadModal.quarkTitle')}</strong>
              </span>
            </div>
            <div class="option-desc">${t('downloadModal.quarkDesc')}</div>
          </div>
        </li>
        <li class="option-item lanzou" data-drive="lanzou" role="button" tabindex="0">
          <div class="option-content">
            <div class="option-title">
              <span class="option-title-content">
                <strong>${t('downloadModal.lanzouTitle')}</strong>
              </span>
            </div>
            <div class="option-desc">${t('downloadModal.lanzouDesc')}</div>
          </div>
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
        html: `
          <div class="modal-content-container">
            ${t('downloadModal.correctBody', {
              agreement: agreementLink(),
              installGuide: installGuideLink(),
            })}
          </div>`,
        showCancelButton: false,
        showCloseButton: true,
        confirmButtonText: t('downloadModal.ok'),
        buttonsStyling: false,
        customClass: {
          popup: 'vm-swal-popup vm-swal-popup-single-btn',
          htmlContainer: 'vm-swal-html-container',
          confirmButton: 'btn btn-quark',
        },
        showClass: {
          popup: 'swal2-noanimation',
        },
        hideClass: {
          popup: '',
        },
      }).then((res: any) => res.isConfirmed && openTrackedLink(item))
    } else {
      Swal.fire({
        icon: 'error',
        title: t('downloadModal.wrongTitle'),
        text: t('downloadModal.wrongText'),
        showCloseButton: true,
        showCancelButton: false,
        confirmButtonText: t('downloadModal.ok'),
        buttonsStyling: false,
        customClass: {
          popup: 'vm-swal-popup vm-swal-popup-single-btn',
          confirmButton: 'btn btn-quark',
        },
        showClass: {
          popup: 'swal2-noanimation',
        },
        hideClass: {
          popup: '',
        },
      }).then(() => {
        showQuestionModal(item)
      })
    }
  }

  const showQuestionModal = async (item: any) => {
    const [Swal, allQuestions] = await Promise.all([getSwal(), getQuestions()])
    if (!allQuestions.length) {
      await Swal.fire({
        icon: 'error',
        title: t('downloadModal.questionLoadErrorTitle'),
        text: t('downloadModal.questionLoadErrorText'),
        showCloseButton: true,
        showCancelButton: false,
        confirmButtonText: t('downloadModal.ok'),
        buttonsStyling: false,
        customClass: {
          popup: 'vm-swal-popup vm-swal-popup-single-btn',
          confirmButton: 'btn btn-quark',
        },
        showClass: {
          popup: 'swal2-noanimation',
        },
        hideClass: {
          popup: '',
        },
      })
      return
    }

    const question = getRandomQuestion(allQuestions)
    const [title, content] = await Promise.all([
      convertInlineText(question.title, locale.value),
      convertInlineText(question.content, locale.value),
    ])
    let tempInput = ''
    let hasAnswered = false

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
      showCloseButton: true,
      buttonsStyling: false,
      showClass: {
        popup: 'swal2-noanimation',
      },
      hideClass: {
        popup: '',
      },
      didOpen: () => {
        const container = Swal.getHtmlContainer()
        container.querySelectorAll('.q-btn').forEach((btn: HTMLButtonElement) => {
          btn.onclick = () => {
            if (hasAnswered) return
            hasAnswered = true
            container.querySelectorAll('.q-btn').forEach((button: HTMLButtonElement) => {
              button.disabled = true
            })
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
        if (hasAnswered) return
        hasAnswered = true
        validateAnswer(tempInput, question.correctAnswer, item)
      }
    })
  }

  const showDownloadTypeModal = async (item: any) => {
    const Swal = await getSwal()

    Swal.fire({
      title: t('downloadModal.downloadTypeTitle'),
      html: getDownloadTypeModalHtml(),
      showConfirmButton: false,
      showDenyButton: false,
      showCancelButton: false,
      showCloseButton: true,
      buttonsStyling: false,
      customClass: {
        popup: 'vm-swal-popup',
        htmlContainer: 'vm-swal-html-container',
      },
      showClass: {
        popup: 'swal2-noanimation',
      },
      hideClass: {
        popup: '',
      },
      didOpen: (modal: HTMLElement) => {
        let hasChosen = false
        let selectedDrive = 'quark'

        // Custom Fluent UI Dropdown
        const selectEl = modal.querySelector('#download-drive-select') as HTMLElement
        const trigger = selectEl?.querySelector('.fluent-select-trigger') as HTMLElement
        const options = selectEl?.querySelectorAll('.fluent-select-option') as NodeListOf<HTMLElement>
        const valueDisplay = selectEl?.querySelector('.select-value') as HTMLElement

        if (trigger) {
          trigger.addEventListener('click', () => {
            selectEl.classList.toggle('open')
          })

          // Close dropdown when clicking outside
          modal.addEventListener('click', (e) => {
            if (!selectEl.contains(e.target as Node)) {
              selectEl.classList.remove('open')
            }
          })
        }

        options.forEach((option) => {
          option.addEventListener('click', () => {
            selectedDrive = option.dataset.value || 'quark'
            valueDisplay.textContent = option.textContent
            valueDisplay.classList.remove('placeholder')
            options.forEach((opt) => opt.classList.remove('selected'))
            option.classList.add('selected')
            selectEl.classList.remove('open')
          })
        })

        // Normal download button
        const normalBtn = modal.querySelector('#normal-download-btn') as HTMLButtonElement

        if (normalBtn) {
          normalBtn.addEventListener('click', () => {
            if (hasChosen) return
            hasChosen = true
            Swal.close()

            if (selectedDrive === 'quark') {
              trackDownloadChoice('select', item, { drive: 'quark' })
              openTrackedLink(item, item.quarkLink, { drive: 'quark' })
            } else if (selectedDrive === 'lanzou') {
              trackDownloadChoice('select', item, { drive: 'lanzou' })
              openTrackedLink(item, item.lanzouLink, { drive: 'lanzou' })
            }
          })
        }

        // Lazy download
        const lazyOption = modal.querySelector('.option-item[data-type="lazy"]')
        if (lazyOption) {
          const chooseLazy = () => {
            if (hasChosen) return
            hasChosen = true
            Swal.close()
            const lazyItem = {
              ...item,
              id: 'lazy',
              name: t('downloadModal.lazyTitle'),
              link: item.lazyLink,
            }
            trackDownloadChoice('select', lazyItem, { drive: 'lazy' })
            showQuestionModal(lazyItem)
          }

          lazyOption.addEventListener('click', chooseLazy)
          lazyOption.addEventListener('keydown', (event) => {
            const keyboardEvent = event as KeyboardEvent
            if (keyboardEvent.key !== 'Enter' && keyboardEvent.key !== ' ') return
            keyboardEvent.preventDefault()
            chooseLazy()
          })
        }
      },
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
      showCloseButton: true,
      confirmButtonText: t('downloadModal.ok'),
      cancelButtonText: t('downloadModal.cancel'),
      reverseButtons: true,
      buttonsStyling: false,
      customClass: {
        popup: 'vm-swal-popup',
        confirmButton: 'btn btn-lanzou',
        cancelButton: 'btn btn-cancel',
      },
      showClass: {
        popup: 'swal2-noanimation',
      },
      hideClass: {
        popup: '',
      },
      didOpen: () => setupButtonCountdown(Swal, 3),
    }).then((res: any) => res.isConfirmed && openTrackedLink(item))
  }

  const showMultiDriveModal = async (item: any, hasInstallGuide = true) => {
    const Swal = await getSwal()

    Swal.fire({
      title: t('downloadModal.driveTitle'),
      html: getDownloadModalHtml(item, hasInstallGuide),
      showConfirmButton: false,
      showDenyButton: false,
      showCancelButton: false,
      showCloseButton: true,
      buttonsStyling: false,
      customClass: {
        popup: 'vm-swal-popup',
        htmlContainer: 'vm-swal-html-container',
      },
      showClass: {
        popup: 'swal2-noanimation',
      },
      hideClass: {
        popup: '',
      },
      didOpen: (modal: HTMLElement) => {
        const icon = modal.querySelector('.swal2-icon')
        if (icon) icon.setAttribute('hidden', 'true')
        let hasChosen = false
        const openDrive = (drive: string | null) => {
          if (hasChosen) return
          hasChosen = true
          modal.querySelectorAll('.option-item[data-drive]').forEach((option: Element) => {
            option.classList.add('is-disabled')
            option.setAttribute('aria-disabled', 'true')
          })

          if (drive === 'quark') {
            trackDownloadChoice('select', item, { drive: 'quark' })
            Swal.close()
            openTrackedLink(item, item.quarkLink, { drive: 'quark' })
          } else if (drive === 'lanzou') {
            trackDownloadChoice('select', item, { drive: 'lanzou' })
            Swal.close()
            openTrackedLink(item, item.lanzouLink, { drive: 'lanzou' })
          }
        }

        modal.querySelectorAll('.option-item[data-drive]').forEach((option: Element) => {
          const drive = option.getAttribute('data-drive')
          option.addEventListener('click', () => openDrive(drive))
          option.addEventListener('keydown', (event) => {
            const keyboardEvent = event as KeyboardEvent
            if (keyboardEvent.key !== 'Enter' && keyboardEvent.key !== ' ') return
            keyboardEvent.preventDefault()
            openDrive(drive)
          })
        })
      },
    })
  }

  const modalConfig: Record<string, (item: any) => void> = {
    lanzou: (item) => showProtocolModal(item, true),
    mapdl: (item) => showProtocolModal(item, false),
    lazy: (item) => showQuestionModal(item),
    'quark-lanzou': (item) => (item.lazyLink ? showDownloadTypeModal(item) : showMultiDriveModal(item, true)),
    'lanzou-quark-mapdl': (item) => (item.lazyLink ? showDownloadTypeModal(item) : showMultiDriveModal(item, false)),
  }

  const handleDownloadMethod = (item: any) => {
    const handler = modalConfig[item.id]
    if (handler) {
      if (!item.quarkLink || !item.lanzouLink) trackDownloadChoice('select', item)
      handler(item)
    } else if (item.link) {
      trackDownloadChoice('select', item)
      openTrackedLink(item)
    }
  }

  return { handleDownloadMethod }
}
