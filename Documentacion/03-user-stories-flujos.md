# 📝 User Stories y Flujos de Usuario

## Plataforma de Cursos Personalizados - Academia Épica

**Versión:** 1.0  
**Fecha:** 26 de Diciembre, 2025  
**Autor:** Academia Épica

---

## 1. Épicas del Proyecto

| ID  | Épica             | Descripción                                    |
| --- | ----------------- | ---------------------------------------------- |
| E01 | Web de Venta      | Landing y proceso de compra de cursos          |
| E02 | Autenticación     | Sistema de registro, login y gestión de sesión |
| E03 | Plataforma Alumno | Consumo de cursos y progreso                   |
| E04 | Evaluaciones      | Exámenes y certificaciones                     |
| E05 | Comunicación      | Mensajes, tickets y notificaciones             |
| E06 | Panel Profesora   | Gestión de cursos, alumnos y contenido         |
| E07 | CRM               | Gestión comercial de alumnos                   |
| E08 | Analytics         | Métricas y reportes (largo plazo)              |

---

## 2. User Stories por Épica

### E01: Web de Venta

#### US-01: Ver Home Principal

**Como** visitante  
**Quiero** ver la página principal con información de los cursos  
**Para** entender qué ofrece la plataforma y decidir si me interesa

**Criterios de Aceptación:**

- [ ] Hero section con propuesta de valor visible
- [ ] Sección scroll con descripción de los cursos
- [ ] Video de presentación del profesor
- [ ] Cards de cursos con precio visible
- [ ] Sección de reseñas de alumnos
- [ ] Botón de contacto para dudas
- [ ] Diseño responsive (mobile, tablet, desktop)

---

#### US-02: Ver Catálogo de Cursos

**Como** visitante  
**Quiero** ver todos los cursos disponibles  
**Para** elegir cuál me interesa comprar

**Criterios de Aceptación:**

- [ ] Grid de cards de cursos
- [ ] Cada card muestra: imagen, título, precio, descripción breve
- [ ] Click en card lleva a landing del curso
- [ ] Filtros opcionales (categoría, precio)

---

#### US-03: Ver Landing de Curso

**Como** visitante  
**Quiero** ver toda la información de un curso específico  
**Para** decidir si lo compro

**Criterios de Aceptación:**

- [ ] Hero con título, subtítulo y CTA de compra
- [ ] Video de preview del curso
- [ ] Descripción detallada
- [ ] Temario completo (módulos y lecciones)
- [ ] Precio y botón "Agregar al carrito"
- [ ] Reseñas de alumnos del curso
- [ ] FAQ del curso
- [ ] Información del profesor

---

#### US-04: Agregar Curso al Carrito

**Como** visitante/usuario  
**Quiero** agregar cursos a mi carrito  
**Para** comprarlos después

**Criterios de Aceptación:**

- [ ] Botón "Agregar al carrito" en landing del curso
- [ ] Feedback visual al agregar (toast/notificación)
- [ ] Contador de items en icono del carrito
- [ ] Si ya está en el carrito, mostrar mensaje
- [ ] Carrito persiste en localStorage (visitante) o BD (logueado)

---

#### US-05: Ver y Gestionar Carrito

**Como** usuario  
**Quiero** ver mi carrito y gestionar los items  
**Para** revisar antes de pagar

**Criterios de Aceptación:**

- [ ] Lista de cursos en el carrito
- [ ] Precio individual y total
- [ ] Botón para eliminar items
- [ ] Campo para aplicar cupón de descuento
- [ ] Botón "Proceder al pago"
- [ ] Resumen del pedido

---

#### US-06: Proceso de Checkout

**Como** usuario registrado  
**Quiero** completar la compra de los cursos  
**Para** acceder al contenido

**Criterios de Aceptación:**

- [ ] Requiere estar logueado (redirect a login si no)
- [ ] Resumen del pedido
- [ ] Selección de método de pago
- [ ] Integración con MercadoPago/Stripe
- [ ] Página de confirmación post-pago
- [ ] Email de confirmación
- [ ] Acceso inmediato al curso tras pago aprobado

---

### E02: Autenticación

#### US-07: Registro con Email

**Como** visitante  
**Quiero** crear una cuenta con mi email  
**Para** comprar cursos y acceder a la plataforma

**Criterios de Aceptación:**

- [ ] Formulario: nombre, email, contraseña
- [ ] Validación de email único
- [ ] Contraseña mínimo 8 caracteres
- [ ] Email de verificación enviado
- [ ] Mensaje de confirmación

---

#### US-08: Login con Email

**Como** usuario registrado  
**Quiero** iniciar sesión con mi email  
**Para** acceder a mis cursos

**Criterios de Aceptación:**

- [ ] Formulario: email, contraseña
- [ ] Validación de credenciales
- [ ] Mensaje de error si falla
- [ ] Redirect a dashboard tras login exitoso
- [ ] Opción "Recordarme"

---

#### US-09: Login con Google

**Como** usuario  
**Quiero** iniciar sesión con mi cuenta de Google  
**Para** no tener que recordar otra contraseña

**Criterios de Aceptación:**

- [ ] Botón "Continuar con Google"
- [ ] Flujo OAuth 2.0
- [ ] Crear cuenta si no existe
- [ ] Vincular si el email ya existe
- [ ] Redirect a dashboard tras login

---

#### US-10: Recuperar Contraseña

**Como** usuario  
**Quiero** recuperar mi contraseña  
**Para** acceder si la olvidé

**Criterios de Aceptación:**

