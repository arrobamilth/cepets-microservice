# Despliegue de CEPETS

Esta guia deja CEPETS listo para ejecutarse en modo produccion con Docker, PostgreSQL y un proxy publico unico.

## Lo que incluye

- PostgreSQL como base de datos persistente
- volumen persistente para imagenes
- `Caddy` como proxy de entrada
- frontend sirviendo la API por la ruta `/api`
- secretos fuera del codigo mediante `.env.production`

## Archivos clave

- `docker-compose.prod.yml`
- `.env.production`
- `.env.production.example`
- `docker/Caddyfile`

## Despliegue local de produccion

1. Verifica que Docker Desktop este encendido.
2. Desde la raiz del proyecto ejecuta:

```bash
npm run deploy:prod
```

3. Abre:

- `http://localhost:8080`

## Apagar el stack

```bash
npm run deploy:prod:down
```

## Ver logs

```bash
npm run deploy:prod:logs
```

## Publicarlo en internet

En un VPS con Docker:

1. Copia el proyecto al servidor.
2. Edita `.env.production`:
   - cambia `SITE_ADDRESS` por tu dominio real
   - cambia `PUBLIC_HTTP_PORT=80`
   - cambia `PUBLIC_HTTPS_PORT=443`
   - conserva secretos fuertes o reemplazalos por otros nuevos
3. Asegura que tu dominio apunte al IP del servidor.
4. Ejecuta:

```bash
npm run deploy:prod
```

Cuando `SITE_ADDRESS` sea un dominio real, Caddy gestionara HTTPS automaticamente.

## Nota importante

El despliegue local en este equipo deja la app publicada en `localhost`. Para hacerla publica en internet aun se necesita un servidor o VPS con IP publica y un dominio apuntando a ese servidor.
