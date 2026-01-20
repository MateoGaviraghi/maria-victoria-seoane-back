# 📧 Sistema de Emails - Guía de Uso

## Estado de Implementación ✅

**Fase 2.1, 2.2 y 2.3 COMPLETAS**

---

## 📋 Emails Implementados

### Transaccionales (Automáticos)

| Email                     | Trigger                  | Template                         |
| ------------------------- | ------------------------ | -------------------------------- |
| ✅ Verificación de Email  | Usuario se registra      | `verification.template.ts`       |
| ✅ Bienvenida             | Email verificado         | `welcome.template.ts`            |
| ✅ Confirmación de Compra | Pago aprobado            | `purchase-confirmed.template.ts` |
| ✅ Acceso al Curso        | Pago aprobado            | `course-access.template.ts`      |
| ✅ Recuperar Contraseña   | Usuario solicita reset   | `password-reset.template.ts`     |
| ✅ Orden Cancelada        | Pago rechazado/cancelado | `order-cancelled.template.ts`    |

### Marketing (Automatizados - Cron Jobs)

| Email                       | Frecuencia     | Cupón    | Template                         |
| --------------------------- | -------------- | -------- | -------------------------------- |
| ✅ Carrito Abandonado (1h)  | Cada 30 min    | -        | `cart-abandoned-1h.template.ts`  |
| ✅ Carrito Abandonado (24h) | Cada 6 horas   | 10% OFF  | `cart-abandoned-24h.template.ts` |
| ✅ Carrito Abandonado (72h) | Cada 12 horas  | 15% OFF  | `cart-abandoned-72h.template.ts` |
| ✅ Feliz Cumpleaños         | Diario 8:00 AM | 20% OFF  | `birthday.template.ts`           |
| ✅ Nuevo Cupón              | Manual         | Variable | `new-coupon.template.ts`         |

---

## ⚙️ Configuración

### Variables de Entorno (.env)

```env
# SMTP Configuration
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=tu_email@gmail.com
MAIL_PASSWORD=tu_app_password_16_caracteres
MAIL_FROM="María Victoria Seoane <noreply@tudominio.com>"

# Frontend URL (para links en emails)
FRONTEND_URL=http://localhost:3000
```

### Obtener App Password de Gmail

1. Ve a https://myaccount.google.com/security
2. Activa "Verificación en 2 pasos"
3. Busca "Contraseñas de aplicaciones"
4. Genera una nueva para "Correo"
5. Copia el código de 16 caracteres
6. Pégalo en `MAIL_PASSWORD`

### Providers SMTP Recomendados

| Provider     | Gratis hasta | Costo después | Recomendado para     |
| ------------ | ------------ | ------------- | -------------------- |
| **Gmail**    | 500/día      | -             | Desarrollo/testing   |
| **SendGrid** | 100/día      | $19.95/mes    | Producción (pequeña) |
| **AWS SES**  | 62,000/mes   | $0.10/1000    | Producción (grande)  |
| **Mailgun**  | 5,000/mes    | $35/mes       | Producción (mediana) |

---

## 🚀 Uso

### Envío Automático (Ya Configurado)

Los emails se envían automáticamente cuando:

- ✅ Usuario se registra → Email de verificación
- ✅ Verifica su email → Email de bienvenida
- ✅ Compra un curso → Confirmación + Acceso
- ✅ Solicita reset → Email con link
- ✅ Carrito abandonado → Secuencia de 3 emails
- ✅ Es su cumpleaños → Email con cupón

### Endpoints API (Admin)

#### Ver logs de emails

```http
GET /api/emails/logs?page=1&limit=20&type=WELCOME&status=SENT
Authorization: Bearer {token}
```

**Query params:**

- `page` (opcional): Número de página
- `limit` (opcional): Items por página
- `type` (opcional): Filtrar por tipo de email
- `status` (opcional): Filtrar por estado

**Respuesta:**

```json
{
  "data": [
    {
      "id": "...",
      "to": "cliente@email.com",
      "type": "WELCOME",
      "subject": "¡Bienvenido/a!",
      "status": "SENT",
      "sentAt": "2026-01-09T...",
      "openedAt": null,
      "createdAt": "2026-01-09T..."
    }
  ],
  "meta": {
    "total": 150,
    "page": 1,
    "limit": 20,
    "totalPages": 8
  }
}
```

#### Ver estadísticas

```http
GET /api/emails/stats
Authorization: Bearer {token}
```

**Respuesta:**

```json
{
  "totalSent": 1250,
  "pending": 5,
  "failed": 12,
  "openRate": 45.2,
  "clickRate": 12.8,
  "byType": {
    "VERIFICATION": 300,
    "WELCOME": 285,
    "PURCHASE_CONFIRMED": 150,
    "CART_ABANDONED_1H": 200,
    ...
  }
}
```

#### Enviar email de prueba

```http
POST /api/emails/test
Authorization: Bearer {token}
Content-Type: application/json

{
  "to": "test@email.com",
  "type": "WELCOME"
}
```

**Tipos disponibles:**