- [ ] Formulario con email
- [ ] Email con link de reset (expira en 1 hora)
- [ ] Página para ingresar nueva contraseña
- [ ] Confirmación de cambio exitoso

---

#### US-11: Cerrar Sesión

**Como** usuario logueado  
**Quiero** cerrar mi sesión  
**Para** proteger mi cuenta

**Criterios de Aceptación:**

- [ ] Opción en menú de usuario
- [ ] Eliminar tokens/cookies
- [ ] Redirect a home

---

### E03: Plataforma Alumno

#### US-12: Ver Dashboard de Alumno

**Como** alumno  
**Quiero** ver un resumen de mis cursos  
**Para** continuar donde lo dejé

**Criterios de Aceptación:**

- [ ] Cards de cursos adquiridos
- [ ] Barra de progreso por curso
- [ ] Botón "Continuar" que lleva a última lección
- [ ] Estado: En progreso / Completado
- [ ] Acceso rápido a certificados obtenidos

---

#### US-13: Ver Contenido de Curso

**Como** alumno  
**Quiero** ver el contenido completo del curso  
**Para** navegar por los módulos y lecciones

**Criterios de Aceptación:**

- [ ] Header con nombre del curso
- [ ] Barra de progreso general (%)
- [ ] Lista de módulos (accordion/expandible)
- [ ] Lecciones dentro de cada módulo
- [ ] Indicador de completado por lección (✓)
- [ ] Indicador de tipo (video, texto, ejercicio)

---

#### US-14: Ver Lección de Video

**Como** alumno  
**Quiero** ver una lección en video  
**Para** aprender el contenido

**Criterios de Aceptación:**

- [ ] Reproductor de video HD
- [ ] Controles: play, pause, volumen, fullscreen
- [ ] Control de velocidad (0.5x - 2x)
- [ ] Barra de progreso del video
- [ ] Marcado automático como completado al ver 90%
- [ ] Botón "Siguiente lección"
- [ ] Sidebar con lista de lecciones

---

#### US-15: Descargar Material

**Como** alumno  
**Quiero** descargar el material de la lección  
**Para** estudiar offline o tener referencia

**Criterios de Aceptación:**

- [ ] Lista de materiales descargables
- [ ] Botón de descarga por cada archivo
- [ ] Tipos: PDF, Excel, Word, etc.
- [ ] Nombre descriptivo del archivo

---

#### US-16: Ver Progreso General

**Como** alumno  
**Quiero** ver mi progreso en el curso  
**Para** saber cuánto me falta

**Criterios de Aceptación:**

- [ ] Porcentaje de completado
- [ ] Lecciones completadas vs total
- [ ] Tiempo estimado restante
- [ ] Última actividad

---

#### US-17: Acceder al Catálogo desde Plataforma

**Como** alumno  
**Quiero** ver otros cursos disponibles  
**Para** comprar más si me interesa

**Criterios de Aceptación:**

- [ ] Link en sidebar "Catálogo"
- [ ] Ver cursos no adquiridos
- [ ] Botón de compra

---

### E04: Evaluaciones

#### US-18: Realizar Examen

**Como** alumno  
**Quiero** realizar un examen del curso  
**Para** evaluar mi aprendizaje

**Criterios de Aceptación:**

- [ ] Ver instrucciones antes de iniciar
- [ ] Contador de tiempo (si aplica)
- [ ] Preguntas: multiple choice, V/F, desarrollo
- [ ] Navegación entre preguntas
- [ ] Botón "Enviar examen"
- [ ] Confirmación antes de enviar
- [ ] No permitir volver atrás tras enviar

---

#### US-19: Ver Resultado de Examen

**Como** alumno  
**Quiero** ver el resultado de mi examen  
**Para** saber si aprobé

**Criterios de Aceptación:**

- [ ] Puntaje obtenido vs puntaje máximo
- [ ] Porcentaje
- [ ] Estado: Aprobado / Desaprobado
- [ ] Respuestas correctas (si está habilitado)
- [ ] Feedback de la profesora (si hay)
- [ ] Opción de reintentar (si está habilitado)

---

#### US-20: Obtener Certificado

**Como** alumno  
**Quiero** obtener mi certificado al completar el curso  
**Para** demostrar que lo terminé

**Criterios de Aceptación:**

- [ ] Generación automática al 100% del curso
- [ ] Certificado con: nombre alumno, nombre curso, fecha
- [ ] Código único de verificación
- [ ] Descarga en PDF
- [ ] Diseño profesional con branding

---

#### US-21: Verificar Certificado

**Como** cualquier persona  
**Quiero** verificar la autenticidad de un certificado  
**Para** confirmar que es válido

**Criterios de Aceptación:**

- [ ] Página pública de verificación
- [ ] Input para código del certificado
- [ ] Mostrar datos si es válido
- [ ] Mensaje de error si no existe

---

### E05: Comunicación

#### US-22: Enviar Mensaje a la Profesora

**Como** alumno  
**Quiero** enviar un mensaje a la profesora  
**Para** hacer una consulta sobre el curso

**Criterios de Aceptación:**

- [ ] Opción en la lección (chat contextual)
- [ ] Formulario: asunto (opcional), mensaje
- [ ] Confirmación de envío
- [ ] Historial de mensajes

---

#### US-23: Ver Mensajes Recibidos

**Como** alumno  
**Quiero** ver las respuestas de la profesora  
**Para** leer sus respuestas

**Criterios de Aceptación:**

- [ ] Bandeja de entrada
- [ ] Indicador de no leídos
- [ ] Vista de conversación
- [ ] Marcar como leído

