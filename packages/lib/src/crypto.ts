export function randomUUID(): string {
  const g: any = globalThis as any
  if (g.crypto && typeof g.crypto.randomUUID === 'function') {
    return g.crypto.randomUUID()
  }
  const s: string[] = []
  const hex = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'
  for (let i = 0; i < hex.length; i++) {
    const c = hex[i]
    if (c === 'x' || c === 'y') {
      const r = (Math.random() * 16) | 0
      const v = c === 'x' ? r : (r & 0x3) | 0x8
      s.push(v.toString(16))
    } else {
      s.push(c)
    }
  }
  return s.join('')
}
