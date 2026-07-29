# ESITEF — Dark mode (design system)

Guía de referencia para tema oscuro en `esitef-platform`. Complementa [`design-system.md`](../../design-system.md) (tipografías, acentos por contexto, radios).

**Estado:** activo en producción desde julio 2026.

---

## Resumen

| Aspecto | Decisión |
|---------|----------|
| Activación | `data-theme` en `<html>`: `light`, `dark` o `system` |
| Preferencia por defecto | `system` → respeta `prefers-color-scheme` del SO |
| Persistencia | Cookie `esitef-a11y` (campo `theme`), 1 año |
| UI de usuario | Panel de accesibilidad (footer): Claro / Oscuro / Sistema |
| Fondo página (dark) | `#000000` (`--color-bg`) |
| Acento presencial en dark | Lavanda invertida: texto `#c4d0f2`, fondos `#2a3148` |
| Acento online en dark | Índigo suave: `--esitef-online-accent-on-soft: #a5b4fc` |

---

## Arquitectura runtime

```
Usuario elige tema (panel a11y)
        ↓
Cookie esitef-a11y { theme: "light"|"dark"|"system" }
        ↓
SSR (layout.tsx) → resolveHtmlAttrs() → data-theme en <html>
        ↓
Boot script (beforeInteractive) → evita flash; resuelve system → light/dark
        ↓
Cliente (AccessibilityInit) → applyA11yToDocument() + listener si theme=system
        ↓
CSS: html[data-theme="dark"] + html[data-theme="system"] @media (prefers-color-scheme: dark)
```

### Archivos TypeScript

| Archivo | Rol |
|---------|-----|
| `apps/web/src/lib/accessibility.ts` | Tipos, cookie, `resolveDomTheme()`, `applyA11yToDocument()` |
| `apps/web/src/app/layout.tsx` | SSR attrs, `generateViewport()`, boot script inline |
| `apps/web/src/components/AccessibilityInit.tsx` | Hidratación + listener `prefers-color-scheme` |
| `apps/web/src/components/AccessibilityPreferencesPanel.tsx` | Selector Claro / Oscuro / Sistema |

### Boot script (anti-FOUC)

Script inline en `layout.tsx` (`strategy="beforeInteractive"`). Lee la cookie `esitef-a11y` y, si `theme === "system"`, resuelve a `dark` o `light` según `matchMedia` antes del primer paint.

### Viewport

`generateViewport()` usa `resolveDomTheme()` con header `sec-ch-prefers-color-scheme` cuando está disponible:

- `colorScheme`: `dark` | `light` | `light dark` (cuando `data-theme="system"` sin hint del cliente)
- `themeColor`: `#000000` (dark) / `#ffffff` (light)

---

## Capas CSS

Orden de carga (de base a overrides):

1. **`globals.css`** — tokens en `html[data-theme="light"]`, `html[data-theme="dark"]` y duplicado en `@media (prefers-color-scheme: dark) { html[data-theme="system"] }`
2. **CSS por contexto** — reglas puntuales con `html[data-theme="dark"]` y/o `html[data-theme="system"]` + `@media` (p. ej. `navbar-v2.css`, `home.css`, `mentorias.css`, `presenciales-catalogo.css`)
3. **`dark-theme-overrides.css`** — importado **al final** de `globals.css`; overrides por área/página que no encajan solo con tokens

> **Regla:** preferir tokens (`--color-*`, `--esitef-*`) en componentes nuevos. Añadir override en `dark-theme-overrides.css` solo cuando el componente necesita jerarquía visual específica (acordeones lavanda, tabs país, etc.).

---

## Tokens globales

### Texto y superficies

