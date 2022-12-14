import { chunk, drop, flatMap, flow, map, nth, reduce, reject, split, sum, take, toNumber } from 'lodash/fp'
import { performance } from 'perf_hooks'

export class Program {
  main (input: string): void {
    const t0 = performance.now()
    const result = this.calcResult(input)
    const t1 = performance.now()
    console.log(`Calc took ${t1 - t0} milliseconds.`)
    console.log('Answer:', result)
  }

  private calcResult (input: string): number {
    const result = parseInput(input)

    return result
  }
}

const parseInput: (input: string) => number = flow(
  split('\n'),
  // Turn command that take 2 cycles into commands of 1 cycle
  flatMap(l => l.startsWith('addx') ? ['noop', l] : l),
  // 19, because we want to shift everything by 1, as we need the result DURING the 20th, 60th, etc. command
  ops => [take(19, ops), ...chunk(40, drop(19, ops))],
  take(6),
  map(flow(
    reject(l => l === 'noop'),
    map(flow(
      split(' '),
      nth(1),
      toNumber
    )),
    sum
  )),
  flow(
    reduce((prev, curr) => [...prev, prev[prev.length - 1] + curr], [1]),
    // drop initial [1]
    drop(1),
    xs => xs.map((x, i) => x * (i * 40 + 20))
  ),
  sum
)
