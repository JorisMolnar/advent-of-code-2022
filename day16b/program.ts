import { flow, map, split, toNumber } from 'lodash/fp'
import { performance } from 'perf_hooks'
import { measure } from '../utils'
import { match, toMap, window } from '../utils/fp'
import { astar } from './astar'
import { Node, Path } from './models'

/*
 * Get the distance between all points and store it in a map for efficient lookup.
 * Get all permutations of paths that fit within the time limit.
 * Loop over permutations and calculate the score for each one: (TIME_AVAILABLE - elapsed time) * flow rate.
 * Remember that opening a valve takes 1 minute.
 */

const TIME_AVAILABLE = 26

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

    const distances = measure('distances', () => getDistances(nodes))

    const nodesWithValve = Array.from(nodes).filter(n => n[1].rate > 0).map(n => n[0])
    const pathsA: Path[] = measure('permutations', () => makePaths(
      ['AA'],
      0,
      nodesWithValve,
      distances
    ))
    console.log('A paths:', pathsA.length)

    let bestScore = 0
    let bestPath: [Path, Path] | null = null

    measure('calculate paths', () => {
      let prevTime = performance.now()
      for (let i = 0, len = pathsA.length; i < len; i++) {
        // Log progress
        if (i % 100 === 0) {
          const currentTime = performance.now()
          console.log(`${i} / ${len}, took ${currentTime - prevTime} ms.`)
          prevTime = currentTime
        }

        const pathA = pathsA[i]
        const scoreA = this.countPathScore(pathA, distances, nodes)

        // Get B paths
        const remainingNodes = nodesWithValve.filter(n => !pathA.includes(n))
        const pathsB = makePaths(['AA'], 0, remainingNodes, distances)

        for (const pathB of pathsB) {
          const scoreB = this.countPathScore(pathB, distances, nodes)
          const score = scoreA + scoreB

          if (score > bestScore) {
            bestScore = score
            bestPath = [pathA, pathB]
          }
        }
      }
    })

    console.log(bestScore, bestPath)

    return bestScore
  }

  private countPathScore (path: Path, distances: Map<string, number>, nodes: Map<string, Node>): number {
    let score = 0
    let timeLeft = TIME_AVAILABLE
    for (const [from, to] of window(2)(path)) {
      timeLeft -= distances.get(hash(from, to))! + 1
      score += timeLeft * nodes.get(to)!.rate
    }
    return score
  }
}

function getNeighbors (nodes: Map<string, Node>, curr: string, prev: string | undefined): string[] {
  return nodes.get(curr)!.connections
    // remove prev as going back doesn't make sense
    .filter(p => p !== prev)
}

function getDistances (nodes: Map<string, Node>): Map<string, number> {
  const distances = new Map<string, number>()
  for (const [from] of nodes) {
    for (const [to] of Array.from(nodes).filter(([k]) => k !== from)) {
      // astar heuristic is 0 because it is fast enough that we don't need to optimize it
      const path = astar(from, to, c => 0, (c, p) => getNeighbors(nodes, c, p))
      distances.set(hash(from, to), path.length - 1)
    }
  }
  return distances
}

function hash (a: string, b: string): string {
  if (a < b) return `${a}-${b}`
  return `${b}-${a}`
}

/**
 * Returns all paths that can be made with the given points, with a total length of less than TIME_AVAILABLE
 * @param currentPath The fixed part of the path
 * @param currentLength The length of currentPath
 * @param availablePoints Other points that can be added to the path
 * @param distances Map of distances between points
 */
function makePaths (currentPath: Path, currentLength: number, availablePoints: string[], distances: Map<string, number>): Path[] {
  if (availablePoints.length === 0) {
    return [currentPath]
  }

  let paths: Path[] = []
  for (const point of availablePoints) {
    const newPath = [...currentPath, point]
    const newRemainingPoints = availablePoints.filter(p => p !== point)
    // newLength is the currentLength, plus the distance from the last point to the new point, plus 1 to open the valve
    const newLength = currentLength + 1 + distances.get(hash(currentPath[currentPath.length - 1], point))!

    if (newLength < TIME_AVAILABLE) {
      const newPaths = makePaths(newPath, newLength, newRemainingPoints, distances)
      paths = paths.concat([newPath], newPaths)
    }
  }

  return paths
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
