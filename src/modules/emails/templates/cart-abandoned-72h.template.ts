import { baseTemplate } from './base.template';

export const cartAbandoned72hTemplate = (data: {
  firstName: string;
  cartItems: Array<{ title: string; price: number }>;
  cartUrl: string;
  total: number;
  couponCode: string;
  discount: number;
}) => {
  const itemsHtml = data.cartItems
    .map(
      (item) => `
    <li style="margin-bottom: 10px;">
      <strong>${item.title}</strong> - $${item.price.toLocaleString('es-AR')}
    </li>
  `,
    )
    .join('');

  const discountedTotal = data.total * (1 - data.discount / 100);

  const content = `
    <h1>⏰ Última Oportunidad</h1>
    
    <p>Hola ${data.firstName},</p>
    
    <p><strong>Este es tu último chance de obtener un descuento exclusivo.</strong></p>
    
    <div class="highlight" style="background-color: #fff3cd; border-left-color: #ffc107;">
      <p style="font-size: 24px; font-weight: bold; color: #dc3545; text-align: center; margin: 0;">
        ${data.discount}% DE DESCUENTO
      </p>
      <p style="text-align: center; margin-top: 10px;">
        Cupón: <strong style="font-size: 28px; color: #dc3545;">${data.couponCode}</strong>
      </p>
      <p style="text-align: center; font-size: 16px; margin-top: 10px; color: #dc3545;">
        ⚠️ Expira en 24 horas
      </p>
    </div>
    
    <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <ul style="list-style: none; padding: 0;">
        ${itemsHtml}
      </ul>
      <div style="border-top: 2px solid #dee2e6; margin-top: 15px; padding-top: 15px;">
        <p style="text-align: right; text-decoration: line-through; color: #6c757d;">
          $${data.total.toLocaleString('es-AR')}
        </p>
        <p style="font-size: 22px; font-weight: bold; text-align: right; color: #28a745;">
          $${discountedTotal.toLocaleString('es-AR')}
        </p>
        <p style="text-align: right; color: #28a745; font-weight: bold;">
          ¡Ahorras $${(data.total - discountedTotal).toLocaleString('es-AR')}!
        </p>
      </div>
    </div>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${data.cartUrl}" class="button" style="background: linear-gradient(135deg, #dc3545 0%, #c82333 100%); font-size: 18px;">
        🔥 Aprovechar Ahora
      </a>
    </div>
    
    <p style="text-align: center; font-size: 14px; color: #6c757d;">
      No te enviaremos más recordatorios sobre estos cursos.
    </p>
  `;

  return baseTemplate(content, `Última chance: ${data.discount}% de descuento`);
};
