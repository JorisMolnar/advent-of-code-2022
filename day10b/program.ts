import { chunk, flatMap, flow, join, map, nth, reduce, split, toNumber } from 'lodash/fp'
import { performance } from 'perf_hooks'

export class Program {
  main (input: string): void {
    const t0 = performance.now()
    const result = this.calcResult(input)
    const t1 = performance.now()
    console.log(`Calc took ${t1 - t0} milliseconds.`)
    console.log('Answer:', result)
  }

  private calcResult (input: string): string {
    const result = parseInput(input)

    return result
  }
}

const parseInput: (input: string) => string = flow(
  split('\n'),
  // Turn command that take 2 cycles into commands of 1 cycle
  flatMap(l => l.startsWith('addx') ? ['noop', l] : l),
  map(op => op === 'noop' ? 0 : flow(split(' '), nth(1), toNumber)(op)),
  reduce((prev, curr) => [...prev, prev[prev.length - 1] + curr], [1]),
  // We now have a list of the sprite position every clock cycle
  ps => ps.reduce<boolean[]>((prev, curr, i) => [...prev, Math.abs(curr - i % 40) < 2], []),
  flow(
    map((v: boolean) => v ? '#' : '.'),
    chunk(40),
    map(join('')),
    join('\n        ')
  )
)
