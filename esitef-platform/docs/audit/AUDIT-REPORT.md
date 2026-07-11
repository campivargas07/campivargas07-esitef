# Auditoría de origen — ESITEF

Generado: 2026-07-11T07:32:03.961Z

## Versiones

| Componente | Valor |
|------------|-------|
| WordPress | 7.0 |
| WooCommerce HPOS | Sí |

## Plugins activos

- **elementor** 4.1.4
- **woocommerce-mercadopago** 8.8.1
- **tutor** 4.0.1
- **woocommerce** 10.9.4
- **woocommerce-paypal-payments** 4.1.1
- **woocommerce-gateway-stripe** 10.8.3

## Conteos por entidad

| Entidad | Cantidad |
|---------|----------|
| users | 3 |
| courses | 32 |
| lessons | 1 |
| topics | 1 |
| tutor_enrolled | 0 |
| quiz_attempts | 0 |
| tutor_orders | 0 |
| wc_orders_hpos | 0 |
| wc_legacy_orders | 0 |
| certificates | 0 |
| products | 36 |

## Distribución de hashes de contraseña

```
wp_bcrypt	3
```

## Tablas Tutor (20)

- `wp_tutor_cart_items`
- `wp_tutor_carts`
- `wp_tutor_coupon_applications`
- `wp_tutor_coupon_usages`
- `wp_tutor_coupons`
- `wp_tutor_customers`
- `wp_tutor_earnings`
- `wp_tutor_legal_consent_logs`
- `wp_tutor_legal_consents`
- `wp_tutor_order_itemmeta`
- `wp_tutor_order_items`
- `wp_tutor_ordermeta`
- `wp_tutor_orders`
- `wp_tutor_quiz_attempt_answers`
- `wp_tutor_quiz_attempts`
- `wp_tutor_quiz_question_answers`
- `wp_tutor_quiz_questions`
- `wp_tutor_scheduler`
- `wp_tutor_user_consents`
- `wp_tutor_withdraws`

## Recomendaciones

- Preserve legacy_wp_user_id on every migrated user.
- Use progressive password bridge for phpass and $wp$ hashes.
- Import tutor_enrolled from wp_posts (post_type=tutor_enrolled).
- Reconcile both wp_tutor_orders and wp_wc_orders (HPOS enabled).
- Do not grant course access from checkout success URL; use webhooks only.
