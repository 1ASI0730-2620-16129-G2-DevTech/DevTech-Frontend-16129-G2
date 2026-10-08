# WashTrack WebApp (DevTech)

Aplicación web de **WashTrack**: gestión inteligente y monitoreo IoT para lavanderías. Vue 3 + Vite organizada con **Domain-Driven Design (DDD)**, siguiendo la estructura del proyecto `learning-center`.

## Tecnologías

Vue 3, Vite, Pinia, Vue Router, Vue I18n, PrimeVue + PrimeFlex + PrimeIcons, Axios y json-server (API mock local).

## Estructura (DDD)

```
src/
  <bounded-context>/            # Un directorio por bounded context
    domain/model/               # Entidades, enums, value objects (JS puro, sin Vue ni HTTP)
    application/                # Stores de Pinia (casos de uso)
    infrastructure/             # API, assemblers
    presentation/
      views/                    # Vistas
      components/               # Componentes
      <context>-routes.js       # Rutas del contexto

  shared/                       # Lo transversal a todos los contextos
    domain/model/               # Money, Currency, uuid, errores
    infrastructure/             # BaseApi, BaseEndpoint
    presentation/
      components/               # layout, sidebar, topbar, language-switcher
      views/                    # home, about, page-not-found
      styles/                   # Tokens de diseño WashTrack (colores, tipografías)
      navigation-items.js       # Items del sidebar
      washtrack-preset.js       # Tema de PrimeVue
  locales/                      # en.json / es.json
  router.js  main.js  i18n.js  pinia.js
```

## Cómo agregar un bounded context

1. Crear `src/<context>/` con las capas `domain`, `application`, `infrastructure` y `presentation`.
2. Exportar sus rutas en `presentation/<context>-routes.js` (cada ruta con `meta: { titleKey: '<clave i18n>' }`) y registrarlas en `src/router.js` como rutas hijas.
3. Agregar sus textos en `src/locales/es.json` y `en.json`, y su item en `src/shared/presentation/navigation-items.js`.
4. Agregar las variables de sus endpoints en `.env.development` y `.env.production`, y sus colecciones en `server/db.json`.

## Ejecutar el proyecto

```sh
npm install

# Terminal 1: API mock (http://localhost:3000/api/v1)
cd server
sh start.sh

# Terminal 2: app
npm run dev
```

Otros comandos: `npm run build` y `npm run preview`.

## Variables de entorno

Definidas en `.env.development` y `.env.production`:

- `VITE_WASHTRACK_PLATFORM_API_URL`: URL base de la API.
- `VITE_PRIME_UI_LICENSE_KEY`: licencia de PrimeVue.
- Una variable `VITE_<RECURSO>_ENDPOINT_PATH` por cada recurso de cada bounded context.

## Flujo de trabajo (Git)

- `main`: producción. `develop`: integración.
- Cada integrante trabaja en `feature/<nombre>` creada desde `develop` y entrega por Pull Request hacia `develop`.
- Commits con [Conventional Commits](https://www.conventionalcommits.org/): `feat(scope): ...`, `fix(scope): ...`, `chore: ...`, `docs: ...`.
