import { max, min, range } from 'lodash'
import { flatten, flow, isEqual, map, split, toNumber, uniqWith } from 'lodash/fp'
import { performance } from 'perf_hooks'
import { window } from '../utils/fp'
import { Path, Point } from './models'

export class Program {
  main (input: string): void {
    const t0 = performance.now()
    const result = this.calcResult(input)
    const t1 = performance.now()
    console.log(`Calc took ${t1 - t0} milliseconds.`)
    console.log('Answer:', result)
  }

  private calcResult (input: string): number {
    const paths = parseInput(input)
    // this.render(paths)

    const result = this.pourGrains(paths)

    return result
  }

  private pourGrains (paths: Path[]): number {
    const ymax = max(paths.flat().map(p => p.y)) ?? 0
    const solid = new Set(pathsToPoints(paths).concat(generateFloor(ymax + 2)).map(pointToHash))

    let grains = 0
    while (true) {
      let sand: Point = { x: 500, y: 0 }

      while (true) {
        const lower = lowerPoints(sand)

        if (!solid.has(pointToHash(lower[1]))) sand = lower[1]
        else if (!solid.has(pointToHash(lower[0]))) sand = lower[0]
        else if (!solid.has(pointToHash(lower[2]))) sand = lower[2]
        else break
      }

      solid.add(pointToHash(sand))
      grains++

      // Check if The Hole™ is plugged
      if (sand.x === 500 && sand.y === 0) return grains
    }
  }

  private render (paths: Path[]): void {
    const ymin = 0
    const ymax = max(paths.flat().map(p => p.y)) ?? 0
    const xmin = min(paths.flat().map(p => p.x)) ?? 0
    const xmax = max(paths.flat().map(p => p.x)) ?? 0

    const rocks = pathsToPoints(paths)

    let cave = ''
    for (let y = ymin; y <= ymax; y++) {
      for (let x = xmin; x <= xmax; x++) {
        if (y === 0 && x === 500) {
          cave += '+'
          continue
        }
        if (rocks.some(p => p.x === x && p.y === y)) {
          cave += '#'
        } else {
          cave += '.'
        }
      }
      cave += '\n'
    }

    console.log(cave)
  }
}

const pointToHash = (p: Point): string => `${p.x},${p.y}`

const lowerPoints = (p: Point): [Point, Point, Point] => [
  { x: p.x - 1, y: p.y + 1 },
  { x: p.x, y: p.y + 1 },
  { x: p.x + 1, y: p.y + 1 }
]

const lineToPoints = (p1: Point, p2: Point): Point[] => {
  if (p1.x === p2.x) {
    if (p1.y <= p2.y) {
      return range(p1.y, p2.y + 1).map(y => ({ x: p1.x, y }))
    } else {
      return range(p1.y, p2.y - 1, -1).map(y => ({ x: p1.x, y }))
    }
  }
  if (p1.y === p2.y) {
    if (p1.x <= p2.x) {
      return range(p1.x, p2.x + 1).map(x => ({ x, y: p1.y }))
    } else {
      return range(p1.x, p2.x - 1, -1).map(x => ({ x, y: p1.y }))
    }
  }
  throw new Error('Line not horizontal or vertical')
}

const pathToPoints: (path: Path) => Point[] = flow(
  window(2),
  map(line => lineToPoints(line[0], line[1])),
  flatten,
  uniqWith(isEqual)
)

const pathsToPoints: (paths: Path[]) => Point[] = flow(
  map(pathToPoints),
  flatten,
  uniqWith(isEqual)
)

const generateFloor = (y: number): Point[] => lineToPoints({ x: -1000, y }, { x: 2000, y })

const parsePoint: (input: string) => Point = flow(
  split(','),
  map(toNumber),
  ([x, y]) => ({ x, y })
)

/** Split input to a list of paths */
const parseInput: (input: string) => Path[] = flow(
  split('\n'),
  map(flow(
    split(' -> '),
    map(parsePoint)
  ))
)
