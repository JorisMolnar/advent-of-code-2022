export type ValueOrArray<T> = T | Array<ValueOrArray<T>>

export type Pair = [Array<ValueOrArray<number>>, Array<ValueOrArray<number>>]
