# Vitrina pública — Mr. Tatoo

Sitio **estático** para enviarle un link al tatuador. Sin API, sin login, sin POS.

**URL (cuando el repo se llame `mr-tatoo`):**  
https://edwardroag.github.io/mr-tatoo/

---

## Qué ve el cliente

HOME: hero, portafolio, artista, estilos, cotizar (WhatsApp), merch, redes.  
Banner: «Sitio de muestra».

---

## Una sola vez en GitHub

1. Crea un repo **privado** `EDWARDROAG/mr-tatoo` (vacío, sin README).
2. **Settings → Pages → Build and deployment → Source: GitHub Actions**.
3. Si Pages pide habilitar Actions: **Settings → Actions → Allow**.

---

## Subir este proyecto (no uses el git de Documentos)

En PowerShell, desde **esta carpeta** (`produccion/mr-tatoo`):

```powershell
git init
git add .
git commit -m "Vitrina Mr. Tatoo para GitHub Pages"
git branch -M main
git remote add origin https://github.com/EDWARDROAG/mr-tatoo.git
git push -u origin main
```

El Action construye `frontend/` y publica `dist/`. En 1–2 minutos el link queda vivo.

Probar en local el mismo build:

```powershell
cd frontend
npm run build:pages
npx vite preview --port 5510
```

Abre http://localhost:5510/mr-tatoo/

---

## Qué no se publica

Backend, Docker, `.env` de API, admin, POS. Solo HTML/CSS/JS + fotos de `frontend/public/images/demo/`.
