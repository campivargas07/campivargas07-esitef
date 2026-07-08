#!/usr/bin/env bash
# WordPress local con tema esitef-minimal (Docker)
set -euo pipefail

ROOT="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT"

WP_PLUGINS=(woocommerce tutor elementor woocommerce-paypal-payments)

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
  *)
    echo "Uso: $0 {up|down|logs|reset|lint|plugins|setup}"
    exit 1
    ;;
esac
