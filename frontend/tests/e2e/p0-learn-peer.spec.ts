import { expect, test } from '@playwright/test'
import { expectNoMojibake, learnerA, learnerB, learnerFresh, login, topics } from './helpers'

test.describe('P0 learner workflow regressions', () => {
  test('topic detail does not show start-learning CTA when current learner already submitted', async ({ page }) => {
    await login(page, learnerA)
    await page.goto(`/topics/${topics.python}`)
    await page.waitForLoadState('networkidle')

    await expect(page.getByText('Bắt đầu học')).toHaveCount(0)
    await expect(page.getByText('Đã nộp bài').first()).toBeVisible()
    await expect(page.getByRole('link', { name: 'Xem bài của bạn' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Vào dạy chéo' })).toBeVisible()
  })

  test('learn countdown updates while learner is on the writing screen', async ({ page }) => {
    await login(page, learnerFresh)
    await page.goto(`/topics/${topics.calculus}/learn`)
    await page.waitForLoadState('networkidle')

    await expect(page.getByText(/Bài học đã được khóa/)).toHaveCount(0)

    const timer = page.getByText(/\d{2}:\d{2}:\d{2}/).first()
    await expect(timer).toBeVisible()
    const before = await timer.innerText()
    await page.waitForTimeout(2_200)
    const after = await timer.innerText()

    expect(after).not.toBe(before)
  })

  test('peer learning pages render readable Vietnamese text', async ({ page }) => {
    await login(page, learnerB)
    await page.goto(`/topics/${topics.calculus}/peer`)
    await page.waitForLoadState('networkidle')

    await expect(page.getByText(/Dạy chéo|Bạn cần nộp bài trước/)).toBeVisible()
    await expectNoMojibake(page)
  })
})
