# Plan: Mobile Performance & Smoothness Optimization [gemini] (Completed)

## Goal
Optimize mobile rendering performance, reduce memory footprint, and achieve smooth 60fps scrolling on mobile devices (Android & iOS).

## Identified Bottlenecks & Fixes
1. **GlobalBackground**:
   - Turn off continuous JS `motion.div` infinite transforms on the 280vw `Supergraphic` SVG on mobile (keep it static or fixed).
   - Disable `DataNode` infinite moving particle animations on mobile to save GPU/CPU cycles.
2. **Services Auto-Scroller**:
   - Remove `<video preload="metadata">` elements inside marquee cards entirely. Replace missing video thumbnails with lightweight CSS/SVG posters so mobile devices don't spin up dozens of hardware video decoder contexts.
   - On mobile, adapt marquee card width from 280px to 220px and limit items per row to prevent hundreds of simultaneous off-screen DOM nodes.
   - Use `IntersectionObserver` to pause all marquee animations when `Services` is out of the viewport.
   - Add `content-visibility: auto` to cards for deferred layout and zero off-screen paint cost.
3. **CSS & Hardware Acceleration**:
   - Upgrade marquee keyframes in `src/index.css` to GPU-accelerated `translate3d(..., 0, 0)`.
   - Separate `.service-marquee-track` from `.marquee-track` to avoid animation collisions.
   - Disable expensive `backdrop-filter: blur(...)` on mobile moving elements (e.g. Clients marquee badges) and use clean semi-translucent rgba backgrounds instead.

## Work Steps
1. [x] Update `src/components/GlobalBackground.tsx` to disable JS motion transforms & particles on mobile.
2. [x] Update `src/components/Services.tsx` with lightweight poster fallbacks (no `<video>` in marquee), viewport-aware auto-pause, and mobile-optimized track sizes.
3. [x] Update `src/index.css` with 3D hardware-accelerated transforms, dedicated track classes, and mobile-friendly glass styling.
4. [x] Build via `npm run build` and run Playwright QA to verify zero visual regressions and smooth rendering.
5. [x] Deploy to Firebase Hosting and test on mobile emulator.

---

# Plan: WhatsApp & Social CDN Cache Busting [gemini] (Completed)

## Goal
Resolve WhatsApp client-side and CDN proxy cache that serves the old banner image:
1. Rename image to `public/og-hero.jpg` and keep `public/og-image.jpg` as sync.
2. Update `index.html` with cache-busted URL `https://virashelle-page.web.app/og-hero.jpg?v=2` for all meta tags.
3. Configure `firebase.json` headers to disable caching for HTML and ensure immediate cache revalidation on Firebase CDN.
4. Build, deploy, verify live headers and status.
5. Provide user clear testing steps (e.g., using `?v=2` or fresh link on WA).

## Work Steps
1. [x] Copy `public/og-image.jpg` to `public/og-hero.jpg` and update generator output.
2. [x] Update `index.html` with `https://virashelle-page.web.app/og-hero.jpg?v=2`.
3. [x] Add `headers` configuration in `firebase.json` for `no-cache` on `index.html`.
4. [x] Run `npm run build` and deploy to Firebase Hosting.
5. [x] Verify live headers and image availability.

---

# Plan: Redesign OpenGraph Banner with Hero Visual & Big White Logo [gemini] (Completed)

## Goal
Redesign the WhatsApp/social preview banner (`public/og-image.jpg`) to exactly match the Hero visual aesthetic requested by the user:
- Left side: Big, prominent white VirAshelle vector logo (`logo putih gede`)
- Right side: Hero visual block
  - Overline: `— CREATIVE STUDIO`
  - Headline: `WE` (white) \n `ARCHITECT` (brand green `#4BD200`) \n `IDENTITY.` (white)
  - Subtitle: `We don't just design. We engineer digital experiences that dominate the tactical space.`
  - Button pill: `Launch Project >` in vibrant brand green
- Background: Pitch black with tactical stealth Supergraphic pattern and ambient glow.
- Output: Standard OpenGraph 1200x630 JPEG under 300KB for instant WhatsApp loading.

## Work Steps
1. [x] Update `scripts/generate-og-image.mjs` with two-column split layout (Big white logo on left, Hero headline and CTA on right, Supergraphic background).
2. [x] Render and export `public/og-image.jpg` using Playwright.
3. [x] Verify generated image visual quality and file size (< 300 KB).
4. [x] Build via `npm run build` and deploy to Firebase Hosting (`firebase deploy --only hosting`).
5. [x] Run crawler QA to verify live serving.

---

# Plan: Static OpenGraph & Rich Social Preview Optimization [gemini] (Completed)

## Goal
Fix CSR crawler blank preview issue for WhatsApp, Telegram, Email, and social platforms by providing static OpenGraph meta tags, Twitter card tags, and a studio-grade 1200x630 OpenGraph image (`og-image.jpg`) in `index.html`.

## Work Steps
1. [x] **Design & Generate OG Image (`public/og-image.jpg`)**:
   - Create a 1200x630 banner with dark luxury theme, brand green `#4BD200` glowing accents, authentic VirAshelle vector geometry, elegant typography, and service tags.
   - Render via Playwright Chromium and export as crisp, optimized JPEG (< 200 KB) compliant with WhatsApp's 300 KB limit.
