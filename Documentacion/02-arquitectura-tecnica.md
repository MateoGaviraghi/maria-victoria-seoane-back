# 🏗️ Documento de Arquitectura Técnica

## Plataforma de Cursos Personalizados - Academia Épica

**Versión:** 1.0  
**Fecha:** 26 de Diciembre, 2025  
**Autor:** Academia Épica

---

## 1. Visión General de Arquitectura

### 1.1 Diagrama de Alto Nivel

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              ARQUITECTURA GENERAL                            │
└─────────────────────────────────────────────────────────────────────────────┘

                                    USUARIOS
                    ┌───────────────────┼───────────────────┐
                    │                   │                   │
                    ▼                   ▼                   ▼
            ┌──────────────┐   ┌──────────────┐   ┌──────────────┐
            │   Visitante  │   │    Alumno    │   │  Profesora   │
            └──────┬───────┘   └──────┬───────┘   └──────┬───────┘
                   │                  │                   │
                   └──────────────────┼───────────────────┘
                                      │
                              ┌───────▼───────┐
                              │   CLOUDFLARE  │
                              │   (CDN/WAF)   │
                              └───────┬───────┘
                                      │
        ┌─────────────────────────────┼─────────────────────────────┐
        │                             │                             │
        ▼                             ▼                             ▼
┌───────────────┐           ┌─────────────────┐           ┌─────────────────┐
│  WEB VENTA    │           │   PLATAFORMA    │           │    BACKEND      │
│  (Next.js)    │           │   (Next.js)     │           │   (Node.js)     │
│               │           │                 │           │                 │
│  - Landing    │           │  - App Alumno   │           │  - REST API     │
│  - Catálogo   │           │  - App Profesora│           │  - Auth         │
│  - Checkout   │           │  - Dashboard    │           │  - Business     │
└───────┬───────┘           └────────┬────────┘           └────────┬────────┘
        │                            │                             │
        └────────────────────────────┼─────────────────────────────┘
                                     │
                            ┌────────▼────────┐
                            │   PostgreSQL    │
                            │   (Neon/Supabase)│
                            └────────┬────────┘
                                     │
        ┌────────────────────────────┼────────────────────────────┐
        │                            │                            │
        ▼                            ▼                            ▼
