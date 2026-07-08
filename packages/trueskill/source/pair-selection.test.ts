import { describe, it, expect } from 'vitest'
import { nextPair } from './pair-selection'
import type { TrueSkillItem } from './types'

describe('nextPair', () => {
  it('throws when given fewer than 2 items', () => {
    expect(() => nextPair([])).toThrow('Need at least 2 items')
    expect(() => nextPair([{ mu: 25, sigma: 8 }])).toThrow('Need at least 2 items')
  })

  it('returns a pair of items when given exactly 2 items', () => {
    const items = [
      { mu: 25.0, sigma: 8.0 },
      { mu: 30.0, sigma: 5.0 },
    ]

    const [a, b] = nextPair(items)

    expect(a).toBe(items[0])
    expect(b).toBe(items[1])
  })

  it('selects pair with highest combined sigma when alpha is 0', () => {
    const items: TrueSkillItem[] = [
      { mu: 25.0, sigma: 2.0 },
      { mu: 25.0, sigma: 10.0 },
      { mu: 25.0, sigma: 5.0 },
    ]

    const [a, b] = nextPair(items, 0)

    expect(a.sigma).toBe(10.0)
    expect(b.sigma).toBe(5.0)
  })

  it('selects pair with closest mu values when alpha is very high', () => {
    const items: TrueSkillItem[] = [
      { mu: 10.0, sigma: 5.0 },
      { mu: 20.0, sigma: 5.0 },
      { mu: 21.0, sigma: 5.0 },
    ]

    const [a, b] = nextPair(items, 100)

    const diff = Math.abs(a.mu - b.mu)
    const altDiff20_21 = Math.abs(items[1]!.mu - items[2]!.mu)
    expect(diff).toBeCloseTo(altDiff20_21)
  })

  it('returns the same pair references from the input array', () => {
    const items: TrueSkillItem[] = [
      { mu: 25.0, sigma: 8.0 },
      { mu: 30.0, sigma: 5.0 },
      { mu: 20.0, sigma: 10.0 },
    ]

    const [a, b] = nextPair(items)

    expect(items).toContain(a)
    expect(items).toContain(b)
    expect(a).not.toBe(b)
  })

  it('scores pairs correctly using formula (sigma_a + sigma_b) - alpha * |mu_a - mu_b|', () => {
    const items: TrueSkillItem[] = [
      { mu: 25.0, sigma: 8.0 },
      { mu: 30.0, sigma: 4.0 },
      { mu: 27.0, sigma: 6.0 },
    ]

    const pair01 = items[0]!.sigma + items[1]!.sigma - 1.0 * Math.abs(items[0]!.mu - items[1]!.mu)
    const pair02 = items[0]!.sigma + items[2]!.sigma - 1.0 * Math.abs(items[0]!.mu - items[2]!.mu)
    const pair12 = items[1]!.sigma + items[2]!.sigma - 1.0 * Math.abs(items[1]!.mu - items[2]!.mu)

    const expectedScore = Math.max(pair01, pair02, pair12)
    const [a, b] = nextPair(items, 1.0)

    const actualScore = a.sigma + b.sigma - 1.0 * Math.abs(a.mu - b.mu)
    expect(actualScore).toBeCloseTo(expectedScore)
  })

  it('handles items with identical mu and sigma', () => {
    const items: TrueSkillItem[] = [
      { mu: 25.0, sigma: 8.0 },
      { mu: 25.0, sigma: 8.0 },
      { mu: 25.0, sigma: 8.0 },
    ]

    const [a, b] = nextPair(items)
    const score = a.sigma + b.sigma - 1.0 * Math.abs(a.mu - b.mu)

    expect(score).toBeCloseTo(16.0)
  })

  it('works with many items', () => {
    const items: TrueSkillItem[] = Array.from({ length: 100 }, (_, i) => ({
      mu: 20 + Math.random() * 20,
      sigma: 2 + Math.random() * 10,
    }))

    const [a, b] = nextPair(items)

    expect(a).toBeDefined()
    expect(b).toBeDefined()
    expect(a).not.toBe(b)
  })
})
