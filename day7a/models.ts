import { filter, sum } from 'lodash'
import { drop, split } from 'lodash/fp'

interface Item {
  readonly name: string
  readonly size: number
}

class File implements Item {
  constructor (
    public readonly name: string,
    public readonly size: number
  ) {}
}

export class Dir implements Item {
  readonly items: Array<Dir | File> = []

  readonly parent: Dir

  constructor (
    public readonly name: string,
    parent?: Dir
  ) {
    if (parent == null) {
      // root, set parent to self
      this.parent = this
    } else {
      this.parent = parent
    }
  }

  get size (): number {
    return sum(this.items.map(i => i.size))
  }

  get dirs (): Dir[] {
    return filter(this.items, i => i instanceof Dir) as Dir[]
  }
}

export class Terminal {
  readonly root: Dir = new Dir('')
  cwd: Dir = this.root

  constructor () {
    this.cwd = this.root
  }

  exec (cmd: string): void {
    if (cmd.startsWith('cd')) {
      const name = cmd.split(' ')[1]
      this.cd(name)
    } else if (cmd.startsWith('ls')) {
      const items = drop(1, split('\n', cmd))
      this.ls(items)
    } else {
      throw new Error('Unknown command')
    }
  }

  private cd (name: string): void {
    if (name === '/') {
      this.cwd = this.root
    } else if (name === '..') {
      this.cwd = this.cwd.parent
    } else {
      const destDir = this.cwd.dirs.find(i => i.name === name)

      if (destDir == null) {
        throw new Error("Destination Dir doesn't exist")
      }

      this.cwd = destDir
    }
  }

  /**
   * Instead of listing contents, create contents as if it already existed
   * @param items
   * A list of strings in the form of `dir a` to describe a directory,
   * or `14848514 b.txt` to describe a file
   */
  private ls (items: string[]): void {
    for (const item of items) {
      const [property, name] = item.split(' ')
      if (property === 'dir') {
        const dir = new Dir(name, this.cwd)
        this.cwd.items.push(dir)
      } else {
        const size = Number(property)
        const file = new File(name, size)
        this.cwd.items.push(file)
      }
    }
  }
}
