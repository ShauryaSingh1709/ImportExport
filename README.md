# Arrowhead International Logistics

A high-performance, visually rich landing page for Arrowhead International Logistics built with React, Vite, Tailwind CSS, and Three.js. The application presents a full-screen, interactive experience combining a 3D globe with animated trade routes, a horizontal journey timeline, real-time shipment tracking, and dynamic stat counters.

## Features

### Immersive Hero Section
A full-viewport hero with a parallax background, a custom animated cursor, and magnetic call-to-action buttons that respond to pointer movement.

### 3D Interactive Globe
A WebGL-powered globe rendered with `@react-three/fiber` and `three`, featuring:
- Textured earth with dynamic cloud layers
- Animated cargo markers traveling along curved trade routes
- Real-time pointer-based orbit and spin controls
- Wireframe and atmospheric glow overlays
- Lazy-loaded via `IntersectionObserver` for performance

### Horizontal Journey Timeline
A scroll-driven, sticky horizontal timeline that walks users through the six stages of a shipment:
1. Source
2. Warehouse
3. Port
4. Ship
5. Customs
6. Destination

Each stage is paired with a full-bleed background image and descriptive content, synced via GSAP `ScrollTrigger`.

### Services Overview
A grid of service cards (Import, Export, Global Logistics, Warehousing, Last Mile Delivery) with hover-scale animations and lazy-loaded images.

### Live Statistics
Animated count-up counters for key business metrics:
- 25+ Countries served
- 120+ Trade routes
- 10K+ Shipments delivered
- 99% Delivery reliability

### Shipment Tracking
A live tracking panel where users can enter a shipment ID and view current location, status, origin, destination, transit path, and estimated arrival. Includes animated progress indicators.

### Loading Experience
A branded loading screen with step-by-step status messages and a progress bar that fades to reveal the full application.

## Tech Stack

| Layer | Library |
|---|---|
| Build & Bundling | Vite 7 |
| UI Framework | React 19 |
| Styling | Tailwind CSS 4 |
| 3D Rendering | Three.js, @react-three/fiber, @react-three/drei |
| Animations | GSAP (ScrollTrigger), Framer Motion |
| Class Composition | clsx, tailwind-merge |
| Language | TypeScript (strict mode) |
| Output | vite-plugin-singlefile (single HTML export) |

## Project Structure

```
importexport/
├── node_modules/
├── src/
│   ├── utils/
│   │   └── cn.ts
│   ├── App.tsx
│   ├── index.css
│   └── main.tsx
├── .gitignore
├── index.html
├── package-lock.json
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## Live Demo

The application is deployed and publicly accessible:

- **Production**: [https://import-export-bay.vercel.app](https://import-export-bay.vercel.app)

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+

### Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/ShauryaSingh1709/ImportExport.git
cd ImportExport
npm install
```

### Development

Start the Vite development server:

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) to view the application in your browser. The server supports hot module replacement (HMR) for rapid iteration.

### Build

Create a production build:

```bash
npm run build
```

By default, `vite-plugin-singlefile` consolidates the entire application into a single self-contained HTML file, which is ideal for static hosting and easy deployment.

To preview the production build locally:

```bash
npm run preview
```

### Deployment

The application is deployed to Vercel. The build is generated with `npm run build` and the `dist` directory is served as a static site.

## Configuration

### TypeScript

The project uses TypeScript in strict mode with the following compiler options:

- `target`: ES2020
- `moduleResolution`: bundler
- `strict`: true
- Path aliases: `@/` maps to `src/`

### Vite

The Vite configuration includes:
- React plugin for Fast Refresh and JSX transform
- Tailwind CSS plugin for utility-first styling
- Single-file plugin for consolidated production output
- Path alias support for cleaner imports

## Design System

### Color Palette

| Role | Color |
|---|---|
| Primary Background | `#07090b` |
| Surface / Card | `#0d1117`, `#0d1218` |
| Text Primary | `#efe7d7`, `#f3ead8` |
| Text Secondary | `#d8d0bf`, `#cfc8b8` |
| Accent Gold | `#dcc48c`, `#e2c688`, `#f3d79f` |
| Accent Blue | `#8cb3ef`, `#7eaef8`, `#6b9ff5` |
| Border | `#f0e7d1` (low opacity) |

### Typography

- Font family: Inter, Helvetica Neue, Helvetica, Arial, sans-serif
- Letter tracking: Extended tracking (`.tracking-[0.2em]`, `.tracking-[0.36em]`) for a technical, high-precision aesthetic
- Responsive sizing via Tailwind breakpoints

### Components

| Component | Description |
|---|---|
| `LoadingScreen` | Branded loading overlay with animated progress |
| `PremiumCursor` | Custom cursor that scales and displays labels on interactive elements |
| `MagneticButton` | Hover-responsive button with pointer magnetism |
| `GlobeScene` | Full 3D globe with trade route animations |
| `CountUp` | Scroll-triggered numeric counters |

## Performance Notes

- The 3D globe canvas is deferred until scrolled into view using `IntersectionObserver`
- The cursor component and parallax effects are disabled on mobile (`max-width: 959px`)
- Images use `loading="lazy"` and `decoding="async"`
- Textures and assets are loaded from CDN with compressed, optimized formats

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for full terms.

## Credits

Third-party libraries, imagery, and assets are documented in [CREDITS.md](CREDITS.md). If you use this project, please star the repository and give credit as described there.

## Author

Developed by ShauryaSingh1709.

---

Built with React, Vite, Tailwind CSS, and Three.js.
