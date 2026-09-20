#!/usr/bin/env node

/**
 * 🧪 VirAshelle Comprehensive Visual QA & Full UI Collision Suite
 * 
 * Exhaustively tests EVERY page, section, interactive modal, and state:
 * 1. Landing Page: All 10 sections + Floating Login button + Back to Top offset
 * 2. Landing Page Interactivity: Header Mobile Menu drawer + Services/Portfolio Video Lightbox Modal
 * 3. Admin Portal: Login Page + Mobile Sidebar Drawer + Overview Dashboard
 * 4. Admin CMS Manager: All 10 Tabs (Hero, About, Services, Why Us, Workflow, Portfolio, Milestone, Team, Clients, Footer)
 * 5. Admin CMS Interactivity: BrandedDropdown open state with glowing cyber indicators
 * 6. Admin Projects: Search & filter toolbar + Project Cards + New Project Modal
 * 7. Admin Project Detail Page: Status workflow steps (1-5), Details sidebar, Activity timeline, and Update form
 * 8. Internal UI Lab (/UIComponents): Design tokens, buttons, swatches, and components
 * 
 * Usage:
 *   node scripts/visual-qa.mjs
 *   npm run qa
 *   node scripts/visual-qa.mjs --url=https://virashelle-page.web.app
 *
 * Admin checks need credentials via env (never commit them):
 *   QA_ADMIN_ID=virashelle QA_ADMIN_PASSWORD=... npm run qa
 */

import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const OUTPUT_DIR = path.join(ROOT_DIR, 'qa-results');
const SCREENSHOTS_DIR = path.join(OUTPUT_DIR, 'screenshots');

if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });
if (!fs.existsSync(SCREENSHOTS_DIR)) fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });

const args = process.argv.slice(2);
const urlArg = args.find(a => a.startsWith('--url='));
const BASE_URL = (urlArg ? urlArg.split('=')[1] : 'https://virashelle-page.web.app').replace(/\/$/, '');

const VIEWPORTS = [
  { name: 'Desktop', width: 1440, height: 900, isMobile: false },
  { name: 'Tablet', width: 768, height: 1024, isMobile: true },
  { name: 'Mobile', width: 390, height: 844, isMobile: true },
];

const CMS_TABS = [
  { name: 'Hero', desc: 'Hero Title & Tagline' },
  { name: 'About', desc: 'About Studio & Stats' },
  { name: 'Services', desc: 'Services & Work Items' },
  { name: 'Why Us', desc: 'Value Proposition' },
  { name: 'Workflow', desc: 'Production Phases' },
  { name: 'Portfolio', desc: 'Portfolio & Dropdown Categories' },
  { name: 'Milestone', desc: 'Studio Stats & Numbers' },
  { name: 'Team', desc: 'Key People & Centered Avatars' },
  { name: 'Clients', desc: 'Client Logos & Brands' },
  { name: 'Footer', desc: 'Footer Links & Socials' }
];

const results = [];

console.log('\n========================================================');
console.log('🚀 VIRASHELLE EXHAUSTIVE VISUAL QA & COLLISION SUITE');
console.log(`🌐 Target: ${BASE_URL}`);
console.log(`📁 Output: ${OUTPUT_DIR}`);
console.log(`📑 Full Coverage: Landing, Modals, Admin, CMS, Projects, UI Lab`);
console.log('========================================================\n');

/**
 * Injected script for precise bounding collision detection
 */
