/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { range, unzip } from 'lodash'
import { drop, flow, map, slice, tap } from 'lodash/fp'

export const match = (regexp: RegExp) => flow(
  (s: string) => regexp.exec(s),
  drop(1)
)

export const duplicate = <T>(amount: number, element: T) => new Array(amount).fill(element)
export const transpose = <T>(matrix: T[][]): T[][] => unzip(matrix)
export const log: <T>(v: T) => T = tap(console.log)

const getSteps = (size: number) => (data: unknown[]) => data.length - size + 1
const getIndexes = (size: number) => flow(getSteps(size), range)

const toRange = (size: number) => (value: number) => [value, size + value] as const
const getRanges = (size: number) => flow(getIndexes(size), map(toRange(size)))
const getSlicers = (size: number) => flow(getRanges(size), map(r => slice(...r)))

export const window = (size: number) => <T>(data: T[]) => flow(
  getSlicers(size),
  map(slicer => slicer(data))
)(data)

export const toMap = <K, V>(entries: Array<[K, V]>) => new Map(entries)
