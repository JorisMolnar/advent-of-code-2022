export interface Step {
  move: Shape
  response: Shape
}

export enum Shape {
  Rock = 0,
  Paper,
  Scissors,
}
