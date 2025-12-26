# 🚀 Plan de Acción - Backend Sistema de Ventas

## Plataforma de Cursos Personalizados

**Versión:** 1.0  
**Fecha:** 26 de Diciembre, 2025  
**Framework:** NestJS

---

## 📋 Índice de Documentación

| #   | Documento                                                                    | Contenido                                   | Cuándo Consultar                         |
| --- | ---------------------------------------------------------------------------- | ------------------------------------------- | ---------------------------------------- |
| 01  | [01-requisitos-sistema-SRS.md](./01-requisitos-sistema-SRS.md)               | Requisitos funcionales y no funcionales     | Para entender QUÉ debe hacer el sistema  |
| 02  | [02-arquitectura-tecnica.md](./02-arquitectura-tecnica.md)                   | Arquitectura general, stack completo        | Para visión general del ecosistema       |
| 03  | [03-user-stories-flujos.md](./03-user-stories-flujos.md)                     | User stories, flujos de usuario, wireframes | Para entender la experiencia del usuario |
| 04  | [04-backend-ventas-especificacion.md](./04-backend-ventas-especificacion.md) | **Especificación técnica del backend**      | Para implementar cada módulo             |

---

## 🎯 Resumen del Proyecto

### ¿Qué estamos construyendo?

- **Sistema de Ventas de Cursos Online** con NestJS
- Clonable para múltiples clientes
- Independiente del Sistema LMS

### Roles del Sistema

| Rol         | Descripción                                       |
| ----------- | ------------------------------------------------- |
| SUPER_ADMIN | Tu equipo (desarrollo) - Todo                     |
| OWNER       | Cliente (profesora) - Ver métricas, CRM, mensajes |
| STUDENT     | Alumno - Registrarse, comprar, ver cursos         |

### Flujo Principal

```
Registro → Ver Cursos → Agregar Carrito → Checkout (completar datos) → Pagar → Email confirmación
```

---

## 📅 FASES DE DESARROLLO

---

# FASE 1: Configuración Inicial

**Duración estimada:** 1-2 días  
**Prioridad:** 🔴 CRÍTICA

## 📖 Documentación a consultar:

- [04-backend-ventas-especificacion.md](./04-backend-ventas-especificacion.md) → Sección 2 (Stack), Sección 6 (Estructura), Sección 7 (Variables de Entorno)

## ✅ Tareas

### 1.1 Crear proyecto NestJS

```bash
nest new backend-ventas
cd backend-ventas
```

### 1.2 Instalar dependencias

```bash
# Core
npm install @nestjs/config @nestjs/swagger swagger-ui-express

# Base de datos
npm install @prisma/client
npm install -D prisma

# Autenticación
npm install @nestjs/passport @nestjs/jwt passport passport-jwt passport-google-oauth20
npm install -D @types/passport-jwt @types/passport-google-oauth20

# Validación
npm install class-validator class-transformer

# Emails
npm install @nestjs-modules/mailer nodemailer handlebars
npm install -D @types/nodemailer

# Scheduler (cron jobs)
npm install @nestjs/schedule

# Seguridad
npm install bcrypt helmet
npm install -D @types/bcrypt

# Utils
npm install uuid
npm install -D @types/uuid
```

### 1.3 Configurar Prisma

```bash
npx prisma init
```

### 1.4 Crear archivo .env

- Consultar: Sección 7 de `04-backend-ventas-especificacion.md`

### 1.5 Configurar estructura de carpetas

- Consultar: Sección 6 de `04-backend-ventas-especificacion.md`

### 1.6 Configurar Swagger

```typescript
// main.ts - Agregar configuración de Swagger
```

## 🎯 Checkpoint Fase 1

- [ ] Proyecto NestJS creado y ejecutándose
- [ ] Prisma conectado a PostgreSQL
- [ ] Swagger accesible en `/api/docs`
- [ ] Variables de entorno configuradas
- [ ] Estructura de carpetas creada

---

# FASE 2: Base de Datos (Prisma Schema)

**Duración estimada:** 1-2 días  
**Prioridad:** 🔴 CRÍTICA

