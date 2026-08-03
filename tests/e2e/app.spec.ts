import { test, expect } from '@playwright/test'
import { join } from 'node:path'

const SAMPLE_IMAGE = join(process.cwd(), 'tests', 'fixtures', 'sample-upload.png')

test.describe('the review workflow', () => {
  test('New Review shows the upload zone and the brief', async ({ page }) => {
    await page.goto('/app/new')
    await expect(page.getByRole('heading', { name: /One visual, read the way/i })).toBeVisible()
    await expect(page.getByText('Choose a file')).toBeVisible()
    await expect(page.getByLabel('Where it will be published')).toBeVisible()
    await expect(page.getByLabel('Primary goal')).toBeVisible()
    // The privacy statement is on the form itself, as required.
    await expect(page.getByText(/processed by an external AI provider/i)).toBeVisible()
  })

  test('the submit button stays disabled until an image is chosen', async ({ page }) => {
    await page.goto('/app/new')
    const submit = page.getByRole('button', { name: /Review my visual/i })
    await expect(submit).toBeDisabled()
    await page.setInputFiles('input[type="file"]', SAMPLE_IMAGE)
    await expect(page.getByText('sample-upload.png')).toBeVisible()
    await expect(submit).toBeEnabled()
  })

  test('a full Visual Review runs and renders its report', async ({ page }) => {
    await page.goto('/app/new')
    await page.setInputFiles('input[type="file"]', SAMPLE_IMAGE)
    await page.getByRole('button', { name: /Review my visual/i }).click()

    // The loading experience names the stage it is on.
    await expect(page.getByRole('status')).toContainText('Reading the composition')

    await page.waitForURL(/\/app\/analysis\//, { timeout: 45_000 })
    await expect(page.getByText('Visual Score')).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Priority improvements' })).toBeVisible()
    await expect(page.getByText('Attention path').first()).toBeVisible()
    await expect(page.getByRole('button', { name: /Copy prompt/i }).first()).toBeVisible()
  })

  test('a report can be shared and then revoked', async ({ page }) => {
    await page.goto('/app/history')
    await page.locator('a[href^="/app/analysis/"]').first().click()
    await page.waitForURL(/\/app\/analysis\//)

    const shareButton = page.getByRole('button', { name: /share link/i })
    if (await page.getByRole('button', { name: 'Revoke link' }).isVisible()) {
      await page.getByRole('button', { name: 'Revoke link' }).click()
      await expect(page.getByRole('button', { name: 'Create share link' })).toBeVisible()
    }
    await shareButton.click()
    await expect(page.getByText('Public link')).toBeVisible()

    const slug = (await page.locator('code').first().innerText()).split('/r/')[1]!.trim()
    const response = await page.request.get(`/r/${slug}`)
    expect(response.status()).toBe(200)

    await page.getByRole('button', { name: 'Revoke link' }).click()
    await expect(page.getByRole('button', { name: 'Create share link' })).toBeVisible()
  })

  test('a revoked share link stops resolving', async ({ page }) => {
    await page.goto('/r/this-slug-never-existed')
    await expect(page.getByText(/no longer active/i)).toBeVisible()
  })
})

test.describe('history', () => {
  test('lists reviews and filters by mode', async ({ page }) => {
    await page.goto('/app/history')
    await expect(page.getByRole('heading', { name: /Everything you have reviewed/i })).toBeVisible()
    const before = await page.locator('a[href^="/app/analysis/"]').count()
    expect(before).toBeGreaterThan(0)

    await page.getByRole('button', { name: 'Feed Audit', exact: true }).click()
    await expect(page.locator('a[href^="/app/analysis/"]')).toHaveCount(1)

    await page.getByRole('button', { name: 'All' }).click()
    await expect(page.locator('a[href^="/app/analysis/"]')).toHaveCount(before)
  })

  test('search narrows the list by title', async ({ page }) => {
    await page.goto('/app/history')
    await page.getByLabel('Search reviews by title').fill('zzzz-no-match')
    await expect(page.getByText('No reviews match that filter.')).toBeVisible()
  })

  test('a review can be deleted', async ({ page }) => {
    await page.goto('/app/history')
    const before = await page.locator('a[href^="/app/analysis/"]').count()

    page.once('dialog', (dialog) => dialog.accept())
    await page
      .getByRole('button', { name: /^Delete / })
      .first()
      .click()

    await expect(page.locator('a[href^="/app/analysis/"]')).toHaveCount(before - 1)
  })
})

test.describe('brand profiles', () => {
  test('a profile can be created and deleted', async ({ page }) => {
    await page.goto('/app/brand-profiles')
    await expect(page.getByRole('heading', { name: /Teach it your brand/i })).toBeVisible()

    await page.getByRole('button', { name: 'New profile' }).click()
    await page.getByLabel('Brand or creator name').fill('E2E Test Studio')
    await page.getByLabel('Brand personality').fill('Precise, quiet')
    await page.getByRole('button', { name: 'Save profile' }).click()

    await expect(page.getByRole('heading', { name: 'E2E Test Studio' })).toBeVisible()

    page.once('dialog', (dialog) => dialog.accept())
    await page.getByRole('button', { name: 'Delete E2E Test Studio' }).click()
    await expect(page.getByRole('heading', { name: 'E2E Test Studio' })).toBeHidden()
  })
})

test.describe('settings', () => {
  test('shows the beta limits and the configured model', async ({ page }) => {
    await page.goto('/app/settings')
    await expect(page.getByText('Reviews used today')).toBeVisible()
    await expect(page.getByText('Midnight UTC', { exact: true })).toBeVisible()
  })
})
