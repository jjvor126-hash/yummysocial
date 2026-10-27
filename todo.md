# YummySocial — Seguimiento de fases

Última actualización: 26 de octubre de 2026
Estado: **Fase 3 completada** · commit `8193f26`
Verificación actual: `npm run build` ✅ · `npm run lint` ✅ · Playwright a 390 px en claro/oscuro ✅

## Resumen

| Fase | Estado | Alcance |
| --- | --- | --- |
| 0. Base del proyecto | ✅ Completada | Repositorio, app Vite, tokens, shell móvil, imágenes y documentación |
| 1. Datos demo y sesión | ✅ Completada | Seed, login demo, onboarding, feed y ajustes |
| 2. Detalle de receta | ✅ Completada | Receta, comentarios, contenido secreto y compartir |
| 3. Perfil y crear receta | ✅ Completada | Perfil editable, niveles, guardadas y creación con borrador |
| 4. Explorar, guardadas y notificaciones | ⏳ Pendiente | Buscador con filtros, pantalla de guardadas y bandeja de notificaciones |
| 5. Clasificación y platos destacados | ⏳ Pendiente | Ranking de chefs y platos mejor valorados |
| 6. Historias | ⏳ Pendiente | Selector, editor, publicación y visualización de historias |
| 7. Pulido y calidad | ⏳ Pendiente | Perfiles de otros usuarios, accesibilidad, casos límite y cierre |

---

## Fase 0 — Base del proyecto ✅

- [x] Repositorio local con los 18 mockups (`code.html` + `screen.png`).
- [x] App Vite 8 + React 19 + TypeScript + Tailwind CSS v4 + React Router 7 + Zustand 5.
- [x] Tokens de diseño CSS-first en `src/index.css` (`primary`, `surface`, `ink`, `muted`, `line`).
- [x] Shell móvil `AppShell` a `max-w-md`, `BottomNav` fija y área segura.
- [x] Tema claro/oscuro persistido en `yummysocial:theme`.
- [x] Imágenes descargadas y locales en `app/public/img/` con manifiesto `src/data/images.json`.
- [x] `AGENTS.md` y `app/README.md` iniciales.

## Fase 1 — Datos demo, sesión, onboarding y feed ✅

- [x] Tipos `User`, `Recipe`, `Comment`, `AppNotification` y datos iniciales en `seed.ts`.
- [x] Cuenta demo `u-jesse` y persistencia en `yummysocial:store`.
- [x] Login/logout, guardas de ruta y onboarding de 4 pantallas con opción de omitir.
- [x] Feed con historias superiores, autor, me gusta, comentarios, compartir y guardar.
- [x] Ajustes con tema, cuenta, cierre de sesión y restablecimiento de la demo.
- [x] Rutas protegidas y redirecciones (`HomeRedirect`, `WelcomeRoute`, `OnboardingRoute`, `Protected`).

## Fase 2 — Detalle de receta ✅

- [x] Pantalla `/recipe/:id` con portada, autor, valoración, estadísticas, etiquetas, ingredientes y pasos.
- [x] Ingredientes y pasos marcables.
- [x] Comentarios, compositor, respuestas y recuento.
- [x] Contenido secreto bloqueado y desbloqueo con 50 estrellas (`unlockedSecrets`).
- [x] Compartir con Web Share o copia al portapapeles (`shareLink`) y avisos reutilizables.
- [x] Valoración “Nuevo” / “Sin reseñas” y calorías “—” cuando no hay datos.

## Fase 3 — Perfil y creación de recetas ✅

### Perfil (`/profile`)

- [x] Cabecera con notificaciones (badge) y acceso a ajustes.
- [x] Avatar con anillo degradado y botón de edición.
- [x] Estadísticas reales: recetas publicadas, seguidores y seguidos.
- [x] Nombre, usuario, biografía y ubicación.
- [x] Hoja inferior **Editar perfil**: nombre, usuario, bio, ubicación y avatar por archivo o galería.
- [x] Compartir perfil.
- [x] Tarjeta de nivel por estrellas con los 5 rangos, Lvl, progreso y estrellas restantes.
- [x] Historias destacadas visibles con aviso **“Próximamente”**.
- [x] Pestañas **Recetas** / **Guardadas**, tarjetas reutilizables y estados vacíos.
- [x] Persistencia del perfil editado tras recargar.

### Crear receta (`/create`)

