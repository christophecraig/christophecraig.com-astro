import { test, expect } from '@playwright/test';

test.describe('Projects Section', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display projects section', async ({ page }) => {
    const projectsSection = page.locator('.projects-section');
    await expect(projectsSection).toBeVisible();
    await expect(projectsSection.getByText('Projets Réalisés')).toBeVisible();
  });

  test('should display all project cards', async ({ page }) => {
    const projectCards = page.locator('.project-card');
    const count = await projectCards.count();
    expect(count).toBe(3); // We have 3 projects defined
    
    // Check first project
    const firstProject = projectCards.first();
    await expect(firstProject.getByText('Plateforme Apprentisagris')).toBeVisible();
    
    // Check second project
    const secondProject = projectCards.nth(1);
    await expect(secondProject.getByText('Suivi des Prix Crypto')).toBeVisible();
    
    // Check third project
    const thirdProject = projectCards.nth(2);
    await expect(thirdProject.getByText('Hub de Contenu Entreprise')).toBeVisible();
  });

  test('should have project links', async ({ page }) => {
    const projectCards = page.locator('.project-card');
    
    // Check that the second project has a URL
    const secondProject = projectCards.nth(1);
    await expect(secondProject.getByText('Voir l\'Étude de Cas')).toBeVisible();
  });

  test('should display technology tags', async ({ page }) => {
    const projectCards = page.locator('.project-card');
    const firstProject = projectCards.first();
    
    await expect(firstProject.getByText('WordPress')).toBeVisible();
    await expect(firstProject.getByText('PHP')).toBeVisible();
    await expect(firstProject.getByText('JavaScript')).toBeVisible();
  });
});