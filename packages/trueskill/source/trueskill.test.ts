import { describe, it, expect } from 'vitest'
import { update } from './trueskill'

const TOLERANCE = 0.01

describe('update', () => {
  it('increases winner mu and decreases loser mu', () => {
    const a = { mu: 25.0, sigma: 8.333 }
    const b = { mu: 25.0, sigma: 8.333 }

    const result = update(a, b)

    expect(result.winner.mu).toBeGreaterThan(a.mu)
    expect(result.loser.mu).toBeLessThan(b.mu)
  })

  it('decreases sigma for both winner and loser', () => {
    const a = { mu: 25.0, sigma: 8.333 }
    const b = { mu: 25.0, sigma: 8.333 }

    const result = update(a, b)

    expect(result.winner.sigma).toBeLessThan(a.sigma)
    expect(result.loser.sigma).toBeLessThan(b.sigma)
  })

  it('produces symmetric mu shift when items are equal', () => {
    const a = { mu: 25.0, sigma: 8.333 }
    const b = { mu: 25.0, sigma: 8.333 }

    const result = update(a, b)
    const deltaWinner = result.winner.mu - a.mu
    const deltaLoser = a.mu - result.loser.mu

    expect(deltaWinner).toBeCloseTo(deltaLoser, 2)
  })

  it('produces asymmetric mu shift when items have different sigma', () => {
    const certain = { mu: 25.0, sigma: 3.0 }
    const uncertain = { mu: 25.0, sigma: 15.0 }

    const result = update(certain, uncertain)

    const deltaCertain = result.winner.mu - certain.mu
    const deltaUncertain = certain.mu - result.loser.mu

    expect(deltaUncertain).toBeGreaterThan(deltaCertain)
  })

  it('produces larger update when underdog wins (upset)', () => {
    const favorite = { mu: 35.0, sigma: 5.0 }
    const underdog = { mu: 15.0, sigma: 5.0 }

    const expectedResult = update(favorite, underdog)
    const upsetResult = update(underdog, favorite)

    const expectedShift = expectedResult.winner.mu - favorite.mu
    const upsetShift = upsetResult.winner.mu - underdog.mu

    expect(upsetShift).toBeGreaterThan(expectedShift)
  })

  it('reverts mu shift when result is reversed', () => {
    const a = { mu: 30.0, sigma: 8.0 }
    const b = { mu: 20.0, sigma: 8.0 }

    const first = update(a, b)
    const second = update(first.loser, first.winner)

    expect(second.winner.mu).toBeGreaterThan(second.loser.mu)
    expect(second.winner.mu).toBeGreaterThan(first.loser.mu)
    expect(second.loser.mu).toBeLessThan(first.winner.mu)
  })

  it('converges after multiple same-direction updates', () => {
    let a = { mu: 25.0, sigma: 8.333 }
    let b = { mu: 25.0, sigma: 8.333 }

    for (let i = 0; i < 100; i++) {
      const result = update(a, b)
      a = result.winner
      b = result.loser
    }

    expect(a.mu).toBeGreaterThan(30)
    expect(b.mu).toBeLessThan(20)
    expect(a.sigma).toBeLessThan(5)
    expect(b.sigma).toBeLessThan(5)
  })

  it('clamps sigma to minimum of 0.01', () => {
    let a = { mu: 25.0, sigma: 8.333 }
    let b = { mu: 10.0, sigma: 8.333 }

    for (let i = 0; i < 1000; i++) {
      const result = update(a, b)
      a = result.winner
      b = result.loser
    }

    expect(a.sigma).toBeGreaterThanOrEqual(0.01)
    expect(b.sigma).toBeGreaterThanOrEqual(0.01)
  })

  it('accepts custom beta option', () => {
    const a = { mu: 25.0, sigma: 8.333 }
    const b = { mu: 25.0, sigma: 8.333 }

    const defaultResult = update(a, b)
    const customResult = update(a, b, { beta: 1.0 })

    expect(customResult.winner.mu).not.toBeCloseTo(defaultResult.winner.mu, 4)
    expect(customResult.winner.sigma).not.toBeCloseTo(defaultResult.winner.sigma, 4)
  })

  it('does not mutate input objects', () => {
    const a = { mu: 25.0, sigma: 8.333 }
    const b = { mu: 25.0, sigma: 8.333 }
    const aCopy = { ...a }
    const bCopy = { ...b }

    update(a, b)

    expect(a).toEqual(aCopy)
    expect(b).toEqual(bCopy)
  })

  describe('statistical properties', () => {
    it('produces larger update magnitude when the gap is smaller', () => {
      const tight = update(
        { mu: 25.0, sigma: 8.333 },
        { mu: 24.0, sigma: 8.333 },
      )
      const wide = update(
        { mu: 35.0, sigma: 8.333 },
        { mu: 15.0, sigma: 8.333 },
      )

      const tightDelta = Math.abs(tight.winner.mu - 25.0)
      const wideDelta = Math.abs(wide.winner.mu - 35.0)

      expect(tightDelta).toBeGreaterThan(wideDelta)
    })

    it('tends toward zero-sum on average over many random comparisons', () => {
      const items = Array.from({ length: 10 }, () => ({
        mu: 25.0,
        sigma: 8.333,
      }))

      const rng = mulberry32(42)
      let totalMu = items.reduce((s, i) => s + i.mu, 0)

      for (let t = 0; t < 500; t++) {
        const i = Math.floor(rng() * items.length)
        let j = Math.floor(rng() * items.length)
        while (j === i) j = Math.floor(rng() * items.length)

        const result = update(items[i]!, items[j]!)
        items[i] = result.winner
        items[j] = result.loser

        totalMu = items.reduce((s, i) => s + i.mu, 0)
      }

      expect(totalMu).toBeCloseTo(250, -1)
    })
  })
})

function mulberry32(a: number): () => number {
  return function () {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
