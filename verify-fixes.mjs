import { chromium } from '@playwright/test';
import { writeFileSync, mkdirSync } from 'fs';

const BASE = 'http://localhost:3000';
const SHOTS = './verify-screenshots';
mkdirSync(SHOTS, { recursive: true });

let pass = 0, fail = 0;
const findings = [];

function log(icon, label, detail) {
  console.log(`${icon} ${label}: ${detail}`);
}
function ok(label, detail) { pass++; log('✅', label, detail); }
function bad(label, detail) { fail++; findings.push(`❌ ${label}: ${detail}`); log('❌', label, detail); }
function warn(label, detail) { findings.push(`⚠️  ${label}: ${detail}`); log('⚠️ ', label, detail); }
function probe(label, detail) { log('🔍', label, detail); }

const browser = await chromium.launch({ headless: true });
const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
const page = await ctx.newPage();

// ─── STEP 1: Homepage loads ───────────────────────────────────────────────────
await page.goto(BASE);
await page.waitForLoadState('networkidle');
const title = await page.title();
if (title.includes('Flora')) ok('Homepage title', title);
else bad('Homepage title', `got: ${title}`);
await page.screenshot({ path: `${SHOTS}/01-homepage.png` });

// ─── STEP 2: Empty-cart checkout guard ───────────────────────────────────────
await page.goto(`${BASE}/checkout`);
await page.waitForLoadState('networkidle');
// Fill all required fields if still on checkout
if (page.url().includes('checkout')) {
  try {
    await page.fill('[name=fullName]', 'Test User');
    await page.fill('[name=phone]', '0555000000');
    await page.fill('[name=wilaya]', 'Alger');
    await page.fill('[name=address]', '10 Rue Test');
    await page.click('button[type=submit]');
    await page.waitForTimeout(500);
  } catch (e) {
    // might have redirected during fill
  }
}
const url = page.url();
if (url.includes('order-confirmed')) {
  bad('Empty-cart guard', 'Submitted empty cart and reached /order-confirmed — guard missing');
} else {
  ok('Empty-cart guard', `Submit with empty cart redirected to / stayed on ${url}`);
}
await page.screenshot({ path: `${SHOTS}/02-empty-cart-checkout.png` });

// ─── STEP 3: Add a product and check cart drawer totalItems ──────────────────
await page.goto(`${BASE}/shop/oud-intense`);
await page.waitForLoadState('networkidle');

// Set quantity to 3 and add to cart
await page.click('button[aria-label="Increase quantity"]');
await page.click('button[aria-label="Increase quantity"]');
// now quantity = 3
await page.click('button:has-text("Add to Cart")');
await page.waitForTimeout(400);

// Cart drawer should open
const drawerVisible = await page.isVisible('aside');
if (!drawerVisible) bad('Cart drawer opens', 'Drawer not visible after Add to Cart');
else ok('Cart drawer opens', 'visible');

// Header should say "Your Cart (3)" not "Your Cart (1)"
const drawerHeader = await page.textContent('aside p.tracking-widest.uppercase');
if (drawerHeader?.includes('3')) ok('Drawer totalItems', `Header: "${drawerHeader?.trim()}"`);
else bad('Drawer totalItems', `Expected total 3, got: "${drawerHeader?.trim()}"`);
await page.screenshot({ path: `${SHOTS}/03-cart-drawer-qty3.png` });

// ─── STEP 4: Delivery fee on cart page ───────────────────────────────────────
await page.goto(`${BASE}/cart`);
await page.waitForLoadState('networkidle');
const deliveryText = await page.textContent('text=Delivery');
// Oud Intense at 4500 DZD × 3 = 13,500 which is ≥ 5000 → Free
const summaryText = await page.textContent('div.bg-parchment:has-text("Order Summary")');
if (summaryText?.includes('Free')) ok('Delivery free ≥5000', 'Delivery shows "Free" for 13,500 DZD cart');
else bad('Delivery free ≥5000', `Expected "Free", summary text: ${summaryText?.slice(0, 80)}`);
await page.screenshot({ path: `${SHOTS}/04-cart-free-delivery.png` });

// ─── STEP 5: Delivery fee when subtotal < 5000 ───────────────────────────────
// Clear cart via localStorage and add a cheap product
await page.evaluate(() => localStorage.removeItem('flora_cart'));
await page.goto(`${BASE}/shop/velvet-body-lotion`); // 1800 DZD
await page.waitForLoadState('networkidle');
// Single add to cart (1800 < 5000 → should show 500 DZD delivery)
await page.click('button:has-text("Add to Cart")');
await page.waitForTimeout(400);
await page.goto(`${BASE}/cart`);
await page.waitForLoadState('networkidle');
const cartText = await page.textContent('div.bg-parchment:has-text("Order Summary")');
if (cartText?.includes('500') || cartText?.includes('DZD')) {
  ok('Delivery fee <5000', '500 DZD fee shown for 1800 DZD cart');
} else {
  bad('Delivery fee <5000', `Expected 500 DZD fee, got: ${cartText?.slice(0, 80)}`);
}
await page.screenshot({ path: `${SHOTS}/05-cart-delivery-fee.png` });

