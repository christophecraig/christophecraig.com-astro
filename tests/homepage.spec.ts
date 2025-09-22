import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should have correct title and heading', async ({ page }) => {
    await expect(page).toHaveTitle(/Christophe Craig/);
    // Be more specific by targeting the header link element
    await expect(page.getByRole('link', { name: 'Christophe Craig' })).toBeVisible();
  });

  test('should display hero section with greeting', async ({ page }) => {
    const hero = page.locator('.hero');
    await expect(hero).toBeVisible();
    
    const greeting = hero.locator('h1');
    await expect(greeting).toBeVisible();
  });

  test('should have navigation links', async ({ page }) => {
    const header = page.locator('header');
    await expect(header.getByText('Accueil')).toBeVisible();
    await expect(header.getByText('À propos')).toBeVisible();
    await expect(header.getByText('Projets')).toBeVisible();
    await expect(header.getByText('Discutons')).toBeVisible();
  });

  test('should have all main sections', async ({ page }) => {
    await expect(page.getByText('Salut, je suis Christophe')).toBeVisible();
    await expect(page.getByText('Quelques projets')).toBeVisible();
    await expect(page.getByText('Envie de collaborer ?')).toBeVisible();
  });

  test('should have contact buttons', async ({ page }) => {
    const contactSection = page.locator('.contact-section');
    await expect(contactSection.getByText('contact@christophecraig.com')).toBeVisible();
    await expect(contactSection.getByText('GitHub')).toBeVisible();
    await expect(contactSection.getByText('LinkedIn')).toBeVisible();
  });

  test('should have social media links', async ({ page }) => {
    const contactSection = page.locator('.contact-section');
    await expect(contactSection.getByText('contact@christophecraig.com')).toBeVisible();
    await expect(contactSection.getByText('GitHub')).toBeVisible();
    await expect(contactSection.getByText('LinkedIn')).toBeVisible();
  });
});