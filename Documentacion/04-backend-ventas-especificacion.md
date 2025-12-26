# 🛒 Especificación Técnica - Backend Sistema de Ventas

## Plataforma de Cursos Personalizados

**Versión:** 1.0  
**Fecha:** 26 de Diciembre, 2025  
**Tipo:** Sistema Clonable Multi-Cliente

---

## 1. Visión General

### 1.1 Propósito

Backend para el **Sistema de Ventas de Cursos Online**. Este sistema es:

- **Clonable**: Se replica para cada nuevo cliente
- **Configurable**: Cada instancia tiene su propia configuración
- **Independiente**: No comparte datos con el Sistema LMS

### 1.2 Arquitectura por Cliente

```
┌─────────────────────────────────────────────────────────────────┐
│                       CLIENTE (Ej: María Victoria)              │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   ┌─────────────────────────────────────────────────────────┐  │
│   │              SISTEMA DE VENTAS                          │  │
│   │  ┌─────────────┐         ┌─────────────┐               │  │
│   │  │  Frontend   │◄───────►│   Backend   │               │  │
│   │  │  (Next.js)  │   API   │  (NestJS)   │               │  │
│   │  └─────────────┘         └──────┬──────┘               │  │
│   │                                 │                       │  │
│   │                          ┌──────▼──────┐               │  │
│   │                          │ PostgreSQL  │               │  │
│   │                          └─────────────┘               │  │
│   └─────────────────────────────────────────────────────────┘  │
│                                                                 │
│   ┌─────────────────────────────────────────────────────────┐  │
│   │              SISTEMA LMS (Separado)                     │  │
│   │              - Base de datos propia                     │  │
│   │              - Sin conexión directa                     │  │
│   └─────────────────────────────────────────────────────────┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. Stack Tecnológico

| Capa              | Tecnología             | Justificación                         |
| ----------------- | ---------------------- | ------------------------------------- |
| **Runtime**       | Node.js 20 LTS         | Estable, amplio soporte               |
| **Framework**     | NestJS 10              | Modular, escalable, TypeScript nativo |
| **Lenguaje**      | TypeScript             | Type-safety, mejor DX                 |
| **ORM**           | Prisma                 | Type-safe, migraciones fáciles        |
| **Base de Datos** | PostgreSQL             | Robusto, relacional                   |
| **Validación**    | class-validator        | Decoradores, DTOs tipados             |
| **Documentación** | Swagger/OpenAPI        | Auto-generada desde decoradores       |
| **Autenticación** | Passport + JWT         | Guards integrados, refresh tokens     |
| **OAuth**         | Passport Google        | Login social                          |
| **Pagos**         | MercadoPago            | Argentina, pesos                      |
| **Email**         | @nestjs-modules/mailer | Integración nativa con templates      |
| **Storage**       | Cloudflare R2 / S3     | Archivos, imágenes                    |
| **Cache**         | @nestjs/cache-manager  | Redis para cache y sesiones           |
| **Scheduler**     | @nestjs/schedule       | Cron jobs (cumpleaños, carritos)      |

---

## 3. Roles y Permisos

### 3.1 Definición de Roles

```typescript
enum UserRole {
  SUPER_ADMIN = "SUPER_ADMIN", // Equipo de desarrollo
  OWNER = "OWNER", // Cliente (profesora)
  STUDENT = "STUDENT", // Alumno
}
```

### 3.2 Matriz de Permisos

| Recurso               | SUPER_ADMIN | OWNER           | STUDENT      |
| --------------------- | ----------- | --------------- | ------------ |
| **Cursos**            | CRUD        | Ver             | Ver públicos |
| **Módulos/Lecciones** | CRUD        | Ver             | -            |
| **Usuarios/Alumnos**  | CRUD        | Ver, Exportar   | Ver propio   |
| **Pagos**             | Todo        | Ver             | Ver propios  |
| **CRM**               | Todo        | Ver, Filtrar    | -            |
| **Mensajes**          | Todo        | Leer, Responder | Enviar, Leer |
| **Configuración**     | Todo        | Toggles         | -            |
| **Métricas**          | Todo        | Ver             | -            |
| **Cupones**           | CRUD        | Ver             | Aplicar      |

---

## 4. Modelo de Datos (Prisma Schema)

### 4.1 Esquema Completo

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ==================== CONFIGURACIÓN DEL SISTEMA ====================

model SiteConfig {
  id                String   @id @default("main")

  // Información del sitio
  siteName          String   @default("Mi Academia")
  siteDescription   String?
  logo              String?
  favicon           String?

  // Colores del tema
  primaryColor      String   @default("#3B82F6")
  secondaryColor    String   @default("#1E40AF")

  // Información de contacto
  contactEmail      String?
  contactPhone      String?
  whatsappNumber    String?

  // Redes sociales
  instagramUrl      String?
  facebookUrl       String?
  youtubeUrl        String?

  // SEO
  metaTitle         String?
  metaDescription   String?

  // Configuración de emails
  emailFromName     String   @default("Mi Academia")
  emailFromAddress  String?

  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  @@map("site_config")
}

// Toggles de funcionalidades
model FeatureToggle {
  id          String   @id @default(cuid())
  key         String   @unique
  enabled     Boolean  @default(true)
  description String?

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@map("feature_toggles")
}

// ==================== USUARIOS ====================

enum UserRole {
  SUPER_ADMIN
  OWNER
  STUDENT
}

enum StudentStatus {
  REGISTERED      // Solo registrado
  IN_CART         // Tiene cursos en carrito
  PENDING_PAYMENT // Inició checkout pero no pagó
  PAID            // Pagó al menos un curso
  IN_PROGRESS     // Está cursando (en LMS)
  COMPLETED       // Completó al menos un curso
}

model User {
  id            String        @id @default(cuid())

  // Datos básicos (registro)
  firstName     String
  lastName      String
  email         String        @unique
  password      String?       // Null si usa OAuth

  // OAuth
  googleId      String?       @unique

  // Datos adicionales (checkout)
  dni           String?
  phone         String?
  birthDate     DateTime?

  // Sistema
  role          UserRole      @default(STUDENT)
  studentStatus StudentStatus @default(REGISTERED)
  isActive      Boolean       @default(true)
  emailVerified DateTime?

  // Relaciones
  cartItems     CartItem[]
  orders        Order[]
  payments      Payment[]
  messages      Message[]     @relation("SentMessages")
  receivedMsgs  Message[]     @relation("ReceivedMessages")

  // Timestamps
  createdAt     DateTime      @default(now())
  updatedAt     DateTime      @updatedAt
  lastLoginAt   DateTime?

  @@map("users")
}

// Tokens para refresh y reset password
model Token {
  id          String   @id @default(cuid())
  userId      String
  token       String   @unique
  type        String   // refresh, reset_password, email_verification
  expiresAt   DateTime
  createdAt   DateTime @default(now())

  @@map("tokens")
}

// ==================== CURSOS ====================

enum CourseStatus {
  DRAFT
  PUBLISHED
  ARCHIVED
}

model Course {
  id              String        @id @default(cuid())

  // Información básica
  slug            String        @unique
  title           String
  subtitle        String?
  description     String        @db.Text

  // Media
  thumbnail       String?
  previewVideoUrl String?

  // Precio
  price           Decimal       @db.Decimal(10, 2)
  discountPrice   Decimal?      @db.Decimal(10, 2)
  currency        String        @default("ARS")

  // Estado
  status          CourseStatus  @default(DRAFT)
  featured        Boolean       @default(false)
  order           Int           @default(0)

  // SEO
  metaTitle       String?
  metaDescription String?

  // Contenido para mostrar en ventas
  benefits        String[]      // Lo que aprenderás
  requirements    String[]      // Requisitos previos
  targetAudience  String[]      // Para quién es

  // Duración estimada
  totalDuration   String?       // Ej: "10 horas"
  totalLessons    Int           @default(0)
  totalModules    Int           @default(0)

  // Relaciones
  modules         Module[]
  faqs            CourseFaq[]
  reviews         Review[]
  cartItems       CartItem[]
  orderItems      OrderItem[]

  // Timestamps
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt
  publishedAt     DateTime?

  @@map("courses")
}

// Módulos del curso (solo para mostrar temario en ventas)
model Module {
  id          String   @id @default(cuid())
  courseId    String
  course      Course   @relation(fields: [courseId], references: [id], onDelete: Cascade)

  title       String
  description String?
  order       Int

  lessons     Lesson[]

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@map("modules")
}

// Lecciones (solo títulos para mostrar temario)
model Lesson {
  id          String   @id @default(cuid())
  moduleId    String
  module      Module   @relation(fields: [moduleId], references: [id], onDelete: Cascade)

  title       String
  duration    String?  // Ej: "15:30"
  isFree      Boolean  @default(false)  // Preview gratuito
  order       Int

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@map("lessons")
}

// FAQs del curso
model CourseFaq {
  id        String   @id @default(cuid())
  courseId  String
  course    Course   @relation(fields: [courseId], references: [id], onDelete: Cascade)

  question  String
  answer    String   @db.Text
  order     Int

  createdAt DateTime @default(now())

  @@map("course_faqs")
}

// Reseñas del curso
model Review {
  id        String   @id @default(cuid())
  courseId  String
  course    Course   @relation(fields: [courseId], references: [id], onDelete: Cascade)

  userName  String
  userImage String?
  rating    Int      // 1-5
  comment   String   @db.Text
  isVisible Boolean  @default(true)

  createdAt DateTime @default(now())

  @@map("reviews")
}

// ==================== CARRITO ====================

model CartItem {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  courseId  String
  course    Course   @relation(fields: [courseId], references: [id], onDelete: Cascade)

  addedAt   DateTime @default(now())

  @@unique([userId, courseId])
  @@map("cart_items")
}

// ==================== ÓRDENES Y PAGOS ====================

enum OrderStatus {
  PENDING         // Creada, esperando pago
  PROCESSING      // Pago en proceso
  PAID            // Pagada
  FAILED          // Pago fallido
  REFUNDED        // Reembolsada
  CANCELLED       // Cancelada
}

model Order {
  id              String        @id @default(cuid())
  orderNumber     String        @unique  // ORD-2025-00001

  userId          String
  user            User          @relation(fields: [userId], references: [id])

  // Totales
  subtotal        Decimal       @db.Decimal(10, 2)
  discount        Decimal       @default(0) @db.Decimal(10, 2)
  total           Decimal       @db.Decimal(10, 2)
  currency        String        @default("ARS")

  // Estado
  status          OrderStatus   @default(PENDING)

  // Cupón aplicado
  couponId        String?
  coupon          Coupon?       @relation(fields: [couponId], references: [id])
  couponCode      String?       // Guardamos el código por si se borra el cupón

  // Datos del comprador al momento de la compra
  buyerFirstName  String
  buyerLastName   String
  buyerEmail      String
  buyerDni        String
  buyerPhone      String

  // Items y pago
  items           OrderItem[]
  payment         Payment?

  // Timestamps
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt
  paidAt          DateTime?

  @@map("orders")
}

model OrderItem {
  id          String   @id @default(cuid())
  orderId     String
  order       Order    @relation(fields: [orderId], references: [id], onDelete: Cascade)
  courseId    String
  course      Course   @relation(fields: [courseId], references: [id])

  // Precio al momento de la compra
  price       Decimal  @db.Decimal(10, 2)
  courseTitle String   // Guardamos por si cambia el título

  createdAt   DateTime @default(now())

  @@map("order_items")
}

enum PaymentStatus {
  PENDING
  APPROVED
  REJECTED
  IN_PROCESS
  REFUNDED
  CANCELLED
}

model Payment {
  id                  String        @id @default(cuid())
  orderId             String        @unique
  order               Order         @relation(fields: [orderId], references: [id])
  userId              String
  user                User          @relation(fields: [userId], references: [id])

  // MercadoPago
  provider            String        @default("mercadopago")
  externalId          String?       // payment_id de MP
  externalReference   String?       // preference_id de MP

  // Montos
  amount              Decimal       @db.Decimal(10, 2)
  currency            String        @default("ARS")

  // Estado
  status              PaymentStatus @default(PENDING)
  statusDetail        String?       // Detalle del estado de MP

  // Info del pago
  paymentMethod       String?       // credit_card, debit_card, etc.
  paymentType         String?       // visa, mastercard, etc.
  installments        Int?          // Cuotas

  // Timestamps
  createdAt           DateTime      @default(now())
  updatedAt           DateTime      @updatedAt
  approvedAt          DateTime?

  @@map("payments")
}

// ==================== CUPONES ====================

enum DiscountType {
  PERCENTAGE
  FIXED
}

model Coupon {
  id            String       @id @default(cuid())
  code          String       @unique
  description   String?

  // Descuento
  discountType  DiscountType
  discountValue Decimal      @db.Decimal(10, 2)

  // Límites
  maxUses       Int?         // Null = ilimitado
  usedCount     Int          @default(0)
  maxUsesPerUser Int         @default(1)
  minPurchase   Decimal?     @db.Decimal(10, 2)  // Mínimo de compra

  // Validez
  validFrom     DateTime     @default(now())
  validUntil    DateTime?
  isActive      Boolean      @default(true)

  // Relaciones
  orders        Order[]

  createdAt     DateTime     @default(now())
  updatedAt     DateTime     @updatedAt

  @@map("coupons")
}

// ==================== MENSAJERÍA ====================

enum MessageStatus {
  UNREAD
  READ
  REPLIED
  ARCHIVED
}

model Message {
  id          String        @id @default(cuid())

  senderId    String
  sender      User          @relation("SentMessages", fields: [senderId], references: [id], onDelete: Cascade)
  receiverId  String
  receiver    User          @relation("ReceivedMessages", fields: [receiverId], references: [id], onDelete: Cascade)

  subject     String?
  content     String        @db.Text
  status      MessageStatus @default(UNREAD)

  // Para hilos de conversación
  parentId    String?
  parent      Message?      @relation("MessageReplies", fields: [parentId], references: [id])
  replies     Message[]     @relation("MessageReplies")

  createdAt   DateTime      @default(now())
  readAt      DateTime?

  @@map("messages")
}

// ==================== EMAILS PROGRAMADOS ====================

enum EmailType {
  BIRTHDAY
  CART_ABANDONED
  PAYMENT_CONFIRMATION
  WELCOME
  CUSTOM
}

enum EmailStatus {
  PENDING
  SENT
  FAILED
}

model ScheduledEmail {
  id          String      @id @default(cuid())

  userId      String?     // Null si es para todos
  email       String      // Email destino

  type        EmailType
  subject     String
  content     String      @db.Text

  status      EmailStatus @default(PENDING)
  scheduledAt DateTime    // Cuándo enviar
  sentAt      DateTime?
  error       String?

  createdAt   DateTime    @default(now())

  @@map("scheduled_emails")
}

// ==================== MÉTRICAS / ANALYTICS ====================

model DailyStats {
  id              String   @id @default(cuid())
  date            DateTime @unique @db.Date

  // Usuarios
  newUsers        Int      @default(0)
  totalUsers      Int      @default(0)

  // Carritos
  cartsCreated    Int      @default(0)
  cartsAbandoned  Int      @default(0)

  // Ventas
  ordersCreated   Int      @default(0)
  ordersPaid      Int      @default(0)
  revenue         Decimal  @default(0) @db.Decimal(10, 2)

  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@map("daily_stats")
}

// ==================== LOGS DE ACTIVIDAD ====================

model ActivityLog {
  id          String   @id @default(cuid())
  userId      String?
  action      String   // user.registered, order.created, payment.approved, etc.
  entity      String?  // user, order, payment, course
  entityId    String?
  metadata    Json?    // Datos adicionales
  ipAddress   String?
  userAgent   String?

  createdAt   DateTime @default(now())

  @@map("activity_logs")
}
```

