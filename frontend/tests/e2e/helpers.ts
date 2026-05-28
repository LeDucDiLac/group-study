import { expect, type Page } from '@playwright/test'

export const learnerA = {
  email: process.env.E2E_LEARNER_EMAIL ?? 'minh.anh@student.edu.vn',
  password: process.env.E2E_LEARNER_PASSWORD ?? 'timeboxed',
}

export const learnerB = {
  email: process.env.E2E_PEER_EMAIL ?? 'quoc.hung@student.edu.vn',
  password: process.env.E2E_PEER_PASSWORD ?? 'timeboxed',
}

export const learnerFresh = {
  email: process.env.E2E_FRESH_LEARNER_EMAIL ?? 'duc.thang@student.edu.vn',
  password: process.env.E2E_FRESH_LEARNER_PASSWORD ?? 'timeboxed',
}

export const learnerDraft = {
  email: process.env.E2E_DRAFT_LEARNER_EMAIL ?? 'ngoc.mai@student.edu.vn',
  password: process.env.E2E_DRAFT_LEARNER_PASSWORD ?? 'timeboxed',
}

export const admin = {
  email: process.env.E2E_ADMIN_EMAIL ?? 'admin@timebox.edu.vn',
  password: process.env.E2E_ADMIN_PASSWORD ?? 'timeboxed',
}

export const topics = {
  calculus: '10000000-0000-0000-0000-000000000001',
  python: '10000000-0000-0000-0000-000000000002',
}

export async function login(page: Page, account: { email: string; password: string }) {
  await page.goto('/login')
  await page.locator('input[name="email"]').fill(account.email)
  await page.locator('input[name="password"]').fill(account.password)
  await Promise.all([
    page.waitForURL(/\/(topics|admin\/dashboard)(\/)?$/, { timeout: 15_000 }),
    page.locator('form button[type="submit"]').click(),
  ])
}

export async function expectNoMojibake(page: Page) {
  const bodyText = await page.locator('body').innerText()
  expect(bodyText).not.toMatch(/[\u00c2\u00c3\u00c4\u00c6].|[\u00e1][\u00ba\u00bb].|[\u00e2][\u20ac].|[\u00c3][\u00a0-\u00bf]/)
}