2. [x] **Implement Static OpenGraph Meta in `index.html`**:
   - Add absolute URL `og:image`, `og:image:secure_url`, `og:image:width`, `og:image:height`, `og:image:type`, `og:title`, `og:description`, `og:url`, `og:site_name`, `og:locale`.
   - Add Twitter card tags (`summary_large_image`, title, description, image).
   - Add fallback `<link rel="image_src">` for older SMS/email scrapers.
   - Refine title and description copy according to anti-slop guidelines (luxurious, punchy, professional, no fluff).
3. [x] **Build & Verify Packaging**:
   - Run `npm run build` to ensure `dist/og-image.jpg` and `dist/index.html` are correctly packaged.
4. [x] **Deploy & Live Crawler QA**:
   - Deploy to Firebase Hosting (`firebase deploy --only hosting`).
   - Run Playwright test simulating WhatsApp, Facebook, and Twitter bot user agents against live URL `https://virashelle-page.web.app/` to verify headers, meta tags, and image reachability.

---

# Plan: Compress & Upload Portfolio Media to CMS

## Current Goal / Task
Compress all 92 media files (3.5 GB total) from the `PORTOFOLIO` folder and upload them to the CMS portfolio section via Supabase Storage, categorized correctly.

## File Inventory

### By Category
| Folder | CMS Category | Files | Size | Types |
|--------|-------------|-------|------|-------|
| 3D | 3D PRODUCTION | 57 | 503 MB | 54 PNG, 1 JPG, 2 MP4 |
| Graphic Design | GRAPHIC DESIGN | 6 | 8 MB | 6 PNG |
| Motion Graphic | MOTION GRAPHIC | 14 | 1841 MB | 1 MOV, 13 MP4 |
| Video Editing | VIDEO EDITING | 15 | 1172 MB | 15 MP4 |

### Size Challenges
- Upload limit: 100 MB per file
- Files over 100 MB (need heavy compression or link-based approach):
  - `bumper jadi.mp4` (1159 MB), `revisi0023.mp4` (470 MB)
  - `Guido Reyhan - Egoisme.mp4` (122 MB), `3. With BenQ...` (114 MB)
  - `5- eye care U download...` (109 MB), `opening.mp4` (102 MB)
  - `6- W4100i...` (97 MB), `prv 002.mp4` (87 MB)
  - Many more between 50-100 MB

## File Check & Audit List

- [x] `PORTOFOLIO/` : Inventory all files, sizes, types
- [x] `src/admin/pages/CmsPage.tsx` : Understand portfolio form structure
- [x] `src/admin/components/MediaUploader.tsx` : Upload flow (R2 or Supabase)
- [x] `src/lib/useCms.ts` : Portfolio item schema
- [x] `workers/media-uploader/src/index.ts` : R2 worker limits
- [x] `.env` : Check active upload path (no R2 worker URL, uses Supabase)
- [x] Install FFmpeg via winget
- [x] Install sharp as dev dependency
- [x] Build compression script
- [x] Run compression (83/92 files compressed, 100% of 3D, Graphic Design, Motion Graphic)
- [x] Build upload script (high performance direct Cloudflare REST API)
- [x] Run upload (all 83 compressed items uploaded directly to Cloudflare R2 bucket)
- [x] Create CMD runner `kompres-sisanya.bat` for remaining 9 files
- [x] Update CMS (`CmsPage.tsx`) with 1-click import button and generated catalog
- [x] Pull latest git updates from GitHub remote (`origin/main`)

## Implementation Plan

### Step 1: Install Tools
- `winget install Gyan.FFmpeg` for video compression
- `npm install --save-dev sharp` for image compression

### Step 2: Compression Strategy

**Images (PNG/JPG):**
- Tool: `sharp` (Node.js)
- Convert PNG to WebP (90% smaller with comparable quality)
- Max dimension: 1920px (sufficient for web display)
- Quality: WebP quality 82 (good balance)
- Expected result: 68 MB PNG -> ~1-3 MB WebP

**Videos (MP4/MOV):**
- Tool: FFmpeg
- Codec: H.264 (libx264), universal browser support
- CRF: 23 (good quality) for files under 100MB source, CRF 28 for very large files
- Audio: AAC 128k
- Max resolution: 1080p
- Preset: medium (balance speed/quality)
- Expected result: most files well under 100 MB

### Step 3: Upload Directly to Cloudflare R2
- Tool: `wrangler r2 object put` (direct R2 upload, no 100MB worker limit)
- Bucket: `virashelle-media`
- Key pattern: `portfolio/{timestamp}-{sanitized_name}`
- Public URL base: `https://pub-c61e4e9a5dfd40a899f95b4314976ee8.r2.dev`
- Content-Type set correctly for each file (image/webp, video/mp4)

### Step 4: Update CMS Portfolio Items
- PATCH `site_content.portfolio` via Supabase REST API
- Map folder names to CMS categories
- Set correct `type` ('image' or 'video')
- Generate clean titles from filenames
- Merge with existing items (remove placeholders)

## Category Mapping
| Folder | CMS Category |
|--------|-------------|
| 3D | 3D PRODUCTION |
| Graphic Design | GRAPHIC DESIGN |
| Motion Graphic | MOTION GRAPHIC |
| Video Editing | VIDEO EDITING |

## Verification Steps
- [ ] All compressed files are under 100 MB
- [ ] All files upload successfully to Supabase Storage
- [ ] Portfolio items appear in CMS > Karya section with correct categories
- [ ] Images and videos display correctly on the landing page