## 📖 Documentación a consultar:

- [04-backend-ventas-especificacion.md](./04-backend-ventas-especificacion.md) → Sección 4 (Modelo de Datos completo)

## ✅ Tareas

### 2.1 Crear schema.prisma completo

Copiar el schema de la documentación que incluye:

- `SiteConfig` - Configuración del sitio
- `FeatureToggle` - Funciones activables
- `User` - Usuarios (3 roles)
- `Token` - Refresh tokens
- `Course` - Cursos
- `Module` - Módulos
- `Lesson` - Lecciones
- `CourseFaq` - FAQs
- `Review` - Reseñas
- `CartItem` - Carrito
- `Order` - Órdenes
- `OrderItem` - Items de orden
- `Payment` - Pagos
- `Coupon` - Cupones
- `Message` - Mensajes
- `ScheduledEmail` - Emails programados
- `DailyStats` - Métricas
- `ActivityLog` - Logs

### 2.2 Ejecutar migración inicial

```bash
npx prisma migrate dev --name init
```

### 2.3 Crear PrismaService

```typescript
// src/prisma/prisma.service.ts
```

### 2.4 Crear seed inicial

```bash
npx prisma db seed
```

- Usuario SUPER_ADMIN por defecto
- Configuración inicial del sitio
- Feature toggles por defecto

## 🎯 Checkpoint Fase 2

- [ ] Schema de Prisma completo
- [ ] Migración ejecutada sin errores
- [ ] PrismaService funcionando
- [ ] Seed con datos iniciales
- [ ] Prisma Studio accesible (`npx prisma studio`)

---

# FASE 3: Módulo de Autenticación

**Duración estimada:** 3-4 días  
**Prioridad:** 🔴 CRÍTICA

## 📖 Documentación a consultar:

- [04-backend-ventas-especificacion.md](./04-backend-ventas-especificacion.md) → Sección 5.1 (Endpoints Auth), Sección 6.1-6.4 (Ejemplos código), Sección 9 (Seguridad)
- [03-user-stories-flujos.md](./03-user-stories-flujos.md) → US-07 a US-11 (User Stories de Auth)

## ✅ Tareas

### 3.1 Crear AuthModule

- `auth.module.ts`
- `auth.controller.ts`
- `auth.service.ts`

### 3.2 Implementar Estrategias Passport

- `jwt.strategy.ts` - Access token
- `jwt-refresh.strategy.ts` - Refresh token
- `google.strategy.ts` - OAuth Google

### 3.3 Crear Guards

- `jwt-auth.guard.ts`
- `jwt-refresh.guard.ts`
- `google-auth.guard.ts`
- `roles.guard.ts`

### 3.4 Crear Decoradores

- `@CurrentUser()` - Obtener usuario actual
- `@Roles()` - Definir roles requeridos
- `@Public()` - Rutas públicas

### 3.5 Crear DTOs

- `register.dto.ts` - Nombre, Apellido, Email, Password
- `login.dto.ts` - Email, Password
- `refresh-token.dto.ts`
- `forgot-password.dto.ts`
- `reset-password.dto.ts`

### 3.6 Implementar Endpoints

```
POST /api/auth/register
POST /api/auth/login
POST /api/auth/google
POST /api/auth/refresh
POST /api/auth/logout
POST /api/auth/forgot-password
POST /api/auth/reset-password
GET  /api/auth/me
```

## 🎯 Checkpoint Fase 3

- [ ] Registro con email funcional
- [ ] Login retorna access + refresh token
- [ ] Refresh token renueva access token
- [ ] Guard JWT protege rutas
- [ ] Guard de Roles funciona
- [ ] Google OAuth funcional
- [ ] Recuperación de contraseña funciona

---

# FASE 4: Módulo de Usuarios

**Duración estimada:** 2-3 días  
**Prioridad:** 🔴 CRÍTICA

## 📖 Documentación a consultar:

