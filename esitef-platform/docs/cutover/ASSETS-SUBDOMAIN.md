# Assets estáticos — `assets.esitef.com`

WordPress sube medios a `wp-content/uploads/`. La app reescribe URLs legacy con `wpAssetUrl()` ([`src/lib/wp-asset-url.ts`](../../apps/web/src/lib/wp-asset-url.ts)).

## SiteGround (una vez)

1. **Site Tools → Domain → Subdomains** → crear `assets.esitef.com`
2. Document root: carpeta de uploads del LMS, p. ej.  
   `public_html/online/wp-content/uploads`  
   (o copia dedicada en `public_html/assets` desacoplada de `/online`)
3. `.htaccess` en esa carpeta:

```apache
Options -Indexes
<IfModule mod_headers.c>
  Header set Cache-Control "public, max-age=31536000, immutable"
</IfModule>
```

4. Probar: `https://assets.esitef.com/2024/03/ejemplo.jpg` → 200

## Vercel env

```
NEXT_PUBLIC_ASSETS_BASE_URL=https://assets.esitef.com
```

Sin variable, el código usa `https://assets.esitef.com` por defecto.

## Verificación local

```bash
npx tsx apps/web/src/lib/wp-asset-url.check.ts
```

## Migración futura

Cambiar `NEXT_PUBLIC_ASSETS_BASE_URL` a Vercel Blob o R2 — un solo env actualiza todas las miniaturas en runtime.
