import { Hono } from 'hono'
import { serveStatic } from 'hono/cloudflare-workers'
import { secureHeaders } from 'hono/secure-headers'
import { logger } from 'hono/logger'

const app = new Hono()

// Security headers — applied to all routes
app.use('*', secureHeaders())
app.use('*', logger())

// Static assets
app.use('/static/*', serveStatic({ root: './' }))

/* ─── Pages ─── */

app.get('/', (c) => {
  return c.html(homePage())
})

app.get('/menu', (c) => {
  return c.html(menuPage())
})

app.get('/catering', (c) => {
  return c.html(cateringPage())
})

app.get('/gallery', (c) => {
  return c.html(galleryPage())
})

app.get('/contact', (c) => {
  return c.html(contactPage())
})

/* ─── API: Contact form (server-side, no secrets exposed) ─── */
app.post('/api/contact', async (c) => {
  try {
    const body = await c.req.json<{
      name: string
      email: string
      phone: string
      eventType: string
      eventDate: string
      guestCount: string
      message: string
    }>()

    // Server-side validation
    if (!body.name || typeof body.name !== 'string' || body.name.trim().length < 2) {
      return c.json({ error: 'Valid name is required' }, 400)
    }
    if (!body.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) {
      return c.json({ error: 'Valid email is required' }, 400)
    }
    if (!body.message || body.message.trim().length < 10) {
      return c.json({ error: 'Message must be at least 10 characters' }, 400)
    }

    // In production: integrate email service (e.g. Resend via env var API key)
    // const resendApiKey = c.env?.RESEND_API_KEY  — never hardcoded
    // For now: acknowledge receipt
    return c.json({
      success: true,
      message: 'Thank you! We will be in touch within 24 hours.',
    })
  } catch {
    return c.json({ error: 'Invalid request body' }, 400)
  }
})

/* ─── 404 ─── */
app.notFound((c) => {
  return c.html(notFoundPage(), 404)
})

/* ════════════════════════════════════════════════════
   SHARED LAYOUT
════════════════════════════════════════════════════ */
function layout(title: string, content: string, activePage: string = ''): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="description" content="Bistro Ana — Exquisite catering for weddings, corporate events, and private gatherings. Locally sourced, chef-crafted cuisine delivered with elegance." />
  <meta name="theme-color" content="#1a0a00" />
  <title>${title} | Bistro Ana</title>

  <!-- Preconnect -->
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />

  <!-- Fonts: Cormorant Garamond (display) + Inter (body) -->
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400;1,600&family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet" />

  <!-- Icons -->
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.5.1/css/all.min.css" />

  <style>
    /* ── Reset & Tokens ── */
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    :root {
      --cream:       #faf6f0;
      --cream-dark:  #f2ebe0;
      --parchment:   #e8ddd0;
      --gold:        #c9a84c;
      --gold-light:  #e0c068;
      --gold-dark:   #a67c2e;
      --espresso:    #1a0a00;
      --espresso-mid:#2d1a0a;
      --mocha:       #5c3d2e;
      --sage:        #7a8c6e;
      --charcoal:    #2c2c2c;
      --white:       #ffffff;
      --shadow-sm:   0 2px 8px rgba(26,10,0,.08);
      --shadow-md:   0 8px 32px rgba(26,10,0,.12);
      --shadow-lg:   0 20px 60px rgba(26,10,0,.18);
      --radius:      4px;
      --radius-lg:   12px;
      --transition:  all .3s cubic-bezier(.4,0,.2,1);
    }

    html { scroll-behavior: smooth; }

    body {
      font-family: 'Inter', sans-serif;
      background: var(--cream);
      color: var(--charcoal);
      line-height: 1.6;
      overflow-x: hidden;
    }

    /* ── Typography ── */
    h1,h2,h3,h4,h5,h6 {
      font-family: 'Cormorant Garamond', serif;
      line-height: 1.15;
      color: var(--espresso);
    }

    /* ── Utilities ── */
    .container { width: 100%; max-width: 1200px; margin: 0 auto; padding: 0 24px; }
    .text-gold { color: var(--gold); }
    .text-center { text-align: center; }
    .sr-only { position: absolute; width:1px; height:1px; overflow:hidden; clip:rect(0,0,0,0); white-space:nowrap; }

    /* ── Buttons ── */
    .btn {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 14px 32px;
      border-radius: var(--radius);
      font-family: 'Inter', sans-serif;
      font-size: .875rem;
      font-weight: 500;
      letter-spacing: .08em;
      text-transform: uppercase;
      cursor: pointer;
      transition: var(--transition);
      text-decoration: none;
      border: 2px solid transparent;
    }
    .btn-primary {
      background: var(--gold);
      color: var(--espresso);
      border-color: var(--gold);
    }
    .btn-primary:hover {
      background: var(--gold-dark);
      border-color: var(--gold-dark);
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(201,168,76,.35);
    }
    .btn-outline {
      background: transparent;
      color: var(--white);
      border-color: rgba(255,255,255,.6);
    }
    .btn-outline:hover {
      background: var(--white);
      color: var(--espresso);
      border-color: var(--white);
    }
    .btn-outline-dark {
      background: transparent;
      color: var(--espresso);
      border-color: var(--espresso);
    }
    .btn-outline-dark:hover {
      background: var(--espresso);
      color: var(--white);
    }

    /* ── Section Labels ── */
    .section-label {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      font-family: 'Inter', sans-serif;
      font-size: .75rem;
      font-weight: 600;
      letter-spacing: .2em;
      text-transform: uppercase;
      color: var(--gold);
      margin-bottom: 16px;
    }
    .section-label::before,
    .section-label::after {
      content: '';
      display: inline-block;
      width: 28px;
      height: 1px;
      background: var(--gold);
    }

    /* ── Dividers ── */
    .ornament {
      display: flex;
      align-items: center;
      gap: 12px;
      justify-content: center;
      margin: 16px 0;
    }
    .ornament-line { flex: 1; max-width: 80px; height: 1px; background: var(--gold); opacity: .5; }
    .ornament-diamond {
      width: 8px; height: 8px;
      background: var(--gold);
      transform: rotate(45deg);
    }

    /* ── Navigation ── */
    #navbar {
      position: fixed;
      top: 0; left: 0; right: 0;
      z-index: 1000;
      transition: var(--transition);
      padding: 20px 0;
    }
    #navbar.scrolled {
      background: rgba(26,10,0,.96);
      backdrop-filter: blur(12px);
      padding: 14px 0;
      box-shadow: 0 4px 20px rgba(0,0,0,.3);
    }
    .nav-inner {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .nav-logo {
      text-decoration: none;
      display: flex;
      flex-direction: column;
      line-height: 1;
    }
    .nav-logo-main {
      font-family: 'Cormorant Garamond', serif;
      font-size: 1.75rem;
      font-weight: 600;
      color: var(--white);
      letter-spacing: .04em;
    }
    .nav-logo-sub {
      font-family: 'Inter', sans-serif;
      font-size: .6rem;
      font-weight: 600;
      letter-spacing: .25em;
      text-transform: uppercase;
      color: var(--gold);
    }
    .nav-links {
      display: flex;
      align-items: center;
      gap: 36px;
      list-style: none;
    }
    .nav-links a {
      font-family: 'Inter', sans-serif;
      font-size: .8rem;
      font-weight: 500;
      letter-spacing: .12em;
      text-transform: uppercase;
      color: rgba(255,255,255,.8);
      text-decoration: none;
      position: relative;
      transition: var(--transition);
      padding-bottom: 4px;
    }
    .nav-links a::after {
      content: '';
      position: absolute;
      bottom: 0; left: 0;
      width: 0; height: 1px;
      background: var(--gold);
      transition: width .3s ease;
    }
    .nav-links a:hover,
    .nav-links a.active { color: var(--white); }
    .nav-links a:hover::after,
    .nav-links a.active::after { width: 100%; }
    .nav-cta {
      padding: 10px 24px !important;
      font-size: .75rem !important;
    }
    #nav-toggle {
      display: none;
      flex-direction: column;
      gap: 5px;
      background: none;
      border: none;
      cursor: pointer;
      padding: 4px;
      z-index: 1001;
    }
    #nav-toggle span {
      display: block;
      width: 24px;
      height: 2px;
      background: var(--white);
      transition: var(--transition);
      transform-origin: center;
    }
    #nav-toggle.open span:nth-child(1) { transform: translateY(7px) rotate(45deg); }
    #nav-toggle.open span:nth-child(2) { opacity: 0; }
    #nav-toggle.open span:nth-child(3) { transform: translateY(-7px) rotate(-45deg); }

    /* Mobile Nav */
    @media (max-width: 860px) {
      #nav-toggle { display: flex; }
      .nav-links {
        position: fixed;
        top: 0; right: -100%;
        width: min(320px, 85vw);
        height: 100vh;
        background: var(--espresso);
        flex-direction: column;
        align-items: flex-start;
        justify-content: center;
        gap: 28px;
        padding: 40px 40px;
        transition: right .4s cubic-bezier(.4,0,.2,1);
        box-shadow: -8px 0 40px rgba(0,0,0,.4);
      }
      .nav-links.open { right: 0; }
      .nav-links a { font-size: 1rem; letter-spacing: .15em; }
    }

    /* ── Footer ── */
    footer {
      background: var(--espresso);
      color: rgba(255,255,255,.7);
      padding: 72px 0 32px;
    }
    .footer-grid {
      display: grid;
      grid-template-columns: 2fr 1fr 1fr 1.5fr;
      gap: 48px;
      padding-bottom: 48px;
      border-bottom: 1px solid rgba(255,255,255,.1);
    }
    .footer-brand p {
      font-size: .875rem;
      line-height: 1.8;
      margin-top: 16px;
      max-width: 280px;
    }
    .footer-social {
      display: flex;
      gap: 12px;
      margin-top: 24px;
    }
    .footer-social a {
      width: 38px; height: 38px;
      border-radius: 50%;
      border: 1px solid rgba(255,255,255,.2);
      display: flex; align-items: center; justify-content: center;
      color: rgba(255,255,255,.6);
      text-decoration: none;
      transition: var(--transition);
      font-size: .85rem;
    }
    .footer-social a:hover {
      border-color: var(--gold);
      color: var(--gold);
      transform: translateY(-2px);
    }
    .footer-col h4 {
      font-family: 'Inter', sans-serif;
      font-size: .7rem;
      font-weight: 600;
      letter-spacing: .2em;
      text-transform: uppercase;
      color: var(--gold);
      margin-bottom: 20px;
    }
    .footer-links { list-style: none; }
    .footer-links li { margin-bottom: 10px; }
    .footer-links a {
      color: rgba(255,255,255,.6);
      text-decoration: none;
      font-size: .875rem;
      transition: var(--transition);
    }
    .footer-links a:hover { color: var(--white); padding-left: 4px; }
    .footer-contact-item {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      margin-bottom: 14px;
      font-size: .875rem;
    }
    .footer-contact-item i { color: var(--gold); margin-top: 3px; min-width: 16px; }
    .footer-bottom {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding-top: 32px;
      font-size: .8rem;
    }
    .footer-bottom a { color: rgba(255,255,255,.5); text-decoration: none; }
    .footer-bottom a:hover { color: var(--gold); }

    @media (max-width: 960px) {
      .footer-grid { grid-template-columns: 1fr 1fr; gap: 36px; }
    }
    @media (max-width: 560px) {
      .footer-grid { grid-template-columns: 1fr; }
      .footer-bottom { flex-direction: column; gap: 12px; text-align: center; }
    }

    /* ── Page Hero (inner pages) ── */
    .page-hero {
      height: 420px;
      background: var(--espresso);
      display: flex;
      align-items: center;
      justify-content: center;
      text-align: center;
      position: relative;
      overflow: hidden;
    }
    .page-hero-bg {
      position: absolute; inset: 0;
      background-size: cover;
      background-position: center;
      opacity: .25;
    }
    .page-hero-content { position: relative; z-index: 1; }
    .page-hero h1 {
      font-size: clamp(2.5rem, 6vw, 4.5rem);
      color: var(--white);
      font-weight: 300;
    }
    .page-hero h1 em { font-style: italic; color: var(--gold); }
    .page-hero p {
      color: rgba(255,255,255,.75);
      font-size: 1.1rem;
      margin-top: 12px;
      font-family: 'Cormorant Garamond', serif;
      font-style: italic;
    }

    /* ── Scroll animation ── */
    .reveal {
      opacity: 0;
      transform: translateY(30px);
      transition: opacity .7s ease, transform .7s ease;
    }
    .reveal.visible {
      opacity: 1;
      transform: none;
    }
    .reveal-delay-1 { transition-delay: .1s; }
    .reveal-delay-2 { transition-delay: .2s; }
    .reveal-delay-3 { transition-delay: .3s; }
    .reveal-delay-4 { transition-delay: .4s; }
  </style>
