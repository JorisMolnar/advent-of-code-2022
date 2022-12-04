import { readFile } from 'fs/promises'

/** Read input.txt, assuming it is in current working directory. */
export async function readInput (part: string): Promise<string> {
  const path = `./day${part}/input.txt`
  return await read(path)
}

/** Read input.txt, assuming it is in current working directory. */
export async function readExampleInput (part: string): Promise<string> {
  const path = `./day${part}/input-example.txt`
  return await read(path)
}

async function read (path: string): Promise<string> {
  try {
    return await readFile(path, 'utf-8')
  } catch (err) {
    console.error(`Could not read ${path}. Did you forget to create it?`)
    throw new Error(`Could not read ${path}`)
  }
}
