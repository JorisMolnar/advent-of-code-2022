import { sum } from 'lodash'
import { flow, split } from 'lodash/fp'
import { performance } from 'perf_hooks'
import { Dir, Terminal } from './models'

export class Program {
  main (input: string): void {
    const t0 = performance.now()
    const result = this.calcResult(input)
    const t1 = performance.now()
    console.log(`Calc took ${t1 - t0} milliseconds.`)
    console.log('Answer:', result)
  }

  private calcResult (input: string): number {
    const terminal = new Terminal()
    const commands = parseInput(input)

    commands.forEach(cmd => terminal.exec(cmd))

    const dirs = this.getDirs(terminal.root)
    const smallDirs = dirs.filter(d => d.size <= 100000)

    return sum(smallDirs.map(d => d.size))
  }

  private getDirs (dir: Dir): Dir[] {
    return [dir, ...dir.dirs.flatMap(child => this.getDirs(child))]
  }
}

/** Split input to a list of commands */
const parseInput: (input: string) => string[] = flow(
  // Remove first `$ `
  s => s.substring(2),
  // Split on commands
  split('\n$ ')
)
