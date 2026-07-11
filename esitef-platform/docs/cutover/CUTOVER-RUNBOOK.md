# Ensayo de corte — ESITEF Platform

## Checklist previo al corte

1. [ ] Backup verificable de MySQL WordPress + wp-content/uploads
2. [ ] WordPress/Tutor en modo solo lectura
3. [ ] Ejecutar `npm run etl:extract` + `npm run etl:load` (delta)
4. [ ] Ejecutar `npm run etl:reconcile` — sin issues bloqueantes
5. [ ] Webhooks Stripe/PayPal de producción activos
6. [ ] DNS apuntando a Next.js
7. [ ] Puente auth WordPress activo (2–4 semanas)
8. [ ] Monitoreo Sentry + alertas webhooks fallidos
9. [ ] Plan de rollback documentado

## Comandos

```bash
cd esitef-platform
npm run cutover:rehearse   # audit + extract + load + reconcile
npm run cutover:delta      # solo importación delta
npm run cutover:checklist  # imprimir checklist
```

## Rollback

1. Restaurar DNS a WordPress
2. Quitar modo solo lectura
3. Desactivar webhooks de producción en Stripe/PayPal
4. Mantener PostgreSQL como respaldo (no borrar hasta validación)

## Post-corte (semanas 1–4)

- Monitorear accesos, pagos, webhooks diariamente
- Retirar puente de contraseñas cuando >95% usuarios activos hayan iniciado sesión
- Archivar WordPress tras backup final y retención legal
