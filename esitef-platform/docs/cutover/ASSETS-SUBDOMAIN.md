# Assets estáticos — `assets.esitef.com`

WordPress sube medios a `wp-content/uploads/`. La app reescribe URLs legacy con `wpAssetUrl()` ([`src/lib/wp-asset-url.ts`](../../apps/web/src/lib/wp-asset-url.ts)).

## SiteGround (una vez)

SiteGround **no deja cambiar el document root** del subdominio: crea `assets.esitef.com/public_html/` con un `Default.html`. Hay que enlazar esa carpeta a los uploads reales (sin duplicar 1.2 GB).

### 1. Crear el subdominio

**Site Tools → Domain → Subdomains** → `assets.esitef.com` (déjalo con su `public_html` por defecto).

### 2. Sin SSH — copiar con File Manager (lo habitual en StartUp)

Si en Site Tools **no aparece Devs → SSH**, tu plan no incluye SSH. Usa el gestor de archivos:

1. **Site Tools → Site → File Manager**
2. En el árbol izquierdo abre:  
   `esitef.com` → `public_html` → `online` → `wp-content` → `uploads`
3. Selecciona las carpetas de años (`2019`…`2026`, etc.) y lo que haya suelto que no sea basura de plugins
4. Botón **Copy** (o clic derecho → Copy)
5. Destino: `assets.esitef.com` → `public_html`
6. En `assets.esitef.com/public_html` borra `Default.html`
7. **New file** → `.htaccess` con:

```apache
Options -Indexes
<IfModule mod_headers.c>
  Header set Cache-Control "public, max-age=31536000, immutable"
</IfModule>
```

La copia puede tardar (≈1 GB). No borres los originales en `online/wp-content/uploads` hasta validar.

**Atajo SFTP (FileZilla):** mismas carpetas; arrastra `uploads/*` → `assets.esitef.com/public_html/`. Credenciales en **Site Tools → Site → FTP Accounts**.

### 3. Si tienes SSH (GrowBig+ u otro plan)

A veces está en **Site Tools → Devs → SSH Keys Manager** (no “SSH” a secas), o hay que activar acceso SSH una vez. Host típico: `ssh.esitef.com`, puerto `18765`.

```bash
UPLOADS=/home/customer/www/esitef.com/public_html/online/wp-content/uploads
ASSETS=/home/customer/www/assets.esitef.com/public_html

cd "$ASSETS"
rm -f Default.html index.html

for item in "$UPLOADS"/*; do
  ln -sfn "$item" "$ASSETS/$(basename "$item")"
done

cat > .htaccess <<'EOF'
Options -Indexes +FollowSymLinks
<IfModule mod_headers.c>
  Header set Cache-Control "public, max-age=31536000, immutable"
</IfModule>
EOF
```

Ticket a SiteGround: *“Please create a symlink from assets.esitef.com/public_html to esitef.com/public_html/online/wp-content/uploads”* — a veces lo hacen ellos en minutos.

### 4. Probar

1. En File Manager de `assets.esitef.com/public_html` debes ver carpetas `2024`, `2025`, etc. (no solo `Default.html`).
2. Coge una URL real que funcione hoy, p. ej.  
   `https://esitef.com/online/wp-content/uploads/2024/03/foo.jpg`  
   y ábrela como:  
   `https://assets.esitef.com/2024/03/foo.jpg` → **200**.

## Vercel env

```
NEXT_PUBLIC_ASSETS_BASE_URL=https://assets.esitef.com
```

Sin variable, el código usa `https://assets.esitef.com` por defecto. Redeploy tras añadirla.

## Verificación local

```bash
npx tsx apps/web/src/lib/wp-asset-url.check.ts
```

## Migración futura

Cambiar `NEXT_PUBLIC_ASSETS_BASE_URL` a Vercel Blob o R2 — un solo env actualiza todas las miniaturas en runtime.