---

## 5. API Endpoints

### 5.1 Autenticación (`/api/auth`)

```
POST   /api/auth/register           # Registro con email
POST   /api/auth/login              # Login con email
POST   /api/auth/google             # OAuth con Google
POST   /api/auth/refresh            # Refresh token
POST   /api/auth/logout             # Cerrar sesión
POST   /api/auth/forgot-password    # Solicitar reset
POST   /api/auth/reset-password     # Resetear contraseña
POST   /api/auth/verify-email       # Verificar email
GET    /api/auth/me                 # Usuario actual
```

### 5.2 Usuarios (`/api/users`)

```
# Alumno
GET    /api/users/profile           # Mi perfil
PUT    /api/users/profile           # Actualizar perfil
PUT    /api/users/complete-profile  # Completar datos (DNI, tel, fecha nac)

# Admin/Owner
GET    /api/admin/users             # Lista de usuarios (CRM)
GET    /api/admin/users/:id         # Detalle de usuario
GET    /api/admin/users/export      # Exportar a Excel
GET    /api/admin/users/stats       # Estadísticas de usuarios
PUT    /api/admin/users/:id/status  # Cambiar estado (solo SUPER_ADMIN)
```

### 5.3 Cursos (`/api/courses`)

```
# Público
GET    /api/courses                 # Lista de cursos publicados
GET    /api/courses/:slug           # Detalle de curso
GET    /api/courses/:slug/reviews   # Reviews del curso
GET    /api/courses/:slug/faqs      # FAQs del curso

# Admin (SUPER_ADMIN)
POST   /api/admin/courses           # Crear curso
PUT    /api/admin/courses/:id       # Actualizar curso
DELETE /api/admin/courses/:id       # Eliminar curso
PUT    /api/admin/courses/:id/publish    # Publicar
PUT    /api/admin/courses/:id/unpublish  # Despublicar

# Módulos (SUPER_ADMIN)
POST   /api/admin/courses/:id/modules    # Crear módulo
PUT    /api/admin/modules/:id            # Actualizar módulo
DELETE /api/admin/modules/:id            # Eliminar módulo
PUT    /api/admin/modules/reorder        # Reordenar módulos

# Lecciones (SUPER_ADMIN)
POST   /api/admin/modules/:id/lessons    # Crear lección
PUT    /api/admin/lessons/:id            # Actualizar lección
DELETE /api/admin/lessons/:id            # Eliminar lección

# FAQs (SUPER_ADMIN)
POST   /api/admin/courses/:id/faqs       # Crear FAQ
PUT    /api/admin/faqs/:id               # Actualizar FAQ
DELETE /api/admin/faqs/:id               # Eliminar FAQ

# Reviews (SUPER_ADMIN)
POST   /api/admin/courses/:id/reviews    # Crear review
PUT    /api/admin/reviews/:id            # Actualizar review
DELETE /api/admin/reviews/:id            # Eliminar review
```