---

#### US-24: Crear Ticket de Soporte

**Como** alumno  
**Quiero** crear un reclamo o consulta formal  
**Para** resolver un problema

**Criterios de Aceptación:**

- [ ] Formulario: asunto, descripción, prioridad
- [ ] Categorías: técnico, pago, contenido, otro
- [ ] Confirmación de creación
- [ ] Número de ticket

---

#### US-25: Ver Estado de Tickets

**Como** alumno  
**Quiero** ver el estado de mis tickets  
**Para** saber si fueron resueltos

**Criterios de Aceptación:**

- [ ] Lista de tickets con estado
- [ ] Estados: Abierto, En progreso, Resuelto
- [ ] Ver historial de respuestas
- [ ] Responder ticket

---

#### US-26: Ver Calendario

**Como** alumno  
**Quiero** ver el calendario del curso  
**Para** saber fechas importantes

**Criterios de Aceptación:**

- [ ] Vista mensual del calendario
- [ ] Eventos: clases en vivo, fechas límite
- [ ] Click en evento muestra detalles
- [ ] Link a reunión (Zoom/Meet) si aplica

---

### E06: Panel Profesora

#### US-27: Ver Dashboard de Profesora

**Como** profesora  
**Quiero** ver un resumen de mi academia  
**Para** tener visión general del negocio

**Criterios de Aceptación:**

- [ ] Métricas: alumnos activos, ingresos del mes
- [ ] Progreso promedio de alumnos
- [ ] Tareas pendientes de corregir
- [ ] Mensajes sin responder
- [ ] Próximos eventos

---

#### US-28: Crear Nuevo Curso

**Como** profesora  
**Quiero** crear un nuevo curso  
**Para** venderlo en la plataforma

**Criterios de Aceptación:**

- [ ] Formulario: título, descripción, precio
- [ ] Subir imagen de portada
- [ ] Agregar video de preview
- [ ] Configurar como borrador o publicado
- [ ] SEO: meta título y descripción

---

#### US-29: Gestionar Módulos

**Como** profesora  
**Quiero** crear y organizar módulos  
**Para** estructurar el contenido

**Criterios de Aceptación:**

- [ ] Crear módulo con título y descripción
- [ ] Reordenar módulos (drag & drop)
- [ ] Editar módulo existente
- [ ] Eliminar módulo (con confirmación)

---

#### US-30: Gestionar Lecciones

**Como** profesora  
**Quiero** crear lecciones dentro de un módulo  
**Para** agregar el contenido

**Criterios de Aceptación:**

- [ ] Crear lección con título
- [ ] Tipo: video, texto, ejercicio, link
- [ ] Subir video o pegar URL (YouTube/Vimeo)
- [ ] Editor de texto para contenido
- [ ] Subir materiales descargables
- [ ] Reordenar lecciones
- [ ] Marcar como preview gratuito

---

#### US-31: Crear Examen

**Como** profesora  
**Quiero** crear exámenes para las lecciones  
**Para** evaluar a los alumnos

**Criterios de Aceptación:**

- [ ] Asociar examen a una lección
- [ ] Agregar preguntas de diferentes tipos
- [ ] Definir respuestas correctas
- [ ] Configurar puntaje por pregunta
- [ ] Configurar nota de aprobación
- [ ] Configurar intentos máximos

---

#### US-32: Corregir Exámenes

**Como** profesora  
**Quiero** corregir exámenes de desarrollo  
**Para** calificar a los alumnos

**Criterios de Aceptación:**

- [ ] Ver lista de exámenes pendientes
- [ ] Ver respuestas del alumno
- [ ] Asignar puntaje por pregunta
- [ ] Agregar feedback general
- [ ] Marcar como corregido
- [ ] Notificar al alumno

---

#### US-33: Ver Lista de Alumnos

**Como** profesora  
**Quiero** ver todos mis alumnos  
**Para** gestionar mi base de datos

**Criterios de Aceptación:**

- [ ] Tabla con: nombre, email, cursos, progreso
- [ ] Filtros: por curso, por estado
- [ ] Búsqueda por nombre/email
- [ ] Ordenar por columnas
- [ ] Paginación

---

#### US-34: Ver CRM de Alumnos

**Como** profesora  
**Quiero** ver el estado comercial de los alumnos  
**Para** hacer seguimiento de ventas

**Criterios de Aceptación:**

- [ ] Filtros: en carrito, pagaron, cursando, finalizaron
- [ ] Contador por cada estado
- [ ] Ver detalle de cada alumno
- [ ] Historial de pagos
- [ ] Botón para contactar por email

---

#### US-35: Exportar Datos de Alumnos

**Como** profesora  
**Quiero** exportar la lista de alumnos  
**Para** trabajar con los datos externamente

**Criterios de Aceptación:**

- [ ] Botón "Exportar a Excel"
- [ ] Incluir: nombre, email, cursos, estado, progreso
- [ ] Respetar filtros activos
- [ ] Descarga automática del archivo

---

#### US-36: Responder Mensajes

**Como** profesora  
**Quiero** responder mensajes de alumnos  
**Para** resolver sus dudas

**Criterios de Aceptación:**

- [ ] Bandeja de entrada centralizada
- [ ] Ver mensaje original
- [ ] Campo para escribir respuesta
- [ ] Enviar respuesta
- [ ] Marcar como resuelto

---

#### US-37: Gestionar Tickets

**Como** profesora  
**Quiero** gestionar tickets de soporte  
**Para** resolver problemas de alumnos

