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
    const resultY = 2000000 // Note that the example resultY is 10, not 2000000!

    const ranges = flow(
      map(sensorCoverageAtY(resultY)),
      reduce((acc, range) => acc.add(range), new DRange())
    )(sensors)

    const count = ranges.length

    return count
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

/** Split input to a list of lines */
const parseInput: (input: string) => Sensor[] = flow(
  split('\n'),
  map(flow(
    match(/^Sensor at x=(-?\d+), y=(-?\d+): closest beacon is at x=(-?\d+), y=(-?\d+)$/),
    map(toNumber),
    ([sx, sy, bx, by]) => ({ sensor: { x: sx, y: sy }, beacon: { x: bx, y: by } })
  ))
)
