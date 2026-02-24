# Dimewise Web

Landing site and legal pages for Dimewise, built with Astro.

## Features

- **Internationalization**: Supports English (en) and Japanese (ja)
- **Browser Language Detection**: Automatically detects browser language and redirects accordingly
- **Minimalistic Design**: Aligned with mobile app's receipt-inspired color scheme
- **Markdown Content**: Privacy Policy and Terms of Service pages support markdown content

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Project Structure

```
web/
├── src/
│   ├── components/          # Reusable components
│   │   └── LanguageSwitcher.astro
│   ├── content/             # Markdown content files
│   │   ├── privacy-policy/
│   │   │   ├── en.md
│   │   │   └── ja.md
│   │   └── terms-of-service/
│   │       ├── en.md
│   │       └── ja.md
│   ├── layouts/             # Layout components
│   │   └── BaseLayout.astro
│   ├── pages/               # Astro pages (file-based routing)
│   │   ├── en/
│   │   │   ├── index.astro
│   │   │   ├── privacy-policy.astro
│   │   │   └── terms-of-service.astro
│   │   └── ja/
│   │       ├── index.astro
│   │       ├── privacy-policy.astro
│   │       └── terms-of-service.astro
│   ├── styles/              # Global styles and color system
│   │   ├── colors.ts
│   │   └── global.css
│   ├── utils/               # Utility functions
│   │   └── i18n.ts
│   └── middleware.ts        # Language detection middleware
├── astro.config.mjs         # Astro configuration
└── package.json
```

## Adding Content

To update the Privacy Policy or Terms of Service:

1. Edit the markdown files in `src/content/`:
   - `src/content/privacy-policy/en.md` (English)
   - `src/content/privacy-policy/ja.md` (Japanese)
   - `src/content/terms-of-service/en.md` (English)
   - `src/content/terms-of-service/ja.md` (Japanese)

2. The pages will automatically render the updated content.

## Color Scheme

The site uses the same color scheme as the mobile app:
- **Primary**: Emerald (#10B981)
- **Neutral**: Grayscale palette (white to black)
- **Surfaces**: White and off-white backgrounds
- **Text**: Near-black primary, gray secondary

Colors are defined in `src/styles/colors.ts` and configured in `src/styles/global.css` using Tailwind CSS v4.

## Internationalization

- Supported locales: `en` (English), `ja` (Japanese)
- Default locale: `en`
- Browser language detection via `Accept-Language` header
- Language switcher available in the header

## Deployment

The site is configured for static site generation (SSG). Build the site with `npm run build` and deploy the `dist/` directory to your hosting provider.