┌───────────────┐          ┌─────────────────┐          ┌─────────────────┐
│    Redis      │          │   Bunny.net     │          │    Resend       │
│   (Cache)     │          │   (Videos CDN)  │          │   (Emails)      │
└───────────────┘          └─────────────────┘          └─────────────────┘
```

### 1.2 Stack Tecnológico Recomendado

| Capa                    | Tecnología                                   | Justificación                    |
| ----------------------- | -------------------------------------------- | -------------------------------- |
| **Frontend Web Venta**  | Next.js 14 + TypeScript                      | SSR para SEO, React ecosystem    |
| **Frontend Plataforma** | Next.js 14 + TypeScript                      | App Router, Server Components    |
| **UI Components**       | Tailwind CSS + shadcn/ui                     | Rápido desarrollo, customizable  |
| **Backend API**         | Node.js + Express/Fastify                    | O alternativamente NestJS        |
| **ORM**                 | Prisma                                       | Type-safe, migrations, fácil uso |
| **Base de Datos**       | PostgreSQL (Neon/Supabase)                   | Robusto, escalable, serverless   |
| **Cache**               | Redis (Upstash)                              | Sesiones, cache de consultas     |
| **Autenticación**       | NextAuth.js / Auth.js                        | JWT + OAuth providers            |
| **Video Hosting**       | Bunny.net / Cloudflare Stream                | CDN optimizado para video        |
| **Storage**             | Cloudflare R2 / AWS S3                       | Archivos, PDFs, imágenes         |
| **Email**               | Resend                                       | API moderna, fácil integración   |
| **Pagos**               | MercadoPago / Stripe                         | Según región                     |
| **Deploy**              | Vercel (Frontend) + Railway/Render (Backend) | Fácil CI/CD                      |

---

## 2. Arquitectura del Backend

### 2.1 Estructura de Carpetas (Backend)

```
backend/
├── src/
│   ├── config/
│   │   ├── database.ts
│   │   ├── redis.ts
│   │   ├── email.ts
│   │   └── storage.ts
│   │
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── auth.routes.ts
│   │   │   ├── strategies/
│   │   │   │   ├── jwt.strategy.ts
│   │   │   │   └── google.strategy.ts
│   │   │   └── dto/
│   │   │       ├── login.dto.ts
│   │   │       └── register.dto.ts
│   │   │
│   │   ├── users/
│   │   │   ├── users.controller.ts
│   │   │   ├── users.service.ts
│   │   │   ├── users.routes.ts
│   │   │   └── dto/
│   │   │
│   │   ├── courses/
│   │   │   ├── courses.controller.ts
│   │   │   ├── courses.service.ts
│   │   │   ├── courses.routes.ts
│   │   │   └── dto/
│   │   │
│   │   ├── modules/
│   │   │   ├── modules.controller.ts
│   │   │   ├── modules.service.ts
│   │   │   └── modules.routes.ts
│   │   │
│   │   ├── lessons/
│   │   │   ├── lessons.controller.ts
│   │   │   ├── lessons.service.ts
│   │   │   └── lessons.routes.ts
│   │   │
│   │   ├── enrollments/
│   │   │   ├── enrollments.controller.ts
│   │   │   ├── enrollments.service.ts
│   │   │   └── enrollments.routes.ts
│   │   │
│   │   ├── progress/
│   │   │   ├── progress.controller.ts
│   │   │   ├── progress.service.ts
│   │   │   └── progress.routes.ts
│   │   │
│   │   ├── exams/
│   │   │   ├── exams.controller.ts
│   │   │   ├── exams.service.ts
│   │   │   └── exams.routes.ts
│   │   │
│   │   ├── certificates/
│   │   │   ├── certificates.controller.ts
│   │   │   ├── certificates.service.ts
│   │   │   └── templates/
│   │   │
│   │   ├── payments/
│   │   │   ├── payments.controller.ts
│   │   │   ├── payments.service.ts
│   │   │   ├── webhooks.controller.ts
│   │   │   └── providers/
│   │   │       ├── mercadopago.provider.ts
│   │   │       └── stripe.provider.ts
│   │   │
│   │   ├── cart/
│   │   │   ├── cart.controller.ts
│   │   │   └── cart.service.ts
│   │   │
│   │   ├── messages/
│   │   │   ├── messages.controller.ts
│   │   │   ├── messages.service.ts
│   │   │   └── messages.gateway.ts (WebSocket)
│   │   │
│   │   ├── tickets/
│   │   │   ├── tickets.controller.ts
│   │   │   └── tickets.service.ts
│   │   │
│   │   ├── calendar/
│   │   │   ├── calendar.controller.ts
│   │   │   └── calendar.service.ts
│   │   │
│   │   ├── notifications/
│   │   │   ├── notifications.controller.ts
│   │   │   ├── notifications.service.ts
│   │   │   └── email.templates.ts
│   │   │
│   │   └── analytics/
│   │       ├── analytics.controller.ts
│   │       └── analytics.service.ts
│   │
│   ├── common/
│   │   ├── middleware/
│   │   │   ├── auth.middleware.ts
│   │   │   ├── roles.middleware.ts
│   │   │   └── rate-limit.middleware.ts
│   │   ├── guards/
│   │   │   └── roles.guard.ts
│   │   ├── decorators/
│   │   │   └── current-user.decorator.ts
│   │   ├── exceptions/
│   │   │   └── http-exception.filter.ts
│   │   └── utils/
│   │       ├── pagination.ts
│   │       └── validators.ts
│   │
│   ├── prisma/
│   │   ├── schema.prisma
│   │   ├── migrations/
│   │   └── seed.ts
│   │
│   └── app.ts
│
├── tests/
├── .env.example
├── package.json
├── tsconfig.json
└── README.md
```

### 2.2 Modelo de Base de Datos (Prisma Schema)

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ==================== USUARIOS ====================

enum UserRole {
  STUDENT
  TEACHER
  ADMIN
}

enum UserStatus {
  ACTIVE
  INACTIVE
  SUSPENDED
}

model User {
  id            String      @id @default(cuid())
  email         String      @unique
  password      String?     // Null si usa OAuth
  name          String
  avatar        String?
  role          UserRole    @default(STUDENT)
  status        UserStatus  @default(ACTIVE)
  emailVerified DateTime?

  // OAuth
  googleId      String?     @unique

  // Relaciones
  enrollments   Enrollment[]
  progress      Progress[]
  examAttempts  ExamAttempt[]
  certificates  Certificate[]
  cartItems     CartItem[]
  payments      Payment[]
  messages      Message[]   @relation("SentMessages")
  receivedMsgs  Message[]   @relation("ReceivedMessages")
  tickets       Ticket[]

  createdAt     DateTime    @default(now())
  updatedAt     DateTime    @updatedAt

  @@map("users")
}

// ==================== CURSOS ====================

enum CourseStatus {
  DRAFT
  PUBLISHED
  ARCHIVED
}

model Course {
  id            String        @id @default(cuid())
  slug          String        @unique
  title         String
  subtitle      String?
  description   String        @db.Text
  thumbnail     String?
  previewVideo  String?
  price         Decimal       @db.Decimal(10, 2)
  discountPrice Decimal?      @db.Decimal(10, 2)
  status        CourseStatus  @default(DRAFT)

  // SEO
  metaTitle     String?
  metaDesc      String?

  // Relaciones
  modules       Module[]
  enrollments   Enrollment[]
  reviews       Review[]
  cartItems     CartItem[]
  faqs          CourseFaq[]

  createdAt     DateTime      @default(now())
  updatedAt     DateTime      @updatedAt

  @@map("courses")
}

model Module {
  id          String    @id @default(cuid())
  courseId    String
  course      Course    @relation(fields: [courseId], references: [id], onDelete: Cascade)
  title       String
  description String?
  order       Int

  lessons     Lesson[]

  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  @@map("modules")
}

enum LessonType {
  VIDEO
  TEXT
  QUIZ
  EXERCISE
  LINK
}

model Lesson {
  id            String      @id @default(cuid())
  moduleId      String
  module        Module      @relation(fields: [moduleId], references: [id], onDelete: Cascade)
  title         String
  description   String?     @db.Text
  type          LessonType  @default(VIDEO)
  order         Int

  // Contenido según tipo
  videoUrl      String?
  videoDuration Int?        // En segundos
  content       String?     @db.Text
  externalLink  String?

  // Materiales
  materials     Material[]

  // Ejercicios/Exámenes
  exam          Exam?

  // Progreso
  progress      Progress[]

  isFree        Boolean     @default(false)  // Preview gratuito

  createdAt     DateTime    @default(now())
  updatedAt     DateTime    @updatedAt

  @@map("lessons")
}

model Material {
  id          String    @id @default(cuid())
  lessonId    String
  lesson      Lesson    @relation(fields: [lessonId], references: [id], onDelete: Cascade)
  title       String
  fileUrl     String
  fileType    String    // pdf, doc, xlsx, etc.
  fileSize    Int       // En bytes

  createdAt   DateTime  @default(now())

  @@map("materials")
}

// ==================== EXÁMENES ====================

enum QuestionType {
  MULTIPLE_CHOICE
  TRUE_FALSE
  SHORT_ANSWER
}

model Exam {
  id            String        @id @default(cuid())
  lessonId      String        @unique
  lesson        Lesson        @relation(fields: [lessonId], references: [id], onDelete: Cascade)
  title         String
  description   String?
  passingScore  Int           @default(70)  // Porcentaje
  maxAttempts   Int?          // Null = ilimitado
  timeLimit     Int?          // En minutos

  questions     Question[]
  attempts      ExamAttempt[]

  createdAt     DateTime      @default(now())
  updatedAt     DateTime      @updatedAt

  @@map("exams")
}

model Question {
  id            String        @id @default(cuid())
  examId        String
  exam          Exam          @relation(fields: [examId], references: [id], onDelete: Cascade)
  type          QuestionType
  text          String        @db.Text
  options       Json?         // Para multiple choice: ["opcion1", "opcion2", ...]
  correctAnswer String        @db.Text
  points        Int           @default(1)
  order         Int

  answers       Answer[]

  @@map("questions")
}

model ExamAttempt {
  id          String    @id @default(cuid())
  examId      String
  exam        Exam      @relation(fields: [examId], references: [id], onDelete: Cascade)
  userId      String
  user        User      @relation(fields: [userId], references: [id], onDelete: Cascade)

  score       Int?
  passed      Boolean?
  startedAt   DateTime  @default(now())
  completedAt DateTime?

  answers     Answer[]
  feedback    String?   @db.Text  // Feedback de la profesora

  @@map("exam_attempts")
}

model Answer {
  id          String      @id @default(cuid())
  attemptId   String
  attempt     ExamAttempt @relation(fields: [attemptId], references: [id], onDelete: Cascade)
  questionId  String
  question    Question    @relation(fields: [questionId], references: [id], onDelete: Cascade)
  answer      String      @db.Text
  isCorrect   Boolean?
  points      Int?

  @@map("answers")
}

// ==================== INSCRIPCIONES Y PROGRESO ====================

enum EnrollmentStatus {
  IN_CART
  PENDING_PAYMENT
  ACTIVE
  COMPLETED
  EXPIRED
  REFUNDED
}

model Enrollment {
  id          String            @id @default(cuid())
  userId      String
  user        User              @relation(fields: [userId], references: [id], onDelete: Cascade)
  courseId    String
  course      Course            @relation(fields: [courseId], references: [id], onDelete: Cascade)
  status      EnrollmentStatus  @default(ACTIVE)

  progress    Int               @default(0)  // Porcentaje 0-100

  enrolledAt  DateTime          @default(now())
  completedAt DateTime?
  expiresAt   DateTime?

  payment     Payment?
  certificate Certificate?

  @@unique([userId, courseId])
  @@map("enrollments")
}

model Progress {
  id          String    @id @default(cuid())
  userId      String
  user        User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  lessonId    String
  lesson      Lesson    @relation(fields: [lessonId], references: [id], onDelete: Cascade)

  completed   Boolean   @default(false)
  watchTime   Int       @default(0)  // Segundos vistos del video
  completedAt DateTime?

  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  @@unique([userId, lessonId])
  @@map("progress")
}

// ==================== CERTIFICADOS ====================

model Certificate {
  id            String      @id @default(cuid())
  enrollmentId  String      @unique
  enrollment    Enrollment  @relation(fields: [enrollmentId], references: [id], onDelete: Cascade)
  userId        String
  user          User        @relation(fields: [userId], references: [id], onDelete: Cascade)

  code          String      @unique  // Código de verificación
  fileUrl       String?

  issuedAt      DateTime    @default(now())

  @@map("certificates")
}

// ==================== CARRITO Y PAGOS ====================

model CartItem {
  id        String    @id @default(cuid())
  userId    String
  user      User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  courseId  String
  course    Course    @relation(fields: [courseId], references: [id], onDelete: Cascade)

  addedAt   DateTime  @default(now())

  @@unique([userId, courseId])
  @@map("cart_items")
}

enum PaymentStatus {
  PENDING
  APPROVED
  REJECTED
  REFUNDED
  CANCELLED
}

model Payment {
  id              String        @id @default(cuid())
  enrollmentId    String        @unique
  enrollment      Enrollment    @relation(fields: [enrollmentId], references: [id], onDelete: Cascade)
  userId          String
  user            User          @relation(fields: [userId], references: [id], onDelete: Cascade)

  amount          Decimal       @db.Decimal(10, 2)
  currency        String        @default("USD")
  status          PaymentStatus @default(PENDING)

  // Provider info
  provider        String        // mercadopago, stripe
  externalId      String?       // ID del pago en el provider
  paymentMethod   String?

  couponId        String?
  coupon          Coupon?       @relation(fields: [couponId], references: [id])
  discount        Decimal?      @db.Decimal(10, 2)

  paidAt          DateTime?
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt

  @@map("payments")
}

model Coupon {
  id              String    @id @default(cuid())
  code            String    @unique
  discountType    String    // percentage, fixed
  discountValue   Decimal   @db.Decimal(10, 2)
  maxUses         Int?
  usedCount       Int       @default(0)
  validFrom       DateTime  @default(now())
  validUntil      DateTime?
  isActive        Boolean   @default(true)

  payments        Payment[]

  createdAt       DateTime  @default(now())

  @@map("coupons")
}

// ==================== REVIEWS ====================

model Review {
  id        String    @id @default(cuid())
  courseId  String
  course    Course    @relation(fields: [courseId], references: [id], onDelete: Cascade)
  userName  String
  rating    Int       // 1-5
  comment   String    @db.Text
  isVisible Boolean   @default(true)

  createdAt DateTime  @default(now())

  @@map("reviews")
}

model CourseFaq {
  id        String    @id @default(cuid())
  courseId  String
  course    Course    @relation(fields: [courseId], references: [id], onDelete: Cascade)
  question  String
  answer    String    @db.Text
  order     Int

  @@map("course_faqs")
}

// ==================== MENSAJERÍA ====================

model Message {
  id          String    @id @default(cuid())
  senderId    String
  sender      User      @relation("SentMessages", fields: [senderId], references: [id], onDelete: Cascade)
  receiverId  String
  receiver    User      @relation("ReceivedMessages", fields: [receiverId], references: [id], onDelete: Cascade)

  subject     String?
  content     String    @db.Text
  isRead      Boolean   @default(false)

  createdAt   DateTime  @default(now())

  @@map("messages")
}

// ==================== TICKETS/RECLAMOS ====================

enum TicketStatus {
  OPEN
  IN_PROGRESS
  RESOLVED
  CLOSED
}

enum TicketPriority {
  LOW
  MEDIUM
  HIGH
}

model Ticket {
  id          String          @id @default(cuid())
  userId      String
  user        User            @relation(fields: [userId], references: [id], onDelete: Cascade)

  subject     String
  description String          @db.Text
  status      TicketStatus    @default(OPEN)
  priority    TicketPriority  @default(MEDIUM)

  responses   TicketResponse[]

  createdAt   DateTime        @default(now())
  updatedAt   DateTime        @updatedAt

  @@map("tickets")
}

model TicketResponse {
  id        String    @id @default(cuid())
  ticketId  String
  ticket    Ticket    @relation(fields: [ticketId], references: [id], onDelete: Cascade)

  content   String    @db.Text
  isAdmin   Boolean   @default(false)

  createdAt DateTime  @default(now())

  @@map("ticket_responses")
}

// ==================== CALENDARIO ====================

enum EventType {
  LIVE_CLASS
  DEADLINE
  EXAM
  OTHER
}

model CalendarEvent {
  id          String      @id @default(cuid())
  courseId    String?
  title       String
  description String?
  type        EventType   @default(OTHER)

  startDate   DateTime
  endDate     DateTime?
  meetingUrl  String?     // Link de Zoom/Meet

  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt

  @@map("calendar_events")
}

// ==================== NOTIFICACIONES ====================

model Notification {
  id        String    @id @default(cuid())
  userId    String?   // Null = para todos

  title     String
  message   String
  type      String    // announcement, reminder, system
  isRead    Boolean   @default(false)

  createdAt DateTime  @default(now())

  @@map("notifications")
}
```

