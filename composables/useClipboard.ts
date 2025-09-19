import { onBeforeUnmount, ref } from 'vue'

export type ClipboardState = 'idle' | 'copied' | 'error'

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

    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(value)
      } else if (typeof document !== 'undefined') {
        const textarea = document.createElement('textarea')
        textarea.value = value
        textarea.setAttribute('readonly', '')
        textarea.style.position = 'absolute'
        textarea.style.left = '-9999px'
        document.body.appendChild(textarea)
        textarea.select()
        document.execCommand('copy')
        document.body.removeChild(textarea)
      } else {
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