**Criterios de Aceptación:**

- [ ] Ver todos los tickets
- [ ] Filtrar por estado y prioridad
- [ ] Cambiar estado del ticket
- [ ] Responder ticket
- [ ] Historial de conversación

---

#### US-38: Gestionar Calendario

**Como** profesora  
**Quiero** crear eventos en el calendario  
**Para** programar clases en vivo

**Criterios de Aceptación:**

- [ ] Crear evento: título, fecha, hora
- [ ] Tipo: clase en vivo, fecha límite, examen
- [ ] Agregar link de reunión
- [ ] Asociar a un curso
- [ ] Editar/eliminar evento
- [ ] Visible para alumnos del curso

---

#### US-39: Crear Anuncios

**Como** profesora  
**Quiero** enviar anuncios a los alumnos  
**Para** comunicar novedades

**Criterios de Aceptación:**

- [ ] Crear anuncio: título, mensaje
- [ ] Seleccionar audiencia: todos o por curso
- [ ] Opción de enviar también por email
- [ ] Fecha de publicación
- [ ] Ver historial de anuncios

---

### E07: CRM

#### US-40: Ver Pipeline de Ventas

**Como** profesora  
**Quiero** ver el embudo de ventas  
**Para** entender mi proceso comercial

**Criterios de Aceptación:**

- [ ] Vista de pipeline/kanban
- [ ] Columnas: carrito abandonado, pago pendiente, pagado
- [ ] Número de alumnos por etapa
- [ ] Valor monetario por etapa

---

#### US-41: Recuperar Carrito Abandonado

**Como** profesora  
**Quiero** contactar a quienes abandonaron el carrito  
**Para** intentar cerrar la venta

**Criterios de Aceptación:**

- [ ] Lista de carritos abandonados (>24h)
- [ ] Email del usuario
- [ ] Cursos en el carrito
- [ ] Botón para enviar email de recordatorio
- [ ] Template de email predefinido

---

### E08: Analytics (Largo Plazo)

#### US-42: Ver Analytics de Cursos

**Como** profesora  
**Quiero** ver métricas de consumo de mis cursos  
**Para** mejorar el contenido

**Criterios de Aceptación:**

- [ ] Tasa de completado por curso
- [ ] Tasa de abandono por módulo/lección
- [ ] Tiempo promedio por lección
- [ ] Lecciones más vistas
- [ ] Puntos de abandono

---

#### US-43: Ver Reportes de Ingresos

**Como** profesora  
**Quiero** ver reportes de ventas  
**Para** entender mi negocio

**Criterios de Aceptación:**

- [ ] Ingresos por período (día, semana, mes)
- [ ] Ventas por curso
- [ ] Gráfico de evolución
- [ ] Comparativa con período anterior

---

## 3. Flujos de Usuario

### 3.1 Flujo: Compra de Curso (Nuevo Usuario)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         FLUJO DE COMPRA - NUEVO USUARIO                     │
└─────────────────────────────────────────────────────────────────────────────┘

    ┌─────────┐
    │  START  │
    └────┬────┘
         │
         ▼
    ┌─────────────┐
    │  Visitar    │
    │    Home     │
    └──────┬──────┘
           │
           ▼
    ┌─────────────┐     ┌─────────────┐
    │  Navegar    │────▶│    Ver      │
    │  Catálogo   │     │   Curso     │
    └─────────────┘     └──────┬──────┘
                               │
                               ▼
                        ┌─────────────┐
                        │  Agregar    │
                        │ al Carrito  │
                        └──────┬──────┘
                               │
                               ▼
                        ┌─────────────┐
                        │    Ver      │
                        │  Carrito    │
                        └──────┬──────┘
                               │
                               ▼
                        ┌─────────────┐
                        │  Checkout   │
                        └──────┬──────┘
                               │
                               ▼
                    ┌──────────────────┐
                    │ ¿Está logueado?  │
                    └────────┬─────────┘
                             │
              ┌──────────────┴──────────────┐
              │ NO                          │ SI
              ▼                             ▼
    ┌─────────────────┐           ┌─────────────────┐
    │   Registro /    │           │   Continuar     │
    │     Login       │           │   Checkout      │
    └────────┬────────┘           └────────┬────────┘
             │                             │
             └──────────────┬──────────────┘
                            │
                            ▼
                    ┌─────────────────┐
                    │  Seleccionar    │
                    │ Método de Pago  │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │    Pagar en     │
                    │    Provider     │
                    └────────┬────────┘
                             │
                             ▼
                  ┌────────────────────┐
                  │  ¿Pago Aprobado?   │
                  └──────────┬─────────┘
                             │
              ┌──────────────┴──────────────┐
              │ NO                          │ SI
              ▼                             ▼
    ┌─────────────────┐           ┌─────────────────┐
    │   Mostrar       │           │   Crear         │
    │   Error         │           │  Enrollment     │
    └─────────────────┘           └────────┬────────┘
                                           │
                                           ▼
                                  ┌─────────────────┐
                                  │ Email de        │
                                  │ Confirmación    │
                                  └────────┬────────┘
                                           │
                                           ▼
                                  ┌─────────────────┐
                                  │  Redirect a     │
                                  │  "Mis Cursos"   │
                                  └────────┬────────┘
                                           │
                                           ▼
                                      ┌─────────┐
                                      │   END   │
                                      └─────────┘
