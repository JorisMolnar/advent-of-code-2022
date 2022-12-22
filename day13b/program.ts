import { findIndex, isArray, isEqual, isNumber, zip } from 'lodash'
import { filter, flow, map, split } from 'lodash/fp'
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
    const lines = parseInput(input)
    lines.push([[2]], [[6]])

    lines.sort((a, b) => compare([a, b]))

    const idx2 = 1 + findIndex(lines, l => isEqual(l, [[2]]))
    const idx6 = 1 + findIndex(lines, l => isEqual(l, [[6]]))

    return idx2 * idx6
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

const compare = (pair: Pair): -1 | 0 | 1 => {
  const result = isRightOrder(pair)
  if (result === true) return -1
  if (result === false) return 1
  return 0
}

/** Split input to a list of parsed lines */
const parseInput: (input: string) => Array<Array<ValueOrArray<number>>> = flow(
  split('\n'),
  filter(l => l !== ''),
  map(JSON.parse)
)