| Token | Light | Dark |
|-------|-------|------|
| `--color-bg` | `#ffffff` | `#000000` |
| `--color-text-main` | `#282828` | `#f3f4f6` |
| `--color-text-muted` | `#696969` | `#9ca3af` |
| `--color-border` | `#e5e5e5` | `#2d3340` |
| `--color-border-subtle` | `rgba(0,0,0,0.06)` | `rgba(255,255,255,0.1)` |
| `--esitef-shell-bg` | `#f2f2f2` | `#16181e` |
| `--esitef-card-bg` | `#ffffff` | `#1a1d24` |
| `--esitef-glass-bg` | `rgba(255,255,255,0.72)` | `rgba(26,29,36,0.82)` |
| `--esitef-fade-edge` | `#ffffff` | `#000000` |

### Navegación

| Token | Light | Dark |
|-------|-------|------|
| `--esitef-nav-surface` | blanco translúcido | `rgba(26,29,36,0.9)` |
| `--esitef-nav-border` | blanco translúcido | `rgba(255,255,255,0.12)` |
| `--esitef-nav-shadow` | sombra índigo suave | sombra negra |

En dark: `backdrop-filter: none` en navbar (legibilidad).

### Online / hubs / dashboard

| Token | Light | Dark |
|-------|-------|------|
| `--esitef-online-accent-soft` | `#eff0ff` | `#1e2038` |
| `--esitef-online-accent-muted` | `#e8e9fd` | `#252847` |
| `--esitef-online-accent-on-soft` | `#3b42d9` | `#a5b4fc` |
| `--esitef-hub-surface` | `#f9f9f9` | `#16181e` |
| `--esitef-hub-breadcrumb-link` | — | `#9ca3af` |
| `--esitef-hub-breadcrumb-current` | — | `#f3f4f6` |
| `--dash-bg` | `#f4f5f8` | `#000000` |
| `--dash-card` | `#ffffff` | `#1a1d24` |
| `--dash-border` | `#e8eaef` | `#2d3340` |

### Token solo en overrides

| Token | Valor (dark) | Uso |
|-------|--------------|-----|
| `--esitef-course-card-bg` | `rgba(26, 29, 36, 0.85)` | Cards de curso, footer, acordeones home, módulos país |

Definido en `dark-theme-overrides.css` bajo `html[data-theme="dark"]`.

---

## Acentos por contexto en dark

Los hex de marca **no cambian** (`#e3203a` global, `#3b42d9` online). Lo que cambia es **cómo se aplican** sobre fondo oscuro.

### Presencial y país (`.presencial-page`, `.pais-page`)

Override en `dark-theme-overrides.css`:

| Token | Dark |
|-------|------|
| `--presencial-accent` | `#2a3148` |
| `--presencial-accent-hover` | `#3a4460` |
| `--presencial-accent-strong` | `#c4d0f2` |
| `--presencial-accent-strong-hover` | `#dce4f8` |

Patrón visual: items inactivos `rgba(36,41,56,0.95)`, activos `rgba(42,49,72,0.95)`, bordes `rgba(143,163,212,0.35)`.

### Home — único rojo en dark

Hero pill y cursor del texto animado usan `#ff2d4a` (más brillante que el rojo marca en light) para contraste sobre negro.

### FAQs / acordeones

Icono `+` / chevron: `#c4d0f2` (`#8fa3d4` en algunos contextos hub).

### Errores y estados

| Uso | Fondo | Texto | Borde |
|-----|-------|-------|-------|
| Error formulario | `#3b1518` | `#fca5a5` | `#7f1d1d` |
| Badge completado | `#142820` | `#86efac` | — |
| Badge progreso | `#1a2040` | `#a5b4fc` | — |
| Badge pendiente | `#2a2418` | `#fcd34d` | — |

---

## Cobertura por área

