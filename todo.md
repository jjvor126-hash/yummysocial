# YummySocial — Seguimiento de fases

Última actualización: 27 de octubre de 2026
Estado: **Fase 6 completada**
Verificación actual: `npm run build` ✅ · `npm run lint` ✅ · Playwright a 390 y 360 px en claro/oscuro ✅

## Resumen

| Fase | Estado | Alcance |
| --- | --- | --- |
| 0. Base del proyecto | ✅ Completada | Repositorio, app Vite, tokens, shell móvil, imágenes y documentación |
| 1. Datos demo y sesión | ✅ Completada | Seed, login demo, onboarding, feed y ajustes |
| 2. Detalle de receta | ✅ Completada | Receta, comentarios, contenido secreto y compartir |
| 3. Perfil y crear receta | ✅ Completada | Perfil editable, niveles, guardadas y creación con borrador |
| 4. Explorar, guardadas y notificaciones | ✅ Completada | Buscador con filtros, pantalla de guardadas y bandeja de notificaciones |
| 5. Clasificación y platos destacados | ✅ Completada | Ranking de chefs, platos mejor valorados y accesos |
| 6. Historias | ✅ Completada | Selector, editor, publicación, visor, destacados y tira del feed |
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

## Fase 4 — Explorar, guardadas y notificaciones ✅

### Explorar (`/search`)

- [x] Buscador por título, descripción, etiqueta, autor e ingredientes, sin distinguir acentos.
- [x] Chips en línea para tiempo (`< 30`, `30–60`, `> 60`), dificultad y etiquetas derivadas de las recetas.
- [x] Orden por recientes, populares y mejor valoradas.
- [x] Grid de resultados con `RecipeCard`, contador accesible y estado sin resultados.
- [x] Botón de limpiar filtros y campana con badge.

### Guardadas (`/saved`)

- [x] Listado de recetas con `savedByMe`; la demo arranca con 3 guardadas.
- [x] Búsqueda dentro de guardadas, filtros por etiqueta y orden por fecha de guardado, valoración o popularidad.
- [x] `savedAt` en el modelo y en el `merge` para ordenar y persistir.
- [x] Quitar de guardadas desde la tarjeta con aviso y actualización inmediata.
- [x] Estado vacío con acceso a Explorar y estado sin resultados para los filtros.

### Notificaciones (`/notifications`)

- [x] Agrupación por día: Hoy, Ayer, Esta semana y Anteriores.
- [x] Filtros Todas, Sin leer, Menciones y Sistema.
- [x] Filas con avatar, insignia por tipo, miniatura, tinte y barra de no leída.
- [x] Mensajes en español para like, comentario, seguidor, mención y sistema; cita del comentario cuando existe.
- [x] Abrir like/comentario/mención marca leída y navega a la receta.
- [x] Botón Seguir/Siguiendo en avisos de nuevos seguidores con `toggleFollow`.
- [x] “Marcar todo”, estados “Estás al día” y badge sincronizado en feed, explorar, guardadas y perfil.
- [x] El `merge` conserva el estado leído de las notificaciones del seed.

### Compartido y calidad

- [x] `SearchField`, `FilterChip` y `EmptyState` reutilizables.
- [x] `lib/recipeFilters.ts` y `lib/notifications.ts` con la lógica fuera de las pantallas.
- [x] `RecipeCard` acepta `onRemove` sin anidar controles interactivos.
- [x] Rutas reales en `App.tsx` y retirada de `Placeholder`.
- [x] Verificado con build, lint y Playwright a 390 px en claro/oscuro.
- [x] Documentación actualizada y commit de la fase.

## Fase 5 — Clasificación y platos destacados ✅

### Clasificación de chefs (`/leaderboard`)

- [x] Ranking por estrellas con posición, avatar, nivel y número de recetas.
- [x] Podio top 3 con corona, anillo y medalla de posición; lista del 4.º en adelante.
- [x] Orden por estrellas, tendencias (likes recibidos en los últimos 7 días) y seguidores.
- [x] Posición del usuario actual resaltada y barra fija **Tú** cuando queda fuera del podio.
- [x] Pestañas **Chefs / Platos** y enlace al perfil desde la barra del usuario.

### Platos más estrellados (`/top-dishes`)

