import { ref } from 'vue'

export type NotificationTone = 'success' | 'error'

export const LOAD_ERROR = 'Erreur lors du chargement des données'

const SUCCESS_DURATION_MS = 2500

const message = ref('')
const tone = ref<NotificationTone>('success')
let timer: ReturnType<typeof setTimeout> | undefined

interface RunMessages {
  /** Notifié après un succès. Sa présence marque une écriture : l'ancien message est effacé. */
  success?: string
  /** Remplace le message de l'erreur, par exemple LOAD_ERROR pour un chargement. */
  error?: string
}

export function useNotification() {
  const clear = () => {
    clearTimeout(timer)
    message.value = ''
  }

  // Un succès disparaît seul ; une erreur reste jusqu'à ce qu'on la ferme.
  const notify = (text: string, kind: NotificationTone = 'success') => {
    clearTimeout(timer)
    message.value = text
    tone.value = kind
    if (kind === 'success') timer = setTimeout(clear, SUCCESS_DURATION_MS)
  }

  const notifyError = (error: unknown) => {
    notify(error instanceof Error ? error.message : String(error), 'error')
  }

  /** Exécute un appel API et notifie son issue. Renvoie undefined en cas d'échec, sans lever. */
  const run = async <T>(call: () => Promise<T>, messages: RunMessages = {}) => {
    if (messages.success) clear()
    try {
      const result = await call()
      if (messages.success) notify(messages.success)
      return result
    } catch (error) {
      if (messages.error) notify(messages.error, 'error')
      else notifyError(error)
      return undefined
    }
  }

  return { message, tone, notify, notifyError, clear, run }
}
