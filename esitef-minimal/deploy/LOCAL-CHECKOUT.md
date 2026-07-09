# Checkout local (Docker)

## Arranque rápido

```bash
./local-wp.sh setup      # primera vez
./local-wp.sh checkout   # shortcodes clásicos + productos presencial + pago de prueba
```

WordPress: **http://localhost:8080**  
En Codespace: pestaña **Ports → 8080 → Open in Browser** (no uses localhost en tu PC).

Admin: usuario existente en la BD local (p. ej. `campivargas`) o crea uno en `/wp-admin`.

## Probar el checkout branded

### Curso online (producto de prueba)

1. http://localhost:8080/?add-to-cart=51  
2. http://localhost:8080/cart/  
3. http://localhost:8080/checkout/

### Presencial (planes)

Tras `./local-wp.sh checkout`, los productos variables ya existen.  
URL ejemplo (plan 3 cuotas, Córdoba):

```
http://localhost:8080/cart/?add-to-cart=81&variation_id=83&esitef_presencial_instance=dolor-y-movimiento-cordoba&esitef_payment_plan=3-cuotas
```

(Requiere login si no estás autenticado.)

## Pasarelas en local

| Método | Estado |
|--------|--------|
| **Pago de prueba (COD)** | Activado por `checkout` |
| Stripe | Instalado; configura test keys en WP Admin si quieres tarjeta real |
| PayPal | Instalado; sandbox en WP Admin |
| Mercado Pago | Instalado; país AR en facturación para verlo |

## Importante: shortcodes vs bloques

Las plantillas del tema (`woocommerce/cart/cart.php`, `checkout/form-checkout.php`) **solo aplican** con:

```
[woocommerce_cart]
[woocommerce_checkout]
```

Si la página usa bloques Gutenberg (`wp:woocommerce/checkout`), verás el checkout por defecto de WooCommerce.  
El tema fuerza shortcodes clásicos al activarse (v1.6.2+). `./local-wp.sh checkout` lo corrige en local.

## Cuando todo OK en local

```bash
./deploy-staging.sh
./esitef-minimal/deploy/staging-post-deploy.sh
```

Purgar caché SiteGround en staging (Site Tools → Speed → Caching).
