import { flow, map, split, toNumber } from 'lodash/fp'
import { performance } from 'perf_hooks'
import { match } from '../utils/fp'
import { Point, Sensor } from './models'

/*
 * 1. Calculate distance to closest beason for every sensor.
 * 2. On Y=2.000.000, for every X coordinate, get distance to every sensor.
 * 3. If distance to any sensor is less or equal to closest beacon from that sensor, count it, unless it is the beacon itself.
 *
 * NOTE: It would have been a lot smarter and faster to get the manhattan distance of every sensor/beacon combo,
 * subtract the sensor Y distance from the resultY, and used that to calculate the points on this line
 * which would be covered by that sensor. Add all points to a unique set and count the size.
 */

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

    const closestBeaconMap = new Map<string, number>(sensors.map(s => [
      pointToHash(s.sensor),
      manhattan(s.sensor, s.beacon)
    ]))

    let count = 0
    // This range is probably way too big, but it's an easy way to check.
    for (let x = -10_000_000; x < 10_000_000; x++) {
      const point = { x, y: resultY }

      for (const s of sensors) {
        // Skip if point is beacon itself
        if (pointToHash(point) === pointToHash(s.beacon)) continue

        const distance = manhattan(point, s.sensor)
        if (distance <= (closestBeaconMap.get(pointToHash(s.sensor)) ?? Infinity)) {
          // There can't be a beacon here. Count it and stop checking other sensors.
          count++
          break
        }
      }
    }

    return count
  }
}

const manhattan = (p: Point, end: Point): number => Math.abs(p.x - end.x) + Math.abs(p.y - end.y)

const pointToHash = (p: Point): string => `${p.x},${p.y}`

/** Split input to a list of lines */
const parseInput: (input: string) => Sensor[] = flow(
  split('\n'),
  map(flow(
    match(/^Sensor at x=(-?\d+), y=(-?\d+): closest beacon is at x=(-?\d+), y=(-?\d+)$/),
    map(toNumber),
    ([sx, sy, bx, by]) => ({ sensor: { x: sx, y: sy }, beacon: { x: bx, y: by } })
  ))
)
