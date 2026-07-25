# Archivo — auth bridge WordPress

Tras el cutover a `esitef.com` con `WP_AUTH_BRIDGE_ENABLED=false`, estos runbooks quedan como referencia histórica:

- `SITEGROUND-CUTOVER-PASO-A-PASO.md` — secciones del mu-plugin y bridge
- `GO-LIVE-EXECUTION.md` — variables `WP_AUTH_BRIDGE_*`

Login actual: phpass local en [`credentials.ts`](../../apps/web/src/lib/auth/credentials.ts) + reset nativo en `/ingresar/olvidar`.
