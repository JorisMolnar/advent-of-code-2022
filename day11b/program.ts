import { orderBy } from 'lodash'
import { flow, identity, map, split, take } from 'lodash/fp'
import { performance } from 'perf_hooks'
import { Monkey } from './models'

export class Program {
  main (input: string): void {
    const t0 = performance.now()
    const result = this.calcResult(input)
    const t1 = performance.now()
    console.log(`Calc took ${t1 - t0} milliseconds.`)
    console.log('Answer:', result)
  }

  private calcResult (input: string): number {
    const monkeys = parseInput(input)

    // The LCM of prime numbers is their product, but that doesn't even really matter much here
    const lcm = monkeys.map(m => m.test.cond).reduce((p, c) => p * c)

    const t0 = performance.now()

    for (let round = 0; round < 10000; round++) {
      for (let monkeyIdx = 0; monkeyIdx < monkeys.length; monkeyIdx++) {
        const m = monkeys[monkeyIdx]
        for (let itemIdx = 0; itemIdx < m.items.length; itemIdx++) {
          const item = m.items[itemIdx]

          // Do inspection operation
          const a = m.operation.a === 'old' ? item : m.operation.a
          const b = m.operation.b === 'old' ? item : m.operation.b
          let newValue = m.operation.op === '*' ? a * b : a + b

          // Count inspection
          m.inspections++

          // Naturally reducing worry doesn't happen anymore.
          // But we must still reduce worry. Because of math magic, it's safe to
          // use the remainder of dividing by the LCM.
          newValue = newValue % lcm

          // Do test and throw item to monkey
          // (by copying, and removing all items afterwards, because I don't want to bother with shifting index)
          if ((newValue % m.test.cond) === 0) {
            monkeys[m.test.destTrue].items.push(newValue)
          } else {
            monkeys[m.test.destFalse].items.push(newValue)
          }
        }

        // Remove all items, as they have been thrown
        m.items = []
      }

      // Log every 100 rounds
      if (round % 100 === 0) {
        const tNow = performance.now()
        console.log(`Finished round ${round}. Time elapsed: ${(tNow - t0).toFixed(2)} ms`)
      }
    }

    const monkeyBusiness = getMonkeyBusiness(monkeys)
    return monkeyBusiness
  }
}

const getMonkeyBusiness: (monkeys: Monkey[]) => number = flow(
  map(m => m.inspections),
  inspections => orderBy(inspections, identity, 'desc'),
  take(2),
  inspections => inspections[0] * inspections[1]
)

const parseMonkey = (s: string): Monkey => {
  const matches = /Monkey (\d+):\n.*Starting.*: ([\d, ]+)\n.*Operation: new = (.+)\n.*Test: divisible by (\d+)\n.*true: throw to monkey (\d+)\n.*false: throw to monkey (\d+)/gm
    .exec(s)

  if (matches == null) {
    throw new Error('Unable to parse Monkey:\n' + s)
  }

  const formula = matches[3].split(' ')

  return {
    id: Number(matches[1]),
    inspections: 0,
    items: matches[2].split(', ').map(Number),
    operation: {
      a: formula[0] === 'old' ? 'old' : Number(formula[0]),
      b: formula[2] === 'old' ? 'old' : Number(formula[2]),
      op: formula[1] as '+' | '*'
    },
    test: {
      cond: Number(matches[4]),
      destTrue: Number(matches[5]),
      destFalse: Number(matches[6])
    }
  }
}

/** Split input to a list of lines */
const parseInput: (input: string) => Monkey[] = flow(
  split('\n\n'),
  map(s => parseMonkey(s)),
  ms => orderBy(ms, 'id', 'asc')
)
