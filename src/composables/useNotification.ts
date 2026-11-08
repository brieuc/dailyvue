import { ref } from 'vue'

const message = ref('')

export function useNotification() {
  const notify = (text: string) => {
    message.value = text
  }

  const notifyError = (error: unknown) => {
    message.value = error instanceof Error ? error.message : String(error)
  }

  const clear = () => {
    message.value = ''
  }

  return { message, notify, notifyError, clear }
}
