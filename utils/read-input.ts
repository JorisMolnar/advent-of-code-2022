import { readFile } from 'fs/promises'

/** Read input.txt, assuming it is in current working directory. */
export async function readInput (part: string): Promise<string> {
  const path = `./day${part}/input.txt`
  return await read(path)
}

/** Read input.txt, assuming it is in current working directory. */
export async function readExampleInput (part: string): Promise<string> {
  const path = `./day${part}/input-example.txt`
  const contents = await read(path)
  if (contents === '') {
    console.warn('example-input.txt is empty')
  }
  return contents
}

async function read (path: string): Promise<string> {
  try {
    const contents = await readFile(path, 'utf-8')
    return contents.trim()
  } catch (err) {
    console.error(`Could not read ${path}. Did you forget to create it?`)
    throw new Error(`Could not read ${path}`)
  }
}
