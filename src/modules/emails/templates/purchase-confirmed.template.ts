import { baseTemplate } from './base.template';

export const purchaseConfirmedTemplate = (data: {
  firstName: string;
  orderId: string;
  courses: Array<{ title: string; price: number }>;
  subtotal: number;
  discount: number;
  total: number;
  currency: string;
}) => {
  const coursesHtml = data.courses
    .map(
      (course) => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #e9ecef;">${course.title}</td>
      <td style="padding: 10px; border-bottom: 1px solid #e9ecef; text-align: right;">
        $${course.price.toLocaleString('es-AR')}
      </td>
    </tr>
  `,
    )
    .join('');

  const content = `
    <h1>¡Compra Confirmada! ✅</h1>
    
    <p>Hola ${data.firstName},</p>
    
    <p>¡Excelente noticia! Tu pago ha sido procesado exitosamente.</p>
    
    <div class="highlight">
      <p><strong>Orden #${data.orderId}</strong></p>
    </div>
    
    <h2 style="margin-top: 30px; margin-bottom: 15px; font-size: 18px; color: #2d3748;">
      Resumen de tu compra
    </h2>
    
    <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
      <thead>
        <tr style="background-color: #f8f9fa;">
          <th style="padding: 10px; text-align: left; border-bottom: 2px solid #dee2e6;">Curso</th>
          <th style="padding: 10px; text-align: right; border-bottom: 2px solid #dee2e6;">Precio</th>
        </tr>
      </thead>
      <tbody>
        ${coursesHtml}
      </tbody>
      <tfoot>
        <tr>
          <td style="padding: 10px; font-weight: bold;">Subtotal</td>
          <td style="padding: 10px; text-align: right;">$${data.subtotal.toLocaleString('es-AR')}</td>
        </tr>
        ${
          data.discount > 0
            ? `
        <tr>
          <td style="padding: 10px; color: #28a745;">Descuento</td>
          <td style="padding: 10px; text-align: right; color: #28a745;">-$${data.discount.toLocaleString('es-AR')}</td>
        </tr>
        `
            : ''
        }
        <tr style="background-color: #f8f9fa;">
          <td style="padding: 15px; font-weight: bold; font-size: 18px;">Total</td>
          <td style="padding: 15px; text-align: right; font-weight: bold; font-size: 18px; color: #667eea;">
            $${data.total.toLocaleString('es-AR')} ${data.currency}
          </td>
        </tr>
      </tfoot>
    </table>
    
    <p>En breve recibirás otro email con las credenciales de acceso a tu(s) curso(s).</p>
    
    <p>Gracias por tu confianza!</p>
    
    <p style="margin-top: 30px;">
      <strong>María Victoria Seoane</strong>
    </p>
  `;

  return baseTemplate(content, 'Tu compra ha sido confirmada');
};