### 2.3 API Endpoints

#### Autenticación

```
POST   /api/auth/register          # Registro con email
POST   /api/auth/login             # Login con email
POST   /api/auth/google            # OAuth con Google
POST   /api/auth/refresh           # Refresh token
POST   /api/auth/forgot-password   # Recuperar contraseña
POST   /api/auth/reset-password    # Reset contraseña
GET    /api/auth/me                # Usuario actual
POST   /api/auth/logout            # Cerrar sesión
```

#### Cursos (Público)

```
GET    /api/courses                # Lista de cursos publicados
GET    /api/courses/:slug          # Detalle de curso
GET    /api/courses/:slug/reviews  # Reviews del curso
```

#### Cursos (Admin/Profesora)

```
POST   /api/admin/courses          # Crear curso
PUT    /api/admin/courses/:id      # Actualizar curso
DELETE /api/admin/courses/:id      # Eliminar curso
POST   /api/admin/courses/:id/publish  # Publicar curso

# Módulos
POST   /api/admin/courses/:id/modules
PUT    /api/admin/modules/:id
DELETE /api/admin/modules/:id
PUT    /api/admin/modules/reorder  # Reordenar

# Lecciones
POST   /api/admin/modules/:id/lessons
PUT    /api/admin/lessons/:id
DELETE /api/admin/lessons/:id

# Materiales
POST   /api/admin/lessons/:id/materials
DELETE /api/admin/materials/:id

# Exámenes
POST   /api/admin/lessons/:id/exam
PUT    /api/admin/exams/:id
POST   /api/admin/exams/:id/questions
```

