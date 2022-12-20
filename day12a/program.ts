import { flow, map, split } from 'lodash/fp'
import { performance } from 'perf_hooks'
import { Area, Dir, Point } from './models'
import { isEqual } from 'lodash'
import { astar } from './astar'

export class Program {
  async main (input: string): Promise<void> {
    const t0 = performance.now()
    const result = await this.calcResult(input)
    const t1 = performance.now()
    console.log(`Calc took ${t1 - t0} milliseconds.`)
    console.log('Answer:', result)
  }

  private area!: Area

  private start!: Point
  private end!: Point

  private width!: number
  private height!: number

  private async calcResult (input: string): Promise<number> {
    this.area = parseInput(input)

    this.start = getStart(this.area)
    this.end = getEnd(this.area)

    this.width = this.area[0].length
    this.height = this.area.length

    const points = astar(this.start, this.end, p => manhattan(p, this.end), (curr, prev) => this.getNeighbors(curr, prev))

    console.log(points)

    // Subtract 1 because the function also returns the initial starting point, but we need the steps
    return points.length - 1
  }

  private getNeighbors (curr: Point, prev: Point | undefined): Point[] {
    return Object.values(Dir)
      .map(d => {
        switch (d) {
          case Dir.Right:
            return { ...curr, x: curr.x + 1 }
          case Dir.Down:
            return { ...curr, y: curr.y + 1 }
          case Dir.Left:
            return { ...curr, x: curr.x - 1 }
          case Dir.Up:
            return { ...curr, y: curr.y - 1 }
          default:
            throw new Error(`Unknown direction ${d}`)
        }
      })
      // remove out-of-bounds
      .filter(p => p.x >= 0 && p.x < this.width && p.y >= 0 && p.y < this.height)
      // remove prev as going back doesn't make sense
      .filter(p => !isEqual(p, prev))
      // remove too high points
      .filter(p => this.getHeightDifference(curr, p) <= 1)
  }

  private getHeightDifference (p1: Point, p2: Point): number {
    // Special cases for S and E
    const v1 = isEqual(p1, this.start) ? 'a'.charCodeAt(0) : getVal(this.area, p1)
    const v2 = isEqual(p2, this.end) ? 'z'.charCodeAt(0) : getVal(this.area, p2)

    return v2 - v1
  }
}

const manhattan = (p: Point, end: Point): number => Math.abs(p.x - end.x) + Math.abs(p.y - end.y)
// const straight = (p: Point, end: Point): number => Math.sqrt((p.x - end.x) ** 2 + (p.y - end.y) ** 2)

const getVal = (area: Area, p: Point): number => area[p.y][p.x].charCodeAt(0)

const getStart = (area: Area): Point => {
  const width = area[0].length
  const pos = area.flat().findIndex(v => v === 'S')
  return {
    x: pos % width,
    y: Math.floor(pos / width)
  }
}

const getEnd = (area: Area): Point => {
  const width = area[0].length
  const pos = area.flat().findIndex(v => v === 'E')
  return {
    x: pos % width,
    y: Math.floor(pos / width)
  }
}

/** Split input to a map */
const parseInput: (input: string) => Area = flow(
  split('\n'),
  map(split(''))
)
