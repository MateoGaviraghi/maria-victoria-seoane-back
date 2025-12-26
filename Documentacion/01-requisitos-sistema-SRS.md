# 📋 Documento de Requisitos del Sistema (SRS)

## Plataforma de Cursos Personalizados - Academia Épica

**Versión:** 1.0  
**Fecha:** 26 de Diciembre, 2025  
**Autor:** Academia Épica

---

## 1. Introducción

### 1.1 Propósito

Este documento define los requisitos funcionales y no funcionales para el desarrollo de una plataforma educativa completa que incluye:

- **Web de Venta de Cursos:** Canal de captación y venta
- **Plataforma del Alumno:** Consumo de contenido educativo
- **Plataforma de la Profesora/Admin:** Gestión completa del sistema

### 1.2 Alcance

El sistema permitirá a profesores/educadores vender cursos online, gestionar alumnos y contenido, mientras los estudiantes pueden comprar, consumir cursos y obtener certificaciones.

### 1.3 Definiciones y Acrónimos

| Término | Definición                       |
| ------- | -------------------------------- |
| LMS     | Learning Management System       |
| CRM     | Customer Relationship Management |
| SPA     | Single Page Application          |
| SSR     | Server Side Rendering            |

---

## 2. Descripción General del Sistema

### 2.1 Perspectiva del Producto

El sistema se compone de **3 aplicaciones principales:**

