# Backend de Plataforma Educativa (Futuro Desarrollo)

Este documento describe las funcionalidades que **NO** están incluidas en el backend actual (venta de cursos) y que deberán implementarse en un backend separado para la **plataforma educativa**.

## 📋 Resumen

El backend actual (`maria-victoria-seoane-back`) es exclusivamente para:

- **Catálogo de cursos** (mostrar cursos, temario)
- **E-commerce** (carrito, checkout, pagos)
- **Gestión de usuarios** (registro, autenticación)
- **Administración de contenido** (CRUD de cursos, módulos, lecciones básicas)

El backend de plataforma educativa será para:

- **Consumo de contenido** (videos, materiales)
- **Tracking de progreso** (lecciones completadas)
- **Navegación de lecciones** (anterior/siguiente)
- **Recursos descargables**

---

## 🗃️ Modelos de Datos Eliminados

### CourseProgress (Progreso del Curso)

```prisma
model CourseProgress {
  id               String    @id @default(uuid())
  userId           String
  user             User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  courseId         String
  course           Course    @relation(fields: [courseId], references: [id], onDelete: Cascade)
  startedAt        DateTime  @default(now())
  completedAt      DateTime?
  lastAccessedAt   DateTime  @default(now())
  completionPercentage Decimal @default(0) @db.Decimal(5, 2)

  lessonProgress LessonProgress[]

  @@unique([userId, courseId])
  @@map("course_progress")
}
```

### LessonProgress (Progreso de Lección)

```prisma
model LessonProgress {
  id               String    @id @default(uuid())
  courseProgressId String
  courseProgress   CourseProgress @relation(fields: [courseProgressId], references: [id], onDelete: Cascade)
  lessonId         String
  lesson           Lesson    @relation(fields: [lessonId], references: [id], onDelete: Cascade)
  isCompleted      Boolean   @default(false)
  completedAt      DateTime?
  watchedSeconds   Int       @default(0) // Segundos vistos del video
  lastPosition     Int       @default(0) // Última posición del video

  @@unique([courseProgressId, lessonId])
  @@map("lesson_progress")
}
```

---

## 📝 Campos Eliminados del Modelo Lesson

Los siguientes campos fueron removidos del modelo `Lesson` y deberán existir en la plataforma educativa:

| Campo       | Tipo           | Descripción                                        |
| ----------- | -------------- | -------------------------------------------------- |
| `videoUrl`  | String?        | URL del video de la lección (Vimeo, YouTube, etc.) |
| `content`   | String? (Text) | Contenido adicional en formato Markdown            |
| `resources` | Json?          | Array de recursos descargables `[{name, url}]`     |

### Modelo Lesson Actual (Solo Venta)

```prisma
model Lesson {
  id          String   @id @default(uuid())
  moduleId    String
  module      Module   @relation(...)
  title       String
  description String?  @db.Text
  duration    Int?     // Duración estimada en minutos (para mostrar en temario)
  order       Int      @default(0)
  isFree      Boolean  @default(false) // Para mostrar contenido de preview
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@map("lessons")
}
```

### Modelo Lesson Plataforma Educativa (Propuesto)

```prisma
model LessonContent {
  id          String   @id @default(uuid())
  lessonId    String   @unique // FK al lesson del backend de ventas
  videoUrl    String?
  videoProvider String? // "vimeo", "youtube", "bunny", etc.
  content     String?  @db.Text // Markdown
  resources   Json?    // [{name, url, type}]
  transcript  String?  @db.Text // Transcripción del video
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@map("lesson_contents")
}
```

---

## 🔌 Endpoints Eliminados

### Progress Module (Completo)

- `POST /progress/courses/:courseId/start` - Iniciar progreso de curso
- `GET /progress/courses/:courseId` - Obtener progreso de curso
- `GET /progress/courses` - Listar cursos en progreso
- `POST /progress/lessons/:lessonId/complete` - Marcar lección como completada
- `PUT /progress/lessons/:lessonId/position` - Actualizar posición del video
- `GET /progress/lessons/:lessonId` - Obtener progreso de lección
- `DELETE /progress/courses/:courseId` - Resetear progreso de curso

### Lessons (Parcial)