### 5.4 Carrito (`/api/cart`)

```
GET    /api/cart                    # Mi carrito
POST   /api/cart                    # Agregar curso al carrito
DELETE /api/cart/:courseId          # Quitar curso del carrito
DELETE /api/cart                    # Vaciar carrito
POST   /api/cart/apply-coupon       # Aplicar cupón
DELETE /api/cart/remove-coupon      # Quitar cupón
```

### 5.5 Checkout y Pagos (`/api/checkout`, `/api/payments`)

```
# Checkout
POST   /api/checkout/validate       # Validar datos antes de pagar
POST   /api/checkout/create         # Crear orden e iniciar pago

# Pagos
GET    /api/payments/history        # Mi historial de pagos
GET    /api/payments/:id            # Detalle de un pago

# Webhook (MercadoPago)
POST   /api/payments/webhook/mercadopago  # Webhook de MP

# Admin
GET    /api/admin/payments          # Todos los pagos
GET    /api/admin/payments/:id      # Detalle de pago
GET    /api/admin/payments/stats    # Estadísticas de pagos
```

### 5.6 Órdenes (`/api/orders`)

```
GET    /api/orders                  # Mis órdenes
GET    /api/orders/:id              # Detalle de orden

# Admin
GET    /api/admin/orders            # Todas las órdenes
GET    /api/admin/orders/:id        # Detalle de orden
PUT    /api/admin/orders/:id/status # Cambiar estado (refund, etc.)
```

