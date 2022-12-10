import { floor } from 'lodash'
import { flatten, flow, isEqual, map, reduce, split, spread, toNumber, uniqWith } from 'lodash/fp'
import { performance } from 'perf_hooks'
import { duplicate } from '../utils/fp'
import { Dir, Point, Rope } from './models'

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

    return lines
  }
}

const goDir = (p: Point, d: Dir): Point => {
  switch (d) {
    case 'U':
      return [p[0], p[1] - 1]
    case 'D':
      return [p[0], p[1] + 1]
    case 'L':
      return [p[0] - 1, p[1]]
    case 'R':
      return [p[0] + 1, p[1]]
  }
}

const getTailPoint = (t: Point, h: Point): Point => {
  const dx = h[0] - t[0]
  const dy = h[1] - t[1]

  if (Math.abs(dx) > 1) {
    // t.x moves towards h.x
    // t.y becomes same as h
    return [t[0] + floor(dx / 2), h[1]]
  }
  if (Math.abs(dy) > 1) {
    // t.x becomes same as h
    // t.y moves towards h.y
    return [h[0], t[1] + floor(dy / 2)]
  }
  // else don't move t
  return [...t]
}

/** Split input to a list of lines */
const parseInput: (input: string) => number = flow(
  split('\n'),
  map(flow(
    split(' '),
    ([a, b]) => [toNumber(b), a] as const,
    spread(duplicate)
  )),
  flatten,
  reduce<Dir, Rope>((prev, curr) => {
    const head = goDir(prev.head, curr)
    const newTail = getTailPoint(prev.tail[0], head)
    const tail = [newTail, ...prev.tail]

    return { head, tail }
  }, { head: [0, 0], tail: [[0, 0]] }),
  r => r.tail,
  uniqWith(isEqual),
  u => u.length
)
