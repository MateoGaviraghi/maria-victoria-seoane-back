import { baseTemplate } from './base.template';

export const passwordResetTemplate = (data: {
  firstName: string;
  resetUrl: string;
}) => {
  const content = `
    <h1>Recuperar Contraseña 🔐</h1>
    
    <p>Hola ${data.firstName},</p>
    
    <p>Recibimos una solicitud para restablecer la contraseña de tu cuenta.</p>
    
    <p>Haz click en el botón de abajo para crear una nueva contraseña:</p>
    
    <div style="text-align: center;">
      <a href="${data.resetUrl}" class="button">
        Restablecer Contraseña
      </a>
    </div>
    
    <p style="margin-top: 30px;">Este enlace expirará en <strong>1 hora</strong> por razones de seguridad.</p>
    
    <div class="highlight">
      <p><strong>¿No solicitaste esto?</strong></p>
      <p>Si no solicitaste restablecer tu contraseña, ignora este email. Tu cuenta está segura.</p>
    </div>
    
    <p>Si tienes problemas con el botón, copia y pega este enlace en tu navegador:</p>
    <p style="word-break: break-all; color: #667eea;">${data.resetUrl}</p>
  `;

  return baseTemplate(content, 'Restablece tu contraseña');
};
