# Bistro Ana — Cuisine & Catering

## Project Overview
- **Name**: Bistro Ana Cuisine & Catering
- **Goal**: Premium catering business website with a high-end aesthetic
- **Cloudflare Project Name**: `bistroana-cuisine`
- **GitHub Repo Name**: `bistroana-website`

## Pages & Routes
| Route | Description |
|-------|-------------|
| `/` | Homepage — hero, about, services, menu preview, testimonials, CTA |
| `/menu` | Full menu with tabbed categories (Starters, Mains, Desserts, Beverages) |
| `/catering` | Catering services, 3-tier packages, dietary accommodations, FAQ |
| `/gallery` | Masonry image gallery with lightbox viewer |
| `/contact` | Booking inquiry form with server-side validation |
| `/api/contact` | POST endpoint — validates and acknowledges inquiries |

## Design System
- **Typography**: Cormorant Garamond (display/serif) + Inter (body/UI)
- **Color Palette**: Cream `#faf6f0` · Gold `#c9a84c` · Espresso `#1a0a00` · Mocha `#5c3d2e`
- **UI Patterns**: Scroll-reveal animations, tabbed menus, masonry gallery, lightbox, FAQ accordions
- **Icons**: Font Awesome 6.5

## Architecture
```
src/index.tsx   — Hono app: all routes, HTML generation, API endpoint
wrangler.jsonc  — Cloudflare Pages config (project: bistroana-cuisine)
ecosystem.config.cjs — PM2 config for local development
public/static/  — Static assets (served at /static/*)
dist/           — Built output (gitignored)
```

## Security Audit (Production-Ready)
- ✅ No hardcoded API keys or secrets
- ✅ Server-side validation on all API endpoints (`/api/contact`)
- ✅ Security headers via Hono `secureHeaders()`: HSTS, X-Frame-Options, X-Content-Type-Options
- ✅ Honeypot field for bot-trap spam prevention
- ✅ Input sanitization and type validation
- ✅ Contact API key (RESEND_API_KEY etc.) loaded via `c.env` — never client-exposed
- ✅ 404 custom handler
- ✅ No `any` TypeScript casts

## Local Development
```bash
npm run build              # Build for Cloudflare Pages
pm2 start ecosystem.config.cjs  # Start local dev server on :3000
pm2 logs bistroana --nostream   # Check logs
```

## Deployment

### Cloudflare Pages
```bash
# After entering CF API token in Deploy panel:
npx wrangler pages project create bistroana-cuisine --production-branch main
npx wrangler pages deploy dist --project-name bistroana-cuisine
```

### GitHub Push
```bash
git remote add origin https://github.com/USERNAME/bistroana-website.git
git push -f origin main
```

## Production URLs
- **Cloudflare**: https://bistroana-cuisine.pages.dev (after deploy)
- **GitHub**: https://github.com/USERNAME/bistroana-website

## Tech Stack
- **Framework**: Hono 4.x (TypeScript)
- **Build**: Vite + @hono/vite-build
- **Runtime**: Cloudflare Pages (edge)
- **Fonts**: Google Fonts (Cormorant Garamond, Inter)
- **Icons**: Font Awesome 6.5 CDN
- **Dev Server**: Wrangler Pages Dev + PM2

## Status
- ✅ All 5 pages built and verified (HTTP 200)
- ✅ API validation tested (server-side + client-side)
- ✅ Security headers confirmed
- ✅ Mobile-responsive navigation
- ⏳ Awaiting: GitHub token → push to bistroana-website
- ⏳ Awaiting: Cloudflare token → deploy to bistroana-cuisine.pages.dev