#### Alumno - Mis Cursos

```
GET    /api/student/courses              # Mis cursos
GET    /api/student/courses/:id          # Detalle de mi curso
GET    /api/student/courses/:id/progress # Mi progreso
POST   /api/student/progress             # Marcar lección completada
```

#### Alumno - Exámenes

```
GET    /api/student/exams/:id            # Ver examen
POST   /api/student/exams/:id/start      # Iniciar intento
POST   /api/student/exams/:id/submit     # Enviar respuestas
GET    /api/student/attempts/:id         # Ver resultado
```

#### Carrito y Pagos

```
GET    /api/cart                         # Mi carrito
POST   /api/cart                         # Agregar al carrito
DELETE /api/cart/:courseId               # Quitar del carrito
POST   /api/cart/checkout                # Iniciar checkout
POST   /api/payments/webhook             # Webhook del provider
GET    /api/payments/history             # Historial de pagos
```

#### Certificados

```
GET    /api/certificates                 # Mis certificados
GET    /api/certificates/:code           # Verificar certificado
GET    /api/certificates/:id/download    # Descargar PDF
```

#### Mensajes

```
GET    /api/messages                     # Mis mensajes
GET    /api/messages/:id                 # Ver mensaje
POST   /api/messages                     # Enviar mensaje
PUT    /api/messages/:id/read            # Marcar leído
```

