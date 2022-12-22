import { isArray, isNumber, zip } from 'lodash'
import { flow, map, split, sum } from 'lodash/fp'
import { performance } from 'perf_hooks'
import { Pair, ValueOrArray } from './models'

export class Program {
  main (input: string): void {
    const t0 = performance.now()
    const result = this.calcResult(input)
    const t1 = performance.now()
    console.log(`Calc took ${t1 - t0} milliseconds.`)
    console.log('Answer:', result)
  }

  private calcResult (input: string): number {
    const pairs = parseInput(input)

    const result = countRightOrder(pairs)

    return result
  }
}

const makeList = (input: number): [number] => [input]

const isRightOrder = (pair: Pair): boolean | null => {
  const zipped = zip(...pair)

  for (let [z1, z2] of zipped) {
    if (z1 === undefined) return true
    if (z2 === undefined) return false

    if (isNumber(z1) && isNumber(z2)) {
      if (z1 < z2) return true
      if (z1 > z2) return false
      continue
    }

    if (isNumber(z1) && isArray(z2)) z1 = makeList(z1)
    if (isArray(z1) && isNumber(z2)) z2 = makeList(z2)

    if (isArray(z1) && isArray(z2)) {
      const nested = isRightOrder([z1, z2])
      if (nested !== null) return nested
    } else {
      throw new Error('Impossible')
    }
  }

  return null
}

const countRightOrder: (pairs: Pair[]) => number = flow(
  map(isRightOrder),
  results => results.map((r, i) => r === true ? i + 1 : 0),
  sum
)

/** Split input to a list of pairs */
const parseInput: (input: string) => Pair[] = flow(
  split('\n\n'),
  map(flow(
    split('\n'),
    map(JSON.parse),
    // manual cast because `map` does not neatly handle tuples
    x => x as [Array<ValueOrArray<number>>, Array<ValueOrArray<number>>]
  ))
)
