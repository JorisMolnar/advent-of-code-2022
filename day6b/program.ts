import { add, findIndex, flow, split, uniq } from 'lodash/fp'
import { performance } from 'perf_hooks'
import { window } from '../utils/fp'

export class Program {
  main (input: string): void {
    const t0 = performance.now()
    const result = this.calcResult(input)
    const t1 = performance.now()
    console.log(`Calc took ${t1 - t0} milliseconds.`)
    console.log('Answer:', result)
  }

  private calcResult (input: string): number {
    const position = parseInput(input)

    return position
  }
}

/** Split input to a list of lines */
const parseInput: (input: string) => number = flow(
  split(''),
  window(14),
  findIndex(flow(uniq, marker => marker.length === 14)),
  add(14)
)