```

### 3.2 Flujo: Consumo de Curso

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         FLUJO DE CONSUMO DE CURSO                           │
└─────────────────────────────────────────────────────────────────────────────┘

    ┌─────────┐
    │  START  │
    └────┬────┘
         │
         ▼
    ┌─────────────┐
    │   Login     │
    │   Alumno    │
    └──────┬──────┘
           │
           ▼
    ┌─────────────┐
    │  Dashboard  │
    │ "Mis Cursos"│
    └──────┬──────┘
           │
           ▼
    ┌─────────────┐
    │  Seleccionar│
    │    Curso    │
    └──────┬──────┘
           │
           ▼
    ┌─────────────┐
    │   Vista de  │
    │    Curso    │
    │  (módulos)  │
    └──────┬──────┘
           │
           ▼
    ┌─────────────┐
    │ Seleccionar │
    │   Lección   │
    └──────┬──────┘
           │
           ▼
    ┌─────────────────┐
    │  ¿Tipo de       │
    │   Lección?      │
    └────────┬────────┘
             │
    ┌────────┼────────┬────────────┐
    │        │        │            │
    ▼        ▼        ▼            ▼
┌───────┐ ┌───────┐ ┌───────┐ ┌───────────┐
│ VIDEO │ │ TEXTO │ │ LINK  │ │ EJERCICIO │
└───┬───┘ └───┬───┘ └───┬───┘ └─────┬─────┘
    │         │         │           │
    ▼         ▼         ▼           ▼
┌───────┐ ┌───────┐ ┌───────┐ ┌───────────┐
│  Ver  │ │  Leer │ │Abrir  │ │ Completar │
│ Video │ │Contenido│ │Externo│ │ Ejercicio │
└───┬───┘ └───┬───┘ └───┬───┘ └─────┬─────┘
    │         │         │           │
    └─────────┴────┬────┴───────────┘
                   │
                   ▼
           ┌───────────────┐
           │    Marcar     │
           │  Completado   │
           └───────┬───────┘
                   │
                   ▼
           ┌───────────────┐
           │   Actualizar  │
           │    Progreso   │
           └───────┬───────┘
                   │
                   ▼
         ┌───────────────────┐
         │ ¿Más lecciones?   │
         └─────────┬─────────┘
                   │
        ┌──────────┴──────────┐
        │ SI                  │ NO
        ▼                     ▼
┌───────────────┐     ┌───────────────┐
│  Siguiente    │     │  ¿Progreso    │
│   Lección     │     │   = 100%?     │
└───────┬───────┘     └───────┬───────┘
        │                     │
        │              ┌──────┴──────┐
        │              │ NO          │ SI
        │              ▼             ▼
        │      ┌───────────┐  ┌───────────────┐
        │      │  Volver   │  │   Generar     │
        │      │ Dashboard │  │  Certificado  │
        │      └───────────┘  └───────┬───────┘
        │                             │
        └──────────────┬──────────────┘
                       │
                       ▼
                  ┌─────────┐
                  │   END   │
                  └─────────┘
```

### 3.3 Flujo: Examen

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              FLUJO DE EXAMEN                                │
└─────────────────────────────────────────────────────────────────────────────┘

    ┌─────────┐
    │  START  │
    └────┬────┘
         │
         ▼
    ┌─────────────┐
    │  Acceder a  │
    │   Lección   │
    │  con Examen │
    └──────┬──────┘
           │
           ▼
    ┌─────────────┐
    │    Ver      │
    │Instrucciones│
    └──────┬──────┘
           │
           ▼
    ┌─────────────────┐
    │ ¿Tiene intentos │
    │  disponibles?   │
    └────────┬────────┘
             │
    ┌────────┴────────┐
    │ NO              │ SI
    ▼                 ▼
┌─────────┐    ┌─────────────┐
│ Mostrar │    │   Iniciar   │
│ Mensaje │    │   Examen    │
│Sin Retry│    └──────┬──────┘
└─────────┘           │
                      ▼
               ┌─────────────┐
               │  Mostrar    │
               │  Pregunta   │
               └──────┬──────┘
                      │
                      ▼
               ┌─────────────┐
               │  Responder  │
               │  Pregunta   │
               └──────┬──────┘
                      │
                      ▼
            ┌──────────────────┐
            │ ¿Más preguntas?  │
            └────────┬─────────┘
                     │
          ┌──────────┴──────────┐
          │ SI                  │ NO
          ▼                     ▼
   ┌─────────────┐      ┌─────────────┐
   │  Siguiente  │      │   Revisar   │
   │  Pregunta   │      │  Respuestas │
   └──────┬──────┘      └──────┬──────┘
          │                    │
          └────────────────────┤
                               │
                               ▼
                       ┌─────────────┐
                       │   Enviar    │
                       │   Examen    │
                       └──────┬──────┘
                              │
                              ▼
                 ┌────────────────────┐
                 │  ¿Tipo de examen?  │
                 └──────────┬─────────┘
                            │
             ┌──────────────┴──────────────┐
             │ AUTO                        │ MANUAL
             ▼                             ▼
     ┌───────────────┐            ┌───────────────┐
     │   Calificar   │            │   Enviar a    │
     │ Automático    │            │  Corrección   │
     └───────┬───────┘            └───────┬───────┘
             │                            │
             ▼                            ▼
     ┌───────────────┐            ┌───────────────┐
     │   Mostrar     │            │   Esperar     │
     │  Resultado    │            │  Calificación │
     └───────┬───────┘            └───────┬───────┘
             │                            │
             └──────────────┬─────────────┘
                            │
                            ▼
                  ┌───────────────────┐
                  │   ¿Aprobado?      │
                  └─────────┬─────────┘
                            │
             ┌──────────────┴──────────────┐
             │ NO                          │ SI
             ▼                             ▼
     ┌───────────────┐            ┌───────────────┐
     │   ¿Reintentar?│            │   Continuar   │
     │   (si puede)  │            │    Curso      │
     └───────────────┘            └───────────────┘
                            │
                            ▼
                       ┌─────────┐
                       │   END   │
                       └─────────┘
