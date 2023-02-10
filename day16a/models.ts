export interface Node {
  rate: number
  connections: string[]
  isOpen: boolean
}

export interface State {
  nodes: Map<string, Node>
  time: number
  currentScore: number
  currentLocation: string
  steps: string[] // mainly for debugging and visualization
}
