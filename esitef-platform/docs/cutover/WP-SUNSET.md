# Sunset WordPress — tras smoke OK en `esitef.com`

Ejecutar **solo** cuando `test:cutover-smoke` y login/compra manual pasen en producción.

## Mismo día del corte

1. **PHP off** en `esitef.com` y `esitef.com/online` (Site Tools o `index.html` estático “Visita esitef.com”)
2. **Mantener** `assets.esitef.com` sirviendo uploads
3. **No borrar** MySQL — export cold storage / backup panel
4. Retirar mu-plugins inertes (`esitef-auth-bridge.php`, `esitef-readonly.php`) o dejar con PHP off

## Vercel

- `WP_AUTH_BRIDGE_ENABLED=false`
- Sin `WP_AUTH_BRIDGE_URL` / `WP_AUTH_BRIDGE_SECRET`

## Semanas 1–4

- Monitorear Sentry + webhooks Stripe/PayPal
- `app.esitef.com` → 301 al apex; retirar dominio cuando tráfico < 1%
- Email transaccional (Resend) sigue en DNS SiteGround — no cancelar MX

## Archivar

Mover runbooks del bridge a `docs/cutover/archive/` cuando login estable sin WP.