- [04-backend-ventas-especificacion.md](./04-backend-ventas-especificacion.md) → Sección 5.2 (Endpoints Users), Sección 4 (Modelo User)
- [03-user-stories-flujos.md](./03-user-stories-flujos.md) → US-33, US-34, US-35 (CRM Alumnos)

## ✅ Tareas

### 4.1 Crear UsersModule

- `users.module.ts`
- `users.controller.ts` (rutas de alumno)
- `admin-users.controller.ts` (rutas de admin)
- `users.service.ts`

### 4.2 Crear DTOs

- `update-profile.dto.ts`
- `complete-profile.dto.ts` (DNI, Teléfono, Fecha Nac)
- `user-filter.dto.ts` (filtros CRM)

### 4.3 Implementar Endpoints Alumno

```
GET  /api/users/profile
PUT  /api/users/profile
PUT  /api/users/complete-profile
```

### 4.4 Implementar Endpoints Admin (CRM)

```
GET  /api/admin/users              # Lista con filtros
GET  /api/admin/users/:id          # Detalle
GET  /api/admin/users/export       # Exportar Excel
GET  /api/admin/users/stats        # Estadísticas
PUT  /api/admin/users/:id/status   # Cambiar estado (SUPER_ADMIN)
```

### 4.5 Implementar Filtros CRM

- Por estado: REGISTERED, IN_CART, PENDING_PAYMENT, PAID, IN_PROGRESS, COMPLETED
- Por fecha de registro
- Por curso
- Búsqueda por nombre/email

### 4.6 Implementar Exportación a Excel

- Librería: `exceljs`

## 🎯 Checkpoint Fase 4

- [ ] Perfil de usuario editable
- [ ] Completar perfil (datos de checkout) funcional
- [ ] CRM lista usuarios con filtros
- [ ] Filtro por estado funciona
- [ ] Exportar a Excel funciona
- [ ] Estadísticas de usuarios

---

# FASE 5: Módulo de Cursos

**Duración estimada:** 2-3 días  
**Prioridad:** 🔴 CRÍTICA

## 📖 Documentación a consultar:

- [04-backend-ventas-especificacion.md](./04-backend-ventas-especificacion.md) → Sección 5.3 (Endpoints Courses), Sección 4 (Modelo Course, Module, Lesson)
- [01-requisitos-sistema-SRS.md](./01-requisitos-sistema-SRS.md) → RF-V01, RF-V02 (Requisitos de cursos)

## ✅ Tareas

### 5.1 Crear CoursesModule

- `courses.module.ts`
- `courses.controller.ts` (rutas públicas)
- `admin-courses.controller.ts` (CRUD admin)
- `courses.service.ts`

### 5.2 Crear DTOs

- `create-course.dto.ts`
- `update-course.dto.ts`
- `course-filter.dto.ts`
- `create-module.dto.ts`
- `create-lesson.dto.ts`
- `create-faq.dto.ts`
- `create-review.dto.ts`

### 5.3 Implementar Endpoints Públicos

```
GET  /api/courses                 # Lista publicados
GET  /api/courses/:slug           # Detalle
GET  /api/courses/:slug/reviews   # Reviews
GET  /api/courses/:slug/faqs      # FAQs
```

### 5.4 Implementar Endpoints Admin (SUPER_ADMIN)

```
POST   /api/admin/courses              # Crear
PUT    /api/admin/courses/:id          # Actualizar
DELETE /api/admin/courses/:id          # Eliminar
PUT    /api/admin/courses/:id/publish  # Publicar
PUT    /api/admin/courses/:id/unpublish

# Módulos
POST   /api/admin/courses/:id/modules
PUT    /api/admin/modules/:id
DELETE /api/admin/modules/:id
PUT    /api/admin/modules/reorder

# Lecciones
POST   /api/admin/modules/:id/lessons
PUT    /api/admin/lessons/:id
DELETE /api/admin/lessons/:id

# FAQs y Reviews
POST   /api/admin/courses/:id/faqs
POST   /api/admin/courses/:id/reviews
```

## 🎯 Checkpoint Fase 5

