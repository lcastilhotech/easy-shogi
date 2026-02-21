import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('http://localhost:3000/login');
    });

    test('should show error for invalid email format', async ({ page }) => {
        await page.fill('input[type="email"]', 'invalid-email');
        await page.fill('input[type="password"]', 'password123');
        await page.click('button[type="submit"]');

        const errorMessage = page.getByTestId('auth-message');
        await expect(errorMessage).toBeVisible();
        await expect(errorMessage).toHaveText('Por favor, insira um e-mail válido.');
    });

    test('should show error for short password', async ({ page }) => {
        await page.fill('input[type="email"]', 'test@example.com');
        await page.fill('input[type="password"]', '12345');
        await page.click('button[type="submit"]');

        const errorMessage = page.getByTestId('auth-message');
        await expect(errorMessage).toBeVisible();
        await expect(errorMessage).toHaveText('A senha deve ter pelo menos 6 caracteres.');
    });

    test('should toggle between login and signup modes', async ({ page }) => {
        const signupToggle = page.locator('button:has-text("Cadastre-se")');
        await signupToggle.click();

        await expect(page.getByTestId('auth-title')).toHaveText('Junte-se');
        await expect(page.locator('button[type="submit"]')).toHaveText('Cadastrar');

        const loginToggle = page.locator('button:has-text("Entre")').last();
        await loginToggle.click();

        await expect(page.getByTestId('auth-title')).toHaveText('Entre');
        await expect(page.locator('button[type="submit"]')).toHaveText('Entrar');
    });

    test('should show error for incorrect credentials', async ({ page }) => {
        // This relies on Supabase returning a proper error
        await page.fill('input[type="email"]', 'nonexistent@example.com');
        await page.fill('input[type="password"]', 'wrongpassword');
        await page.click('button[type="submit"]');

        const errorMessage = page.getByTestId('auth-message');
        // We wait for the network request
        await expect(errorMessage).toBeVisible({ timeout: 10000 });
        // This depends on our getErrorMessage mapping
        await expect(errorMessage).toHaveText(/E-mail ou senha incorretos|Ocorreu um erro inesperado/);
    });
});
