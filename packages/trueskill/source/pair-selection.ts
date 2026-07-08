import type { TrueSkillItem } from './types'

export const nextPair = (
  items: TrueSkillItem[],
  alpha = 1.0,
): [TrueSkillItem, TrueSkillItem] => {
  if (items.length < 2) {
    throw new Error('Need at least 2 items to select a pair')
  }

  const first = items[0]!
  const second = items[1]!
  let bestPair: [TrueSkillItem, TrueSkillItem] = [first, second]
  let bestScore = -Infinity

  for (let i = 0; i < items.length; i++) {
    const a = items[i]!
    for (let j = i + 1; j < items.length; j++) {
      const b = items[j]!
      const score = a.sigma + b.sigma - alpha * Math.abs(a.mu - b.mu)

      if (score > bestScore) {
        bestScore = score
        bestPair = [a, b]
      }
    }
  }

  return bestPair
}
