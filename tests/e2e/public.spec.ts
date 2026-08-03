import { test, expect } from '@playwright/test'

test.describe('public site', () => {
  test('the landing page loads with its hero and product demo', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveTitle(/HiArt/)
    await expect(page.getByRole('heading', { name: /Before they read the caption/i })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Review a visual' }).first()).toBeVisible()
    // The pre-generated hero demo, not an AI call.
    await expect(page.getByText('Visual Review · Sample')).toBeVisible()
    await expect(page.getByText('Private by default').first()).toBeVisible()
  })

  test('every landing section is present', async ({ page }) => {
    await page.goto('/')
    for (const heading of [
      /What people see first/i,
      /Three steps/i,
      /One visual, read the way/i,
      /Two variants/i,
      /Your profile is one image/i,
      /Words have ReadRoom/i,
      /Teach it your brand/i,
      /Not a wall of text/i,
      /What HiArt/i,
      /Know how your visuals land/i,
    ]) {
      await expect(page.getByRole('heading', { name: heading }).first()).toBeVisible()
    }
  })

  test('the public example works without signing in', async ({ page }) => {
    await page.goto('/example')
    await expect(
      page.getByRole('heading', { name: /This is what HiArt hands back/i })
    ).toBeVisible()
    await expect(page.getByText('Sample report · pre-generated').first()).toBeVisible()
    // The report renders in full.
    await expect(page.getByText('Attention path').first()).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Priority improvements' })).toBeVisible()

    // The other two modes are reachable from the same page.
    await page.getByRole('tab', { name: 'A/B Compare' }).click()
    await expect(page.getByText('Recommendation').first()).toBeVisible()
    await page.getByRole('tab', { name: 'Feed Audit' }).click()
    await expect(page.getByRole('heading', { name: /Three visual directions/i })).toBeVisible()
  })

  test('the legal pages are real pages', async ({ page }) => {
    for (const [path, heading] of [
      ['/privacy', /What we hold/i],
      ['/terms', /The deal, in plain terms/i],
      ['/ai-limitations', /What HiArt cannot tell you/i],
    ] as const) {
      await page.goto(path)
      await expect(page.getByRole('heading', { name: heading })).toBeVisible()
    }
  })

  test('an unknown page shows the 404 state', async ({ page }) => {
    await page.goto('/this-page-does-not-exist')
    await expect(page.getByText('Error 404')).toBeVisible()
  })

  test('the founder X link points at the right account', async ({ page }) => {
    await page.goto('/')
    const link = page.getByRole('link', { name: 'Gia Macool' })
    await expect(link).toHaveAttribute('href', 'https://x.com/GiaMMacool')
  })
})
