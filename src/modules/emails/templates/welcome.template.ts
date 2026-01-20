import { baseTemplate } from './base.template';

export const welcomeTemplate = (data: {
  firstName: string;
  coursesUrl: string;
}) => {
  const content = `
    <h1>¡Hola ${data.firstName}! 👋</h1>
    
    <p>¡Tu cuenta ha sido verificada exitosamente!</p>
    
    <p>Estamos muy felices de tenerte con nosotros. Ahora puedes explorar todos nuestros cursos y comenzar tu viaje de aprendizaje.</p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${data.coursesUrl}" class="button">
        Explorar Cursos
      </a>
    </div>
    
    <div class="highlight">
      <p><strong>¿Qué puedes hacer ahora?</strong></p>
      <ul style="margin-left: 20px; margin-top: 10px;">
        <li>Navegar por nuestro catálogo de cursos</li>
        <li>Agregar cursos a tu carrito</li>
        <li>Aplicar cupones de descuento</li>
        <li>Completar tu compra de forma segura</li>
      </ul>
    </div>
    
    <p>Si tienes alguna pregunta o necesitas ayuda, estamos aquí para ti.</p>
    
    <p>¡Que disfrutes tu aprendizaje!</p>
    
    <p style="margin-top: 30px;">
      <strong>María Victoria Seoane</strong>
    </p>
  `;

  return baseTemplate(content, '¡Bienvenido a nuestra plataforma!');
};