#### Tickets

```
GET    /api/tickets                      # Mis tickets
POST   /api/tickets                      # Crear ticket
GET    /api/tickets/:id                  # Ver ticket
POST   /api/tickets/:id/response         # Responder
```

#### Calendario

```
GET    /api/calendar/events              # Eventos del calendario
GET    /api/calendar/events/:courseId    # Eventos de un curso
```

#### Admin - CRM Alumnos

```
GET    /api/admin/students               # Lista de alumnos
GET    /api/admin/students/:id           # Detalle alumno
GET    /api/admin/students/export        # Exportar a Excel
GET    /api/admin/students/stats         # Estadísticas CRM
```

#### Admin - Correcciones

```
GET    /api/admin/corrections            # Pendientes de corregir
PUT    /api/admin/attempts/:id/grade     # Calificar
```

#### Admin - Mensajes y Tickets

```
GET    /api/admin/messages               # Todos los mensajes
GET    /api/admin/tickets                # Todos los tickets
PUT    /api/admin/tickets/:id/status     # Cambiar estado
```

#### Admin - Calendario

```
POST   /api/admin/calendar/events        # Crear evento
PUT    /api/admin/calendar/events/:id    # Editar evento
DELETE /api/admin/calendar/events/:id    # Eliminar evento
```

