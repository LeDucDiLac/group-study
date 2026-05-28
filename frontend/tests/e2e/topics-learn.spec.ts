import { expect, test } from '@playwright/test'
import { expectNoMojibake, learnerA, learnerDraft, learnerFresh, login, topics } from './helpers'

test.describe('topics and learning workflow', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, learnerFresh)
  })

  test('topic list supports search and shows open topic cards', async ({ page }) => {
    await page.goto('/topics')

    await page.getByLabel('Tìm kiếm chủ đề').fill('Python')
    await expect(page.getByText('Python Cơ Bản - List, Dict và Vòng lặp')).toBeVisible()
    await expect(page.getByText('Giải Tích 1 - Giới hạn và Liên tục')).toHaveCount(0)
    await expectNoMojibake(page)
  })

  test('topic status tabs can show pending topics', async ({ page }) => {
    await page.goto('/topics')
    await page.getByRole('button', { name: 'Chờ duyệt' }).click()

    await expect(page.getByText('Cấu Trúc Dữ Liệu - Stack và Queue')).toBeVisible()
    await expectNoMojibake(page)
  })

  test('open topic detail exposes resources and start learning CTA for learner without submission', async ({ page }) => {
    await page.goto(`/topics/${topics.calculus}`)

    await expect(page.getByText('Giải Tích 1 - Giới hạn và Liên tục').first()).toBeVisible()
    await expect(page.getByRole('link', { name: 'Bắt đầu học' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Bên trong chủ đề' })).toBeVisible()
    await expect(page.getByText('Tài liệu tham khảo')).toBeVisible()
    await expectNoMojibake(page)
  })

  test('submitted topic detail exposes locked submission actions for submitted learner', async ({ page }) => {
    await login(page, learnerA)
    await page.goto(`/topics/${topics.python}`)

    await expect(page.getByText('Đã nộp bài').first()).toBeVisible()
    await expect(page.getByRole('link', { name: 'Xem bài của bạn' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Vào dạy chéo' })).toBeVisible()
  })

  test('pending topic detail blocks learning', async ({ page }) => {
    await page.goto('/topics/10000000-0000-0000-0000-000000000004')

    await expect(page.getByText('Đề xuất đang chờ duyệt').first()).toBeVisible()
    await expect(page.getByText(/Chưa thể bắt đầu học|Đang chờ admin duyệt/).first()).toBeVisible()
    await expectNoMojibake(page)
  })

  test('learn page disables submit until required fields are filled', async ({ page }) => {
    await page.goto(`/topics/${topics.calculus}/learn`)

    await page.getByLabel('Điều đã hiểu').fill('')
    await page.getByLabel('Điều chưa hiểu / cần hỏi cộng đồng').fill('')
    await expect(page.getByRole('button', { name: 'Nộp bài' })).toBeDisabled()
    await page.getByLabel('Điều đã hiểu').fill('Tôi hiểu giới hạn mô tả xu hướng của hàm số khi biến tiến gần một điểm.')
    await expect(page.getByRole('button', { name: 'Nộp bài' })).toBeDisabled()
    await page.getByLabel('Điều chưa hiểu / cần hỏi cộng đồng').fill('Tôi cần luyện thêm phần chứng minh epsilon-delta.')
    await expect(page.getByRole('button', { name: 'Nộp bài' })).toBeEnabled()
  })

  test('learn draft autosaves and restores after reload', async ({ page }) => {
    await login(page, learnerDraft)
    const draftLoaded = page.waitForResponse((response) =>
      response.url().includes('/rest/v1/learning_drafts') && response.request().method() === 'GET',
    )
    await page.goto(`/topics/${topics.calculus}/learn`)
    await draftLoaded
    const understood = `Draft hiểu ${Date.now()}`
    const unclear = `Draft chưa hiểu ${Date.now()}`
    const draftSaved = page.waitForResponse((response) =>
      response.url().includes('/rest/v1/learning_drafts') && response.request().method() === 'POST',
    )

    await page.getByLabel('Điều đã hiểu').fill(understood)
    await page.getByLabel('Điều chưa hiểu / cần hỏi cộng đồng').fill(unclear)
    await draftSaved
    await page.reload()

    await expect(page.getByLabel('Điều đã hiểu')).toHaveValue(understood)
    await expect(page.getByLabel('Điều chưa hiểu / cần hỏi cộng đồng')).toHaveValue(unclear)
  })

  test('my submission page shows read-only submitted content', async ({ page }) => {
    await login(page, learnerA)
    await page.goto(`/topics/${topics.python}/my-submission`)

    await expect(page.getByRole('heading', { name: 'Bài của tôi' })).toBeVisible()
    await expect(page.getByText('Đã khóa')).toBeVisible()
    await expect(page.getByText('List trong Python')).toBeVisible()
    await expectNoMojibake(page)
  })
})
