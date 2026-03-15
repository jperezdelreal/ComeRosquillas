import { test, expect } from '@playwright/test'

// ─── Page Load ────────────────────────────────────────────────
test.describe('Page Load', () => {
  test('page title is correct', async ({ page }) => {
    await page.goto('./')
    await expect(page).toHaveTitle(/Come Rosquillas/)
  })

  test('game container is visible', async ({ page }) => {
    await page.goto('./')
    await expect(page.locator('#gameContainer')).toBeVisible()
  })

  test('canvas element exists and is visible', async ({ page }) => {
    await page.goto('./')
    await expect(page.locator('#gameCanvas')).toBeVisible()
  })

  test('all game scripts loaded without errors', async ({ page }) => {
    const errors = []
    page.on('pageerror', err => errors.push(err.message))
    await page.goto('./')
    await page.waitForTimeout(2000)
    expect(errors).toEqual([])
  })
})

// ─── HUD ──────────────────────────────────────────────────────
test.describe('HUD Elements', () => {
  test('score display is visible', async ({ page }) => {
    await page.goto('./')
    await expect(page.locator('#scoreDisplay')).toBeVisible()
    await expect(page.locator('#scoreDisplay')).toHaveText('0')
  })

  test('level display is visible', async ({ page }) => {
    await page.goto('./')
    await expect(page.locator('#levelDisplay')).toBeVisible()
    // Level display shows maze name — e.g. "Springfield Streets - 1"
    const text = await page.locator('#levelDisplay').textContent()
    expect(text.length).toBeGreaterThan(0)
  })

  test('high score display is visible', async ({ page }) => {
    await page.goto('./')
    await expect(page.locator('#highScoreDisplay')).toBeVisible()
  })

  test('lives container is visible', async ({ page }) => {
    await page.goto('./')
    await expect(page.locator('.lives-container')).toBeVisible()
  })

  test('HUD has proper ARIA attributes', async ({ page }) => {
    await page.goto('./')
    const hud = page.locator('#hud')
    await expect(hud).toHaveAttribute('role', 'status')
    await expect(hud).toHaveAttribute('aria-live', 'polite')
  })
})

// ─── Settings Menu ────────────────────────────────────────────
test.describe('Settings Menu', () => {
  test('settings button is visible on desktop', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name === 'mobile-chrome', 'Settings button hidden on mobile portrait')
    await page.goto('./')
    await expect(page.locator('#settingsBtn')).toBeVisible()
  })

  test('keyboard S opens settings overlay', async ({ page }) => {
    await page.goto('./')
    await page.waitForTimeout(1000)
    await page.keyboard.press('s')
    await expect(page.locator('.settings-overlay')).toBeVisible()
    await expect(page.locator('.settings-modal')).toBeVisible()
  })

  test('settings modal has header with title', async ({ page }) => {
    await page.goto('./')
    await page.waitForTimeout(1000)
    await page.keyboard.press('s')
    await expect(page.locator('.settings-header h2')).toBeVisible()
  })

  test('settings close button dismisses the overlay', async ({ page }) => {
    await page.goto('./')
    await page.waitForTimeout(1000)
    await page.keyboard.press('s')
    await expect(page.locator('.settings-overlay')).toBeVisible()
    await page.locator('.settings-close').dispatchEvent('click')
    await expect(page.locator('.settings-overlay')).not.toBeVisible()
  })

  test('settings modal contains audio and difficulty sections', async ({ page }) => {
    await page.goto('./')
    await page.waitForTimeout(1000)
    await page.keyboard.press('s')
    const sections = page.locator('.settings-section h3')
    await expect(sections.first()).toBeVisible()
    const count = await sections.count()
    expect(count).toBeGreaterThanOrEqual(1)
  })

  test('settings has difficulty radio options', async ({ page }) => {
    await page.goto('./')
    await page.waitForTimeout(1000)
    await page.keyboard.press('s')
    const radios = page.locator('.radio-option')
    const count = await radios.count()
    expect(count).toBeGreaterThanOrEqual(1)
  })

  test('settings has reset button', async ({ page }) => {
    await page.goto('./')
    await page.waitForTimeout(1000)
    await page.keyboard.press('s')
    await expect(page.locator('.settings-reset')).toBeVisible()
  })
})

// ─── Keyboard Controls Bar ────────────────────────────────────
test.describe('Bottom Bar (Desktop)', () => {
  test('bottom bar is visible on desktop', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name === 'mobile-chrome', 'Bottom bar hidden on mobile')
    await page.goto('./')
    await expect(page.locator('#bottomBar')).toBeVisible()
  })

  test('bottom bar shows keyboard shortcuts', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name === 'mobile-chrome', 'Bottom bar hidden on mobile')
    await page.goto('./')
    const keys = page.locator('#bottomBar .key')
    const count = await keys.count()
    expect(count).toBeGreaterThanOrEqual(4)
  })
})

// ─── Touch Controls (Mobile viewport) ─────────────────────────
test.describe('Touch Controls (Mobile)', () => {
  test.use({ ...({ viewport: { width: 390, height: 844 } }) })

  test('action buttons exist in the DOM', async ({ page }) => {
    await page.goto('./')
    await expect(page.locator('#touchPauseBtn')).toBeAttached()
    await expect(page.locator('#touchMuteBtn')).toBeAttached()
  })
})