- `GET /lessons/course/:courseId/free` - Obtener lecciones gratuitas por curso
- `GET /lessons/:id?includeNavigation=true` - El parámetro `includeNavigation` fue removido

---

## 🎯 Endpoints para Plataforma Educativa (Propuestos)

### Progreso de Cursos

```
POST   /education/courses/:courseId/enroll      # Iniciar curso (después de compra)
GET    /education/courses/:courseId/progress    # Ver progreso del curso
GET    /education/courses/my-courses            # Mis cursos en progreso
DELETE /education/courses/:courseId/reset       # Reiniciar curso
```

### Progreso de Lecciones

```
GET    /education/lessons/:lessonId             # Obtener lección con contenido
POST   /education/lessons/:lessonId/complete    # Marcar como completada
PUT    /education/lessons/:lessonId/progress    # Actualizar posición de video
GET    /education/lessons/:lessonId/navigation  # Lección anterior/siguiente
```

### Contenido

```
GET    /education/lessons/:lessonId/video       # URL firmada del video (temporal)
GET    /education/lessons/:lessonId/resources   # Recursos descargables
GET    /education/courses/:courseId/certificate # Certificado (si completó)
```

---

## 🔗 Integración entre Backends

### Flujo de Compra → Acceso Educativo

1. **Backend Ventas**: Usuario completa compra del curso
2. **Backend Ventas**: Crea `OrderItem` con estado `COMPLETED`
3. **Backend Ventas**: Emite evento `course.purchased` (webhook/queue)
4. **Backend Educativo**: Recibe evento y crea `CourseProgress` inicial
5. **Backend Educativo**: Usuario puede acceder al contenido

### Verificación de Acceso

El backend educativo debe verificar que el usuario haya comprado el curso:

```typescript
// Backend Educativo
async verifyAccess(userId: string, courseId: string): Promise<boolean> {
  // Opción 1: Llamada directa al backend de ventas
  const response = await this.ventasApi.get(`/orders/user/${userId}/course/${courseId}`);
  return response.data.hasPurchased;

  // Opción 2: Base de datos compartida (solo lectura)
  const order = await this.prisma.orderItem.findFirst({
    where: {
      order: { userId, status: 'COMPLETED' },
      courseId
    }
  });
  return !!order;
}
```

---

## 📦 Estructura de Proyecto Sugerida

```
maria-victoria-seoane-educacion/
├── src/
│   ├── modules/
│   │   ├── progress/         # Progreso de cursos y lecciones
│   │   ├── content/          # Contenido de lecciones
│   │   ├── certificates/     # Certificados de completado
│   │   └── analytics/        # Estadísticas de aprendizaje
│   ├── common/
│   │   └── guards/
│   │       └── course-access.guard.ts  # Verificar compra
│   └── integrations/
│       └── ventas-backend/   # Cliente para backend de ventas
├── prisma/
│   └── schema.prisma         # Modelos educativos
└── ...
```

---

## 🗓️ Prioridades de Implementación

1. **Fase 1 - Core**
   - Modelo CourseProgress y LessonProgress
   - Endpoints de tracking básico
   - Verificación de acceso (compra)

2. **Fase 2 - Contenido**
   - Modelo LessonContent
   - Streaming de video seguro
   - Recursos descargables

3. **Fase 3 - Engagement**
   - Navegación entre lecciones
   - Certificados
   - Notas y marcadores

4. **Fase 4 - Analytics**
   - Dashboard de progreso
   - Estadísticas de aprendizaje
   - Recomendaciones

---

## 📌 Notas Importantes

1. **Separación de responsabilidades**: El backend de ventas maneja el CATÁLOGO (qué se vende) y el backend educativo maneja el CONTENIDO (qué se consume).

2. **Campo `isFree` en Lesson**: Se mantiene en el backend de ventas para mostrar previews del temario, pero el contenido real de las lecciones gratuitas también estaría en el backend educativo.

3. **Sincronización**: Los IDs de Course, Module y Lesson deben coincidir entre ambos backends, o usar un sistema de referencia.

4. **Autenticación compartida**: Ambos backends pueden usar el mismo sistema de autenticación (JWT) para que el usuario no tenga que loguearse dos veces.
