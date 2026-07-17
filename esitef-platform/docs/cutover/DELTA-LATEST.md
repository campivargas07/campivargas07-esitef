# Delta import — 2026-07-17T21:08:47.472Z

## Resultado de conciliación
- Passed: true
- Issues: ninguno

## Conteos fuente → destino
- users: 2718 → 2717 (1 usuario con email duplicado ya existente)
- courses: 66 → 65 (1 curso huérfano omitido)
- lessonProgress: 8917 → 8917
- orders: 0 → 0
- enrollments: 12886 → 11449 (enrollments migrables tras filtrar huérfanos)

## Notas de conciliación
- 28 topics huérfanos en WP (sin curso padre) — omitidos
- 132 lessons huérfanas en WP — omitidas
- 1 quizzes huérfanos en WP (curso padre ausente) — omitidos
- 2 lesson progress duplicados en WP — deduplicados en destino

## Procedimiento usado
1. `db:push` y `cutover:delta` contra Postgres local (rápido, red local).
2. `pg_dump` local → `psql` restore contra Neon (con `--clean --if-exists --no-owner --no-privileges`).
3. `etl:reconcile` contra Neon vía endpoint directo (search_path del pooler Neon venía vacío, lo que hacía fallar las queries con el driver).
4. Reconcile PASSED.

## Siguiente paso
1. Revisar/adjustar `DATABASE_URL` en Vercel para usar el endpoint directo de Neon, ya que el pooler deja `search_path` vacío y la app no encuentra tablas.
2. Verificar deploy y ejecutar smoke tests.