### 5.7 Cupones (`/api/coupons`)

```
POST   /api/coupons/validate        # Validar cupón (público)

# Admin (SUPER_ADMIN)
GET    /api/admin/coupons           # Lista de cupones
POST   /api/admin/coupons           # Crear cupón
PUT    /api/admin/coupons/:id       # Actualizar cupón
DELETE /api/admin/coupons/:id       # Eliminar cupón
```

### 5.8 Mensajes (`/api/messages`)

```
# Alumno
GET    /api/messages                # Mis mensajes
GET    /api/messages/:id            # Ver mensaje
POST   /api/messages                # Enviar mensaje al OWNER
PUT    /api/messages/:id/read       # Marcar como leído

# Admin/Owner
GET    /api/admin/messages          # Todos los mensajes
GET    /api/admin/messages/:id      # Ver mensaje
POST   /api/admin/messages/:id/reply  # Responder mensaje
PUT    /api/admin/messages/:id/archive # Archivar
```

### 5.9 Configuración (`/api/config`)

```
# Público
GET    /api/config/site             # Configuración pública del sitio

# Admin
GET    /api/admin/config            # Toda la configuración
PUT    /api/admin/config/site       # Actualizar config del sitio (SUPER_ADMIN)
GET    /api/admin/config/toggles    # Lista de feature toggles
PUT    /api/admin/config/toggles/:key  # Activar/desactivar feature (OWNER)
```

