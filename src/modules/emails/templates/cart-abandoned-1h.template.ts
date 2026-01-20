import { baseTemplate } from './base.template';

export const cartAbandoned1hTemplate = (data: {
  firstName: string;
  cartItems: Array<{ title: string; price: number }>;
  cartUrl: string;
  total: number;
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

  const content = `
    <h1>¿Olvidaste algo? 🛒</h1>
    
    <p>Hola ${data.firstName},</p>
    
    <p>Notamos que dejaste algunos cursos en tu carrito:</p>
    
    <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <ul style="list-style: none; padding: 0;">
        ${itemsHtml}
      </ul>
      <div style="border-top: 2px solid #dee2e6; margin-top: 15px; padding-top: 15px;">
        <p style="font-size: 18px; font-weight: bold; text-align: right;">
          Total: $${data.total.toLocaleString('es-AR')}
        </p>
      </div>
    </div>
    
    <p>¡No pierdas esta oportunidad de comenzar tu aprendizaje!</p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${data.cartUrl}" class="button">
        Completar mi Compra
      </a>
    </div>
    
    <p>Si tienes alguna pregunta sobre los cursos, estamos aquí para ayudarte.</p>
  `;

  return baseTemplate(content, 'Tienes cursos esperando en tu carrito');
};
