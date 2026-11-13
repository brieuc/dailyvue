import { ref } from 'vue'

export type NotificationTone = 'success' | 'error'

const message = ref('')
const tone = ref<NotificationTone>('success')

export function useNotification() {
  const notify = (text: string, kind: NotificationTone = 'success') => {
    message.value = text
    tone.value = kind
  }

  const notifyError = (error: unknown) => {
    notify(error instanceof Error ? error.message : String(error), 'error')
  }

  const clear = () => {
    message.value = ''
  }

  return { message, tone, notify, notifyError, clear }
}
