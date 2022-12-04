import { flow, map, split, sum, thru } from 'lodash/fp'
import { performance } from 'perf_hooks'
import { Shape, Step } from './models'

export class Program {
  main (input: string): void {
    console.log(input)

    const t0 = performance.now()
    const result = this.calcResult(input)
    const t1 = performance.now()
    console.log(`Calc took ${t1 - t0} milliseconds.`)
    console.log('Answer:', result)
  }

  private calcResult (input: string): number {
    const steps = parseInput(input)
    const score = flow(
      map(calcScore),
      sum
    )(steps)

    return score
  }
}

const toShape = (value: string): Shape => {
  switch (value) {
    case 'A':
    case 'X':
      return Shape.Rock
    case 'B':
    case 'Y':
      return Shape.Paper
    case 'C':
    case 'Z':
      return Shape.Scissors
    default:
      throw new Error(`Illegal value '${value}'`)
  }
}

const calcScore = (step: Step): number => {
  const shapeScore = step.response - Shape.Rock + 1
  let outcomeScore: number = 0
  if (step.move === step.response) {
    outcomeScore = 3
  }
  if ((step.move === Shape.Paper && step.response === Shape.Scissors) ||
    (step.move === Shape.Scissors && step.response === Shape.Rock) ||
    (step.move === Shape.Rock && step.response === Shape.Paper)) {
    outcomeScore = 6
  }
  return shapeScore + outcomeScore
}

const parseInput: (input: string) => Step[] = flow(
  split('\n'),
  map(flow(
    split(' '),
    map(toShape),
    thru(([move, response]) => {
      const step: Step = { move, response }
      return step
    })
  ))
)
