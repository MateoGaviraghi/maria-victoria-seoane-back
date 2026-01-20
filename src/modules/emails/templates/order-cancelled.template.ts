import { baseTemplate } from './base.template';

export const orderCancelledTemplate = (data: {
  firstName: string;
  orderId: string;
  reason?: string;
}) => {
  const content = `
    <h1>Orden Cancelada</h1>
    
    <p>Hola ${data.firstName},</p>
    
    <p>Tu orden <strong>#${data.orderId}</strong> ha sido cancelada.</p>
    
    ${
      data.reason
        ? `
    <div class="highlight">
      <p><strong>Motivo:</strong></p>
      <p>${data.reason}</p>
    </div>
    `
        : ''
    }
    
    <p>Si esto no fue intencional o si tienes alguna pregunta, por favor contáctanos.</p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="{{frontendUrl}}/courses" class="button">
        Ver Cursos Disponibles
      </a>
    </div>
    
    <p>Estamos aquí para ayudarte en lo que necesites.</p>
    
    <p style="margin-top: 30px;">
      <strong>María Victoria Seoane</strong>
    </p>
  `;

  return baseTemplate(content, 'Tu orden ha sido cancelada');
};
