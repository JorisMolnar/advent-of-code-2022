import { countBy, flatten, flow, map, pickBy, range, split, thru, toPairs } from 'lodash/fp'
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
    const lines = parseInput(input)

    throw new Error('Not implemented')
  }
}

/** Split input to a list of lines */
const parseInput: (input: string) => string[][] = flow(
  split('\n'),
  map(split(' -> '))
)