- [ ] Listar cursos públicos
- [ ] Ver detalle de curso con módulos y lecciones
- [ ] CRUD de cursos funcional
- [ ] CRUD de módulos con reordenamiento
- [ ] CRUD de lecciones
- [ ] CRUD de FAQs y Reviews

---

# FASE 6: Módulo de Carrito

**Duración estimada:** 1-2 días  
**Prioridad:** 🔴 CRÍTICA

## 📖 Documentación a consultar:

- [04-backend-ventas-especificacion.md](./04-backend-ventas-especificacion.md) → Sección 5.4 (Endpoints Cart), Sección 4 (Modelo CartItem)
- [03-user-stories-flujos.md](./03-user-stories-flujos.md) → US-04, US-05 (Carrito)

## ✅ Tareas

### 6.1 Crear CartModule

- `cart.module.ts`
- `cart.controller.ts`
- `cart.service.ts`

### 6.2 Crear DTOs

- `add-to-cart.dto.ts`
- `apply-coupon.dto.ts`

### 6.3 Implementar Endpoints

```
GET    /api/cart                    # Mi carrito
POST   /api/cart                    # Agregar curso
DELETE /api/cart/:courseId          # Quitar curso
DELETE /api/cart                    # Vaciar carrito
POST   /api/cart/apply-coupon       # Aplicar cupón
DELETE /api/cart/remove-coupon      # Quitar cupón
```

### 6.4 Lógica de negocio

- Validar que el curso no esté ya comprado
- Validar que el curso esté publicado
- Actualizar estado del usuario a IN_CART
- Calcular totales con/sin descuento

## 🎯 Checkpoint Fase 6

- [ ] Agregar cursos al carrito
- [ ] Ver carrito con totales
- [ ] Quitar cursos del carrito
- [ ] Aplicar cupón de descuento
- [ ] Estado del usuario se actualiza

---

# FASE 7: Módulo de Checkout y Pagos

**Duración estimada:** 4-5 días  
**Prioridad:** 🔴 CRÍTICA

## 📖 Documentación a consultar:

- [04-backend-ventas-especificacion.md](./04-backend-ventas-especificacion.md) → Sección 5.5 (Endpoints Checkout/Payments), Sección 8.2 (Flujo de Compra)
- [03-user-stories-flujos.md](./03-user-stories-flujos.md) → US-06 (Checkout), Sección 3.1 (Flujo de compra)

## ✅ Tareas

### 7.1 Crear CheckoutModule

- `checkout.module.ts`
- `checkout.controller.ts`
- `checkout.service.ts`

### 7.2 Crear PaymentsModule

- `payments.module.ts`
- `payments.controller.ts`
- `payments.service.ts`
- `webhooks.controller.ts`
- `providers/mercadopago.provider.ts`

### 7.3 Crear DTOs

- `checkout.dto.ts` (DNI, Teléfono, Fecha Nac)
- `order-filter.dto.ts`

### 7.4 Implementar Checkout

```
POST /api/checkout/validate   # Validar datos
POST /api/checkout/create     # Crear orden + preferencia MP
```

### 7.5 Implementar MercadoPago

- Crear preferencia de pago
- URL de retorno (success, failure, pending)
- Webhook para confirmación

### 7.6 Implementar Webhook

```
POST /api/payments/webhook/mercadopago
```

- Validar firma del webhook
- Actualizar estado de orden
- Actualizar estado de pago
- Actualizar estado del usuario (PAID)
- Vaciar carrito
- Enviar email de confirmación

### 7.7 Implementar Órdenes

```
GET /api/orders           # Mis órdenes
GET /api/orders/:id       # Detalle

# Admin
GET /api/admin/orders
GET /api/admin/orders/:id
GET /api/admin/payments
GET /api/admin/payments/stats
```

## 🎯 Checkpoint Fase 7

- [ ] Validar datos de checkout (DNI, tel, fecha nac)
- [ ] Crear orden en base de datos
- [ ] Crear preferencia en MercadoPago
- [ ] Redirect a MercadoPago funciona
- [ ] Webhook recibe notificación
- [ ] Orden se actualiza a PAID
- [ ] Usuario se actualiza a PAID
- [ ] Carrito se vacía
- [ ] Email de confirmación se envía

