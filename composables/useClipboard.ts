import { onBeforeUnmount, ref } from 'vue'

export type ClipboardState = 'idle' | 'copied' | 'error'

const CLIPBOARD_NATIVE_TIMEOUT = 300

export function useClipboard(resetDelay = 2500) {
  const state = ref<ClipboardState>('idle')
  let timeout: ReturnType<typeof setTimeout> | undefined

  const reset = () => {
    if (timeout) {
      clearTimeout(timeout)
      timeout = undefined
    }
    state.value = 'idle'
  }

  const scheduleReset = () => {
    if (timeout) {
      clearTimeout(timeout)
    }
    timeout = setTimeout(reset, resetDelay)
  }

  const copy = async (value: string) => {
    if (!value) {
      return false
    }

    const fallbackCopy = () => {
      if (typeof document === 'undefined') {
        return false
      }
      const textarea = document.createElement('textarea')
      textarea.value = value
      textarea.setAttribute('readonly', '')
      textarea.style.position = 'absolute'
      textarea.style.left = '-9999px'
      document.body.appendChild(textarea)
      textarea.select()
      const result = document.execCommand('copy')
      document.body.removeChild(textarea)
      return result
    }

    try {
      let copied = false

      if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
        let timeoutId: ReturnType<typeof setTimeout> | undefined
        const nativeCopyPromise = navigator.clipboard.writeText(value).then(() => true).catch((error) => {
          console.error('navigator.clipboard.writeText failed', error)
          return false
        })
        const timeoutPromise = new Promise<boolean>((resolve) => {
          timeoutId = setTimeout(() => resolve(false), CLIPBOARD_NATIVE_TIMEOUT)
        })
        copied = await Promise.race([nativeCopyPromise, timeoutPromise])
        if (timeoutId) {
          clearTimeout(timeoutId)
        }
      }

      if (!copied) {
        copied = fallbackCopy()
      }

      if (!copied) {
        throw new Error('Clipboard API not available')
      }

      state.value = 'copied'
      return true
    } catch (error) {
      console.error('Failed to copy value to clipboard', error)
      state.value = 'error'
      return false
    } finally {
      scheduleReset()
    }
  }

  onBeforeUnmount(() => {
    if (timeout) {
      clearTimeout(timeout)
    }
  })

  return {
    state,
    copy,
    reset,
  }
}