#### Admin - Dashboard

```
GET    /api/admin/dashboard/stats        # Métricas generales
GET    /api/admin/dashboard/alerts       # Alertas pendientes
```

---

## 3. Arquitectura del Frontend

### 3.1 Estructura de Carpetas (Frontend Plataforma)

```
frontend/
├── public/
│   ├── images/
│   └── favicon.ico
│
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   ├── register/
│   │   │   │   └── page.tsx
│   │   │   └── layout.tsx
│   │   │
│   │   ├── (public)/                    # Web de venta
│   │   │   ├── page.tsx                 # Home
│   │   │   ├── cursos/
│   │   │   │   ├── page.tsx             # Catálogo
│   │   │   │   └── [slug]/
│   │   │   │       └── page.tsx         # Landing del curso
│   │   │   ├── carrito/
│   │   │   │   └── page.tsx
│   │   │   ├── checkout/
│   │   │   │   └── page.tsx
│   │   │   └── layout.tsx
│   │   │
│   │   ├── (student)/                   # Plataforma Alumno
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx
│   │   │   ├── mis-cursos/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [courseId]/
│   │   │   │       ├── page.tsx         # Vista del curso
│   │   │   │       └── [lessonId]/
│   │   │   │           └── page.tsx     # Vista de lección
│   │   │   ├── catalogo/
│   │   │   │   └── page.tsx
│   │   │   ├── examenes/
│   │   │   │   └── [examId]/
│   │   │   │       └── page.tsx
│   │   │   ├── certificados/
│   │   │   │   └── page.tsx
│   │   │   ├── mensajes/
│   │   │   │   └── page.tsx
│   │   │   ├── calendario/
│   │   │   │   └── page.tsx
│   │   │   ├── perfil/
│   │   │   │   └── page.tsx
│   │   │   ├── pagos/
│   │   │   │   └── page.tsx
│   │   │   ├── soporte/
│   │   │   │   └── page.tsx
│   │   │   └── layout.tsx               # Layout con sidebar
│   │   │
│   │   ├── (teacher)/                   # Plataforma Profesora
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx
│   │   │   ├── cursos/
│   │   │   │   ├── page.tsx             # Lista mis cursos
│   │   │   │   ├── nuevo/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── [courseId]/
│   │   │   │       ├── page.tsx         # Editor del curso
│   │   │   │       ├── modulos/
│   │   │   │       │   └── page.tsx
│   │   │   │       └── estadisticas/
│   │   │   │           └── page.tsx
│   │   │   ├── alumnos/
│   │   │   │   ├── page.tsx             # CRM Alumnos
│   │   │   │   └── [studentId]/
│   │   │   │       └── page.tsx
│   │   │   ├── correcciones/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [attemptId]/
│   │   │   │       └── page.tsx
│   │   │   ├── mensajes/
│   │   │   │   └── page.tsx
│   │   │   ├── tickets/
│   │   │   │   └── page.tsx
│   │   │   ├── calendario/
│   │   │   │   └── page.tsx
│   │   │   ├── anuncios/
│   │   │   │   └── page.tsx
│   │   │   └── layout.tsx               # Layout admin
│   │   │
│   │   ├── api/                         # API Routes (si se usa)
│   │   ├── globals.css
│   │   └── layout.tsx
│   │
│   ├── components/
│   │   ├── ui/                          # shadcn/ui components
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── input.tsx
│   │   │   ├── dialog.tsx
│   │   │   └── ...
│   │   │
│   │   ├── layout/
│   │   │   ├── header.tsx
│   │   │   ├── footer.tsx
│   │   │   ├── sidebar.tsx
│   │   │   ├── student-sidebar.tsx
│   │   │   └── teacher-sidebar.tsx
│   │   │
│   │   ├── auth/
│   │   │   ├── login-form.tsx
│   │   │   ├── register-form.tsx
│   │   │   └── google-button.tsx
│   │   │
│   │   ├── courses/
│   │   │   ├── course-card.tsx
│   │   │   ├── course-grid.tsx
│   │   │   ├── course-hero.tsx
│   │   │   ├── module-accordion.tsx
│   │   │   └── lesson-list.tsx
│   │   │
│   │   ├── player/
│   │   │   ├── video-player.tsx
│   │   │   └── progress-bar.tsx
│   │   │
│   │   ├── exams/
│   │   │   ├── exam-form.tsx
│   │   │   ├── question-card.tsx
│   │   │   └── result-card.tsx
│   │   │
│   │   ├── cart/
│   │   │   ├── cart-item.tsx
│   │   │   ├── cart-summary.tsx
│   │   │   └── checkout-form.tsx
│   │   │
│   │   ├── dashboard/
│   │   │   ├── stats-card.tsx
│   │   │   ├── progress-chart.tsx
│   │   │   └── alerts-panel.tsx
│   │   │
│   │   ├── crm/
│   │   │   ├── student-table.tsx
│   │   │   ├── student-filters.tsx
│   │   │   └── student-detail.tsx
│   │   │
│   │   ├── course-builder/
│   │   │   ├── module-editor.tsx
│   │   │   ├── lesson-editor.tsx
│   │   │   ├── exam-builder.tsx
│   │   │   └── drag-drop-list.tsx
│   │   │
│   │   └── common/
│   │       ├── loading.tsx
│   │       ├── error.tsx
│   │       ├── empty-state.tsx
│   │       └── pagination.tsx
│   │
│   ├── hooks/
│   │   ├── use-auth.ts
│   │   ├── use-courses.ts
│   │   ├── use-cart.ts
│   │   ├── use-progress.ts
│   │   └── use-messages.ts
│   │
│   ├── lib/
│   │   ├── api.ts                       # API client (fetch/axios)
│   │   ├── auth.ts                      # Auth utilities
│   │   ├── utils.ts                     # Helpers
│   │   └── validations.ts               # Zod schemas
│   │
│   ├── stores/                          # Zustand stores
│   │   ├── auth-store.ts
│   │   ├── cart-store.ts
│   │   └── ui-store.ts
│   │
│   └── types/
│       ├── user.ts
│       ├── course.ts
│       ├── enrollment.ts
│       └── index.ts
│
├── .env.example
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── README.md
```

