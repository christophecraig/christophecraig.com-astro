import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should have correct title and heading', async ({ page }) => {
    await expect(page).toHaveTitle(/Christophe Craig/);
    await expect(page.getByText('Christophe Craig')).toBeVisible();
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
    await expect(header.getByText('Réalisations')).toBeVisible();
    await expect(header.getByText('Me contacter')).toBeVisible();
  });

  test('should have all main sections', async ({ page }) => {
    await expect(page.getByText('Créer un Impact à Travers le Code')).toBeVisible();
    await expect(page.getByText('Projets Réalisés')).toBeVisible();
    await expect(page.getByText('Prêt à Transformer Vos Idées en Réalité ?')).toBeVisible();
  });

  test('should have contact buttons', async ({ page }) => {
    const contactSection = page.locator('.contact-section');
    await expect(contactSection.getByText('Send Me an Email')).toBeVisible();
    await expect(contactSection.getByText('Schedule a Call')).toBeVisible();
  });

  test('should have social media links', async ({ page }) => {
    const contactSection = page.locator('.contact-section');
    await expect(contactSection.getByText('contact@christophecraig.com')).toBeVisible();
    await expect(contactSection.getByText('GitHub')).toBeVisible();
    await expect(contactSection.getByText('LinkedIn')).toBeVisible();
  });
});