### 5.10 Dashboard y Métricas (`/api/dashboard`)

```
# Admin/Owner
GET    /api/admin/dashboard/stats       # Métricas generales
GET    /api/admin/dashboard/sales       # Ventas por período
GET    /api/admin/dashboard/users       # Estadísticas de usuarios
GET    /api/admin/dashboard/courses     # Estadísticas por curso
GET    /api/admin/dashboard/alerts      # Alertas (carritos abandonados, etc.)
```

---

## 6. Estructura del Proyecto (NestJS)

```
backend/
├── src/
│   ├── main.ts                          # Entry point
│   ├── app.module.ts                    # Root module
│   │
│   ├── config/                          # Configuración
│   │   ├── config.module.ts
│   │   ├── configuration.ts             # Variables de entorno tipadas
│   │   ├── database.config.ts
│   │   └── validation.schema.ts         # Validación de env con Joi
│   │
│   ├── prisma/                          # Prisma Service
│   │   ├── prisma.module.ts
│   │   ├── prisma.service.ts
│   │   └── schema.prisma
│   │
│   ├── modules/
│   │   │
│   │   ├── auth/                        # Autenticación
│   │   │   ├── auth.module.ts
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── strategies/
│   │   │   │   ├── jwt.strategy.ts
│   │   │   │   ├── jwt-refresh.strategy.ts
│   │   │   │   └── google.strategy.ts
│   │   │   ├── guards/
│   │   │   │   ├── jwt-auth.guard.ts
│   │   │   │   ├── jwt-refresh.guard.ts
│   │   │   │   ├── google-auth.guard.ts
│   │   │   │   └── roles.guard.ts
│   │   │   ├── decorators/
│   │   │   │   ├── current-user.decorator.ts
│   │   │   │   ├── roles.decorator.ts
│   │   │   │   └── public.decorator.ts
│   │   │   └── dto/
│   │   │       ├── register.dto.ts
│   │   │       ├── login.dto.ts
│   │   │       ├── refresh-token.dto.ts
│   │   │       └── reset-password.dto.ts
│   │   │
│   │   ├── users/                       # Usuarios
│   │   │   ├── users.module.ts
│   │   │   ├── users.controller.ts
│   │   │   ├── users.service.ts
│   │   │   ├── dto/
│   │   │   │   ├── update-profile.dto.ts
│   │   │   │   ├── complete-profile.dto.ts
│   │   │   │   └── user-filter.dto.ts
│   │   │   └── entities/
│   │   │       └── user.entity.ts
│   │   │
│   │   ├── courses/                     # Cursos
│   │   │   ├── courses.module.ts
│   │   │   ├── courses.controller.ts
│   │   │   ├── courses.service.ts
│   │   │   ├── admin-courses.controller.ts
│   │   │   ├── dto/
│   │   │   │   ├── create-course.dto.ts
│   │   │   │   ├── update-course.dto.ts
│   │   │   │   └── course-filter.dto.ts
│   │   │   └── entities/
│   │   │       └── course.entity.ts
│   │   │
│   │   ├── cart/                        # Carrito
│   │   │   ├── cart.module.ts
│   │   │   ├── cart.controller.ts
│   │   │   ├── cart.service.ts
│   │   │   └── dto/
│   │   │       ├── add-to-cart.dto.ts
│   │   │       └── apply-coupon.dto.ts
│   │   │
│   │   ├── checkout/                    # Checkout
│   │   │   ├── checkout.module.ts
│   │   │   ├── checkout.controller.ts
│   │   │   ├── checkout.service.ts
│   │   │   └── dto/
│   │   │       └── checkout.dto.ts
│   │   │
│   │   ├── payments/                    # Pagos
│   │   │   ├── payments.module.ts
│   │   │   ├── payments.controller.ts
│   │   │   ├── payments.service.ts
│   │   │   ├── webhooks.controller.ts
│   │   │   └── providers/
│   │   │       └── mercadopago.provider.ts
│   │   │
│   │   ├── orders/                      # Órdenes
│   │   │   ├── orders.module.ts
│   │   │   ├── orders.controller.ts
│   │   │   ├── orders.service.ts
│   │   │   └── dto/
│   │   │       └── order-filter.dto.ts
│   │   │
│   │   ├── coupons/                     # Cupones
│   │   │   ├── coupons.module.ts
│   │   │   ├── coupons.controller.ts
│   │   │   ├── coupons.service.ts
│   │   │   └── dto/
│   │   │       ├── create-coupon.dto.ts
│   │   │       └── validate-coupon.dto.ts
│   │   │
│   │   ├── messages/                    # Mensajes
│   │   │   ├── messages.module.ts
│   │   │   ├── messages.controller.ts
│   │   │   ├── messages.service.ts
│   │   │   └── dto/
│   │   │       ├── create-message.dto.ts
│   │   │       └── reply-message.dto.ts
│   │   │
│   │   ├── site-config/                 # Configuración del sitio
│   │   │   ├── site-config.module.ts
│   │   │   ├── site-config.controller.ts
│   │   │   ├── site-config.service.ts
│   │   │   └── dto/
│   │   │       └── update-config.dto.ts
│   │   │
│   │   ├── dashboard/                   # Dashboard y métricas
│   │   │   ├── dashboard.module.ts
│   │   │   ├── dashboard.controller.ts
│   │   │   └── dashboard.service.ts
│   │   │
│   │   └── emails/                      # Emails
│   │       ├── emails.module.ts
│   │       ├── emails.service.ts
│   │       ├── emails.processor.ts      # Queue processor
│   │       ├── schedulers/
│   │       │   ├── birthday.scheduler.ts
│   │       │   └── cart-abandoned.scheduler.ts
│   │       └── templates/
│   │           ├── welcome.hbs
│   │           ├── payment-confirmation.hbs
│   │           ├── birthday.hbs
│   │           └── cart-abandoned.hbs
│   │
│   ├── common/                          # Compartido
│   │   ├── filters/
│   │   │   ├── http-exception.filter.ts
│   │   │   └── prisma-exception.filter.ts
│   │   ├── interceptors/
│   │   │   ├── transform.interceptor.ts
│   │   │   └── logging.interceptor.ts
│   │   ├── pipes/
│   │   │   └── validation.pipe.ts
│   │   ├── decorators/
│   │   │   └── api-paginated-response.decorator.ts
│   │   └── utils/
│   │       ├── pagination.util.ts
│   │       ├── hash.util.ts
│   │       └── order-number.util.ts
│   │
│   └── types/
│       └── index.ts
│
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts
│
├── test/
│   ├── app.e2e-spec.ts
│   ├── auth.e2e-spec.ts
│   └── jest-e2e.json
│
├── .env.example
├── .gitignore
├── .eslintrc.js
├── .prettierrc
├── nest-cli.json
├── package.json
├── tsconfig.json
├── tsconfig.build.json
├── Dockerfile
└── README.md
```