---

## 4. Flujo de Datos

### 4.1 Flujo de Compra

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Visitar   │────▶│  Agregar al │────▶│   Iniciar   │────▶│   Pago en   │
│   Curso     │     │   Carrito   │     │  Checkout   │     │  Provider   │
└─────────────┘     └─────────────┘     └─────────────┘     └──────┬──────┘
                                                                    │
                                                                    ▼
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Acceso    │◀────│  Crear      │◀────│  Webhook    │◀────│   Pago      │
│   al Curso  │     │  Enrollment │     │  Confirmado │     │  Aprobado   │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
```

### 4.2 Flujo de Progreso

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Ver       │────▶│  Tracking   │────▶│   Marcar    │
│   Lección   │     │  de Video   │     │ Completada  │
└─────────────┘     └─────────────┘     └──────┬──────┘
                                               │
                    ┌──────────────────────────┘
                    ▼
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Calcular   │────▶│  100%       │────▶│   Generar   │
│  Progreso   │     │  Completado │     │ Certificado │
└─────────────┘     └─────────────┘     └─────────────┘
```

---

## 5. Seguridad

### 5.1 Autenticación

- JWT con access token (15min) + refresh token (7 días)
- Tokens almacenados en httpOnly cookies
- OAuth 2.0 para Google

