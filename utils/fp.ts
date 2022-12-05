import { unzip } from 'lodash'
import { tap } from 'lodash/fp'

export const transpose = <T>(matrix: T[][]): T[][] => unzip(matrix)
export const log: <T>(v: T) => T = tap(console.log)