---

# FASE 8: Módulo de Cupones

**Duración estimada:** 1-2 días  
**Prioridad:** 🟡 MEDIA

## 📖 Documentación a consultar:

- [04-backend-ventas-especificacion.md](./04-backend-ventas-especificacion.md) → Sección 5.7 (Endpoints Coupons), Sección 4 (Modelo Coupon)

## ✅ Tareas

### 8.1 Crear CouponsModule

- `coupons.module.ts`
- `coupons.controller.ts`
- `coupons.service.ts`

### 8.2 Crear DTOs

- `create-coupon.dto.ts`
- `validate-coupon.dto.ts`

### 8.3 Implementar Endpoints

```
POST /api/coupons/validate        # Validar cupón (público)

# Admin (SUPER_ADMIN)
GET    /api/admin/coupons
POST   /api/admin/coupons
PUT    /api/admin/coupons/:id
DELETE /api/admin/coupons/:id
```

### 8.4 Lógica de validación

- Código existe y está activo
- No expirado
- No excede máximo de usos
- Mínimo de compra cumplido

## 🎯 Checkpoint Fase 8

- [ ] CRUD de cupones
- [ ] Validar cupón retorna descuento
- [ ] Cupón se aplica en checkout
- [ ] Contador de usos incrementa

---

# FASE 9: Módulo de Mensajes

**Duración estimada:** 2-3 días  
**Prioridad:** 🟡 MEDIA

## 📖 Documentación a consultar:

- [04-backend-ventas-especificacion.md](./04-backend-ventas-especificacion.md) → Sección 5.8 (Endpoints Messages), Sección 4 (Modelo Message)
- [03-user-stories-flujos.md](./03-user-stories-flujos.md) → US-22, US-23, US-36 (Mensajes)

## ✅ Tareas

### 9.1 Crear MessagesModule

- `messages.module.ts`
- `messages.controller.ts`
- `admin-messages.controller.ts`
- `messages.service.ts`

### 9.2 Crear DTOs

- `create-message.dto.ts`
- `reply-message.dto.ts`
- `message-filter.dto.ts`

### 9.3 Implementar Endpoints Alumno

```
GET  /api/messages           # Mis mensajes
GET  /api/messages/:id       # Ver mensaje
POST /api/messages           # Enviar al OWNER
PUT  /api/messages/:id/read  # Marcar leído
```

### 9.4 Implementar Endpoints Admin/OWNER

```
GET  /api/admin/messages              # Todos
GET  /api/admin/messages/:id          # Ver
POST /api/admin/messages/:id/reply    # Responder
PUT  /api/admin/messages/:id/archive  # Archivar
```

## 🎯 Checkpoint Fase 9

- [ ] Alumno puede enviar mensaje
- [ ] OWNER ve mensajes recibidos
- [ ] OWNER puede responder
- [ ] Hilos de conversación funcionan
- [ ] Marcar como leído funciona

---

# FASE 10: Módulo de Configuración del Sitio

**Duración estimada:** 1-2 días  
**Prioridad:** 🟡 MEDIA

## 📖 Documentación a consultar:

- [04-backend-ventas-especificacion.md](./04-backend-ventas-especificacion.md) → Sección 5.9 (Endpoints Config), Sección 4 (Modelo SiteConfig, FeatureToggle), Sección 10 (Feature Toggles)

## ✅ Tareas

### 10.1 Crear SiteConfigModule

- `site-config.module.ts`
- `site-config.controller.ts`
- `site-config.service.ts`

### 10.2 Crear DTOs

- `update-site-config.dto.ts`
- `update-toggle.dto.ts`

### 10.3 Implementar Endpoints

```
# Público
GET /api/config/site              # Config pública (nombre, logo, colores)

# Admin
GET /api/admin/config             # Toda la config
PUT /api/admin/config/site        # Actualizar (SUPER_ADMIN)
GET /api/admin/config/toggles     # Lista toggles
PUT /api/admin/config/toggles/:key # Activar/desactivar (OWNER)
```

