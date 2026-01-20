# 📧 Plan de Acción: Sistema de Emails

## Resumen

Sistema completo de emails para el negocio de cursos, incluyendo emails transaccionales (obligatorios) y emails de marketing (automatizados).

---

## 🎯 Objetivos

1. **Comunicación efectiva** con el cliente en cada paso
2. **Aumentar conversiones** con emails de carrito abandonado
3. **Fidelización** con emails de bienvenida y seguimiento
4. **Seguridad** con verificación de email

---

## 📋 Fases de Implementación

### FASE 2.1 - Emails Transaccionales (Obligatorios)

| #   | Email                      | Trigger                          | Prioridad |
| --- | -------------------------- | -------------------------------- | --------- |
| 1   | **Verificación de Email**  | Usuario se registra              | 🔴 Alta   |
| 2   | **Bienvenida**             | Email verificado                 | 🔴 Alta   |
| 3   | **Confirmación de Compra** | Pago aprobado                    | 🔴 Alta   |
| 4   | **Acceso al Curso**        | Pago aprobado (con credenciales) | 🔴 Alta   |
| 5   | **Recuperar Contraseña**   | Usuario solicita reset           | 🔴 Alta   |
| 6   | **Orden Cancelada**        | Pago rechazado/cancelado         | 🟡 Media  |

### FASE 2.2 - Emails de Marketing (Automatizados)

| #   | Email                        | Trigger                                  | Prioridad |
| --- | ---------------------------- | ---------------------------------------- | --------- |
| 7   | **Carrito Abandonado (1h)**  | Carrito con items + 1 hora sin acción    | 🔴 Alta   |
| 8   | **Carrito Abandonado (24h)** | Segundo recordatorio + cupón             | 🔴 Alta   |
| 9   | **Carrito Abandonado (72h)** | Último intento + descuento mayor         | 🟡 Media  |
| 10  | **Nuevo Cupón Disponible**   | Admin crea cupón público                 | 🟡 Media  |
| 11  | **Cupón por Vencer**         | Cupón usado pero no completó compra      | 🟡 Media  |
| 12  | **Feliz Cumpleaños**         | Fecha de nacimiento del usuario          | 🟢 Baja   |
| 13  | **Nuevo Curso Disponible**   | Se publica nuevo curso                   | 🟡 Media  |
| 14  | **Recompra**                 | 30 días después de compra (otros cursos) | 🟢 Baja   |

### FASE 2.3 - Emails Administrativos

| #   | Email              | Trigger                | Destinatario   |
| --- | ------------------ | ---------------------- | -------------- |
| 15  | **Nueva Venta**    | Pago aprobado          | María Victoria |
| 16  | **Nuevo Registro** | Usuario se registra    | María Victoria |
| 17  | **Nuevo Mensaje**  | Cliente envía consulta | María Victoria |

---

## 🔧 Arquitectura Técnica

### Módulos a Crear

```
src/modules/emails/
├── emails.module.ts
├── emails.service.ts          # Servicio principal de envío
├── emails.controller.ts       # Admin: ver logs, reenviar
├── templates/                 # Templates HTML
│   ├── base.template.ts       # Layout base
│   ├── verification.template.ts
│   ├── welcome.template.ts
│   ├── purchase-confirmed.template.ts
│   ├── course-access.template.ts
│   ├── password-reset.template.ts
│   ├── cart-abandoned.template.ts
│   ├── new-coupon.template.ts
│   └── birthday.template.ts
├── dto/
│   └── email.dto.ts
└── queues/                    # Cola de emails (BullMQ)
    ├── email.processor.ts
    └── email.queue.ts
```

### Modelo de Base de Datos

