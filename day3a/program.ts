import { intersection } from 'lodash'
import { first, flow, map, split, sum, uniq } from 'lodash/fp'
import { performance } from 'perf_hooks'

export class Program {
  main (input: string): void {
    const t0 = performance.now()
    const result = this.calcResult(input)
    const t1 = performance.now()
    console.log(`Calc took ${t1 - t0} milliseconds.`)
    console.log('Answer:', result)
  }

  private calcResult (input: string): any {
    const sum = parseInput(input)

    return sum
  }
}

const toPriority = (type: string): number => {
  const isUpper = type === type.toUpperCase()
  const val = type.toLowerCase().charCodeAt(0) - 'a'.charCodeAt(0) + 1
  return isUpper ? val + 26 : val
}

const parseInput: (input: string) => number = flow(
  split('\n'),
  map(flow(
    // split between compartments and grab distinct
    line => [
      uniq(line.substring(0, line.length / 2)),
      uniq(line.substring(line.length / 2, line.length))
    ] as const,
    parts => intersection(...parts),
    first,
    toPriority
  )),
  sum
)
