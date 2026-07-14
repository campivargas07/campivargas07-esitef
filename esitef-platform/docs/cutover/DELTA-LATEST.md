# Delta import — 2026-07-14T15:37:34.300Z

## Resultado de conciliación
- Passed: true
- Issues: ninguno

## Conteos fuente → destino
- users: 3 → 4
- courses: 32 → 33
- lessonProgress: 1 → 1
- orders: 0 → 0

## Siguiente paso
1. Validar login de usuarios migrados y progreso de lecciones
2. Ejecutar `npm run export:wp-redirects` (plugin Redirection + slugs cursos)
3. Completar checklist: `npm run cutover:checklist`