</head>
<body>

<!-- ── Navigation ── -->
<nav id="navbar" role="navigation" aria-label="Main navigation">
  <div class="container">
    <div class="nav-inner">
      <a href="/" class="nav-logo" aria-label="Bistro Ana Home">
        <span class="nav-logo-main">Bistro Ana</span>
        <span class="nav-logo-sub">Cuisine & Catering</span>
      </a>

      <button id="nav-toggle" aria-expanded="false" aria-controls="nav-menu" aria-label="Toggle navigation">
        <span></span><span></span><span></span>
      </button>

      <ul class="nav-links" id="nav-menu" role="list">
        <li><a href="/" class="${activePage === 'home' ? 'active' : ''}">Home</a></li>
        <li><a href="/menu" class="${activePage === 'menu' ? 'active' : ''}">Menu</a></li>
        <li><a href="/catering" class="${activePage === 'catering' ? 'active' : ''}">Catering</a></li>
        <li><a href="/gallery" class="${activePage === 'gallery' ? 'active' : ''}">Gallery</a></li>
        <li><a href="/contact" class="btn btn-primary nav-cta">Book an Event</a></li>
      </ul>
    </div>
  </div>
</nav>

<!-- ── Page Content ── -->
${content}

<!-- ── Footer ── -->
<footer>
  <div class="container">
    <div class="footer-grid">
      <div class="footer-brand">
        <a href="/" style="text-decoration:none">
          <span style="font-family:'Cormorant Garamond',serif;font-size:2rem;font-weight:600;color:#fff;letter-spacing:.04em">Bistro Ana</span>
        </a>
        <p>Crafting unforgettable culinary experiences for weddings, corporate events, and intimate gatherings since 2012. Every detail, every flavor, every moment — curated with intention.</p>
        <div class="footer-social">
          <a href="#" aria-label="Instagram"><i class="fab fa-instagram"></i></a>
          <a href="#" aria-label="Facebook"><i class="fab fa-facebook-f"></i></a>
          <a href="#" aria-label="Pinterest"><i class="fab fa-pinterest-p"></i></a>
          <a href="#" aria-label="LinkedIn"><i class="fab fa-linkedin-in"></i></a>
        </div>
      </div>

      <div class="footer-col">
        <h4>Navigate</h4>
        <ul class="footer-links">
          <li><a href="/">Home</a></li>
          <li><a href="/menu">Our Menu</a></li>
          <li><a href="/catering">Catering Services</a></li>
          <li><a href="/gallery">Gallery</a></li>
          <li><a href="/contact">Contact Us</a></li>
        </ul>
      </div>

      <div class="footer-col">
        <h4>Services</h4>
        <ul class="footer-links">
          <li><a href="/catering">Wedding Catering</a></li>
          <li><a href="/catering">Corporate Events</a></li>
          <li><a href="/catering">Private Dinners</a></li>
          <li><a href="/catering">Cocktail Receptions</a></li>
          <li><a href="/catering">Holiday Gatherings</a></li>
        </ul>
      </div>

      <div class="footer-col">
        <h4>Contact</h4>
        <div class="footer-contact-item">
          <i class="fas fa-map-marker-alt"></i>
          <span>124 Culinary Lane<br/>Suite 200, New York, NY 10001</span>
        </div>
        <div class="footer-contact-item">
          <i class="fas fa-phone"></i>
          <a href="tel:+12125550192" style="color:rgba(255,255,255,.6);text-decoration:none">+1 (212) 555-0192</a>
        </div>
        <div class="footer-contact-item">
          <i class="fas fa-envelope"></i>
          <a href="mailto:hello@bistroana.com" style="color:rgba(255,255,255,.6);text-decoration:none">hello@bistroana.com</a>
        </div>
        <div class="footer-contact-item">
          <i class="fas fa-clock"></i>
          <span>Mon–Fri: 9AM – 6PM<br/>Sat: 10AM – 4PM</span>
        </div>
      </div>
    </div>

    <div class="footer-bottom">
      <p>© ${new Date().getFullYear()} Bistro Ana Cuisine & Catering. All rights reserved.</p>
      <div style="display:flex;gap:24px">
        <a href="#">Privacy Policy</a>
        <a href="#">Terms of Service</a>
      </div>
    </div>
  </div>
</footer>

<!-- ── Global JS ── -->
<script>
  // Navbar scroll behaviour
  const navbar = document.getElementById('navbar');
  const onScroll = () => navbar.classList.toggle('scrolled', window.scrollY > 50);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Mobile nav toggle
  const toggle = document.getElementById('nav-toggle');
  const menu   = document.getElementById('nav-menu');
  toggle.addEventListener('click', () => {
    const open = toggle.classList.toggle('open');
    menu.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', String(open));
    document.body.style.overflow = open ? 'hidden' : '';
  });
  // Close on link click
  menu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    toggle.classList.remove('open');
    menu.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }));

  // Reveal on scroll
  const reveals = document.querySelectorAll('.reveal');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); observer.unobserve(e.target); } });
  }, { threshold: 0.12 });
  reveals.forEach(el => observer.observe(el));
</script>

</body>
</html>`
}

/* ════════════════════════════════════════════════════
   HOME PAGE
════════════════════════════════════════════════════ */
function homePage(): string {
  const content = `
