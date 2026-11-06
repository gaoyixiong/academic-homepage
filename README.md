# Yixiong Gao's Academic Homepage

Source for [yixionggao.com](https://yixionggao.com/), built with Hugo and Hugo Blox Builder.

## Build

Install Hugo Extended 0.129.0 and Go, then preview the site locally.

```bash
hugo server
```

For a production build, clear the generated `public/` directory so files removed from the source also disappear from the published site.

```bash
rm -rf public && hugo --gc --minify --environment production
```

## Publish

The GitHub repository holds the source. Netlify uses `netlify.toml` to build it and serves `public/` at [yixionggao.com](https://yixionggao.com/).

This folder contains the website source. To publish with GitHub Desktop, select your existing homepage repository and update its `main` branch, then open its local folder.

1. Keep the checkout's `.git/` directory and replace the rest of its contents.
2. Copy the four directories `assets/`, `config/`, `content/`, and `layouts/`, plus `.gitignore`, `README.md`, `go.mod`, `go.sum`, and `netlify.toml` into its root.
3. In GitHub Desktop, review the additions, edits, and deletions together. Include the removal of old files, commit to `main`, then click `Push origin`.

## Content

- `content/` contains the biography, CV, research entries, slides, and competitive programming page with its certificates. Add an entry to `content/news.md` to show the News section on the homepage.
- `layouts/` and `assets/` contain the site templates, styles, scripts, and icon.
- `config/`, `go.mod`, and `go.sum` configure Hugo and pin the public theme dependencies.

Math typesetting for research content uses MathJax.
