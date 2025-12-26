# Backend - Plataforma de Venta de Cursos Online

API REST para la plataforma de venta de cursos online, desarrollada con NestJS.

## 📋 Requisitos Previos

- **Node.js** 18+
- **npm** 9+
- **Docker Desktop** ([Descargar aquí](https://www.docker.com/products/docker-desktop/))

## 🚀 Instalación

### 1. Clonar e instalar dependencias

```bash
git clone <url-del-repo>
cd maria-victoria-seoane-back
npm install
```

### 2. Configurar variables de entorno

```bash
# Copiar el archivo de ejemplo
cp .env.example .env
```

Editar `.env` con tus valores (para desarrollo local, los valores por defecto funcionan).

### 3. Levantar la base de datos con Docker

```bash
# Iniciar PostgreSQL (primera vez descarga la imagen, tarda un poco)
docker-compose up -d

# Verificar que está corriendo
docker ps
```

Deberías ver un contenedor llamado `cursos_db` corriendo.

### 4. Crear las tablas en la base de datos

```bash
# Ejecutar migraciones
npx prisma migrate dev --name init

# (Opcional) Cargar datos iniciales
npm run prisma:seed
```

### 5. Iniciar el servidor

```bash
# Modo desarrollo (con hot reload)
npm run start:dev
```

El servidor estará disponible en: **http://localhost:3000**

La documentación Swagger en: **http://localhost:3000/api/docs**

---

## 🐳 Comandos de Docker

| Comando                                                       | Descripción                          |
| ------------------------------------------------------------- | ------------------------------------ |
| `docker-compose up -d`                                        | Levantar PostgreSQL en segundo plano |
| `docker-compose down`                                         | Detener PostgreSQL                   |
| `docker-compose down -v`                                      | Detener y **borrar todos los datos** |
| `docker logs cursos_db`                                       | Ver logs de la base de datos         |
| `docker exec -it cursos_db psql -U postgres -d cursos_ventas` | Conectarse a la DB por consola       |

---

## 🗄️ Comandos de Prisma

| Comando                                  | Descripción                       |
| ---------------------------------------- | --------------------------------- |
| `npx prisma migrate dev --name <nombre>` | Crear nueva migración             |
| `npx prisma migrate deploy`              | Aplicar migraciones en producción |
| `npx prisma generate`                    | Regenerar el cliente de Prisma    |
| `npx prisma studio`                      | Abrir interfaz visual de la DB    |
| `npm run prisma:seed`                    | Cargar datos iniciales            |

---

## 📜 Scripts Disponibles

| Comando              | Descripción                |
| -------------------- | -------------------------- |
| `npm run start:dev`  | Iniciar en modo desarrollo |
| `npm run start:prod` | Iniciar en modo producción |
| `npm run build`      | Compilar el proyecto       |
| `npm run lint`       | Ejecutar linter            |
| `npm run test`       | Ejecutar tests unitarios   |
| `npm run test:e2e`   | Ejecutar tests end-to-end  |

---

## 📁 Estructura del Proyecto

```
src/
├── common/                 # Utilidades compartidas
│   ├── decorators/         # @Public, @Roles, @CurrentUser
│   ├── dto/                # DTOs comunes (paginación)
│   ├── filters/            # Filtro global de excepciones
│   ├── guards/             # JwtAuthGuard, RolesGuard
│   └── interceptors/       # Transformación de respuestas
├── config/                 # Configuración de la app
├── prisma/                 # PrismaService (conexión DB)
├── modules/                # Módulos de la aplicación
│   ├── auth/               # Autenticación (JWT, Google)
│   ├── users/              # Gestión de usuarios
│   ├── courses/            # Gestión de cursos
│   ├── cart/               # Carrito de compras
│   ├── checkout/           # Proceso de pago
│   ├── payments/           # Webhooks MercadoPago
│   ├── orders/             # Historial de órdenes
│   ├── coupons/            # Sistema de cupones
│   ├── messages/           # Mensajes de contacto
│   ├── site-config/        # Configuración del sitio
│   └── dashboard/          # Panel de administración
├── app.module.ts           # Módulo principal
└── main.ts                 # Punto de entrada
```

---

## 🔐 Variables de Entorno

Ver `.env.example` para todas las variables necesarias.

**Importantes para desarrollo:**

- `DATABASE_URL`: Conexión a PostgreSQL (ya configurada para Docker)
- `JWT_SECRET`: Secreto para firmar tokens JWT
- `JWT_REFRESH_SECRET`: Secreto para refresh tokens

---

## 🛠️ Troubleshooting

### Error: "Can't reach database server"

```bash
# Verificar que Docker está corriendo
docker ps

# Si no aparece cursos_db, levantarlo
docker-compose up -d
```

### Error: "Port 5432 already in use"

Otro servicio está usando el puerto. Opciones:

1. Detener el otro servicio de PostgreSQL
2. Cambiar el puerto en `docker-compose.yml` (ej: `5433:5432`)

### Regenerar la base de datos desde cero

```bash
docker-compose down -v          # Borra todo
docker-compose up -d            # Levanta de nuevo
npx prisma migrate dev          # Recrea las tablas
npm run prisma:seed             # Carga datos iniciales
```

---

## 📚 Documentación

- [Documentación API (Swagger)](http://localhost:3000/api/docs) - Disponible cuando el servidor está corriendo
- [Carpeta /Documentacion](./Documentacion/) - Especificaciones y requisitos del proyecto