<!-- ── Hero ── -->
<section id="hero" style="
  min-height: 100vh;
  background: var(--espresso);
  display: flex; align-items: center; justify-content: center;
  position: relative; overflow: hidden; text-align: center;">

  <!-- Background gradient / texture -->
  <div style="
    position:absolute; inset:0;
    background: radial-gradient(ellipse at 60% 40%, #3d1f0a 0%, #1a0a00 55%, #0d0500 100%);
  "></div>

  <!-- Decorative gold circles -->
  <div style="position:absolute;width:600px;height:600px;border-radius:50%;
    border:1px solid rgba(201,168,76,.08);top:50%;left:50%;
    transform:translate(-50%,-50%);pointer-events:none;"></div>
  <div style="position:absolute;width:800px;height:800px;border-radius:50%;
    border:1px solid rgba(201,168,76,.05);top:50%;left:50%;
    transform:translate(-50%,-50%);pointer-events:none;"></div>

  <!-- Food imagery strips -->
  <div style="
    position:absolute; inset:0; overflow:hidden; opacity:.18;
    background:
      url('https://sspark.genspark.ai/cfimages?u1=CsieQLMYw1CM71osspZAZHlkDvw6EqG6F9vS4JGp4Ezl%2BzqQkc%2BjI%2BXed8TQaPgIfuGik1U6Kb7daSDi30A%2FUToi6sJnO9Oqh9e7LhFJMs4w%2BAC3HQrj2lfhEq%2FuRsZeJeP6nRXjtvH8Rbq5YwGz9gYPrdPQqQY%3D&u2=Hm7Yzy6z9022rTnQ&width=2560')
      center/cover no-repeat;
    mix-blend-mode: luminosity;
  "></div>

  <div class="container" style="position:relative;z-index:1;padding-top:120px;padding-bottom:80px;">
    <div class="section-label" style="justify-content:center;color:var(--gold)">
      <span>Est. 2012</span>
    </div>

    <h1 style="
      font-family:'Cormorant Garamond',serif;
      font-size:clamp(3rem,8vw,7rem);
      font-weight:300;
      color:#fff;
      line-height:1.05;
      letter-spacing:-.01em;
      margin-bottom:24px;
    ">
      Where Every Meal<br/>
      <em style="font-style:italic;color:var(--gold)">Tells a Story</em>
    </h1>

    <div class="ornament" style="justify-content:center">
      <div class="ornament-line"></div>
      <div class="ornament-diamond"></div>
      <div class="ornament-line"></div>
    </div>

    <p style="
      font-family:'Cormorant Garamond',serif;
      font-size:clamp(1.1rem,2.5vw,1.5rem);
      color:rgba(255,255,255,.75);
      max-width:600px; margin:16px auto 40px;
      font-style:italic; font-weight:300;
      line-height:1.7;
    ">
      Exquisite catering for weddings, corporate events &amp; private dinners — crafted with locally sourced ingredients and artful presentation.
    </p>

    <div style="display:flex;gap:16px;justify-content:center;flex-wrap:wrap;">
      <a href="/contact" class="btn btn-primary">
        <i class="fas fa-calendar-alt"></i> Book Your Event
      </a>
      <a href="/menu" class="btn btn-outline">
        <i class="fas fa-utensils"></i> Explore Menu
      </a>
    </div>

    <!-- Stats -->
    <div style="
      display:flex; gap:48px; justify-content:center; flex-wrap:wrap;
      margin-top:72px; padding-top:40px;
      border-top:1px solid rgba(255,255,255,.1);
    ">
      ${[['500+','Events Catered'],['12+','Years of Excellence'],['98%','Client Satisfaction'],['50+','Menu Items']].map(([n,l]) => `
      <div style="text-align:center">
        <div style="font-family:'Cormorant Garamond',serif;font-size:2.5rem;font-weight:600;color:var(--gold)">${n}</div>
        <div style="font-size:.75rem;letter-spacing:.15em;text-transform:uppercase;color:rgba(255,255,255,.5);margin-top:4px">${l}</div>
      </div>`).join('')}
    </div>
  </div>

  <!-- Scroll indicator -->
  <div style="
    position:absolute;bottom:32px;left:50%;transform:translateX(-50%);
    display:flex;flex-direction:column;align-items:center;gap:8px;
    animation:bounce 2s infinite;
  ">
    <span style="font-size:.65rem;letter-spacing:.2em;text-transform:uppercase;color:rgba(255,255,255,.4)">Scroll</span>
    <i class="fas fa-chevron-down" style="color:var(--gold);font-size:.8rem"></i>
  </div>
  <style>
    @keyframes bounce { 0%,100%{transform:translateX(-50%) translateY(0)}50%{transform:translateX(-50%) translateY(8px)} }
  </style>
</section>

<!-- ── About / Story ── -->
<section style="padding:100px 0;background:var(--cream);">
  <div class="container">
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:80px;align-items:center;">
      <div class="reveal">
        <div class="section-label">Our Story</div>
        <h2 style="font-size:clamp(2rem,4vw,3.2rem);font-weight:400;margin-bottom:24px;line-height:1.2">
          A Passion for Food,<br/><em style="font-style:italic;color:var(--gold)">A Gift for Hospitality</em>
        </h2>
        <div class="ornament" style="justify-content:flex-start;margin-bottom:24px">
          <div class="ornament-line" style="max-width:40px"></div>
          <div class="ornament-diamond"></div>
        </div>
        <p style="color:#5c5c5c;line-height:1.9;margin-bottom:16px;font-size:1.05rem">
          Bistro Ana was born from Chef Ana Moreau's unwavering belief that exceptional food transforms ordinary gatherings into lifelong memories. With over two decades of culinary expertise spanning Michelin-starred kitchens in Paris and New York, Ana brings refined technique and soulful warmth to every event she touches.
        </p>
        <p style="color:#5c5c5c;line-height:1.9;margin-bottom:36px;font-size:1.05rem">
          We partner with local farms and artisan producers, ensuring every dish carries the flavors of the season — vibrant, honest, and deeply satisfying.
        </p>
        <a href="/catering" class="btn btn-outline-dark">Discover Our Services</a>
      </div>

      <div class="reveal reveal-delay-2" style="position:relative">
        <!-- Image mosaic -->
        <div style="position:relative;height:500px">
          <div style="
            position:absolute;top:0;left:0;right:60px;bottom:60px;
            background:url('https://sspark.genspark.ai/cfimages?u1=%2BR6HluechY0JC8Pz8nwYytY5ZZMdX1HNyZ5m%2Bw%2F3msA8EJ93lAemwJ5eWKhEhd1fu6xEZ5%2Fid1hX8ftXeyFsl%2Fyxc6Kb%2F%2F2d5Ja2CKn1P6L9Tk7qSyweTk1VglFUCqT4UQ%3D%3D&u2=8V1tFdJqEfByqV9V&width=800') center/cover;
            border-radius:var(--radius-lg);
            box-shadow:var(--shadow-lg);
          "></div>
          <div style="
            position:absolute;bottom:0;right:0;width:220px;height:220px;
            background:url('https://sspark.genspark.ai/cfimages?u1=U19QXqBbgXKnvHgRjeSnzsmwqLL59d%2BcxiSIgf9NqtD%2B5fwzDr54uqnXj6ujkghdkqJ8AAEeBC%2BB%2B4KxHAhz9yByO2zTiMwEX35PQpdJ3Q%2BmwF9HJMbI28OYUVicckFXypA%3D&u2=1ghCc619Vduh9rZ3&width=500') center/cover;
            border-radius:var(--radius-lg);
            box-shadow:var(--shadow-lg);
            border:4px solid var(--cream);
          "></div>
          <!-- Gold accent badge -->
          <div style="
            position:absolute;top:24px;right:24px;
            background:var(--gold);color:var(--espresso);
            width:90px;height:90px;border-radius:50%;
            display:flex;flex-direction:column;align-items:center;justify-content:center;
            font-family:'Cormorant Garamond',serif;
            box-shadow:0 8px 24px rgba(201,168,76,.4);
            text-align:center;
          ">
            <span style="font-size:1.6rem;font-weight:700;line-height:1">12</span>
            <span style="font-size:.6rem;font-weight:600;letter-spacing:.1em;text-transform:uppercase">Years</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- ── Services ── -->
<section style="padding:100px 0;background:var(--espresso);position:relative;overflow:hidden;">
  <div style="
    position:absolute;top:-100px;right:-100px;
    width:400px;height:400px;border-radius:50%;
    background:radial-gradient(circle,rgba(201,168,76,.08) 0%,transparent 70%);
    pointer-events:none;
  "></div>
  <div class="container">
    <div class="text-center reveal" style="margin-bottom:60px">
      <div class="section-label" style="justify-content:center">What We Offer</div>
      <h2 style="font-size:clamp(2rem,4vw,3.2rem);font-weight:400;color:#fff">
        Catering for Every <em style="font-style:italic;color:var(--gold)">Occasion</em>
      </h2>
    </div>

    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:28px">
      ${[
        { icon:'fa-rings-wedding', title:'Wedding Catering', desc:'From intimate ceremonies to grand receptions, we craft menus that reflect your love story — every detail considered, every flavor intentional.' },
        { icon:'fa-building', title:'Corporate Events', desc:'Impress clients and reward teams with sophisticated menus tailored for conferences, product launches, and executive dining.' },
        { icon:'fa-champagne-glasses', title:'Cocktail Receptions', desc:'Artful canapés, curated cheese boards, and flowing libations — designed to dazzle and delight at every sophisticated gathering.' },
        { icon:'fa-house-chimney', title:'Private Dinners', desc:'A personal chef experience in your own space. We bring restaurant-quality cuisine and seamless service directly to your table.' },
        { icon:'fa-star', title:'Holiday Celebrations', desc:'Transform seasonal gatherings into extraordinary feasts with our festive menus, from intimate holiday dinners to large-scale galas.' },
        { icon:'fa-heart', title:'Anniversary & Milestones', desc:'Mark life\'s most meaningful moments with a bespoke culinary experience crafted around your personal story and preferences.' },
      ].map((s, i) => `
      <div class="reveal reveal-delay-${(i % 4) + 1}" style="
        background:rgba(255,255,255,.04);
        border:1px solid rgba(255,255,255,.08);
        border-radius:var(--radius-lg);
        padding:36px 32px;
        transition:var(--transition);
        cursor:default;
      " onmouseenter="this.style.background='rgba(201,168,76,.08)';this.style.borderColor='rgba(201,168,76,.3)';this.style.transform='translateY(-4px)'"
         onmouseleave="this.style.background='rgba(255,255,255,.04)';this.style.borderColor='rgba(255,255,255,.08)';this.style.transform='none'">
        <div style="
          width:52px;height:52px;border-radius:50%;
          background:rgba(201,168,76,.15);
          display:flex;align-items:center;justify-content:center;
          margin-bottom:20px;
        ">
          <i class="fas ${s.icon}" style="color:var(--gold);font-size:1.2rem"></i>
        </div>
        <h3 style="font-size:1.3rem;font-weight:500;color:#fff;margin-bottom:12px">${s.title}</h3>
        <p style="color:rgba(255,255,255,.6);font-size:.9rem;line-height:1.8">${s.desc}</p>
      </div>`).join('')}
    </div>

    <div class="text-center reveal" style="margin-top:52px">
      <a href="/catering" class="btn btn-primary">View All Services</a>
    </div>
  </div>
</section>

<!-- ── Signature Menu Preview ── -->
<section style="padding:100px 0;background:var(--cream-dark);">
  <div class="container">
    <div class="text-center reveal" style="margin-bottom:60px">
      <div class="section-label" style="justify-content:center">Culinary Craft</div>
      <h2 style="font-size:clamp(2rem,4vw,3.2rem);font-weight:400">
        Signature <em style="font-style:italic;color:var(--gold)">Dishes</em>
      </h2>
      <p style="color:#6b6b6b;max-width:560px;margin:16px auto 0;font-size:1.05rem;font-family:'Cormorant Garamond',serif;font-style:italic;font-size:1.2rem">
        Locally sourced, seasonally inspired, and presented with artful precision.
      </p>
    </div>

    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:28px">
      ${[
        { name:'Pan-Seared Duck Breast', category:'Entrée', desc:'Cherry gastrique, root vegetable purée, wilted spinach, micro herbs', price:'MP', img:'https://sspark.genspark.ai/cfimages?u1=6BPFiAXFxgl1YA0nRiE9lJbQUJZhttpSVyueAixWG36xRKszFkRSC62wVpcYnosimfTIJt3hEfwLkj7RjBhlLXQDx%2F0vucBXp6fivGCdRT22YDKSuu8%2ByM6HneRShlVYiO5Lig%3D%3D&u2=bPgi8uUVedtstEou&width=600' },
        { name:'Roasted Heirloom Beet Salad', category:'Starter', desc:'Goat cheese mousse, candied walnuts, aged balsamic, arugula', price:'$18', img:'https://sspark.genspark.ai/cfimages?u1=whPGdMWvgimUQr50XU2TX5zJ6ct8rMWhJl%2FMM0PTbGxLOb5ex994qCxGaCB89FG65fvbR075tSTHKcR2Q46Q7NHEwjRvQYB4QkuyzJpTFPHjqU7S7KfjvPzXwVnpfj8aZgVaqqOKXl6zq%2Bc2kofhD7dgaBCF6kv%2FdY0Muulv8LJKrsrtrEVAEYzp2R5%2Bhv4UZ7BXBVntGAFIUQ%3D%3D&u2=ODPPOjsfN5M6tfBB&width=600' },
        { name:'Saffron Risotto', category:'Vegetarian', desc:'Parmigiano-Reggiano, truffle oil, pea shoots, lemon zest', price:'$24', img:'https://sspark.genspark.ai/cfimages?u1=pHifWIfvYu8ULKcGRgjoHHFduOt6WYSF0sqHy%2BpGCgMBXEpCcJ%2BzxwEQP8MHjsYYTleR1eQF1SNu%2FJmBk2J7eo4w7wS1849A&u2=1tCKl%2BsH2NWz49Kx&width=600' },
      ].map((d, i) => `
      <article class="reveal reveal-delay-${i + 1}" style="
        background:var(--white);
        border-radius:var(--radius-lg);
        overflow:hidden;
        box-shadow:var(--shadow-sm);
        transition:var(--transition);
      " onmouseenter="this.style.transform='translateY(-6px)';this.style.boxShadow='var(--shadow-md)'"
         onmouseleave="this.style.transform='none';this.style.boxShadow='var(--shadow-sm)'">
        <div style="height:220px;overflow:hidden;position:relative;">
          <img src="${d.img}" alt="${d.name}" style="width:100%;height:100%;object-fit:cover;transition:transform .6s ease"
               onmouseenter="this.style.transform='scale(1.06)'" onmouseleave="this.style.transform='none'" loading="lazy"/>
          <span style="
            position:absolute;top:16px;left:16px;
            background:var(--gold);color:var(--espresso);
            font-size:.65rem;font-weight:600;letter-spacing:.12em;text-transform:uppercase;
            padding:5px 12px;border-radius:2px;
          ">${d.category}</span>
        </div>
        <div style="padding:24px">
          <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:8px">
            <h3 style="font-size:1.2rem;font-weight:500;flex:1">${d.name}</h3>
            <span style="font-family:'Cormorant Garamond',serif;font-size:1.1rem;color:var(--gold);font-weight:600;margin-left:12px">${d.price}</span>
          </div>
          <p style="font-size:.875rem;color:#6b6b6b;line-height:1.7;font-style:italic">${d.desc}</p>
        </div>
      </article>`).join('')}
    </div>

    <div class="text-center reveal" style="margin-top:48px">
      <a href="/menu" class="btn btn-outline-dark">View Full Menu</a>
    </div>
  </div>
</section>

<!-- ── Testimonials ── -->
<section style="padding:100px 0;background:var(--cream);">
  <div class="container">
    <div class="text-center reveal" style="margin-bottom:60px">
      <div class="section-label" style="justify-content:center">Kind Words</div>
      <h2 style="font-size:clamp(2rem,4vw,3.2rem);font-weight:400">
        What Our Clients <em style="font-style:italic;color:var(--gold)">Say</em>
      </h2>
    </div>

    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:28px">
      ${[
        { name:'Sarah & James Mitchell', event:'Wedding Reception · 180 Guests', text:'Bistro Ana turned our wedding reception into a culinary journey we will never forget. Guests are still talking about the saffron-braised lamb and the dessert table six months later.', rating:5 },
        { name:'Alexandra Chen', event:'Corporate Gala · 300 Attendees', text:'We\'ve used Bistro Ana for our annual corporate gala three years running. The seamless execution, stunning presentation, and consistently extraordinary flavors set them apart from every caterer we\'ve worked with.', rating:5 },
        { name:'Thomas & Rachel Dumont', event:'Private Dinner · Anniversary', text:'For our 25th anniversary, Ana personally designed a menu around our favorite travel memories. The evening was magical — intimate, thoughtful, and absolutely delicious.', rating:5 },
      ].map((t, i) => `
      <blockquote class="reveal reveal-delay-${i+1}" style="
        background:var(--white);
        border-radius:var(--radius-lg);
        padding:36px;
        box-shadow:var(--shadow-sm);
        position:relative;
        border-top:3px solid var(--gold);
      ">
        <div style="color:var(--gold);font-size:1.1rem;margin-bottom:20px;letter-spacing:2px">
          ${'★'.repeat(t.rating)}
        </div>
        <p style="font-family:'Cormorant Garamond',serif;font-size:1.15rem;font-style:italic;color:var(--charcoal);line-height:1.8;margin-bottom:24px">
          "${t.text}"
        </p>
        <footer style="display:flex;flex-direction:column;gap:4px">
          <cite style="font-style:normal;font-weight:600;font-size:.95rem;color:var(--espresso)">${t.name}</cite>
          <span style="font-size:.8rem;color:#888;letter-spacing:.05em">${t.event}</span>
        </footer>
        <div style="
          position:absolute;top:24px;right:24px;
          font-family:'Georgia',serif;font-size:5rem;
          color:var(--gold);opacity:.12;line-height:1;
        ">"</div>
      </blockquote>`).join('')}
    </div>
  </div>
</section>

<!-- ── CTA Banner ── -->
<section style="
  padding:100px 0;
  background:linear-gradient(135deg,var(--espresso-mid) 0%,var(--espresso) 100%);
  position:relative; overflow:hidden; text-align:center;">
  <div style="
    position:absolute;inset:0;
    background:url('https://sspark.genspark.ai/cfimages?u1=AJ5u11j4VcVcYAel4a8l5yWzkRxZs81xtxMBnqzH9yra1szbRleHspd58beSZKg3IHviymdWP%2FDznloLrHlD6k63%2BmzGTDVBB1Ksz6eRWWcjLTJTL2WkYcmXZ%2F9WMk2K05rGP5lOSzaR4hgU%2Fykk1P64EKxFZorfYDxiN%2BKJtPcdXN52jy3UbVTvrlJFd4A6o2iNIydBzOZ5ujdkovMIULhRfnYFIGE2m152l0Y9ku%2FLNQKwoYZBAC5w2may946Fd4ngIHboTDue6hAcsXyn&u2=31YoW0be0ZA5czGu&width=1600')
    center/cover no-repeat;
    opacity:.12;
  "></div>
  <div class="container" style="position:relative;z-index:1">
    <div class="reveal">
      <div class="section-label" style="justify-content:center">Ready to Begin?</div>
      <h2 style="font-size:clamp(2.2rem,5vw,4rem);font-weight:300;color:#fff;margin-bottom:20px">
        Let's Create Something <em style="font-style:italic;color:var(--gold)">Extraordinary</em>
      </h2>
      <p style="color:rgba(255,255,255,.7);font-size:1.15rem;max-width:540px;margin:0 auto 40px;font-family:'Cormorant Garamond',serif;font-style:italic">
        Every great event starts with a conversation. Tell us about your vision and we'll craft a bespoke culinary experience around it.
      </p>
      <div style="display:flex;gap:16px;justify-content:center;flex-wrap:wrap">
        <a href="/contact" class="btn btn-primary">
          <i class="fas fa-envelope"></i> Get in Touch
        </a>
        <a href="tel:+12125550192" class="btn btn-outline">
          <i class="fas fa-phone"></i> Call Us Today
        </a>
      </div>
    </div>
  </div>
</section>

<!-- Home page responsive grid fix -->
<style>
  @media (max-width: 760px) {
    #hero .container div[style*="display:grid"] { flex-direction:column; }
    section > .container > div[style*="grid-template-columns:1fr 1fr"] {
      grid-template-columns: 1fr !important;
    }
  }
</style>
`
  return layout('Home', content, 'home')
}

/* ════════════════════════════════════════════════════
   MENU PAGE
════════════════════════════════════════════════════ */
function menuPage(): string {
  const categories = [
    {
      id: 'starters', label: 'Starters & Salads',
      icon: 'fa-leaf',
      items: [
        { name: 'Roasted Heirloom Beet Salad', desc: 'Goat cheese mousse, candied walnuts, shaved fennel, aged balsamic reduction, micro arugula', price: '$18', badge: 'Vegetarian' },
        { name: 'Tuna Tartare', desc: 'Sushi-grade yellowfin, avocado cream, sesame tuile, pickled ginger, ponzu drops', price: '$24', badge: 'Chef\'s Pick' },
        { name: 'Butternut Squash Bisque', desc: 'Brown butter, crème fraîche swirl, toasted pepitas, smoked paprika oil, chive', price: '$16', badge: 'Seasonal' },
        { name: 'Burrata & Heirloom Tomato', desc: 'Fresh burrata, heirloom tomatoes, basil oil, sea salt flakes, balsamic pearls, crostini', price: '$20', badge: '' },
        { name: 'Seared Diver Scallops', desc: 'Cauliflower purée, crispy capers, lemon beurre blanc, micro watercress', price: '$28', badge: 'Signature' },
        { name: 'Charcuterie & Artisan Cheese', desc: 'Curated selection of imported cheeses, house-cured meats, seasonal accompaniments, artisan crackers', price: '$32', badge: '' },
      ],
    },
    {
      id: 'entrees', label: 'Main Courses',
      icon: 'fa-utensils',
      items: [
        { name: 'Pan-Seared Duck Breast', desc: 'Cherry gastrique, root vegetable purée, wilted spinach, crispy duck skin, micro herbs', price: 'MP', badge: 'Chef\'s Pick' },
        { name: 'Grass-Fed Beef Tenderloin', desc: '8oz center-cut filet, truffle compound butter, pommes aligot, haricots verts, red wine jus', price: '$52', badge: 'Signature' },
        { name: 'Pan-Roasted Atlantic Salmon', desc: 'Lemon herb crust, broccolini, charred corn succotash, dill crème fraîche', price: '$38', badge: '' },
        { name: 'Lamb Rack Provençal', desc: 'Herbed panko crust, ratatouille, rosemary jus, roasted garlic confit', price: '$48', badge: 'Seasonal' },
        { name: 'Saffron Risotto', desc: 'Carnaroli rice, Parmigiano-Reggiano, truffle oil, pea shoots, crispy shallots, lemon zest', price: '$28', badge: 'Vegetarian' },
        { name: 'Free-Range Chicken Ballotine', desc: 'Stuffed with wild mushroom duxelles, potato gratin, tarragon jus, roasted baby vegetables', price: '$36', badge: '' },
      ],
    },
    {
      id: 'desserts', label: 'Desserts & Sweets',
      icon: 'fa-birthday-cake',
      items: [
        { name: 'Lavender Crème Brûlée', desc: 'House-made lavender custard, caramelized sugar, seasonal berry compote, tuile wafer', price: '$14', badge: 'Signature' },
        { name: 'Dark Chocolate Fondant', desc: '70% Valrhona chocolate, salted caramel core, vanilla bean ice cream, gold leaf', price: '$16', badge: 'Chef\'s Pick' },
        { name: 'Seasonal Fruit Tart', desc: 'Almond frangipane, pastry cream, glazed seasonal fruits, candied citrus zest', price: '$13', badge: 'Seasonal' },
        { name: 'Champagne & Raspberry Verrine', desc: 'Champagne gelée, raspberry coulis, lychee cream, rose water foam', price: '$15', badge: '' },
        { name: 'Artisan Cheese Course', desc: 'Three selections of artisan cheeses, honeycomb, fruit paste, toasted nuts, crackers', price: '$22', badge: '' },
        { name: 'Mignardises & Petits Fours', desc: 'Chef\'s selection of handcrafted truffles, macarons, and seasonal confections (per person)', price: '$12', badge: '' },
      ],
    },
    {
      id: 'beverages', label: 'Beverages & Libations',
      icon: 'fa-wine-glass',
      items: [
        { name: 'Curated Wine Pairing', desc: 'Sommelier-selected pairings matched to each course — white, red, and dessert wines', price: 'From $45', badge: 'Sommelier Select' },
        { name: 'Craft Cocktail Service', desc: 'Bespoke cocktail menu crafted for your event, seasonal ingredients, premium spirits', price: 'From $18', badge: '' },
        { name: 'Artisan Non-Alcoholic', desc: 'House-made shrubs, botanical sodas, cold-pressed juices, sparkling waters', price: 'From $8', badge: 'Alcohol-Free' },
        { name: 'Champagne Toast Package', desc: 'Curated selection of sparkling wines and champagnes for toasting ceremonies', price: 'From $35', badge: '' },
      ],
    },
  ]

  const badges: Record<string,string> = {
    'Signature': 'background:var(--espresso);color:#fff',
    'Chef\'s Pick': 'background:var(--gold);color:var(--espresso)',
    'Vegetarian': 'background:#7a8c6e;color:#fff',
    'Seasonal': 'background:var(--mocha);color:#fff',
    'Alcohol-Free': 'background:#7a8c6e;color:#fff',
    'Sommelier Select': 'background:var(--espresso);color:#fff',
  }

  const content = `
<div class="page-hero" style="background:linear-gradient(135deg,#1a0a00 0%,#2d1a0a 100%)">
  <div class="page-hero-content">
    <div class="section-label" style="justify-content:center;color:var(--gold)"><span>Crafted with Intent</span></div>
    <h1><em>Our Menu</em></h1>
    <p>Seasonally inspired, locally sourced, artfully presented</p>
  </div>
</div>

<section style="padding:80px 0;background:var(--cream);">
  <div class="container">

    <!-- Intro -->
    <div class="text-center reveal" style="max-width:680px;margin:0 auto 72px">
      <p style="font-family:'Cormorant Garamond',serif;font-size:1.25rem;font-style:italic;color:var(--mocha);line-height:1.8">
        Our menus are crafted each season in collaboration with local farmers and artisan producers. Prices shown are per-person for catered events. All menus are fully customizable to dietary requirements and event styles.
      </p>
    </div>

    <!-- Tab Navigation -->
    <div style="display:flex;gap:8px;flex-wrap:wrap;justify-content:center;margin-bottom:56px;" role="tablist" aria-label="Menu categories">
      ${categories.map((cat, i) => `
      <button
        role="tab"
        aria-selected="${i === 0}"
        aria-controls="panel-${cat.id}"
        id="tab-${cat.id}"
        class="menu-tab${i === 0 ? ' active' : ''}"
        data-target="${cat.id}"
        style="
          display:inline-flex;align-items:center;gap:8px;
          padding:12px 24px;
          border-radius:40px;
          border:2px solid ${i === 0 ? 'var(--gold)' : 'var(--parchment)'};
          background:${i === 0 ? 'var(--gold)' : 'transparent'};
          color:${i === 0 ? 'var(--espresso)' : 'var(--mocha)'};
          font-family:'Inter',sans-serif;
          font-size:.8rem;font-weight:500;
          letter-spacing:.08em;text-transform:uppercase;
          cursor:pointer;
          transition:var(--transition);
        "
      >
        <i class="fas ${cat.icon}" style="font-size:.85rem"></i>
        ${cat.label}
      </button>`).join('')}
    </div>

    <!-- Menu Panels -->
    ${categories.map((cat, i) => `
    <div
      role="tabpanel"
      id="panel-${cat.id}"
      aria-labelledby="tab-${cat.id}"
      class="menu-panel"
      style="display:${i === 0 ? 'grid' : 'none'};grid-template-columns:repeat(auto-fill,minmax(340px,1fr));gap:24px"
    >
      ${cat.items.map(item => `
      <article style="
        background:var(--white);
        border-radius:var(--radius-lg);
        padding:28px;
        border:1px solid var(--parchment);
        transition:var(--transition);
        position:relative;
      " onmouseenter="this.style.boxShadow='var(--shadow-md)';this.style.transform='translateY(-4px)';this.style.borderColor='var(--gold)'"
         onmouseleave="this.style.boxShadow='none';this.style.transform='none';this.style.borderColor='var(--parchment)'">
        ${item.badge ? `<span style="
          position:absolute;top:20px;right:20px;
          font-size:.62rem;font-weight:600;letter-spacing:.1em;text-transform:uppercase;
          padding:4px 10px;border-radius:2px;
          ${badges[item.badge] || 'background:var(--parchment);color:var(--espresso)'}
        ">${item.badge}</span>` : ''}
        <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:12px;margin-bottom:10px">
          <h3 style="font-size:1.15rem;font-weight:500;color:var(--espresso);flex:1;padding-right:${item.badge ? '90px' : '0'}">${item.name}</h3>
          <span style="
            font-family:'Cormorant Garamond',serif;
            font-size:1.15rem;font-weight:600;
            color:var(--gold);
            white-space:nowrap;
          ">${item.price}</span>
        </div>
        <p style="font-size:.875rem;color:#777;line-height:1.75;font-style:italic">${item.desc}</p>
      </article>`).join('')}
    </div>`).join('')}

    <!-- Menu note -->
    <div class="reveal" style="
      margin-top:60px;
      background:var(--espresso-mid);
      border-radius:var(--radius-lg);
      padding:36px 40px;
      display:flex;align-items:flex-start;gap:20px;
    ">
      <i class="fas fa-info-circle" style="color:var(--gold);font-size:1.2rem;margin-top:3px;flex-shrink:0"></i>
      <div>
        <h4 style="font-size:1.1rem;color:#fff;margin-bottom:8px">Custom Menu Design</h4>
        <p style="color:rgba(255,255,255,.65);font-size:.9rem;line-height:1.8">
          All menus are fully customizable. We accommodate all dietary restrictions including vegan, gluten-free, nut-free, and Kosher/Halal requirements with advance notice. Minimum order quantities and pricing vary by event type and guest count. Contact us for a personalized quote.
        </p>
      </div>
    </div>

    <div class="text-center reveal" style="margin-top:48px">
      <a href="/contact" class="btn btn-primary">
        <i class="fas fa-calendar-check"></i> Request Custom Menu
      </a>
    </div>

  </div>
</section>

<script>
  // Tab switching
  const tabs = document.querySelectorAll('.menu-tab');
  const panels = document.querySelectorAll('.menu-panel');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.dataset.target;

      tabs.forEach(t => {
        const active = t.dataset.target === target;
        t.classList.toggle('active', active);
        t.setAttribute('aria-selected', String(active));
        t.style.background = active ? 'var(--gold)' : 'transparent';
        t.style.color = active ? 'var(--espresso)' : 'var(--mocha)';
        t.style.borderColor = active ? 'var(--gold)' : 'var(--parchment)';
      });

      panels.forEach(panel => {
        const show = panel.id === 'panel-' + target;
        panel.style.display = show ? 'grid' : 'none';
      });
    });
  });