### 6.1 Ejemplo de Módulo (Auth)

```typescript
// src/modules/auth/auth.module.ts
import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { JwtStrategy } from "./strategies/jwt.strategy";
import { JwtRefreshStrategy } from "./strategies/jwt-refresh.strategy";
import { GoogleStrategy } from "./strategies/google.strategy";
import { UsersModule } from "../users/users.module";

@Module({
  imports: [
    UsersModule,
    PassportModule,
    JwtModule.registerAsync({
      useFactory: () => ({
        secret: process.env.JWT_SECRET,
        signOptions: { expiresIn: "15m" },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, JwtRefreshStrategy, GoogleStrategy],
  exports: [AuthService],
})
export class AuthModule {}
```

### 6.2 Ejemplo de Controller

```typescript
// src/modules/auth/auth.controller.ts
import { Controller, Post, Body, UseGuards, Get, Req } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import { AuthService } from "./auth.service";
import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";
import { Public } from "./decorators/public.decorator";
import { JwtRefreshGuard } from "./guards/jwt-refresh.guard";
import { GoogleAuthGuard } from "./guards/google-auth.guard";
import { CurrentUser } from "./decorators/current-user.decorator";

@ApiTags("Auth")
@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post("register")
  @ApiOperation({ summary: "Registro de usuario" })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Public()
  @Post("login")
  @ApiOperation({ summary: "Login con email y contraseña" })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Public()
  @UseGuards(JwtRefreshGuard)
  @Post("refresh")
  @ApiOperation({ summary: "Refrescar access token" })
  async refresh(@CurrentUser() user: any) {
    return this.authService.refreshTokens(user);
  }

  @Public()
  @Get("google")
  @UseGuards(GoogleAuthGuard)
  @ApiOperation({ summary: "Login con Google" })
  async googleAuth() {}

  @Public()
  @Get("google/callback")
  @UseGuards(GoogleAuthGuard)
  async googleCallback(@Req() req) {
    return this.authService.googleLogin(req.user);
  }

  @Get("me")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Obtener usuario actual" })
  async me(@CurrentUser() user: any) {
    return user;
  }
}
```

### 6.3 Ejemplo de DTO con Validación

