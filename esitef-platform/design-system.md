# ESITEF Platform — Design System (borrador)

Documento inicial de tipografías y colores usados en `esitef-platform`. Se irá ampliando (espaciado, componentes, radios, etc.).

**Fuente de verdad en código:** `apps/web/src/app/globals.css` y los CSS por contexto en `apps/web/src/styles/`.

---

## Tipografías

Cargadas vía Google Fonts en `globals.css`:

| Familia | Pesos | Rol |
|---------|-------|-----|
| **Bricolage Grotesque** | 200–800 | Títulos, precios, display |
| **Inter Tight** | 300–600 (base **400**) | Cuerpo, descripciones, UI; nombres/precios en cards presencial |
| **Inconsolata** | 400–700 | Labels, eyebrows, badges, títulos de sección presencial |

### Uso por contexto

| Rol | Familia | Ejemplo |
|-----|---------|---------|
| Títulos de sección presencial | Inconsolata 700 | «Elige tu forma de pago», «Programa», «Docentes» |
| Nombre de plan (presencial) | Inter Tight 300 | «Reserva», «3 cuotas mensuales», «Pago completo» |
| Precio de plan (presencial) | Inter Tight 500 | «100 EUR», «3 × 142 EUR», «425 EUR» |
| Cuerpo y párrafos | Inter Tight 400 | Misión, stats, formularios, UI general |
| Metadatos / UI pequeña | Inter Tight 400, 13–14px | Breadcrumbs, notas de checkout |
| Eyebrows / badges | Inconsolata uppercase | «Recomendado» |
| Precios destacados (online) | Bricolage Grotesque 600 | Pricing hubs |

### Hero presencial (`.course-hero`)

| Elemento | Familia | Peso | Ejemplo |
|----------|---------|------|---------|
| Eyebrow (`.subtitle`) | Inter Tight | 300 | «Formación» |
| Título principal (`.hero-title-main`) | Bricolage Grotesque | 700 | «Dolor y Movimiento» |
| Subtítulo del título (`.hero-title-sub`) | Bricolage Grotesque | 200 | «Nuevos paradigmas desde la evidencia» |
| Meta fechas / horario / lugar (`.hero-meta-value`) | Inter Tight | 300 | «10, 11, 12 y 13 DIC 2026» |

Espaciado: `.subtitle` con `margin-bottom: 10px` (8px en mobile) para acercar «Formación» al título.

Variables globales (`:root`):

```css
--font-heading: "Bricolage Grotesque", sans-serif;
--font-body: "Inter Tight", sans-serif;
--font-ui: "Inter Tight", sans-serif;
```

---

## Colores

### Base (global)

| Token | Hex (light) | Uso |
|-------|-------------|-----|
| `--color-bg` | `#ffffff` | Fondo página |
| `--color-text-main` | `#282828` | Texto principal |
| `--color-text-muted` | `#696969` | Subtítulos, metadatos |
| `--color-border` | `#e5e5e5` | Bordes, divisores |
| `--color-border-subtle` | `rgba(0,0,0,0.06)` / dark `rgba(255,255,255,0.1)` | Divisores suaves (menú móvil, listas) |
| `--color-primary` | `#e3203a` | Marca ESITEF (auth, CTAs globales) |
| `--color-primary-hover` | `#b3192e` | Hover rojo marca |

Dark mode **desactivado en runtime** (`THEME_FORCE_LIGHT = true` en `accessibility.ts`): el sitio siempre usa `data-theme="light"`, aunque el SO esté en oscuro o la cookie guarde `dark`/`system`. El CSS `html[data-theme="dark"]` queda en el repo para reactivarlo poniendo `THEME_FORCE_LIGHT = false` y restaurando el selector de tema en el panel de accesibilidad.

### Superficies (módulos shell + card)

| Token | Light | Dark |
|-------|-------|------|
| `--esitef-shell-bg` | `#f2f2f2` | `#16181e` |
| `--esitef-shell-radius` | `36px` | — |
| `--esitef-card-bg` | `#ffffff` | `#1a1d24` |
| `--esitef-card-radius` | `28px` | — |
| `--esitef-glass-bg` | `rgba(255,255,255,0.72)` | `rgba(26,29,36,0.82)` |
| `--esitef-fade-edge` | `#ffffff` | `#111318` |
| `--esitef-nav-surface` | `var(--esitef-glass-bg)` | `transparent` |
| `--esitef-nav-border` | `var(--esitef-glass-border)` | `var(--color-border-subtle)` |
| `--esitef-nav-shadow` | `0 8px 32px rgba(59,66,217,0.08)` | `none` |

---

### Formaciones online

Acento morado/índigo — hubs, landings, dashboard y aula.

| Token | Hex | Uso |
|-------|-----|-----|
| `--esitef-online-accent` | `#3b42d9` | CTAs, acentos dashboard |
| `--esitef-online-accent-hover` | `#2f35b8` | Hover |
| `--esitef-online-accent-soft` | `#eff0ff` | Fondos suaves |
| `--esitef-online-accent-muted` | `#e8e9fd` | Bordes / tintes |
| `--esitef-online-accent-on-soft` | `#3b42d9` / dark `#a5b4fc` | Texto sobre `accent-soft` (p. ej. pill MXN) |

Alias en hubs (`formacion-hub.css`):

| Token | Hex |
|-------|-----|
| `--esitef-hub-accent` | `#3b42d9` |
| `--esitef-hub-accent-hover` | `#2f35b8` |
| `--esitef-hub-surface` | `#f9f9f9` |

