# Icono ESITEF en la bandeja de correo (BIMI)

El logo **dentro** del cuerpo del email usa `<img src="https://app.esitef.com/img/...">` (ya implementado).

El icono **junto al remitente** en Gmail/Apple Mail requiere **BIMI** (Brand Indicators for Message Identification): configuración DNS + logo SVG público. No se controla desde el código de Next.js.

**DNS de ESITEF:** SiteGround → **Site Tools → Domain → DNS Zone Editor** (zona `esitef.com`).

## Requisitos previos

1. **Dominio de envío verificado en Resend** (`esitef.com`) con SPF y DKIM en verde.
2. **DMARC en enforcement** en `esitef.com` (ver pasos SiteGround abajo).
3. **Logo BIMI** servido en HTTPS tras deploy en Vercel:
   - URL: `https://app.esitef.com/bimi/logo.svg`
   - Archivo en repo: `apps/web/public/bimi/logo.svg`

## Paso a paso en SiteGround

### 1. Abrir el editor DNS

1. [my.siteground.com](https://my.siteground.com) → sitio **esitef.com**.
2. **Site Tools → Domain → DNS Zone Editor**.

No borres registros de Resend (`send`, DKIM) ni el CNAME de `app` → Vercel si ya están bien.

### 2. DMARC (si no existe o está en `p=none`)

**Crear o editar** registro TXT:

| Campo SiteGround | Valor |
|------------------|--------|
| **Type** | TXT |
| **Name** | `_dmarc` |
| **TTL** | 3600 (o Default) |
| **Value** | `v=DMARC1; p=quarantine; rua=mailto:info@esitef.com; pct=100; adkim=s; aspf=s` |

SiteGround suele mostrar el nombre completo como `_dmarc.esitef.com` — correcto.

Si ya tienes `_dmarc`, cambia solo `p=none` → `p=quarantine` (o `reject` cuando estéis seguros).

### 3. Registro BIMI

**Añadir** registro TXT nuevo:

| Campo SiteGround | Valor |
|------------------|--------|
| **Type** | TXT |
| **Name** | `default._bimi` |
| **TTL** | 3600 |
| **Value** | `v=BIMI1; l=https://app.esitef.com/bimi/logo.svg;` |

El valor va **en una sola línea**, sin comillas en el panel (SiteGround las añade al guardar si hace falta).

### 4. Resend (comprobar, no duplicar)

En Resend → **Domains → esitef.com** deben estar verificados los registros que Resend te dio (SPF en `send` o raíz, DKIM `resend._domainkey`, etc.). Cópialos tal cual en SiteGround si falta alguno.

### 5. Deploy y prueba

1. Deploy a Vercel (Production) con `public/bimi/logo.svg`.
2. Abrir en el navegador: `https://app.esitef.com/bimi/logo.svg` (debe verse el icono).
3. Esperar propagación DNS (5 min – 48 h; SiteGround suele ser rápido).
4. Validar en [BIMI Group lookup](https://bimigroup.org/bimi-generator/) con dominio `esitef.com`.
5. Enviar email de prueba desde `noreply@esitef.com` y revisar bandeja en móvil.

## VMC (opcional, Gmail)

Si más adelante contratáis **Verified Mark Certificate** (certificado de marca):

```txt
v=BIMI1; l=https://app.esitef.com/bimi/logo.svg; a=https://app.esitef.com/bimi/vmc.pem;
```

Subid `vmc.pem` a `public/bimi/` o CDN y actualizad el TXT `default._bimi` en SiteGround.

## Compatibilidad por cliente

| Cliente | BIMI sin VMC | Notas |
|---------|----------------|-------|
| Apple Mail (iOS/macOS) | A menudo sí | Con DMARC + BIMI TXT |
| Yahoo / AOL | Parcial | DMARC estricto |
| Gmail | Suele requerir **VMC** | Logo en bandeja no garantizado sin certificado |

## Checklist rápido

- [ ] Resend: dominio `esitef.com` verified
- [ ] SiteGround: SPF + DKIM (Resend) en DNS Zone Editor
- [ ] SiteGround: `_dmarc` TXT con `p=quarantine` o `reject`
- [ ] SiteGround: `default._bimi` TXT apuntando a `logo.svg`
- [ ] Vercel: `https://app.esitef.com/bimi/logo.svg` accesible
- [ ] (Opcional Gmail) VMC + `a=` en BIMI

## Referencias en el repo

- Cutover DNS SiteGround: [`docs/cutover/SITEGROUND-CUTOVER-PASO-A-PASO.md`](../cutover/SITEGROUND-CUTOVER-PASO-A-PASO.md) (sección E.2)
- Email Resend: [`docs/cutover/GO-LIVE-EXECUTION.md`](../cutover/GO-LIVE-EXECUTION.md)
