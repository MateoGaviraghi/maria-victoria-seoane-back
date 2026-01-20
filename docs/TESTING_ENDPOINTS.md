# 🧪 Guía de Testing de Endpoints

Esta guía describe cómo probar todos los endpoints del backend de venta de cursos usando Postman.

## 📥 Importar Colección en Postman

1. Abrir Postman
2. Click en **Import** (botón arriba a la izquierda)
3. Arrastrar el archivo `postman/Cursos-Backend-API.postman_collection.json`
4. Click en **Import**

### Variables de Colección (se setean automáticamente)

| Variable       | Descripción                                   |
| -------------- | --------------------------------------------- |
| `baseUrl`      | `http://localhost:3000/api`                   |
| `accessToken`  | Token JWT (se guarda al hacer login/register) |
| `refreshToken` | Token de refresh                              |
| `userId`       | ID del usuario actual                         |
| `categoryId`   | ID de la última categoría creada              |
| `courseId`     | ID del último curso creado                    |
| `moduleId`     | ID del último módulo creado                   |
| `lessonId`     | ID de la última lección creada                |

---

## 🚀 Orden de Testing Recomendado

### Pre-requisitos

```bash
# 1. Asegurar que Docker está corriendo con la base de datos
docker ps  # Debe mostrar contenedor cursos_db

# 2. Iniciar el servidor
cd maria-victoria-seoane-back
npm run start:dev

# 3. Verificar que el servidor responde
# GET http://localhost:3000/api → { "message": "...", "version": "..." }
```

---

## 📋 FASE 1: Autenticación

### 1.1 Registro de Usuario Admin

**Request:** `Auth > Register`

```json
POST /api/auth/register
{
  "email": "admin@test.com",
  "password": "Admin1234!",
  "firstName": "Admin",
  "lastName": "Test"
}
```

**Respuesta esperada:** `201 Created`

```json
{
  "message": "Usuario registrado exitosamente",
  "data": {
    "user": { "id": "uuid", "email": "admin@test.com", ... },
    "accessToken": "eyJ...",
    "refreshToken": "eyJ..."
  }
}
```

✅ Las variables `accessToken`, `refreshToken`, `userId` se guardan automáticamente.

### 1.2 Promover a OWNER (desde consola o BD)

```sql
-- En la base de datos
UPDATE users SET role = 'OWNER' WHERE email = 'admin@test.com';
```

O crear un usuario OWNER directamente con seed.

### 1.3 Login

**Request:** `Auth > Login`

```json
POST /api/auth/login
{
  "email": "admin@test.com",
  "password": "Admin1234!"
}
```

**Respuesta esperada:** `200 OK` con tokens actualizados.

### 1.4 Verificar Sesión

**Request:** `Auth > Get Me`

```
GET /api/auth/me
Authorization: Bearer {{accessToken}}
```

**Respuesta esperada:** `200 OK` con datos del usuario.

### 1.5 Refresh Token

**Request:** `Auth > Refresh Token`

```json
POST /api/auth/refresh
{
  "refreshToken": "{{refreshToken}}"
}
```

**Respuesta esperada:** `200 OK` con nuevos tokens.

---

## 📋 FASE 2: Usuarios

### 2.1 Mi Perfil

**Request:** `Users > Get My Profile`

```
GET /api/users/me
```

**Respuesta esperada:** `200 OK` con perfil completo y órdenes.

### 2.2 Actualizar Mi Perfil

**Request:** `Users > Update My Profile`

```json
PUT /api/users/me
{
  "firstName": "Admin Actualizado",
  "phone": "+54 11 1234-5678"
}
```

**Respuesta esperada:** `200 OK` con datos actualizados.

---

## 📋 FASE 3: Usuarios (Admin)

> ⚠️ Requiere rol OWNER o SUPER_ADMIN

### 3.1 Listar Usuarios

**Request:** `Users (Admin) > List Users`

```
GET /api/users?page=1&limit=10
```

**Filtros opcionales:** `search`, `role`, `isActive`

### 3.2 Estadísticas de Usuarios

**Request:** `Users (Admin) > Get User Stats`

```
GET /api/users/stats
```

**Respuesta esperada:**

