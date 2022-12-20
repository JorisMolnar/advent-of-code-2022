import { isEqual, some, sortedIndexBy } from 'lodash'
import { Node, Point } from './models'

export type Heuristic = (p: Point) => number
export type Neighbors = (curr: Point, prev: Point | undefined) => Point[]

const hash = (p: Point): string => `x${p.x}y${p.y}`

export function astar (start: Point, goals: Point[], h: Heuristic, neighbors: Neighbors): Point[] {
  const goalHashes = goals.map(hash)

  const openSet: Node[] = [{ p: start, f: h(start) }] // f of start is 0 + h

  // For node n, cameFrom[n] is the node immediately preceding it on the cheapest path from start to n currently known.
  const cameFrom = new Map<string, Point>()

  // For node n, gScore[n] is the cost of the cheapest path from start to n currently known.
  const gScore = new Map<string, number>([[hash(start), 0]])

  // For node n, fScore[n] := gScore[n] + h(n). fScore[n] represents our current best guess as to
  // how cheap a path could be from start to finish if it goes through n.
  const fScore = new Map<string, number>([[hash(start), h(start)]])

  while (openSet.length > 0) {
    const current = openSet.shift()
    if (current == null) throw new Error('Impossible')

    // Did we reach goal?
    if (goalHashes.includes(hash(current.p))) {
      const totalPath = [current.p]
      let parent = cameFrom.get(hash(current.p))
      while (parent != null) {
        totalPath.unshift(parent)
        parent = cameFrom.get(hash(parent))
      }
      return totalPath
    }

    // Go check neighbors
    const nodes = neighbors(current.p, cameFrom.get(hash(current.p)))
    for (const neighbor of nodes) {
      const gCurrent = gScore.get(hash(current.p))
      if (gCurrent == null) throw new Error('Impossible')

      const hashNeighbor = hash(neighbor)
      const gNeighbor = gScore.get(hashNeighbor) ?? Infinity

      // tentativeGScore is the distance from start to the neighbor through current
      const tentativeGScore = gCurrent + 1
      if (tentativeGScore < gNeighbor) {
        // This path to neighbor is better than any previous one. Record it!
        cameFrom.set(hashNeighbor, current.p)
        gScore.set(hashNeighbor, tentativeGScore)
        fScore.set(hashNeighbor, tentativeGScore + h(neighbor))

        if (!some(openSet, n => isEqual(n.p, neighbor))) {
          const newNode = { p: neighbor, f: tentativeGScore + h(neighbor) }
          const index = sortedIndexBy(openSet, newNode, p => p.f)
          openSet.splice(index, 0, newNode)
        }
      }
    }
  }

  throw new Error('No result found')
}