</script>
`
  return layout('Menu', content, 'menu')
}

/* ════════════════════════════════════════════════════
   CATERING PAGE
════════════════════════════════════════════════════ */
function cateringPage(): string {
  const content = `
<div class="page-hero" style="background:linear-gradient(135deg,#1a0a00 0%,#2d1a0a 100%)">
  <div class="page-hero-content">
    <div class="section-label" style="justify-content:center;color:var(--gold)"><span>Full-Service Events</span></div>
    <h1>Catering <em>Services</em></h1>
    <p>White-glove catering experiences tailored to your vision</p>
  </div>
</div>

<!-- Services Deep Dive -->
<section style="padding:100px 0;background:var(--cream)">
  <div class="container">
    <div class="text-center reveal" style="margin-bottom:72px">
      <div class="section-label" style="justify-content:center">What Sets Us Apart</div>
      <h2 style="font-size:clamp(2rem,4vw,3.2rem);font-weight:400">
        Seamless from <em style="font-style:italic;color:var(--gold)">Concept to Plate</em>
      </h2>
      <p style="color:#6b6b6b;max-width:600px;margin:16px auto 0;font-size:1.05rem;line-height:1.8">
        We handle every detail — from menu consultation and ingredient sourcing to on-site setup, service, and breakdown — so you can be fully present in the moment.
      </p>
    </div>

    <!-- Full-service steps -->
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:32px;margin-bottom:80px">
      ${[
        { step:'01', icon:'fa-comments', title:'Consultation', desc:'We begin with an in-depth consultation to understand your event, preferences, dietary needs, and vision.' },
        { step:'02', icon:'fa-file-alt', title:'Menu Design', desc:'Our chef crafts a bespoke menu proposal tailored to your event style, season, and guest profile.' },
        { step:'03', icon:'fa-shopping-basket', title:'Sourcing', desc:'We source the finest local and seasonal ingredients from our trusted network of farms and artisan producers.' },
        { step:'04', icon:'fa-star', title:'Execution', desc:'Our professional team arrives early, sets up with care, and delivers flawless service throughout your event.' },
      ].map((s, i) => `
      <div class="reveal reveal-delay-${i+1}" style="text-align:center">
        <div style="
          width:64px;height:64px;border-radius:50%;
          background:var(--gold);color:var(--espresso);
          display:flex;align-items:center;justify-content:center;
          margin:0 auto 20px;
          font-family:'Cormorant Garamond',serif;
          font-size:1.4rem;font-weight:700;
          box-shadow:0 8px 24px rgba(201,168,76,.35);
        ">${s.step}</div>
        <h3 style="font-size:1.2rem;font-weight:500;margin-bottom:12px">${s.title}</h3>
        <p style="color:#6b6b6b;font-size:.9rem;line-height:1.8">${s.desc}</p>
      </div>`).join('')}
    </div>

    <!-- Catering packages -->
    <div class="text-center reveal" style="margin-bottom:48px">
      <div class="section-label" style="justify-content:center">Event Packages</div>
      <h2 style="font-size:clamp(1.8rem,3.5vw,2.8rem);font-weight:400">
        A Package for Every <em style="font-style:italic;color:var(--gold)">Occasion</em>
      </h2>
    </div>

    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:28px">
      ${[
        {
          name:'The Gathering',
          price:'From $65',
          unit:'per person',
          tag:'',
          featured:false,
          desc:'Perfect for intimate events and casual celebrations.',
          includes:['2-course plated service','Choice of 3 entrées','Non-alcoholic beverages','Service staff (4 hrs)','Setup & breakdown'],
          cta:'Inquire Now',
        },
        {
          name:'The Celebration',
          price:'From $110',
          unit:'per person',
          tag:'Most Popular',
          featured:true,
          desc:'Our signature offering for weddings and milestone events.',
          includes:['4-course plated service','Chef\'s tasting menu option','Wine pairing available','Dedicated event coordinator','Full service staff (6 hrs)','Custom menu design','Floral centerpiece consultation'],
          cta:'Book Now',
        },
        {
          name:'The Grand Affair',
          price:'Custom',
          unit:'fully bespoke',
          tag:'White Glove',
          featured:false,
          desc:'The ultimate luxury experience for black-tie events and galas.',
          includes:['6-course grand menu','Sommelier wine service','Live carving & action stations','Personalized menu cards','Valet coordination','Full décor partnership','Premium bar package'],
          cta:'Request Quote',
        },
      ].map(pkg => `
      <div class="reveal" style="
        background:${pkg.featured ? 'var(--espresso)' : 'var(--white)'};
        border-radius:var(--radius-lg);
        padding:40px 36px;
        position:relative;
        border:2px solid ${pkg.featured ? 'var(--gold)' : 'var(--parchment)'};
        box-shadow:${pkg.featured ? 'var(--shadow-lg)' : 'var(--shadow-sm)'};
        transform:${pkg.featured ? 'scale(1.02)' : 'none'};
      ">
        ${pkg.tag ? `<div style="
          position:absolute;top:-14px;left:50%;transform:translateX(-50%);
          background:var(--gold);color:var(--espresso);
          font-size:.7rem;font-weight:700;letter-spacing:.15em;text-transform:uppercase;
          padding:6px 20px;border-radius:20px;white-space:nowrap;
        ">${pkg.tag}</div>` : ''}
        <h3 style="font-size:1.5rem;font-weight:500;color:${pkg.featured ? '#fff' : 'var(--espresso)'};margin-bottom:8px">${pkg.name}</h3>
        <div style="margin-bottom:16px">
          <span style="font-family:'Cormorant Garamond',serif;font-size:2.2rem;font-weight:600;color:var(--gold)">${pkg.price}</span>
          <span style="font-size:.8rem;color:${pkg.featured ? 'rgba(255,255,255,.5)' : '#999'};margin-left:6px">${pkg.unit}</span>
        </div>
        <p style="color:${pkg.featured ? 'rgba(255,255,255,.65)' : '#777'};font-size:.9rem;margin-bottom:24px">${pkg.desc}</p>
        <ul style="list-style:none;margin-bottom:32px;display:flex;flex-direction:column;gap:10px">
          ${pkg.includes.map(item => `
          <li style="display:flex;align-items:center;gap:10px;font-size:.875rem;color:${pkg.featured ? 'rgba(255,255,255,.75)' : '#5c5c5c'}">
            <i class="fas fa-check" style="color:var(--gold);font-size:.75rem;flex-shrink:0"></i>
            ${item}
          </li>`).join('')}
        </ul>
        <a href="/contact" class="btn ${pkg.featured ? 'btn-primary' : 'btn-outline-dark'}" style="width:100%;justify-content:center">
          ${pkg.cta} <i class="fas fa-arrow-right"></i>
        </a>
      </div>`).join('')}
    </div>
  </div>
</section>

<!-- Dietary Accommodations -->
<section style="padding:80px 0;background:var(--cream-dark)">
  <div class="container">
    <div class="text-center reveal" style="margin-bottom:48px">
      <div class="section-label" style="justify-content:center">Inclusive Dining</div>
      <h2 style="font-size:clamp(1.8rem,3.5vw,2.8rem);font-weight:400">
        Every Guest <em style="font-style:italic;color:var(--gold)">Welcomed</em>
      </h2>
    </div>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:20px">
      ${[
        { icon:'fa-seedling', label:'Vegan' },
        { icon:'fa-wheat-awn-circle-exclamation', label:'Gluten-Free' },
        { icon:'fa-ban', label:'Nut-Free' },
        { icon:'fa-star-and-crescent', label:'Halal' },
        { icon:'fa-star-of-david', label:'Kosher' },
        { icon:'fa-cheese', label:'Dairy-Free' },
      ].map((d, i) => `
      <div class="reveal reveal-delay-${(i%4)+1}" style="
        background:var(--white);border-radius:var(--radius-lg);
        padding:28px 20px;text-align:center;
        border:1px solid var(--parchment);
        transition:var(--transition);
      " onmouseenter="this.style.borderColor='var(--gold)';this.style.transform='translateY(-4px)'"
         onmouseleave="this.style.borderColor='var(--parchment)';this.style.transform='none'">
        <i class="fas ${d.icon}" style="font-size:1.8rem;color:var(--gold);margin-bottom:12px;display:block"></i>
        <span style="font-size:.85rem;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:var(--espresso)">${d.label}</span>
      </div>`).join('')}
    </div>
  </div>
</section>

<!-- FAQ -->
<section style="padding:100px 0;background:var(--cream)">
  <div class="container" style="max-width:800px">
    <div class="text-center reveal" style="margin-bottom:56px">
      <div class="section-label" style="justify-content:center">Common Questions</div>
      <h2 style="font-size:clamp(1.8rem,3.5vw,2.8rem);font-weight:400">
        Frequently Asked <em style="font-style:italic;color:var(--gold)">Questions</em>
      </h2>
    </div>

    ${[
      { q:'How far in advance should I book?', a:'We recommend booking at least 8–12 weeks in advance for weddings and large events, and 4–6 weeks for smaller gatherings. We do accommodate last-minute requests when availability allows.' },
      { q:'What is your minimum guest count?', a:'Our minimum is 20 guests for full-service catering. For smaller intimate dinners, we offer a private chef experience starting from 6 guests.' },
      { q:'Do you provide rentals (linens, dishware, etc.)?', a:'Yes. We offer full rental packages including fine china, crystal glassware, linens, and serving equipment. We also work with preferred rental partners for specialty items.' },
      { q:'Can you accommodate multiple dietary restrictions at one event?', a:'Absolutely. We routinely create menus that satisfy multiple dietary needs simultaneously, ensuring every guest enjoys a beautiful, cohesive meal without compromise.' },
      { q:'Do you travel outside the city?', a:'We cater events within a 100-mile radius of our base. Travel fees apply for events beyond 30 miles. Please contact us for destination event inquiries.' },
    ].map((item, i) => `
    <details class="reveal" style="
      border-bottom:1px solid var(--parchment);
      margin-bottom:4px;
    " ${i === 0 ? 'open' : ''}>
      <summary style="
        padding:20px 0;
        cursor:pointer;
        display:flex;justify-content:space-between;align-items:center;
        font-size:1.05rem;font-weight:500;color:var(--espresso);
        list-style:none;
        user-select:none;
      " onclick="this.closest('details').querySelectorAll('.faq-icon').forEach(i=>{i.style.display='none'}); const open=!this.closest('details').open; this.querySelector(open?'.faq-icon-close':'.faq-icon-open').style.display='block'; this.querySelector(open?'.faq-icon-open':'.faq-icon-close').style.display='none'">
        <span>${item.q}</span>
        <span style="display:flex;align-items:center;flex-shrink:0;margin-left:16px">
          <i class="fas fa-plus faq-icon faq-icon-open" style="color:var(--gold);display:${i===0?'none':'block'}"></i>
          <i class="fas fa-minus faq-icon faq-icon-close" style="color:var(--gold);display:${i===0?'block':'none'}"></i>
        </span>
      </summary>
      <p style="padding:4px 0 24px;color:#6b6b6b;line-height:1.9;font-size:.95rem">${item.a}</p>
    </details>`).join('')}
  </div>
</section>
`
  return layout('Catering Services', content, 'catering')
}

/* ════════════════════════════════════════════════════
   GALLERY PAGE
════════════════════════════════════════════════════ */
function galleryPage(): string {
  const images = [
    { url: 'https://sspark.genspark.ai/cfimages?u1=CsieQLMYw1CM71osspZAZHlkDvw6EqG6F9vS4JGp4Ezl%2BzqQkc%2BjI%2BXed8TQaPgIfuGik1U6Kb7daSDi30A%2FUToi6sJnO9Oqh9e7LhFJMs4w%2BAC3HQrj2lfhEq%2FuRsZeJeP6nRXjtvH8Rbq5YwGz9gYPrdPQqQY%3D&u2=Hm7Yzy6z9022rTnQ&width=800', alt: 'Elegant plated fine dining course', tag: 'Plated Dinners', span: 2 },
    { url: 'https://sspark.genspark.ai/cfimages?u1=%2BR6HluechY0JC8Pz8nwYytY5ZZMdX1HNyZ5m%2Bw%2F3msA8EJ93lAemwJ5eWKhEhd1fu6xEZ5%2Fid1hX8ftXeyFsl%2Fyxc6Kb%2F%2F2d5Ja2CKn1P6L9Tk7qSyweTk1VglFUCqT4UQ%3D%3D&u2=8V1tFdJqEfByqV9V&width=600', alt: 'Artful food presentation', tag: 'Presentation', span: 1 },
    { url: 'https://sspark.genspark.ai/cfimages?u1=U19QXqBbgXKnvHgRjeSnzsmwqLL59d%2BcxiSIgf9NqtD%2B5fwzDr54uqnXj6ujkghdkqJ8AAEeBC%2BB%2B4KxHAhz9yByO2zTiMwEX35PQpdJ3Q%2BmwF9HJMbI28OYUVicckFXypA%3D&u2=1ghCc619Vduh9rZ3&width=600', alt: 'Inspiring plating ideas', tag: 'Cuisine', span: 1 },
    { url: 'https://sspark.genspark.ai/cfimages?u1=6BPFiAXFxgl1YA0nRiE9lJbQUJZhttpSVyueAixWG36xRKszFkRSC62wVpcYnosimfTIJt3hEfwLkj7RjBhlLXQDx%2F0vucBXp6fivGCdRT22YDKSuu8%2ByM6HneRShlVYiO5Lig%3D%3D&u2=bPgi8uUVedtstEou&width=600', alt: 'Fine dining presentation', tag: 'Fine Dining', span: 1 },
    { url: 'https://sspark.genspark.ai/cfimages?u1=AJ5u11j4VcVcYAel4a8l5yWzkRxZs81xtxMBnqzH9yra1szbRleHspd58beSZKg3IHviymdWP%2FDznloLrHlD6k63%2BmzGTDVBB1Ksz6eRWWcjLTJTL2WkYcmXZ%2F9WMk2K05rGP5lOSzaR4hgU%2Fykk1P64EKxFZorfYDxiN%2BKJtPcdXN52jy3UbVTvrlJFd4A6o2iNIydBzOZ5ujdkovMIULhRfnYFIGE2m152l0Y9ku%2FLNQKwoYZBAC5w2may946Fd4ngIHboTDue6hAcsXyn&u2=31YoW0be0ZA5czGu&width=800', alt: 'Luxury catering buffet display', tag: 'Events', span: 2 },
    { url: 'https://sspark.genspark.ai/cfimages?u1=WrxzZ8SmMRewQiZpigCPoh0HYCp0ZZlh5737uFLhjaLoctMdLxT%2F4m04yJv7v7yd0vBIBamkC5PxgkdXyA6cXss8A3z026HTJhFtVPegQdEIdtDaK%2FG5pjNQ58JQIvPQNgk%3D&u2=q24ZXvuZs96DZLqG&width=600', alt: 'Premium corporate event catering', tag: 'Corporate', span: 1 },
    { url: 'https://sspark.genspark.ai/cfimages?u1=cI5c6bT522YvhbNLg2YFeugBeYZXSfaCfDsHnXl12%2FfYuuXvmAqkUk6tA4NnLL2oVZeqPdRou5g16NfbWpC1C7ftvSDPuWs0iACQ%2BjtQ3FfBA0WQoIpIAkBRgtW3APU%3D&u2=UT6ki43eXhS0lUcy&width=600', alt: 'Fine dining catering for private events', tag: 'Private Events', span: 1 },
    { url: 'https://sspark.genspark.ai/cfimages?u1=whPGdMWvgimUQr50XU2TX5zJ6ct8rMWhJl%2FMM0PTbGxLOb5ex994qCxGaCB89FG65fvbR075tSTHKcR2Q46Q7NHEwjRvQYB4QkuyzJpTFPHjqU7S7KfjvPzXwVnpfj8aZgVaqqOKXl6zq%2Bc2kofhD7dgaBCF6kv%2FdY0Muulv8LJKrsrtrEVAEYzp2R5%2Bhv4UZ7BXBVntGAFIUQ%3D%3D&u2=ODPPOjsfN5M6tfBB&width=600', alt: 'Art of food plating', tag: 'Plating Art', span: 1 },
    { url: 'https://sspark.genspark.ai/cfimages?u1=pHifWIfvYu8ULKcGRgjoHHFduOt6WYSF0sqHy%2BpGCgMBXEpCcJ%2BzxwEQP8MHjsYYTleR1eQF1SNu%2FJmBk2J7eo4w7wS1849A&u2=1tCKl%2BsH2NWz49Kx&width=600', alt: 'Elegant food display', tag: 'Presentation', span: 1 },
    { url: 'https://sspark.genspark.ai/cfimages?u1=RCePeHXAr%2BuqBhnaj2WQitiw2MmCOls0mzgGVAg9eN6ZFzfAHOjDLxtght5oj3Qx7STvUgFdBTYFUe0MMudpCoyJqJHpog38Du%2Bqu4pX1wSnxKZWZfPGA0C7kQ%3D%3D&u2=H46JTRyERKIJemOW&width=800', alt: 'Catering San Diego plated service', tag: 'Plated Dinners', span: 2 },
  ]

  const content = `
<div class="page-hero" style="background:linear-gradient(135deg,#1a0a00 0%,#2d1a0a 100%)">
  <div class="page-hero-content">
    <div class="section-label" style="justify-content:center;color:var(--gold)"><span>Visual Portfolio</span></div>
    <h1>Our <em>Gallery</em></h1>
    <p>A glimpse into the artistry behind every event</p>
  </div>
</div>

<section style="padding:100px 0;background:var(--cream)">
  <div class="container">

    <div class="text-center reveal" style="margin-bottom:60px">
      <p style="font-family:'Cormorant Garamond',serif;font-size:1.25rem;font-style:italic;color:var(--mocha);max-width:560px;margin:0 auto;line-height:1.8">
        Every photograph captures a moment of culinary artistry — a glimpse into the meticulous care and passion that defines each Bistro Ana event.
      </p>
    </div>

    <!-- Masonry-style grid -->
    <div style="
      columns: 3;
      column-gap: 20px;
    " id="gallery-grid">
      ${images.map((img, i) => `
      <figure class="reveal reveal-delay-${(i%4)+1}" style="
        break-inside: avoid;
        margin-bottom: 20px;
        border-radius: var(--radius-lg);
        overflow: hidden;
        position: relative;
        cursor: pointer;
        box-shadow: var(--shadow-sm);
      " onclick="openLightbox('${img.url}','${img.alt}')">
        <img
          src="${img.url}"
          alt="${img.alt}"
          loading="lazy"
          style="width:100%;height:auto;display:block;transition:transform .6s ease;"
          onmouseenter="this.style.transform='scale(1.04)'"
          onmouseleave="this.style.transform='none'"
        />
        <figcaption style="
          position:absolute;bottom:0;left:0;right:0;
          background:linear-gradient(transparent,rgba(26,10,0,.75));
          padding:32px 20px 16px;
          color:#fff;
          transform:translateY(100%);
          transition:transform .3s ease;
        " class="gallery-caption">
          <span style="font-size:.7rem;font-weight:600;letter-spacing:.15em;text-transform:uppercase;color:var(--gold)">${img.tag}</span>
        </figcaption>
      </figure>`).join('')}
    </div>

    <!-- Lightbox -->
    <div id="lightbox" style="
      position:fixed;inset:0;
      background:rgba(0,0,0,.92);
      z-index:9999;
      display:none;
      align-items:center;justify-content:center;
      padding:20px;
    " onclick="closeLightbox()" aria-modal="true" role="dialog" aria-label="Image lightbox">
      <button onclick="closeLightbox()" aria-label="Close" style="
        position:absolute;top:20px;right:24px;
        background:none;border:none;
        color:#fff;font-size:1.8rem;cursor:pointer;
        width:44px;height:44px;
        display:flex;align-items:center;justify-content:center;
        border-radius:50%;
        transition:background .2s;
      " onmouseenter="this.style.background='rgba(255,255,255,.15)'"
         onmouseleave="this.style.background='none'">&times;</button>
      <img id="lightbox-img" src="" alt="" style="max-width:90vw;max-height:85vh;object-fit:contain;border-radius:8px;box-shadow:0 20px 80px rgba(0,0,0,.5)" onclick="event.stopPropagation()" />
      <p id="lightbox-caption" style="
        position:absolute;bottom:24px;left:50%;transform:translateX(-50%);
        color:rgba(255,255,255,.75);font-family:'Cormorant Garamond',serif;
        font-style:italic;font-size:1rem;text-align:center;
      "></p>
    </div>

    <div class="text-center reveal" style="margin-top:64px">
      <p style="font-family:'Cormorant Garamond',serif;font-size:1.15rem;font-style:italic;color:#888;margin-bottom:28px">
        Ready to create beautiful moments at your next event?
      </p>
      <a href="/contact" class="btn btn-primary">
        <i class="fas fa-calendar-alt"></i> Book Your Event
      </a>
    </div>
  </div>
</section>

<style>
  figure:hover .gallery-caption { transform: translateY(0) !important; }
  @media (max-width: 760px) { #gallery-grid { columns: 2; } }
  @media (max-width: 480px) { #gallery-grid { columns: 1; } }
</style>

<script>
  function openLightbox(url, alt) {
    const lb = document.getElementById('lightbox');
    document.getElementById('lightbox-img').src = url;
    document.getElementById('lightbox-img').alt = alt;
    document.getElementById('lightbox-caption').textContent = alt;
    lb.style.display = 'flex';
    document.body.style.overflow = 'hidden';
  }
  function closeLightbox() {
    document.getElementById('lightbox').style.display = 'none';
    document.body.style.overflow = '';
  }
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeLightbox(); });
</script>
`
  return layout('Gallery', content, 'gallery')
}

/* ════════════════════════════════════════════════════
   CONTACT PAGE
════════════════════════════════════════════════════ */
function contactPage(): string {
  const content = `
<div class="page-hero" style="background:linear-gradient(135deg,#1a0a00 0%,#2d1a0a 100%)">
  <div class="page-hero-content">
    <div class="section-label" style="justify-content:center;color:var(--gold)"><span>Let's Connect</span></div>
    <h1>Book Your <em>Event</em></h1>
    <p>Tell us about your vision — we'll bring it to life</p>
  </div>
</div>

<section style="padding:100px 0;background:var(--cream)">
  <div class="container">
    <div style="display:grid;grid-template-columns:5fr 4fr;gap:72px;align-items:start">

      <!-- Form -->
      <div class="reveal">
        <div class="section-label">Get a Quote</div>
        <h2 style="font-size:clamp(1.8rem,3vw,2.8rem);font-weight:400;margin-bottom:8px">
          Start Your <em style="font-style:italic;color:var(--gold)">Culinary Journey</em>
        </h2>
        <p style="color:#777;font-size:.95rem;margin-bottom:40px;line-height:1.8">
          Fill out the form and we'll respond within 24 hours with a personalized quote and availability.
        </p>

        <form id="contact-form" novalidate aria-label="Event booking form" style="display:flex;flex-direction:column;gap:20px">
          <!-- CSRF token placeholder (production: server-generated) -->
          <input type="hidden" name="_csrf" value="" id="csrf-token" />

          <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px">
            <div>
              <label for="name" style="display:block;font-size:.8rem;font-weight:600;letter-spacing:.1em;text-transform:uppercase;color:var(--espresso);margin-bottom:8px">
                Full Name <span aria-hidden="true" style="color:var(--gold)">*</span>
              </label>
              <input type="text" id="name" name="name" required autocomplete="name"
                placeholder="Ana Moreau"
                style="width:100%;padding:14px 16px;border:2px solid var(--parchment);border-radius:var(--radius);font-family:'Inter',sans-serif;font-size:.95rem;background:var(--white);transition:var(--transition);outline:none;color:var(--charcoal)"
                onfocus="this.style.borderColor='var(--gold)'"
                onblur="this.style.borderColor='var(--parchment)'" />
              <p class="field-error" style="display:none;color:#c0392b;font-size:.8rem;margin-top:4px"></p>
            </div>
            <div>
              <label for="email" style="display:block;font-size:.8rem;font-weight:600;letter-spacing:.1em;text-transform:uppercase;color:var(--espresso);margin-bottom:8px">
                Email <span aria-hidden="true" style="color:var(--gold)">*</span>
              </label>
              <input type="email" id="email" name="email" required autocomplete="email"
                placeholder="you@example.com"
                style="width:100%;padding:14px 16px;border:2px solid var(--parchment);border-radius:var(--radius);font-family:'Inter',sans-serif;font-size:.95rem;background:var(--white);transition:var(--transition);outline:none;color:var(--charcoal)"
                onfocus="this.style.borderColor='var(--gold)'"
                onblur="this.style.borderColor='var(--parchment)'" />
              <p class="field-error" style="display:none;color:#c0392b;font-size:.8rem;margin-top:4px"></p>
            </div>
          </div>

          <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px">
            <div>
              <label for="phone" style="display:block;font-size:.8rem;font-weight:600;letter-spacing:.1em;text-transform:uppercase;color:var(--espresso);margin-bottom:8px">Phone</label>
              <input type="tel" id="phone" name="phone" autocomplete="tel"
                placeholder="+1 (212) 555-0100"
                style="width:100%;padding:14px 16px;border:2px solid var(--parchment);border-radius:var(--radius);font-family:'Inter',sans-serif;font-size:.95rem;background:var(--white);transition:var(--transition);outline:none;color:var(--charcoal)"
                onfocus="this.style.borderColor='var(--gold)'"
                onblur="this.style.borderColor='var(--parchment)'" />
            </div>
            <div>
              <label for="eventType" style="display:block;font-size:.8rem;font-weight:600;letter-spacing:.1em;text-transform:uppercase;color:var(--espresso);margin-bottom:8px">Event Type</label>
              <select id="eventType" name="eventType"
                style="width:100%;padding:14px 16px;border:2px solid var(--parchment);border-radius:var(--radius);font-family:'Inter',sans-serif;font-size:.95rem;background:var(--white);transition:var(--transition);outline:none;color:var(--charcoal);appearance:none;cursor:pointer"
                onfocus="this.style.borderColor='var(--gold)'"
                onblur="this.style.borderColor='var(--parchment)'">
                <option value="">Select event type...</option>
                <option value="wedding">Wedding Reception</option>
                <option value="corporate">Corporate Event</option>
                <option value="cocktail">Cocktail Reception</option>
                <option value="private">Private Dinner</option>
                <option value="holiday">Holiday Celebration</option>
                <option value="anniversary">Anniversary / Milestone</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px">
            <div>
              <label for="eventDate" style="display:block;font-size:.8rem;font-weight:600;letter-spacing:.1em;text-transform:uppercase;color:var(--espresso);margin-bottom:8px">Event Date</label>
              <input type="date" id="eventDate" name="eventDate"
                style="width:100%;padding:14px 16px;border:2px solid var(--parchment);border-radius:var(--radius);font-family:'Inter',sans-serif;font-size:.95rem;background:var(--white);transition:var(--transition);outline:none;color:var(--charcoal)"
                onfocus="this.style.borderColor='var(--gold)'"
                onblur="this.style.borderColor='var(--parchment)'" />
            </div>
            <div>
              <label for="guestCount" style="display:block;font-size:.8rem;font-weight:600;letter-spacing:.1em;text-transform:uppercase;color:var(--espresso);margin-bottom:8px">Guest Count</label>
              <select id="guestCount" name="guestCount"
                style="width:100%;padding:14px 16px;border:2px solid var(--parchment);border-radius:var(--radius);font-family:'Inter',sans-serif;font-size:.95rem;background:var(--white);transition:var(--transition);outline:none;color:var(--charcoal);appearance:none;cursor:pointer"
                onfocus="this.style.borderColor='var(--gold)'"
                onblur="this.style.borderColor='var(--parchment)'">
                <option value="">Number of guests...</option>
                <option value="10-20">10–20 guests</option>
                <option value="20-50">20–50 guests</option>
                <option value="50-100">50–100 guests</option>
                <option value="100-200">100–200 guests</option>
                <option value="200-500">200–500 guests</option>
                <option value="500+">500+ guests</option>
              </select>
            </div>
          </div>

          <div>
            <label for="message" style="display:block;font-size:.8rem;font-weight:600;letter-spacing:.1em;text-transform:uppercase;color:var(--espresso);margin-bottom:8px">
              Tell Us About Your Vision <span aria-hidden="true" style="color:var(--gold)">*</span>
            </label>
            <textarea id="message" name="message" required rows="5"
              placeholder="Share your event vision, dietary requirements, venue details, or any special requests..."
              style="width:100%;padding:14px 16px;border:2px solid var(--parchment);border-radius:var(--radius);font-family:'Inter',sans-serif;font-size:.95rem;background:var(--white);transition:var(--transition);outline:none;color:var(--charcoal);resize:vertical;min-height:120px"
              onfocus="this.style.borderColor='var(--gold)'"
              onblur="this.style.borderColor='var(--parchment)'"></textarea>
            <p class="field-error" style="display:none;color:#c0392b;font-size:.8rem;margin-top:4px"></p>
          </div>

          <!-- Honeypot (bot trap — hidden from users) -->
          <div style="display:none" aria-hidden="true">
            <input type="text" name="_honey" tabindex="-1" autocomplete="off" />
          </div>

          <!-- Status message -->
          <div id="form-status" role="alert" aria-live="polite" style="display:none"></div>

          <button type="submit" class="btn btn-primary" id="submit-btn" style="align-self:flex-start;min-width:220px;justify-content:center">
            <i class="fas fa-paper-plane"></i>
            <span id="btn-text">Send Inquiry</span>
          </button>

          <p style="font-size:.8rem;color:#999;line-height:1.6">
            <i class="fas fa-lock" style="color:var(--gold)"></i>
            Your information is kept strictly private and never shared. We will respond within 24 hours.
          </p>
        </form>
      </div>

      <!-- Sidebar -->
      <aside class="reveal reveal-delay-2">
        <div style="position:sticky;top:100px;display:flex;flex-direction:column;gap:28px">

          <!-- Contact details -->
          <div style="background:var(--espresso);border-radius:var(--radius-lg);padding:36px;color:#fff">
            <h3 style="font-size:1.3rem;color:#fff;margin-bottom:24px">Get in Touch</h3>
            ${[
              { icon:'fa-map-marker-alt', label:'Address', value:'124 Culinary Lane, Suite 200<br/>New York, NY 10001' },
              { icon:'fa-phone', label:'Phone', value:'<a href="tel:+12125550192" style="color:rgba(255,255,255,.75);text-decoration:none">+1 (212) 555-0192</a>' },
              { icon:'fa-envelope', label:'Email', value:'<a href="mailto:hello@bistroana.com" style="color:rgba(255,255,255,.75);text-decoration:none">hello@bistroana.com</a>' },
              { icon:'fa-clock', label:'Office Hours', value:'Mon–Fri: 9AM – 6PM<br/>Sat: 10AM – 4PM' },
            ].map(c => `
            <div style="display:flex;gap:16px;margin-bottom:20px;align-items:flex-start">
              <div style="width:40px;height:40px;border-radius:50%;background:rgba(201,168,76,.2);display:flex;align-items:center;justify-content:center;flex-shrink:0">
                <i class="fas ${c.icon}" style="color:var(--gold);font-size:.9rem"></i>
              </div>
              <div>
                <div style="font-size:.7rem;letter-spacing:.15em;text-transform:uppercase;color:var(--gold);margin-bottom:4px">${c.label}</div>
                <div style="color:rgba(255,255,255,.75);font-size:.9rem;line-height:1.6">${c.value}</div>
              </div>
            </div>`).join('')}
          </div>

          <!-- Quick stats -->
          <div style="background:var(--cream-dark);border-radius:var(--radius-lg);padding:28px;border:1px solid var(--parchment)">
            <h4 style="font-size:1rem;margin-bottom:20px;color:var(--espresso)">Why Bistro Ana?</h4>
            ${[
              ['fa-clock', '24hr', 'Response Time'],
              ['fa-calendar-check', '500+', 'Events Completed'],
              ['fa-star', '98%', 'Satisfaction Rate'],
              ['fa-shield-alt', 'Fully', 'Insured & Licensed'],
            ].map(([icon, val, label]) => `
            <div style="display:flex;align-items:center;gap:12px;margin-bottom:14px">
              <i class="fas ${icon}" style="color:var(--gold);width:16px;text-align:center"></i>
              <span style="font-weight:600;color:var(--espresso);font-size:.95rem">${val}</span>
              <span style="color:#777;font-size:.875rem">${label}</span>
            </div>`).join('')}
          </div>

        </div>
      </aside>
    </div>
  </div>
</section>

<style>
  @media (max-width: 900px) {
    section > .container > div[style*="grid-template-columns:5fr 4fr"] {
      grid-template-columns: 1fr !important;
    }
    aside > div { position: static !important; }
  }
</style>

<script>
  // Client-side form validation + submission
  const form = document.getElementById('contact-form');
  const statusEl = document.getElementById('form-status');
  const submitBtn = document.getElementById('submit-btn');
  const btnText = document.getElementById('btn-text');

  function showFieldError(field, msg) {
    const err = field.closest('div').querySelector('.field-error');
    if (err) { err.textContent = msg; err.style.display = 'block'; }
    field.style.borderColor = '#c0392b';
  }
  function clearErrors() {
    form.querySelectorAll('.field-error').forEach(e => { e.style.display = 'none'; e.textContent = ''; });
    form.querySelectorAll('input,textarea,select').forEach(f => { f.style.borderColor = 'var(--parchment)'; });
  }

  function validateForm(data) {
    let valid = true;
    if (!data.name || data.name.trim().length < 2) {
      showFieldError(form.querySelector('#name'), 'Please enter your full name.');
      valid = false;
    }
    if (!data.email || !/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(data.email)) {
      showFieldError(form.querySelector('#email'), 'Please enter a valid email address.');
      valid = false;
    }
    if (!data.message || data.message.trim().length < 10) {
      showFieldError(form.querySelector('#message'), 'Please describe your event (at least 10 characters).');
      valid = false;
    }
    return valid;
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearErrors();

    const formData = new FormData(form);
    // Honeypot check
    if (formData.get('_honey')) return;

    const data = {
      name:       formData.get('name')?.toString().trim() || '',
      email:      formData.get('email')?.toString().trim() || '',
      phone:      formData.get('phone')?.toString().trim() || '',
      eventType:  formData.get('eventType')?.toString() || '',
      eventDate:  formData.get('eventDate')?.toString() || '',
      guestCount: formData.get('guestCount')?.toString() || '',
      message:    formData.get('message')?.toString().trim() || '',
    };

    if (!validateForm(data)) return;

    // Disable button and show loading
    submitBtn.disabled = true;
    btnText.textContent = 'Sending...';
    submitBtn.style.opacity = '.7';

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const json = await res.json();

      if (res.ok && json.success) {
        statusEl.style.display = 'block';
        statusEl.style.cssText = 'display:block;background:#f0f9f0;border:1px solid #7bc47b;border-radius:8px;padding:16px 20px;color:#2d6a2d;font-size:.9rem;line-height:1.6';
        statusEl.innerHTML = '<i class="fas fa-check-circle" style="color:#4caf50;margin-right:8px"></i>' + json.message;
        form.reset();
      } else {
        throw new Error(json.error || 'Submission failed');
      }
    } catch (err) {
      statusEl.style.display = 'block';
      statusEl.style.cssText = 'display:block;background:#fff5f5;border:1px solid #f5c6c6;border-radius:8px;padding:16px 20px;color:#c0392b;font-size:.9rem;line-height:1.6';
      statusEl.innerHTML = '<i class="fas fa-exclamation-circle" style="margin-right:8px"></i>Something went wrong. Please call us directly or email hello@bistroana.com.';
    } finally {
      submitBtn.disabled = false;
      btnText.textContent = 'Send Inquiry';
      submitBtn.style.opacity = '1';
    }
  });
</script>
`
  return layout('Book an Event', content, 'contact')
}

/* ─── 404 ─── */
function notFoundPage(): string {
  const content = `
<section style="min-height:80vh;display:flex;align-items:center;justify-content:center;text-align:center;padding:120px 24px 80px">
  <div>
    <div style="font-family:'Cormorant Garamond',serif;font-size:8rem;font-weight:300;color:var(--gold);line-height:1;margin-bottom:16px">404</div>
    <h1 style="font-size:2rem;font-weight:400;margin-bottom:16px">Page Not Found</h1>
    <p style="color:#777;font-family:'Cormorant Garamond',serif;font-style:italic;font-size:1.1rem;margin-bottom:36px">
      It seems this page has wandered off the menu.
    </p>
    <a href="/" class="btn btn-primary">Return Home</a>
  </div>
</section>
`
  return layout('Page Not Found', content)
}

export default app
