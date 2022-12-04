import { intersection, range } from 'lodash'
import { filter, flow, map, split, toNumber } from 'lodash/fp'
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
    const count = parseInput(input)

    return count
  }
}

/** Split input to a list of lines */
const parseInput: (input: string) => number = flow(
  split('\n'),
  map(flow(
    // 2-4,6-8
    split(','),
    map(flow(
      // 2-4
      split('-'),
      map(toNumber),
      // [2,4]
      ([start, end]) => range(start, end + 1)
      // [2,3,4]
    ))
    // [ [2,3,4], [6,7,8] ]
  )),
  filter(([a, b]) => intersection(a, b).length > 0),
  pairs => pairs.length
)
