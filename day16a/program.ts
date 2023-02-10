import { sortedIndexBy } from 'lodash'
import { filter, flow, map, split, sum, toNumber } from 'lodash/fp'
import { performance } from 'perf_hooks'
import { match, toMap } from '../utils/fp'
import { Node, State } from './models'

export class Program {
  main (input: string): void {
    const t0 = performance.now()
    const result = this.calcResult(input)
    const t1 = performance.now()
    console.log(`Calc took ${t1 - t0} milliseconds.`)
    console.log('Answer:', result)
  }

  private calcResult (input: string): number {
    const nodes = parseInput(input)

    const state: State = {
      nodes,
      time: 0, // should maybe start at 1
      currentScore: 0,
      currentLocation: 'AA',
      steps: []
    }

    const bestState = bfs(state)

    console.log(bestState.steps)

    return bestState.currentScore
  }
}

const totalFlowRate: (nodes: Map<string, Node>) => number = flow(
  nodes => Array.from(nodes.values()),
  filter((node: Node) => node.isOpen),
  map((node: Node) => node.rate),
  sum
)

const hash = (state: State): string =>
  Array.from(state.nodes).reduce((prev, curr) => prev + (curr[1].isOpen ? curr[0] + ',' : ''), '') + '-' + state.currentLocation

function bfs (state: State): State {
  // Get hash prefix for when all valves are open, because we can then stop moving
  const allValvesHash = Array.from(state.nodes).reduce((prev, curr) => prev + (curr[1].rate > 0 ? curr[0] + ',' : ''), '')

  const openSet: State[] = [state]

  // map of hash to time and score
  const gScore = new Map<string, { time: number, score: number }>([[hash(state), { time: state.time, score: 0 }]])

  let bestEnd: State | null = null
  let loopCount = 0

  while (openSet.length > 0) {
    loopCount++

    // log progress
    if (loopCount % 10_000 === 0) {
      console.log('loop:', loopCount, 'openSet:', openSet.length, 'gScore:', gScore.size)
    }

    const current = openSet.shift()
    if (current == null) throw new Error('Impossible')

    const node = current.nodes.get(current.currentLocation)
    if (node == null) throw new Error('Impossible')

    // Did we reach the end?
    if (current.time === 30) {
      if (bestEnd == null || current.currentScore > bestEnd.currentScore) {
        bestEnd = current
      }
      continue
    }

    const flowRate = totalFlowRate(current.nodes)

    // Are all valves open?
    if (hash(current).startsWith(allValvesHash)) {
      openSet.push({
        nodes: current.nodes,
        time: current.time + 1,
        currentScore: current.currentScore + flowRate,
        currentLocation: current.currentLocation,
        steps: [...current.steps, 'Did nothing']
      })
      continue
    }

    // Gather new states
    const states: State[] = []

    // try opening the valve
    if (!node.isOpen && node.rate > 0) {
      states.push({
        nodes: new Map(current.nodes).set(current.currentLocation, { ...node, isOpen: true }),
        time: current.time + 1,
        currentScore: current.currentScore + flowRate,
        currentLocation: current.currentLocation,
        steps: [...current.steps, `Opened ${current.currentLocation}`]
      })
    }

    // try following a connection
    for (const connection of node.connections) {
      states.push({
        nodes: current.nodes,
        time: current.time + 1,
        currentScore: current.currentScore + flowRate,
        currentLocation: connection,
        steps: [...current.steps, `Moved to ${connection}`]
      })
    }

    // Go check neighbors
    for (const neighbor of states) {
      const neighborHash = hash(neighbor)

      const existingState = gScore.get(neighborHash) ?? { time: Infinity, score: -Infinity }

      // If we found a better score for this neighbor, update it
      // This might seem wrong, because a higher time will almost always have a higher score, but it's fine because
      // lower time is put at the front of openSet, so it will be checked first
      if (neighbor.currentScore > existingState.score) {
        gScore.set(neighborHash, { time: neighbor.time, score: neighbor.currentScore })
        const index = sortedIndexBy(openSet, neighbor, s => s.time)
        openSet.splice(index, 0, neighbor)
      }
    }
  }

  if (bestEnd == null) throw new Error('Never found an end. Weird!')

  console.log('loops:', loopCount)

  return bestEnd
}

const parseNode = (s: string[]): readonly [string, Node] => {
  const node: Node = { rate: toNumber(s[1]), connections: split(', ')(s[2]), isOpen: false }
  return [s[0], node]
}

const parseInput: (input: string) => Map<string, Node> = flow(
  split('\n'),
  map(flow(
    match(/^Valve ([A-Z]{2}) has flow rate=(\d+); tunnels? leads? to valves? (.+)$/),
    parseNode
  )),
  toMap
)

function measure<T> (name: string, callback: () => T): T {
  const t0 = performance.now()
  const r = callback()
  const t1 = performance.now()
  console.log(`${name} took ${t1 - t0} milliseconds.`)
  return r
}