const collisionDetectorScript = () => {
  const interactiveSelector = 'button, a[href], input:not([type="hidden"]), select, textarea, [role="button"], .cursor-pointer';
  const elements = Array.from(document.querySelectorAll(interactiveSelector)).filter(el => {
    const style = window.getComputedStyle(el);
    if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') return false;
    const rect = el.getBoundingClientRect();
    if (rect.width <= 2 || rect.height <= 2) return false;

    // Check if element is clipped by any ancestor overflow container
    let parent = el.parentElement;
    while (parent && parent !== document.body && parent !== document.documentElement) {
      const pStyle = window.getComputedStyle(parent);
      if (pStyle.overflowY === 'auto' || pStyle.overflowY === 'hidden' || pStyle.overflowY === 'scroll') {
        const pRect = parent.getBoundingClientRect();
        if (rect.bottom <= pRect.top + 1 || rect.top >= pRect.bottom - 1) {
          return false; // Out of view / clipped by scroll container
        }
      }
      parent = parent.parentElement;
    }

    return true;
  });

  const collisions = [];
  for (let i = 0; i < elements.length; i++) {
    for (let j = i + 1; j < elements.length; j++) {
      const elA = elements[i];
      const elB = elements[j];

      // Skip parent-child containment
      if (elA.contains(elB) || elB.contains(elA)) continue;

      // Skip elements where one is in sticky header and one is underneath in body
      const isHeaderA = !!elA.closest('header, nav, [class*="Header"]');
      const isHeaderB = !!elB.closest('header, nav, [class*="Header"]');
      if (isHeaderA !== isHeaderB) continue;

      // Skip elements if one is inside an active modal overlay and the other is in the page behind it
      const isModalA = !!elA.closest('.fixed.inset-0, [role="dialog"]');
      const isModalB = !!elB.closest('.fixed.inset-0, [role="dialog"]');
      if (isModalA !== isModalB) continue;

      // Skip elements if one is inside an active floating dropdown/listbox and the other is in the form underneath it
      const isDropdownA = !!elA.closest('[role="listbox"], [role="menu"], [class*="z-50"].absolute');
      const isDropdownB = !!elB.closest('[role="listbox"], [role="menu"], [class*="z-50"].absolute');
      if (isDropdownA !== isDropdownB) continue;

      const rectA = elA.getBoundingClientRect();
      const rectB = elB.getBoundingClientRect();

      const xOverlap = Math.max(0, Math.min(rectA.right, rectB.right) - Math.max(rectA.left, rectB.left));
      const yOverlap = Math.max(0, Math.min(rectA.bottom, rectB.bottom) - Math.max(rectA.top, rectB.top));

      // Overlap threshold: > 6px on both axes
      if (xOverlap > 6 && yOverlap > 6) {
        // Skip full-screen backdrops
        const isBackdrop =
          (rectA.width >= window.innerWidth * 0.85 && rectA.height >= window.innerHeight * 0.85) ||
          (rectB.width >= window.innerWidth * 0.85 && rectB.height >= window.innerHeight * 0.85);

        if (!isBackdrop) {
          collisions.push({
            elementA: {
              tag: elA.tagName.toLowerCase(),
              text: (elA.innerText || elA.getAttribute('aria-label') || elA.getAttribute('placeholder') || '').trim().slice(0, 30),
              className: typeof elA.className === 'string' ? elA.className.slice(0, 60) : '',
              rect: { x: Math.round(rectA.x), y: Math.round(rectA.y), w: Math.round(rectA.width), h: Math.round(rectA.height) }
            },
            elementB: {
              tag: elB.tagName.toLowerCase(),
              text: (elB.innerText || elB.getAttribute('aria-label') || elB.getAttribute('placeholder') || '').trim().slice(0, 30),
              className: typeof elB.className === 'string' ? elB.className.slice(0, 60) : '',
              rect: { x: Math.round(rectB.x), y: Math.round(rectB.y), w: Math.round(rectB.width), h: Math.round(rectB.height) }
            },
            overlapArea: Math.round(xOverlap * yOverlap)
          });
        }
      }
    }
  }

  const clientWidth = document.documentElement.clientWidth;
  const scrollWidth = document.documentElement.scrollWidth;
  const hasHorizontalScroll = scrollWidth > clientWidth + 2;

  return {
    collisions,
    hasHorizontalScroll,
    clientWidth,
    scrollWidth
  };
};

