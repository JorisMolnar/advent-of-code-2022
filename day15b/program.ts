import * as DRange from 'drange'
import { flow, map, reduce, split, toNumber } from 'lodash/fp'
import { performance } from 'perf_hooks'
import { match } from '../utils/fp'
import { Point, Sensor } from './models'

export class Program {
  main (input: string): void {
    const t0 = performance.now()
    const result = this.calcResult(input)
    const t1 = performance.now()
    console.log(`Calc took ${t1 - t0} milliseconds.`)
    console.log('Answer:', result)
  }

  private calcResult (input: string): number {
    const sensors = parseInput(input)
    const max = 4000000

    let outputY: number | null = null
    let outputCoverage: DRange | null = null

    // for every y from 0 to max, calculate the total coverage
    for (let y = 0; y <= max; y++) {
      const total = totalCoverageAtY(y)(sensors)
      const constrained = total.intersect(0, max)

      if (constrained.subranges().length > 1) {
        outputY = y
        outputCoverage = new DRange(0, max).subtract(constrained)
      }
    }

    if (outputCoverage == null || outputY == null) throw new Error('No output coverage found')

    const distressBeaconX = outputCoverage.subranges()[0].low

    return distressBeaconX * 4000000 + outputY
  }
}

const manhattan = (p: Point, end: Point): number => Math.abs(p.x - end.x) + Math.abs(p.y - end.y)

const sensorCoverageAtY = (y: number) => (sensor: Sensor): DRange => {
  const distance = manhattan(sensor.sensor, sensor.beacon)
  const deltaY = Math.abs(sensor.sensor.y - y)
  const horizontalDistance = distance - deltaY

  if (horizontalDistance < 0) return new DRange()

  return new DRange(sensor.sensor.x - horizontalDistance, sensor.sensor.x + horizontalDistance)
}

const totalCoverageAtY: (y: number) => (sensors: Sensor[]) => DRange = y => flow(
  map(sensorCoverageAtY(y)),
  reduce((acc, range) => acc.add(range), new DRange())
)

/** Split input to a list of lines */
const parseInput: (input: string) => Sensor[] = flow(
  split('\n'),
  map(flow(
    match(/^Sensor at x=(-?\d+), y=(-?\d+): closest beacon is at x=(-?\d+), y=(-?\d+)$/),
    map(toNumber),
    ([sx, sy, bx, by]) => ({ sensor: { x: sx, y: sy }, beacon: { x: bx, y: by } })
  ))
)
