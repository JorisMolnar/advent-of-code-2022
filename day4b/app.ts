import { Program } from './program'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { readExampleInput, readInput } from '../utils/read-input'

void readInput('4b').then(input => new Program().main(input))
