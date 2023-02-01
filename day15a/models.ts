export interface Point {
  x: number
  y: number
}

export interface Sensor {
  sensor: Point
  beacon: Point
}

export type Range = [number, number]