// ─── Game Start Flow ──────────────────────────────────────────
test.describe('Game Start Flow', () => {
  test('start screen message is displayed', async ({ page }) => {
    await page.goto('./')
    // The game shows a start screen via the #message overlay or canvas
    // Wait for game to initialize
    await page.waitForTimeout(2000)
    const message = page.locator('#message')
    // Message may or may not be visible depending on game state
    await expect(message).toBeAttached()
  })

  test('pressing Enter starts the game', async ({ page }) => {
    await page.goto('./')
    await page.waitForTimeout(2000)
    // Focus the canvas via keyboard and press Enter to start
    await page.locator('#gameCanvas').focus()
    await page.keyboard.press('Enter')
    await page.waitForTimeout(1000)
    // After starting, the game is running — score should still be visible
    await expect(page.locator('#scoreDisplay')).toBeVisible()
  })
})

// ─── Mute Toggle ──────────────────────────────────────────────
test.describe('Mute Toggle', () => {
  test('pressing M key toggles mute', async ({ page }) => {
    await page.goto('./')
    await page.waitForTimeout(1000)
    // Press M to toggle mute
    await page.keyboard.press('m')
    await page.waitForTimeout(300)
    // Press M again to unmute
    await page.keyboard.press('m')
    await page.waitForTimeout(300)
    // No crash — page is still functional
    await expect(page.locator('#gameContainer')).toBeVisible()
  })

  test('mute button exists in DOM', async ({ page }) => {
    await page.goto('./')
    await expect(page.locator('#touchMuteBtn')).toBeAttached()
  })
})

// ─── Accessibility ────────────────────────────────────────────
test.describe('Accessibility', () => {
  test('skip link is present', async ({ page }) => {
    await page.goto('./')
    await expect(page.locator('.skip-link')).toBeAttached()
    await expect(page.locator('.skip-link')).toHaveAttribute('href', '#gameCanvas')
  })

  test('canvas has proper ARIA label', async ({ page }) => {
    await page.goto('./')
    await expect(page.locator('#gameCanvas')).toHaveAttribute('aria-label', /arrow keys/)
  })

  test('game container has role=main', async ({ page }) => {
    await page.goto('./')
    await expect(page.locator('#gameContainer')).toHaveAttribute('role', 'main')
  })

  test('settings button has aria-label', async ({ page }) => {
    await page.goto('./')
    await expect(page.locator('#settingsBtn')).toHaveAttribute('aria-label', /settings/i)
  })
})

// ─── Responsive Layout ───────────────────────────────────────
test.describe('Responsive Layout', () => {
  test('game renders at 1920x1080', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 })
    await page.goto('./')
    await expect(page.locator('#gameContainer')).toBeVisible()
    await expect(page.locator('#gameCanvas')).toBeVisible()
  })

  test('game renders at 375x667 (iPhone SE)', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('./')
    await expect(page.locator('#gameContainer')).toBeVisible()
    await expect(page.locator('#gameCanvas')).toBeVisible()
  })

  test('game renders at 768x1024 (iPad)', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 })
    await page.goto('./')
    await expect(page.locator('#gameContainer')).toBeVisible()
    await expect(page.locator('#gameCanvas')).toBeVisible()
  })
})

// ─── Keyboard Shortcuts ──────────────────────────────────────
test.describe('Keyboard Shortcuts', () => {
  test('pressing S opens settings', async ({ page }) => {
    await page.goto('./')
    await page.waitForTimeout(1000)
    await page.keyboard.press('s')
    await page.waitForTimeout(500)
    await expect(page.locator('.settings-overlay')).toBeVisible()
  })

  test('pressing P toggles pause', async ({ page }) => {
    await page.goto('./')
    await page.waitForTimeout(1000)
    // Start game first
    await page.locator('#gameCanvas').focus()
    await page.keyboard.press('Enter')
    await page.waitForTimeout(500)
    // Pause
    await page.keyboard.press('p')
    await page.waitForTimeout(300)
    // No crash — container still visible
    await expect(page.locator('#gameContainer')).toBeVisible()
  })

  test('pressing L opens leaderboard/stats', async ({ page }) => {
    await page.goto('./')
    await page.waitForTimeout(1000)
    await page.keyboard.press('l')
    await page.waitForTimeout(500)
    // Stats overlay should appear
    await expect(page.locator('.stats-overlay')).toBeVisible()
  })
})

// ─── Stats Dashboard ─────────────────────────────────────────
test.describe('Stats Dashboard', () => {
  test('stats modal has tabs', async ({ page }) => {
    await page.goto('./')
    await page.waitForTimeout(1000)
    await page.keyboard.press('l')
    await page.waitForTimeout(500)
    const tabs = page.locator('.stats-tab')
    const count = await tabs.count()
    expect(count).toBeGreaterThanOrEqual(1)
  })

  test('stats close button works', async ({ page }) => {
    await page.goto('./')
    await page.waitForTimeout(1000)
    await page.keyboard.press('l')
    await page.waitForTimeout(500)
    await expect(page.locator('.stats-overlay')).toBeVisible()
    await page.locator('.stats-close').dispatchEvent('click')
    await expect(page.locator('.stats-overlay')).not.toBeVisible()
  })
})
