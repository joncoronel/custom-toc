# Custom TOC

A custom table of contents component with animated progress tracking for [Fumadocs](https://fumadocs.dev).

## Features

- Vertical track with animated fill indicator
- Circle marker that follows the current section
- JavaScript and CSS animation variants
- Server-side SVG pre-computation
- Stepped mode for nested heading indentation

## Demo

Visit the [live demo](https://custom-toc.vercel.app) or run locally:

```bash
pnpm install
pnpm dev
```

Open <http://localhost:3000> to see the TOC in action.

## Usage

The TOC components are in `app/docs/components/docs/`.

### Quick Start

```tsx
import { FillTOCServer } from "./components/docs/toc-fill-server";

<DocsPage
  tableOfContent={{
    component: <FillTOCServer toc={page.data.toc} stepped />,
  }}
>
```

## Components

| Component | Description |
| --- | --- |
| `FillTOC` | Main TOC with fill animation |
| `DefaultTOC` | Simpler variant highlighting visible sections |
| `FillTOCServer` / `DefaultTOCServer` | Server wrappers for pre-computed SVG paths |
