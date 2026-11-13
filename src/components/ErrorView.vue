<template>
  <Transition name="toast">
    <div v-if="message" class="toast" :class="tone" :role="tone === 'error' ? 'alert' : 'status'">
      <span class="text">{{ message }}</span>
      <button type="button" class="close" aria-label="Fermer la notification" @click="clear">×</button>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { onUnmounted, watch } from 'vue'
import { useNotification } from '@/composables/useNotification'

const SUCCESS_DURATION_MS = 2500

const { message, tone, clear } = useNotification()

// Un succès disparaît seul ; une erreur reste jusqu'à ce qu'on la ferme.
let timer: ReturnType<typeof setTimeout> | undefined
watch([message, tone], ([text, kind]) => {
  clearTimeout(timer)
  if (text && kind === 'success') {
    timer = setTimeout(clear, SUCCESS_DURATION_MS)
  }
})
onUnmounted(() => clearTimeout(timer))
</script>

<style scoped>
.toast {
  position: fixed;
  top: 12px;
  left: 50%;
  z-index: 200;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: max-content;
  max-width: calc(100% - 32px);
  padding: 0.5rem 0.5rem 0.5rem 1rem;
  border: 1px solid var(--line);
  border-radius: var(--r-pill);
  background: var(--c-raised);
  box-shadow: var(--lift);
  font-size: 0.85rem;
  transform: translateX(-50%);
}

.toast.success {
  border-color: rgba(11, 157, 109, 0.3);
  color: var(--c-positive);
}

.toast.error {
  border-color: rgba(212, 54, 94, 0.3);
  background: #fff7f9;
  color: var(--c-negative);
}

.text {
  white-space: pre-wrap;
}

.close {
  width: 26px;
  height: 26px;
  flex: none;
  border: none;
  border-radius: 50%;
  background: transparent;
  color: inherit;
  font-size: 1rem;
  line-height: 1;
  opacity: 0.6;
}

.close:hover {
  opacity: 1;
  background: rgba(24, 32, 56, 0.06);
}

.toast-enter-active,
.toast-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translate(-50%, -8px);
}
</style>
