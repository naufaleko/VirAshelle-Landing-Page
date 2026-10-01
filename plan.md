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