```prisma
model EmailLog {
  id          String      @id @default(uuid())
  userId      String?
  user        User?       @relation(fields: [userId], references: [id])
  to          String      // Email destinatario
  type        EmailType   // Tipo de email
  subject     String
  status      EmailStatus @default(PENDING)
  sentAt      DateTime?
  openedAt    DateTime?   // Tracking de apertura
  clickedAt   DateTime?   // Tracking de clicks
  error       String?
  metadata    Json?       // Datos adicionales
  createdAt   DateTime    @default(now())

  @@map("email_logs")
}

enum EmailType {
  VERIFICATION
  WELCOME
  PURCHASE_CONFIRMED
  COURSE_ACCESS
  PASSWORD_RESET
  ORDER_CANCELLED
  CART_ABANDONED_1H
  CART_ABANDONED_24H
  CART_ABANDONED_72H
  NEW_COUPON
  COUPON_EXPIRING
  BIRTHDAY
  NEW_COURSE
  RECOMPRA
  ADMIN_NEW_SALE
  ADMIN_NEW_USER
  ADMIN_NEW_MESSAGE
}

enum EmailStatus {
  PENDING
  SENT
  DELIVERED
  OPENED
  CLICKED
  FAILED
  BOUNCED
}
```

### Tecnologías

| Componente       | Tecnología                       |
| ---------------- | -------------------------------- |
| Envío de emails  | **Nodemailer**                   |
| Templates        | **Handlebars** o HTML inline     |
| Cola de trabajos | **BullMQ** + Redis               |
| Scheduler        | **@nestjs/schedule** (cron jobs) |
| SMTP Provider    | Gmail / SendGrid / AWS SES       |

---

## 📝 Detalle de Cada Email

### 1. Verificación de Email

```
Asunto: Verifica tu email - [Nombre del Negocio]
Contenido:
- Saludo personalizado
- Botón "Verificar mi email" (link con token)
- Expira en 24 horas
```

### 2. Bienvenida

```
Asunto: ¡Bienvenido/a [Nombre]! 🎉
Contenido:
- Agradecimiento por registrarse
- Breve presentación de María Victoria
- CTA: Ver cursos disponibles
```

### 3. Confirmación de Compra

```
Asunto: ✅ Compra confirmada - Orden #[ID]
Contenido:
- Resumen de la compra
- Cursos comprados con precios
- Total pagado
- Próximos pasos
```

### 4. Acceso al Curso

```
Asunto: 🎓 ¡Tu acceso al curso está listo!
Contenido:
- Nombre del curso
- Credenciales de acceso (usuario/contraseña de la plataforma externa)
- Link a la plataforma
- Instrucciones de acceso
- Contacto de soporte
```

### 5. Recuperar Contraseña

```
Asunto: Recupera tu contraseña
Contenido:
- Link para resetear (expira en 1 hora)
- Si no lo solicitaste, ignorar
```

### 6. Orden Cancelada

```
Asunto: Tu orden ha sido cancelada
Contenido:
- Motivo de cancelación
- CTA: Intentar nuevamente
- Contacto de soporte
```

### 7-9. Carrito Abandonado (Secuencia)

**Email 1 (1 hora):**

```
Asunto: ¿Olvidaste algo? 🛒
Contenido:
- Recordatorio de items en carrito
- CTA: Completar compra
```

**Email 2 (24 horas):**

```
Asunto: Tu carrito te extraña + 10% OFF 🎁
Contenido:
- Items en carrito
- Cupón automático 10% OFF
- Urgencia: cupón válido 48h
```

**Email 3 (72 horas):**

```
Asunto: Última oportunidad: 15% OFF solo por hoy
Contenido:
- Items en carrito
- Cupón 15% OFF
- Testimonios de otros alumnos
- Expira en 24h
```

### 10. Nuevo Cupón Disponible

```
Asunto: 🎉 ¡Tenemos un regalo para ti!
Contenido:
- Código del cupón
- Porcentaje/monto de descuento
- Fecha de vencimiento
- CTA: Usar ahora
```

### 11. Cupón por Vencer

```
Asunto: ⏰ Tu cupón vence mañana
Contenido:
- Recordatorio del cupón
- Descuento disponible
- CTA: Usar antes de que expire
```

### 12. Feliz Cumpleaños

