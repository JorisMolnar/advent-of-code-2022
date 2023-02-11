export function measure<T> (name: string, callback: () => T): T {
  const t0 = performance.now()
  const r = callback()
  const t1 = performance.now()
  console.log(`${name} took ${t1 - t0} milliseconds.`)
  return r
}
