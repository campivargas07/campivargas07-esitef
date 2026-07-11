#!/usr/bin/env bash
# WordPress local con tema esitef-minimal (Docker)
set -euo pipefail

ROOT="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT"

WP_PLUGINS=(woocommerce tutor elementor woocommerce-paypal-payments woocommerce-gateway-stripe woocommerce-mercadopago)

wp() {
  docker compose run --rm wpcli wp "$@"
}

wait_for_wp() {
  local i
  for i in $(seq 1 30); do
    if curl -sf -o /dev/null "http://localhost:8080/"; then
      return 0
    fi
    sleep 2
  done
  echo "❌ WordPress no responde en :8080. Ejecuta: ./local-wp.sh up"
  exit 1
}

# wp-cli --hard no escribe .htaccess en este stack; Apache necesita las reglas a mano.
fix_htaccess() {
  docker compose exec -T wordpress bash -c 'cat > /var/www/html/.htaccess << '\''EOF'\''
# BEGIN WordPress
<IfModule mod_rewrite.c>
RewriteEngine On
RewriteRule .* - [E=HTTP_AUTHORIZATION:%{HTTP:Authorization}]
RewriteBase /
RewriteRule ^index\.php$ - [L]
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.php [L]
</IfModule>
# END WordPress
EOF
chown www-data:www-data /var/www/html/.htaccess'
}

cmd="${1:-up}"