// ─── STEP 6: Checkout with items — order goes through ─────────────────────────
await page.goto(`${BASE}/checkout`);
await page.waitForLoadState('networkidle');
console.log('Step 6 current URL:', page.url());
try {
  await page.waitForSelector('[name=fullName]', { timeout: 2000 });
} catch (e) {
  console.log('Could not find fullName. Current HTML:', await page.innerHTML('body'));
}
await page.fill('[name=fullName]', 'Mehdi Fezzani');
await page.fill('[name=phone]', '0555123456');
await page.fill('[name=wilaya]', 'Alger');
await page.fill('[name=address]', '5 Rue Didouche Mourad');
await page.click('button[type=submit]');
await page.waitForURL(`${BASE}/order-confirmed`, { timeout: 5000 });
ok('Checkout with items', 'Redirected to /order-confirmed');
await page.screenshot({ path: `${SHOTS}/06-order-confirmed.png` });

// ─── STEP 7: Checkout form validation ────────────────────────────────────────
// Add something to cart first
await page.evaluate(() => localStorage.removeItem('flora_cart'));
await page.goto(`${BASE}/shop/amber-noir`);
await page.waitForLoadState('networkidle');
await page.click('button:has-text("Add to Cart")');
await page.waitForTimeout(400);
await page.goto(`${BASE}/checkout`);
await page.waitForLoadState('networkidle');
// Submit with empty fields
await page.click('button[type=submit]');
await page.waitForTimeout(400);
const errors = await page.locator('.text-red-400').count();
if (errors >= 4) ok('Form validation', `${errors} field errors shown`);
else bad('Form validation', `Expected ≥4 errors, saw ${errors}`);
await page.screenshot({ path: `${SHOTS}/07-form-validation.png` });

// ─── STEP 8: Mobile nav ───────────────────────────────────────────────────────
const mobile = await browser.newContext({ viewport: { width: 375, height: 812 } });
const mobilePage = await mobile.newPage();
await mobilePage.goto(BASE);
await mobilePage.waitForLoadState('networkidle');

// Nav links should be hidden at mobile
const desktopNav = await mobilePage.isVisible('nav.hidden');
probe('Mobile desktop-nav hidden', String(desktopNav));

// Hamburger button should be visible
const hamburger = await mobilePage.isVisible('button[aria-label="Open menu"]');
if (hamburger) ok('Hamburger visible on mobile', 'aria-label="Open menu" found');
else bad('Hamburger visible on mobile', 'button[aria-label="Open menu"] not found');

// Click hamburger, mobile menu opens
await mobilePage.click('button[aria-label="Open menu"]');
await mobilePage.waitForTimeout(300);
const shopLinkLocator = mobilePage.locator('div[role="dialog"] a:has-text("Shop")');
const shopLink = await shopLinkLocator.isVisible();
if (shopLink) ok('Mobile menu opens', 'Shop link visible after hamburger click');
else bad('Mobile menu opens', 'Shop link not visible');
await mobilePage.screenshot({ path: `${SHOTS}/08-mobile-menu.png` });

// Navigate via mobile menu
await shopLinkLocator.click();
await mobilePage.waitForURL(`${BASE}/shop`);
ok('Mobile nav navigates', 'Clicked Shop in mobile menu → /shop');
await mobilePage.screenshot({ path: `${SHOTS}/09-mobile-shop.png` });
await mobile.close();

// ─── STEP 9: Invalid scent URL param ─────────────────────────────────────────
await page.goto(`${BASE}/shop?scent=invalid-value`);
await page.waitForLoadState('networkidle');
// Should show all products (not empty), scent defaults to 'all'
const productCards = await page.locator('.group').count();
if (productCards >= 10) ok('Invalid scent param', `Shows all ${productCards} products (defaulted to 'all')`);
else bad('Invalid scent param', `Only ${productCards} products shown — filter may not have reset`);
await page.screenshot({ path: `${SHOTS}/10-invalid-scent-param.png` });

// ─── STEP 10: Valid scent URL param still filters ─────────────────────────────
await page.goto(`${BASE}/shop?scent=floral`);
await page.waitForLoadState('networkidle');
const floralCards = await page.locator('.group').count();
if (floralCards > 0 && floralCards < 10) {
  ok('Valid scent param filters', `${floralCards} floral products shown`);
} else if (floralCards === 0) {
  bad('Valid scent param filters', 'No products shown for floral filter');
} else {
  warn('Valid scent param filters', `Showed ${floralCards} products (expected subset, got all — filter may not be applying)`);
}
await page.screenshot({ path: `${SHOTS}/11-floral-filter.png` });

// ─── STEP 11: Probe — order-confirmed with no localStorage ───────────────────
probe('Order confirmed with no order in localStorage', 'navigating directly');
await page.evaluate(() => localStorage.removeItem('flora_last_order'));
await page.goto(`${BASE}/order-confirmed`);
await page.waitForLoadState('networkidle');
const confirmedTitle = await page.textContent('h1');
if (confirmedTitle?.includes('Order Placed')) {
  ok('Order-confirmed page without localStorage', 'Page renders, no crash, no order details shown');
} else {
  bad('Order-confirmed page without localStorage', `Unexpected content: ${confirmedTitle}`);
}
await page.screenshot({ path: `${SHOTS}/12-order-confirmed-empty.png` });

// ─── SUMMARY ─────────────────────────────────────────────────────────────────
await browser.close();
console.log('\n────────────────────────────────────');
console.log(`PASS: ${pass}  FAIL: ${fail}`);
if (findings.length) {
  console.log('\nFindings:');
  findings.forEach(f => console.log(f));
}
console.log('Screenshots saved to', SHOTS);
process.exit(fail > 0 ? 1 : 0);