```
Asunto: 🎂 ¡Feliz cumpleaños [Nombre]! + Regalo especial
Contenido:
- Felicitación
- Cupón especial de cumpleaños (ej: 20% OFF)
- Válido por 7 días
```

---

## ⚙️ Configuración SMTP

### Opción 1: Gmail (desarrollo/bajo volumen)

```env
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=tu_email@gmail.com
MAIL_PASSWORD=app_password_16_caracteres
MAIL_FROM="María Victoria <noreply@tudominio.com>"
```

### Opción 2: SendGrid (producción recomendado)

```env
MAIL_HOST=smtp.sendgrid.net
MAIL_PORT=587
MAIL_USER=apikey
MAIL_PASSWORD=SG.xxxx_tu_api_key
MAIL_FROM="María Victoria <noreply@tudominio.com>"
```

### Opción 3: AWS SES (alto volumen)

```env
MAIL_HOST=email-smtp.us-east-1.amazonaws.com
MAIL_PORT=587
MAIL_USER=tu_access_key
MAIL_PASSWORD=tu_secret_key
MAIL_FROM="María Victoria <noreply@tudominio.com>"
```

---

## 📊 Endpoints del Módulo

### Para Admin (María Victoria)

| Método | Endpoint             | Descripción                             |
| ------ | -------------------- | --------------------------------------- |
| GET    | `/emails/logs`       | Ver historial de emails enviados        |
| GET    | `/emails/logs/:id`   | Ver detalle de un email                 |
| POST   | `/emails/resend/:id` | Reenviar un email                       |
| GET    | `/emails/stats`      | Estadísticas (enviados, abiertos, etc.) |
| POST   | `/emails/test`       | Enviar email de prueba                  |
| POST   | `/emails/campaign`   | Enviar cupón/promoción a todos          |

---

## 🕐 Cron Jobs (Automatización)

| Job                    | Frecuencia     | Descripción                               |
| ---------------------- | -------------- | ----------------------------------------- |
| `checkAbandonedCarts`  | Cada 30 min    | Busca carritos abandonados y envía emails |
| `checkExpiringCoupons` | Diario 9:00 AM | Alerta de cupones por vencer              |
| `sendBirthdayEmails`   | Diario 8:00 AM | Envía felicitaciones de cumpleaños        |
| `cleanOldLogs`         | Semanal        | Limpia logs de emails > 90 días           |

---

## ✅ Checklist de Implementación

### Fase 2.1 - Transaccionales

- [ ] Configurar Nodemailer
- [ ] Crear template base HTML
- [ ] Email verificación
- [ ] Email bienvenida
- [ ] Email confirmación de compra
- [ ] Email acceso al curso
- [ ] Email recuperar contraseña
- [ ] Email orden cancelada
- [ ] Logs de emails en DB

### Fase 2.2 - Marketing

- [ ] Configurar BullMQ + Redis
- [ ] Cron job carrito abandonado
- [ ] Secuencia 3 emails carrito
- [ ] Email nuevo cupón
- [ ] Email cupón por vencer
- [ ] Email cumpleaños
- [ ] Email nuevo curso

### Fase 2.3 - Admin

- [ ] Notificación nueva venta
- [ ] Notificación nuevo registro
- [ ] Panel de logs de emails
- [ ] Estadísticas de emails

---

## 📈 Métricas a Trackear

| Métrica                           | Descripción                             |
| --------------------------------- | --------------------------------------- |
| **Tasa de apertura**              | % de emails abiertos                    |
| **Tasa de clicks**                | % de clicks en CTAs                     |
| **Conversión carrito abandonado** | % que completa compra después del email |
| **Rebotes**                       | Emails que no llegaron                  |

---

## 🎨 Diseño de Templates

Los templates tendrán:

- Logo de María Victoria
- Colores de marca
- Diseño responsive (móvil)
- Botones claros (CTA)
- Footer con redes sociales
- Link para desuscribirse (marketing)

---

**Tiempo estimado:** 2-3 días de desarrollo
