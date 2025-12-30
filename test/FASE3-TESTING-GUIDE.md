# Guía de Testing - Fase 3 (Endpoints Pendientes)

**Nota:** Usa la colección de Postman `Cursos-Backend-API.postman_collection.json`

**IDs actuales (guardar de las pruebas anteriores):**

- `categoryId`: 22c93695-73b8-4ebb-9c93-4eb69c0e1e18
- `courseId`: 86bcfca3-ab6b-401e-90e9-d9c41976f40c
- `moduleId`: 201a169c-2bad-4513-b6ea-c0c95c250ee2
- `lessonId`: 5171fb65-cdfa-4326-a85c-26a74a25fcb1

---

## 1. CATEGORIES (Endpoints faltantes)

### 1.1 Get Category by ID

**GET** `/categories/{{categoryId}}`

- Sin auth (público)
- ✅ Debe devolver la categoría "Desarrollo Web"

### 1.2 Get Category by Slug

**GET** `/categories/slug/desarrollo-web`

- Sin auth (público)
- ✅ Debe devolver la misma categoría

### 1.3 Update Category

**PUT** `/categories/{{categoryId}}`

- Auth: Bearer token
- Body:

```json
{
  "name": "Desarrollo Web Full Stack",
  "description": "Descripción actualizada"
}
```

- ✅ Debe actualizar los campos

### 1.4 Reorder Categories

**PUT** `/categories/reorder/batch`

- Auth: Bearer token
- Body (ajustar con tus IDs reales):

```json
{
  "orderedIds": ["{{categoryId}}", "otro-id-si-tienes"]
}
```

- ✅ Debe actualizar el orden

### 1.5 Delete Category

**DELETE** `/categories/{{categoryId}}`

- Auth: Bearer token
- ⚠️ NO EJECUTAR TODAVÍA (tiene curso asociado)
- Ejecutar al final después de eliminar el curso

---

## 2. COURSES (Endpoints faltantes)

### 2.1 Get All Courses (con filtros)

**GET** `/courses?page=1&limit=10&isPublished=false`

- Sin auth (público)
- Probar filtros:
  - `?search=nestjs`
  - `?categoryId={{categoryId}}`
  - `?categorySlug=desarrollo-web`
  - `?level=Intermedio`
  - `?sortBy=createdAt&sortOrder=desc`
- ✅ Debe devolver el curso creado

### 2.2 Get Featured Courses

**GET** `/courses/featured?limit=6`

- Sin auth (público)
- ✅ Lista vacía (aún no marcamos el curso como featured)

### 2.3 Get Course by Slug

**GET** `/courses/slug/curso-completo-de-nestjs`

- Sin auth (público)
- ✅ Debe devolver el curso con módulos

### 2.4 Update Course

**PUT** `/courses/{{courseId}}`

- Auth: Bearer token
- Body:

```json
{
  "title": "Curso Completo de NestJS 2024",
  "price": 34990,
  "level": "Avanzado"
}
```

- ✅ Debe actualizar los campos

### 2.5 Toggle Publish Course

**PATCH** `/courses/{{courseId}}/toggle-publish`

- Auth: Bearer token
- Sin body
- ✅ Debe cambiar `isPublished` a `true`
- Ejecutar de nuevo para volver a `false`

### 2.6 Toggle Featured Course

**PATCH** `/courses/{{courseId}}/toggle-featured`

- Auth: Bearer token
- Sin body
- ✅ Debe cambiar `isFeatured` a `true`
- Luego volver a ejecutar **2.2 Get Featured** (ahora debe aparecer)

### 2.7 Reorder Courses

**PUT** `/courses/reorder/batch`

- Auth: Bearer token
- Body:

```json
{
  "orderedIds": ["{{courseId}}"]
}
```

- ✅ Debe actualizar el orden

### 2.8 Delete Course

**DELETE** `/courses/{{courseId}}`

- Auth: Bearer token
- ⚠️ NO EJECUTAR TODAVÍA
- Ejecutar al final (elimina módulos y lecciones en cascada)

---

## 3. MODULES (Endpoints faltantes)

### 3.1 Get Modules by Course (con lecciones)

**GET** `/modules/course/{{courseId}}?includeLessons=true`

- Sin auth (público)
- ✅ Debe devolver 2 módulos (original + duplicado) con sus lecciones

### 3.2 Get Module by ID

**GET** `/modules/{{moduleId}}?includeLessons=true`

- Sin auth (público)
- ✅ Debe devolver el módulo original con 2 lecciones

### 3.3 Update Module

**PUT** `/modules/{{moduleId}}`

- Auth: Bearer token
- Body:

```json
{
  "title": "Introducción a NestJS - Actualizado",
  "description": "Descripción mejorada del módulo"
}
```

- ✅ Debe actualizar los campos

### 3.4 Reorder Modules

**PUT** `/modules/course/{{courseId}}/reorder`

- Auth: Bearer token
- Body (ajustar con IDs de los 2 módulos):

```json
{
  "orderedIds": [
    "2d03ab29-b914-4e5d-948a-f819204795cc",
    "201a169c-2bad-4513-b6ea-c0c95c250ee2"
  ]
}
```