### 10.4 Feature Toggles iniciales

- `birthday_email` - Email de cumpleaños
- `cart_abandoned_email` - Email carrito abandonado
- `welcome_email` - Email de bienvenida
- `reviews_visible` - Mostrar reseñas
- `coupons_enabled` - Permitir cupones

## 🎯 Checkpoint Fase 10

- [ ] Config pública accesible sin auth
- [ ] SUPER_ADMIN puede editar config
- [ ] OWNER puede activar/desactivar toggles
- [ ] Toggles afectan funcionalidades

---

# FASE 11: Módulo de Emails

**Duración estimada:** 2-3 días  
**Prioridad:** 🟡 MEDIA

## 📖 Documentación a consultar:

- [04-backend-ventas-especificacion.md](./04-backend-ventas-especificacion.md) → Sección 11 (Emails del Sistema), Sección 8.3 (Flujo Cumpleaños)

## ✅ Tareas

### 11.1 Crear EmailsModule

- `emails.module.ts`
- `emails.service.ts`
- `emails.processor.ts` (si usas queues)

### 11.2 Crear Templates (Handlebars)

- `welcome.hbs` - Bienvenida al registrarse
- `verify-email.hbs` - Verificación de email
- `reset-password.hbs` - Reset de contraseña
- `payment-confirmation.hbs` - Pago confirmado
- `birthday.hbs` - Feliz cumpleaños
- `cart-abandoned.hbs` - Carrito abandonado

### 11.3 Crear Schedulers (Cron Jobs)

- `birthday.scheduler.ts` - Ejecuta diario 8:00 AM
- `cart-abandoned.scheduler.ts` - Ejecuta cada 6 horas

### 11.4 Lógica de Schedulers

```typescript
// Birthday: Buscar usuarios con cumpleaños HOY
// Cart Abandoned: Buscar usuarios con carrito > 24h sin comprar
```

## 🎯 Checkpoint Fase 11

- [ ] Email de bienvenida al registrarse
- [ ] Email de confirmación de pago
- [ ] Cron de cumpleaños funciona
- [ ] Cron de carrito abandonado funciona
- [ ] Respetar feature toggles

---

# FASE 12: Dashboard y Métricas

**Duración estimada:** 2-3 días  
**Prioridad:** 🟡 MEDIA

## 📖 Documentación a consultar:

- [04-backend-ventas-especificacion.md](./04-backend-ventas-especificacion.md) → Sección 5.10 (Endpoints Dashboard), Sección 4 (Modelo DailyStats)
- [03-user-stories-flujos.md](./03-user-stories-flujos.md) → US-27 (Dashboard Profesora)

## ✅ Tareas

### 12.1 Crear DashboardModule

- `dashboard.module.ts`
- `dashboard.controller.ts`
- `dashboard.service.ts`

### 12.2 Implementar Endpoints

```
GET /api/admin/dashboard/stats       # Métricas generales
GET /api/admin/dashboard/sales       # Ventas por período
GET /api/admin/dashboard/users       # Stats de usuarios
GET /api/admin/dashboard/courses     # Stats por curso
GET /api/admin/dashboard/alerts      # Alertas pendientes
```

### 12.3 Métricas a calcular

- Total alumnos activos
- Ingresos del mes
- Órdenes completadas
- Carritos abandonados
- Usuarios por estado
- Ventas por curso

### 12.4 Cron para DailyStats

- Ejecutar cada medianoche
- Guardar snapshot diario

## 🎯 Checkpoint Fase 12

- [ ] Dashboard muestra métricas
- [ ] Filtro por período funciona
- [ ] Alertas de carritos abandonados
- [ ] DailyStats se genera automáticamente

---

# FASE 13: Testing y QA

**Duración estimada:** 3-4 días  
**Prioridad:** 🟢 IMPORTANTE

## ✅ Tareas

### 13.1 Tests Unitarios

- AuthService
- UsersService
- CoursesService
- CartService
- CheckoutService
- PaymentsService

### 13.2 Tests E2E

