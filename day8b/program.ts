import { findIndex, max } from 'lodash'
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
    const highestScore = max(forest.flatMap((row, y) => row.map((_, x) => this.getScenicScore(forest, x, y)))) ?? 0

    return highestScore
  }

  private getScenicScore (forest: number[][], x: number, y: number): number {
    const width = forest[0].length
    const height = forest.length
    const treesLeft = forest[y].slice(0, x).reverse()
    const treesRight = forest[y].slice(x + 1, width)
    const treesTop = forest.slice(0, y).map(row => row[x]).reverse()
    const treesBottom = forest.slice(y + 1, height).map(row => row[x])

    const current = forest[y][x]

    const scoreLeft = this.getScore(current, treesLeft)
    const scoreRight = this.getScore(current, treesRight)
    const scoreTop = this.getScore(current, treesTop)
    const scoreBottom = this.getScore(current, treesBottom)

    return scoreLeft * scoreRight * scoreTop * scoreBottom
  }

  private getScore (tree: number, view: number[]): number {
    let blockingTree = findIndex(view, t => t >= tree) + 1
    if (blockingTree === 0) blockingTree = view.length
    return blockingTree
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
