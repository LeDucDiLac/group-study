import { describe, expect, it } from 'vitest'
import { RANK_LABELS, getRankTier, getRankProgress } from './badges'

describe('rank reputation thresholds', () => {
  it('maps points to the expected rank tier index', () => {
    expect(getRankTier(0)).toBe(0)
    expect(getRankTier(50)).toBe(0)
    expect(getRankTier(100)).toBe(1)
    expect(getRankTier(345)).toBe(3)
    expect(getRankTier(899)).toBe(8)
    expect(getRankTier(900)).toBe(9)
    expect(getRankTier(1200)).toBe(9)
  })

  it('keeps Vietnamese UI labels readable', () => {
    expect(RANK_LABELS[0]).toBe('Tập sự')
    expect(RANK_LABELS[1]).toBe('Tân binh')
    expect(RANK_LABELS[9]).toBe('Thách đấu')
  })

  it('computes rank progress from current points', () => {
    const progressNormal = getRankProgress(345)
    expect(progressNormal.percent).toBe(45)
    expect(progressNormal.remaining).toBe(55)
    expect(progressNormal.label).toContain('Cần thêm 55 điểm để đạt Tinh anh')

    const progressSpecial = getRankProgress(945)
    expect(progressSpecial.percent).toBe(45)
    expect(progressSpecial.remaining).toBe(55)
    expect(progressSpecial.label).toContain('Cần thêm 55 điểm để đạt cấp cao nhất')

    const progressMax = getRankProgress(1050)
    expect(progressMax.percent).toBe(100)
    expect(progressMax.remaining).toBe(0)
    expect(progressMax.label).toContain('Bạn đã đạt cấp cao nhất')
  })
})