- Flujo de registro
- Flujo de login
- Flujo de compra completo
- Webhook de MercadoPago

### 13.3 Testing Manual

- Probar cada endpoint con Postman
- Verificar respuestas de error
- Verificar validaciones

## 🎯 Checkpoint Fase 13

- [ ] Coverage > 80%
- [ ] Tests E2E pasando
- [ ] Todos los endpoints probados
- [ ] Errores manejados correctamente

---

# FASE 14: Seguridad y Optimización

**Duración estimada:** 2-3 días  
**Prioridad:** 🟢 IMPORTANTE

## 📖 Documentación a consultar:

- [04-backend-ventas-especificacion.md](./04-backend-ventas-especificacion.md) → Sección 9 (Seguridad)

## ✅ Tareas

### 14.1 Seguridad

- [ ] Rate limiting configurado
- [ ] Helmet habilitado
- [ ] CORS configurado
- [ ] Validación de inputs en todos los DTOs
- [ ] Sanitización de datos
- [ ] Logs de actividad

### 14.2 Optimización

- [ ] Índices en base de datos
- [ ] Paginación en listados
- [ ] Cache en consultas frecuentes
- [ ] Queries optimizadas (include vs select)

### 14.3 Documentación API

- [ ] Swagger completo con ejemplos
- [ ] Todos los endpoints documentados
- [ ] Respuestas de error documentadas

## 🎯 Checkpoint Fase 14

- [ ] No vulnerabilidades conocidas
- [ ] API responde < 500ms
- [ ] Swagger completo

---

# FASE 15: Deploy y CI/CD

**Duración estimada:** 2-3 días  
**Prioridad:** 🟢 IMPORTANTE

## ✅ Tareas

### 15.1 Preparar para producción

- [ ] Variables de entorno de producción
- [ ] Dockerfile optimizado
- [ ] docker-compose.yml

### 15.2 CI/CD

- [ ] GitHub Actions para tests
- [ ] Deploy automático en push a main
- [ ] Migrations automáticas

### 15.3 Monitoreo

- [ ] Logs centralizados
- [ ] Alertas de errores
- [ ] Monitoreo de uptime

## 🎯 Checkpoint Fase 15

- [ ] App desplegada en producción
- [ ] CI/CD funcionando
- [ ] Monitoreo activo

---

## 📊 Resumen de Fases

| Fase | Nombre                | Duración | Prioridad | Estado |
| ---- | --------------------- | -------- | --------- | ------ |
| 1    | Configuración Inicial | 1-2 días | 🔴        | ⬜     |
| 2    | Base de Datos         | 1-2 días | 🔴        | ⬜     |
| 3    | Autenticación         | 3-4 días | 🔴        | ⬜     |
| 4    | Usuarios              | 2-3 días | 🔴        | ⬜     |
| 5    | Cursos                | 2-3 días | 🔴        | ⬜     |
| 6    | Carrito               | 1-2 días | 🔴        | ⬜     |
| 7    | Checkout/Pagos        | 4-5 días | 🔴        | ⬜     |
| 8    | Cupones               | 1-2 días | 🟡        | ⬜     |
| 9    | Mensajes              | 2-3 días | 🟡        | ⬜     |
| 10   | Configuración         | 1-2 días | 🟡        | ⬜     |
| 11   | Emails                | 2-3 días | 🟡        | ⬜     |
| 12   | Dashboard             | 2-3 días | 🟡        | ⬜     |
| 13   | Testing               | 3-4 días | 🟢        | ⬜     |
| 14   | Seguridad             | 2-3 días | 🟢        | ⬜     |
| 15   | Deploy                | 2-3 días | 🟢        | ⬜     |

**Total estimado: 30-45 días**

---

## 🔑 Leyenda

- 🔴 CRÍTICA - MVP, sin esto no funciona
- 🟡 MEDIA - Importante pero puede esperar
- 🟢 IMPORTANTE - Necesario antes de producción

- ⬜ Pendiente
- 🔄 En progreso
- ✅ Completado

---

_Plan de Acción - Sistema de Ventas de Cursos_
