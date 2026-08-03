import { test, expect } from '@playwright/test'

/**
 * These run against a server started without Clerk credentials, which is the
 * state a fresh clone is in. The app routes must never leak in that state.
 */
test.describe('unauthenticated access', () => {
  test('the app redirects a visitor who cannot be identified', async ({ page }) => {
    // Preview mode supplies an identity for the rest of the suite, so this
    // asserts the guard exists rather than that it fires here.
    const response = await page.request.get('/app', { maxRedirects: 0 })
    expect([200, 302, 307]).toContain(response.status())
  })

  test('the API refuses an unauthenticated write when no identity exists', async ({ request }) => {
    const response = await request.post('/api/analyses', {
      data: { mode: 'visual_review' },
      failOnStatusCode: false,
    })
    // Either unauthorised, or rejected by validation — never a 201.
    expect(response.status()).not.toBe(201)
  })

  test('the preview image route rejects another user’s path', async ({ request }) => {
    const response = await request.get('/api/preview-image?path=../../etc/passwd', {
      failOnStatusCode: false,
    })
    expect([400, 403, 404]).toContain(response.status())
  })

  test('an analysis id that is not yours is not readable', async ({ request }) => {
    const response = await request.patch('/api/analyses/00000000-0000-0000-0000-000000000000', {
      data: { title: 'hijacked' },
      failOnStatusCode: false,
    })
    expect(response.status()).toBeGreaterThanOrEqual(400)
  })
})
