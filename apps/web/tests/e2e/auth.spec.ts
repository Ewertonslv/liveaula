import { test, expect } from '@playwright/test';

test.describe('Auth flows', () => {
  test('login professor → redireciona dashboard', async ({ page }) => {
    await page.goto('/login');
    await page.fill('[type="email"]', 'professor1@test.com');
    await page.fill('[type="password"]', 'Test@1234');
    await page.click('[type="submit"]');
    await expect(page).toHaveURL('/dashboard');
  });

  test('login com senha errada → mensagem de erro', async ({ page }) => {
    await page.goto('/login');
    await page.fill('[type="email"]', 'professor1@test.com');
    await page.fill('[type="password"]', 'senhaerrada');
    await page.click('[type="submit"]');
    await expect(page.locator('text=Email ou senha inválidos')).toBeVisible();
  });

  test('convite inválido → página de erro', async ({ page }) => {
    await page.goto('/invite/token-invalido-123');
    await expect(page.locator('text=Convite inválido')).toBeVisible();
  });
});
