export interface Step {
  move: Shape
  outcome: Outcome
}

export enum Shape {
  Rock = 0,
  Paper = 1,
  Scissors = 2,
}

export enum Outcome {
  Lose = -1,
  Draw = 0,
  Win = 1,
}
