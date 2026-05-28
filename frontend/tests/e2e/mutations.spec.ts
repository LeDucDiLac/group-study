import { expect, test, type Locator, type Page } from '@playwright/test'
import { admin, expectNoMojibake, learnerB, learnerFresh, login, topics } from './helpers'

test.describe('controlled write workflows', () => {
  test('submission like can be toggled on and off without leaving persisted state changed', async ({ page }) => {
    await login(page, learnerB)
    await page.goto(`/topics/${topics.calculus}/peer`)

    const likeButton = page.getByRole('button', { name: /Thích bài của Người học ẩn danh/ }).first()
    await expect(likeButton).toBeEnabled()

    await likeButton.click()
    await expect(page.getByRole('button', { name: /Bỏ thích bài của Người học ẩn danh/ }).first()).toBeVisible()

    await page.getByRole('button', { name: /Bỏ thích bài của Người học ẩn danh/ }).first().click()
    await expect(page.getByRole('button', { name: /Thích bài của Người học ẩn danh/ }).first()).toBeVisible()
    await expectNoMojibake(page)
  })

  test('comment like can be toggled on and off without leaving persisted state changed', async ({ page }) => {
    await login(page, learnerB)
    await page.goto(`/topics/${topics.calculus}/peer/30000000-0000-0000-0000-000000000002`)

    const likeComment = page.getByRole('button', { name: /^Thích bình luận của / }).first()
    await expect(likeComment).toBeEnabled()

    await likeComment.click()
    await expect(page.getByRole('button', { name: /^Bỏ thích bình luận của / }).first()).toBeVisible()

    await page.getByRole('button', { name: /^Bỏ thích bình luận của / }).first().click()
    await expect(page.getByRole('button', { name: /^Thích bình luận của / }).first()).toBeVisible()
    await expectNoMojibake(page)
  })

  test('bookmark can be added and removed from submission detail without leaving persisted state changed', async ({ page }) => {
    await login(page, learnerB)
    await page.goto(`/topics/${topics.calculus}/peer/30000000-0000-0000-0000-000000000002`)

    const alreadySaved = await page.getByRole('button', { name: 'Bỏ lưu bài này' }).isVisible().catch(() => false)
    if (alreadySaved) {
      await page.getByRole('button', { name: 'Bỏ lưu bài này' }).click()
      await expect(page.getByRole('button', { name: 'Lưu bài này' })).toBeVisible()
    }

    const saveButton = page.getByRole('button', { name: 'Lưu bài này' })
    await expect(saveButton).toBeEnabled()

    await saveButton.click()
    await expect(page.getByRole('button', { name: 'Bỏ lưu bài này' })).toBeVisible()

    await page.goto('/bookmarks')
    await expect(page.getByText('Tính liên tục cần ba điều kiện').first()).toBeVisible()

    await page.goto(`/topics/${topics.calculus}/peer/30000000-0000-0000-0000-000000000002`)
    await page.getByRole('button', { name: 'Bỏ lưu bài này' }).click()
    await expect(page.getByRole('button', { name: 'Lưu bài này' })).toBeVisible()
    await expectNoMojibake(page)
  })

  test('root comment creation reaches Supabase when explicit mutation testing is enabled', async ({ page }) => {
    test.skip(process.env.E2E_ENABLE_COMMENT_MUTATION !== '1', 'Set E2E_ENABLE_COMMENT_MUTATION=1 to allow persistent comment insert.')

    await login(page, learnerB)
    await page.goto(`/topics/${topics.calculus}/peer/30000000-0000-0000-0000-000000000002`)

    const content = `E2E comment ${Date.now()}`
    const commentInsert = page.waitForResponse((response) =>
      response.url().includes('/rest/v1/comments') && response.request().method() === 'POST',
    )
    await page.getByPlaceholder('Viết bình luận hoặc đặt câu hỏi...').fill(content)
    await page.getByRole('button', { name: 'Gửi' }).first().click()

    const response = await commentInsert
    expect(response.ok()).toBeTruthy()
    await expect(page.getByText(content)).toBeVisible()
  })

  test('admin can lock and unlock a learner when explicit admin mutation testing is enabled', async ({ page }) => {
    test.skip(process.env.E2E_ENABLE_ADMIN_MUTATION !== '1', 'Set E2E_ENABLE_ADMIN_MUTATION=1 to allow user status mutation.')

    await login(page, admin)
    await page.goto('/admin/users')
    await page.getByPlaceholder('Tìm theo tên hoặc email').fill(learnerFresh.email)
    const row = page.getByRole('row').filter({ hasText: learnerFresh.email })
    await expect(row).toBeVisible()

    if (await row.getByRole('button', { name: 'Mở khóa' }).isVisible().catch(() => false)) {
      await changeUserStatus(page, row, 'Mở khóa', 'Xác nhận mở khóa')
      await expect(row.getByRole('button', { name: 'Khóa' })).toBeVisible()
    }

    await changeUserStatus(page, row, 'Khóa', 'Xác nhận khóa tài khoản')
    await expect(row.getByText('Locked')).toBeVisible()

    await changeUserStatus(page, row, 'Mở khóa', 'Xác nhận mở khóa')
    await expect(row.getByText('Active')).toBeVisible()
  })
})

async function changeUserStatus(page: Page, row: Locator, actionName: string, confirmName: string) {
  await row.getByRole('button', { name: actionName }).click()
  await page.getByLabel(/Lý do/).fill(`E2E ${actionName.toLowerCase()} ${Date.now()}`)
  await Promise.all([
    page.waitForResponse((response) =>
      response.url().includes('/rest/v1/rpc/set_user_status') && response.request().method() === 'POST',
    ),
    page.getByRole('button', { name: confirmName }).click(),
  ])
}
