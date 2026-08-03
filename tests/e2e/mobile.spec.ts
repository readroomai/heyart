import { test, expect } from '@playwright/test'

test.describe('mobile', () => {
  test('the marketing menu opens and navigates', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('heading', { name: /Before they read the caption/i })).toBeVisible()

    await page.getByRole('button', { name: 'Open menu' }).click()
    const nav = page.locator('#mobile-nav')
    await expect(nav).toBeVisible()
    await nav.getByRole('link', { name: 'How it works' }).click()
    await expect(nav).toBeHidden()
  })

  test('the app menu opens and reaches every section', async ({ page }) => {
    await page.goto('/app')
    await page.getByRole('button', { name: 'Open menu' }).click()
    const nav = page.locator('#app-nav')
    await expect(nav).toBeVisible()
    await expect(nav.getByRole('link', { name: 'Brand Profiles' })).toBeVisible()

    await nav.getByRole('link', { name: 'History' }).click()
    await page.waitForURL(/\/app\/history/)
    await expect(page.getByRole('heading', { name: /Everything you have reviewed/i })).toBeVisible()
  })

  test('the report reads as a single vertical column', async ({ page }) => {
    await page.goto('/app/history')
    await page.locator('a[href^="/app/analysis/"]').first().click()
    await page.waitForURL(/\/app\/analysis\//)
    await expect(page.getByText('Visual Score')).toBeVisible()

    // The sticky desktop section rail is hidden on a phone.
    await expect(page.getByRole('navigation', { name: 'Report sections' })).toBeHidden()
  })

  test('nothing overflows horizontally', async ({ page }) => {
    for (const path of ['/', '/example', '/app/new', '/app/history']) {
      await page.goto(path)
      await page.waitForTimeout(600)
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth
      )
      expect(overflow, `${path} overflows horizontally`).toBeLessThanOrEqual(1)
    }
  })
})