```

### 3.4 Flujo: Profesora - Crear Curso

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       FLUJO DE CREACIÓN DE CURSO                            │
└─────────────────────────────────────────────────────────────────────────────┘

    ┌─────────┐
    │  START  │
    └────┬────┘
         │
         ▼
    ┌─────────────┐
    │   Login     │
    │  Profesora  │
    └──────┬──────┘
           │
           ▼
    ┌─────────────┐
    │  Dashboard  │
    │   Admin     │
    └──────┬──────┘
           │
           ▼
    ┌─────────────┐
    │  Ir a       │
    │ "Mis Cursos"│
    └──────┬──────┘
           │
           ▼
    ┌─────────────┐
    │  Click      │
    │"Nuevo Curso"│
    └──────┬──────┘
           │
           ▼
    ┌─────────────────────────────────────────┐
    │           PASO 1: INFO BÁSICA           │
    │  - Título                               │
    │  - Descripción                          │
    │  - Precio                               │
    │  - Imagen de portada                    │
    │  - Video preview                        │
    └────────────────────┬────────────────────┘
                         │
                         ▼
    ┌─────────────────────────────────────────┐
    │           PASO 2: MÓDULOS               │
    │  ┌─────────────────────────────────┐    │
    │  │ + Agregar Módulo               │    │
    │  ├─────────────────────────────────┤    │
    │  │ Módulo 1: Introducción    [≡]  │    │
    │  │ Módulo 2: Fundamentos     [≡]  │    │
    │  │ Módulo 3: Avanzado        [≡]  │    │
    │  └─────────────────────────────────┘    │
    │         (Drag & Drop para reordenar)    │
    └────────────────────┬────────────────────┘
                         │
                         ▼
    ┌─────────────────────────────────────────┐
    │           PASO 3: LECCIONES             │
    │  Por cada módulo:                       │
    │  ┌─────────────────────────────────┐    │
    │  │ + Agregar Lección              │    │
    │  ├─────────────────────────────────┤    │
    │  │ 📹 Lección 1: Bienvenida       │    │
    │  │ 📄 Lección 2: Material         │    │
    │  │ ✏️ Lección 3: Ejercicio        │    │
    │  └─────────────────────────────────┘    │
    │                                         │
    │  Editor de lección:                     │
    │  - Título                               │
    │  - Tipo (video/texto/ejercicio)        │
    │  - Contenido (subir video o texto)     │
    │  - Materiales descargables             │
    └────────────────────┬────────────────────┘
                         │
                         ▼
    ┌─────────────────────────────────────────┐
    │         PASO 4: EXÁMENES (opcional)     │
    │  - Seleccionar lección                  │
    │  - Crear preguntas                      │
    │  - Configurar aprobación                │
    └────────────────────┬────────────────────┘
                         │
                         ▼
    ┌─────────────────────────────────────────┐
    │           PASO 5: CONFIGURACIÓN         │
    │  - Visibilidad (borrador/publicado)    │
    │  - FAQs                                 │
    │  - SEO (meta title, description)        │
    └────────────────────┬────────────────────┘
                         │
                         ▼
                 ┌───────────────┐
                 │   Guardar     │
                 │    Curso      │
                 └───────┬───────┘
                         │
                         ▼
               ┌───────────────────┐
               │   ¿Publicar?      │
               └─────────┬─────────┘
                         │
          ┌──────────────┴──────────────┐
          │ NO                          │ SI
          ▼                             ▼
   ┌───────────────┐           ┌───────────────┐
   │   Guardar     │           │   Publicar    │
   │ como Borrador │           │   Curso       │
   └───────┬───────┘           └───────┬───────┘
           │                           │
           └──────────────┬────────────┘
                          │
                          ▼
                     ┌─────────┐
                     │   END   │
                     └─────────┘
```

---

## 4. Wireframes de Referencia

