export function createThrottle(fn: (...args: any[]) => void, wait: number) {

  const lastUsed = { current: 0 }

  return (...args: any[]) => {
    const now = Date.now()
    if (now - lastUsed.current > wait) {
      lastUsed.current = now
      fn(...args)
    }
  }

}