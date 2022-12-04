import { flow, map, orderBy, split, sum, take, toNumber } from 'lodash/fp'
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

    if (result == null) {
      console.error('Invalid result', result)
      throw new Error()
    }

    return result
  }
}

/** Split input to a list of lines */
const parseInput = flow(
  split('\n\n'),
  map(flow(
    split('\n'),
    map(toNumber),
    sum
  )),
  orderBy((n: boolean) => n, 'desc'),
  take(3),
  sum
)
