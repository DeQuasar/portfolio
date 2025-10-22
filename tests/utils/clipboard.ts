import type { Page } from 'playwright-core'

export async function installClipboardStub(page: Page) {
  await page.addInitScript(() => {
    const writes: string[] = []
    const stub = {
      writeText(text: string) {
        const value = typeof text === 'string' ? text : String(text)
        writes.push(value)
        return Promise.resolve()
      },
      readText() {
        return Promise.resolve(writes[writes.length - 1] ?? '')
      }
    }

    try {
      Object.defineProperty(navigator, 'clipboard', {
        configurable: true,
        value: stub
      })
    } catch (error) {
      try {
        const clipboard = (navigator as typeof navigator & { clipboard?: any }).clipboard ||= {}
        Object.assign(clipboard, stub)
      } catch (assignError) {
        console.warn('Failed to stub navigator.clipboard', assignError)
      }
    }

    const global = window as typeof window & { __clipboardWrites?: string[] }
    global.__clipboardWrites = writes
  })

  await page.reload({ waitUntil: 'networkidle' })
}
