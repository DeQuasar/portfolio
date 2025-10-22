import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { defineComponent } from 'vue'
import { mount } from '@vue/test-utils'
import { useClipboard } from '../../composables/useClipboard'

type ClipboardMock = { writeText: ReturnType<typeof vi.fn> }

const createClipboardMock = (): ClipboardMock => ({
  writeText: vi.fn(async () => {})
})

const setClipboard = (value: unknown) => {
  const target = navigator as unknown as { clipboard?: unknown }
  if (value) {
    try {
      Object.defineProperty(navigator, 'clipboard', {
        configurable: true,
        writable: true,
        value
      })
    } catch {
      target.clipboard = value
    }
  } else {
    delete target.clipboard
  }
}

const ensureDocument = () => {
  if (typeof document !== 'undefined') {
    return
  }

  const textareaFactory = () => ({
    value: '',
    setAttribute: vi.fn(),
    style: {} as Record<string, unknown>,
    select: vi.fn()
  })

  const mockDocument = {
    body: {
      appendChild: vi.fn(),
      removeChild: vi.fn()
    },
    createElement: vi.fn(() => textareaFactory()),
    execCommand: vi.fn(() => true)
  } as unknown as Document

  vi.stubGlobal('document', mockDocument)
}

const ensureNavigator = () => {
  if (typeof navigator !== 'undefined') {
    return
  }
  const mockNavigator = {} as Navigator
  vi.stubGlobal('navigator', mockNavigator)
}

let originalClipboard: unknown
let hadClipboardInitially = false
let originalExecCommand: Document['execCommand'] | undefined
const activeCleanups: Array<() => void> = []

const mountClipboard = (timeout?: number) => {
  let api!: ReturnType<typeof useClipboard>

  const wrapper = mount(defineComponent({
    name: 'ClipboardHarness',
    setup() {
      api = useClipboard(timeout)
      return () => null
    }
  }))

  const cleanup = () => {
    wrapper.unmount()
  }
  activeCleanups.push(cleanup)

  return api
}

describe('useClipboard', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.spyOn(console, 'error').mockImplementation(() => {})
    ensureDocument()
    ensureNavigator()

    hadClipboardInitially = typeof navigator !== 'undefined' && 'clipboard' in navigator
    originalClipboard = hadClipboardInitially ? (navigator as unknown as { clipboard: unknown }).clipboard : undefined
    setClipboard(createClipboardMock())

    originalExecCommand = typeof document !== 'undefined' ? document.execCommand : undefined
    if (typeof document !== 'undefined') {
      document.execCommand = vi.fn(() => true) as Document['execCommand']
    }
  })

  afterEach(() => {
    activeCleanups.splice(0).forEach((fn) => {
      try {
        fn()
      } catch {}
    })

    vi.runOnlyPendingTimers()
    vi.useRealTimers()
    vi.restoreAllMocks()

    if (typeof document !== 'undefined' && originalExecCommand) {
      document.execCommand = originalExecCommand
    }
    setClipboard(hadClipboardInitially ? originalClipboard : undefined)
    vi.unstubAllGlobals()
  })

  it('returns false when attempting to copy an empty string', async () => {
    const { copy, state } = mountClipboard()
    const result = await copy('')
    expect(result).toBe(false)
    expect(state.value).toBe('idle')
  })

  it('uses the native clipboard API when available and schedules a reset', async () => {
    const { copy, state } = mountClipboard(500)
    const clipboard = navigator as unknown as { clipboard: ClipboardMock }
    clipboard.clipboard.writeText.mockResolvedValueOnce(undefined)

    const result = await copy('hello@example.com')

    expect(result).toBe(true)
    expect(clipboard.clipboard.writeText).toHaveBeenCalledWith('hello@example.com')
    expect(state.value).toBe('copied')

    vi.advanceTimersByTime(499)
    expect(state.value).toBe('copied')
    vi.advanceTimersByTime(1)
    expect(state.value).toBe('idle')
  })

  it('falls back to document.execCommand when native clipboard is unavailable', async () => {
    setClipboard(undefined)
    const execSpy = document.execCommand as unknown as ReturnType<typeof vi.fn>
    execSpy.mockReturnValueOnce(true)

    const { copy, state } = mountClipboard()
    const result = await copy('copy-me')

    expect(result).toBe(true)
    expect(execSpy).toHaveBeenCalledWith('copy')
    expect(state.value).toBe('copied')
    vi.runAllTimers()
  })

  it('marks state as error when both native and fallback copies fail', async () => {
    const clipboard = navigator as unknown as { clipboard: ClipboardMock }
    clipboard.clipboard.writeText.mockRejectedValueOnce(new Error('nope'))
    const execSpy = document.execCommand as unknown as ReturnType<typeof vi.fn>
    execSpy.mockReturnValueOnce(false)

    const { copy, state } = mountClipboard()
    const result = await copy('value')

    expect(clipboard.clipboard.writeText).toHaveBeenCalled()
    expect(execSpy).toHaveBeenCalledWith('copy')
    expect(result).toBe(false)
    expect(state.value).toBe('error')
    vi.runAllTimers()
  })

  // onBeforeUnmount hook is registered inside the composable; exercising it would require a full Vue component instance.
})