- [x] Ranking por valoración y número de reseñas; las recetas sin reseñas quedan fuera.
- [x] Podio top 3 y lista del 4.º en adelante con miniatura, autor, nota y reseñas.
- [x] Orden por mejor valoradas, más votadas y populares.
- [x] Filtros por categoría y dificultad, contador, limpiar filtros y estados vacíos.
- [x] Navegación al detalle de cada receta.

### Navegación, datos y calidad

- [x] Icono de clasificación en la cabecera del feed y CTA en la tarjeta de nivel del perfil.
- [x] `lib/rankings.ts` centraliza métricas, orden y filtros; sin campos nuevos en el store.
- [x] `SegmentedControl`, `RankingTabs` y `EmptyState` reutilizados.
- [x] Modo oscuro, accesibilidad básica y comprobación a 360 y 390 px.
- [x] `npm run build`, `npm run lint` y Playwright en claro/oscuro sin errores de consola.
- [x] Documentación actualizada y commit de la fase.

## Fase 6 — Historias ✅

### Datos y estado

- [x] Tipos `Story`, `StoryHighlight`, `StoryInput` y borrador `StoryDraft`.
- [x] 11 historias y 4 destacados en el seed, con caducidad relativa a la carga.
- [x] Acciones `addStory`, `deleteStory`, `markStoryViewed`, `addHighlight`, `removeHighlight`.
- [x] `viewedStories`, `hiddenStories` y `hiddenHighlights`; el `merge` descarta caducadas y respeta los borrados.
- [x] Persistencia version 2 con migración desde la v1.

### Creación

- [x] `/stories/new`: cámara, galería y seis fotos de ejemplo; compresión a 1440 px.
- [x] `/stories/new/editor`: lienzo 9:16, texto, seis colores, hasta seis stickers, deshacer y borrador `yummysocial:story-draft`.
- [x] `/stories/new/publish`: descripción de 120 caracteres, etiquetas, duración 12/24 h, audiencia, ubicación y validaciones.
- [x] Publicación que abre el visor propio y limpia el borrador.

### Visor y perfil

- [x] `/stories/:userId`: progreso segmentado, 5 s por historia (7 s con texto), pausa al mantener, tap, deslizar y teclado.
- [x] Marcado como vistas, salto entre autores y estado vacío para historias caducadas o privadas.
- [x] Menú para añadir, cambiar o quitar destacados y eliminar la historia propia.
- [x] Tira del feed con anillos vistos/no vistos y “Tu historia”.
- [x] Destacados reales en el perfil; “Nueva” abre el selector.
- [x] Ajustes limpia también el borrador de historia.

### Calidad

- [x] `lib/stories.ts`, `lib/storyDraft.ts` y `lib/storyLayout.ts`; `StoryRing` y `StoryProgress` reutilizables.
- [x] `npm run build`, `npm run lint` y Playwright a 390 y 360 px en claro/oscuro sin errores de consola.
- [x] Verificados caducidad, audiencia, borrado persistente y recarga.

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
- Las capturas de la última verificación están en `C:\Users\Jesse\AppData\Local\Temp\pw\phase6`.
- Los mockups de la raíz son la referencia visual y no deben modificarse salvo que la tarea sea sobre ellos.
- Ya no quedan pantallas placeholder: las rutas de las fases 4, 5 y 6 están implementadas.
- Las notificaciones de nuevos seguidores marcan leída y permiten seguir, pero todavía no abren un perfil público (Fase 7).
- La barra inferior mantiene cinco accesos (Inicio, Explorar, Crear, Guardadas, Perfil); la clasificación se abre desde el feed y el perfil, y las pestañas Chefs/Platos la conectan con el ranking de platos.
- El ranking de platos solo incluye recetas con al menos una reseña; las recetas creadas desde la app no aparecerán hasta que exista una acción para valorarlas.
- Las historias del seed usan marcas de tiempo relativas a la carga para que la demo nunca arranque caducada; las creadas por el usuario caducan a las 12 o 24 h y el `merge` las descarta.
- En escritorio la cámara cae al selector de archivos. El editor de historias es intencionadamente simple: texto, color y stickers, sin dibujo libre ni arrastre.
- Fuera de ruta todavía: perfiles públicos de otros usuarios y likes en comentarios (Fase 7).
