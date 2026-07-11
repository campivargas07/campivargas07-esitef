# Delta import — 2026-07-11T18:55:00.000Z (producción esitef.com/online)

## Fuente
- Dump: `data/staging/esitef-online.sql` (420 MB, phpMyAdmin)
- Prefijo tablas: `yrc_` (no `wp_`)
- siteurl: `https://esitef.com/online`

## Resultado de conciliación
- Passed: **true**
- Issues: ninguno (28 topics + 132 lessons huérfanos en WP — omitidos a propósito)

## Conteos migrados (Postgres)
| Entidad | Cantidad |
|---------|----------|
| Usuarios WP | 2.719 |
| Cursos publicados | 74 |
| Matrículas | 11.448 |
| Progreso lecciones | 8.916 |
| Módulos / lecciones | 81 / 414 |

## Comandos usados
```bash
export DATABASE_URL=postgresql://esitef:esitef@localhost:5433/esitef
export WP_TABLE_PREFIX=yrc_
npm run cutover:delta
```

## Siguiente paso
1. ~~Probar login con usuario real de WP~~ ✓ (fix hashes `$wp$` WP 6.8)
2. Verificar `/formaciones` (74 cursos) y player con progreso migrado
3. ~~`npm run export:wp-redirects`~~ ✓ (86 redirects `/online/*`)
4. En go-live: repetir delta con WP en solo lectura + DNS + webhooks live
