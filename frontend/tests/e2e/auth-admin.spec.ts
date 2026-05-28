import { expect, test } from '@playwright/test'
import { admin, expectNoMojibake, learnerA, login } from './helpers'

test.describe('auth and admin guard', () => {
  test('public landing renders unauthenticated entry points', async ({ page }) => {
    await page.goto('/')

    await expect(page.getByText('TimeBoxed').first()).toBeVisible()
    await expect(page.getByRole('link', { name: /Đăng nhập/ })).toBeVisible()
    await expectNoMojibake(page)
  })

  test('learner routes require authentication', async ({ page }) => {
    await page.goto('/topics')

    await expect(page).toHaveURL(/\/login/)
    await expect(page.locator('input[name="email"]')).toBeVisible()
  })

  test('learner login reaches topic list', async ({ page }) => {
    await login(page, learnerA)

    await expect(page).toHaveURL(/\/topics/)
    await expect(page.getByText(/Danh sách chủ đề|Khám phá chủ đề/).first()).toBeVisible()
    await expectNoMojibake(page)
  })

  test('admin account can reach admin dashboard', async ({ page }) => {
    await login(page, admin)
    await page.goto('/admin/dashboard')
    await page.waitForLoadState('networkidle')

    await expect(page).toHaveURL(/\/admin\/dashboard/)
    await expect(page.getByRole('heading', { name: 'Admin Dashboard' })).toBeVisible()
    await expectNoMojibake(page)
  })

  test('learner account receives branded admin access denied screen', async ({ page }) => {
    await login(page, learnerA)
    await page.goto('/admin/dashboard')
    await page.waitForLoadState('networkidle')

    await expect(page.getByText('Tài khoản hiện tại chưa có quyền quản trị')).toBeVisible()
    await expect(page.getByText('Quyền truy cập bị giới hạn')).toBeVisible()
    await expect(page.getByRole('button', { name: /Đăng nhập tài khoản Admin/ })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Về khu học tập' })).toBeVisible()
    await expectNoMojibake(page)
  })

  test('admin login page exposes secure admin portal copy', async ({ page }) => {
    await page.goto('/admin/login')

    await expect(page.getByRole('textbox', { name: 'Email' })).toHaveValue('admin@timebox.edu.vn')
    await expect(page.getByRole('button', { name: /Đăng nhập admin/ })).toBeVisible()
    await expect(page.getByRole('link', { name: /Quay lại trang học viên/ })).toBeVisible()
    await expectNoMojibake(page)
  })
})