- ✅ Debe cambiar el orden (duplicado primero)

### 3.5 Delete Module

**DELETE** `/modules/2d03ab29-b914-4e5d-948a-f819204795cc`

- Auth: Bearer token
- ✅ Debe eliminar el módulo duplicado
- Verificar con **3.1** que solo queda 1 módulo

---

## 4. LESSONS (Endpoints faltantes)

### 4.1 Get Lessons by Module

**GET** `/lessons/module/{{moduleId}}`

- Sin auth (público)
- ✅ Debe devolver 2 lecciones del módulo

### 4.2 Get Lesson by ID (con navegación)

**GET** `/lessons/{{lessonId}}?includeNavigation=true`

- Sin auth (público)
- ✅ Debe incluir `previousLesson` y `nextLesson`

### 4.3 Update Lesson

**PUT** `/lessons/{{lessonId}}`

- Auth: Bearer token
- Body:

```json
{
  "title": "Instalación de NestJS - Versión 2024",
  "duration": 18,
  "isFree": false
}
```

- ✅ Debe actualizar los campos

### 4.4 Reorder Lessons

**PUT** `/lessons/module/{{moduleId}}/reorder`

- Auth: Bearer token
- Body (ajustar con IDs de las 2 lecciones):

```json
{
  "orderedIds": [
    "a0e1309f-a239-4756-9415-64fe6bd25cb5",
    "5171fb65-cdfa-4326-a85c-26a74a25fcb1"
  ]
}
```

- ✅ Debe cambiar el orden

### 4.5 Move Lesson (crear módulo temporal primero)

Primero crear un módulo temporal:
**POST** `/modules`

- Body:

```json
{
  "courseId": "{{courseId}}",
  "title": "Módulo Temporal",
  "description": "Para probar move"
}
```

- Guardar el nuevo `moduleId` (ej: `tempModuleId`)

Luego mover la lección:
**PATCH** `/lessons/a0e1309f-a239-4756-9415-64fe6bd25cb5/move`

- Auth: Bearer token
- Body:

```json
{
  "targetModuleId": "PEGAR-TEMP-MODULE-ID-AQUI",
  "order": 0
}
```

- ✅ Debe mover la lección al nuevo módulo

### 4.6 Delete Lesson

**DELETE** `/lessons/a0e1309f-a239-4756-9415-64fe6bd25cb5`

- Auth: Bearer token
- ✅ Debe eliminar la lección movida

---

## 5. PROGRESS (Endpoints faltantes)

### 5.1 Get My Courses Progress

**GET** `/progress/my-courses`

- Auth: Bearer token
- ✅ Debe devolver el curso con progreso 50%

### 5.2 Update Lesson Progress (watchTime)

**PUT** `/progress/lesson`

- Auth: Bearer token
- Body:

```json
{
  "lessonId": "{{lessonId}}",
  "isCompleted": false,
  "watchTime": 450
}
```

- ✅ Debe actualizar el watchTime

### 5.3 Mark Lesson Incomplete

**POST** `/progress/lesson/{{lessonId}}/incomplete`

- Auth: Bearer token
- Sin body
- ✅ Debe marcar como no completada
- Verificar progreso: **GET** `/progress/course/{{courseId}}` → debe ser 0%

### 5.4 Mark Complete Again

**POST** `/progress/lesson/{{lessonId}}/complete`

- Auth: Bearer token
- ✅ Volver a completar

### 5.5 Get Last Accessed Lesson

**GET** `/progress/course/{{courseId}}/last-lesson`

- Auth: Bearer token
- ✅ Debe devolver la última lección accedida

### 5.6 Reset Course Progress

**DELETE** `/progress/course/{{courseId}}/reset`

- Auth: Bearer token
- ✅ Debe eliminar todo el progreso
- Verificar con **5.1** que ya no aparece

---

## 6. LIMPIEZA FINAL (Orden inverso de creación)

### 6.1 Eliminar módulo temporal

**DELETE** `/modules/{{tempModuleId}}`

### 6.2 Eliminar curso (cascada: módulos + lecciones)

**DELETE** `/courses/{{courseId}}`

### 6.3 Eliminar categoría

**DELETE** `/categories/{{categoryId}}`

---

## ✅ Checklist de Verificación

Después de probar todo, verificar:

1. [ ] Todos los GET sin auth funcionan (públicos)
2. [ ] Todos los POST/PUT/PATCH/DELETE requieren auth
3. [ ] Filtros y paginación funcionan en GET all
4. [ ] Featured courses se actualiza con toggle
5. [ ] Reorder actualiza el campo `order`
6. [ ] Duplicate crea copias con nuevos IDs
7. [ ] Move cambia el `moduleId` de la lección
8. [ ] Progress calcula % correctamente
9. [ ] Cascada de delete funciona (curso → módulos → lecciones)
10. [ ] Navigation en lessons devuelve prev/next

---

## Notas Importantes

- ⚠️ **No eliminar** curso/categoría hasta el final
- 💾 **Guardar IDs** generados durante las pruebas
- 🔒 Recordar que Progress requiere acceso temporal (modificamos el service)
- 📊 El progreso se recalcula automáticamente
- 🔄 Los reorder pueden fallar si hay IDs incorrectos
