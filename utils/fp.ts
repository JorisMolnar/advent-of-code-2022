import { tap } from 'lodash/fp'

export const log: <T>(v: T) => T = tap(console.log)
