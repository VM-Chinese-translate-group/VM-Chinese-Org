<template>
  <div slide-enter>
    <div class="one-time-donations">
      <div class="links">
        <a v-for="(payment, key) in paymentList" :key="key" :href="`#${key}`" :title="payment.name">
          <img :src="`/imgs/svg/${key}.svg`" class="icon" />
          {{ payment.name }}
        </a>
      </div>
    </div>

    <div v-if="selectedPayment && coins[selectedPayment]" class="coin-details slide-enter">
      <p>
        <img :src="iconSrc" class="icon icon-rotate" />
        {{ coins[selectedPayment].name }}：
        <br />
        <a
          :href="coins[selectedPayment].address"
          :title="coins[selectedPayment].name"
          target="_blank"
          rel="noopener noreferrer"
        >
          {{ coins[selectedPayment].address }}
        </a>
      </p>
      <img :src="qrcode" alt="QR Code" v-if="qrcode" class="qr-code-img" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, computed } from 'vue'
import { useQRCode } from '@vueuse/integrations/useQRCode'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const coins = computed(() => ({
  bilibili: {
    name: 'bilibili',
    address: 'https://space.bilibili.com/2085089798',
  },
  afdian: {
    name: t('supportUs.afdText'),
    address: 'https://afdian.com/a/VMhanhuazu',
  },
}))

const paymentList = computed(() => coins.value)
const selectedPayment = ref('')

const iconSrc = computed(() => {
  if (!selectedPayment.value) return ''
  return `/imgs/svg/${selectedPayment.value}.svg`
})

const qrcode = useQRCode(
  () => {
    return coins.value[selectedPayment.value]?.address || ''
  },
  {
    margin: 2,
  },
)

const updatePaymentType = () => {
  const hash = window.location.hash.slice(1)
  if (hash && coins.value[hash]) {
    selectedPayment.value = hash
  }
}

onMounted(() => {
  updatePaymentType()
  window.addEventListener('hashchange', updatePaymentType)
})

onBeforeUnmount(() => {
  window.removeEventListener('hashchange', updatePaymentType)
})
</script>

<style scoped>
@import '@/styles/Coins.css';
</style>
