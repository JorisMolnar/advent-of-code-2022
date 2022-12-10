export type Dir = 'U' | 'D' | 'L' | 'R'

export type Point = [number, number]

export interface Rope {
  head: Point
  /** List of all points the tail has been. First element is the final position. */
  tail: Point[]
}
