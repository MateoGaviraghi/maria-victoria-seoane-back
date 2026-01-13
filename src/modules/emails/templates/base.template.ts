/**
 * Base template para todos los emails
 * Proporciona estructura HTML consistente
 */
export const baseTemplate = (content: string, preheader?: string) => `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  ${preheader ? `<meta name="description" content="${preheader}">` : ''}
  <title>María Victoria Seoane</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.6;
      color: #333333;
      background-color: #f4f4f4;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 40px 20px;
      text-align: center;
    }
    .logo {
      color: #ffffff;
      font-size: 28px;
      font-weight: bold;
      text-decoration: none;
    }
    .content {
      padding: 40px 30px;
    }
    .button {
      display: inline-block;
      padding: 14px 40px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: #ffffff !important;
      text-decoration: none;
      border-radius: 50px;
      font-weight: bold;
      margin: 20px 0;
      transition: transform 0.2s;
    }
    .button:hover {
      transform: translateY(-2px);
    }
    .footer {
      background-color: #f8f9fa;
      padding: 30px;
      text-align: center;
      font-size: 14px;
      color: #6c757d;
      border-top: 1px solid #e9ecef;
    }
    .footer a {
      color: #667eea;
      text-decoration: none;
    }
    .divider {
      height: 1px;
      background-color: #e9ecef;
      margin: 30px 0;
    }
    h1 {
      color: #2d3748;
      margin-bottom: 20px;
      font-size: 24px;
    }
    p {
      margin-bottom: 15px;
      color: #4a5568;
    }
    .highlight {
      background-color: #fef5e7;
      border-left: 4px solid #f39c12;
      padding: 15px;
      margin: 20px 0;
    }
    .social-links {
      margin-top: 20px;
    }
    .social-links a {
      display: inline-block;
      margin: 0 10px;
      color: #667eea;
      font-size: 14px;
    }
    @media only screen and (max-width: 600px) {
      .content {
        padding: 20px 15px;
      }
      .button {
        display: block;
        text-align: center;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <a href="{{frontendUrl}}" class="logo">María Victoria Seoane</a>
    </div>
    
    <div class="content">
      ${content}
    </div>
    
    <div class="footer">
      <p>© ${new Date().getFullYear()} María Victoria Seoane. Todos los derechos reservados.</p>
      <p>Recibiste este email porque te registraste en nuestra plataforma.</p>
      <div class="social-links">
        <a href="{{instagramUrl}}">Instagram</a> | 
        <a href="{{whatsappUrl}}">WhatsApp</a> | 
        <a href="{{frontendUrl}}/contact">Contacto</a>
      </div>
      <p style="margin-top: 15px; font-size: 12px;">
        <a href="{{frontendUrl}}/unsubscribe/{{userId}}">Cancelar suscripción</a>
      </p>
    </div>
  </div>
</body>
</html>
`;