```json
{
  "total": 5,
  "byRole": { "STUDENT": 3, "OWNER": 1, "SUPER_ADMIN": 1 },
  "byStatus": { "REGISTERED": 2, "PAID": 3, ... },
  "active": 4,
  "inactive": 1,
  "newThisMonth": 2
}
```

### 3.3 Obtener Usuario por ID

**Request:** `Users (Admin) > Get User by ID`

```
GET /api/users/{{userId}}
```

### 3.4 Actualizar Usuario (Admin)

**Request:** `Users (Admin) > Update User`

```json
PUT /api/users/{{userId}}
{
  "firstName": "Nombre Editado por Admin"
}
```

### 3.5 Desactivar/Activar Usuario

**Request:** `Users (Admin) > Deactivate User`

```
DELETE /api/users/{{userId}}
```

**Request:** `Users (Admin) > Activate User`

```
PUT /api/users/{{userId}}/activate
```

### 3.6 Cambiar Rol (Solo SUPER_ADMIN)

**Request:** `Users (Admin) > Change User Role`

```json
PUT /api/users/{{userId}}/role
{
  "role": "OWNER"
}
```

---

## 📋 FASE 4: Categorías

### 4.1 Crear Categoría ✏️

**Request:** `Categories > Create Category`

```json
POST /api/categories
{
  "name": "Desarrollo Web",
  "description": "Cursos de desarrollo web",
  "slug": "desarrollo-web"
}
```

**Respuesta esperada:** `201 Created`
✅ La variable `categoryId` se guarda automáticamente.

### 4.2 Listar Categorías 🔓

**Request:** `Categories > Get All Categories`

```
GET /api/categories
```

**Nota:** Este endpoint es público (no requiere auth).

### 4.3 Obtener por ID 🔓

**Request:** `Categories > Get Category by ID`

```
GET /api/categories/{{categoryId}}
```

### 4.4 Obtener por Slug 🔓

**Request:** `Categories > Get Category by Slug`

```
GET /api/categories/slug/desarrollo-web
```

### 4.5 Actualizar Categoría ✏️

**Request:** `Categories > Update Category`

```json
PUT /api/categories/{{categoryId}}
{
  "name": "Desarrollo Web Avanzado",
  "description": "Cursos avanzados"
}
```

### 4.6 Reordenar Categorías ✏️

**Request:** `Categories > Reorder Categories`

```json
PUT /api/categories/reorder/batch
{
  "orderedIds": ["uuid-1", "uuid-2"]
}
```

### 4.7 Eliminar Categoría ✏️

**Request:** `Categories > Delete Category`

```
DELETE /api/categories/{{categoryId}}
```

**Respuesta esperada:** `200 OK`

```json
{ "message": "Categoría eliminada correctamente" }
```

---

## 📋 FASE 5: Cursos

### 5.1 Crear Curso ✏️

**Request:** `Courses > Create Course`

```json
POST /api/courses
{
  "title": "Curso Completo de NestJS",
  "shortDescription": "Aprende NestJS desde cero",
  "longDescription": "En este curso aprenderás...",
  "price": 29990,
  "discountPrice": 19990,
  "level": "Intermedio",
  "language": "Español",
  "categoryIds": ["{{categoryId}}"]
}
```

✅ La variable `courseId` se guarda automáticamente.

### 5.2 Listar Cursos 🔓

**Request:** `Courses > Get All Courses`

```
GET /api/courses?page=1&limit=10
```

**Filtros opcionales:** `search`, `categoryId`, `categorySlug`, `level`, `isPublished`, `isFeatured`, `sortBy`, `sortOrder`

### 5.3 Cursos Destacados 🔓

**Request:** `Courses > Get Featured Courses`

```
GET /api/courses/featured?limit=6
```

### 5.4 Obtener por Slug 🔓

**Request:** `Courses > Get Course by Slug`

```
GET /api/courses/slug/curso-completo-de-nestjs
```

### 5.5 Obtener por ID 🔓

**Request:** `Courses > Get Course by ID`

```
GET /api/courses/{{courseId}}?includeModules=true
```

### 5.6 Estadísticas del Curso ✏️

**Request:** `Courses > Get Course Stats`

```
GET /api/courses/{{courseId}}/stats
```

**Respuesta esperada:**

