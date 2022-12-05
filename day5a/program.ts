import { drop, dropRight, dropRightWhile, flow, last, map, reverse, split, toNumber } from 'lodash/fp'
import { performance } from 'perf_hooks'
import { transpose } from '../utils/fp'
import { Step } from './models'

export class Program {
  main (input: string): void {
    const t0 = performance.now()
    const result = this.calcResult(input)
    const t1 = performance.now()
    console.log(`Calc took ${t1 - t0} milliseconds.`)
    console.log('Answer:', result)
  }

  private calcResult (input: string): string {
    const { crates, steps } = parseInput(input)

    for (const step of steps) {
      this.doStep(crates, step)
    }

    const result = crates.map(last)
    return result.join('')
  }

  private doStep (crates: string[][], step: Step): void {
    const fromStack = crates[step.from]
    const toStack = crates[step.to]
    const movingCrates = fromStack.splice(fromStack.length - step.amount, step.amount)
    toStack.push(...reverse(movingCrates))
  }
}

const getCratesOnLine: (input: string) => string[] = flow(
  split(''),
  chars => chars.filter((_c, i) => ((i - 1) % 4) === 0)
)

const parseCrates: (input: string) => string[][] = flow(
  split('\n'),
  // Drop the column numbers. We don't need them.
  dropRight(1),
  map(getCratesOnLine),
  // Flip matrix diagonally, putting crates of one stack together in the arrays
  transpose,
  map(flow(
    reverse,
    // Remove the elements that do not contain a crate
    dropRightWhile(c => c == null || c === ' ')
  ))
)

const parseSteps: (input: string) => Step[] = flow(
  split('\n'),
  map(flow(
    l => /^move (\d+) from (\d+) to (\d+)$/.exec(l),
    drop(1),
    map(toNumber),
    // Subtract 1 from column IDs
    ([amount, from, to]) => ({ amount, from: from - 1, to: to - 1 })
  ))
)

/** Split input to a list of lines */
const parseInput: (input: string) => { crates: string[][], steps: Step[] } = flow(
  split('\n\n'),
  ([crates, steps]) => ({ crates: parseCrates(crates), steps: parseSteps(steps) })
)
