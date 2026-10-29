# YummySocial — app

App móvil (web) de recetas y comunidad, construida a partir de los mockups HTML de la raíz del repositorio.

## Requisitos

- Node.js 20.19+ (probado con 24.x) y npm.

## Comandos

```bash
npm install        # instalar dependencias (solo la primera vez)
npm run dev        # servidor de desarrollo en http://localhost:5173
npm run build      # comprobar tipos y generar dist/
npm run preview    # servir la versión compilada
npm run lint       # oxlint
```

Para probar desde el móvil en la misma red WiFi: `npm run dev -- --host` y abre la IP que muestra la terminal.

## Estructura

```
src/
  App.tsx                 rutas principales y protección de sesión
  index.css               Tailwind + tokens de diseño (@theme)
  components/             AppShell, BottomNav, Icon, IconButton, RecipeCard, SearchField, FilterChip, SegmentedControl, RankingTabs, EmptyState, EditProfileSheet, StarGuide, StoryRing, StoryProgress, Toast, StorageNotice
  screens/                Welcome, Onboarding, Feed, Search, Saved, Notifications, Leaderboard, TopDishes, Profile, PublicProfile, CreateRecipe, RecipeDetail, Premium, StoryMediaPicker, StoryEditor, StoryPublish, StoryViewer, Settings, NotFound
  store/useAppStore.ts    estado global (Zustand + persist)
  data/seed.ts            usuarios, recetas, comentarios, notificaciones e historias demo
  data/images.json        manifiesto de imágenes descargadas de los mockups
  types.ts                tipos de datos de la app
  lib/theme.ts            modo claro/oscuro persistido
  lib/time.ts             fechas relativas y formato de números
  lib/recipeFilters.ts    búsqueda, filtros por tiempo/dificultad/etiqueta y orden
  lib/rankings.ts         clasificación de chefs y platos, con métricas y filtros
  lib/notifications.ts    textos, filtros y agrupación por día de notificaciones
  lib/profiles.ts         rutas de perfil y búsqueda de usuarios por @usuario
  lib/storage.ts          localStorage seguro y aviso de cuota llena
  lib/ranks.ts            rangos por estrellas y progreso de nivel
  lib/stars.ts            recompensas de estrellas por actividad y actualización de rango
  lib/secrets.ts          acceso a secretos por nivel, atajo de 50★ o Yummy+
  lib/subscription.ts     planes Yummy+, estado activo y fechas de renovación
  lib/stories.ts          caducidad, visibilidad por audiencia, agrupación y orden de historias
  lib/storyLayout.ts      posiciones de los stickers sobre el lienzo 9:16
  lib/storyDraft.ts       borrador de historia persistido en localStorage
  lib/draft.ts            borrador de receta persistido en localStorage
  lib/image.ts            lectura y compresión de imágenes subidas
  lib/useToast.ts         aviso temporal reutilizable
public/img/               imágenes locales (servidas en /img/...)
```

## Sesión y datos demo

