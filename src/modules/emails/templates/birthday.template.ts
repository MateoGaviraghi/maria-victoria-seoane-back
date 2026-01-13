import { baseTemplate } from './base.template';

export const birthdayTemplate = (data: {
  firstName: string;
  couponCode: string;
  discount: number;
  coursesUrl: string;
}) => {
  const content = `
    <h1>🎂 ¡Feliz Cumpleaños ${data.firstName}!</h1>
    
    <div style="text-align: center; font-size: 60px; margin: 20px 0;">
      🎉🎁🎈
    </div>
    
    <p>¡Hoy es tu día especial y queremos celebrarlo contigo!</p>
    
    <p>Como regalo de cumpleaños, te damos un cupón exclusivo:</p>
    
    <div class="highlight">
      <p style="font-size: 28px; font-weight: bold; color: #667eea; text-align: center; margin: 0;">
        ${data.discount}% DE DESCUENTO
      </p>
      <p style="text-align: center; margin-top: 15px;">
        Cupón: <strong style="font-size: 32px; color: #f39c12;">${data.couponCode}</strong>
      </p>
      <p style="text-align: center; font-size: 14px; margin-top: 15px; color: #6c757d;">
        Válido por 7 días
      </p>
    </div>
    
    <p style="margin-top: 30px;">¡Es el momento perfecto para aprender algo nuevo!</p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${data.coursesUrl}" class="button">
        🎁 Usar mi Regalo
      </a>
    </div>
    
    <p>Que tengas un cumpleaños maravilloso lleno de alegría y aprendizaje.</p>
    
    <p style="margin-top: 30px;">
      Con cariño,<br>
      <strong>María Victoria Seoane</strong>
    </p>
  `;

  return baseTemplate(content, '¡Feliz cumpleaños! Regalo especial para ti');
};
