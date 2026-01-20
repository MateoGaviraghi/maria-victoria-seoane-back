import { baseTemplate } from './base.template';

export const verificationTemplate = (data: {
  firstName: string;
  verificationUrl: string;
}) => {
  const content = `
    <h1>¡Bienvenido/a ${data.firstName}! 🎉</h1>
    
    <p>Gracias por registrarte en nuestra plataforma de cursos.</p>
    
    <p>Para completar tu registro y activar tu cuenta, por favor verifica tu dirección de email haciendo click en el botón de abajo:</p>
    
    <div style="text-align: center;">
      <a href="${data.verificationUrl}" class="button">
        Verificar mi email
      </a>
    </div>
    
    <p style="margin-top: 30px;">Este enlace expirará en <strong>24 horas</strong>.</p>
    
    <div class="highlight">
      <p><strong>¿No te registraste?</strong></p>
      <p>Si no creaste esta cuenta, simplemente ignora este email.</p>
    </div>
    
    <p>Si tienes alguna pregunta, no dudes en contactarnos.</p>
    
    <p>¡Gracias!</p>
  `;

  return baseTemplate(content, 'Verifica tu email para activar tu cuenta');
};