```typescript
// src/modules/auth/dto/register.dto.ts
import { ApiProperty } from "@nestjs/swagger";
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  Matches,
} from "class-validator";

export class RegisterDto {
  @ApiProperty({ example: "Juan" })
  @IsNotEmpty({ message: "El nombre es requerido" })
  @IsString()
  firstName: string;

  @ApiProperty({ example: "Pérez" })
  @IsNotEmpty({ message: "El apellido es requerido" })
  @IsString()
  lastName: string;

  @ApiProperty({ example: "juan@email.com" })
  @IsEmail({}, { message: "Email inválido" })
  email: string;

  @ApiProperty({ example: "Password123!" })
  @IsNotEmpty({ message: "La contraseña es requerida" })
  @MinLength(8, { message: "Mínimo 8 caracteres" })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message: "Debe contener mayúscula, minúscula y número",
  })
  password: string;
}
```

### 6.4 Ejemplo de Guard de Roles

```typescript
// src/modules/auth/guards/roles.guard.ts
import { Injectable, CanActivate, ExecutionContext } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { UserRole } from "@prisma/client";
import { ROLES_KEY } from "../decorators/roles.decorator";

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()]
    );

    if (!requiredRoles) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    return requiredRoles.some((role) => user.role === role);
  }
}
```

---

## 7. Variables de Entorno

```env
# .env.example

# App
NODE_ENV=development
PORT=3000
API_URL=http://localhost:3000
FRONTEND_URL=http://localhost:3001

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/academia_ventas

# JWT
JWT_SECRET=your-super-secret-key-change-in-production
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=your-refresh-secret-key
JWT_REFRESH_EXPIRES_IN=7d

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:3000/api/auth/google/callback

# MercadoPago
MERCADOPAGO_ACCESS_TOKEN=your-mercadopago-access-token
MERCADOPAGO_PUBLIC_KEY=your-mercadopago-public-key
MERCADOPAGO_WEBHOOK_SECRET=your-webhook-secret

# Email
EMAIL_HOST=smtp.resend.com
EMAIL_PORT=465
EMAIL_USER=resend
EMAIL_PASSWORD=your-resend-api-key
EMAIL_FROM=noreply@tudominio.com

# Storage (Cloudflare R2 o S3)
STORAGE_ACCESS_KEY=your-access-key
STORAGE_SECRET_KEY=your-secret-key
STORAGE_BUCKET=your-bucket-name
STORAGE_ENDPOINT=https://your-endpoint.r2.cloudflarestorage.com
STORAGE_PUBLIC_URL=https://your-public-url.com

# Redis (opcional)
REDIS_URL=redis://localhost:6379
```

---

## 8. Flujos Principales

### 8.1 Flujo de Registro

```
┌─────────────────────────────────────────────────────────────────┐
│                     FLUJO DE REGISTRO                           │
└─────────────────────────────────────────────────────────────────┘

                    ┌─────────────┐
                    │   Usuario   │
                    │   ingresa   │
                    └──────┬──────┘
                           │
              ┌────────────┴────────────┐
              │                         │
              ▼                         ▼
     ┌─────────────────┐      ┌─────────────────┐
     │  Registro con   │      │  Registro con   │
     │     Email       │      │     Google      │
     └────────┬────────┘      └────────┬────────┘
              │                        │
              ▼                        ▼
     ┌─────────────────┐      ┌─────────────────┐
     │ • Nombre        │      │ OAuth Google    │
     │ • Apellido      │      │ ───────────►    │
     │ • Email         │      │ Extrae datos    │
     │ • Password      │      └────────┬────────┘
     └────────┬────────┘               │
              │                        │
              └───────────┬────────────┘
                          │
                          ▼
                 ┌─────────────────┐
                 │  Crear Usuario  │
                 │  rol: STUDENT   │
                 │  status: REGISTERED
                 └────────┬────────┘
                          │
                          ▼
                 ┌─────────────────┐
                 │ Email de        │
                 │ bienvenida      │
                 └────────┬────────┘
                          │
                          ▼
                 ┌─────────────────┐
                 │ Redirect a      │
                 │ catálogo/home   │
                 └─────────────────┘
```

### 8.2 Flujo de Compra

```
┌─────────────────────────────────────────────────────────────────┐
│                     FLUJO DE COMPRA                             │
└─────────────────────────────────────────────────────────────────┘

   ┌─────────────┐
   │  Ver curso  │
   └──────┬──────┘
          │
          ▼
   ┌─────────────────┐     ┌─────────────────┐
   │ Agregar al      │────►│ Actualizar      │
   │ carrito         │     │ status: IN_CART │
   └────────┬────────┘     └─────────────────┘
            │
            ▼
   ┌─────────────────┐
   │ Ver carrito     │
   │ (aplicar cupón) │
   └────────┬────────┘
            │
            ▼
   ┌─────────────────┐
   │ Ir a Checkout   │
   └────────┬────────┘
            │
            ▼
   ┌─────────────────────────────────────────┐
   │          COMPLETAR DATOS                │
   │  ┌─────────────────────────────────┐   │
   │  │ DNI: _______________            │   │
   │  │ Teléfono: __________            │   │
   │  │ Fecha Nac: _________            │   │
   │  └─────────────────────────────────┘   │
   └────────────────┬───────────────────────┘
                    │
                    ▼
           ┌─────────────────┐
           │ Validar datos   │
           │ Crear Order     │
           │ status: PENDING │
           └────────┬────────┘
                    │
                    ▼
           ┌─────────────────┐
           │ Redirect a      │
           │ MercadoPago     │
           └────────┬────────┘
                    │
       ┌────────────┴────────────┐
       │                         │
       ▼                         ▼
┌─────────────┐           ┌─────────────┐
│ Pago OK ✅  │           │ Pago Fail ❌│
└──────┬──────┘           └──────┬──────┘
       │                         │
       ▼                         ▼
┌─────────────────┐       ┌─────────────────┐
│ Webhook MP      │       │ Mostrar error   │
│ status: PAID    │       │ Reintentar      │
└────────┬────────┘       └─────────────────┘
         │
         ▼
┌─────────────────┐
│ User status:    │
│ PAID            │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Vaciar carrito  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Email de        │
│ confirmación    │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│ USTEDES: Crear usuario manualmente      │
│ en el Sistema LMS con los datos         │
└─────────────────────────────────────────┘
```