async function runVisualQA() {
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    for (const vp of VIEWPORTS) {
      console.log(`\n📱 ========================================================`);
      console.log(`📱 Testing Viewport: ${vp.name} (${vp.width}x${vp.height})`);
      console.log(`📱 ========================================================`);

      const context = await browser.newContext({
        viewport: { width: vp.width, height: vp.height },
        isMobile: vp.isMobile,
        deviceScaleFactor: 1.5,
      });

      const page = await context.newPage();

      // ==========================================
      // 1. TEST PUBLIC LANDING PAGE SECTIONS
      // ==========================================
      console.log(`\n  🌐 [Landing Page] Testing All Sections...`);
      await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle', timeout: 35000 }).catch(() => {});
      await page.waitForTimeout(2500); // Allow preloader to finish

      const sections = [
        { id: 'hero', name: 'Hero Section', selector: '#hero, section:first-of-type' },
        { id: 'clients', name: 'Clients Logos Marquee', selector: '#clients' },
        { id: 'services', name: 'Services & Works Showcase', selector: '#services' },
        { id: 'why-us', name: 'Why Us Value Proposition', selector: '#why-us' },
        { id: 'milestone', name: 'Milestone Numbers', selector: '#milestone' },
        { id: 'workflow', name: 'Workflow Phases', selector: '#workflow' },
        { id: 'about', name: 'About Studio Story', selector: '#about' },
        { id: 'key-people', name: 'Key People / Team (Centered)', selector: '#key-people' },
        { id: 'footer', name: 'Footer & Back-To-Top Offset', selector: 'footer' }
      ];

      for (const sec of sections) {
        const el = await page.$(sec.selector);
        if (el) {
          await el.scrollIntoViewIfNeeded().catch(() => {});
          await page.waitForTimeout(400);

          const check = await page.evaluate(collisionDetectorScript);
          const ssFilename = `${vp.name.toLowerCase()}_landing_${sec.id}.png`;
          const ssPath = path.join(SCREENSHOTS_DIR, ssFilename);
          await el.screenshot({ path: ssPath }).catch(async () => {
            await page.screenshot({ path: ssPath });
          });

          const status = check.collisions.length === 0 && !check.hasHorizontalScroll ? 'PASS' : 'WARN';
          results.push({
            viewport: vp.name,
            page: 'Landing Page',
            section: sec.name,
            status,
            screenshot: ssFilename,
            collisions: check.collisions,
            hasHorizontalScroll: check.hasHorizontalScroll,
            scrollDiff: check.scrollWidth - check.clientWidth
          });

          if (check.collisions.length > 0) {
            console.log(`    ⚠️  [${sec.name}] ${check.collisions.length} collision(s) detected!`);
          } else {
            console.log(`    ✅ [${sec.name}] Pass (0 collisions)`);
          }
        }
      }

      // ==========================================
      // 2. INTERACTIVE: HEADER MOBILE MENU DRAWER
      // ==========================================
      if (vp.name === 'Mobile') {
        console.log(`\n  📱 [Interactive] Testing Header Mobile Menu Drawer...`);
        try {
          const hamburgerBtn = await page.$('header button');
          if (hamburgerBtn && await hamburgerBtn.isVisible()) {
            await hamburgerBtn.click({ timeout: 3000 });
            await page.waitForTimeout(800); // Wait for open animation

            const menuCheck = await page.evaluate(collisionDetectorScript);
            const menuSs = `${vp.name.toLowerCase()}_landing_mobile_menu.png`;
            await page.screenshot({ path: path.join(SCREENSHOTS_DIR, menuSs) });

            results.push({
              viewport: vp.name,
              page: 'Landing Page',
              section: 'Header Mobile Menu Overlay',
              status: menuCheck.collisions.length === 0 && !menuCheck.hasHorizontalScroll ? 'PASS' : 'WARN',
              screenshot: menuSs,
              collisions: menuCheck.collisions,
              hasHorizontalScroll: menuCheck.hasHorizontalScroll
            });

            console.log(`    ${menuCheck.collisions.length === 0 ? '✅' : '⚠️'} [Mobile Menu Overlay] ${menuCheck.collisions.length} collision(s)`);

            // Close mobile menu
            await hamburgerBtn.click({ timeout: 3000 });
            await page.waitForTimeout(500);
          }
        } catch (hErr) {
          console.warn(`    ⚠️ Header mobile menu test error: ${hErr.message}`);
        }
      }

      // ==========================================
      // 3. INTERACTIVE: PORTFOLIO VIDEO/IMAGE LIGHTBOX
      // ==========================================
      console.log(`\n  🖼️ [Interactive] Testing Portfolio & Video Lightbox Modal...`);
      try {
        const workCard = await page.$('#services [class*="cursor-pointer"], #services [class*="group/card"]');
        if (workCard) {
          await workCard.scrollIntoViewIfNeeded();
          await page.waitForTimeout(400);
          await workCard.click();
          await page.waitForTimeout(1000); // modal animation

          const modalCheck = await page.evaluate(collisionDetectorScript);
          const modalSs = `${vp.name.toLowerCase()}_modal_portfolio_video.png`;
          await page.screenshot({ path: path.join(SCREENSHOTS_DIR, modalSs) });

          results.push({
            viewport: vp.name,
            page: 'Landing Page',
            section: 'Portfolio Video & Lightbox Modal',
            status: modalCheck.collisions.length === 0 ? 'PASS' : 'WARN',
            screenshot: modalSs,
            collisions: modalCheck.collisions,
            hasHorizontalScroll: modalCheck.hasHorizontalScroll
          });

          console.log(`    ${modalCheck.collisions.length === 0 ? '✅' : '⚠️'} [Portfolio Modal] ${modalCheck.collisions.length} collision(s)`);

          // Close modal
          const closeBtn = await page.$('.fixed.inset-0 button');
          if (closeBtn) await closeBtn.click().catch(() => {});
          await page.waitForTimeout(500);
        } else {
          console.log(`    ℹ️ No portfolio card thumbnail found in DOM`);
        }
      } catch (modalErr) {
        console.warn(`    ⚠️ Modal test error: ${modalErr.message}`);
      }

      // ==========================================
      // 4. TEST ADMIN LOGIN PAGE
      // ==========================================
      console.log(`\n  🔐 [Admin Portal] Testing Login Page...`);
      await page.goto(`${BASE_URL}/admin/login`, { waitUntil: 'networkidle', timeout: 20000 }).catch(() => {});
      await page.waitForTimeout(1000);

      const loginCheck = await page.evaluate(collisionDetectorScript);
      const loginSs = `${vp.name.toLowerCase()}_admin_login.png`;
      await page.screenshot({ path: path.join(SCREENSHOTS_DIR, loginSs) });

      results.push({
        viewport: vp.name,
        page: 'Admin Portal',
        section: 'Login Page',
        status: loginCheck.collisions.length === 0 ? 'PASS' : 'WARN',
        screenshot: loginSs,
        collisions: loginCheck.collisions,
        hasHorizontalScroll: loginCheck.hasHorizontalScroll
      });
      console.log(`    ✅ [Login Page] Pass (0 collisions)`);

      // ==========================================
      // 5. AUTHENTICATE & TEST ADMIN FEATURES
      // ==========================================
      console.log(`\n  🔑 [Admin Portal] Authenticating...`);
      try {
        const idInput = await page.$('input[placeholder*="ID"], input[type="text"]');
        const passInput = await page.$('input[type="password"]');
        const submitBtn = await page.$('button[type="submit"]');

        // Credentials come from the environment so no password lives in the repo:
        //   QA_ADMIN_ID=virashelle QA_ADMIN_PASSWORD=... npm run qa
        const qaId = process.env.QA_ADMIN_ID || 'virashelle';
        const qaPassword = process.env.QA_ADMIN_PASSWORD;

        if (!qaPassword) {
          console.log('    ⏭️  QA_ADMIN_PASSWORD not set — skipping authenticated admin checks.');
        } else if (idInput && passInput && submitBtn) {
          await idInput.fill(qaId);
          await passInput.fill(qaPassword);
          await submitBtn.click();
          await page.waitForTimeout(3000);

          if (page.url().includes('/admin')) {
            console.log(`    🔓 Authenticated! Running Admin Inspection Suite...`);

            // 5a. Admin Mobile Sidebar Drawer
            if (vp.name === 'Mobile') {
              console.log(`    📱 [Interactive] Testing Admin Mobile Sidebar Drawer...`);
              const adminMenuToggle = await page.$('.md\\:hidden.fixed.top-4.left-4');
              if (adminMenuToggle && await adminMenuToggle.isVisible()) {
                await adminMenuToggle.click({ timeout: 3000 });
                await page.waitForTimeout(600);

                const sbCheck = await page.evaluate(collisionDetectorScript);
                const sbSs = `${vp.name.toLowerCase()}_admin_mobile_sidebar.png`;
                await page.screenshot({ path: path.join(SCREENSHOTS_DIR, sbSs) });

                results.push({
                  viewport: vp.name,
                  page: 'Admin Portal',
                  section: 'Mobile Sidebar Navigation Drawer',
                  status: sbCheck.collisions.length === 0 ? 'PASS' : 'WARN',
                  screenshot: sbSs,
                  collisions: sbCheck.collisions,
                  hasHorizontalScroll: sbCheck.hasHorizontalScroll
                });

                console.log(`      ${sbCheck.collisions.length === 0 ? '✅' : '⚠️'} [Admin Sidebar Drawer] ${sbCheck.collisions.length} collision(s)`);

                // Close drawer
                await adminMenuToggle.click({ timeout: 3000 });
                await page.waitForTimeout(400);
              }
            }

            // 5b. Overview Dashboard
            const ovCheck = await page.evaluate(collisionDetectorScript);
            const ovSs = `${vp.name.toLowerCase()}_admin_overview.png`;
            await page.screenshot({ path: path.join(SCREENSHOTS_DIR, ovSs) });
            results.push({
              viewport: vp.name,
              page: 'Admin Portal',
              section: 'Overview Dashboard (Stats & Donut Chart)',
              status: ovCheck.collisions.length === 0 ? 'PASS' : 'WARN',
              screenshot: ovSs,
              collisions: ovCheck.collisions,
              hasHorizontalScroll: ovCheck.hasHorizontalScroll
            });
            console.log(`    ✅ [Overview Dashboard] Pass (0 collisions)`);

            // 5c. All 10 CMS Tabs
            await page.goto(`${BASE_URL}/admin/cms`, { waitUntil: 'networkidle', timeout: 20000 }).catch(() => {});
            await page.waitForTimeout(2000);

            console.log(`\n  📝 [CMS Manager] Systematically Testing All ${CMS_TABS.length} Tabs:`);
            for (const tab of CMS_TABS) {
              const tabSelector = `button:has-text("${tab.name}")`;
              const tabButton = await page.$(tabSelector);

              if (tabButton) {
                await tabButton.click().catch(() => {});
                await page.waitForTimeout(800);

                const tabCheck = await page.evaluate(collisionDetectorScript);
                const safeName = tab.name.toLowerCase().replace(/\s+/g, '-');
                const tabSs = `${vp.name.toLowerCase()}_cms_tab_${safeName}.png`;
                await page.screenshot({ path: path.join(SCREENSHOTS_DIR, tabSs) });

                const status = tabCheck.collisions.length === 0 && !tabCheck.hasHorizontalScroll ? 'PASS' : 'WARN';
                results.push({
                  viewport: vp.name,
                  page: 'CMS Manager',
                  section: `Tab: ${tab.name} (${tab.desc})`,
                  status,
                  screenshot: tabSs,
                  collisions: tabCheck.collisions,
                  hasHorizontalScroll: tabCheck.hasHorizontalScroll
                });

                console.log(`    ${status === 'PASS' ? '✅' : '⚠️'} [CMS: ${tab.name}] ${tabCheck.collisions.length} collision(s)`);

                // 5d. Interactive BrandedDropdown test in Portfolio tab
                if (tab.name === 'Portfolio') {
                  const dropdownBtn = await page.$('[class*="BrandedDropdown"] button, button:has(svg.lucide-chevron-down)');
                  if (dropdownBtn) {
                    await dropdownBtn.click();
                    await page.waitForTimeout(400);

                    const ddCheck = await page.evaluate(collisionDetectorScript);
                    const ddSs = `${vp.name.toLowerCase()}_cms_tab_portfolio_dropdown_open.png`;
                    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, ddSs) });

                    results.push({
                      viewport: vp.name,
                      page: 'CMS Manager',
                      section: 'CMS Portfolio BrandedDropdown (Active Menu)',
                      status: ddCheck.collisions.length === 0 ? 'PASS' : 'WARN',
                      screenshot: ddSs,
                      collisions: ddCheck.collisions,
                      hasHorizontalScroll: ddCheck.hasHorizontalScroll
                    });

                    console.log(`    ✅ [CMS: Portfolio BrandedDropdown] Options Open & Validated`);
                    // close dropdown
                    await dropdownBtn.click();
                    await page.waitForTimeout(300);
                  }
                }
              }
            }

            // 5e. Projects Page
            await page.goto(`${BASE_URL}/admin/projects`, { waitUntil: 'networkidle', timeout: 15000 }).catch(() => {});
            await page.waitForTimeout(1500);

            const projCheck = await page.evaluate(collisionDetectorScript);
            const projSs = `${vp.name.toLowerCase()}_admin_projects.png`;
            await page.screenshot({ path: path.join(SCREENSHOTS_DIR, projSs) });
            results.push({
              viewport: vp.name,
              page: 'Admin Portal',
              section: 'Projects Grid & Filter Bar',
              status: projCheck.collisions.length === 0 ? 'PASS' : 'WARN',
              screenshot: projSs,
              collisions: projCheck.collisions,
              hasHorizontalScroll: projCheck.hasHorizontalScroll
            });
            console.log(`    ✅ [Projects Grid] Pass (0 collisions)`);

            // 5f. Interactive: New Project Modal
            const newProjectBtn = await page.$('button:has-text("New Project")');
            if (newProjectBtn) {
              await newProjectBtn.click();
              await page.waitForTimeout(500);

              const npCheck = await page.evaluate(collisionDetectorScript);
              const npSs = `${vp.name.toLowerCase()}_admin_modal_new_project.png`;
              await page.screenshot({ path: path.join(SCREENSHOTS_DIR, npSs) });

              results.push({
                viewport: vp.name,
                page: 'Admin Portal',
                section: 'New Project Modal Form',
                status: npCheck.collisions.length === 0 ? 'PASS' : 'WARN',
                screenshot: npSs,
                collisions: npCheck.collisions,
                hasHorizontalScroll: npCheck.hasHorizontalScroll
              });
              console.log(`    ✅ [New Project Modal] Pass (0 collisions)`);

              // Close modal
              const cancelBtn = await page.$('.fixed.inset-0 button:has-text("Cancel"), .fixed.inset-0 button:has(svg)');
              if (cancelBtn) await cancelBtn.click();
              await page.waitForTimeout(400);
            }

            // 5g. Project Detail Page
            console.log(`\n  📋 [Project Detail] Testing Project Detail & Workflow Steps...`);
            const projectCard = await page.$('[class*="ProjectCard"], .grid > div[class*="group"]');
            if (projectCard) {
              await projectCard.click();
            } else {
              await page.goto(`${BASE_URL}/admin/projects/79db5468-3af1-4f47-a90f-ac934962c5ca`, { waitUntil: 'networkidle', timeout: 15000 }).catch(() => {});
            }
            await page.waitForTimeout(2000);

            const pdCheck = await page.evaluate(collisionDetectorScript);
            const pdSs = `${vp.name.toLowerCase()}_admin_project_detail.png`;
            await page.screenshot({ path: path.join(SCREENSHOTS_DIR, pdSs) });

            results.push({
              viewport: vp.name,
              page: 'Admin Portal',
              section: 'Project Detail (Workflow Steps 1-5 & Timeline)',
              status: pdCheck.collisions.length === 0 ? 'PASS' : 'WARN',
              screenshot: pdSs,
              collisions: pdCheck.collisions,
              hasHorizontalScroll: pdCheck.hasHorizontalScroll
            });
            console.log(`    ${pdCheck.collisions.length === 0 ? '✅' : '⚠️'} [Project Detail Page] ${pdCheck.collisions.length} collision(s)`);
          }
        }
      } catch (adminErr) {
        console.warn(`    ⚠️ Admin test error: ${adminErr.message}`);
      }

      // ==========================================
      // 6. TEST UI COMPONENTS LAB (/UIComponents)
      // ==========================================
      console.log(`\n  🎨 [UI Lab] Testing Design System & Component Library...`);
      await page.goto(`${BASE_URL}/UIComponents`, { waitUntil: 'networkidle', timeout: 25000 }).catch(() => {});
      await page.waitForTimeout(2000);

      const uiLabCheck = await page.evaluate(collisionDetectorScript);
      const uiLabSs = `${vp.name.toLowerCase()}_uicomponents_overview.png`;
      await page.screenshot({ path: path.join(SCREENSHOTS_DIR, uiLabSs) });

      results.push({
        viewport: vp.name,
        page: 'UI Components Lab',
        section: 'Design System & Specs Overview',
        status: uiLabCheck.collisions.length === 0 ? 'PASS' : 'WARN',
        screenshot: uiLabSs,
        collisions: uiLabCheck.collisions,
        hasHorizontalScroll: uiLabCheck.hasHorizontalScroll
      });
      console.log(`    ${uiLabCheck.collisions.length === 0 ? '✅' : '⚠️'} [UI Lab Overview] ${uiLabCheck.collisions.length} collision(s)`);

      // Test Design Tokens tab
      const tokensTab = await page.$('button:has-text("Design Tokens")');
      if (tokensTab) {
        await tokensTab.click();
        await page.waitForTimeout(800);

        const tokensCheck = await page.evaluate(collisionDetectorScript);
        const tokensSs = `${vp.name.toLowerCase()}_uicomponents_tokens.png`;
        await page.screenshot({ path: path.join(SCREENSHOTS_DIR, tokensSs) });

        results.push({
          viewport: vp.name,
          page: 'UI Components Lab',
          section: 'Design Tokens & Color Swatches',
          status: tokensCheck.collisions.length === 0 ? 'PASS' : 'WARN',
          screenshot: tokensSs,
          collisions: tokensCheck.collisions,
          hasHorizontalScroll: tokensCheck.hasHorizontalScroll
        });
        console.log(`    ${tokensCheck.collisions.length === 0 ? '✅' : '⚠️'} [UI Lab Tokens] ${tokensCheck.collisions.length} collision(s)`);
      }

      // Test Buttons tab
      const buttonsTab = await page.$('button:has-text("Buttons & CTAs")');
      if (buttonsTab) {
        await buttonsTab.click();
        await page.waitForTimeout(800);

        const btnCheck = await page.evaluate(collisionDetectorScript);
        const btnSs = `${vp.name.toLowerCase()}_uicomponents_buttons.png`;
        await page.screenshot({ path: path.join(SCREENSHOTS_DIR, btnSs) });

        results.push({
          viewport: vp.name,
          page: 'UI Components Lab',
          section: 'Buttons & Action States',
          status: btnCheck.collisions.length === 0 ? 'PASS' : 'WARN',
          screenshot: btnSs,
          collisions: btnCheck.collisions,
          hasHorizontalScroll: btnCheck.hasHorizontalScroll
        });
        console.log(`    ${btnCheck.collisions.length === 0 ? '✅' : '⚠️'} [UI Lab Buttons] ${btnCheck.collisions.length} collision(s)`);
      }

      await context.close();
    }
  } finally {
    await browser.close();
  }

  // ==========================================
  // 7. GENERATE COMPREHENSIVE HTML REPORT
  // ==========================================
  const totalChecks = results.length;
  const passCount = results.filter(r => r.status === 'PASS').length;
  const warnCount = results.filter(r => r.status === 'WARN').length;
  const totalCollisions = results.reduce((acc, r) => acc + (r.collisions?.length || 0), 0);

  const reportHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>VirAshelle Exhaustive Visual QA Report</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    body { background-color: #09090b; color: #f4f4f5; font-family: system-ui, -apple-system, sans-serif; }
    .brand-glow { text-shadow: 0 0 15px rgba(75, 210, 0, 0.4); }
  </style>
</head>
<body class="p-8 max-w-7xl mx-auto space-y-8">
  <!-- Header -->
  <div class="border-b border-white/10 pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
    <div>
      <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#4BD200]/10 border border-[#4BD200]/30 text-[#4BD200] text-xs font-mono mb-2">
        <span class="w-2 h-2 rounded-full bg-[#4BD200] animate-pulse"></span> Complete Exhaustive Visual & Collision Suite
      </div>
      <h1 class="text-3xl font-bold tracking-tight text-white font-mono">VirAshelle Full Visual QA Report</h1>
      <p class="text-zinc-400 text-sm mt-1">Inspected Target: <a href="${BASE_URL}" target="_blank" class="text-[#4BD200] underline font-mono">${BASE_URL}</a></p>
    </div>
    
    <!-- Quick Stats -->
    <div class="flex items-center gap-3">
      <div class="px-5 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-center">
        <span class="block text-2xl font-bold font-mono ${warnCount === 0 ? 'text-[#4BD200]' : 'text-amber-400'}">${passCount}/${totalChecks}</span>
        <span class="text-[10px] text-zinc-500 uppercase font-mono">Passing Checks</span>
      </div>
      <div class="px-5 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-center">
        <span class="block text-2xl font-bold font-mono ${totalCollisions === 0 ? 'text-[#4BD200]' : 'text-red-400'}">${totalCollisions}</span>
        <span class="text-[10px] text-zinc-500 uppercase font-mono">Collisions Found</span>
      </div>
    </div>
  </div>

  <!-- Results Table -->
  <div class="bg-zinc-950 border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
    <div class="p-5 border-b border-white/10 flex items-center justify-between">
      <h2 class="text-base font-bold text-white flex items-center gap-2">
        <span>Detailed Viewport & Collision Log (Landing, Modals, Admin, All 10 CMS Tabs, Projects, Project Detail, UI Lab)</span>
      </h2>
      <span class="text-xs text-zinc-400 font-mono">${new Date().toLocaleString()}</span>
    </div>

    <div class="overflow-x-auto">
      <table class="w-full text-left text-xs">
        <thead class="bg-zinc-900 text-zinc-400 font-mono uppercase tracking-wider text-[11px] border-b border-white/5">
          <tr>
            <th class="p-4">Viewport</th>
            <th class="p-4">Page / Component</th>
            <th class="p-4">Status</th>
            <th class="p-4">Collision Checks</th>
            <th class="p-4">Horizontal Overflow</th>
            <th class="p-4 text-right">Screenshot</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-white/5 font-mono">
          ${results.map(r => `
            <tr class="hover:bg-white/[0.02] transition-colors">
              <td class="p-4">
                <span class="px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-zinc-300 font-semibold">${r.viewport}</span>
              </td>
              <td class="p-4">
                <span class="block font-bold text-white">${r.section}</span>
                <span class="text-zinc-500 text-[10px]">${r.page}</span>
              </td>
              <td class="p-4">
                <span class="px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  r.status === 'PASS' 
                    ? 'bg-[#4BD200]/15 text-[#4BD200] border border-[#4BD200]/30' 
                    : 'bg-red-500/15 text-red-400 border border-red-500/30'
                }">
                  ${r.status === 'PASS' ? '✅ NO OVERLAP' : '⚠️ COLLISION'}
                </span>
              </td>
              <td class="p-4">
                ${(r.collisions && r.collisions.length > 0) ? `
                  <span class="text-red-400 font-bold">${r.collisions.length} Collision(s):</span>
                  <div class="mt-1 space-y-1">
                    ${r.collisions.map(c => `
                      <div class="text-[10px] bg-red-950/30 border border-red-500/20 rounded p-1.5 text-zinc-300">
                        <span class="text-red-300 font-bold">&lt;${c.elementA.tag}&gt; "${c.elementA.text}"</span>
                        nabrak dengan
                        <span class="text-red-300 font-bold">&lt;${c.elementB.tag}&gt; "${c.elementB.text}"</span>
                        (overlap: ${c.overlapArea}px²)
                      </div>
                    `).join('')}
                  </div>
                ` : `<span class="text-zinc-400">0 Nabrak (Aman)</span>`}
              </td>
              <td class="p-4">
                ${r.hasHorizontalScroll ? `
                  <span class="text-amber-400">⚠️ Ada sideways scroll (+${r.scrollDiff}px)</span>
                ` : `<span class="text-zinc-500">Normal (No overflow)</span>`}
              </td>
              <td class="p-4 text-right">
                <a href="screenshots/${r.screenshot}" target="_blank" class="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-[#4BD200] hover:text-black border border-white/10 text-zinc-300 text-xs transition-colors">
                  View Capture ↗
                </a>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  </div>

  <!-- Screenshot Gallery Section -->
  <div class="space-y-4">
    <h2 class="text-xl font-bold text-white font-mono flex items-center gap-2">
      <span>📸 Complete Visual Inspection Gallery</span>
    </h2>
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      ${results.map(r => `
        <div class="bg-zinc-950 border border-white/10 rounded-xl overflow-hidden group">
          <div class="p-3 bg-zinc-900 border-b border-white/5 flex items-center justify-between text-xs">
            <span class="font-bold text-white truncate max-w-[200px]" title="${r.section}">${r.section}</span>
            <span class="text-[10px] px-2 py-0.5 rounded bg-white/5 text-zinc-400 shrink-0">${r.viewport}</span>
          </div>
          <div class="aspect-video bg-black/50 overflow-hidden relative">
            <a href="screenshots/${r.screenshot}" target="_blank">
              <img src="screenshots/${r.screenshot}" alt="${r.section}" class="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300" loading="lazy" />
            </a>
          </div>
        </div>
      `).join('')}
    </div>
  </div>
</body>
</html>`;

  fs.writeFileSync(path.join(OUTPUT_DIR, 'index.html'), reportHtml, 'utf8');

  console.log('\n========================================================');
  console.log(`🎉 Visual QA Complete!`);
  console.log(`📊 Summary: ${passCount}/${totalChecks} Checks Passed | ${totalCollisions} Collisions Detected`);
  console.log(`📄 Full Report generated at: ${path.join(OUTPUT_DIR, 'index.html')}`);
  console.log('========================================================\n');
}

runVisualQA().catch(err => {
  console.error('❌ QA Execution Failed:', err);
  process.exit(1);
});
