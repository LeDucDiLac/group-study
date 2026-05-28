import { describe, expect, it } from 'vitest'
import { BADGE_LABELS, calculateBadgeLevel, getNextBadgeProgress } from './badges'

describe('badge reputation thresholds', () => {
  it('maps answer/comment-like totals to the expected badge level', () => {
    expect(calculateBadgeLevel(0, 0)).toBe('newcomer')
    expect(calculateBadgeLevel(4, 100)).toBe('newcomer')
    expect(calculateBadgeLevel(5, 9)).toBe('newcomer')
    expect(calculateBadgeLevel(5, 10)).toBe('helper')
    expect(calculateBadgeLevel(19, 100)).toBe('helper')
    expect(calculateBadgeLevel(20, 50)).toBe('mentor')
    expect(calculateBadgeLevel(49, 200)).toBe('mentor')
    expect(calculateBadgeLevel(50, 150)).toBe('expert')
  })

  it('keeps Vietnamese UI labels readable', () => {
    expect(BADGE_LABELS).toEqual({
      newcomer: 'Tân Binh Tri Thức',
      helper: 'Trợ Thủ Tri Thức',
      mentor: 'Dẫn Lối Tri Thức',
      expert: 'Bậc Thầy Cộng Đồng',
    })
  })

  it('computes next badge progress from the next threshold', () => {
    const progress = getNextBadgeProgress({
      answerCount: 18,
      answerLikeCount: 74,
      level: 'helper',
    })

    expect(progress.remainingAnswers).toBe(2)
    expect(progress.remainingLikes).toBe(0)
    expect(progress.percent).toBeGreaterThan(90)
    expect(progress.label).toContain('Dẫn Lối Tri Thức')
  })
})
