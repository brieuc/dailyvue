<template>
  <Teleport to="body">
    <div class="backdrop" @click.self="emit('close')">
      <div ref="panel" class="panel" role="dialog" aria-modal="true" :aria-label="title" tabindex="-1">
        <div class="header">
          <h2 class="title">{{ title }}</h2>
          <button
            type="button"
            class="close btn btn-ghost btn-icon"
            aria-label="Fermer"
            @click="emit('close')"
          >
            ×
          </button>
        </div>
        <div class="body">
          <slot />
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'

// Le parent monte le modal avec v-if et le démonte sur @close.
defineProps<{ title: string }>()
const emit = defineEmits<{ close: [] }>()

const panel = ref<HTMLElement | null>(null)

const onKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape') emit('close')
}

onMounted(() => {
  window.addEventListener('keydown', onKeydown)
  panel.value?.focus()
})
onUnmounted(() => window.removeEventListener('keydown', onKeydown))
</script>

<style scoped>
/* Collé en haut plutôt que centré : le clavier mobile ne déplace pas la fenêtre. */
.backdrop {
  position: fixed;
  inset: 0;
  z-index: 100;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: 8vh 16px 16px;
  background: rgba(23, 32, 64, 0.36);
  -webkit-backdrop-filter: blur(8px) saturate(120%);
  backdrop-filter: blur(8px) saturate(120%);
  overflow-y: auto;
  animation: fade 0.16s ease-out;
}

.panel {
  width: 440px;
  max-width: 100%;
  overflow: hidden;
  border: 1px solid var(--line);
  border-radius: var(--r-lg);
  background: var(--c-raised);
  box-shadow: var(--lift-strong);
  outline: none;
  animation: rise 0.2s ease-out;
}

.header {
  display: grid;
  grid-template-columns: 36px 1fr 36px;
  align-items: center;
  padding: 0.4rem 0.5rem;
  border-bottom: 1px solid var(--line);
  background: rgba(24, 32, 56, 0.02);
}

.title {
  grid-column: 2;
  font-size: 0.8rem;
  font-weight: 500;
  letter-spacing: 0.12em;
  text-align: center;
  text-transform: uppercase;
  color: var(--c-text-soft);
}

.close {
  grid-column: 3;
}

.body {
  padding: 1rem;
}

@keyframes fade {
  from {
    opacity: 0;
  }
}

@keyframes rise {
  from {
    opacity: 0;
    transform: translateY(8px) scale(0.98);
  }
}
</style>
