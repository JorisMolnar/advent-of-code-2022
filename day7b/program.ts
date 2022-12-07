import { filter, flow, minBy, split } from 'lodash/fp'
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

    const totalSize = 70_000_000
    const requiredSize = 30_000_000
    const usedSize = terminal.root.size
    const deletableSize = usedSize - (totalSize - requiredSize)

    const deletableDir = flow(
      d => this.getDirs(d),
      filter(d => d.size >= deletableSize),
      minBy(d => d.size)
    )(terminal.root)

    if (deletableDir == null) throw new Error('No directory large enough to delete')

    return deletableDir.size
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