case "$cmd" in
  up)
    docker compose up -d
    echo ""
    echo "→ WordPress: http://localhost:8080"
    echo "  Setup completo: ./local-wp.sh setup"
    echo "  Solo plugins:   ./local-wp.sh plugins"
    echo "  Logs:           ./local-wp.sh logs"
    ;;
  down)
    docker compose down
    ;;
  logs)
    docker compose logs -f wordpress
    ;;
  reset)
    docker compose down -v
    echo "✅ Volúmenes borrados. Ejecuta ./local-wp.sh setup"
    ;;
  lint)
    find esitef-minimal -name '*.php' -print0 | xargs -0 -n1 php -l
    ;;
  plugins)
    wait_for_wp
    if ! wp core is-installed 2>/dev/null; then
      echo "❌ WP no instalado. Ejecuta primero: ./local-wp.sh setup"
      exit 1
    fi
    echo "→ Instalando plugins (wp.org)…"
    for slug in "${WP_PLUGINS[@]}"; do
      wp plugin is-installed "$slug" 2>/dev/null && wp plugin activate "$slug" 2>/dev/null && continue
      wp plugin install "$slug" --activate
    done
    for zip in "$ROOT"/local-plugins/*.zip; do
      [[ -f "$zip" ]] || continue
      echo "→ Instalando $(basename "$zip")…"
      wp plugin install "/local-plugins/$(basename "$zip")" --activate
    done
    wp plugin list
    echo "✅ Plugins listos."
    ;;
  checkout)
    wait_for_wp
    echo "→ Shortcodes clásicos carrito/checkout + seed presencial…"
    docker compose run --rm wpcli wp eval 'delete_option("esitef_classic_wc_pages_v");' 2>/dev/null || true
    docker compose run --rm wpcli wp eval 'do_action("init");' 2>/dev/null || true
    CART_ID=$(docker compose run --rm wpcli wp option get woocommerce_cart_page_id 2>/dev/null | tail -1)
    CHECKOUT_ID=$(docker compose run --rm wpcli wp option get woocommerce_checkout_page_id 2>/dev/null | tail -1)
    docker compose run --rm wpcli wp post update "$CART_ID" --post_content='[woocommerce_cart]' 2>/dev/null
    docker compose run --rm wpcli wp post update "$CHECKOUT_ID" --post_content='[woocommerce_checkout]' 2>/dev/null
    docker compose run --rm wpcli     wp option update woocommerce_cod_settings '{"enabled":"yes","title":"Pago de prueba (local)","description":"Solo desarrollo local","enable_for_virtual":"yes","order_status":"processing"}' --format=json 2>/dev/null || true
    docker compose run --rm wpcli wp option update woocommerce_stripe_settings '{"enabled":"yes","title":"Tarjeta","description":"","testmode":"yes","test_publishable_key":"","test_secret_key":""}' --format=json 2>/dev/null || true
    docker compose run --rm wpcli wp option update woocommerce-ppcp-settings '{"enabled":"yes","title":"PayPal","description":""}' --format=json 2>/dev/null || true
    docker compose run --rm wpcli wp eval-file wp-content/themes/esitef-minimal/deploy/seed-presencial-products.php 2>/dev/null
    echo "→ Seed cursos online (Tutor + WC)…"
    docker compose run --rm wpcli wp eval-file wp-content/themes/esitef-minimal/deploy/seed-course-taller-online-a.php 2>/dev/null || true
    docker compose run --rm wpcli wp eval-file wp-content/themes/esitef-minimal/deploy/seed-formaciones-online.php 2>/dev/null || true
    docker compose run --rm wpcli wp cache flush 2>/dev/null || true
    echo ""
    echo "✅ Checkout local listo."
    echo "   1. Abre http://localhost:8080 (o puerto 8080 en Codespaces)"
    echo "   2. Curso online: /courses/taller-online-a/ o ?add-to-cart=51"
    echo "   3. Geo test: añade ?country=MX o ?currency=ARS a cualquier URL"
    echo "   4. /cart/ → /checkout/"
    echo "   Login: campivargas o crear usuario en wp-admin"
    ;;
  setup)
    docker compose up -d
    wait_for_wp
    if ! wp core is-installed 2>/dev/null; then
      echo "→ Instalando WordPress…"
      wp core install \
        --url="http://localhost:8080" \
        --title="ESITEF Local" \
        --admin_user="admin" \
        --admin_password="admin" \
        --admin_email="dev@esitef.local" \
        --skip-email
    fi
    echo "→ Plugins…"
    for slug in "${WP_PLUGINS[@]}"; do
      wp plugin is-installed "$slug" 2>/dev/null && wp plugin activate "$slug" 2>/dev/null && continue
      wp plugin install "$slug" --activate
    done
    for zip in "$ROOT"/local-plugins/*.zip; do
      [[ -f "$zip" ]] || continue
      echo "→ Instalando $(basename "$zip")…"
      wp plugin install "/local-plugins/$(basename "$zip")" --activate
    done
    echo "→ Tema + permalinks…"
    wp theme activate esitef-minimal
    wp rewrite structure '/%postname%/' --hard
    fix_htaccess
    echo "→ WooCommerce: desactivar Coming Soon (bloquea carrito/checkout)…"
    wp option update woocommerce_coming_soon no 2>/dev/null || true
    wp option update woocommerce_store_pages_only no 2>/dev/null || true
    echo "→ Pasarelas de prueba…"
    wp plugin install woocommerce-gateway-stripe --activate 2>/dev/null || wp plugin activate woocommerce-gateway-stripe 2>/dev/null || true
    wp plugin install woocommerce-mercadopago --activate 2>/dev/null || wp plugin activate woocommerce-mercadopago 2>/dev/null || true
    wp plugin activate woocommerce-gateway-stripe 2>/dev/null || true
    wp plugin activate woocommerce-mercadopago 2>/dev/null || true
    wp plugin activate bacs 2>/dev/null || true
    echo "→ Checkout clásico (plantillas del tema)…"
    CART_ID=$(wp option get woocommerce_cart_page_id 2>/dev/null | tail -1)
    CHECKOUT_ID=$(wp option get woocommerce_checkout_page_id 2>/dev/null | tail -1)
    [[ -n "$CART_ID" ]] && wp post update "$CART_ID" --post_content='[woocommerce_cart]' 2>/dev/null || true
    [[ -n "$CHECKOUT_ID" ]] && wp post update "$CHECKOUT_ID" --post_content='[woocommerce_checkout]' 2>/dev/null || true
    wp option update woocommerce_cod_settings '{"enabled":"yes","title":"Pago de prueba (local)","description":"Solo desarrollo local","enable_for_virtual":"yes","order_status":"processing"}' --format=json 2>/dev/null || true
    wp eval-file wp-content/themes/esitef-minimal/deploy/seed-presencial-products.php 2>/dev/null || true
    wp eval-file wp-content/themes/esitef-minimal/deploy/seed-course-taller-online-a.php 2>/dev/null || true
    wp eval-file wp-content/themes/esitef-minimal/deploy/seed-formaciones-online.php 2>/dev/null || true
    echo ""
    echo "✅ Listo: http://localhost:8080"
    echo "   Admin: http://localhost:8080/wp-admin  (admin / admin)"
    echo "   Tutor Pro: pon el .zip en local-plugins/ y ./local-wp.sh plugins"
    if [[ -n "${CODESPACE_NAME:-}" ]]; then
      echo ""
      echo "📌 Chrome externo (Codespace): panel Ports → 8080 → clic en la URL https"
      echo "   No uses http://localhost:8080 en Chrome (apunta a tu PC, no al Codespace)."
    fi
    ;;
  tutor-native)
    wait_for_wp
    if ! wp core is-installed 2>/dev/null; then
      echo "❌ WP no instalado. Ejecuta primero: ./local-wp.sh setup"
      exit 1
    fi
    echo "→ Modo Tutor native (sin checkout WooCommerce)…"
    wp eval-file wp-content/themes/esitef-minimal/deploy/setup-tutor-native-test.php
    wp cache flush 2>/dev/null || true
    ;;
  *)
    echo "Uso: $0 {up|down|logs|reset|lint|plugins|setup|checkout|tutor-native}"
    exit 1
    ;;
esac