### 5.2 Autorización

- Middleware de roles (STUDENT, TEACHER, ADMIN)
- Guards por ruta
- Validación de ownership (alumno solo ve sus cursos)

### 5.3 Protección de Videos

- Signed URLs con expiración (4 horas)
- Dominio restringido
- No descarga directa

### 5.4 Rate Limiting

- Login: 5 intentos / 15 min
- API general: 100 req / min
- Webhooks: sin límite (verificación por firma)

---

## 6. Deploy y DevOps

### 6.1 Ambientes

| Ambiente    | URL                       | Propósito              |
| ----------- | ------------------------- | ---------------------- |
| Development | localhost                 | Desarrollo local       |
| Staging     | staging.academiaepica.com | Testing pre-producción |
| Production  | app.academiaepica.com     | Producción             |

### 6.2 CI/CD Pipeline

```
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│   Push   │───▶│   Tests  │───▶│   Build  │───▶│  Deploy  │
│  to Git  │    │  & Lint  │    │  Docker  │    │  Vercel  │
└──────────┘    └──────────┘    └──────────┘    └──────────┘
```

### 6.3 Monitoreo

- **Logs:** Vercel/Railway logs
- **Errors:** Sentry
- **Uptime:** UptimeRobot
- **Analytics:** Plausible / Vercel Analytics

---

## 7. Estimación de Costos (Mensual)

| Servicio           | Plan          | Costo Estimado  |
| ------------------ | ------------- | --------------- |
| Vercel             | Pro           | $20/mes         |
| Railway/Render     | Starter       | $10-20/mes      |
| Neon PostgreSQL    | Free/Launch   | $0-25/mes       |
| Upstash Redis      | Free          | $0              |
| Bunny.net CDN      | Pay as you go | $10-50/mes      |
| Resend             | Free tier     | $0              |
| Cloudflare         | Free          | $0              |
| **Total estimado** |               | **$40-115/mes** |

---

_Documento generado para Academia Épica - Plataforma de Cursos Personalizados_