```
┌─────────────────────────────────────────────────────────────────┐
│                    ECOSISTEMA COMPLETO                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   ┌─────────────────┐   ┌─────────────────┐   ┌──────────────┐ │
│   │  WEB DE VENTA   │   │   PLATAFORMA    │   │  PLATAFORMA  │ │
│   │   (Pública)     │   │    ALUMNO       │   │  PROFESORA   │ │
│   │                 │   │   (Privada)     │   │   (Admin)    │ │
│   └────────┬────────┘   └────────┬────────┘   └──────┬───────┘ │
│            │                     │                    │         │
│            └─────────────────────┼────────────────────┘         │
│                                  │                              │
│                         ┌────────▼────────┐                     │
│                         │    BACKEND      │                     │
│                         │   (API REST)    │                     │
│                         └────────┬────────┘                     │
│                                  │                              │
│                         ┌────────▼────────┐                     │
│                         │  BASE DE DATOS  │                     │
│                         └─────────────────┘                     │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 2.2 Tipos de Usuario

| Rol                 | Descripción                          | Acceso                           |
| ------------------- | ------------------------------------ | -------------------------------- |
| **Visitante**       | Usuario no registrado                | Web de venta (pública)           |
| **Alumno**          | Usuario registrado que compra cursos | Web de venta + Plataforma alumno |
| **Profesora/Admin** | Dueña del sistema, gestiona todo     | Panel administrativo completo    |

### 2.3 Restricciones

- El sistema debe ser responsive (mobile-first)
- Debe soportar videos de alta calidad (HD)
- Pagos procesados mediante pasarela externa (MercadoPago/Stripe)
- Hosting de videos en servicio externo (Vimeo/Bunny/Cloudflare)

---

## 3. Requisitos Funcionales

### 3.1 WEB DE VENTA DE CURSOS (Pública)

#### RF-V01: Home Principal

| ID       | Requisito                                    |
| -------- | -------------------------------------------- |
| RF-V01.1 | Mostrar hero section con propuesta de valor  |
| RF-V01.2 | Sección scroll con descripción de los cursos |
| RF-V01.3 | Mostrar valores/precios de los cursos        |
| RF-V01.4 | Video de presentación del profesor           |
| RF-V01.5 | Cards de cada curso con info resumida        |
| RF-V01.6 | Sección de reseñas de alumnos                |
| RF-V01.7 | Sección de dudas con botón a contacto        |

#### RF-V02: Landing Page de Curso Individual

| ID       | Requisito                                                        |
| -------- | ---------------------------------------------------------------- |
| RF-V02.1 | Template reutilizable para todos los cursos                      |
| RF-V02.2 | Información detallada del curso (descripción, módulos, duración) |
| RF-V02.3 | Video de preview del curso                                       |
| RF-V02.4 | Precio y botón de compra                                         |
| RF-V02.5 | Temario completo con módulos y lecciones                         |
| RF-V02.6 | Reseñas específicas del curso                                    |
| RF-V02.7 | FAQ del curso                                                    |

#### RF-V03: Sistema de Carrito

| ID       | Requisito                                     |
| -------- | --------------------------------------------- |
| RF-V03.1 | Agregar cursos al carrito                     |
| RF-V03.2 | Ver resumen del carrito                       |
| RF-V03.3 | Aplicar cupones de descuento                  |
| RF-V03.4 | Proceso de checkout                           |
| RF-V03.5 | Requerir registro/login para completar compra |

#### RF-V04: Autenticación

| ID       | Requisito                       |
| -------- | ------------------------------- |
| RF-V04.1 | Registro con email y contraseña |
| RF-V04.2 | Registro/Login con Google       |
| RF-V04.3 | Recuperación de contraseña      |
| RF-V04.4 | Verificación de email           |

---

### 3.2 PLATAFORMA DEL ALUMNO (Privada)

#### RF-A01: Dashboard "Mis Cursos"

| ID       | Requisito                                  |
| -------- | ------------------------------------------ |
| RF-A01.1 | Mostrar cursos adquiridos en cards         |
| RF-A01.2 | Indicador de progreso por curso (%)        |
| RF-A01.3 | Botón "Continuar" para retomar donde quedó |
| RF-A01.4 | Estado del curso (En progreso, Completado) |

#### RF-A02: Vista de Curso

| ID       | Requisito                                  |
| -------- | ------------------------------------------ |
| RF-A02.1 | Header con nombre del curso                |
| RF-A02.2 | Barra de progreso general                  |
| RF-A02.3 | Lista de módulos expandible                |
| RF-A02.4 | Indicador de clases completadas por módulo |
| RF-A02.5 | Datos académicos del curso                 |

#### RF-A03: Vista de Módulo/Clase

| ID       | Requisito                              |
| -------- | -------------------------------------- |
| RF-A03.1 | Reproductor de video HD                |
| RF-A03.2 | Controles de velocidad de reproducción |
| RF-A03.3 | Marcado automático como completado     |
| RF-A03.4 | Material descargable (PDF, etc.)       |
| RF-A03.5 | Ejercicios opcionales                  |
| RF-A03.6 | Links externos                         |
| RF-A03.7 | Chat con el profesor                   |

#### RF-A04: Exámenes

| ID       | Requisito                                                       |
| -------- | --------------------------------------------------------------- |
| RF-A04.1 | Renderizar examen según tipo (multiple choice, V/F, desarrollo) |
| RF-A04.2 | Enviar respuestas                                               |
| RF-A04.3 | Ver calificación y feedback                                     |
| RF-A04.4 | Reintentar si está habilitado                                   |

#### RF-A05: Certificados

| ID       | Requisito                                |
| -------- | ---------------------------------------- |
| RF-A05.1 | Generación automática al completar curso |
| RF-A05.2 | Personalizado con datos del alumno       |
| RF-A05.3 | Descargable en PDF                       |
| RF-A05.4 | Código de verificación único             |

#### RF-A06: Navegación y Perfil

| ID       | Requisito                                               |
| -------- | ------------------------------------------------------- |
| RF-A06.1 | Navbar con: Home, Catálogo, Mis Cursos                  |
| RF-A06.2 | Menú de usuario: Perfil, Pagos, Reclamos, Cerrar sesión |
| RF-A06.3 | Gestión de datos personales                             |
| RF-A06.4 | Historial de pagos                                      |
| RF-A06.5 | Sistema de reclamos/dudas                               |

#### RF-A07: Calendario

| ID       | Requisito                                                 |
| -------- | --------------------------------------------------------- |
| RF-A07.1 | Vista de calendario mensual                               |
| RF-A07.2 | Mostrar eventos del curso (clases en vivo, fechas límite) |
| RF-A07.3 | Links a reuniones (Zoom/Meet)                             |

---

### 3.3 PLATAFORMA DE LA PROFESORA/ADMIN

#### RF-P01: Dashboard Principal

| ID       | Requisito                                    |
| -------- | -------------------------------------------- |
| RF-P01.1 | Métricas: alumnos activos, progreso promedio |
| RF-P01.2 | Tareas pendientes de corregir                |
| RF-P01.3 | Alertas de chat sin responder                |
| RF-P01.4 | Próximos eventos del calendario              |
| RF-P01.5 | Resumen de ventas                            |

#### RF-P02: Gestor de Cursos (Course Builder)

| ID       | Requisito                                    |
| -------- | -------------------------------------------- |
| RF-P02.1 | CRUD de cursos                               |
| RF-P02.2 | Crear/editar/reordenar módulos (drag & drop) |
| RF-P02.3 | Crear/editar clases                          |
| RF-P02.4 | Subir videos o pegar links (YouTube/Vimeo)   |
| RF-P02.5 | Editor de texto para descripciones           |
| RF-P02.6 | Cargar material descargable                  |
| RF-P02.7 | Configurar ejercicios                        |
| RF-P02.8 | Configurar exámenes                          |
| RF-P02.9 | Configurar precio y visibilidad              |

#### RF-P03: Centro de Evaluación

| ID       | Requisito                                              |
| -------- | ------------------------------------------------------ |
| RF-P03.1 | Creador de exámenes (multiple choice, V/F, desarrollo) |
| RF-P03.2 | Bandeja de corrección                                  |
| RF-P03.3 | Calificar y dar feedback                               |
| RF-P03.4 | Ver progreso individual por alumno                     |

#### RF-P04: Gestión de Alumnos (CRM)

| ID       | Requisito                                           |
| -------- | --------------------------------------------------- |
| RF-P04.1 | Base de datos de alumnos                            |
| RF-P04.2 | Filtros: en carrito, pagaron, cursando, finalizaron |
| RF-P04.3 | Ver detalle de cada alumno                          |
| RF-P04.4 | Contactar vía email                                 |
| RF-P04.5 | Exportar datos a Excel                              |

#### RF-P05: Centro de Mensajes

| ID       | Requisito                       |
| -------- | ------------------------------- |
| RF-P05.1 | Bandeja de entrada centralizada |
| RF-P05.2 | Responder mensajes de alumnos   |
| RF-P05.3 | Filtrar por curso               |
| RF-P05.4 | Marcar como resuelto            |

#### RF-P06: Gestión de Reclamos

| ID       | Requisito                        |
| -------- | -------------------------------- |
| RF-P06.1 | Ver tickets/reclamos de alumnos  |
| RF-P06.2 | Responder y cambiar estado       |
| RF-P06.3 | Historial de reclamos por alumno |

#### RF-P07: Calendario

| ID       | Requisito                                     |
| -------- | --------------------------------------------- |
| RF-P07.1 | Crear eventos (clases en vivo, fechas límite) |
| RF-P07.2 | Agregar links de Zoom/Meet                    |
| RF-P07.3 | Sincronizar con calendario del alumno         |

#### RF-P08: Sistema de Anuncios

| ID       | Requisito                             |
| -------- | ------------------------------------- |
| RF-P08.1 | Crear anuncios para todos los alumnos |
| RF-P08.2 | Crear anuncios por curso              |
| RF-P08.3 | Notificación por email opcional       |

#### RF-P09: Analytics (Largo plazo)

| ID       | Requisito                    |
| -------- | ---------------------------- |
| RF-P09.1 | Métricas de consumo de video |
| RF-P09.2 | Tasa de abandono por módulo  |
| RF-P09.3 | Tiempo promedio por clase    |
| RF-P09.4 | Engagement por contenido     |

---

## 4. Requisitos No Funcionales

### 4.1 Rendimiento

| ID     | Requisito                                      |
| ------ | ---------------------------------------------- |
| RNF-01 | Tiempo de carga inicial < 3 segundos           |
| RNF-02 | Videos deben iniciar reproducción < 2 segundos |
| RNF-03 | API response time < 500ms promedio             |

### 4.2 Seguridad

| ID     | Requisito                                                    |
| ------ | ------------------------------------------------------------ |
| RNF-04 | HTTPS obligatorio                                            |
| RNF-05 | Autenticación JWT con refresh tokens                         |
| RNF-06 | Protección contra ataques comunes (XSS, CSRF, SQL Injection) |
| RNF-07 | Videos protegidos (signed URLs)                              |
| RNF-08 | Roles y permisos estrictos                                   |

### 4.3 Usabilidad

| ID     | Requisito                                   |
| ------ | ------------------------------------------- |
| RNF-09 | Diseño responsive (mobile, tablet, desktop) |
| RNF-10 | Interfaz intuitiva sin necesidad de manual  |
| RNF-11 | Feedback visual en todas las acciones       |

### 4.4 Disponibilidad

| ID     | Requisito                        |
| ------ | -------------------------------- |
| RNF-12 | Uptime 99.5%                     |
| RNF-13 | Backups diarios de base de datos |

### 4.5 Escalabilidad

| ID     | Requisito                                    |
| ------ | -------------------------------------------- |
| RNF-14 | Soportar 1000+ alumnos concurrentes          |
| RNF-15 | Arquitectura preparada para múltiples cursos |

---

## 5. Integraciones Externas

| Servicio                 | Propósito                 |
| ------------------------ | ------------------------- |
| **Google OAuth**         | Login social              |
| **MercadoPago / Stripe** | Procesamiento de pagos    |
| **Vimeo / Bunny.net**    | Hosting de videos         |
| **Resend / SendGrid**    | Envío de emails           |
| **Cloudflare**           | CDN y protección          |
| **Google Calendar**      | Sincronización de eventos |

---

## 6. Entregables

1. ✅ Documentación de Requisitos (este documento)
2. 📐 Documentación de Arquitectura Técnica
3. 📝 User Stories y Flujos de Usuario
4. 🎨 Mockup Visual (Fase 2)
5. ⚙️ Backend API (Fase 3)
6. 💻 Frontend Application (Fase 4)

---

## 7. Aprobaciones

| Rol           | Nombre | Fecha | Firma |
| ------------- | ------ | ----- | ----- |
| Product Owner |        |       |       |
| Tech Lead     |        |       |       |
| Stakeholder   |        |       |       |

---

_Documento generado para Academia Épica - Plataforma de Cursos Personalizados_