| Área / ruta | Archivo CSS principal | Notas dark |
|-------------|----------------------|------------|
| Global (body, hero, alto contraste) | `globals.css` | Tokens + `body`/`hero-section` |
| Navbar v2 | `navbar-v2.css`, `dark-theme-overrides.css` | Logo invertido, CTA lavanda desktop, items menú móvil |
| Home (Ofrecemos, blog, países) | `dark-theme-overrides.css`, `home.css` | Acordeón lavanda, `country-btn` outline |
| `/formaciones` | `dark-theme-overrides.css` | Card con borde tipo país |
| Hubs (talleres, MC, CFM) | `dark-theme-overrides.css` | Fondo unificado negro, FAQ cards |
| Presencial (landing curso) | `presencial.css`, `dark-theme-overrides.css` | Tokens lavanda, checkout CTA negro |
| Programa del curso | `course-syllabus.css`, `dark-theme-overrides.css` | Acordeón lavanda sin borde en item |
| País / sedes | `pais.css`, `dark-theme-overrides.css` | Módulo sedes, tabs, course cards |
| Catálogo presenciales | `presenciales-catalogo.css` | Títulos hero + cards docentes vía `system` media |
| Mentorías | `mentorias.css`, `dark-theme-overrides.css` | Tabs activos lavanda, contraste cards |
| Auth (`/login`) | `dark-theme-overrides.css` | Errores, placeholders |
| Contacto | `dark-theme-overrides.css` | Módulos shell/card, botón lavanda |
| Dashboard | `globals.css` tokens `--dash-*`, `dark-theme-overrides.css` | Badges de estado |
| Admin | `dark-theme-overrides.css` | Superficies `--admin-*` |
| PayPal checkout | `dark-theme-overrides.css` | Página completa + inputs |
| Descarga libro | `dark-theme-overrides.css` | Fondo negro, controles card |
| Landings online | `dark-theme-overrides.css` | Curriculum, avatares |
| Marketing / servicios | `dark-theme-overrides.css` | `.servicio-card` |

### Fuera del scope web (email)

Emails transaccionales usan tokens en `apps/web/src/lib/email-theme.ts`, alineados con esta paleta. Se adaptan con `@media (prefers-color-scheme: dark)` en el HTML del correo, no con `data-theme`.

**Guía completa:** [`docs/email/dark-mode.md`](../email/dark-mode.md) (arquitectura, logo dual, matriz de clientes, QA).

---

## Reglas para nuevos estilos

1. **No hardcodear** grises de texto (`#222`, `#444`): usar `--color-text-main` / `--color-text-muted`.
2. **Bordes:** `--color-border` o `--color-border-subtle`.
3. **Fondos de módulo:** `--esitef-shell-bg`, `--esitef-card-bg` o `--esitef-course-card-bg` en cards flotantes.
4. **Selector:** si el componente debe reaccionar a “sistema en oscuro”, duplicar regla:
   - `html[data-theme="dark"] .foo { … }`
   - `html[data-theme="system"] .foo { … }` + `@media (prefers-color-scheme: dark) { … }`
5. **Acentos de contexto** (online, presencial, auth): mantener el hex de marca; ajustar contraste (texto claro, bordes visibles).
6. **Evitar** `color-scheme` suelto en componentes; ya está en `html[data-theme]`.
7. **PayPal / terceros:** leer `data-theme` del documento si el widget necesita tema (ver `PayPalCheckoutPanel.tsx`).

---

## Verificación

```bash
# Self-check de resolución de tema
cd esitef-platform/apps/web && npx tsx src/lib/accessibility.check.ts

# Build
cd esitef-platform && npm run build
```

### Checklist visual manual

- [ ] Home: hero, acordeón Ofrecemos, botones país, blog
- [ ] `/formaciones` y un hub (talleres o masterclass)
- [ ] Landing presencial + programa del curso
- [ ] `/espana` (o sede) — tabs móvil y cards
- [ ] `/contacto`, `/login`
- [ ] Dashboard (badges)
- [ ] Panel a11y: cambiar Claro → Oscuro → Sistema y recargar
- [ ] SO en oscuro sin cookie: debe entrar en dark
- [ ] PayPal checkout (si aplica)

---

## Historial

| Fecha | Cambio |
|-------|--------|
| 2026-07 | Implementación completa de estilos dark por área |
| 2026-07 | Lanzamiento: eliminado `THEME_FORCE_LIGHT` y rutas `/preview/dark` \| `/preview/light` |
| 2026-07 | Selector de tema en panel de accesibilidad; default `system` |