```json
{
  "totalStudents": 25,
  "totalRevenue": 499750,
  "averageRating": 4.5,
  "modulesCount": 5,
  "lessonsCount": 20,
  "totalDuration": 300
}
```

### 5.7 Actualizar Curso ✏️

**Request:** `Courses > Update Course`

```json
PUT /api/courses/{{courseId}}
{
  "title": "Curso de NestJS 2024",
  "price": 34990
}
```

### 5.8 Publicar/Despublicar ✏️

**Request:** `Courses > Toggle Publish Course`

```
PATCH /api/courses/{{courseId}}/toggle-publish
```

### 5.9 Destacar/Quitar Destacado ✏️

**Request:** `Courses > Toggle Featured Course`

```
PATCH /api/courses/{{courseId}}/toggle-featured
```

### 5.10 Reordenar Cursos ✏️

**Request:** `Courses > Reorder Courses`

```json
PUT /api/courses/reorder/batch
{
  "orderedIds": ["uuid-1", "uuid-2"]
}
```

### 5.11 Eliminar Curso ✏️

**Request:** `Courses > Delete Course`

```
DELETE /api/courses/{{courseId}}
```

---

## 📋 FASE 6: Módulos

### 6.1 Crear Módulo ✏️

**Request:** `Modules > Create Module`

```json
POST /api/modules
{
  "courseId": "{{courseId}}",
  "title": "Introducción a NestJS",
  "description": "Conceptos básicos"
}
```

✅ La variable `moduleId` se guarda automáticamente.

### 6.2 Listar Módulos de un Curso 🔓

**Request:** `Modules > Get Modules by Course`

```
GET /api/modules/course/{{courseId}}?includeLessons=true
```

### 6.3 Obtener Módulo por ID 🔓

**Request:** `Modules > Get Module by ID`

```
GET /api/modules/{{moduleId}}?includeLessons=true
```

### 6.4 Actualizar Módulo ✏️

**Request:** `Modules > Update Module`

```json
PUT /api/modules/{{moduleId}}
{
  "title": "Introducción - Actualizado",
  "description": "Nueva descripción"
}
```

### 6.5 Reordenar Módulos ✏️

**Request:** `Modules > Reorder Modules`

```json
PUT /api/modules/course/{{courseId}}/reorder
{
  "orderedIds": ["uuid-1", "uuid-2"]
}
```

### 6.6 Duplicar Módulo ✏️

**Request:** `Modules > Duplicate Module`

```
POST /api/modules/{{moduleId}}/duplicate
```

### 6.7 Eliminar Módulo ✏️

**Request:** `Modules > Delete Module`

```
DELETE /api/modules/{{moduleId}}
```

---

## 📋 FASE 7: Lecciones (Temario)

### 7.1 Crear Lección ✏️

**Request:** `Lessons > Create Lesson`

```json
POST /api/lessons
{
  "moduleId": "{{moduleId}}",
  "title": "Instalación de NestJS",
  "description": "Aprende a instalar y configurar",
  "duration": 15,
  "isFree": true
}
```

✅ La variable `lessonId` se guarda automáticamente.

> **NOTA:** Los campos `videoUrl`, `content` y `resources` se gestionan en el backend de plataforma educativa.

### 7.2 Listar Lecciones de un Módulo 🔓

**Request:** `Lessons > Get Lessons by Module`

```
GET /api/lessons/module/{{moduleId}}
```

### 7.3 Obtener Lección por ID 🔓

**Request:** `Lessons > Get Lesson by ID`

```
GET /api/lessons/{{lessonId}}
```

### 7.4 Actualizar Lección ✏️

**Request:** `Lessons > Update Lesson`

```json
PUT /api/lessons/{{lessonId}}
{
  "title": "Instalación - Actualizado",
  "duration": 20,
  "isFree": false
}
```

### 7.5 Reordenar Lecciones ✏️

**Request:** `Lessons > Reorder Lessons`

```json
PUT /api/lessons/module/{{moduleId}}/reorder
{
  "orderedIds": ["uuid-1", "uuid-2", "uuid-3"]
}
```

### 7.6 Mover Lección a Otro Módulo ✏️

**Request:** `Lessons > Move Lesson`

```json
PATCH /api/lessons/{{lessonId}}/move
{
  "targetModuleId": "uuid-del-otro-modulo",
  "order": 0
}
```

