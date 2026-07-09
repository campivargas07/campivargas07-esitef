# Plugins premium (opcional)

Coloca aquí `.zip` de plugins de pago y ejecuta:

```bash
./local-wp.sh plugins
```

Ejemplo:

- `tutor-pro.zip` (Themeum)
- `woocommerce-subscriptions.zip` — plan 3 cuotas presencial

Tras instalar Subscriptions, ejecuta el seed de productos presenciales:

```bash
docker compose run --rm wpcli wp eval-file wp-content/themes/esitef-minimal/deploy/seed-presencial-products.php
```
