export type Dir = 'U' | 'D' | 'L' | 'R'

export type Point = [number, number]

export interface Rope {
  head: Point
  tail1: Point
  tail2: Point
  tail3: Point
  tail4: Point
  tail5: Point
  tail6: Point
  tail7: Point
  tail8: Point
  /** List of all points the tail has been. First element is the final position. */
  tail9: Point[]
}
