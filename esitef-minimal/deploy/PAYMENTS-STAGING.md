# Pasarelas de pago en staging (modo TEST)

Ejecutar **inmediatamente después** de clonar producción a staging y subir el tema `1.6.0+`.

## Plugins requeridos

| Plugin | Slug WP | Uso |
|--------|---------|-----|
| WooCommerce | `woocommerce` | Carrito / checkout |
| WooCommerce Stripe Gateway | `woocommerce-gateway-stripe` | Tarjetas (resto del mundo) |
| WooCommerce PayPal Payments | `woocommerce-paypal-payments` | PayPal |
| Mercado Pago para WooCommerce | `woocommerce-mercadopago` | Argentina |
| WooCommerce Subscriptions | `woocommerce-subscriptions` | Plan 3 cuotas presencial (premium) |

En local: `./local-wp.sh plugins` instala los de wp.org. Subscriptions y Tutor Pro van en `local-plugins/*.zip`.

## PayPal

1. [developer.paypal.com](https://developer.paypal.com) → Sandbox accounts
2. WooCommerce → Pagos → PayPal → **Sandbox ON**
3. Client ID y Secret de la app Sandbox (no live)

## Stripe

1. Dashboard Stripe → Modo prueba
2. Claves `pk_test_...` y `sk_test_...` en WooCommerce → Stripe
3. Stripe es el motor de **Tarjeta de crédito/débito** (no se muestra como método aparte)

## Mercado Pago (Argentina)

1. [Mercado Pago Developers](https://www.mercadopago.com.ar/developers) → credenciales **test**
2. WooCommerce → Mercado Pago → modo prueba
3. En checkout, país de facturación **Argentina** → solo Mercado Pago (+ transferencia si está activa)
4. Tarjetas de prueba: documentación sandbox MP

## WooCommerce — Pago de prueba

Activar **Pago de prueba (test)** o **Transferencia bancaria** para smoke test sin pasarela externa.

## Productos presenciales (planes)

Tras activar el tema, ejecutar en SSH/staging:

```bash
cd ~/public_html/online
wp eval-file wp-content/themes/esitef-minimal/deploy/seed-presencial-products.php
```

Crea productos variables por instancia (reserva / 3-cuotas / completo) y guarda IDs en `esitef_presencial_wc_products`.

Instancias con checkout online en v1:

- `dolor-y-movimiento-cordoba` (ARS + Mercado Pago)
- `pedagogia-aplicada-montevideo` (USD)
- `dolor-y-movimiento-arbucies` (EUR)
- `evaluacion-dinamica-funcional-gdl` (MXN)

## Verificación

- [ ] Panel PayPal Sandbox muestra transacciones test
- [ ] Stripe test: tarjeta `4242 4242 4242 4242`
- [ ] MP test con país AR en facturación
- [ ] Curso online: inscribir → carrito → checkout branded
- [ ] Presencial Córdoba: plan → carrito → checkout
- [ ] Ningún cargo en cuenta live
- [ ] Ver `QA-CHECKLIST.md` sección Pagos

## Producción

**No ejecutar credenciales test en producción.** En cutover las credenciales live ya están en prod; solo cambia el tema y ejecuta el seed de productos presenciales si aún no existen.
