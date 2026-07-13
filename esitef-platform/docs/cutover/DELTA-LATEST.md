# Delta import — 2026-07-13T17:07:54.336Z

## Resultado de conciliación
- Passed: false
- Issues: enrollments: migrated target exceeds source

## Conteos fuente → destino
- users: 3 → 2719
- courses: 32 → 79
- lessonProgress: 1 → 8916
- orders: 0 → 0

## Siguiente paso
1. Validar login de usuarios migrados y progreso de lecciones
2. Ejecutar `npm run export:wp-redirects` (plugin Redirection + slugs cursos)
3. Completar checklist: `npm run cutover:checklist`
