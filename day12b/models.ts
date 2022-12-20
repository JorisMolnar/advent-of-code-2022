export type Area = string[][]

export enum Dir {
  Up = 'U',
  Down = 'D',
  Left = 'L',
  Right = 'R'
}

export interface Point {
  x: number
  y: number
}

export interface Node {
  p: Point
  /** fScore value, which is g (path traveled) + h (heuristic) */
  f: number
}
