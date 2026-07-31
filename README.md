# Yixiong Gao's Academic Homepage

Source for [yixionggao.com](https://yixionggao.com/), built with Hugo and Hugo Blox Builder.

## Build

The site is verified with Hugo Extended 0.129.0 and Go modules.

```bash
hugo server
```

For a production build:

```bash
hugo --gc --minify --environment production
```

The hosting service builds the site from source. Generated folders such as `public/` and `resources/` are intentionally ignored and should not be uploaded as source artifacts.

## Content

- `content/_index.md`: home page and research sections
- `content/competitive-programming.md`: competitive programming page
- `content/travel/`: travel data and photographs
- `layouts/`, `assets/css/`, and `assets/js/`: required custom presentation and interactions

The travel map uses MapLibre and OpenFreeMap at runtime. Math typesetting for research content uses MathJax.
