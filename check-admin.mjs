import { chromium } from '@playwright/test';
import { writeFileSync, mkdirSync } from 'fs';

const BASE = 'http://localhost:3000';
const SHOTS = './admin-screenshots';
mkdirSync(SHOTS, { recursive: true });

(async () => {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext();
  const page = await ctx.newPage();

  page.on('console', msg => console.log(`[PAGE LOG] ${msg.type()}: ${msg.text()}`));
  page.on('pageerror', err => console.log(`[PAGE ERROR] ${err.message}`));

  console.log('Navigating to login...');
  await page.goto(`${BASE}/admin/login`);
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: `${SHOTS}/01-login.png` });

  console.log('Logging in...');
  await page.fill('input[type="password"]', 'LJnwqAzg2xgQZjTIQlo');
  await page.click('button[type="submit"]');
  await page.waitForURL(`${BASE}/admin`);
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: `${SHOTS}/02-dashboard.png` });

  console.log('Navigating to products...');
  await page.goto(`${BASE}/admin/products`);
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: `${SHOTS}/03-products.png` });

  console.log('Navigating to products/new...');
  await page.goto(`${BASE}/admin/products/new`);
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: `${SHOTS}/04-products-new.png` });

  await browser.close();
  console.log('Done!');
})();
