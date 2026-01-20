import { baseTemplate } from './base.template';

export const cartAbandoned24hTemplate = (data: {
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
    <h1>Tu carrito te extraña... 💔</h1>
    
    <p>Hola ${data.firstName},</p>
    
    <p>¡Tenemos una sorpresa para ti!</p>
    
    <div class="highlight">
      <p style="font-size: 20px; font-weight: bold; color: #667eea; text-align: center; margin: 0;">
        ${data.discount}% DE DESCUENTO 🎁
      </p>
      <p style="text-align: center; margin-top: 10px;">
        Usa el cupón: <strong style="font-size: 24px; color: #f39c12;">${data.couponCode}</strong>
      </p>
      <p style="text-align: center; font-size: 14px; margin-top: 10px; color: #6c757d;">
        Válido por 48 horas
      </p>
    </div>
    
    <p style="margin-top: 30px;">Tus cursos están esperando:</p>
    
    <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <ul style="list-style: none; padding: 0;">
        ${itemsHtml}
      </ul>
      <div style="border-top: 2px solid #dee2e6; margin-top: 15px; padding-top: 15px;">
        <p style="text-align: right; text-decoration: line-through; color: #6c757d;">
          $${data.total.toLocaleString('es-AR')}
        </p>
        <p style="font-size: 20px; font-weight: bold; text-align: right; color: #28a745;">
          $${discountedTotal.toLocaleString('es-AR')}
        </p>
      </div>
    </div>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${data.cartUrl}" class="button">
        Usar mi Descuento
      </a>
    </div>
    
    <p style="text-align: center; color: #dc3545; font-weight: bold;">
      ⏰ ¡Oferta por tiempo limitado!
    </p>
  `;

  return baseTemplate(content, `${data.discount}% de descuento en tus cursos`);
};
