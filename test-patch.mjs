import { chromium } from '@playwright/test';

const BASE = 'http://localhost:3000';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext();
  const page = await ctx.newPage();

  page.on('console', msg => console.log(`[PAGE LOG] ${msg.type()}: ${msg.text()}`));
  page.on('pageerror', err => console.log(`[PAGE ERROR] ${err.message}`));
  page.on('requestfinished', async req => {
    try {
      const res = await req.response();
      console.log(`[REQ FINISHED] ${req.method()} ${req.url()} -> ${res ? res.status() : 'NO RES'}`);
      if (req.method() === 'PATCH') {
        const body = await res.text();
        console.log(`[PATCH RESPONSE BODY]`, body);
      }
    } catch (e) {
      // ignore
    }
  });

  console.log('Logging in...');
  await page.goto(`${BASE}/admin/login`);
  await page.fill('input[type="password"]', 'LJnwqAzg2xgQZjTIQlo');
  await page.click('button[type="submit"]');
  await page.waitForURL(`${BASE}/admin`);

  console.log('Navigating to orders...');
  await page.goto(`${BASE}/admin/orders`);
  await page.waitForLoadState('networkidle');

  const firstOrder = await page.$('tbody tr');
  if (!firstOrder) {
    console.log('No orders found!');
    await browser.close();
    return;
  }

  await firstOrder.click();
  await page.waitForLoadState('networkidle');
  console.log('On order page:', page.url());

  console.log('Clicking "confirmed" status...');
  const confirmedBtn = await page.getByRole('button', { name: /^confirmed$/i });
  await confirmedBtn.click();
  
  await page.waitForTimeout(2000);
  console.log('Done!');
  await browser.close();
})();
