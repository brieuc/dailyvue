export const logger = {
  log: (...args) => {
    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.log(...args)
    }
  },
  error: (...args) => {
    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.error(...args)
    }
  },
  warn: (...args) => {
    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.warn(...args)
    }
  }
}