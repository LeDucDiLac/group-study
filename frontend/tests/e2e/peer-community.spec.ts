import { expect, test } from '@playwright/test'
import { expectNoMojibake, learnerB, learnerFresh, login, topics } from './helpers'

test.describe('peer learning, comments and community surfaces', () => {
  test('peer gate blocks learners who have not submitted the topic', async ({ page }) => {
    await login(page, learnerFresh)
    await page.goto(`/topics/${topics.python}/peer`)

    await expect(page.getByText('Bạn cần nộp bài trước khi vào dạy chéo')).toBeVisible()
    await expect(page.getByRole('link', { name: /Quay lại tự học/ })).toBeVisible()
    await expectNoMojibake(page)
  })

  test('peer list is available after submitting and supports sorting', async ({ page }) => {
    await login(page, learnerB)
    await page.goto(`/topics/${topics.calculus}/peer`)

    await expect(page.getByRole('heading', { name: 'Dạy chéo' })).toBeVisible()
    await expect(page.getByLabel('Sắp xếp bài cộng đồng')).toBeVisible()
    await page.getByLabel('Sắp xếp bài cộng đồng').selectOption('likes')
    await expect(page.getByText(/bài cộng đồng/)).toBeVisible()
    await expectNoMojibake(page)
  })

  test('anonymous submissions hide real author identity in learner peer list', async ({ page }) => {
    await login(page, learnerB)
    await page.goto(`/topics/${topics.calculus}/peer`)

    await expect(page.getByText('Người học ẩn danh').first()).toBeVisible()
    await expect(page.getByText('Uy tín được ẩn').first()).toBeVisible()
  })

  test('submission detail renders full submission and comment composer', async ({ page }) => {
    await login(page, learnerB)
    await page.goto(`/topics/${topics.calculus}/peer/30000000-0000-0000-0000-000000000001`)

    await expect(page.getByText('Điều đã hiểu')).toBeVisible()
    await expect(page.getByText('Điều chưa hiểu')).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Bình luận' })).toBeVisible()
    await expect(page.getByPlaceholder('Viết bình luận hoặc đặt câu hỏi...')).toBeVisible()
    await expectNoMojibake(page)
  })

  test('comment composer keeps send disabled while empty and enables when filled', async ({ page }) => {
    await login(page, learnerB)
    await page.goto(`/topics/${topics.calculus}/peer/30000000-0000-0000-0000-000000000001`)

    await expect(page.getByRole('button', { name: 'Gửi' }).first()).toBeDisabled()
    await page.getByPlaceholder('Viết bình luận hoặc đặt câu hỏi...').fill('Mình cần thêm một ví dụ về định lý kẹp.')
    await expect(page.getByRole('button', { name: 'Gửi' }).first()).toBeEnabled()
  })

  test('profile shows reputation badge progress', async ({ page }) => {
    await login(page, learnerB)
    await page.goto('/profile')

    await expect(page.getByText('Trần Quốc Hùng')).toBeVisible()
    await expect(page.getByText(/Tiến độ|huy hiệu|Trợ Thủ Tri Thức|Tân Binh Tri Thức/).first()).toBeVisible()
    await expectNoMojibake(page)
  })

  test('community insight page reads stored insight data', async ({ page }) => {
    await login(page, learnerB)
    await page.goto('/insights')

    await expect(page.getByRole('heading', { name: 'Community Insight' })).toBeVisible()
    await expect(page.getByText('Nhiều người đã hiểu', { exact: true })).toBeVisible()
    await expect(page.getByText('Câu hỏi phổ biến', { exact: true })).toBeVisible()
    await expectNoMojibake(page)
  })
})