### 7.7 Duplicar Lección ✏️

**Request:** `Lessons > Duplicate Lesson`

```
POST /api/lessons/{{lessonId}}/duplicate
```

### 7.8 Eliminar Lección ✏️

**Request:** `Lessons > Delete Lesson`

```
DELETE /api/lessons/{{lessonId}}
```

---

## 📊 Resumen de Endpoints

| Módulo        | Total  | Públicos | Admin  |
| ------------- | ------ | -------- | ------ |
| Auth          | 10     | 2        | 8      |
| Users         | 2      | 0        | 2      |
| Users (Admin) | 7      | 0        | 7      |
| Categories    | 7      | 4        | 3      |
| Courses       | 11     | 5        | 6      |
| Modules       | 7      | 2        | 5      |
| Lessons       | 8      | 2        | 6      |
| **TOTAL**     | **52** | **15**   | **37** |

### Leyenda

- 🔓 **Público**: No requiere autenticación
- ✏️ **Admin**: Requiere rol OWNER o SUPER_ADMIN
- 🔑 **Auth**: Requiere autenticación (cualquier usuario)

---

## 🔍 Checklist de Testing

### Auth

- [ ] Register → Crear usuario nuevo
- [ ] Login → Obtener tokens
- [ ] Get Me → Ver usuario autenticado
- [ ] Refresh Token → Renovar tokens
- [ ] Forgot Password → Solicitar reset
- [ ] Reset Password → Cambiar con token
- [ ] Change Password → Cambiar estando logueado
- [ ] Verify Email → Verificar email
- [ ] Resend Verification → Reenviar verificación
- [ ] Logout → Cerrar sesión

### Users

- [ ] Get My Profile → Mi perfil
- [ ] Update My Profile → Actualizar mi perfil

### Users (Admin)

- [ ] List Users → Listar usuarios
- [ ] Get User Stats → Estadísticas
- [ ] Get User by ID → Usuario específico
- [ ] Update User → Editar usuario
- [ ] Deactivate User → Desactivar
- [ ] Activate User → Activar
- [ ] Change User Role → Cambiar rol

### Categories

- [ ] Create Category → Crear categoría
- [ ] Get All Categories → Listar todas
- [ ] Get Category by ID → Por ID
- [ ] Get Category by Slug → Por slug
- [ ] Update Category → Actualizar
- [ ] Reorder Categories → Reordenar
- [ ] Delete Category → Eliminar

### Courses

- [ ] Create Course → Crear curso
- [ ] Get All Courses → Listar cursos
- [ ] Get Featured Courses → Destacados
- [ ] Get Course by Slug → Por slug
- [ ] Get Course by ID → Por ID
- [ ] Get Course Stats → Estadísticas
- [ ] Update Course → Actualizar
- [ ] Toggle Publish → Publicar/despublicar
- [ ] Toggle Featured → Destacar/quitar
- [ ] Reorder Courses → Reordenar
- [ ] Delete Course → Eliminar

### Modules

- [ ] Create Module → Crear módulo
- [ ] Get Modules by Course → Por curso
- [ ] Get Module by ID → Por ID
- [ ] Update Module → Actualizar
- [ ] Reorder Modules → Reordenar
- [ ] Duplicate Module → Duplicar
- [ ] Delete Module → Eliminar

### Lessons

- [ ] Create Lesson → Crear lección
- [ ] Get Lessons by Module → Por módulo
- [ ] Get Lesson by ID → Por ID
- [ ] Update Lesson → Actualizar
- [ ] Reorder Lessons → Reordenar
- [ ] Move Lesson → Mover a otro módulo
- [ ] Duplicate Lesson → Duplicar
- [ ] Delete Lesson → Eliminar

---

## 🐛 Troubleshooting

### Error 401 Unauthorized

- Verificar que tienes un token válido
- Ejecutar Login nuevamente
- Verificar que el token no expiró

### Error 403 Forbidden

- El endpoint requiere rol OWNER o SUPER_ADMIN
- Verificar tu rol en la base de datos

### Error 404 Not Found

- El ID que estás usando no existe
- Crear primero el recurso (categoría, curso, etc.)

### Variables no se guardan

- Verificar que los scripts de test están habilitados en Postman
- Ejecutar los requests en orden (crear antes de consultar)
