import { expect, test } from '@playwright/test'
import { admin, expectNoMojibake, learnerA, login } from './helpers'

test.describe('secondary learner and admin workflows', () => {
  test('notifications list renders persisted notifications', async ({ page }) => {
    await login(page, learnerA)
    await page.goto('/notifications')

    await expect(page.getByRole('heading', { name: 'Thông báo' })).toBeVisible()
    await expect(page.getByText(/Có phản hồi mới|Giải Tích 1 còn/).first()).toBeVisible()
    await expectNoMojibake(page)
  })

  test('notification detail marks and opens notification content', async ({ page }) => {
    await login(page, learnerA)
    await page.goto('/notifications/50000000-0000-0000-0000-000000000004')

    await expect(page.getByText('Chi tiết thông báo')).toBeVisible()
    await expect(page.getByRole('link', { name: /Vào học|Xem/ })).toBeVisible()
    await expectNoMojibake(page)
  })

  test('calendar shows submitted and not submitted deadlines', async ({ page }) => {
    await login(page, learnerA)
    await page.goto('/calendar')

    await expect(page.getByRole('heading', { name: 'Lịch học & hạn nộp' })).toBeVisible()
    await expect(page.getByText('Đã nộp').first()).toBeVisible()
    await expect(page.getByText(/Chưa nộp|Hết hạn/).first()).toBeVisible()
    await expectNoMojibake(page)
  })

  test('bookmarks page renders saved submissions or empty state', async ({ page }) => {
    await login(page, learnerA)
    await page.goto('/bookmarks')

    await expect(page.getByRole('heading', { name: 'Bookmark / Bài đã lưu' })).toBeVisible()
    await expect(page.getByText(/Chưa có bài đã lưu|Giới hạn của hàm|Tính liên tục/).first()).toBeVisible()
    await expectNoMojibake(page)
  })

  test('admin dashboard shows real overview sections', async ({ page }) => {
    await login(page, admin)
    await page.goto('/admin/dashboard')

    await expect(page.getByRole('heading', { name: 'Admin Dashboard' })).toBeVisible()
    await expect(page.getByText(/Chờ duyệt|Đang mở|Bài nộp|Người dùng/).first()).toBeVisible()
    await expectNoMojibake(page)
  })

  test('admin pending list shows proposals', async ({ page }) => {
    await login(page, admin)
    await page.goto('/admin/topics/pending')

    await expect(page.getByRole('heading', { name: /Danh sách chờ duyệt/ })).toBeVisible()
    await expect(page.getByText('Cấu Trúc Dữ Liệu - Stack và Queue')).toBeVisible()
    await expectNoMojibake(page)
  })

  test('admin topic management can filter/search topics', async ({ page }) => {
    await login(page, admin)
    await page.goto('/admin/topics')

    await expect(page.getByRole('heading', { name: /Quản lý chủ đề/ })).toBeVisible()
    await page.getByPlaceholder(/Tìm kiếm|Search|Blockchain/).fill('Python')
    await expect(page.getByText('Python Cơ Bản - List, Dict và Vòng lặp')).toBeVisible()
    await expectNoMojibake(page)
  })

  test('admin users page shows user roles and reputation columns', async ({ page }) => {
    await login(page, admin)
    await page.goto('/admin/users')

    await expect(page.getByRole('heading', { name: /Quản lý người dùng/ })).toBeVisible()
    await expect(page.getByText('Nguyễn Minh Anh')).toBeVisible()
    await expect(page.getByText(/Huy hiệu|Câu trả lời|Like câu trả lời/).first()).toBeVisible()
    await expectNoMojibake(page)
  })
})
