import { sum } from 'lodash'
import { flow, map, split, toNumber } from 'lodash/fp'
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
    const forest = parseInput(input)

    // Inefficient method, but no time for algorithm optimization now
    const visible = sum(forest.map((row, y) => row.filter((_, x) => this.isTreeVisible(forest, x, y)).length))

    return visible
  }

  private isTreeVisible (forest: number[][], x: number, y: number): boolean {
    const width = forest[0].length
    const height = forest.length
    const treesLeft = forest[y].slice(0, x)
    const treesRight = forest[y].slice(x + 1, width)
    const treesTop = forest.slice(0, y).map(row => row[x])
    const treesBottom = forest.slice(y + 1, height).map(row => row[x])

    return [treesLeft, treesRight, treesTop, treesBottom].some(trees => trees.every(t => t < forest[y][x]))
  }
}

/** Split input to a list of lines */
const parseInput: (input: string) => number[][] = flow(
  split('\n'),
  map(flow(
    split(''),
    map(toNumber)
  ))
)
