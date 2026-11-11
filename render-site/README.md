# Bala Nikhil - 3D engineering portfolio

The current portfolio contains six project case studies, original project outputs, interactive 3D walkthroughs, a skills workbench, education, internship experience and contact links.

## Render deployment

Use the `render-3d-portfolio` branch of `Nikhilbal/bala-nikhil-portfolio`.

- Service: **Static Site**
- Root directory: `render-site`
- Build command: `true`
- Publish directory: `dist`
- Blueprint: repository-root `render.yaml`
- Environment variable: `SKIP_INSTALL_DEPS=true`

This is a buildless HTML/CSS/JavaScript site. No database, environment variables or server process is required. It uses local Three.js modules, fonts and project images. WebGL is used where available; an equivalent software renderer supports devices without WebGL. Motion controls and reduced-motion preferences are supported.

Only the contents of `render-site/dist` are published. The older Vite application in the repository root is retained separately.

## Local preview

From this directory: `python3 -m http.server 8000 --directory dist`.

## Content

- Auto Smart Cart Billing
- REVOCASCOPE (synthetic cloud-access investigation)
- SynthShield (AI-agent security research)
- PoolGo (mobile MVP)
- Customer 360 (analytics dashboard)
- TalkConnect (mobile prototype)
- Bluestock internship
- Six technical skill areas and a 3D education journey

Project outputs and prototypes are identified in the portfolio. ISC2 CC is listed as exam preparation. Vendor and font licences are included beside the relevant assets.