- No hay backend ni autenticación real: los botones de la bienvenida inician sesión con el usuario demo `Jesse` (`u-jesse`).
- El estado se guarda en `localStorage` bajo la clave `yummysocial:store` (likes, guardados con fecha, comentarios, seguidos, desbloqueos, notificaciones leídas, perfil editado, recetas e historias creadas, historias vistas, destacados, suscripción Yummy+ y estrellas ganadas).
- El onboarding son 4 pantallas deslizables; se puede omitir. Al terminar se entra al feed.
- **Explorar** busca por título, descripción, etiquetas, autor o ingredientes (sin distinguir acentos) y filtra por tiempo, dificultad y etiqueta; el orden puede ser recientes, populares o mejor valoradas.
- **Guardadas** arranca con 3 recetas de la demo, permite buscar y filtrar lo guardado, ordenarlo por fecha de guardado, valoración o popularidad y quitar recetas desde la propia tarjeta.
- **Notificaciones** agrupa por día, distingue leídas y sin leer, filtra por menciones o sistema y permite seguir al autor desde los avisos de nuevos seguidores (o abrir su perfil). La campana de las cabeceras muestra el número pendiente.
- **Perfiles públicos** (`/u/:username`) muestran el nivel, los destacados y las recetas de cada cocinero, con botones para seguir/dejar de seguir y compartir. Se llega tocando el nombre o el avatar del autor en el feed, el detalle, los comentarios, la clasificación, los platos, las notificaciones o las historias. El propio usuario redirige a **Mi perfil**.
- **Me gusta en comentarios**: cada comentario del detalle tiene un pulgar con contador; el estado se guarda y se mantiene al recargar.
- **Clasificación** (`/leaderboard`) ordena a los chefs por estrellas, tendencias de los últimos 7 días o seguidores, con podio, lista completa y una barra fija con la posición del usuario. Se abre desde el icono del feed o desde la tarjeta de nivel del perfil.
- **Ranking de sabor** (`/top-dishes`) ordena las recetas valoradas por nota, número de reseñas o popularidad, con filtros de categoría y dificultad y acceso al detalle de cada plato. Las recetas nuevas sin reseñas no aparecen.
- En **Mi perfil** se editan nombre, usuario, biografía, ubicación y avatar; las estadísticas, la tarjeta de nivel y las pestañas Recetas/Guardadas usan datos reales. Los destacados abren el visor de historias y **Nueva** inicia el flujo de creación.
- **Historias** se crean desde `/stories/new`: cámara, galería o foto de ejemplo, editor 9:16 con texto, colores y stickers, y publicación con descripción, etiquetas, duración de 12/24 h, audiencia y ubicación. El visor avanza solo, se pausa al mantener pulsado, admite tap, deslizamiento y teclado, y las historias caducadas o privadas dejan de mostrarse.
- **Crear receta** permite subir o comprimir una portada, usar una foto de ejemplo, añadir ingredientes y pasos secretos —eligiendo el nivel de rango que los abre o marcándolos como solo Yummy+— y guardar un borrador (`yummysocial:recipe-draft`) antes de publicar.
- El detalle de receta incluye ingredientes y pasos marcables, comentarios con me gusta y secretos que se abren al alcanzar su nivel, con el atajo de 50 estrellas o con Yummy+.
- **Estrellas y niveles**: publicar una receta (+40), una historia (+10), comentar (+5), recibir un me gusta (+2), un comentario (+3) o un seguidor (+10) suma estrellas y acerca al siguiente rango. La guía **Cómo ganar estrellas** está en el perfil.
- **Yummy+** (`/premium`) es una suscripción simulada (mensual 4,99 € o anual 39,99 €) que desbloquea todos los secretos, incluidos los exclusivos, y añade una insignia al perfil. Se activa y cancela desde la pantalla o desde Ajustes; no hay cobro real.
- En **Ajustes** se puede cambiar el tema, cerrar sesión o restablecer los datos demo.
- Las rutas privadas redirigen a `/welcome` sin sesión y a `/onboarding` si falta completar el onboarding.
- **Accesibilidad**: al pulsar Tab aparece **Saltar al contenido**, todos los controles tienen foco visible y nombre accesible, y los avisos se anuncian con `aria-live`. El texto naranja usa una variante más oscura en modo claro para mantener el contraste.
- **Responsive**: la interfaz se adapta desde 320 px (móviles pequeños) hasta 768 px sin desbordamiento horizontal.
- **Almacenamiento**: las imágenes se comprimen por debajo de un límite de tamaño. Si `localStorage` se llena, aparece un aviso descartable y la app sigue funcionando en memoria durante la sesión.

## Notas

- Tailwind es CSS-first (v4): los colores y la tipografía se definen en `src/index.css` con `@theme`. No hay `tailwind.config.js`.
- Los mockups originales (`../<pantalla>/code.html` y `screen.png`) son la referencia visual y no deben modificarse desde aquí.
- Los datos de la app son demo y viven en `localStorage`; no hay backend ni autenticación real.
- El modo oscuro se activa con la clase `dark` en `<html>` y sigue la preferencia del sistema hasta que el usuario la cambie.
