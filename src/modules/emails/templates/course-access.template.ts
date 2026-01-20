import { baseTemplate } from './base.template';

export const courseAccessTemplate = (data: {
  firstName: string;
  courses: Array<{
    title: string;
    accessUrl: string;
    username?: string;
    password?: string;
  }>;
}) => {
  const coursesHtml = data.courses
    .map(
      (course) => `
    <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
      <h3 style="color: #667eea; margin-bottom: 10px;">${course.title}</h3>
      
      ${
        course.username && course.password
          ? `
      <div style="background-color: #ffffff; padding: 15px; border-radius: 4px; margin: 15px 0;">
        <p style="margin: 5px 0;"><strong>Usuario:</strong> ${course.username}</p>
        <p style="margin: 5px 0;"><strong>Contraseña:</strong> ${course.password}</p>
      </div>
      `
          : ''
      }
      
      <div style="text-align: center; margin-top: 15px;">
        <a href="${course.accessUrl}" class="button">
          Acceder al Curso
        </a>
      </div>
    </div>
  `,
    )
    .join('');

  const content = `
    <h1>¡Tu curso está listo! 🎓</h1>
    
    <p>Hola ${data.firstName},</p>
    
    <p>¡Felicitaciones! Ya puedes acceder a tu(s) curso(s).</p>
    
    <p>A continuación encontrarás los detalles de acceso:</p>
    
    ${coursesHtml}
    
    <div class="highlight">
      <p><strong>Importante:</strong></p>
      <ul style="margin-left: 20px; margin-top: 10px;">
        <li>Guarda estas credenciales en un lugar seguro</li>
        <li>Puedes cambiar tu contraseña una vez que ingreses</li>
        <li>El acceso al curso es de por vida</li>
      </ul>
    </div>
    
    <p>Si tienes alguna dificultad para acceder o alguna pregunta sobre el curso, no dudes en contactarnos.</p>
    
    <p>¡Disfruta tu aprendizaje!</p>
    
    <p style="margin-top: 30px;">
      <strong>María Victoria Seoane</strong>
    </p>
  `;

  return baseTemplate(content, 'Accede a tus cursos ahora');
};
