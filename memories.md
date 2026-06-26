# 📋 Memorias del Proyecto — ESITEF `inicio-nuevo.html`

> **Archivo:** [inicio-nuevo.html](file:///workspaces/campivargas-esitef/inicio-nuevo.html)
> **Sesión iniciada:** 2026-06-23 ~04:07 UTC
> **Última actualización:** 2026-06-25

---

## Cursor — Reglas y Skill globales (2026-06-25)

Configuración personal en `~/.cursor/` (aplica a todos los proyectos):

| Archivo | Función |
|---------|---------|
| `~/.cursor/rules/senior-web-persona.mdc` | 4 pilares: arquitecto, UI/UX, código producción, proactividad senior (`alwaysApply`) |
| `~/.cursor/rules/token-saver.mdc` | Concisión, ediciones quirúrgicas, grep + lectura por rangos (`alwaysApply`) |
| `~/.cursor/skills/senior-web-developer/SKILL.md` | Playbook: modos design/frontend/backend/fullstack, checklists, migración HTML→WP |
| `~/.cursor/skills/senior-web-developer/design-system.md` | Tokens, componentes reutilizables, contexto ESITEF |
| `~/.cursor/skills/senior-web-developer/frontend.md` | Patrones HTML/CSS/JS |
| `~/.cursor/skills/senior-web-developer/backend.md` | Patrones WordPress/PHP |

Modos en chat: `@tokens` | `@detalle` | `@review`. Si las rules no cargan en Agent Window, copiar contenido a **Cursor Settings → Rules → User Rules**.

---

## Índice de Cambios

| # | Hora (UTC) | Solicitud | Estado |
|---|------------|-----------|--------|
| 16 | 2026-06-25 | Reglas globales Cursor (Senior + Token Saver + Skill) | ✅ Completado |

| # | Hora (UTC) | Solicitud | Estado |
|---|------------|-----------|--------|
| 1 | 04:07 | Sección 2 — Fondo módulos accordion | ✅ Completado |
| 2 | 04:11 | Cómo correr el servidor en terminal | ✅ Completado |
| 3 | 04:15 | Corrección del fondo de módulos (7px borde) | ✅ Completado |
| 4 | 04:16 | Que el fondo englobe TODOS los módulos | ✅ Completado |
| 5 | 04:18 | Mobile: +5px al grosor + esquinas uniformes | ✅ Completado |
| 6 | 04:21 | Sección 1 Hero — Adaptar a pantalla completa | ✅ Completado |
| 7 | 04:24 | Incluir logos (marquee) dentro del Hero | ✅ Completado |
| 8 | 04:30 | Mobile: logos visibles + botones/texto 20% más grandes | ✅ Completado |
| 9 | 04:34 | Logos deben ir al fondo de la pantalla | ✅ Completado |
| 10 | 04:37 | Logos siguen fuera — tamaños correctos | ✅ Completado |
| 11 | 04:38 | Logos siguen mal | ✅ Completado |
| 12 | 05:27 | Ajustar espaciado del Hero (mobile) + Altura dinámica por script | ✅ Completado |
| 13 | 05:48 | Sección 3 — Blog de tarjetas escalonadas (staggered) y WP loop | ✅ Completado |
| 14 | 04:20 | Creación de landing page `mentorias.html` desde documento de texto | ✅ Completado |
| 15 | 16:15 | Actualización de diseño en `mentorias.html` (Hero, Tabs, Timeline) | ✅ Completado |

---

## Detalle por Solicitud

### 1. Sección 2 — Fondo módulos accordion
**Solicitud:** Quitar el color de background de la sección y mantenerlo blanco. Poner fondo `#f2f2f2` en los módulos del accordion con un efecto sutil al estar seleccionado. Aplicar tanto en desktop como mobile.

**Cambios realizados:**
- Se eliminó el background de la sección accordion completa → fondo blanco
- Se añadió `background: #f2f2f2` a cada módulo/card individual del accordion
- Se agregó transición sutil en el estado seleccionado (hover/active)

---

### 2. Correr servidor en terminal
**Solicitud:** ¿Cómo volver a correr el servidor?

**Respuesta:** `python3 -m http.server 8000` desde el directorio del proyecto.

> [!NOTE]
> El servidor sigue corriendo en segundo plano durante toda la sesión.

---

### 3. Corrección del fondo de módulos — borde de ~7px
**Solicitud:** El fondo `#f2f2f2` debe ser un "marco" de aproximadamente 7px alrededor de los módulos, no un fondo completo.

**Cambios realizados:**
- Se creó un contenedor `.accordion-container` con `background: #f2f2f2`
- Se aplicó `padding: 7px` para crear el efecto de borde/marco visual
- Los cards internos mantienen `background: #ffffff`

---

### 4. Fondo que englobe TODOS los módulos
**Solicitud:** El fondo `#f2f2f2` con 7px debe envolver a TODOS los módulos juntos en un solo bloque, no individualmente.

**Cambios realizados:**
- Se ajustó `.accordion-container` para ser un único `div` padre que contiene todos los accordion items
- El `padding: 7px` con `background: #f2f2f2` crea un marco visual unificado
- `border-radius` aplicado al contenedor padre

**Resultado:** ✅ El usuario confirmó "te quedó bien tal cual quería"

---

### 5. Mobile: +5px al grosor + esquinas uniformes
**Solicitud:** En mobile, aumentar 5px el grosor del marco del contenedor y verificar que las esquinas redondeadas sean uniformes.

**Cambios realizados:**
- Mobile: `padding` del `.accordion-container` pasó de 7px a 12px
- `border-radius` del contenedor exterior: 32px
- `border-radius` de los cards internos: 24px (diferencia de 8px = uniforme visualmente)

---

### 6. Sección 1 Hero — Adaptación a pantalla completa
**Solicitud:** Todo el Hero debe adaptarse al tamaño de pantalla del usuario. Los logos aparecen cortados. En mobile debería verse todo en la primera pantalla sin hacer scroll.

**Cambios realizados:**
- `.hero-section` cambió a `height: calc(100dvh - 120px)` (desktop)
- Se usó `dvh` (Dynamic Viewport Height) para cálculo preciso
- Se implementó `clamp()` para tipografía responsive
- Breakpoints optimizados: 991px, 768px, 380px

---

### 7. Incluir logos (marquee) dentro del Hero
**Solicitud:** "Debes incluir los logos en esta sección, tenlo muy en cuenta."

**Cambios realizados:**
- **HTML:** Se movió `<section class="marquee-section">` dentro de `<section class="hero-section">`
- **Estructura nueva:**
  ```
  hero-section (flex column, 100dvh - header)
  ├── hero-bg (background decorativo)
  ├── hero-body (flex: 1, contiene hero-inner)
  │   └── hero-inner (grid: título + botones)
  └── marquee-section (flex-shrink: 0, al fondo)
  ```
- Se eliminó la sección marquee independiente que existía entre Hero y Accordion
- `.marquee-section` ahora tiene `background: transparent` (antes tenía gradiente)

---

### 8. Mobile: Botones y texto 20% más grandes + logos visibles
**Solicitud:** Botones de países y Online ~20% más grandes. Encabezado y subtítulo más grandes. Respetar que el título animado siempre se mantenga en 2 líneas.

**Cambios realizados — Tamaños (APROBADOS ✅):**
- Botones países: `17px → 20px`, padding `10px 28px → 12px 34px`, min-width `140 → 168px`
- Botón Online: `18px → 22px`, padding `14px 40px → 17px 48px`
- Título: `clamp(36-56px) → clamp(40-62px)`
- Subtítulo: `clamp(14-16px) → clamp(15-18px)`

> [!IMPORTANT]
> El usuario confirmó: "lo agrandaste bien a un tamaño perfecto" — NO modificar estos tamaños.

---

### 9–11. Logos del marquee fuera de la pantalla en mobile
**Problema persistente:** Los logos del marquee se cortan en la parte inferior y no son visibles sin hacer scroll en mobile.

**Solución definitiva aplicada:**
1. **Cálculo de altura de header en móvil:** Se analizó el header flotante (el cual ocupa `100px` de altura vertical con su margen de `15px`, padding de `15px` superior/inferior, y el logo de `40px`).
2. **Ajuste de altura del Hero:** Se cambiaron los cálculos en media queries a `height: calc(100dvh - 100px)` (descontando de forma exacta la altura completa del header).
3. **Remoción de `min-height` restrictivos:** Se anuló el `min-height` restrictivo (`min-height: 0`) para evitar que el Hero se desbordara en dispositivos con pantallas más bajas.
4. **Centrado y redistribución de espacio en móvil:** Se cambió `justify-content` a `center` en `.hero-body` en móviles, removiendo paddings fijos muy grandes y mejorando el balance visual.

**Resultado:** ✅ Completado y verificado. Los logos y botones encajan perfectamente en la primera pantalla en dispositivos móviles sin requerir scroll.

---

### 12. Ajustar espaciado del Hero (mobile) + Altura dinámica por script
**Solicitud:** Ajustar el espaciado interno del Hero en mobile (30px entre encabezado/subtítulo, 40px entre subtítulo/botones, 25px entre filas de botones y 40px hacia los logos del marquee) y garantizar que la sección se adapte de forma dinámica sin desbordes.

**Cambios realizados:**
1. **Distribución de espaciado específica en Mobile:**
   - **Encabezado ↕ 30px ↕ Texto general:** Se aplicó `margin-top: 30px` (en 991px), `margin-top: 26px` (en 768px) y `margin-top: 22px` (en 420px) en `.hero-subtitle`.
   - **Texto general ↕ 40px ↕ Botones:** Se ajustó el `gap` de `.hero-inner` a `40px` (en 991px), `36px` (en 768px) y `30px` (en 420px).
   - **Filas de botones (25px entre sí):** Se aplicó `gap: 25px` (en 991px), `gap: 22px` (en 768px) y `gap: 18px` (en 420px) en `.hero-paises`.
   - **Botones ↕ 40px ↕ Logos:** Se ajustó el `padding` vertical de `.marquee-section` a `40px` (en 991px), `36px` (en 768px) y `28px` (en 420px).
2. **Ajuste dinámico con Javascript para Altura Perfecta:**
   - Se implementó la función `ajustarHero()` en JS para calcular el espacio disponible exacto: `window.innerHeight - topHero` (restando dinámicamente la posición superior del Hero).
   - Se asoció la función a los eventos `DOMContentLoaded`, `load`, `resize`, y `visualViewport` (resize y scroll) para recalcular la altura si cambian las barras de navegación en dispositivos móviles (Safari/Chrome).

**Resultado:** ✅ Todo se adapta perfectamente en una sola pantalla sin necesidad de scroll en móviles, con los espaciados exactos solicitados por el usuario.

---

### 13. Sección 3 — Blog de tarjetas escalonadas (staggered) y WP loop
**Solicitud:** Implementar la Sección 3 (Blog) con diseño modular de tarjetas escalonadas (staggered) en desktop, fondo blanco de sección, fondo gris claro (`#f2f2f2`) para las tarjetas, y dejar la integración dinámica lista para WordPress.

**Cambios realizados:**
1. **Diseño de Tarjetas en Prototipo:**
   - Se añadieron estilos CSS para `.blog-section`, `.blog-grid` y `.blog-card` con fondo `#f2f2f2`, bordes redondeados (`border-radius: 32px`), min-height de `450px` y transición hover.
   - Desktop: Se aplicó un escalonamiento secuencial mediante `transform: translateY()` (`0`, `40px` y `80px` respectivamente).
   - Se agregó comillas decorativas `“` y miniatura de imagen con sombra.
   - Se añadió el botón "Ver todos los artículos" con un espaciado superior holgado (`margin-top: 140px`) para evitar superposiciones con las tarjetas staggered.
2. **Integración del Tema WordPress:**
   - Se actualizaron los estilos del front-page en [front-page.php](file:///workspaces/campivargas-esitef/esitef-minimal/front-page.php).
   - Se remplazó la sección estática anterior con la estructura premium y un bucle dinámico `WP_Query` para renderizar los posts activos del blog de WordPress con el mismo diseño.

**Resultado:** ✅ Completado. El diseño queda estandarizado y listo para desplegar de forma dinámica.

---

### 14. Creación de landing page `mentorias.html`
**Solicitud:** Analizar un documento de texto con la propuesta de "Mentorías con Tomás" y generar ideas de estructura, para luego maquetarlo en una nueva página `mentorias.html` siguiendo la misma línea visual premium del resto del sitio.

**Cambios realizados:**
1. **Extracción y Estructuración:**
   - Se procesó el texto en bruto y se segmentó en bloques clave: Hero, Para quién es / no es, Beneficios, Proceso, Precio, Perfil y Testimonios.
2. **Reutilización Base:**
   - Se inyectó dinámicamente el mismo Header v7.5 y Footer del archivo `inicio-nuevo.html` garantizando cohesión.
3. **Diseño de Secciones:**
   - **Hero:** Full-screen (`100dvh`) con fondo sutil y tipografía animada (clamp).
   - **Contraste:** Tarjetas duales para "Quién sí" y "Quién no" con acento rojo.
   - **Beneficios:** Grid responsivo con íconos vectoriales SVG limpios.
   - **Pasos:** Proceso numerado (1 y 2) con números gigantes decorativos y una tarjeta oscura destacada (inverted colors) para el precio (695€).
   - **Perfil:** Tarjeta apaisada con la biografía ampliada y un placeholder de imagen.
   - **Testimonios:** Tarjetas minimalistas adornadas con comillas decorativas tipográficas grandes.

**Resultado:** ✅ Se creó el archivo `mentorias.html` que integra un diseño moderno, respetando CSS variables y breakpoints pre-existentes.

---

### 15. Actualización de diseño estructural en `mentorias.html`
**Solicitud:** Implementar cambios visuales profundos solicitados por el cliente basándose en *mockups* de referencia (`background.png` y `ayudar.png`).

**Cambios realizados:**
1. **Hero Section:**
   - Se reemplazó el fondo anterior por un patrón lineal estilo "stripe" sutil sobre un fondo crema (`#f7f6f2`).
   - Se ajustó el texto del subtítulo a "para profesionales que se atreven a pensar diferente" y se incrementó su tamaño un 20%.
2. **Sección Contraste:**
   - Se ajustó el espaciado (padding/gap 10px en contenedor general) manteniendo el estilo de diseño.
   - Se agregaron fotografías descriptivas con `border-radius: 16px` encabezando cada tarjeta de "Para quién sí" y "Para quién no".
3. **Sección "Ayudar" (Beneficios):**
   - Se transformó completamente el grid a un diseño de navegación por *Tabs* (pestañas tipo "pill") y un contenedor inferior con contenido animado.
   - Se agregó código Javascript personalizado (Vanilla JS) para manejar la lógica del cambio de estado `active` en pestañas y contenidos.
   - Cada pestaña muestra una imagen descriptiva (Unsplash) y un "badge" dinámico para realzar la estética.
4. **Sección "Proceso" (Timeline):**
   - Se cambió el diseño escalonado clásico por una estructura vertical estilo *Timeline* (Línea de tiempo) unida por un borde lateral y decoradores circulares estilo "bullet".

**Resultado:** ✅ Completado. El diseño ha evolucionado para verse aún más "premium", con interacciones dinámicas de Javascript en la sección de beneficios.

---

## 🔧 Decisiones Técnicas

| Decisión | Detalle |
|----------|---------|
| Unidad de altura | `dvh` (Dynamic Viewport Height) en lugar de `vh` para manejo correcto de barras de navegador móvil |
| Tipografía responsive | `clamp()` para escalado fluido sin media queries extras |
| Contenedor accordion | Un solo `div.accordion-container` con padding 7px (12px mobile) como "marco" |
| Esquinas uniformes | Diferencia de ~8px entre border-radius exterior (32px) e interior (24px) |
| Estructura Hero | Flex column: hero-body (flex:1) + marquee-section (flex-shrink:0) |
| Altura dinámica Hero | Cálculo en JS (`window.innerHeight - topHero`) adaptativo para móvil |
| Diseño Staggered | Desfase secuencial en desktop de 0, 40px y 80px y margen inferior holgado para evitar colisión de contenidos |

---

## 📂 Archivos Modificados

| Archivo | Líneas clave |
|---------|-------------|
| [inicio-nuevo.html](file:///workspaces/campivargas-esitef/inicio-nuevo.html) | Todo el proyecto (CSS + HTML en un solo archivo) |
| | Líneas ~591-920: CSS del Hero + Responsive |
| | Líneas ~920-1100: CSS del Accordion |
| | Líneas ~1130-1300: CSS del Blog (Sección 3) |
| | Líneas ~1210-1300: HTML del Hero (incluye marquee) |
| | Líneas ~1300+: HTML del Accordion |
| | Líneas ~1590+: HTML del Blog (Sección 3) con tarjetas y dummy text |
| | Líneas ~1730+: Script JS de ajuste dinámico de Hero |
| [front-page.php](file:///workspaces/campivargas-esitef/esitef-minimal/front-page.php) | Plantilla principal del tema WordPress |
| | Líneas ~90-250: Integración de estilos del blog y bucle WP_Query dinámico |
| [mentorias.html](file:///workspaces/campivargas-esitef/mentorias.html) | Nueva landing page |
| | Estilos modulares añadidos y estructura de contenido basada en el Google Doc |

---

## 🖥️ Servidor de Desarrollo

```bash
python3 -m http.server 8000
# URL: http://localhost:8000/inicio-nuevo.html
```

---

## 📌 Notas para Continuar

1. **Próximas tareas:** Mantener el control de las alturas relativas en la primera pantalla si se agregan más elementos al Hero.
2. **No tocar:** Los tamaños de botones, textos y la estructura del acordeón de módulos ya están aprobados y no requieren cambios adicionales.
3. **Patrón de diseño:** Continuar con el estilo minimalista, sutil y limpio definido en las memorias.