### 4.1 Web de Venta - Home

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  [Logo]                    Cursos   Sobre Mí   Contacto     [🛒] [Login]   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│                    ╔═══════════════════════════════════╗                    │
│                    ║                                   ║                    │
│                    ║      APRENDE [TEMA] CONMIGO       ║                    │
│                    ║                                   ║                    │
│                    ║   Cursos online que transforman   ║                    │
│                    ║                                   ║                    │
│                    ║       [ Ver Cursos ]              ║                    │
│                    ╚═══════════════════════════════════╝                    │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                           NUESTROS CURSOS                                   │
│                                                                             │
│   ┌─────────────┐   ┌─────────────┐   ┌─────────────┐                      │
│   │   [IMG]     │   │   [IMG]     │   │   [IMG]     │                      │
│   │             │   │             │   │             │                      │
│   │  Curso 1    │   │  Curso 2    │   │  Curso 3    │                      │
│   │  $XXX       │   │  $XXX       │   │  $XXX       │                      │
│   │ [Ver más]   │   │ [Ver más]   │   │ [Ver más]   │                      │
│   └─────────────┘   └─────────────┘   └─────────────┘                      │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                         CONOCE A TU PROFESORA                               │
│                                                                             │
│   ┌───────────────────────────────────────────────────────────────────┐    │
│   │                                                                   │    │
│   │    [FOTO]        Nombre de la Profesora                          │    │
│   │                  Breve descripción y trayectoria...              │    │
│   │                                                                   │    │
│   │                  ▶️ [VIDEO DE PRESENTACIÓN]                       │    │
│   │                                                                   │    │
│   └───────────────────────────────────────────────────────────────────┘    │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                        LO QUE DICEN MIS ALUMNOS                             │
│                                                                             │
│   ┌─────────────┐   ┌─────────────┐   ┌─────────────┐                      │
│   │ ⭐⭐⭐⭐⭐    │   │ ⭐⭐⭐⭐⭐    │   │ ⭐⭐⭐⭐⭐    │                      │
│   │ "Excelente  │   │ "Muy claro  │   │ "Lo mejor   │                      │
│   │  curso..."  │   │  todo..."   │   │  que vi..." │                      │
│   │ - María G.  │   │ - Juan P.   │   │ - Ana L.    │                      │
│   └─────────────┘   └─────────────┘   └─────────────┘                      │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                           ¿TENÉS DUDAS?                                     │
│                                                                             │
│              [ Escribinos por WhatsApp ]  [ Enviar Email ]                 │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                              FOOTER                                         │
│   Logo   |   Links   |   Redes Sociales   |   © 2025                       │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 4.2 Plataforma Alumno - Mis Cursos

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  [Logo]                                              [🔔] [👤 Nombre ▼]    │
├────────────────┬────────────────────────────────────────────────────────────┤
│                │                                                            │
│   🏠 Home      │                    MIS CURSOS                              │
│                │                                                            │
│   📚 Mis Cursos│   ┌────────────────────────────────────────────────────┐  │
│                │   │  ┌──────┐                                          │  │
│   🛒 Catálogo  │   │  │[IMG] │  Curso: Nombre del Curso                 │  │
│                │   │  │      │                                          │  │
│   📅 Calendario│   │  └──────┘  ████████████░░░░░░ 65%                  │  │
│                │   │                                                    │  │
│   ────────────│   │            [Continuar donde lo dejé]               │  │
│                │   └────────────────────────────────────────────────────┘  │
│   👤 Perfil    │                                                            │
│                │   ┌────────────────────────────────────────────────────┐  │
│   💳 Pagos     │   │  ┌──────┐                                          │  │
│                │   │  │[IMG] │  Curso: Otro Curso                       │  │
│   ❓ Soporte   │   │  │      │                                          │  │
│                │   │  └──────┘  ████████████████████ 100% ✅            │  │
│   🚪 Salir     │   │                                                    │  │
│                │   │            [Ver Certificado]                       │  │
│                │   └────────────────────────────────────────────────────┘  │
│                │                                                            │
└────────────────┴────────────────────────────────────────────────────────────┘
```

### 4.3 Plataforma Alumno - Vista de Lección

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  [Logo]                                              [🔔] [👤 Nombre ▼]    │
├────────────────┬────────────────────────────────────────────────────────────┤
│                │                                                            │
│  ← Volver      │   ┌────────────────────────────────────────────────────┐  │
│                │   │                                                    │  │
│  MÓDULOS       │   │           ▶️  VIDEO PLAYER                         │  │
│                │   │                                                    │  │
│  ▼ Módulo 1    │   │     ┌─────────────────────────────────────┐       │  │
│    ✅ Clase 1  │   │     │                                     │       │  │
│    ✅ Clase 2  │   │     │                                     │       │  │
│    ▶️ Clase 3  │   │     │          [VIDEO]                    │       │  │
│    ○ Clase 4   │   │     │                                     │       │  │
│                │   │     │                                     │       │  │
│  ▶ Módulo 2    │   │     └─────────────────────────────────────┘       │  │
│                │   │     ▶️ ██████░░░░░░░░░░░░░░░ 3:45 / 15:00         │  │
│  ▶ Módulo 3    │   │     [0.5x] [1x] [1.5x] [2x]                       │  │
│                │   │                                                    │  │
│  ▶ Módulo 4    │   └────────────────────────────────────────────────────┘  │
│                │                                                            │
│                │   Clase 3: Nombre de la Lección                           │
│  ────────────│                                                            │
│                │   Descripción de la clase y qué aprenderás en este       │
│  PROGRESO      │   video. Texto explicativo aquí...                        │
│  ████████░░    │                                                            │
│     65%        │   📎 MATERIALES                                           │
│                │   ┌──────────────────────────────────────┐                │
│                │   │ 📄 Guía-clase-3.pdf        [Descargar]│                │
│                │   │ 📊 Ejercicios.xlsx         [Descargar]│                │
│                │   └──────────────────────────────────────┘                │
│                │                                                            │
│                │   💬 ¿Tenés dudas?  [Enviar mensaje a la profesora]       │
│                │                                                            │
│                │            [← Anterior]        [Siguiente →]              │
│                │                                                            │
└────────────────┴────────────────────────────────────────────────────────────┘
```