- [x] Borrador persistente en `yummysocial:recipe-draft`, restauración y descarte.
- [x] Portada con subida de archivo comprimida a JPEG (~1200 px) o foto de ejemplo.
- [x] Título, descripción, tiempo, dificultad, porciones, calorías y etiquetas (máx. 4).
- [x] Ingredientes dinámicos con cantidad, nombre, secreto y eliminación.
- [x] Pasos dinámicos numerados con secreto y eliminación.
- [x] Validaciones en español.
- [x] Publicación con `addRecipe`, navegación al detalle y aparición en feed y perfil.
- [x] Recetas creadas y cambios de perfil persistentes en `localStorage`.

### Datos y calidad

- [x] `addRecipe` y `updateProfile` en el store.
- [x] `toggleFollow` actualiza contadores de seguidores/seguidos.
- [x] `merge` conserva recetas creadas, campos editables del perfil y contadores.
- [x] Rangos centralizados en `lib/ranks.ts` y niveles del seed coherentes.
- [x] `lib/image.ts`, `lib/draft.ts` y `lib/useToast.ts`.
- [x] Compartir unificado como `shareLink`.
- [x] Restablecer demo limpia también el borrador.
- [x] Documentación actualizada y commit de la fase.

---

## Fase 4 — Explorar, guardadas y notificaciones ⏳

- [ ] **Explorar/buscar (`/search`)**
  - [ ] Buscador por título, descripción, etiqueta o autor.
  - [ ] Filtros por dificultad, tiempo máximo y etiquetas.
  - [ ] Orden por recientes, populares y mejor valoradas.
  - [ ] Grid de resultados con `RecipeCard` y estado sin resultados.
- [ ] **Guardadas (`/saved`)**
  - [ ] Listado de recetas con `savedByMe`.
  - [ ] Filtros/orden y acción de quitar de guardadas.
  - [ ] Estado vacío con acceso al feed.
- [ ] **Notificaciones (`/notifications`)**
  - [ ] Listado por tipo: like, comentario, seguidor, mención y sistema.
  - [ ] Estados leído/no leído y “marcar todas como leídas”.
  - [ ] Enlaces a la receta o al perfil correspondiente.
  - [ ] Sincronizar el badge de la campana.
- [ ] Verificar con build, lint y Playwright a 390 px en claro/oscuro.

## Fase 5 — Clasificación y platos destacados ⏳

- [ ] **Tabla de clasificación de chefs (`/leaderboard`)**
  - [ ] Ranking por estrellas con posición, avatar, nivel y recetas.
  - [ ] Destacar la posición del usuario actual.
  - [ ] Acceso desde el feed o el perfil.
- [ ] **Platos más estrellados (`/top-dishes`)**
  - [ ] Ranking de recetas por valoración y número de reseñas.
  - [ ] Filtros por categoría o dificultad.
  - [ ] Navegación al detalle de cada receta.
- [ ] Enlaces de navegación y estados vacíos.

## Fase 6 — Historias ⏳

- [ ] Modelo de datos `Story` y persistencia en el store.
- [ ] Selector de media (`selector_de_media_historia`).
- [ ] Editor de historia: imagen, texto, stickers y ajustes visuales.
- [ ] Configuración de publicación: título, categoría y audiencia.
- [ ] Historias destacadas reales en el perfil (sustituir “Próximamente”).
- [ ] Anillos de historias en el feed y visor con progreso y estado “visto”.
- [ ] Eliminación y caducidad de historias.

## Fase 7 — Pulido y calidad ⏳

- [ ] Perfiles de otros usuarios (`/u/:username`) y navegación desde autores.
- [ ] Seguir/dejar de seguir desde tarjetas y perfiles.
- [ ] Dar me gusta a comentarios (hoy solo se muestra el contador).
- [ ] Revisión de accesibilidad: foco, etiquetas, contraste y navegación por teclado.
- [ ] Revisión responsive más allá de 390 px.
- [ ] Manejo de cuota de `localStorage` al subir imágenes grandes.
- [ ] Documentación final y cierre de fases.

---

## Notas de seguimiento

- No hay backend, tests automatizados ni CI: la verificación es `npm run build`, `npm run lint` y Playwright manual a 390 px.
- Las capturas de la última verificación están en `C:\Users\Jesse\AppData\Local\Temp\pw\phase3`.
- Los mockups de la raíz son la referencia visual y no deben modificarse salvo que la tarea sea sobre ellos.
- Quedan como placeholders: `/search`, `/saved` y `/notifications`.
- Fuera de ruta todavía: tabla de clasificación, platos más estrellados e historias.
