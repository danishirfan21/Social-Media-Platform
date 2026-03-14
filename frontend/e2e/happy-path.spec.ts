import { test, expect } from '@playwright/test';

test('User can register and create a post', async ({ page }) => {
  const timestamp = Date.now();
  const username = `user_${timestamp}`;
  const email = `user_${timestamp}@example.com`;
  const password = 'Password123!';

  // 1. Go to register page
  await page.goto('http://localhost:3000/register');

  // 2. Fill registration form
  await page.fill('input[label="Username"]', username);
  await page.fill('input[type="email"]', email);
  await page.fill('input[label="Password"]', password);

  // Submit registration
  await page.click('button[type="submit"]');

  // 3. Should be redirected to feed
  await expect(page).toHaveURL('http://localhost:3000/');
  await expect(page.getByText(`What's on your mind, ${username}?`)).toBeVisible();

  // 4. Create a post
  const postContent = `Hello world from E2E test ${timestamp}`;
  await page.fill('textarea[placeholder^="What\'s on your mind"]', postContent);
  await page.click('button:has-text("Post")');

  // 5. Verify post appears in feed
  await expect(page.getByText(postContent)).toBeVisible();
});
