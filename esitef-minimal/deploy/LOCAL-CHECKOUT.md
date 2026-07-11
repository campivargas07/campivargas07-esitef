# Checkout local (Docker)

## Arranque rápido

```bash
./local-wp.sh up
./local-wp.sh setup      # primera vez
./local-wp.sh checkout   # shortcodes + seeds online + COD
```

WordPress: **http://localhost:8080**  
En Codespace: pestaña **Ports → 8080 → Open in Browser** (no uses localhost en tu PC).

Admin: `admin` / `admin` (tras `setup`) o usuario existente en la BD.

## Modo actual: solo ventas online

El tema activa `esitef_online_only_sales()` (filter `esitef_online_only_sales`, default `true`):

- **Online:** carrito + checkout WC funcionan con cursos Tutor.
- **Presencial:** páginas visibles con panel **Reservar plaza** (depósito + formulario → WhatsApp/email). Sin add-to-cart WC.
- Para reactivar checkout presencial: `add_filter( 'esitef_online_only_sales', '__return_false' );`

## Probar formaciones online

1. Login en `/ingresar/` (necesario para comprar).
2. Curso de prueba: http://localhost:8080/courses/taller-online-a/
3. **Añadir al carrito** → http://localhost:8080/cart/
4. **Continuar al pago** → http://localhost:8080/checkout/
5. Método **Pago de prueba (local)** → confirmar pedido.
6. Verificar acceso en `/dashboard/`.

Atajo directo (requiere sesión):

```
http://localhost:8080/?add-to-cart=51
```

## Geolocalización y moneda (local)

| Escenario | URL | Resultado esperado |
|-----------|-----|-------------------|
| Default local | `/courses/taller-online-a/` | USD · $225 (chip: `default USD`) |
| México | `?country=MX` | MXN · ~$3.825 (225 × 17) |
| Argentina | `?country=AR` | ARS · Mercado Pago en checkout |
| Europa | `?country=ES` | EUR |
| Moneda directa | `?currency=ARS` | ARS independiente del país |

El chip inferior izquierdo muestra `Geo: {país} · {moneda}` en local.

**Nota:** sin `?country=` ni `?currency=`, local usa **USD** por defecto para smoke tests rápidos.

## Probar formaciones presenciales (sin pago)

1. http://localhost:8080/dolor-y-movimiento-cordoba/
2. Ver panel **Reservar plaza** con depósito y datos bancarios.
3. Completar formulario → abre WhatsApp/email prellenado.
4. Intentar add-to-cart presencial (debe fallar):

```
http://localhost:8080/cart/?add-to-cart=81&variation_id=83&esitef_presencial_instance=dolor-y-movimiento-cordoba&esitef_payment_plan=reserva
```

→ Notice: inscripciones presenciales no disponibles online.

## Pasarelas en local

| Método | Estado |
|--------|--------|
| **Pago de prueba (COD)** | Activado por `checkout` |
| Stripe | Instalado; configura test keys en WP Admin si quieres tarjeta real |
| PayPal | Instalado; sandbox en WP Admin |
| Mercado Pago | Instalado; usa `?country=AR` o país AR en facturación |

## Matriz QA rápida

- [ ] Curso online: cart → checkout COD → enrollment Tutor
- [ ] `?country=MX` cambia precio en landing del curso
- [ ] `?country=AR` muestra ARS en checkout
- [ ] Presencial Córdoba: panel reserva visible, sin planes WC
- [ ] Add-to-cart presencial bloqueado
- [ ] Carrito solo online sin badges presencial

## Importante: shortcodes vs bloques

Las plantillas del tema (`woocommerce/cart/cart.php`, `checkout/form-checkout.php`) **solo aplican** con:

```
[woocommerce_cart]
[woocommerce_checkout]
```

`./local-wp.sh checkout` corrige esto en local.

## Cuando todo OK en local

```bash
./deploy-staging.sh
./esitef-minimal/deploy/staging-post-deploy.sh
```

Purgar caché SiteGround en staging (Site Tools → Speed → Caching).
