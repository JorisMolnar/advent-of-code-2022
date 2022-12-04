import { flow, map, split, sum, thru } from 'lodash/fp'
import { performance } from 'perf_hooks'
import { Outcome, Shape, Step } from './models'

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

const getResponseShape = (step: Step): Shape => {
  return (step.move + step.outcome + 3) % 3
}

const outcomeScoreMap: Record<Outcome, number> = {
  [Outcome.Lose]: 0,
  [Outcome.Draw]: 3,
  [Outcome.Win]: 6
}

const calcScore = (step: Step): number => {
  const responseShape = getResponseShape(step)

  const outcomeScore = outcomeScoreMap[step.outcome]
  const shapeScore = responseShape + 1
  return shapeScore + outcomeScore
}

const shapeMap: Record<string, Shape> = {
  A: Shape.Rock,
  B: Shape.Paper,
  C: Shape.Scissors
}

const outcomeMap: Record<string, Outcome> = {
  X: Outcome.Lose,
  Y: Outcome.Draw,
  Z: Outcome.Win
}

const parseInput: (input: string) => Step[] = flow(
  split('\n'),
  map(flow(
    split(' '),
    thru(([move, response]) => {
      const shape = shapeMap[move]
      const outcome = outcomeMap[response]

      const step: Step = { move: shape, outcome }
      return step
    })
  ))
)
