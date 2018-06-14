import {add, substract, concat} from '../../src/'

describe('add', () => {
  it('add(1, 2) shoud be 3', () => {
    expect(add(1, 2)).toBe(3)
  })
})

describe('concat', () => {
  it('concat([1], [2, 3]) should be [1, 2, 3]', () => {
    expect(concat([1], [2, 3])).toEqual([1, 2, 3])
  })
})
