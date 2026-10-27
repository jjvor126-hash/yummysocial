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
  components/             AppShell, BottomNav, Icon, IconButton, Placeholder, RecipeCard, EditProfileSheet, Toast
  screens/                Welcome, Onboarding, Feed, Profile, CreateRecipe, RecipeDetail, Settings, NotFound
  store/useAppStore.ts    estado global (Zustand + persist)
  data/seed.ts            usuarios, recetas, comentarios y notificaciones demo
  data/images.json        manifiesto de imágenes descargadas de los mockups
  types.ts                tipos de datos de la app
  lib/theme.ts            modo claro/oscuro persistido
  lib/time.ts             fechas relativas y formato de números
  lib/ranks.ts            rangos por estrellas y progreso de nivel
  lib/draft.ts            borrador de receta persistido en localStorage
  lib/image.ts            lectura y compresión de imágenes subidas
  lib/useToast.ts         aviso temporal reutilizable
public/img/               imágenes locales (servidas en /img/...)
```

## Sesión y datos demo

- No hay backend ni autenticación real: los botones de la bienvenida inician sesión con el usuario demo `Jesse` (`u-jesse`).
- El estado se guarda en `localStorage` bajo la clave `yummysocial:store` (likes, guardados, comentarios, seguidos, desbloqueos, notificaciones, perfil editado y recetas creadas).
- El onboarding son 4 pantallas deslizables; se puede omitir. Al terminar se entra al feed.
- En **Mi perfil** se editan nombre, usuario, biografía, ubicación y avatar; las estadísticas, la tarjeta de nivel y las pestañas Recetas/Guardadas usan datos reales. Las historias destacadas muestran el aviso "Próximamente".
- **Crear receta** permite subir o comprimir una portada, usar una foto de ejemplo, añadir ingredientes y pasos secretos y guardar un borrador (`yummysocial:recipe-draft`) antes de publicar.
- El detalle de receta incluye ingredientes y pasos marcables, comentarios y contenido secreto que se desbloquea con 50 estrellas.
- En **Ajustes** se puede cambiar el tema, cerrar sesión o restablecer los datos demo.
- Las rutas privadas redirigen a `/welcome` sin sesión y a `/onboarding` si falta completar el onboarding.

## Notas

- Tailwind es CSS-first (v4): los colores y la tipografía se definen en `src/index.css` con `@theme`. No hay `tailwind.config.js`.
- Los mockups originales (`../<pantalla>/code.html` y `screen.png`) son la referencia visual y no deben modificarse desde aquí.
- Los datos de la app son demo y viven en `localStorage`; no hay backend ni autenticación real.
- El modo oscuro se activa con la clase `dark` en `<html>` y sigue la preferencia del sistema hasta que el usuario la cambie.
