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
| Título principal (`h1 b`) | Bricolage Grotesque | 700 | «Formación en Dolor y Movimiento» |
| Subtítulo del título (`h1` tras `b`) | Bricolage Grotesque | 200 | «Nuevos paradigmas desde la evidencia» |
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

| Token | Hex | Uso |
|-------|-----|-----|
| `--color-bg` | `#ffffff` | Fondo página |
| `--color-text-main` | `#282828` | Texto principal |
| `--color-text-muted` | `#696969` | Subtítulos, metadatos |
| `--color-border` | `#e5e5e5` | Bordes, divisores |
| `--color-primary` | `#e3203a` | Marca ESITEF (legacy / país / CTAs globales) |
| `--color-primary-hover` | `#b3192e` | Hover rojo marca |

### Superficies (módulos shell + card)

| Token | Valor |
|-------|-------|
| `--esitef-shell-bg` | `#f2f2f2` |
| `--esitef-shell-radius` | `36px` |
| `--esitef-card-bg` | `#ffffff` |
| `--esitef-card-radius` | `28px` |

---

### Formaciones online

Acento morado/índigo — hubs, landings, dashboard y aula.

| Token | Hex | Uso |
|-------|-----|-----|
| `--esitef-online-accent` | `#3b42d9` | CTAs, acentos dashboard |
| `--esitef-online-accent-hover` | `#2f35b8` | Hover |
| `--esitef-online-accent-soft` | `#eff0ff` | Fondos suaves |
| `--esitef-online-accent-muted` | `#e8e9fd` | Bordes / tintes |

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

Usa `--color-primary` (`#e3203a`) para tabs activos, eyebrows y acentos del módulo Grovia (`pais.css`). Pendiente de alinear con tokens presenciales lavanda si se unifica la marca.

---

## Separación de contextos

| Contexto | Acento principal | Archivo CSS |
|----------|------------------|-------------|
| Global / marca | `#e3203a` | `globals.css` |
| Online (hubs, cursos, dashboard) | `#3b42d9` | `formacion-hub.css`, `globals.css` |
| Presencial (landing curso) | `#c4d0f2` + `#3d4f7c` | `presencial.css` |
| País / sedes | `#e3203a` (por ahora) | `pais.css` |
| Auth | `#e3203a` (focus, CTA) | `auth.css` |

---

## Próximos pasos (TODO)

- [x] Unificar `--font-body` → Inter Tight 400 en `:root`
- [ ] Decidir si país/presencial comparten la misma paleta lavanda
- [ ] Documentar radios, sombras y espaciado
- [ ] Mapear componentes (hero, pricing cards, accordion, CTAs)
- [ ] Sincronizar con `esitef-minimal` (tema WordPress de referencia)
