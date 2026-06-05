# Espasyo Customer Engagement

A beautiful, animated Next.js landing page for Espasyo Coffee House's customer engagement platform. This public-facing application showcases the brand, loyalty program, and ordering system.

## Features

- 🎨 Stunning animated sections using Framer Motion
- ☕ Responsive design with Radix UI components
- 📱 Mobile-first approach
- ✨ Scroll animations that trigger on viewport entry
- 🎯 Multiple conversion-focused CTAs
- 📊 Animated counters and statistics
- 🎁 Loyalty program visualization
- 💬 Customer testimonials

## Tech Stack

- **Framework**: Next.js 16 (Pages Router)
- **UI Library**: Radix UI Themes
- **Animation**: Framer Motion
- **Styling**: Tailwind CSS v4 + custom CSS
- **State**: React Context (from core-lib)
- **Shared Code**: core-lib (monorepo package)

## Getting Started

### Development

```bash
# From monorepo root
yarn dev:espasyo-customer

# The app will be available at http://localhost:3001
```

### Build

```bash
# From app directory
yarn build
yarn start
```

## Project Structure

```
src/
├── pages/
│   ├── _app.tsx           # App entry point with providers
│   ├── _document.tsx      # HTML document shell
│   ├── index.tsx          # Landing page (all sections)
│   └── login.tsx          # Login page (shell)
├── components/
│   ├── shared/
│   │   └── Page.tsx       # App shell with contexts
│   └── landing/
│       ├── Navbar.tsx         # Sticky navbar with login
│       ├── HeroSection.tsx    # Full-viewport hero
│       ├── WhatIsSection.tsx  # Platform explanation
│       ├── OrderingSection.tsx # Ordering features
│       ├── FeaturesSection.tsx # 3 key features
│       ├── PromosSection.tsx   # Current deals
│       ├── LoyaltySection.tsx  # Loyalty program
│       ├── StatsSection.tsx    # Animated counters
│       ├── TestimonialsSection.tsx # Customer reviews
│       ├── CTASection.tsx      # Final call-to-action
│       └── Footer.tsx          # Footer with links
├── hooks/
│   └── useScrollAnimation.ts   # Scroll-triggered animations
└── styles/
    └── globals.css            # Global Tailwind config
```

## Sections

1. **Navbar** - Sticky navigation with Login button
2. **Hero** - Full-viewport intro with Unsplash image
3. **What Is Espasyo?** - Platform explanation with image
4. **Ordering System** - Feature breakdown with locked badge
5. **Features** - 3 animated feature cards
6. **Promotions** - 4 promo cards with Unsplash images
7. **Loyalty Program** - Visual stamp card + 3-step process
8. **Stats** - 4 animated counters
9. **Testimonials** - 3 customer reviews
10. **Call-to-Action** - Final conversion CTA
11. **Footer** - Links and social media

## Animation Patterns

All sections use `useScrollAnimation` hook for scroll-triggered entrance animations:
- Fade + slide animations on scroll into view
- Staggered child animations
- Animated counters using Framer Motion's `useMotionValue`
- Navbar scroll effect (transparent → solid)

## Images

All images sourced from Unsplash:
- Hero: Coffee shop atmosphere
- WhatIs: Barista at work
- Ordering: Coffee + phone
- Promos: 4 coffee/food images

## Login Page

Shell UI with email/password fields. No actual authentication wired up in this implementation.

## Development Notes

- No authentication context - this is a public site
- Uses `PublicSettingsProvider` for runtime settings (safe, no auth required)
- Radix Theme applied with orange accent color
- Tailwind CSS v4 with custom coffee-brand color vars
- All animations use Framer Motion `useInView` with `once: true` for performance

## Next Steps

To integrate with real backend:
1. Implement `/login` page authentication
2. Wire up promo API calls in PromosSection
3. Add CTA tracking/analytics
4. Implement email capture for newsletter signup
5. Add dynamic content from CMS (if needed)

## Scripts

```bash
yarn dev          # Start dev server on :3001
yarn build        # Build for production
yarn start        # Start production server
yarn lint         # Run ESLint
```
