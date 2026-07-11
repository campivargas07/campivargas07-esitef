# QA Staging — Go / No-Go

## General

- [ ] Home: hero mobile sin scroll, marquee visible
- [ ] Accordion Ofrecemos funciona (hover + click)
- [ ] Blog: 3 posts dinámicos
- [ ] Navbar desktop dropdowns + drawer mobile
- [ ] Carrito WooCommerce muestra contador
- [ ] Footer newsletter + enlaces

## Auth

- [ ] Login → redirect `/dashboard/`
- [ ] Registro con validación JS
- [ ] Recuperar contraseña
- [ ] Transición blur desde "Ingresar"

## Cursos / Tutor

- [ ] Archive formaciones carga grid
- [ ] Enlace a curso individual
- [ ] Single course usa diseño landing-online (hero, highlights, contenido)
- [ ] Botón inscribir → carrito → checkout (modo test)
- [ ] Curriculum muestra lecciones con duración
- [ ] Reseñas y cursos relacionados visibles

## Checkout branded (tema 1.6+)

- [ ] `/online/cart/` usa diseño ESITEF (breadcrumb, resumen, sticky bar móvil)
- [ ] `/online/checkout/` layout Polar 2 columnas en desktop
- [ ] Métodos de pago: **Tarjeta** (Stripe) + PayPal; en AR solo **Mercado Pago**
- [ ] Un solo botón «Pagar {monto}» (sin botón Stripe aparte)
- [ ] Confirmación con CTA «Empezar ahora» (cursos online)

## Carrito mixto online + presencial (tema 1.7.3+)

- [ ] Geo-moneda: visitante MX → precios en MXN; visitante AR → ARS
- [ ] Mixed cart **MXN**: curso online + presencial GDL en un solo checkout
- [ ] Mixed cart **ARS**: curso online + Córdoba cuando moneda de sesión coincide
- [ ] Carrito mixto muestra **todas** las líneas (badges Online / Presencial)
- [ ] Resumen usa etiqueta «Total hoy» en carritos presenciales o mixtos
- [ ] Plan `3-cuotas` en mixed cart: 1 parent order + suscripción WCS + renewals programados
- [ ] Fallback: online en carrito → agregar presencial incompatible → modal (no mezcla)
- [ ] Fallback «Reemplazar carrito» vacía y agrega con meta de plan correcta
- [ ] Thank-you con pending → CTA «Continuar inscripción» restaura carrito
- [ ] Checkout con carrito mixto incompatible → redirect a cart con error
- [ ] CFDI: hooks `esitef_cfdi_emit_digital` / `esitef_cfdi_emit_presencial` / `esitef_cfdi_emit_renewal` conectados al emisor

## Pagos online (modo test)

- [ ] Añadir curso al carrito
- [ ] Checkout completo con Pago de prueba / PayPal Sandbox / Stripe test
- [ ] Pedido en WooCommerce → Pedidos
- [ ] Acceso al curso tras compra
- [ ] **Sin cobros reales** en panel PayPal/banco/Stripe

## Pagos presenciales (modo test)

- [ ] Ejecutado `seed-presencial-products.php` en staging
- [ ] Córdoba: planes reserva / 3 cuotas / completo en carrito
- [ ] Cambio de plan en carrito actualiza total
- [ ] Checkout con país AR → Mercado Pago sandbox
- [ ] Montevideo o GDL: Stripe o PayPal test
- [ ] Thank you muestra mensaje según plan (reserva / cuotas / completo)

## Mobile

- [ ] iPhone/Android: home + menú + login + checkout sticky bar

## PHP

- [ ] `WP_DEBUG_LOG` sin errores fatales

---

**No-Go → corregir en repo → `./deploy/upload-theme.sh` → repetir.**
