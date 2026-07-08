import type { TrueSkillItem, TrueSkillOptions } from './types'

const pdf = (x: number): number =>
  Math.exp(-0.5 * x * x) / Math.sqrt(2 * Math.PI)

const cdf = (x: number): number =>
  0.5 * (1 + erf(x / Math.sqrt(2)))

const erf = (x: number): number => {
  const a1 = 0.254829592
  const a2 = -0.284496736
  const a3 = 1.421413741
  const a4 = -1.453152027
  const a5 = 1.061405429
  const p = 0.3275911

  const sign = x < 0 ? -1 : 1
  x = Math.abs(x)
  const t = 1 / (1 + p * x)
  const y = 1 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x)

  return sign * y
}

const defaultBeta = (sigma: number) => sigma / 2

export const update = (
  winner: TrueSkillItem,
  loser: TrueSkillItem,
  options?: TrueSkillOptions,
): { winner: TrueSkillItem; loser: TrueSkillItem } => {
  const beta = options?.beta ?? defaultBeta(winner.sigma)
  const c = Math.sqrt(2 * beta * beta + winner.sigma * winner.sigma + loser.sigma * loser.sigma)

  const delta = (winner.mu - loser.mu) / c

  const v = pdf(delta) / cdf(delta)
  const w = v * (v + delta)

  const winnerSigma = winner.sigma * Math.sqrt(1 - (winner.sigma * winner.sigma / (c * c)) * w)
  const loserSigma = loser.sigma * Math.sqrt(1 - (loser.sigma * loser.sigma / (c * c)) * w)

  const winnerMu = winner.mu + (winner.sigma * winner.sigma / c) * v
  const loserMu = loser.mu - (loser.sigma * loser.sigma / c) * v

  return {
    winner: { mu: winnerMu, sigma: Math.max(winnerSigma, 0.01) },
    loser: { mu: loserMu, sigma: Math.max(loserSigma, 0.01) },
  }
}
