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
  App.tsx                 rutas principales
  index.css               Tailwind + tokens de diseño (@theme)
  components/             AppShell, BottomNav, Icon, IconButton, Placeholder
  screens/                Welcome, Feed, NotFound
  lib/theme.ts            modo claro/oscuro persistido
  data/images.json        manifiesto de imágenes descargadas de los mockups
public/img/               imágenes locales (servidas en /img/...)
```

## Notas

- Tailwind es CSS-first (v4): los colores y la tipografía se definen en `src/index.css` con `@theme`. No hay `tailwind.config.js`.
- Los mockups originales (`../<pantalla>/code.html` y `screen.png`) son la referencia visual y no deben modificarse desde aquí.
- Los datos de la app serán demo y vivirán en `localStorage`; no hay backend ni autenticación real.
- El modo oscuro se activa con la clase `dark` en `<html>` y sigue la preferencia del sistema hasta que el usuario la cambie.
