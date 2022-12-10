import { floor } from 'lodash'
import { flatten, flow, join, map, reduce, split, spread, toNumber, uniq } from 'lodash/fp'
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

  if (Math.abs(dx) > 1 && Math.abs(dy) > 1) {
    // Extra case only possible with longer rope
    // t.x moves towards h.x
    // t.y moves towards h.y
    return [t[0] + floor(dx / 2), t[1] + floor(dy / 2)]
  }
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
    // Hackiest of hacks. Refactor if you ever feel like it.
    const tail1 = getTailPoint(prev.tail1, head)
    const tail2 = getTailPoint(prev.tail2, tail1)
    const tail3 = getTailPoint(prev.tail3, tail2)
    const tail4 = getTailPoint(prev.tail4, tail3)
    const tail5 = getTailPoint(prev.tail5, tail4)
    const tail6 = getTailPoint(prev.tail6, tail5)
    const tail7 = getTailPoint(prev.tail7, tail6)
    const tail8 = getTailPoint(prev.tail8, tail7)
    const tail9 = getTailPoint(prev.tail9[0], tail8)
    const fullTail9 = [tail9, ...prev.tail9]

    return {
      head,
      tail1,
      tail2,
      tail3,
      tail4,
      tail5,
      tail6,
      tail7,
      tail8,
      tail9: fullTail9
    }
  }, {
    head: [0, 0],
    tail1: [0, 0],
    tail2: [0, 0],
    tail3: [0, 0],
    tail4: [0, 0],
    tail5: [0, 0],
    tail6: [0, 0],
    tail7: [0, 0],
    tail8: [0, 0],
    tail9: [[0, 0]]
  }),
  r => r.tail9,
  map(join(',')),
  uniq,
  u => u.length
)
