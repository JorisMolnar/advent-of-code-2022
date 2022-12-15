export interface Monkey {
  id: number
  items: number[]
  inspections: number
  operation: Operation
  test: Test
}

interface Operation {
  a: 'old' | number
  b: 'old' | number
  op: '*' | '+'
}

interface Test {
  cond: number
  destTrue: number
  destFalse: number
}
