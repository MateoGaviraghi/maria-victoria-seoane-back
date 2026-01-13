import { baseTemplate } from './base.template';

export const newCouponTemplate = (data: {
  firstName: string;
  couponCode: string;
  discount: number;
  isPercentage: boolean;
  expiresAt: Date;
  coursesUrl: string;
}) => {
  const discountText = data.isPercentage
    ? `${data.discount}% de descuento`
    : `$${data.discount.toLocaleString('es-AR')} de descuento`;

  const content = `
    <h1>🎉 ¡Regalo para ti!</h1>
    
    <p>Hola ${data.firstName},</p>
    
    <p>¡Tenemos excelentes noticias! Hemos creado un cupón especial para ti:</p>
    
    <div class="highlight">
      <p style="font-size: 24px; font-weight: bold; color: #667eea; text-align: center; margin: 0;">
        ${discountText}
      </p>
      <p style="text-align: center; margin-top: 15px;">
        Cupón: <strong style="font-size: 32px; color: #f39c12;">${data.couponCode}</strong>
      </p>
      <p style="text-align: center; font-size: 14px; margin-top: 15px; color: #6c757d;">
        Válido hasta ${new Date(data.expiresAt).toLocaleDateString('es-AR', { year: 'numeric', month: 'long', day: 'numeric' })}
      </p>
    </div>
    
    <p style="margin-top: 30px;">Úsalo en cualquiera de nuestros cursos disponibles.</p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${data.coursesUrl}" class="button">
        Ver Cursos y Usar Cupón
      </a>
    </div>
    
    <p style="text-align: center; color: #6c757d;">
      El cupón se aplicará automáticamente al agregarlo en tu carrito.
    </p>
  `;

  return baseTemplate(content, `${discountText} - Cupón exclusivo`);
};
