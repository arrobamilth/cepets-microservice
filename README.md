# CEPETS
CEPETS es una plataforma web para la gestion de adopcion responsable de mascotas. La solucion fue construida a partir de los requerimientos del documento `PIMER ENTREGABLE - PROYECTO TENDENCIAS ING SOFTWARE.pdf` y se implemento con una arquitectura de microservicios.

## Arquitectura

- `auth-service`: valida credenciales y emite JWT por rol.
- `user-service`: expone el perfil autenticado y permite actualizar datos.
- `pet-service`: registra, lista y actualiza mascotas segun permisos.
- `image-service`: carga, sirve y vincula imagenes de mascotas.
- `adoption-service`: crea y revisa solicitudes de adopcion.
- `gateway`: punto de entrada unico para el frontend.
- `apps/web`: interfaz web responsiva para administradores, organizaciones y adoptantes.

Los microservicios conservan sus contratos y responsabilidades separadas, pero ahora comparten PostgreSQL como capa de persistencia para facilitar despliegue, respaldo y crecimiento del proyecto.

## Persistencia actual

La aplicacion fue migrada para usar PostgreSQL como almacenamiento principal. Los archivos JSON dentro de `services/*/data` se conservan como fuente de bootstrap para la primera inicializacion de la base de datos y como respaldo del estado historico del MVP.

- Base de datos principal: PostgreSQL
- Metadatos persistidos: usuarios, credenciales, mascotas, imagenes y solicitudes
- Archivos binarios de imagenes: `services/image-service/uploads`

En el primer arranque contra una base vacia, CEPETS crea el esquema y migra automaticamente los datos existentes desde los JSON actuales hacia PostgreSQL.

## Requisitos cubiertos

- Inicio de sesion con roles `ADMIN`, `ORG` y `ADOPTANTE`.
- Registro de mascotas con nombre, especie, edad, genero, descripcion, estado e imagen.
- Listado de mascotas filtrado por rol.
- Formulario de adopcion con estado inicial `PENDING`.
- Revision de solicitudes por `ADMIN` y `ORG`.
- Gestion de imagenes asociadas a mascotas.
- Control de acceso por rol y sesion activa.
- Interfaz adaptable a escritorio y movil.

## Cuentas de prueba

- `admin@cepets.local` / `Cepets2026!`
- `org@cepets.local` / `Cepets2026!`
- `adoptante@cepets.local` / `Cepets2026!`

## Ejecutar en local

### Opcion 1: Postgres con Docker y servicios con Node

1. Levanta PostgreSQL:

```bash
npm run db:up
```

2. Inicializa el esquema y migra los JSON actuales a PostgreSQL:

```bash
npm run db:init
```

3. Levanta los microservicios y el frontend:

```bash
npm run dev
```

### Opcion 2: Todo con Docker Compose

```bash
docker compose up --build
```

Esto levanta:
- PostgreSQL con volumen persistente
- microservicios
- gateway
- frontend

### Variables importantes

- `DATABASE_URL`: cadena de conexion a PostgreSQL
- `DATABASE_SSL=true`: habilita SSL para proveedores gestionados
- `CEPETS_API_URL`: URL del gateway consumida por el frontend
- `JWT_SECRET`: firma de tokens en produccion
- `INTERNAL_SERVICE_KEY`: autentica comunicacion interna entre microservicios

Si no defines `DATABASE_URL`, el entorno local usa por defecto:

```text
postgresql://cepets:cepets@localhost:5432/cepets
```

### Instalacion de dependencias

```bash
npm install
```

### Acceso

- Frontend: [http://localhost:3000](http://localhost:3000)
- API Gateway: [http://localhost:4000/api/health](http://localhost:4000/api/health)

## Smoke test

Con el stack levantado, puedes validar los flujos principales de lectura y autenticacion con:

```bash
npm run smoke
```

## Despliegue de produccion

El proyecto ya incluye un stack de produccion con proxy publico, PostgreSQL y volumenes persistentes:

```bash
npm run deploy:prod
```

La documentacion paso a paso esta en [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md).

## Railway

Tambien deje preparada una configuracion especifica para Railway, incluyendo archivos `config as code` por servicio y una guia de variables/red privada:

- [docs/RAILWAY.md](docs/RAILWAY.md)

## Estructura

```text
apps/
  web/
docker/
packages/
  shared/
scripts/
services/
  auth-service/
  user-service/
  pet-service/
  image-service/
  adoption-service/
  gateway/
```
