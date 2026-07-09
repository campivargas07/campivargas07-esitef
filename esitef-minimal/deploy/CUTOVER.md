# Cutover producción — Fase 5

1. **Backup** archivos + BD producción
2. `./deploy/upload-theme.sh` apuntando a producción `REMOTE_THEME_PATH`
3. Apariencia → Temas → ESITEF Minimal (v1.6.0+)
4. Replicar páginas/menús desde staging si aplica
5. **Checkout presencial:** ejecutar seed de productos (una vez):

```bash
cd ~/public_html/online
wp eval-file wp-content/themes/esitef-minimal/deploy/seed-presencial-products.php
```

6. Verificar pasarelas **live** (Stripe, PayPal, Mercado Pago AR) — no usar credenciales test
7. Smoke test:
   - Home, login, carrito online
   - Compra test mínima o reverificar en staging si no hay ventana
   - Presencial Córdoba con Mercado Pago
8. 301 raíz en `.htaccess` de `esitef.com`:

```apache
Redirect 301 / https://esitef.com/online/
```

9. Mantener tema anterior 48h para rollback (reactivar en Apariencia)

**Rollback:** reactivar tema anterior — no tocar BD si no hubo cambios de contenido.