### 4.4 Panel Profesora - Dashboard

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  [Logo] ADMIN                                        [🔔] [👤 Profesora ▼] │
├────────────────┬────────────────────────────────────────────────────────────┤
│                │                                                            │
│  📊 Dashboard  │   DASHBOARD                                                │
│                │                                                            │
│  📚 Mis Cursos │   ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────┐ │
│                │   │  ALUMNOS   │ │  INGRESOS  │ │ PENDIENTES │ │MENSAJES│ │
│  👥 Alumnos    │   │   ACTIVOS  │ │   DEL MES  │ │  CORREGIR  │ │  NUEVOS│ │
│                │   │            │ │            │ │            │ │        │ │
│  ✅ Correcciones│   │    127     │ │  $4,500    │ │     8      │ │   3    │ │
│                │   └────────────┘ └────────────┘ └────────────┘ └────────┘ │
│  💬 Mensajes   │                                                            │
│                │   ┌────────────────────────────────────────────────────┐  │
│  🎫 Tickets    │   │  ALERTAS PENDIENTES                                │  │
│                │   │                                                    │  │
│  📅 Calendario │   │  ⚠️ 3 exámenes sin corregir hace más de 48hs      │  │
│                │   │  💬 2 mensajes sin responder                       │  │
│  📢 Anuncios   │   │  🛒 5 carritos abandonados esta semana            │  │
│                │   └────────────────────────────────────────────────────┘  │
│                │                                                            │
│                │   ┌────────────────────────────────────────────────────┐  │
│                │   │  PRÓXIMOS EVENTOS                                  │  │
│                │   │                                                    │  │
│                │   │  📅 27 Dic - Clase en vivo: Módulo 3              │  │
│                │   │  📅 30 Dic - Fecha límite: Examen Curso X         │  │
│                │   └────────────────────────────────────────────────────┘  │
│                │                                                            │
│                │   ┌────────────────────────────────────────────────────┐  │
│                │   │  PROGRESO GENERAL DE ALUMNOS                       │  │
│                │   │                                                    │  │
│                │   │  Curso A: ████████████░░░░░░ 68% promedio         │  │
│                │   │  Curso B: ██████████████░░░░ 75% promedio         │  │
│                │   │  Curso C: ████████░░░░░░░░░░ 45% promedio         │  │
│                │   └────────────────────────────────────────────────────┘  │
│                │                                                            │
└────────────────┴────────────────────────────────────────────────────────────┘
```

### 4.5 Panel Profesora - CRM Alumnos

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  [Logo] ADMIN                                        [🔔] [👤 Profesora ▼] │
├────────────────┬────────────────────────────────────────────────────────────┤
│                │                                                            │
│  📊 Dashboard  │   GESTIÓN DE ALUMNOS                    [Exportar Excel]  │
│                │                                                            │
│  📚 Mis Cursos │   ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ │
│                │   │  TODOS │ │CARRITO │ │PAGARON │ │CURSANDO│ │FINALIZ.│ │
│  👥 Alumnos ◀  │   │  127   │ │   12   │ │   89   │ │   67   │ │   22   │ │
│                │   └────────┘ └────────┘ └────────┘ └────────┘ └────────┘ │
│  ✅ Correcciones│                                                            │
│                │   🔍 [Buscar por nombre o email...        ]               │
│  💬 Mensajes   │                                                            │
│                │   ┌──────────────────────────────────────────────────────┐│
│  🎫 Tickets    │   │ Nombre        │ Email           │ Curso    │ Estado  ││
│                │   ├──────────────────────────────────────────────────────┤│
│  📅 Calendario │   │ María García  │ maria@mail.com  │ Curso A  │ Cursando││
│                │   │ Juan Pérez    │ juan@mail.com   │ Curso B  │ 100% ✅ ││
│  📢 Anuncios   │   │ Ana López     │ ana@mail.com    │ Curso A  │ Carrito ││
│                │   │ Carlos Ruiz   │ carlos@mail.com │ Curso C  │ Cursando││
│                │   │ Laura Díaz    │ laura@mail.com  │ Curso A  │ Pagado  ││
│                │   └──────────────────────────────────────────────────────┘│
│                │                                                            │
│                │   ◀ 1 2 3 4 5 ▶                                           │
│                │                                                            │
└────────────────┴────────────────────────────────────────────────────────────┘
```

---

## 5. Priorización (MoSCoW)

### Must Have (MVP)

- US-01, US-02, US-03: Home, Catálogo, Landing de curso
- US-04, US-05, US-06: Carrito y Checkout
- US-07, US-08, US-11: Registro, Login, Logout
- US-12, US-13, US-14, US-15: Dashboard alumno y ver lecciones
- US-28, US-29, US-30: Crear cursos y contenido
- US-33: Ver lista de alumnos

### Should Have (Post-MVP)

- US-09: Login con Google
- US-10: Recuperar contraseña
- US-16, US-17: Progreso y catálogo en plataforma
- US-18, US-19, US-20: Exámenes y certificados
- US-22, US-23: Mensajes
- US-27, US-31, US-32: Dashboard admin, exámenes, correcciones
- US-34, US-35: CRM y exportar datos

### Could Have (Mejoras)

- US-21: Verificar certificado público
- US-24, US-25: Tickets de soporte
- US-26, US-38: Calendario
- US-36, US-37: Mensajes y tickets admin
- US-39: Anuncios

### Won't Have (Futuro)

- US-40, US-41: Pipeline CRM avanzado
- US-42, US-43: Analytics detallados

---

## 6. Definition of Done (DoD)

Una User Story se considera **DONE** cuando:

- [ ] Código implementado y funcionando
- [ ] Tests unitarios escritos (>80% coverage)
- [ ] Code review aprobado
- [ ] Sin errores en consola
- [ ] Responsive (mobile, tablet, desktop)
- [ ] Accesibilidad básica (a11y)
- [ ] Documentación actualizada si aplica
- [ ] Desplegado en ambiente de staging
- [ ] QA aprobado
- [ ] Product Owner aprobó

---

_Documento generado para Academia Épica - Plataforma de Cursos Personalizados_