### 8.3 Flujo de Email de Cumpleaños

```
┌─────────────────────────────────────────────────────────────────┐
│                 FLUJO EMAIL CUMPLEAÑOS                          │
└─────────────────────────────────────────────────────────────────┘

   ┌─────────────────────────────────────────┐
   │          CRON JOB (Diario 8:00 AM)      │
   └────────────────────┬────────────────────┘
                        │
                        ▼
   ┌─────────────────────────────────────────┐
   │  ¿Feature toggle 'birthday_email'       │
   │   está activado?                        │
   └────────────────────┬────────────────────┘
                        │
             ┌──────────┴──────────┐
             │ NO                  │ SI
             ▼                     ▼
        ┌─────────┐    ┌─────────────────────────┐
        │  Skip   │    │ Buscar usuarios con     │
        └─────────┘    │ birthDate = HOY         │
                       └────────────┬────────────┘
                                    │
                                    ▼
                       ┌─────────────────────────┐
                       │ Por cada usuario:       │
                       │ Enviar email de         │
                       │ feliz cumpleaños        │
                       └─────────────────────────┘
```

---

## 9. Seguridad

### 9.1 Autenticación

- **JWT Access Token**: Expira en 15 minutos
- **JWT Refresh Token**: Expira en 7 días, almacenado en httpOnly cookie
- **Password Hashing**: bcrypt con salt rounds = 12
- **Rate Limiting**:
  - Login: 5 intentos / 15 minutos
  - Registro: 3 / hora por IP
  - API general: 100 req/min

### 9.2 Validaciones

```typescript
// Ejemplo de validación con Zod
const registerSchema = z.object({
  firstName: z.string().min(2).max(50),
  lastName: z.string().min(2).max(50),
  email: z.string().email(),
  password: z
    .string()
    .min(8)
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/),
});

const checkoutSchema = z.object({
  dni: z.string().regex(/^\d{7,8}$/),
  phone: z.string().regex(/^\+?[\d\s-]{10,15}$/),
  birthDate: z.string().datetime(),
});
```

### 9.3 Protecciones

- **CORS**: Solo dominios permitidos
- **Helmet**: Headers de seguridad
- **XSS**: Sanitización de inputs
- **SQL Injection**: Prisma con prepared statements
- **CSRF**: Token en formularios sensibles

---

## 10. Feature Toggles (Configurables por OWNER)

| Key                    | Descripción                        | Default   |
| ---------------------- | ---------------------------------- | --------- |
| `birthday_email`       | Enviar email de cumpleaños         | ✅ Activo |
| `cart_abandoned_email` | Email de carrito abandonado        | ✅ Activo |
| `welcome_email`        | Email de bienvenida al registrarse | ✅ Activo |
| `reviews_visible`      | Mostrar reseñas en cursos          | ✅ Activo |
| `coupons_enabled`      | Permitir uso de cupones            | ✅ Activo |

---

## 11. Emails del Sistema

| Tipo                     | Trigger                | Template                |
| ------------------------ | ---------------------- | ----------------------- |
| **Bienvenida**           | Registro exitoso       | welcome.ts              |
| **Verificación**         | Registro con email     | verify-email.ts         |
| **Reset Password**       | Solicitud de reset     | reset-password.ts       |
| **Confirmación de Pago** | Pago aprobado          | payment-confirmation.ts |
| **Cumpleaños**           | Cron diario            | birthday.ts             |
| **Carrito Abandonado**   | Cron (24h sin comprar) | cart-abandoned.ts       |

---

## 12. Próximos Pasos

1. ✅ Documentación completada
2. ⏳ Inicializar proyecto Node.js + TypeScript
3. ⏳ Configurar Prisma y crear migraciones
4. ⏳ Implementar módulo de Auth
5. ⏳ Implementar módulo de Courses
6. ⏳ Implementar módulo de Cart
7. ⏳ Implementar módulo de Checkout/Payments
8. ⏳ Implementar módulo de Messages
9. ⏳ Implementar Dashboard/Métricas
10. ⏳ Configurar emails
11. ⏳ Testing
12. ⏳ Deploy

---

_Documento generado para Sistema de Ventas de Cursos - Versión Clonable_
