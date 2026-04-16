# Railway

Esta guia deja CEPETS listo para desplegarse en Railway como proyecto de microservicios.

## Estrategia recomendada

- 1 servicio PostgreSQL gestionado por Railway
- 5 microservicios privados:
  - `auth-service`
  - `user-service`
  - `pet-service`
  - `image-service`
  - `adoption-service`
- 1 gateway publico:
  - `gateway`
- 1 frontend publico:
  - `web`

La interfaz web consume el gateway por dominio publico. Los demas servicios se comunican por red privada de Railway usando `*.railway.internal`.

## Archivos preparados

- Config as code por servicio:
  - [railway/auth-service.toml](../railway/auth-service.toml)
  - [railway/user-service.toml](../railway/user-service.toml)
  - [railway/pet-service.toml](../railway/pet-service.toml)
  - [railway/image-service.toml](../railway/image-service.toml)
  - [railway/adoption-service.toml](../railway/adoption-service.toml)
  - [railway/gateway.toml](../railway/gateway.toml)
  - [railway/web.toml](../railway/web.toml)
- Dockerfile compartido:
  - [docker/node-service.Dockerfile](../docker/node-service.Dockerfile)

## Crear servicios en Railway

1. Crea un proyecto nuevo en Railway.
2. Agrega un servicio PostgreSQL desde Railway.
3. Conecta el repositorio `arrobamilth/cepets-microservice`.
4. Crea 7 servicios desde el mismo repo:
   - `auth-service`
   - `user-service`
   - `pet-service`
   - `image-service`
   - `adoption-service`
   - `gateway`
   - `web`

## Configuracion por servicio

En cada servicio abre `Settings` y define:

- `Config as Code`:
  - `auth-service` -> `/railway/auth-service.toml`
  - `user-service` -> `/railway/user-service.toml`
  - `pet-service` -> `/railway/pet-service.toml`
  - `image-service` -> `/railway/image-service.toml`
  - `adoption-service` -> `/railway/adoption-service.toml`
  - `gateway` -> `/railway/gateway.toml`
  - `web` -> `/railway/web.toml`

## Variables compartidas

En `Project Settings -> Shared Variables` crea:

```env
NODE_ENV=production
JWT_SECRET=pon-aqui-un-secreto-largo
INTERNAL_SERVICE_KEY=pon-aqui-otro-secreto-largo
DATABASE_URL=${{Postgres.DATABASE_URL}}
```

## Variables por servicio

### auth-service

```env
AUTH_SERVICE_PORT=4101
USER_SERVICE_URL=http://user-service.railway.internal:4102
```

### user-service

```env
USER_SERVICE_PORT=4102
AUTH_SERVICE_URL=http://auth-service.railway.internal:4101
```

### pet-service

```env
PET_SERVICE_PORT=4103
USER_SERVICE_URL=http://user-service.railway.internal:4102
IMAGE_SERVICE_URL=http://image-service.railway.internal:4104
ADOPTION_SERVICE_URL=http://adoption-service.railway.internal:4105
```

### image-service

```env
IMAGE_SERVICE_PORT=4104
```

Ademas, adjunta un `Volume` en Railway con mount path:

```text
/app/services/image-service/uploads
```

### adoption-service

```env
ADOPTION_SERVICE_PORT=4105
PET_SERVICE_URL=http://pet-service.railway.internal:4103
USER_SERVICE_URL=http://user-service.railway.internal:4102
```

### gateway

```env
GATEWAY_PORT=4000
AUTH_SERVICE_URL=http://auth-service.railway.internal:4101
USER_SERVICE_URL=http://user-service.railway.internal:4102
PET_SERVICE_URL=http://pet-service.railway.internal:4103
IMAGE_SERVICE_URL=http://image-service.railway.internal:4104
ADOPTION_SERVICE_URL=http://adoption-service.railway.internal:4105
PORT=4000
```

Luego genera un dominio publico para este servicio.

### web

```env
WEB_PORT=3000
PORT=3000
CEPETS_API_URL=https://${{gateway.RAILWAY_PUBLIC_DOMAIN}}/api
```

Luego genera un dominio publico para este servicio.

## Orden sugerido de despliegue

1. PostgreSQL
2. `user-service`
3. `auth-service`
4. `image-service`
5. `pet-service`
6. `adoption-service`
7. `gateway`
8. `web`

## Validacion final

1. Abre el dominio publico de `web`.
2. Verifica que cargue el catalogo.
3. Verifica que login, registro y solicitudes funcionen.
4. Confirma que el servicio `image-service` tenga volumen adjunto para no perder imagenes.

## Notas

- Estoy infiriendo que el nombre del servicio PostgreSQL en Railway sera `Postgres`, porque asi suelen aparecer las referencias de variables de Railway. Si Railway te crea el servicio con otro nombre, reemplaza `${{Postgres.DATABASE_URL}}` por el nombre real.
- Railway recomienda usar red privada interna con nombres `*.railway.internal`, y esta guia sigue ese modelo.