- `VERIFICATION`
- `WELCOME`
- `PURCHASE_CONFIRMED`
- `COURSE_ACCESS`
- `PASSWORD_RESET`
- `ORDER_CANCELLED`
- `CART_ABANDONED_1H`
- `CART_ABANDONED_24H`
- `CART_ABANDONED_72H`
- `NEW_COUPON`
- `BIRTHDAY`

---

## 🎨 Personalización de Templates

### Editar un Template

Los templates están en: `src/modules/emails/templates/`

Ejemplo de personalización:

```typescript
// src/modules/emails/templates/welcome.template.ts

export const welcomeTemplate = (data: {
  firstName: string;
  coursesUrl: string;
}) => {
  const content = `
    <h1>¡Hola ${data.firstName}! 👋</h1>
    
    <!-- PERSONALIZA AQUÍ -->
    <p>Tu mensaje personalizado...</p>
    
    <div style="text-align: center;">
      <a href="${data.coursesUrl}" class="button">
        Tu CTA personalizado
      </a>
    </div>
  `;

  return baseTemplate(content, 'Tu preheader');
};
```

### Variables Disponibles en Templates

Todas las templates tienen acceso a:

- `{{frontendUrl}}` - URL del frontend
- `{{instagramUrl}}` - Link a Instagram
- `{{whatsappUrl}}` - Link a WhatsApp
- `{{userId}}` - ID del usuario

---

## 🔧 Cron Jobs (Automatización)

### Jobs Configurados

| Job                      | Frecuencia     | Descripción                             |
| ------------------------ | -------------- | --------------------------------------- |
| `checkAbandonedCarts1h`  | Cada 30 min    | Carrito abandonado hace 1h              |
| `checkAbandonedCarts24h` | Cada 6 horas   | Carrito abandonado hace 24h + cupón 10% |
| `checkAbandonedCarts72h` | Cada 12 horas  | Carrito abandonado hace 72h + cupón 15% |
| `sendBirthdayEmails`     | Diario 8:00 AM | Cumpleaños con cupón 20%                |
| `cleanOldEmailLogs`      | Semanal        | Limpia logs > 90 días                   |

### Deshabilitar Cron Jobs (Desarrollo)

Si no quieres que se ejecuten los crons en desarrollo, comenta en `emails-cron.service.ts`:

```typescript
// @Cron(CronExpression.EVERY_30_MINUTES)
async checkAbandonedCarts1h() {
  // ...
}
```

---

## 📊 Tracking

### Estados de Email

| Estado      | Descripción                   |
| ----------- | ----------------------------- |
| `PENDING`   | Esperando envío               |
| `SENT`      | Enviado correctamente         |
| `DELIVERED` | Entregado al servidor destino |
| `OPENED`    | Usuario abrió el email        |
| `CLICKED`   | Usuario hizo click en un link |
| `FAILED`    | Error al enviar               |
| `BOUNCED`   | Email rebotado                |

**Nota:** El tracking de `OPENED` y `CLICKED` requiere configuración adicional (pixel tracking).

---

## 🐛 Debugging

### Ver logs en consola

```bash
npm run start:dev
```

Verás logs como:

```
✅ SMTP configurado correctamente
📧 [SIMULADO] Email a user@email.com - Tipo: WELCOME - Asunto: ¡Bienvenido!
✅ Email enviado a user@email.com - Tipo: VERIFICATION
```

### Simular envío sin SMTP

Si no tienes SMTP configurado, los emails se simulan automáticamente y se guardan en la base de datos con estado `SENT`.

### Ver emails en base de datos

```sql
SELECT * FROM email_logs ORDER BY "createdAt" DESC LIMIT 10;
```

---

## 🔒 Seguridad

- ✅ Emails solo a usuarios verificados (marketing)
- ✅ Rate limiting automático en cron jobs (máx 50 por ejecución)
- ✅ Links con tokens únicos y expiración
- ✅ No revelar existencia de emails en forgot password
- ✅ Logs completos de todos los envíos

---

## 📝 Próximos Pasos

### Mejoras Opcionales

1. **Tracking de Apertura/Clicks**
   - Agregar pixel tracking
   - Implementar redirects para clicks

2. **A/B Testing**
   - Probar diferentes asuntos
   - Probar diferentes CTAs

3. **Segmentación Avanzada**
   - Por intereses
   - Por comportamiento
   - Por valor del cliente

4. **Templates Dinámicos**
   - Editor visual de templates
   - Variables personalizadas

5. **Reporte Avanzado**
   - Dashboard de métricas
   - Exportar a CSV
   - Gráficos de tendencias

---

## 🆘 Troubleshooting

### Email no se envía

1. Verificar configuración SMTP en `.env`
2. Verificar que el App Password de Gmail sea correcto
3. Revisar logs en consola
4. Verificar tabla `email_logs` en BD

### Email llega a spam

1. Configurar SPF, DKIM, DMARC en tu dominio
2. Usar un provider profesional (SendGrid, AWS SES)
3. Evitar palabras spam ("gratis", "urgente", etc.)
4. Mantener ratio de bounces bajo

### Cron jobs no se ejecutan

1. Verificar que `ScheduleModule` esté importado en `app.module.ts`
2. Revisar logs de consola
3. Verificar que `EmailsCronService` esté en providers de `EmailsModule`

---

**Sistema completo de emails funcionando! 🎉**
