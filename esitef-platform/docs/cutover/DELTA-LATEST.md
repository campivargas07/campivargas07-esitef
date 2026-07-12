# Delta import — 2026-07-12T20:19:09.980Z

## Resultado de conciliación
- Passed: false
- Issues: lessonProgress: missing 1 records

## Conteos fuente → destino
- users: 2718 → 2718
- courses: 66 → 66
- lessonProgress: 8916 → 8915
- orders: 0 → 0

## Siguiente paso
1. Validar login de usuarios migrados y progreso de lecciones
2. Ejecutar `npm run export:wp-redirects` (plugin Redirection + slugs cursos)
3. Completar checklist: `npm run cutover:checklist`
