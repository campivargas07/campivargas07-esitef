# Tras activar el tema en staging

## Estado verificado (staging3.esitef.com/online)

| URL | Estado |
|-----|--------|
| `/` (home) | OK — hero, accordion, blog |
| `/ingresar/` | OK — login/registro |
| `/mentorias/` | OK |
| `/la-escuela/` | **Pendiente** — sigue con plantilla Elementor |
| `/argentina/`, `/mexico/` | **Fix Yoast** — redirects legacy a SVG; ver §7 |

## 1. La Escuela (1 minuto)

**Páginas → La escuela → Plantilla** → **La Escuela** → Actualizar

O reactivar el tema: cambiar a otro tema y volver a **ESITEF Minimal** (el `activation.php` actualizado asigna la plantilla sola).

## 2. Lectura (si la home no fuera estática)

**Ajustes → Lectura** → Página estática → **Inicio** (slug `inicio`)

## 3. Menú principal

**Apariencia → Menús** → asignar a **Primary**:

- Escuela → `/la-escuela/`
- Online (sub): Formaciones, Libros, Artículos, Mentorías
- Presenciales (sub): países
- Contacto, FAQs
- Ingresar → enlace a `/ingresar/` (botón del navbar ya apunta ahí)

## 4. Subir fix de activación (opcional)

Si reactivas el tema, sube de nuevo `esitef-minimal.zip` con el `inc/activation.php` actualizado.

## 5. Checkout (tema 1.6+)

Tras `./deploy-staging.sh` desde el repo:

```bash
cd esitef-minimal/deploy
./staging-post-deploy.sh   # crea productos presenciales WC
```

URLs de prueba:

- Carrito: https://staging3.esitef.com/online/cart/
- Checkout: https://staging3.esitef.com/online/checkout/
- Presencial Córdoba: buscar página e «Inscribirme» → planes online

Pasarelas: ver `PAYMENTS-STAGING.md` (Stripe/PayPal/MP en modo test).

## 6. QA

Ver `QA-CHECKLIST.md` antes de Push to Live.

## 7. Argentina / México (redirects Yoast)

Si `/argentina/` o `/mexico/` abren un `.svg` de bandera, Yoast SEO tiene redirects viejos.

Tras `./deploy-staging.sh`, `staging-post-deploy.sh` los limpia solo. Manual:

```bash
cd esitef-minimal/deploy
./staging-post-deploy.sh
# o solo el fix:
wp eval-file wp-content/themes/esitef-minimal/deploy/fix-yoast-country-redirects.php
```

Verificar: https://staging3.esitef.com/online/argentina/ y `/mexico/` deben devolver **200** (landing país).
