# Despliegue en Oracle Cloud VPS

Esta guia publica CEPETS en una instancia de Oracle Cloud usando Docker Compose, PostgreSQL interno y Caddy como proxy publico.

## Idea clave

En un VPS no uses `npm run dev` para publicar la aplicacion. Ese modo es para desarrollo local y hace que el frontend apunte a `localhost:4000`, que en el navegador del usuario seria su propia maquina, no el servidor.

Para produccion usa:

```bash
docker compose --env-file .env.production -f docker-compose.prod.yml up -d --build
```

Con este modo:

- el usuario entra por `http://IP_PUBLICA`
- Caddy recibe por el puerto `80`
- el frontend consume la API por `/api`
- los microservicios quedan privados dentro de Docker
- PostgreSQL queda privado dentro de Docker

## 1. Abrir puertos en Oracle

En Oracle Cloud Console abre las reglas de entrada de la VCN o Network Security Group de tu instancia:

| Puerto | Protocolo | Origen | Uso |
| --- | --- | --- | --- |
| 22 | TCP | Tu IP o `0.0.0.0/0` | SSH |
| 80 | TCP | `0.0.0.0/0` | HTTP publico |
| 443 | TCP | `0.0.0.0/0` | HTTPS publico si usas dominio |

No necesitas abrir `3000`, `4000`, `4101`, `4102`, `4103`, `4104` ni `4105` para produccion.

## 2. Preparar el servidor

Entra por SSH desde MobaXterm y actualiza el sistema:

```bash
sudo apt update
sudo apt upgrade -y
```

Instala Docker y el plugin de Compose si aun no existen:

```bash
sudo apt install -y docker.io docker-compose-plugin git
sudo systemctl enable --now docker
sudo usermod -aG docker $USER
```

Cierra y vuelve a abrir la sesion SSH para que el grupo `docker` aplique. Luego verifica:

```bash
docker --version
docker compose version
```

## 3. Clonar o actualizar el proyecto

Si aun no lo clonaste:

```bash
git clone https://github.com/arrobamilth/cepets-microservice.git
cd cepets-microservice
```

Si ya lo tenias:

```bash
cd cepets-microservice
git pull origin main
```

## 4. Crear `.env.production`

Crea el archivo desde la plantilla:

```bash
cp .env.production.example .env.production
nano .env.production
```

Para publicar por IP publica, usa algo como esto:

```env
NODE_ENV=production
SITE_ADDRESS=:80
PUBLIC_HTTP_PORT=80
PUBLIC_HTTPS_PORT=443

POSTGRES_DB=cepets
POSTGRES_USER=cepets
POSTGRES_PASSWORD=cambia-esta-contrasena

JWT_SECRET=cambia-este-secreto-largo
INTERNAL_SERVICE_KEY=cambia-este-otro-secreto-largo
```

Puedes generar secretos con:

```bash
openssl rand -hex 32
```

Si tienes un dominio apuntando al VPS, cambia:

```env
SITE_ADDRESS=cepets.tudominio.com
```

## 5. Levantar produccion

Ejecuta:

```bash
docker compose --env-file .env.production -f docker-compose.prod.yml up -d --build
```

Revisa el estado:

```bash
docker compose --env-file .env.production -f docker-compose.prod.yml ps
```

Revisa logs si algo falla:

```bash
docker compose --env-file .env.production -f docker-compose.prod.yml logs -f
```

## 6. Probar desde el VPS

Dentro del VPS:

```bash
curl http://localhost/health
curl http://localhost/api/health
```

Desde tu navegador:

```text
http://IP_PUBLICA
```

No uses `http://IP_PUBLICA:3000` para produccion.

## 7. Si no abre desde internet

Verifica que Caddy este escuchando en el puerto 80:

```bash
sudo ss -tulpn | grep ':80'
```

Si el puerto 80 esta abierto en Docker pero no carga desde el navegador, revisa:

- que la instancia tenga IP publica
- que Oracle tenga regla de ingreso TCP `80` desde `0.0.0.0/0`
- que no haya firewall del sistema bloqueando el puerto

Si usas `ufw`, permite:

```bash
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw status
```

## 8. Comandos utiles

Apagar:

```bash
docker compose --env-file .env.production -f docker-compose.prod.yml down
```

Actualizar despues de cambios en GitHub:

```bash
git pull origin main
docker compose --env-file .env.production -f docker-compose.prod.yml up -d --build
```

Ver logs resumidos:

```bash
docker compose --env-file .env.production -f docker-compose.prod.yml logs --tail 80
```