Breadcrumbs online: grises (`#666` → `#111`), sin rojo ni morado en enlaces.

---

### Formaciones presenciales

Acento lavanda — páginas bajo `.presencial-page` (`presencial.css`).

| Token | Hex | Uso |
|-------|-----|-----|
| `--presencial-accent` | `#c4d0f2` | Fondos de botones, hero |
| `--presencial-accent-hover` | `#a8b8e8` | Hover suave |
| `--presencial-accent-strong` | `#3d4f7c` | Texto, bordes, badge, hover sólido |
| `--presencial-accent-strong-hover` | `#2f3f66` | Hover texto / hero |

> El acento principal es claro; los elementos interactivos usan `--presencial-accent-strong` para contraste legible.

---

### País / sedes presenciales

Misma paleta lavanda que presencial — tokens en `.pais-page` (`pais.css`). Tabs activos, course-type y acentos del módulo Grovia usan `--presencial-accent-strong`.

| Token | Hex | Uso |
|-------|-----|-----|
| `--presencial-accent` | `#c4d0f2` | Fondos suaves (heredado de presencial) |
| `--presencial-accent-strong` | `#3d4f7c` | Tabs activos, eyebrows, course-type |

---

## Separación de contextos

| Contexto | Acento principal | Archivo CSS |
|----------|------------------|-------------|
| Global / marca | `#e3203a` | `globals.css` |
| Online (hubs, cursos, dashboard) | `#3b42d9` | `formacion-hub.css`, `globals.css` |
| Presencial (landing curso) | `#c4d0f2` + `#3d4f7c` | `presencial.css` |
| País / sedes | `#c4d0f2` + `#3d4f7c` | `pais.css` |
| Auth | `#e3203a` (focus, CTA) | `auth.css` |

---

## Reglas CSS (dark mode)

- **No hardcodear** `#222`, `#444`, `#1a1a1a` para texto: usar `--color-text-main` / `--color-text-muted`.
- Bordes y divisores: `--color-border` o `--color-border-subtle` (no `rgba(0,0,0,0.06)` ni `#ebebeb` sueltos).
- Placeholders / thumbs vacíos: `--esitef-shell-bg`.
- Acento de marca (rojo global, índigo online, lavanda presencial) se mantiene; ajustar **cómo** se aplica sobre fondos oscuros (texto claro, bordes visibles).

---

## Radios y sombras

| Token / patrón | Valor | Uso |
|----------------|-------|-----|
| `--esitef-shell-radius` | `36px` | Módulos shell (`.shell`, `.esitef-module-shell`) |
| `--esitef-card-radius` | `28px` | Cards (`.card`, `.esitef-module-card`) |
| `--esitef-nav-shadow` | morado suave / `none` en dark | Navbar glass (`header.css`, `navbar-v2.css`) |
| Cards hover | `0 8px 24px rgba(0,0,0,0.06)` | Course cards, tabs (valor fijo por ahora) |
| Dashboard card hover | `0 8px 24px rgba(0,0,0,0.06)` | `dashboard.css` |

---

## Espaciado (inventario)

Patrones recurrentes ya en uso — no hay escala de tokens dedicada aún.

| Contexto | Valor | Archivo |
|----------|-------|---------|
| Stage país / presencial | `gap: 32px`, padding `clamp(16px, 5vh, 44px) 24px 32px` | `pais.css`, `presencial.css` |
| Grid país | `gap: 10px`, `min-height: 460px` | `pais.css` |
| Tabs país | `gap: 8px`, padding tab `16px 18px` | `pais.css` |
| Sección lateral estándar | `padding: 24px` | varios marketing |
| Dashboard main | `1.25rem 1rem` mobile → `2rem 2.25rem` desktop | `dashboard.css` |
| Learn main | `1.25rem 1.5rem 3rem` | `learn.css` |

---

## Mapa de componentes

| Componente | CSS principal | Tokens clave |
|------------|---------------|--------------|
| Hero home | `home.css` | `--color-bg`, `--color-border` (dots) |
| Navbar v2 | `navbar-v2.css`, `header.css` | `--esitef-nav-surface`, `--esitef-nav-border`, `--esitef-nav-shadow` |
| Hero presencial | `presencial.css` | `--presencial-accent*`, tipografías hero |
| Pricing presencial | `presencial.css` | `--presencial-accent`, `--presencial-accent-strong` |
| Hub online | `formacion-hub.css` | `--esitef-hub-accent*`, `--esitef-online-accent*` |
| País / sedes | `pais.css` | `--presencial-accent-strong`, `--esitef-card-bg` |
| Accordion home | `home.css` + `HomeAccordion` | `--esitef-card-bg`, `--esitef-shell-bg` |
| Dashboard shell | `dashboard.css` | `--dash-*` (alias de tokens online) |
| Aula / learn | `learn.css` | `--learn-accent*` (alias online), `--color-border` |
| CTAs globales | `globals.css` `.btn-primary` | `--color-primary` |
| CTAs contexto | CSS por página | accent del contexto (online, presencial, auth) |

---

## Próximos pasos (TODO)

- [x] Unificar `--font-body` → Inter Tight 400 en `:root`
- [x] Unificar país/presencial con paleta lavanda
- [x] Documentar radios, sombras y espaciado
- [x] Mapear componentes (hero, pricing cards, accordion, CTAs)
